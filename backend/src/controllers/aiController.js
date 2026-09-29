const { embedText } = require('../services/embeddingService');
const { similaritySearch } = require('../services/vectorStoreService');
const { recordActivity } = require('../services/activityService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Get or initialize the Gemini generative model for answer synthesis.
 */
const getGenerativeModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

/**
 * @desc    Semantic AI search across the user's indexed documents
 * @route   POST /api/ai/search
 * @body    { query: string, source?: string, topK?: number }
 * @access  Private (JWT required)
 *
 * Pipeline:
 *   1. Authenticate user (via protect middleware)
 *   2. Embed the query with Gemini text-embedding-004
 *   3. Similarity search — ALWAYS filtered by userId
 *   4. Assemble context from top-K chunks
 *   5. Generate answer with Gemini Flash
 *   6. Log AI_SEARCH in activity_logs
 *   7. Return answer + source citations
 */
const searchAI = async (req, res) => {
  const startTime = Date.now();
  let searchStatus = 'SUCCESS';

  try {
    const userId = req.user._id;
    const { query, source: filterSource, topK: requestedTopK } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'query is required' });
    }

    const topK = Math.min(parseInt(requestedTopK) || 5, 10);

    // Step 1 — Embed the query
    let queryEmbedding;
    try {
      queryEmbedding = await embedText(query.trim());
    } catch (embedErr) {
      return res.status(503).json({
        message: 'AI embedding service unavailable. Ensure GEMINI_API_KEY is set.',
        error: embedErr.message
      });
    }

    // Step 2 — Vector similarity search (always filtered by userId)
    const results = await similaritySearch(userId, queryEmbedding, topK, filterSource || null);

    if (results.length === 0) {
      // Log the search even if no results
      recordActivity({
        userId,
        action: 'AI_SEARCH',
        source: filterSource || null,
        status: 'SUCCESS',
        metadata: { query: query.trim(), resultCount: 0 }
      });

      return res.status(200).json({
        query: query.trim(),
        answer: "I couldn't find any indexed documents matching your query. Try connecting a platform and indexing some documents first.",
        results: [],
        latencyMs: Date.now() - startTime
      });
    }

    // Step 3 — Assemble context from top chunks
    const contextParts = results.map((r, i) => {
      const docName = r.document?.name || 'Unknown document';
      const src = r.source || 'unknown';
      return `[Source ${i + 1}: ${docName} (${src})]\n${r.chunkText}`;
    });
    const context = contextParts.join('\n\n---\n\n');

    // Step 4 — Generate answer with Gemini Flash
    let answer = '';
    try {
      const model = getGenerativeModel();
      const prompt = `You are an AI assistant helping a user search through their personal documents.

Use ONLY the provided document excerpts below to answer the question. 
If the answer is not found in the excerpts, say so clearly.
Do not make up information. Cite the source document name when relevant.

USER QUESTION: ${query.trim()}

DOCUMENT EXCERPTS:
${context}

ANSWER:`;

      const geminiResult = await model.generateContent(prompt);
      answer = geminiResult.response.text();
    } catch (llmErr) {
      console.error('[AI Search] LLM generation failed:', llmErr.message);
      // Degrade gracefully — return chunks without AI synthesis
      answer = 'AI synthesis unavailable. Here are the most relevant excerpts from your documents:';
    }

    // Step 5 — Log AI_SEARCH (no raw query contents that might be sensitive)
    recordActivity({
      userId,
      action: 'AI_SEARCH',
      source: filterSource || null,
      status: searchStatus,
      metadata: {
        query: query.trim().slice(0, 200), // Limit logged query length
        resultCount: results.length,
        latencyMs: Date.now() - startTime
      }
    });

    // Step 6 — Return results (never expose raw tokens or file system paths)
    return res.status(200).json({
      query: query.trim(),
      answer,
      results: results.map((r) => ({
        source: r.source,
        documentName: r.document?.name || null,
        documentUrl: r.document?.url || null,
        chunkText: r.chunkText,
        similarityScore: r.score,
        chunkIndex: r.chunkIndex
      })),
      latencyMs: Date.now() - startTime
    });
  } catch (error) {
    console.error('[AI Controller - searchAI Error]:', error.message);
    searchStatus = 'FAILURE';

    if (req.user) {
      recordActivity({
        userId: req.user._id,
        action: 'AI_SEARCH',
        status: 'FAILURE',
        metadata: { error: error.message }
      });
    }

    return res.status(500).json({ message: 'AI search failed', error: error.message });
  }
};

module.exports = { searchAI };
