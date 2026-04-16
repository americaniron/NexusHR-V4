import { logger } from "./logger";

const EMBEDDING_DIM = 384;

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "shall",
  "should", "may", "might", "must", "can", "could", "to", "of", "in",
  "for", "on", "with", "at", "by", "from", "as", "into", "through",
  "during", "before", "after", "above", "below", "between", "and",
  "but", "or", "nor", "not", "so", "yet", "both", "either", "neither",
  "each", "every", "all", "any", "few", "more", "most", "other", "some",
  "such", "no", "only", "own", "same", "than", "too", "very", "just",
  "because", "if", "when", "while", "where", "how", "what", "which",
  "who", "whom", "this", "that", "these", "those", "it", "its",
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
  "you", "your", "yours", "yourself", "yourselves", "he", "him", "his",
  "himself", "she", "her", "hers", "herself", "they", "them", "their",
  "theirs", "themselves", "am", "about", "up", "out", "off", "over",
  "under", "again", "further", "then", "once", "here", "there",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

function hashString(str: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h;
}

function generateNgrams(tokens: string[], maxN: number = 3): string[] {
  const ngrams: string[] = [...tokens];
  for (let n = 2; n <= maxN && n <= tokens.length; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join("_"));
    }
  }
  return ngrams;
}

function normalize(vec: number[]): number[] {
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm);
  if (norm === 0) return vec;
  return vec.map(v => v / norm);
}

export function generateEmbedding(text: string): number[] {
  const tokens = tokenize(text);
  if (tokens.length === 0) {
    return new Array(EMBEDDING_DIM).fill(0);
  }

  const ngrams = generateNgrams(tokens, 3);
  const vec = new Array(EMBEDDING_DIM).fill(0);

  for (const ngram of ngrams) {
    const idx1 = Math.abs(hashString(ngram, 42)) % EMBEDDING_DIM;
    const idx2 = Math.abs(hashString(ngram, 137)) % EMBEDDING_DIM;
    const sign1 = (hashString(ngram, 7) & 1) === 0 ? 1 : -1;
    const sign2 = (hashString(ngram, 31) & 1) === 0 ? 1 : -1;

    vec[idx1] += sign1;
    vec[idx2] += sign2;
  }

  return normalize(vec);
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

export const EMBEDDING_DIMENSIONS = EMBEDDING_DIM;

logger.info({ dimensions: EMBEDDING_DIM }, "Embedding service initialized (hash-based)");
