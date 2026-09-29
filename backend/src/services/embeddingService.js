const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

/**
 * Lazily initialize the Gemini client.
 * Throws a clear error if GEMINI_API_KEY is missing from env.
 */
const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in .env — required for AI features');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * Embed a single text string using Gemini text-embedding-004.
 * Returns a flat array of floats (the embedding vector).
 *
 * @param {string} text
 * @returns {Promise<number[]>}
 */
const embedText = async (text) => {
  const client = getGenAI();
  const model = client.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
};

/**
 * Embed an array of texts in batch.
 * Gemini supports batch embedding — we process in batches of 20 to stay within limits.
 *
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
const embedBatch = async (texts) => {
  if (!texts || texts.length === 0) return [];

  const client = getGenAI();
  const model = client.getGenerativeModel({ model: 'text-embedding-004' });

  const BATCH_SIZE = 20;
  const results = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    // Gemini batchEmbedContents
    const batchResult = await model.batchEmbedContents({
      requests: batch.map((text) => ({
        content: { parts: [{ text }] }
      }))
    });

    for (const embedding of batchResult.embeddings) {
      results.push(embedding.values);
    }
  }

  return results;
};

module.exports = { embedText, embedBatch };
