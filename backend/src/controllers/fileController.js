const fs = require('fs');
const path = require('path');
const { splitFileWithEngine } = require('../services/storageEngineService');

// Base directory for chunks output
const CHUNKS_BASE_DIR =
  process.env.CHUNKS_OUTPUT_DIR ||
  path.resolve(__dirname, '../../../chunks_output');

/**
 * @desc    Upload a file and split it into chunks using the C++ storage engine
 * @route   POST /api/files/chunk, POST /api/files/upload
 * @access  Public / Protected (Demo Friendly)
 */
const uploadFile = async (req, res) => {
  let tempFilePath = null;

  try {
    // 1. Verify file was provided by multer
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file selected. Please choose a file to upload and chunk.'
      });
    }

    tempFilePath = req.file.path;
    const originalFileName = req.file.originalname;
    const fileSize = req.file.size;

    // 2. Determine chunk size (default: 1 MB = 1,048,576 bytes)
    let chunkSize = 1048576;
    if (req.body.chunkSize) {
      const parsedSize = parseInt(req.body.chunkSize, 10);
      if (isNaN(parsedSize) || parsedSize <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid chunk size. Chunk size must be a positive integer in bytes.'
        });
      }
      chunkSize = parsedSize;
    }

    // 3. Define target chunk directory for this file
    const safeBaseName = path
      .basename(originalFileName, path.extname(originalFileName))
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const folderName = `vault_${Date.now()}_${safeBaseName}`;
    const targetChunkDir = path.join(CHUNKS_BASE_DIR, folderName);

    // 4. Call C++ Storage Engine
    const { chunkCount, outputDirectory, chunks, engineStdout } = await splitFileWithEngine(
      tempFilePath,
      targetChunkDir,
      chunkSize
    );

    // 5. Clean up temporary uploaded file after successful chunking
    if (fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath).catch((e) =>
        console.warn('[Upload] Temp file cleanup warning:', e.message)
      );
      tempFilePath = null;
    }

    // 6. Return comprehensive structured response
    return res.status(200).json({
      success: true,
      fileName: originalFileName,
      fileSize: fileSize,
      originalSize: fileSize,
      chunkSize: chunkSize,
      chunkCount: chunkCount,
      outputDirectory: outputDirectory || targetChunkDir,
      chunks: chunks.map((c) => ({
        index: c.index,
        fileName: c.fileName || c.name,
        name: c.name || c.fileName,
        size: c.size,
        path: c.path,
        status: c.status || 'Created'
      })),
      engineStdout: engineStdout
    });
  } catch (error) {
    console.error('[Upload Controller Error]:', error.message);

    // Always ensure temp file cleanup on failure
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath).catch(() => {});
    }

    let userMessage = 'Failed to process and chunk file with storage engine.';
    if (error.message.includes('executable not found') || error.message.includes('Storage engine could not be executed')) {
      userMessage = 'Storage engine could not be executed. Please verify that the C++ storage engine is built.';
    } else if (error.message.includes('Input file does not exist')) {
      userMessage = 'Uploaded temporary file could not be read.';
    }

    return res.status(500).json({
      success: false,
      message: userMessage,
      error: error.message
    });
  }
};

module.exports = {
  uploadFile
};

