import hashlib
import json
import os
import re
import struct
import sys
from dataclasses import dataclass

import numpy as np
import yaml
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../.."))
MODEL = "all-MiniLM-L6-v2"
MANIFEST_SCHEMA = 1
DEFAULT_DIMS = 384

COLLECTIONS = {
    "blog": {
        "posts_dir": os.path.join(SCRIPT_DIR, "../../src/_posts/"),
        "output_dir_cli": os.path.join(SCRIPT_DIR, "output"),
        "output_web": os.path.join(SCRIPT_DIR, "../../public/output"),
    },
    "philosophy": {
        "posts_dir": os.path.join(SCRIPT_DIR, "../../src/_philosophy/"),
        "output_dir_cli": os.path.join(SCRIPT_DIR, "output-philosophy"),
        "output_web": os.path.join(SCRIPT_DIR, "../../public/philosophy-output"),
    },
}


@dataclass
class Document:
    rel_path: str
    abs_path: str
    filename: str
    title: str
    content_hash: str
    text: str


def strip_frontmatter_and_syntax(content: str) -> str:
    """Remove YAML frontmatter, markdown syntax, and code blocks to keep only prose."""
    body = re.sub(r"^---\n.*?\n---\n", "", content, count=1, flags=re.DOTALL)
    body = re.sub(r"```[\s\S]*?```", "", body)
    body = re.sub(r"`[^`]+`", "", body)
    body = re.sub(r"!\[.*?\]\(.*?\)", "", body)
    body = re.sub(r"\[([^\]]+)\]\(.*?\)", r"\1", body)
    body = re.sub(r"^#{1,6}\s+", "", body, flags=re.MULTILINE)
    body = re.sub(r"^(import|export)\s+.*$", "", body, flags=re.MULTILINE)
    body = re.sub(r"\n{3,}", "\n\n", body)
    return body.strip()


def parse_title(content: str) -> str:
    """Extract title from YAML frontmatter."""
    match = re.match(r"^---\n(.*?\n)---\n", content, flags=re.DOTALL)
    if match:
        frontmatter = yaml.safe_load(match.group(1))
        if isinstance(frontmatter, dict) and "title" in frontmatter:
            return str(frontmatter["title"])
    return "Untitled"


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def rel_path(abs_path: str) -> str:
    return os.path.relpath(abs_path, REPO_ROOT).replace("\\", "/")


def scan_documents(posts_dir: str) -> list[Document]:
    documents: list[Document] = []
    if not os.path.isdir(posts_dir):
        return documents

    for root, _, filenames in os.walk(posts_dir):
        for filename in filenames:
            if not filename.endswith((".md", ".mdx")):
                continue
            abs_path = os.path.join(root, filename)
            with open(abs_path, "r", encoding="utf-8") as file:
                content = file.read()
            text = strip_frontmatter_and_syntax(content)
            documents.append(
                Document(
                    rel_path=rel_path(abs_path),
                    abs_path=abs_path,
                    filename=filename,
                    title=parse_title(content),
                    content_hash=content_hash(text),
                    text=text,
                )
            )

    documents.sort(key=lambda doc: doc.rel_path)
    return documents


def load_manifest(path: str) -> dict | None:
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as file:
        manifest = json.load(file)
    if manifest.get("schema") != MANIFEST_SCHEMA or manifest.get("model") != MODEL:
        return None
    return manifest


def previous_embedding_rows(
    output_dir_cli: str,
    manifest: dict | None,
) -> dict[str, np.ndarray]:
    if manifest is None:
        return {}

    index_path = os.path.join(output_dir_cli, "index.json")
    emb_path = os.path.join(output_dir_cli, "embeddings.npy")
    if not os.path.exists(index_path) or not os.path.exists(emb_path):
        return {}

    with open(index_path, "r", encoding="utf-8") as file:
        index = json.load(file)
    embeddings = np.load(emb_path)
    if len(index) != embeddings.shape[0]:
        return {}

    rows: dict[str, np.ndarray] = {}
    for row_index, entry in enumerate(index):
        entry_rel = entry.get("rel_path") or rel_path(entry["path"])
        manifest_entry = manifest.get("entries", {}).get(entry_rel)
        if manifest_entry is None:
            continue
        rows[entry_rel] = embeddings[row_index]
    return rows


