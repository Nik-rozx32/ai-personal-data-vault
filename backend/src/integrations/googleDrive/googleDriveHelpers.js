const { google } = require('googleapis');
const { ConnectedAccount } = require('../../models/ConnectedAccount');

/**
 * Build and return a configured Google OAuth2 client.
 * Reads GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI from env.
 */
const createOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Google OAuth not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env'
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

/**
 * Get an authenticated OAuth2 client for a specific user.
 * Automatically refreshes the access token if it is expired.
 *
 * @param {string} userId - MongoDB user ID
 * @returns {Promise<OAuth2Client>}
 */
const getOAuth2ClientForUser = async (userId) => {
  const account = await ConnectedAccount.findOne({
    userId,
    provider: 'google_drive',
    status: 'active'
  });

  if (!account) {
    throw new Error('Google Drive is not connected for this user. Please connect your account first.');
  }

  const oauth2Client = createOAuth2Client();

  const accessToken = account.getAccessToken();
  const refreshToken = account.getRefreshToken();

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: account.tokenExpiresAt ? account.tokenExpiresAt.getTime() : null
  });

  // Listen for token refresh and persist the new access token
  oauth2Client.on('tokens', async (newTokens) => {
    try {
      const update = {};
      if (newTokens.access_token) {
        account.accessToken = newTokens.access_token; // uses virtual setter (encrypts)
        update._accessTokenEncrypted = account._accessTokenEncrypted;
      }
      if (newTokens.expiry_date) {
        update.tokenExpiresAt = new Date(newTokens.expiry_date);
      }
      if (Object.keys(update).length > 0) {
        await ConnectedAccount.updateOne({ _id: account._id }, { $set: update });
      }
    } catch (err) {
      console.error('[GoogleDriveHelpers] Failed to persist refreshed token:', err.message);
    }
  });

  return oauth2Client;
};

/**
 * Map Google MIME types to a safe display type string.
 */
const getMimeTypeLabel = (mimeType) => {
  const mimeMap = {
    'application/vnd.google-apps.document': 'Google Doc',
    'application/vnd.google-apps.spreadsheet': 'Google Sheet',
    'application/vnd.google-apps.presentation': 'Google Slides',
    'application/vnd.google-apps.folder': 'Folder',
    'application/pdf': 'PDF',
    'text/plain': 'Text',
    'image/jpeg': 'Image',
    'image/png': 'Image',
    'application/zip': 'Archive'
  };
  return mimeMap[mimeType] || mimeType;
};

/**
 * Determine if a MIME type is text-extractable via the Google Drive export API.
 * Returns the export MIME type, or null if not supported.
 */
const getExportMimeType = (mimeType) => {
  const exportMap = {
    'application/vnd.google-apps.document': 'text/plain',
    'application/vnd.google-apps.spreadsheet': 'text/csv',
    'application/vnd.google-apps.presentation': 'text/plain'
  };
  return exportMap[mimeType] || null;
};

module.exports = {
  createOAuth2Client,
  getOAuth2ClientForUser,
  getMimeTypeLabel,
  getExportMimeType
};
