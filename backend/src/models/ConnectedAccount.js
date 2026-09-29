const mongoose = require('mongoose');
const crypto = require('crypto');

// Encryption helpers — uses AES-256-CBC with IV
// Key must be a 64-char hex string (32 bytes) stored in ENCRYPTION_KEY env var
const ALGORITHM = 'aes-256-cbc';

const getKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes) in your .env file');
  }
  return Buffer.from(key, 'hex');
};

const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  const [ivHex, dataHex] = encryptedText.split(':');
  if (!ivHex || !dataHex) return null;
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(dataHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};

/**
 * ConnectedAccount — stores OAuth credentials for external platform connections.
 * Access tokens and refresh tokens are encrypted at rest with AES-256-CBC.
 *
 * SECURITY: Raw tokens are NEVER exposed in API responses, logs, or activity records.
 */
const connectedAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true
    },
    provider: {
      type: String,
      enum: ['google_drive', 'notion', 'github', 'onedrive', 'dropbox'],
      required: [true, 'provider is required']
    },
    // The account ID on the external platform (e.g. Google sub/email)
    providerAccountId: {
      type: String,
      default: null
    },
    // Encrypted OAuth tokens — never stored or returned in plain text
    _accessTokenEncrypted: {
      type: String,
      default: null
    },
    _refreshTokenEncrypted: {
      type: String,
      default: null
    },
    // Token expiry time (for proactive refresh)
    tokenExpiresAt: {
      type: Date,
      default: null
    },
    // OAuth scopes granted
    scopes: {
      type: [String],
      default: []
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'disconnected', 'error'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    collection: 'connected_accounts'
  }
);

// One connection per user per provider
connectedAccountSchema.index({ userId: 1, provider: 1 }, { unique: true });

// Virtual setters/getters for transparent encryption
connectedAccountSchema.virtual('accessToken').set(function (token) {
  this._accessTokenEncrypted = encrypt(token);
});

connectedAccountSchema.virtual('refreshToken').set(function (token) {
  this._refreshTokenEncrypted = encrypt(token);
});

connectedAccountSchema.methods.getAccessToken = function () {
  return decrypt(this._accessTokenEncrypted);
};

connectedAccountSchema.methods.getRefreshToken = function () {
  return decrypt(this._refreshTokenEncrypted);
};

// Never expose encrypted tokens in JSON output
connectedAccountSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj._accessTokenEncrypted;
  delete obj._refreshTokenEncrypted;
  delete obj.__v;
  return obj;
};

const ConnectedAccount = mongoose.model('ConnectedAccount', connectedAccountSchema);

module.exports = { ConnectedAccount, encrypt, decrypt };
