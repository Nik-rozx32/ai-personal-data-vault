const { ConnectedAccount } = require('../models/ConnectedAccount');
const GoogleDriveIntegration = require('../integrations/googleDrive/GoogleDriveIntegration');
const Document = require('../models/Document');
const { recordActivity } = require('../services/activityService');
const { chunkDocument } = require('../services/chunkingService');
const { indexDocumentChunks } = require('../services/vectorStoreService');

const googleDrive = new GoogleDriveIntegration();

// ─── OAUTH FLOW ────────────────────────────────────────────────────────────

/**
 * @desc    Initiate Google OAuth flow
 * @route   GET /api/integrations/google-drive/connect
 * @access  Private (JWT required)
 *
 * Stores the userId in the OAuth state parameter so the callback can
 * associate the tokens with the correct user WITHOUT trusting a cookie.
 */
const initiateOAuth = (req, res) => {
  try {
    const userId = req.user._id.toString();
    const authUrl = googleDrive.getAuthorizationUrl();

    // Append state param containing userId (base64 encoded, not a secret — just routing)
    const stateParam = Buffer.from(JSON.stringify({ userId })).toString('base64url');
    const authUrlWithState = authUrl + `&state=${stateParam}`;

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(200).json({ url: authUrlWithState });
    }

    return res.redirect(authUrlWithState);
  } catch (error) {
    console.error('[GoogleDrive] initiateOAuth error:', error.message);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ message: error.message });
    }
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}?gdrive_error=oauth_config_missing`);
  }
};

/**
 * @desc    Google OAuth callback — receives authorization code, stores tokens
 * @route   GET /api/integrations/google-drive/callback
 * @access  Public (called by Google, contains state with userId)
 *
 * SECURITY NOTE: This route is public because Google calls it.
 * We verify the state parameter to identify the user — no JWT is present here.
 * We NEVER expose the tokens in the redirect URL.
 */
const oauthCallback = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  try {
    const { code, state, error: oauthError } = req.query;

    // User denied access on Google's consent screen
    if (oauthError) {
      console.warn('[GoogleDrive] OAuth denied:', oauthError);
      return res.redirect(`${frontendUrl}?gdrive_error=access_denied`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendUrl}?gdrive_error=invalid_callback`);
    }

    // Decode state to get userId
    let userId;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      userId = stateData.userId;
    } catch {
      return res.redirect(`${frontendUrl}?gdrive_error=invalid_state`);
    }

    if (!userId) {
      return res.redirect(`${frontendUrl}?gdrive_error=missing_user`);
    }

    // Exchange authorization code for tokens
    const { tokens, email } = await googleDrive.exchangeCodeForTokens(code);

    // Store or update the connected account (upsert)
    const account = await ConnectedAccount.findOneAndUpdate(
      { userId, provider: 'google_drive' },
      {
        userId,
        provider: 'google_drive',
        providerAccountId: email,
        status: 'active',
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        connectedAt: new Date(),
        tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Encrypt and store tokens separately (virtual setters)
    account.accessToken = tokens.access_token;
    if (tokens.refresh_token) {
      account.refreshToken = tokens.refresh_token;
    }
    await account.save();

    // Log PLATFORM_CONNECTED (no tokens in metadata)
    recordActivity({
      userId,
      action: 'PLATFORM_CONNECTED',
      source: 'google_drive',
      metadata: { providerAccountId: email }
    });

    // Redirect back to frontend with success signal
    return res.redirect(`${frontendUrl}?gdrive_connected=true`);
  } catch (error) {
    console.error('[GoogleDrive] oauthCallback error:', error.message);
    return res.redirect(`${frontendUrl}?gdrive_error=callback_failed`);
  }
};

// ─── CONNECTION MANAGEMENT ─────────────────────────────────────────────────

/**
 * @desc    Get Google Drive connection status for the authenticated user
 * @route   GET /api/integrations/google-drive/status
 * @access  Private
 */
const getConnectionStatus = async (req, res) => {
  try {
    const account = await ConnectedAccount.findOne({
      userId: req.user._id,
      provider: 'google_drive'
    }).lean();

    if (!account || account.status !== 'active') {
      return res.status(200).json({ connected: false });
    }

    return res.status(200).json({
      connected: true,
      providerAccountId: account.providerAccountId,
      connectedAt: account.connectedAt,
      scopes: account.scopes
    });
  } catch (error) {
    console.error('[GoogleDrive] getConnectionStatus error:', error.message);
    return res.status(500).json({ message: 'Error checking connection status' });
  }
};

/**
 * @desc    Disconnect Google Drive for the authenticated user
 * @route   DELETE /api/integrations/google-drive/disconnect
 * @access  Private
 */
