"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type FeatureExtractionPipeline,
  pipeline,
  env,
} from "@xenova/transformers";
import { PhilosophyBlogBody } from "../_components/PhilosophyBlogBody";
import styles from "../../blog/search/page.module.css";
import { PhilosophyBlogSearchEntry } from "../_components/PhilosophyBlogSearchEntry";

interface Post {
  path: string;
  filename: string;
  title: string;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

function slugTransform(filename: string): string {
  return filename
    .replace(/\.mdx?$/, "")
    .replace(/_/g, "-")
    .toLowerCase();
}

export default function PhilosophySearchClient(): React.ReactElement {
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
  const [timetoRun, setTimetoRun] = useState(0);

  useEffect(() => {
    const loadAll = async (): Promise<void> => {
      const [indexRes, embRes] = await Promise.all([
        fetch("/philosophy-output/index.json"),
        fetch("/philosophy-output/embeddings.json"),
      ]);

      const indexData: unknown = await indexRes.json();
      const embData: unknown = await embRes.json();

      if (!Array.isArray(indexData)) throw new Error("Invalid index data format");
      if (!Array.isArray(embData))
        throw new Error("Invalid embeddings data format");
      setIndex(indexData as Post[]);
      setEmbeddings(embData as number[][]);
      // @ts-expect-error — onnx backend type does not expose 'wasm' variant in library types
      env.backends.onnx = "wasm";
      const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
      );
      setEmbedder(() => extractor);
      setLoading(false);
    };

    void loadAll();
  }, []);

  const handleSearch = useCallback(async (): Promise<void> => {
    if (embedder === null || query === "") {
      return;
    }

    const startTime = performance.now();
    const output = await embedder(query, {
      pooling: "mean",
      normalize: true,
    });

    const queryVector = output.data as number[];

    const scoredResults = embeddings.map((vec, i) => ({
      post: index[i],
      score: cosineSimilarity(queryVector, vec),
    }));

    scoredResults.sort((a, b) => b.score - a.score);
    const endTime = performance.now();
    setTimetoRun(endTime - startTime);
    setResults(scoredResults.slice(0, 10));
  }, [embedder, embeddings, index, query]);

  useEffect(() => {
    void handleSearch();
  }, [embedder, query, handleSearch]);

  return (
    <PhilosophyBlogBody topTitle="Search essays">
      <div className={styles.searchContainer}>
        {loading ? (
          <p className={styles.loading}>Initializing search…</p>
        ) : (
          <div className={styles.inputs}>
            <input
              maxLength={100}
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
        <ul className={styles.resultsContainer}>
          <p className={styles.searchinfo}> Top 10 results for &quot;{query}&quot;</p>
          {results.map(({ post, score }, i) => (
            <PhilosophyBlogSearchEntry
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
      <p className={styles.searchPerformance}>
        {results.length > 0
          ? `Search completed in ${timetoRun.toFixed(2)} ms`
          : "No results found."}
      </p>
    </PhilosophyBlogBody>
  );
}
