import os

from dotenv import load_dotenv

load_dotenv()

import anthropic
import openai
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# Validate API keys at startup
if not os.getenv("OPENAI_API_KEY"):
    raise RuntimeError("OPENAI_API_KEY not set — copy .env.example to .env and add your key")
if not os.getenv("ANTHROPIC_API_KEY"):
    raise RuntimeError("ANTHROPIC_API_KEY not set — copy .env.example to .env and add your key")

openai_client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])
anthropic_client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

SYSTEM_PROMPT = """You are a note-taking assistant. You receive raw speech transcripts \
and transform them into clean, organized markdown notes.

Rules:
- Begin with a one-sentence **Summary** section (use ## Summary)
- Use ## for main sections, ### for sub-sections
- Use bullet points (- ) for lists and action items
- Group related ideas even if they were spoken out of order
- Preserve specific details: names, numbers, dates
- Do not invent content not present in the transcript
- If the transcript is very short (one sentence), return it as a single bullet under ## Notes
- Output only the markdown — no preamble like "Here are your notes:"\
"""

USER_PROMPT = """Organize the following voice transcript into structured notes:

<transcript>
{transcript}
</transcript>"""

MAX_BYTES = 25 * 1024 * 1024  # 25 MB — Whisper API hard limit


def organize_with_claude(transcript: str) -> str:
    message = anthropic_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": USER_PROMPT.format(transcript=transcript)}],
    )
    return message.content[0].text


@app.get("/")
async def root():
    return FileResponse("static/index.html")


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="No audio data received")

    if len(audio_bytes) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Audio exceeds 25 MB limit")

    # Determine file extension from content type for Whisper routing
    content_type = audio.content_type or "audio/webm"
    if "ogg" in content_type:
        ext = "ogg"
    elif "mp4" in content_type or "m4a" in content_type:
        ext = "mp4"
    else:
        ext = "webm"

    # Transcribe with Whisper
    try:
        whisper_response = openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=(f"recording.{ext}", audio_bytes, content_type),
        )
        transcript = whisper_response.text.strip()
    except openai.APIError as e:
        return JSONResponse({"transcript": None, "notes": None, "error": f"Transcription failed: {e}"})

    # Guard: empty or non-speech result
    if not transcript or transcript.startswith("("):
        return JSONResponse({"transcript": "", "notes": "", "error": "no_speech"})

    # Organize with Claude
    try:
        notes = organize_with_claude(transcript)
    except anthropic.APIError as e:
        # Return raw transcript even if organization fails
        return JSONResponse(
            {"transcript": transcript, "notes": transcript, "error": f"Organization failed: {e}"}
        )

    return JSONResponse({"transcript": transcript, "notes": notes, "error": None})