const disconnectGoogleDrive = async (req, res) => {
  try {
    const result = await ConnectedAccount.findOneAndUpdate(
      { userId: req.user._id, provider: 'google_drive' },
      { status: 'disconnected' },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'No Google Drive connection found' });
    }

    recordActivity({
      userId: req.user._id,
      action: 'PLATFORM_DISCONNECTED',
      source: 'google_drive'
    });

    return res.status(200).json({ message: 'Google Drive disconnected successfully' });
  } catch (error) {
    console.error('[GoogleDrive] disconnectGoogleDrive error:', error.message);
    return res.status(500).json({ message: 'Error disconnecting Google Drive' });
  }
};

// ─── FILE OPERATIONS ───────────────────────────────────────────────────────

/**
 * @desc    List files from the authenticated user's Google Drive
 * @route   GET /api/integrations/google-drive/files
 * @access  Private
 */
const listFiles = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const pageSize = Math.min(parseInt(req.query.pageSize) || 30, 100);
    const pageToken = req.query.pageToken || undefined;

    const { files, nextPageToken } = await googleDrive.listFiles(userId, { pageSize, pageToken });

    // Store necessary document metadata in MongoDB (without downloading file binaries)
    if (files && files.length > 0) {
      Promise.all(
        files.map((file) =>
          Document.findOneAndUpdate(
            { userId: req.user._id, source: 'google_drive', sourceDocumentId: file.id },
            {
              userId: req.user._id,
              source: 'google_drive',
              sourceDocumentId: file.id,
              name: file.name,
              mimeType: file.mimeType,
              url: file.webViewLink,
              sizeBytes: file.size ? parseInt(file.size, 10) : null,
              sourceCreatedAt: file.createdTime ? new Date(file.createdTime) : null,
              sourceModifiedAt: file.modifiedTime ? new Date(file.modifiedTime) : null
            },
            { upsert: true }
          ).catch((e) => console.warn('[GoogleDrive] Metadata sync error:', e.message))
        )
      ).catch(() => {});
    }

    return res.status(200).json({ files, nextPageToken: nextPageToken || null });
  } catch (error) {
    console.error('[GoogleDrive] listFiles error:', error.message);
    if (error.message.includes('not connected')) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Error listing Google Drive files' });
  }
};

/**
 * @desc    Search Google Drive files
 * @route   GET /api/integrations/google-drive/search?q=...
 * @access  Private
 */
const searchFiles = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const query = req.query.q || '';

    if (!query.trim()) {
      return res.status(400).json({ message: 'Search query (q) is required' });
    }

    const result = await googleDrive.searchFiles(userId, query);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[GoogleDrive] searchFiles error:', error.message);
    return res.status(500).json({ message: 'Error searching Google Drive files' });
  }
};

/**
 * @desc    Retrieve, extract, chunk, and index a Google Drive document for AI search
 * @route   POST /api/integrations/google-drive/retrieve
 * @body    { fileId }
 * @access  Private
 */
const retrieveAndIndexDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ message: 'fileId is required' });
    }

    // 1. Fetch document content from Google Drive
    const docData = await googleDrive.getDocument(userId.toString(), fileId);

    // 2. Upsert normalized document in MongoDB
    const document = await Document.findOneAndUpdate(
      { userId, source: 'google_drive', sourceDocumentId: fileId },
      {
        userId,
        source: 'google_drive',
        sourceDocumentId: fileId,
        name: docData.name,
        mimeType: docData.mimeType,
        content: docData.content,
        textExtracted: true,
        url: docData.url,
        sizeBytes: docData.sizeBytes,
        sourceCreatedAt: docData.createdTime ? new Date(docData.createdTime) : null,
        sourceModifiedAt: docData.modifiedTime ? new Date(docData.modifiedTime) : null
      },
      { upsert: true, new: true, runValidators: true }
    );

    // 3. Chunk the document text for AI search
    const chunks = chunkDocument(docData.content, {
      chunkSize: parseInt(process.env.CHUNK_SIZE) || 1000,
      chunkOverlap: parseInt(process.env.CHUNK_OVERLAP) || 200
    });

    // 4. Embed and index chunks into vector store
    const indexedCount = await indexDocumentChunks(userId, document._id, 'google_drive', chunks);

    // 5. Log activity
    recordActivity({
      userId,
      action: 'DOCUMENT_RETRIEVED',
      source: 'google_drive',
      resourceId: fileId,
      resourceName: docData.name,
      metadata: { chunkCount: indexedCount, mimeType: docData.mimeType }
    });

    return res.status(200).json({
      message: 'Document retrieved and indexed successfully',
      document: {
        id: document._id,
        name: document.name,
        mimeType: document.mimeType,
        url: document.url,
        chunkCount: indexedCount
      }
    });
  } catch (error) {
    console.error('[GoogleDrive] retrieveAndIndexDocument error:', error.message);
    return res.status(500).json({ message: 'Error retrieving document', error: error.message });
  }
};

module.exports = {
  initiateOAuth,
  oauthCallback,
  getConnectionStatus,
  disconnectGoogleDrive,
  listFiles,
  searchFiles,
  retrieveAndIndexDocument
};
