const DocumentChunk = require('../models/DocumentChunk');
const Document = require('../models/Document');
const { embedBatch, embedText } = require('./embeddingService');

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical direction).
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
};

/**
 * Index document chunks into MongoDB with their embeddings.
 * Deletes existing chunks for this document first (re-index on update).
 *
 * @param {ObjectId|string} userId
 * @param {ObjectId|string} documentId
 * @param {string} source
 * @param {Array<{chunkIndex, text, charStart, charEnd}>} chunks
 * @returns {Promise<number>} Number of chunks indexed
 */
const indexDocumentChunks = async (userId, documentId, source, chunks) => {
  if (!chunks || chunks.length === 0) return 0;

  // Remove old chunks for this document
  await DocumentChunk.deleteMany({ userId, documentId });

  // Embed all chunk texts in batch
  const texts = chunks.map((c) => c.text);
  const embeddings = await embedBatch(texts);

  // Build bulk insert array
  const docs = chunks.map((chunk, i) => ({
    userId,
    source,
    documentId,
    chunkIndex: chunk.chunkIndex,
    text: chunk.text,
    charStart: chunk.charStart || 0,
    charEnd: chunk.charEnd || 0,
    embedding: embeddings[i] || []
  }));

  await DocumentChunk.insertMany(docs);
  return docs.length;
};

/**
 * Perform vector similarity search for a user's indexed chunks.
 *
 * SECURITY: Always filters by userId — never returns another user's data.
 *
 * @param {ObjectId|string} userId
 * @param {number[]} queryEmbedding
 * @param {number} topK - Number of top results to return
 * @param {string|null} filterSource - Optional source filter (e.g. 'google_drive')
 * @returns {Promise<Array<{chunk, document, score}>>}
 */
const similaritySearch = async (userId, queryEmbedding, topK = 5, filterSource = null) => {
  // Build query — always scoped to userId
  const query = {
    userId,
    'embedding.0': { $exists: true } // Only chunks that have been embedded
  };
  if (filterSource) {
    query.source = filterSource;
  }

  // Fetch all the user's embedded chunks (with source/document info)
  const chunks = await DocumentChunk.find(query)
    .select('text embedding chunkIndex source documentId charStart charEnd')
    .lean();

  if (chunks.length === 0) return [];

  // Compute cosine similarity for each chunk
  const scored = chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));

  // Sort descending and take top-K
  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, topK);

  // Fetch document metadata for each top chunk
  const documentIds = [...new Set(topChunks.map((r) => r.chunk.documentId.toString()))];
  const documents = await Document.find({ _id: { $in: documentIds } })
    .select('name source url mimeType sourceDocumentId')
    .lean();

  const docMap = {};
  for (const doc of documents) {
    docMap[doc._id.toString()] = doc;
  }

  return topChunks.map(({ chunk, score }) => ({
    chunkText: chunk.text,
    chunkIndex: chunk.chunkIndex,
    score: Math.round(score * 10000) / 10000,
    source: chunk.source,
    document: docMap[chunk.documentId.toString()] || null
  }));
};

module.exports = { indexDocumentChunks, similaritySearch, cosineSimilarity };
