import os
import re
import sys
import json
import yaml
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_POSTS_DIR = os.path.join(SCRIPT_DIR, "../../src/_posts/")
MODEL = "all-MiniLM-L6-v2"
OUTPUT_DIR_CLI = os.path.join(SCRIPT_DIR, "output")
OUTPUT_WEBSITE = os.path.join(SCRIPT_DIR, "../../public/output")


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


def save_outputs(index, embedding_matrix):
    """Write index and embeddings to both CLI and website output directories."""
    for output_dir, embed_format in [(OUTPUT_DIR_CLI, "npy"), (OUTPUT_WEBSITE, "json")]:
        os.makedirs(output_dir, exist_ok=True)
        with open(os.path.join(output_dir, 'index.json'), 'w', encoding='utf-8') as f:
            json.dump(index, f)
        if embed_format == "npy":
            with open(os.path.join(output_dir, 'embeddings.npy'), 'wb') as f:
                np.save(f, embedding_matrix)
        else:
            with open(os.path.join(output_dir, 'embeddings.json'), 'w') as f:
                json.dump(embedding_matrix.tolist(), f)


def generate_index():
    model = SentenceTransformer(MODEL)
    index = []
    contents = []
    print(f"Blog posts directory: {os.path.abspath(BLOG_POSTS_DIR)}")
    for root, _, filenames in os.walk(BLOG_POSTS_DIR):
        print(f"Processing directory: {root}")
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

    embeddings = model.encode(contents, convert_to_tensor=True)
    embedding_matrix = np.array(embeddings.cpu().numpy())
    save_outputs(index, embedding_matrix)
    print(f"Index generated successfully on {len(index)} files.")


def search(query):
    index_path = os.path.join(OUTPUT_DIR_CLI, 'index.json')
    if not os.path.exists(index_path):
        print("Index not found. Please generate the index first.")
        return

    with open(index_path, 'r', encoding='utf-8') as f:
        index = json.load(f)

    embeddings = np.load(os.path.join(OUTPUT_DIR_CLI, 'embeddings.npy'))

    model = SentenceTransformer(MODEL)
    query_embedding = model.encode(query, convert_to_tensor=True).cpu().numpy()

    similarities = cosine_similarity([query_embedding], embeddings)[0]

    if len(similarities) == 0:
        print("No results found.")
        return

    top_indices = np.argsort(similarities)[::-1][:10]

    print("Search results:")
    for i in top_indices:
        print(f'{index[i]["title"]} ({index[i]["filename"]}): {similarities[i]:.4f}')


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python main.py <query>")
        sys.exit(1)

    command = sys.argv[1]

    if command == "generate":
        generate_index()
    elif command == "search":
        if len(sys.argv) < 3:
            print("Usage: python main.py search <query>")
            sys.exit(1)
        query = sys.argv[2]
        search(query)
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
