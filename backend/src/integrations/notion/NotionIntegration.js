/**
 * Notion integration — STUB (not yet implemented)
 * Extend BasePlatformIntegration and implement listFiles, searchFiles, getDocument.
 */
const BasePlatformIntegration = require('../base/BasePlatformIntegration');

class NotionIntegration extends BasePlatformIntegration {
  constructor() {
    super('notion');
  }
  // TODO: Implement using Notion API SDK
}

module.exports = NotionIntegration;