def write_embeddings_bin(path: str, embedding_matrix: np.ndarray) -> None:
    matrix = np.asarray(embedding_matrix, dtype=np.float32)
    if matrix.size == 0:
        num_docs, dims = 0, DEFAULT_DIMS
        payload = b""
    else:
        num_docs, dims = matrix.shape
        payload = matrix.astype(np.float32).tobytes()
    with open(path, "wb") as file:
        file.write(struct.pack("<II", num_docs, dims))
        file.write(payload)


def save_outputs(
    index: list[dict],
    embedding_matrix: np.ndarray,
    manifest: dict,
    output_dir_cli: str,
    output_web: str,
) -> None:
    for output_dir, is_cli in [(output_dir_cli, True), (output_web, False)]:
        os.makedirs(output_dir, exist_ok=True)
        with open(os.path.join(output_dir, "index.json"), "w", encoding="utf-8") as file:
            json.dump(index, file)
        if is_cli:
            with open(os.path.join(output_dir, "embeddings.npy"), "wb") as file:
                np.save(file, embedding_matrix)
            with open(os.path.join(output_dir, "manifest.json"), "w", encoding="utf-8") as file:
                json.dump(manifest, file, indent=2)
                file.write("\n")
        else:
            write_embeddings_bin(os.path.join(output_dir, "embeddings.bin"), embedding_matrix)


def documents_requiring_encoding(
    documents: list[Document],
    output_dir_cli: str,
) -> list[Document]:
    previous_manifest = load_manifest(os.path.join(output_dir_cli, "manifest.json"))
    previous_rows = previous_embedding_rows(output_dir_cli, previous_manifest)
    pending: list[Document] = []
    for doc in documents:
        previous_entry = (
            previous_manifest.get("entries", {}).get(doc.rel_path)
            if previous_manifest is not None
            else None
        )
        if (
            previous_entry is not None
            and previous_entry.get("content_hash") == doc.content_hash
            and doc.rel_path in previous_rows
        ):
            continue
        pending.append(doc)
    return pending


def generate_index_for_collection(
    collection_name: str,
    model: SentenceTransformer | None,
    documents: list[Document] | None = None,
) -> None:
    cfg = COLLECTIONS[collection_name]
    posts_dir = cfg["posts_dir"]
    output_dir_cli = cfg["output_dir_cli"]
    output_web = cfg["output_web"]
    dims = model.get_sentence_embedding_dimension() if model is not None else DEFAULT_DIMS

    print(f"[{collection_name}] posts directory: {os.path.abspath(posts_dir)}")
    if documents is None:
        documents = scan_documents(posts_dir)
    if len(documents) == 0:
        print(f"[{collection_name}] no .md/.mdx files found; writing empty index.")
        empty = np.zeros((0, dims), dtype=np.float64)
        manifest = {"schema": MANIFEST_SCHEMA, "model": MODEL, "entries": {}}
        save_outputs([], empty, manifest, output_dir_cli, output_web)
        print(f"[{collection_name}] index generated with 0 files (0 encoded).")
        return

    previous_manifest = load_manifest(os.path.join(output_dir_cli, "manifest.json"))
    previous_rows = previous_embedding_rows(output_dir_cli, previous_manifest)

    index: list[dict] = []
    vectors: list[np.ndarray] = []
    to_encode_docs: list[Document] = []
    to_encode_indices: list[int] = []
    reused = 0

    for doc in documents:
        index.append(
            {
                "path": doc.abs_path,
                "rel_path": doc.rel_path,
                "filename": doc.filename,
                "title": doc.title,
            }
        )
        row_index = len(vectors)
        previous_entry = (
            previous_manifest.get("entries", {}).get(doc.rel_path)
            if previous_manifest is not None
            else None
        )
        if (
            previous_entry is not None
            and previous_entry.get("content_hash") == doc.content_hash
            and doc.rel_path in previous_rows
        ):
            vectors.append(previous_rows[doc.rel_path])
            reused += 1
        else:
            vectors.append(np.zeros(dims, dtype=np.float64))
            to_encode_docs.append(doc)
            to_encode_indices.append(row_index)

    encoded = 0
    if to_encode_docs:
        if model is None:
            raise RuntimeError("model is required when documents need encoding")
        encoded_vectors = model.encode(
            [doc.text for doc in to_encode_docs],
            convert_to_tensor=True,
        )
        encoded_matrix = np.array(encoded_vectors.cpu().numpy())
        for row_index, vector in zip(to_encode_indices, encoded_matrix, strict=True):
            vectors[row_index] = vector
        encoded = len(to_encode_docs)

    embedding_matrix = np.stack(vectors, axis=0) if vectors else np.zeros((0, dims), dtype=np.float64)
    manifest = {
        "schema": MANIFEST_SCHEMA,
        "model": MODEL,
        "entries": {
            doc.rel_path: {
                "content_hash": doc.content_hash,
                "title": doc.title,
                "filename": doc.filename,
            }
            for doc in documents
        },
    }
    save_outputs(index, embedding_matrix, manifest, output_dir_cli, output_web)
    print(
        f"[{collection_name}] index generated on {len(index)} files "
        f"({reused} reused, {encoded} encoded)."
    )


