const mongoose = require('mongoose');

/**
 * Normalized document representation for all platforms.
 * Documents from Google Drive, local uploads, Notion, etc. all share this schema
 * so the AI search pipeline can process them uniformly.
 */
const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true
    },
    // Where the document came from
    source: {
      type: String,
      enum: ['local', 'google_drive', 'notion', 'github', 'onedrive', 'dropbox'],
      required: [true, 'source is required']
    },
    // The document ID on the external platform (e.g. Google Drive file ID), or filename for local
    sourceDocumentId: {
      type: String,
      required: [true, 'sourceDocumentId is required']
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream'
    },
    // Extracted plain text content (for AI processing)
    content: {
      type: String,
      default: ''
    },
    // Whether text extraction succeeded
    textExtracted: {
      type: Boolean,
      default: false
    },
    // Direct URL to the document on its platform
    url: {
      type: String,
      default: null
    },
    // File size in bytes (if known)
    sizeBytes: {
      type: Number,
      default: null
    },
    // Timestamps from the source platform
    sourceCreatedAt: {
      type: Date,
      default: null
    },
    sourceModifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true, // createdAt, updatedAt managed by Mongoose
    collection: 'documents'
  }
);

// Compound index: one record per user+source+sourceDocumentId
documentSchema.index({ userId: 1, source: 1, sourceDocumentId: 1 }, { unique: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
