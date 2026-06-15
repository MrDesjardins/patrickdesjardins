export interface EmbeddingsMatrix {
  dims: number;
  rows: Float32Array[];
}

function parseEmbeddingsBin(buffer: ArrayBuffer): EmbeddingsMatrix {
  const view = new DataView(buffer);
  const numDocs = view.getUint32(0, true);
  const dims = view.getUint32(4, true);
  const floats = new Float32Array(buffer, 8, numDocs * dims);
  const rows: Float32Array[] = [];
  for (let index = 0; index < numDocs; index += 1) {
    rows.push(floats.subarray(index * dims, (index + 1) * dims));
  }
  return { dims: dims, rows: rows };
}

function parseEmbeddingsJson(data: unknown): EmbeddingsMatrix {
  if (!Array.isArray(data) || data.length === 0) {
    return { dims: 0, rows: [] };
  }
  const first = data[0];
  if (!Array.isArray(first)) {
    throw new Error("Invalid embeddings JSON format");
  }
  const dims = first.length;
  const rows = data.map((row) => {
    if (!Array.isArray(row) || row.length !== dims) {
      throw new Error("Invalid embeddings JSON row");
    }
    return Float32Array.from(row as number[]);
  });
  return { dims: dims, rows: rows };
}

export async function loadEmbeddings(basePath: string): Promise<EmbeddingsMatrix> {
  const binResponse = await fetch(`${basePath}/embeddings.bin`);
  if (binResponse.ok) {
    return parseEmbeddingsBin(await binResponse.arrayBuffer());
  }

  const jsonResponse = await fetch(`${basePath}/embeddings.json`);
  if (!jsonResponse.ok) {
    throw new Error(`Failed to load embeddings from ${basePath}`);
  }
  return parseEmbeddingsJson(await jsonResponse.json());
}

export function cosineSimilarity(
  query: ArrayLike<number>,
  document: Float32Array,
): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < document.length; index += 1) {
    const queryValue = query[index] ?? 0;
    const docValue = document[index] ?? 0;
    dot += queryValue * docValue;
    normA += queryValue * queryValue;
    normB += docValue * docValue;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
