const { google } = require('googleapis');
const BasePlatformIntegration = require('../base/BasePlatformIntegration');
const {
  createOAuth2Client,
  getOAuth2ClientForUser,
  getExportMimeType
} = require('./googleDriveHelpers');

class GoogleDriveIntegration extends BasePlatformIntegration {
  constructor() {
    super('google_drive');
  }

  /**
   * Generate the Google OAuth authorization URL.
   * The user should be redirected to this URL.
   *
   * @returns {string} authorizationUrl
   */
  getAuthorizationUrl() {
    const oauth2Client = createOAuth2Client();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Force re-consent to always get refresh_token
      scope: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    });
  }

  /**
   * Exchange authorization code for tokens.
   * @param {string} code - Authorization code from Google callback
   * @returns {Promise<{tokens, email, name}>}
   */
  async exchangeCodeForTokens(code) {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user info to get providerAccountId
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    return {
      tokens,
      email: userInfo.email,
      name: userInfo.name
    };
  }

  /**
   * List files from the user's Google Drive.
   * @param {string} userId
   * @param {object} options - { pageSize, pageToken, q (additional query) }
   */
  async listFiles(userId, options = {}) {
    const auth = await getOAuth2ClientForUser(userId);
    const drive = google.drive({ version: 'v3', auth });

    const { pageSize = 30, pageToken, q: additionalQuery } = options;

    // Exclude folders and trashed files by default
    let query = "trashed = false and mimeType != 'application/vnd.google-apps.folder'";
    if (additionalQuery) {
      query += ` and (${additionalQuery})`;
    }

    const response = await drive.files.list({
      pageSize,
      pageToken,
      q: query,
      fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc'
    });

    return {
      files: response.data.files || [],
      nextPageToken: response.data.nextPageToken || null
    };
  }

  /**
   * Search Google Drive files by query string.
   * @param {string} userId
   * @param {string} query - User search query
   */
  async searchFiles(userId, query, options = {}) {
    const { pageSize = 20 } = options;
    const auth = await getOAuth2ClientForUser(userId);
    const drive = google.drive({ version: 'v3', auth });

    // Google Drive full-text search
    const driveQuery = `fullText contains '${query.replace(/'/g, "\\'")}' and trashed = false`;

    const response = await drive.files.list({
      pageSize,
      q: driveQuery,
      fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc'
    });

    return {
      files: response.data.files || [],
      query
    };
  }

  /**
   * Retrieve a document's content as plain text.
   * Supports Google Docs/Sheets/Slides (via export), PDF (via pdf-parse), TXT (direct).
   *
   * @param {string} userId
   * @param {string} fileId
   * @returns {Promise<{id, name, mimeType, content, url, sizeBytes, createdTime, modifiedTime}>}
   */
  async getDocument(userId, fileId) {
    const auth = await getOAuth2ClientForUser(userId);
    const drive = google.drive({ version: 'v3', auth });

    // 1. Get file metadata
    const metaResponse = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink'
    });
    const meta = metaResponse.data;

    let content = '';

    // 2. Determine how to extract text based on MIME type
    const exportMime = getExportMimeType(meta.mimeType);

    if (exportMime) {
      // Google Workspace format — export as plain text
      const exportResponse = await drive.files.export(
        { fileId, mimeType: exportMime },
        { responseType: 'text' }
      );
      content = exportResponse.data || '';
    } else if (meta.mimeType === 'text/plain') {
      // Plain text file — download directly
      const downloadResponse = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'text' }
      );
      content = downloadResponse.data || '';
    } else if (meta.mimeType === 'application/pdf') {
      // PDF — download binary and parse
      const { extractTextFromPdfBuffer } = require('../../services/documentExtractionService');
      const downloadResponse = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      const buffer = Buffer.from(downloadResponse.data);
      content = await extractTextFromPdfBuffer(buffer);
    } else {
      content = `[Content extraction not supported for ${meta.mimeType}]`;
    }

    return {
      id: meta.id,
      name: meta.name,
      mimeType: meta.mimeType,
      content: content.trim(),
      url: meta.webViewLink,
      sizeBytes: meta.size ? parseInt(meta.size) : null,
      createdTime: meta.createdTime,
      modifiedTime: meta.modifiedTime
    };
  }
}

module.exports = GoogleDriveIntegration;
