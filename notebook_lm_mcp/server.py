import asyncio
import os

import anthropic
import mcp.types as types
from mcp.server import Server
from mcp.server.stdio import stdio_server

from . import storage

server = Server("notebook-lm-mcp")
_anthropic = None


def _client() -> anthropic.Anthropic:
    global _anthropic
    if _anthropic is None:
        _anthropic = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    return _anthropic


def _ai(system: str, prompt: str) -> str:
    msg = _client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text


@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="create_notebook",
            description="Create a new notebook for collecting and analyzing sources.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Notebook name"},
                    "description": {"type": "string", "description": "Optional description"},
                },
                "required": ["name"],
            },
        ),
        types.Tool(
            name="list_notebooks",
            description="List all available notebooks.",
            inputSchema={"type": "object", "properties": {}},
        ),
        types.Tool(
            name="delete_notebook",
            description="Delete a notebook and all its sources.",
            inputSchema={
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string", "description": "Notebook ID to delete"},
                },
                "required": ["notebook_id"],
            },
        ),
        types.Tool(
            name="add_source",
            description="Add a text source to a notebook.",
            inputSchema={
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string", "description": "Target notebook ID"},
                    "title": {"type": "string", "description": "Source title"},
                    "content": {"type": "string", "description": "Source text content"},
                },
                "required": ["notebook_id", "title", "content"],
            },
        ),
        types.Tool(
            name="list_sources",
            description="List all sources in a notebook.",
            inputSchema={
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string", "description": "Notebook ID"},
                },
                "required": ["notebook_id"],
            },
        ),
        types.Tool(
            name="delete_source",
            description="Remove a source from a notebook.",
            inputSchema={
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string", "description": "Notebook ID"},
                    "source_id": {"type": "string", "description": "Source ID to remove"},
                },
                "required": ["notebook_id", "source_id"],
            },
        ),
        types.Tool(
            name="ask_question",
            description="Ask a question about the sources in a notebook using AI.",
            inputSchema={
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string", "description": "Notebook ID to query"},
                    "question": {"type": "string", "description": "Question to answer"},
                },
                "required": ["notebook_id", "question"],
            },
        ),
        types.Tool(
            name="generate_summary",
            description="Generate a concise summary of all sources in a notebook.",
            inputSchema={
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string", "description": "Notebook ID to summarize"},
                },
                "required": ["notebook_id"],
            },
        ),
        types.Tool(
            name="generate_study_guide",
            description="Generate a structured study guide from all sources in a notebook.",
            inputSchema={
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string", "description": "Notebook ID"},
                },
                "required": ["notebook_id"],
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    def text(s: str) -> list[types.TextContent]:
        return [types.TextContent(type="text", text=s)]

    if name == "create_notebook":
        nb = storage.create_notebook(
            name=arguments["name"],
            description=arguments.get("description", ""),
        )
        return text(f"Created notebook '{nb['name']}' with ID: {nb['id']}")

    if name == "list_notebooks":
        notebooks = storage.list_notebooks()
        if not notebooks:
            return text("No notebooks found.")
        lines = ["**Notebooks:**"]
        for nb in notebooks:
            lines.append(f"- **{nb['name']}** (ID: `{nb['id']}`) — {nb['source_count']} source(s)")
            if nb.get("description"):
                lines.append(f"  {nb['description']}")
        return text("\n".join(lines))

    if name == "delete_notebook":
        ok = storage.delete_notebook(arguments["notebook_id"])
        if not ok:
            return text(f"Notebook `{arguments['notebook_id']}` not found.")
        return text(f"Deleted notebook `{arguments['notebook_id']}`.")

    if name == "add_source":
        src = storage.add_source(
            nb_id=arguments["notebook_id"],
            title=arguments["title"],
            content=arguments["content"],
        )
        if src is None:
            return text(f"Notebook `{arguments['notebook_id']}` not found.")
        return text(f"Added source '{src['title']}' (ID: `{src['id']}`) to notebook.")

    if name == "list_sources":
        sources = storage.list_sources(arguments["notebook_id"])
        if sources is None:
            return text(f"Notebook `{arguments['notebook_id']}` not found.")
        if not sources:
            return text("No sources in this notebook.")
        lines = ["**Sources:**"]
        for s in sources:
            lines.append(f"- **{s['title']}** (ID: `{s['id']}`)")
            lines.append(f"  Preview: {s['content_preview']}")
        return text("\n".join(lines))

    if name == "delete_source":
        ok = storage.delete_source(arguments["notebook_id"], arguments["source_id"])
        if not ok:
            return text("Notebook or source not found.")
        return text(f"Deleted source `{arguments['source_id']}`.")

    if name == "ask_question":
        content = storage.get_all_source_content(arguments["notebook_id"])
        if content is None:
            return text(f"Notebook `{arguments['notebook_id']}` not found.")
        if not content:
            return text("No sources in this notebook to query.")
        answer = await asyncio.to_thread(
            _ai,
            "You are a helpful research assistant. Answer questions based only on the provided sources. "
            "Cite relevant sections when possible. If the answer cannot be found in the sources, say so.",
            f"Sources:\n{content}\n\nQuestion: {arguments['question']}",
        )
        return text(answer)

    if name == "generate_summary":
        content = storage.get_all_source_content(arguments["notebook_id"])
        if content is None:
            return text(f"Notebook `{arguments['notebook_id']}` not found.")
        if not content:
            return text("No sources in this notebook to summarize.")
        summary = await asyncio.to_thread(
            _ai,
            "You are a research assistant. Produce a clear, well-structured summary of the provided sources. "
            "Highlight key themes, findings, and insights.",
            f"Sources:\n{content}\n\nGenerate a comprehensive summary.",
        )
        return text(summary)

    if name == "generate_study_guide":
        content = storage.get_all_source_content(arguments["notebook_id"])
        if content is None:
            return text(f"Notebook `{arguments['notebook_id']}` not found.")
        if not content:
            return text("No sources in this notebook.")
        guide = await asyncio.to_thread(
            _ai,
            "You are an expert educator. Create a detailed study guide from the provided sources. "
            "Include: key concepts, definitions, main points per section, review questions, and a quick-reference summary.",
            f"Sources:\n{content}\n\nGenerate a comprehensive study guide.",
        )
        return text(guide)

    return text(f"Unknown tool: {name}")


async def main() -> None:
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
