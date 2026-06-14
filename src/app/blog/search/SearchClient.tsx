"use client";

import { useCallback, useRef, useState } from "react";
import { type FeatureExtractionPipeline } from "@xenova/transformers";
import { BlogBody } from "../_components/BlogBody";
import styles from "./page.module.css";
import { BlogSearchEntry } from "../_components/BlogSearchEntry";
import { slugFromMdxFilename } from "../../../lib/slug";
import { sendTelemetryEvent } from "../../../lib/telemetry";

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
  const [loading, setLoading] = useState(false);
  const [searchInitialized, setSearchInitialized] = useState(false);
  const [timetoRun, setTimetoRun] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    "Search is ready. Focus the field or submit a query to load semantic search.",
  );
  const initPromiseRef = useRef<Promise<FeatureExtractionPipeline> | null>(null);

  const initializeSearch = useCallback(async (): Promise<FeatureExtractionPipeline> => {
    if (embedder !== null) {
      return embedder;
    }
    if (initPromiseRef.current !== null) {
      return await initPromiseRef.current;
    }

    setLoading(true);
    setStatusMessage("Initializing semantic search...");
    sendTelemetryEvent("search_ui_initialized", { search_collection: "blog" });

    initPromiseRef.current = (async () => {
      const [indexRes, embRes] = await Promise.all([
        fetch("/output/index.json"),
        fetch("/output/embeddings.json"),
      ]);

      const indexData: unknown = await indexRes.json();
      const embData: unknown = await embRes.json();

      if (!Array.isArray(indexData)) throw new Error("Invalid index data format");
      if (!Array.isArray(embData)) throw new Error("Invalid embeddings data format");
      setIndex(indexData as Post[]);
      setEmbeddings(embData as number[][]);
      const transformers = await import("@xenova/transformers");
      // @ts-expect-error — onnx backend type does not expose 'wasm' variant in library types
      transformers.env.backends.onnx = "wasm";
      const extractor = await transformers.pipeline(
        "feature-extraction", // https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.FeatureExtractionPipeline
        "Xenova/all-MiniLM-L6-v2", // Must match the Python embedding model
      );
      setEmbedder(() => extractor); // Avoid rerender loop
      setSearchInitialized(true);
      setLoading(false);
      setStatusMessage("Semantic search is ready.");
      sendTelemetryEvent("search_model_loaded", { search_collection: "blog" });
      return extractor;
    })();

    try {
      return await initPromiseRef.current;
    } catch (error) {
      initPromiseRef.current = null;
      setLoading(false);
      setStatusMessage("Search failed to initialize.");
      throw error;
    }
  }, [embedder]);

  // Perform search
  const handleSearch = useCallback(async (): Promise<void> => {
    const trimmedQuery = query.trim();
    if (trimmedQuery === "") {
      setResults([]);
      setStatusMessage("Enter a query to search posts.");
      return;
    }

    const activeEmbedder = await initializeSearch();
    const startTime = performance.now();
    // Create embeddings for the query
    const output = await activeEmbedder(trimmedQuery, {
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
    const endTime = performance.now();
    const duration = endTime - startTime;
    const topResults = scoredResults.slice(0, 10);
    setTimetoRun(duration);
    setResults(topResults);
    setStatusMessage(
      topResults.length > 0
        ? `${topResults.length} search results found.`
        : "No results found.",
    );
    sendTelemetryEvent("search_query_submitted", {
      search_collection: "blog",
      query_length: trimmedQuery.length,
      result_count: topResults.length,
      zero_results: topResults.length === 0,
      search_latency_ms: Math.round(duration),
    });
  }, [embeddings, index, initializeSearch, query]);

  return (
    <BlogBody topTitle="Search Posts">
      <div className={styles.searchContainer}>
        <div className={styles.inputs}>
          <label className={styles.label} htmlFor="blog-search-query">
            Search posts
          </label>
          <input
            id="blog-search-query"
            type="search"
            maxLength={100}
            className={styles.textbox}
            placeholder="Enter search query"
            aria-describedby="blog-search-status blog-search-performance"
            value={query}
            onFocus={() => {
              void initializeSearch();
            }}
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
            disabled={loading}
            onClick={() => {
              void handleSearch();
            }}
          >
            Search
          </button>
        </div>
        {loading ? (
          <p className={styles.loading}>Initializing search engine...</p>
        ) : null}
      </div>
      <p
        id="blog-search-status"
        className={styles.searchinfo}
        aria-live="polite"
      >
        {results.length > 0 ? `Top 10 results for "${query}"` : statusMessage}
      </p>
      {results.length > 0 ? (
        <ul className={styles.resultsContainer}>
          {results.map(({ post, score }, i) => (
            <BlogSearchEntry
              position={i}
              key={post.filename}
              id={post.filename}
              slug={slugFromMdxFilename(post.filename)}
              title={post.title}
              score={score}
            />
          ))}
        </ul>
      ) : null}
      <p id="blog-search-performance" className={styles.searchPerformance}>
        {results.length > 0
          ? `Search completed in ${timetoRun.toFixed(2)} ms`
          : searchInitialized
            ? "Semantic search is loaded."
            : "Semantic search loads on first interaction."}
      </p>
    </BlogBody>
  );
}
