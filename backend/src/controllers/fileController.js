const fs = require('fs');
const path = require('path');
const { splitFileWithEngine } = require('../services/storageEngineService');

// Base directory for chunks output
const CHUNKS_BASE_DIR =
  process.env.CHUNKS_OUTPUT_DIR ||
  path.resolve(__dirname, '../../../../storage-engine/chunks_output');

/**
 * @desc    Upload a file and split it into chunks using the C++ storage engine
 * @route   POST /api/files/upload
 * @access  Private (Requires valid JWT)
 */
const uploadFile = async (req, res) => {
  let tempFilePath = null;

  try {
    // 1. Verify file was provided by multer
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a file using the "file" field in form-data.'
      });
    }

    tempFilePath = req.file.path;
    const originalFileName = req.file.originalname;
    const fileSize = req.file.size;

    // 2. Determine chunk size (default: 1 MB = 1,048,576 bytes)
    let chunkSize = 1048576;
    if (req.body.chunkSize) {
      const parsedSize = parseInt(req.body.chunkSize, 10);
      if (!isNaN(parsedSize) && parsedSize > 0) {
        chunkSize = parsedSize;
      }
    }

    // 3. Define target chunk directory for this file
    const safeBaseName = path
      .basename(originalFileName, path.extname(originalFileName))
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const folderName = `vault_${Date.now()}_${safeBaseName}`;
    const targetChunkDir = path.join(CHUNKS_BASE_DIR, folderName);

    // 4. Call C++ Storage Engine
    const { chunkCount, chunks } = await splitFileWithEngine(
      tempFilePath,
      targetChunkDir,
      chunkSize
    );

    // 5. Clean up temporary uploaded file
    if (fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath).catch((e) =>
        console.warn('[Upload] Temp file cleanup warning:', e.message)
      );
      tempFilePath = null;
    }

    // 6. Return response
    return res.status(200).json({
      success: true,
      fileName: originalFileName,
      fileSize: fileSize,
      chunkCount: chunkCount,
      chunks: chunks.map((c) => ({
        index: c.index,
        name: c.name,
        size: c.size
      }))
    });
  } catch (error) {
    console.error('[Upload Controller Error]:', error);

    // Always ensure temp file cleanup on failure
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath).catch(() => {});
    }

    const statusCode = error.message.includes('not found') ? 500 : 500;
    return res.status(statusCode).json({
      success: false,
      message: 'Failed to process and chunk file with storage engine',
      error: error.message
    });
  }
};

module.exports = {
  uploadFile
};
