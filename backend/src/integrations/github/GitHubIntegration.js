/**
 * GitHub integration — STUB (not yet implemented)
 * Extend BasePlatformIntegration and implement listFiles, searchFiles, getDocument.
 */
const BasePlatformIntegration = require('../base/BasePlatformIntegration');

class GitHubIntegration extends BasePlatformIntegration {
  constructor() {
    super('github');
  }
  // TODO: Implement using @octokit/rest SDK
}

module.exports = GitHubIntegration;
