const mongoose = require('mongoose');

/**
 * ActivityLog — records every significant user action in the vault.
 * Every record is scoped to a userId so no cross-user leakage is possible.
 *
 * SECURITY: Never store raw passwords, OAuth client secrets, or access tokens in metadata.
 */
const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true
    },
    action: {
      type: String,
      required: [true, 'action is required'],
      enum: [
        'USER_REGISTERED',
        'USER_LOGIN',
        'USER_LOGOUT',
        'PLATFORM_CONNECTED',
        'PLATFORM_DISCONNECTED',
        'FILE_UPLOADED',
        'DOCUMENT_RETRIEVED',
        'DOCUMENT_INDEXED',
        'DOCUMENT_CREATED',
        'DOCUMENT_UPDATED',
        'DOCUMENT_DELETED',
        'AI_SEARCH',
        'AI_ACTION'
      ]
    },
    source: {
      type: String,
      enum: ['local', 'google_drive', 'notion', 'github', 'onedrive', 'dropbox', 'system', null],
      default: null
    },
    resourceId: {
      type: String,
      default: null
    },
    resourceName: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'PENDING'],
      default: 'SUCCESS'
    },
    // Arbitrary metadata — keep it safe (no tokens, no passwords)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false },
    collection: 'activity_logs'
  }
);

// Compound index for fast per-user queries sorted by time
activityLogSchema.index({ userId: 1, timestamp: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
