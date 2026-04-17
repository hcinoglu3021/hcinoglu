import json
import os
import uuid
from datetime import datetime
from typing import Any

STORAGE_PATH = os.environ.get("NOTEBOOK_LM_STORAGE", os.path.expanduser("~/.notebook_lm_mcp.json"))


def _load() -> dict[str, Any]:
    if not os.path.exists(STORAGE_PATH):
        return {"notebooks": {}}
    with open(STORAGE_PATH) as f:
        return json.load(f)


def _save(data: dict[str, Any]) -> None:
    with open(STORAGE_PATH, "w") as f:
        json.dump(data, f, indent=2)


def create_notebook(name: str, description: str = "") -> dict:
    data = _load()
    nb_id = str(uuid.uuid4())
    notebook = {
        "id": nb_id,
        "name": name,
        "description": description,
        "sources": {},
        "created_at": datetime.utcnow().isoformat(),
    }
    data["notebooks"][nb_id] = notebook
    _save(data)
    return notebook


def list_notebooks() -> list[dict]:
    data = _load()
    return [
        {k: v for k, v in nb.items() if k != "sources"}
        | {"source_count": len(nb["sources"])}
        for nb in data["notebooks"].values()
    ]


def get_notebook(nb_id: str) -> dict | None:
    return _load()["notebooks"].get(nb_id)


def delete_notebook(nb_id: str) -> bool:
    data = _load()
    if nb_id not in data["notebooks"]:
        return False
    del data["notebooks"][nb_id]
    _save(data)
    return True


def add_source(nb_id: str, title: str, content: str) -> dict | None:
    data = _load()
    if nb_id not in data["notebooks"]:
        return None
    src_id = str(uuid.uuid4())
    source = {
        "id": src_id,
        "title": title,
        "content": content,
        "added_at": datetime.utcnow().isoformat(),
    }
    data["notebooks"][nb_id]["sources"][src_id] = source
    _save(data)
    return source


def list_sources(nb_id: str) -> list[dict] | None:
    data = _load()
    if nb_id not in data["notebooks"]:
        return None
    return [
        {k: v for k, v in s.items() if k != "content"}
        | {"content_preview": s["content"][:200] + ("..." if len(s["content"]) > 200 else "")}
        for s in data["notebooks"][nb_id]["sources"].values()
    ]


def delete_source(nb_id: str, src_id: str) -> bool:
    data = _load()
    if nb_id not in data["notebooks"]:
        return False
    if src_id not in data["notebooks"][nb_id]["sources"]:
        return False
    del data["notebooks"][nb_id]["sources"][src_id]
    _save(data)
    return True


def get_all_source_content(nb_id: str) -> str | None:
    data = _load()
    if nb_id not in data["notebooks"]:
        return None
    sources = data["notebooks"][nb_id]["sources"]
    if not sources:
        return ""
    parts = []
    for s in sources.values():
        parts.append(f"### {s['title']}\n{s['content']}")
    return "\n\n".join(parts)
