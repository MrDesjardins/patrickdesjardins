import os
import sys
import json
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

BLOG_POSTS_DIR = "../../src/_posts/"
MODEL = "all-MiniLM-L6-v2"
OUTPUT_DIR = "output"


def generate_index():
    model = SentenceTransformer(MODEL)
    index = []
    embeddings = []
    counter = 0
    # Display the blog directory full path
    print(f"Blog posts directory: {os.path.abspath(BLOG_POSTS_DIR)}")
    for root, _, filenames in os.walk(BLOG_POSTS_DIR):
        print(f"Processing directory: {root}")
        for filename in filenames:
            if filename.endswith(".mdx"):
                counter += 1
                path = os.path.join(root, filename)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    #title = content.split('\n')[0].replace('# ', '').strip()
                    embedding = model.encode(content, convert_to_tensor=True)
                    index.append({
                        "path":path,
                        "filename": filename,
                        "title": content.split('\n')[1].replace('title: ', '').replace("\"","").strip()
                    })
                    embeddings.append(embedding)

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    with open(OUTPUT_DIR + '/index.json', 'w', encoding='utf-8') as f:
        json.dump(index, f)

    embedding_matrix = np.array([embedding.cpu().numpy() for embedding in embeddings])
    # Save the embeddings to a .npy file
    with open(OUTPUT_DIR + '/embeddings.npy', 'wb') as f:
        np.save(f, embedding_matrix)
    print(f"Index generated successfully on {counter} files.")


def search(query):
    if not os.path.exists(OUTPUT_DIR + '/index.json'):
        print("Index not found. Please generate the index first.")
        return

    with open(OUTPUT_DIR + '/index.json', 'r', encoding='utf-8') as f:
        index = json.load(f)

    embeddings_path = OUTPUT_DIR + '/embeddings.npy'
    embeddings = np.load(embeddings_path, allow_pickle=True)

    model = SentenceTransformer(MODEL)
    query_embedding = model.encode(query, convert_to_tensor=True)

    similarities = {}
    for i, item in enumerate(index):
        embedding = embeddings[i]
        similarity = cosine_similarity([query_embedding.cpu().numpy()], [embedding])[0][0]
        similarities[i] = similarity
    # Sort results by similarity score
    if not similarities:
        print("No results found.")
        return

    sorted_results = sorted(similarities.items(), key=lambda item: item[1], reverse=True)

    print("Search results:")
    for i, score in sorted_results[:10]:  # Display top 10 results
        print(f'{index[i]["title"]} ({index[i]["filename"]}): {score:.4f}')


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