import { logger } from "./logger";

const EMBEDDING_DIM = 384;
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

type FeatureExtractionPipeline = (text: string, options?: Record<string, unknown>) => Promise<{ data: Float32Array }>;

let extractor: FeatureExtractionPipeline | null = null;
let initPromise: Promise<FeatureExtractionPipeline> | null = null;

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (extractor) return extractor;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { env, pipeline } = await import("@xenova/transformers");
    env.backends.onnx.wasm.numThreads = 1;
    const ext = await pipeline("feature-extraction", MODEL_NAME, {
      quantized: true,
    });
    extractor = ext as unknown as FeatureExtractionPipeline;
    logger.info({ model: MODEL_NAME, dimensions: EMBEDDING_DIM }, "Neural embedding model loaded");
    return extractor;
  })().catch((err) => {
    initPromise = null;
    logger.error({ err, model: MODEL_NAME }, "Failed to load neural embedding model, will retry on next call");
    throw err;
  });

  return initPromise;
}

export async function warmupEmbeddings(): Promise<void> {
  await getExtractor();
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    return new Array(EMBEDDING_DIM).fill(0);
  }

  const ext = await getExtractor();
  const output = await ext(text, { pooling: "mean", normalize: true });
  const embedding = Array.from(output.data as Float32Array).slice(0, EMBEDDING_DIM);

  return embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function formatVectorForPg(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

export { EMBEDDING_DIM };
