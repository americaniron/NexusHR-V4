/**
 * Stub for @xenova/transformers — ML models too heavy for Workers.
 * Embedding generation will use Workers AI or external API instead.
 */
export class Pipeline {
  constructor() {}
  async run() { return []; }
}

export async function pipeline() {
  return async () => ({ data: new Float32Array(384) });
}

export default { pipeline, Pipeline };
