const ActivityLog = require('../models/ActivityLog');

/**
 * Record an activity log entry.
 * Call this from any controller after a significant event.
 *
 * SECURITY: Never pass raw OAuth tokens, passwords, or secrets in metadata.
 *
 * @param {object} params
 * @param {string|ObjectId} params.userId      - The authenticated user's MongoDB _id
 * @param {string}          params.action      - One of the allowed action enum values
 * @param {string}          [params.source]    - Platform source (e.g. 'google_drive', 'local')
 * @param {string}          [params.resourceId]   - External resource ID (e.g. Google Drive file ID)
 * @param {string}          [params.resourceName] - Human-readable resource name
 * @param {string}          [params.status]    - 'SUCCESS' | 'FAILURE' | 'PENDING'
 * @param {object}          [params.metadata]  - Safe additional context
 * @returns {Promise<void>} - Resolves when saved; never throws (logs errors internally)
 */
const recordActivity = async ({
  userId,
  action,
  source = null,
  resourceId = null,
  resourceName = null,
  status = 'SUCCESS',
  metadata = {}
}) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      source,
      resourceId,
      resourceName,
      status,
      metadata
    });
  } catch (err) {
    // Activity logging must never crash the main request flow
    console.error('[ActivityService] Failed to record activity:', err.message);
  }
};

module.exports = { recordActivity };
