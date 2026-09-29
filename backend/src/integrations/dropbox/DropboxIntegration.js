/**
 * Dropbox integration — STUB (not yet implemented)
 * Extend BasePlatformIntegration and implement listFiles, searchFiles, getDocument.
 */
const BasePlatformIntegration = require('../base/BasePlatformIntegration');

class DropboxIntegration extends BasePlatformIntegration {
  constructor() {
    super('dropbox');
  }
  // TODO: Implement using dropbox SDK
}

module.exports = DropboxIntegration;