def generate_indexes() -> None:
    pending: list[tuple[str, list[Document]]] = []
    for name in ("blog", "philosophy"):
        cfg = COLLECTIONS[name]
        documents = scan_documents(cfg["posts_dir"])
        pending.append((name, documents))

    needs_model = any(
        documents_requiring_encoding(documents, COLLECTIONS[name]["output_dir_cli"])
        for name, documents in pending
    )
    model = SentenceTransformer(MODEL) if needs_model else None
    for name, documents in pending:
        generate_index_for_collection(name, model, documents)


def search_collection(collection_name: str, query: str) -> None:
    cfg = COLLECTIONS[collection_name]
    cli_dir = cfg["output_dir_cli"]
    index_path = os.path.join(cli_dir, "index.json")
    if not os.path.exists(index_path):
        print(f"[{collection_name}] index not found. Run generate first.")
        return

    with open(index_path, "r", encoding="utf-8") as file:
        index = json.load(file)

    emb_path = os.path.join(cli_dir, "embeddings.npy")
    if not os.path.exists(emb_path):
        print(f"[{collection_name}] embeddings missing. Run generate first.")
        return

    embeddings = np.load(emb_path)

    if len(index) == 0 or embeddings.size == 0:
        print("No indexed documents.")
        return

    model = SentenceTransformer(MODEL)
    query_embedding = model.encode(query, convert_to_tensor=True).cpu().numpy()

    similarities = cosine_similarity([query_embedding], embeddings)[0]

    if len(similarities) == 0:
        print("No results found.")
        return

    top_indices = np.argsort(similarities)[::-1][:10]

    print(f"Search results ({collection_name}):")
    for i in top_indices:
        print(f'{index[i]["title"]} ({index[i]["filename"]}): {similarities[i]:.4f}')


def print_usage() -> None:
    print("Usage:")
    print("  python main.py generate")
    print("  python main.py search [<query>]   # semantic search technical blog index")
    print("  python main.py search philosophy <query>")
    print("")
    print("Local benchmarks:")
    print("  cd tools && time uv run python search/main.py generate   # full or incremental")
    print("  time uv run python search/main.py generate                 # no-op should be fast")
    print("  uv run python search/main.py search \"rust async\"")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)

    command = sys.argv[1]

    if command == "generate":
        generate_indexes()
    elif command == "search":
        if len(sys.argv) < 3:
            print("Usage: python main.py search [<query>] or search philosophy <query>")
            sys.exit(1)
        rest = sys.argv[2:]
        if rest and rest[0] == "philosophy":
            if len(rest) < 2:
                print("Usage: python main.py search philosophy <query>")
                sys.exit(1)
            query = " ".join(rest[1:])
            search_collection("philosophy", query)
        else:
            query = " ".join(rest)
            search_collection("blog", query)
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
