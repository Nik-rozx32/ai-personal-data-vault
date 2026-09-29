const mongoose = require('mongoose');

/**
 * DocumentChunk — stores semantic text chunks with their vector embeddings.
 *
 * Every chunk MUST belong to a userId. Vector similarity searches always
 * filter by userId first so cross-user data leakage is impossible.
 */
const documentChunkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true
    },
    // Which platform the document came from
    source: {
      type: String,
      enum: ['local', 'google_drive', 'notion', 'github', 'onedrive', 'dropbox'],
      required: true
    },
    // Reference to the parent Document record
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true
    },
    // Position of this chunk within the document
    chunkIndex: {
      type: Number,
      required: true
    },
    // The plain text content of this chunk
    text: {
      type: String,
      required: true
    },
    // Character position in the original document (for citation)
    charStart: {
      type: Number,
      default: 0
    },
    charEnd: {
      type: Number,
      default: 0
    },
    // The embedding vector (array of floats from Gemini text-embedding-004)
    // Stored as a plain array — cosine similarity computed in JS
    embedding: {
      type: [Number],
      default: []
    }
  },
  {
    timestamps: true,
    collection: 'document_chunks'
  }
);

// Index for fast per-user+document lookups
documentChunkSchema.index({ userId: 1, documentId: 1, chunkIndex: 1 });

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);

module.exports = DocumentChunk;
