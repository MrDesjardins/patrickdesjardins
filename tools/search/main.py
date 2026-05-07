import os
import re
import sys
import json
import yaml
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL = "all-MiniLM-L6-v2"

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


def strip_frontmatter_and_syntax(content):
    """Remove YAML frontmatter, markdown syntax, and code blocks to keep only prose."""
    # Remove YAML frontmatter
    body = re.sub(r'^---\n.*?\n---\n', '', content, count=1, flags=re.DOTALL)
    # Remove fenced code blocks
    body = re.sub(r'```[\s\S]*?```', '', body)
    # Remove inline code
    body = re.sub(r'`[^`]+`', '', body)
    # Remove images
    body = re.sub(r'!\[.*?\]\(.*?\)', '', body)
    # Remove links but keep text
    body = re.sub(r'\[([^\]]+)\]\(.*?\)', r'\1', body)
    # Remove heading markers
    body = re.sub(r'^#{1,6}\s+', '', body, flags=re.MULTILINE)
    # Remove import/export statements
    body = re.sub(r'^(import|export)\s+.*$', '', body, flags=re.MULTILINE)
    # Collapse multiple blank lines
    body = re.sub(r'\n{3,}', '\n\n', body)
    return body.strip()


def parse_title(content):
    """Extract title from YAML frontmatter."""
    match = re.match(r'^---\n(.*?\n)---\n', content, flags=re.DOTALL)
    if match:
        frontmatter = yaml.safe_load(match.group(1))
        if isinstance(frontmatter, dict) and "title" in frontmatter:
            return frontmatter["title"]
    return "Untitled"


def save_outputs(index, embedding_matrix, output_dir_cli, output_web):
    """Write index and embeddings to CLI (NumPy) and website (JSON)."""
    for output_dir, embed_format in [(output_dir_cli, "npy"), (output_web, "json")]:
        os.makedirs(output_dir, exist_ok=True)
        with open(os.path.join(output_dir, 'index.json'), 'w', encoding='utf-8') as f:
            json.dump(index, f)
        if embed_format == "npy":
            with open(os.path.join(output_dir, 'embeddings.npy'), 'wb') as f:
                np.save(f, embedding_matrix)
        else:
            with open(os.path.join(output_dir, 'embeddings.json'), 'w', encoding='utf-8') as f:
                json.dump(embedding_matrix.tolist(), f)


def generate_index_for_collection(collection_name: str):
    cfg = COLLECTIONS[collection_name]
    posts_dir = cfg["posts_dir"]
    model = SentenceTransformer(MODEL)
    index = []
    contents = []

    print(f"[{collection_name}] posts directory: {os.path.abspath(posts_dir)}")
    if not os.path.isdir(posts_dir):
        print(f"[{collection_name}] directory missing; writing empty index.")
        embedding_matrix = np.empty((0, model.get_sentence_embedding_dimension()))
        save_outputs(index, embedding_matrix, cfg["output_dir_cli"], cfg["output_web"])
        print(f"[{collection_name}] index generated with 0 files.")
        return

    for root, _, filenames in os.walk(posts_dir):
        print(f"[{collection_name}] processing directory: {root}")
        for filename in filenames:
            if filename.endswith(".mdx"):
                path = os.path.join(root, filename)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    index.append({
                        "path": path,
                        "filename": filename,
                        "title": parse_title(content),
                    })
                    contents.append(strip_frontmatter_and_syntax(content))

    if len(contents) == 0:
        embedding_matrix = np.zeros((0, 384), dtype=np.float64)
        print(f"[{collection_name}] no .mdx files found; empty embeddings.")
    else:
        embeddings = model.encode(contents, convert_to_tensor=True)
        embedding_matrix = np.array(embeddings.cpu().numpy())

    save_outputs(index, embedding_matrix, cfg["output_dir_cli"], cfg["output_web"])
    print(f"[{collection_name}] index generated on {len(index)} files.")


def generate_indexes():
    for name in ("blog", "philosophy"):
        generate_index_for_collection(name)


def search_collection(collection_name: str, query: str):
    cfg = COLLECTIONS[collection_name]
    cli_dir = cfg["output_dir_cli"]
    index_path = os.path.join(cli_dir, 'index.json')
    if not os.path.exists(index_path):
        print(f"[{collection_name}] index not found. Run generate first.")
        return

    with open(index_path, 'r', encoding='utf-8') as f:
        index = json.load(f)

    emb_path = os.path.join(cli_dir, 'embeddings.npy')
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


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python main.py generate")
        print("  python main.py search [<query>]   # semantic search technical blog index")
        print("  python main.py search philosophy <query>")
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
