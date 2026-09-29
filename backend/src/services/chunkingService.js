/**
 * chunkingService — AI/semantic content chunking for documents.
 *
 * IMPORTANT: This is NOT the same as the C++ fixed-size byte chunking engine.
 *
 * C++ storage chunking:  File → 1MB | 1MB | 1MB ...  (raw bytes, for storage)
 * AI content chunking:   Document text → Meaningful paragraph/section chunks (for RAG)
 *
 * Strategy (in order of preference):
 *   1. Split by markdown headings (# Heading, ## Section)
 *   2. Split by double newlines (paragraphs)
 *   3. Split by sentences if chunks are still too large
 *   4. Hard split on character limit as last resort
 *
 * @param {string} text           - Extracted plain text from a document
 * @param {object} options
 * @param {number} options.chunkSize    - Target max characters per chunk (default 1000)
 * @param {number} options.chunkOverlap - Characters of overlap between chunks (default 200)
 * @returns {Array<{chunkIndex: number, text: string, charStart: number, charEnd: number}>}
 */
const chunkDocument = (text, options = {}) => {
  const chunkSize = options.chunkSize || parseInt(process.env.CHUNK_SIZE) || 1000;
  const chunkOverlap = options.chunkOverlap || parseInt(process.env.CHUNK_OVERLAP) || 200;

  if (!text || text.trim().length === 0) {
    return [];
  }

  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Step 1 — Split by headings first
  const headingSplits = splitByHeadings(cleanText);

  // Step 2 — For each section, split by paragraphs if it's too large
  const paragraphSplits = [];
  for (const section of headingSplits) {
    if (section.length <= chunkSize) {
      paragraphSplits.push(section);
    } else {
      const paras = splitByParagraphs(section);
      paragraphSplits.push(...paras);
    }
  }

  // Step 3 — Merge small adjacent chunks up to chunkSize, with overlap
  const merged = mergeChunksWithOverlap(paragraphSplits, chunkSize, chunkOverlap);

  // Step 4 — Hard-split any remaining oversized chunks
  const final = [];
  for (const chunk of merged) {
    if (chunk.length > chunkSize * 2) {
      const hardSplit = hardSplitText(chunk, chunkSize, chunkOverlap);
      final.push(...hardSplit);
    } else {
      final.push(chunk);
    }
  }

  // Build output with index + character positions
  let charPos = 0;
  return final
    .map((chunkText, index) => {
      const trimmed = chunkText.trim();
      if (!trimmed) return null;

      const charStart = cleanText.indexOf(trimmed, charPos > 200 ? charPos - 200 : 0);
      const charEnd = charStart + trimmed.length;
      charPos = charEnd;

      return {
        chunkIndex: index,
        text: trimmed,
        charStart: charStart >= 0 ? charStart : 0,
        charEnd: charStart >= 0 ? charEnd : trimmed.length
      };
    })
    .filter(Boolean)
    .map((chunk, newIndex) => ({ ...chunk, chunkIndex: newIndex })); // re-index after nulls removed
};

// ─── Private helpers ────────────────────────────────────────────────────────

const splitByHeadings = (text) => {
  // Match markdown headings: # H1, ## H2, ### H3
  const parts = text.split(/\n(?=#{1,3} )/);
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
};

const splitByParagraphs = (text) => {
  const parts = text.split(/\n{2,}/);
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
};

const mergeChunksWithOverlap = (chunks, chunkSize, overlap) => {
  const result = [];
  let current = '';

  for (const chunk of chunks) {
    if (current.length === 0) {
      current = chunk;
    } else if (current.length + chunk.length + 1 <= chunkSize) {
      current += '\n\n' + chunk;
    } else {
      result.push(current);
      // Start new chunk with overlap from end of previous
      const overlapText = current.length > overlap ? current.slice(-overlap) : current;
      current = overlapText + '\n\n' + chunk;
    }
  }

  if (current.trim()) {
    result.push(current);
  }

  return result;
};

const hardSplitText = (text, chunkSize, overlap) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start >= text.length) break;
  }

  return chunks;
};

module.exports = { chunkDocument };
