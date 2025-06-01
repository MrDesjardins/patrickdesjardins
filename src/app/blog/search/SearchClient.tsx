"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type FeatureExtractionPipeline,
  pipeline,
  env,
} from "@xenova/transformers";
import { BlogBody } from "../_components/BlogBody";
import styles from "./page.module.css";
import { BlogSearchEntry } from "../_components/BlogSearchEntry";

interface Post {
  path: string;
  filename: string;
  title: string;
}

export default function Page(): React.ReactElement {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ post: Post; score: number }>>(
    [],
  );
  const [index, setIndex] = useState<Post[]>([]);
  const [embeddings, setEmbeddings] = useState<number[][]>([]);
  const [embedder, setEmbedder] = useState<FeatureExtractionPipeline | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Load index, embeddings, and model
  useEffect(() => {
    const loadAll = async (): Promise<void> => {
      const [indexRes, embRes] = await Promise.all([
        fetch("/output/index.json"),
        fetch("/output/embeddings.json"),
      ]);

      const indexData = await indexRes.json();
      const embData = await embRes.json();

      setIndex(indexData as Post[]);
      setEmbeddings(embData as number[][]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      env.backends.onnx = "wasm" as any;
      const extractor = await pipeline(
        "feature-extraction", // https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.FeatureExtractionPipeline
        "Xenova/all-MiniLM-L6-v2", // Must match the Python embedding model
      );
      setEmbedder(() => extractor); // Avoid rerender loop
      setLoading(false);
    };

    void loadAll();
  }, []);

  // Cosine similarity
  const cosineSimilarity = (a: number[], b: number[]): number => {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (normA * normB);
  };

  // Perform search
  const handleSearch = useCallback(async (): Promise<void> => {
    if (embedder === null || query === "") {
      return;
    }

    // Create embeddings for the query
    const output = await embedder(query, {
      pooling: "mean",
      normalize: true,
    });

    const queryVector = output.data as number[];

    // Run the cosine similarity against all embeddings
    const scoredResults = embeddings.map((vec, i) => ({
      post: index[i],
      score: cosineSimilarity(queryVector, vec),
    }));

    // Descending sort by score and take top 10
    scoredResults.sort((a, b) => b.score - a.score);
    setResults(scoredResults.slice(0, 10));
  }, [embedder, embeddings, index, query]);

  useEffect(() => {
    void handleSearch();
  }, [embedder, query, handleSearch]); // Re-run search when embedder or query changes

  return (
    <BlogBody topTitle="Search Posts">
      <div className={styles.searchContainer}>
        {loading ? (
          <p className="loading">Initializing Search</p>
        ) : (
          <div className={styles.inputs}>
            <input
              className={styles.textbox}
              placeholder="Enter search query"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleSearch();
                }
              }}
            />
            <button
              className={styles.button}
              onClick={() => {
                void handleSearch();
              }}
            >
              Search
            </button>
          </div>
        )}
      </div>
      {results.length > 0 ? (
        <ul className={styles.container_results}>
          <p className={styles.searchinfo}> Top 10 results for "{query}"</p>
          {results.map(({ post, score }, i) => (
            <BlogSearchEntry
              position={i}
              key={post.filename}
              id={post.filename}
              slug={slugTransform(post.filename)}
              title={post.title}
              score={score}
            />
          ))}
        </ul>
      ) : null}
    </BlogBody>
  );
}

function slugTransform(filename: string): string {
  // Convert filename to slug format
  return filename
    .replace(/\.mdx?$/, "") // Remove .md or .mdx extension
    .replace(/_/g, "-") // Replace underscores with hyphens
    .toLowerCase(); // Convert to lowercase
}
