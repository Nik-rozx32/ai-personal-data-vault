/**
 * BasePlatformIntegration — abstract interface contract for all platform integrations.
 *
 * Every integration (Google Drive, Notion, GitHub, OneDrive, Dropbox...) should
 * extend this class and implement the methods it supports.
 *
 * Not all methods need to be implemented immediately — throw a NotImplementedError
 * for unsupported operations, but DO implement the ones you use.
 *
 * Convention:
 *   - All methods are async and return Promises.
 *   - All methods receive `userId` (MongoDB ObjectId string) as first arg so
 *     they can look up the user's stored OAuth credentials.
 *   - listFiles / searchFiles return arrays of safe file metadata objects.
 *   - getDocument returns { id, name, mimeType, content (plain text), url }
 *   - Never return raw OAuth tokens from any method.
 */
class BasePlatformIntegration {
  constructor(providerName) {
    if (!providerName) throw new Error('providerName is required');
    this.providerName = providerName;
  }

  /**
   * Initiate OAuth connection flow.
   * Should return a URL string to redirect the user to.
   * @param {string} userId
   * @returns {Promise<string>} authorizationUrl
   */
  async connect(userId) {
    throw new Error(`[${this.providerName}] connect() not implemented`);
  }

  /**
   * Revoke and clean up OAuth credentials.
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async disconnect(userId) {
    throw new Error(`[${this.providerName}] disconnect() not implemented`);
  }

  /**
   * List files accessible to the user on this platform.
   * @param {string} userId
   * @param {object} [options] - e.g. { pageSize, pageToken, folderId }
   * @returns {Promise<Array<{id, name, mimeType, size, createdTime, modifiedTime, webViewLink}>>}
   */
  async listFiles(userId, options = {}) {
    throw new Error(`[${this.providerName}] listFiles() not implemented`);
  }

  /**
   * Search for files by query string.
   * @param {string} userId
   * @param {string} query
   * @param {object} [options]
   * @returns {Promise<Array<{id, name, mimeType, size, createdTime, modifiedTime, webViewLink}>>}
   */
  async searchFiles(userId, query, options = {}) {
    throw new Error(`[${this.providerName}] searchFiles() not implemented`);
  }

  /**
   * Retrieve a document and extract its plain text content.
   * @param {string} userId
   * @param {string} fileId - Platform-specific file ID
   * @returns {Promise<{id, name, mimeType, content, url, sizeBytes, createdTime, modifiedTime}>}
   */
  async getDocument(userId, fileId) {
    throw new Error(`[${this.providerName}] getDocument() not implemented`);
  }

  /**
   * Create a new document on the platform.
   * @param {string} userId
   * @param {object} data - { name, content, mimeType, ... }
   * @returns {Promise<object>}
   */
  async createDocument(userId, data) {
    throw new Error(`[${this.providerName}] createDocument() not implemented`);
  }

  /**
   * Update an existing document.
   * @param {string} userId
   * @param {string} fileId
   * @param {object} data
   * @returns {Promise<object>}
   */
  async updateDocument(userId, fileId, data) {
    throw new Error(`[${this.providerName}] updateDocument() not implemented`);
  }

  /**
   * Delete a document from the platform.
   * @param {string} userId
   * @param {string} fileId
   * @returns {Promise<void>}
   */
  async deleteDocument(userId, fileId) {
    throw new Error(`[${this.providerName}] deleteDocument() not implemented`);
  }
}

module.exports = BasePlatformIntegration;
