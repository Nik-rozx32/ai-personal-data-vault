/**
 * documentExtractionService — extracts plain text from various document formats.
 *
 * Supported:
 *   - application/pdf        → pdf-parse
 *   - text/plain             → direct string
 *   - text/csv               → direct string
 *   - text/html              → strip tags
 *   - Others                 → returns empty string with a note
 *
 * Google Workspace formats (Docs, Sheets, Slides) are handled directly by the
 * Google Drive API export endpoint — they arrive here already as plain text.
 */

/**
 * Extract text from a PDF Buffer.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
const extractTextFromPdfBuffer = async (buffer) => {
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('[DocumentExtraction] PDF parse error:', err.message);
    return '';
  }
};

/**
 * Extract plain text from a Buffer given its MIME type.
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {Promise<string>}
 */
const extractText = async (buffer, mimeType) => {
  if (!buffer || buffer.length === 0) return '';

  switch (mimeType) {
    case 'application/pdf':
      return extractTextFromPdfBuffer(buffer);

    case 'text/plain':
    case 'text/csv':
    case 'text/markdown':
      return buffer.toString('utf8');

    case 'text/html': {
      // Simple HTML tag stripping — no DOM parser needed for text extraction
      const html = buffer.toString('utf8');
      return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    default:
      console.warn(`[DocumentExtraction] No extractor for MIME type: ${mimeType}`);
      return '';
  }
};

module.exports = { extractText, extractTextFromPdfBuffer };
