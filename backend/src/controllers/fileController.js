const fs = require('fs');
const Document = require('../models/Document');
const { recordActivity } = require('../services/activityService');
const { extractText } = require('../services/documentExtractionService');

/**
 * @desc    Get all files/documents for the authenticated user
 * @route   GET /api/files
 * @access  Private (JWT required)
 */
const listFiles = async (req, res) => {
  try {
    const userId = req.user._id;
    const documents = await Document.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const formattedFiles = documents.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      source: doc.source,
      sourceDocumentId: doc.sourceDocumentId,
      url: doc.url,
      createdAt: doc.createdAt,
      sourceModifiedAt: doc.sourceModifiedAt || doc.updatedAt
    }));

    return res.status(200).json({ files: formattedFiles });
  } catch (error) {
    console.error('[File Controller - listFiles Error]:', error);
    return res.status(500).json({ message: 'Server error retrieving files' });
  }
};

/**
 * @desc    Upload a file and store document metadata in MongoDB
 * @route   POST /api/files/upload, POST /api/files/chunk
 * @access  Private (JWT required)
 */
const uploadFile = async (req, res) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file selected. Please select a file to upload.'
      });
    }

    const userId = req.user._id;
    tempFilePath = req.file.path;
    const originalFileName = req.file.originalname;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype || 'application/octet-stream';

    // Attempt text extraction for searchable text/PDF files
    let content = '';
    let textExtracted = false;
    try {
      const fileBuffer = await fs.promises.readFile(tempFilePath);
      content = await extractText(fileBuffer, mimeType);
      textExtracted = Boolean(content && content.trim().length > 0);
    } catch (extractErr) {
      console.warn('[File Controller] Text extraction skipped:', extractErr.message);
    }

    // Save document metadata in MongoDB
    const document = await Document.create({
      userId,
      source: 'local',
      sourceDocumentId: req.file.filename || `${Date.now()}_${originalFileName}`,
      name: originalFileName,
      mimeType,
      sizeBytes: fileSize,
      content: content || '',
      textExtracted,
      sourceCreatedAt: new Date(),
      sourceModifiedAt: new Date()
    });

    // Clean up temporary staging file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath).catch((e) =>
        console.warn('[Upload] Temp file cleanup warning:', e.message)
      );
      tempFilePath = null;
    }

    // Record activity in MongoDB
    recordActivity({
      userId,
      action: 'FILE_UPLOADED',
      source: 'local',
      resourceId: document._id.toString(),
      resourceName: originalFileName,
      status: 'SUCCESS',
      metadata: {
        fileSize,
        mimeType,
        textExtracted
      }
    });

    return res.status(200).json({
      success: true,
      message: 'File successfully uploaded and stored in vault',
      fileName: originalFileName,
      fileSize: fileSize,
      document: {
        id: document._id,
        name: document.name,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        source: document.source,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('[Upload Controller Error]:', error.message);

    if (tempFilePath && fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath).catch(() => {});
    }

    if (req.user) {
      recordActivity({
        userId: req.user._id,
        action: 'FILE_UPLOADED',
        source: 'local',
        resourceName: req.file?.originalname || 'unknown',
        status: 'FAILURE',
        metadata: { error: error.message }
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to process and store file',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a document owned by the user
 * @route   DELETE /api/files/:id
 * @access  Private (JWT required)
 */
const deleteFile = async (req, res) => {
  try {
    const userId = req.user._id;
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' });
    }

    recordActivity({
      userId,
      action: 'DOCUMENT_DELETED',
      source: document.source,
      resourceId: document._id.toString(),
      resourceName: document.name
    });

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('[File Controller - deleteFile Error]:', error);
    return res.status(500).json({ message: 'Server error deleting document' });
  }
};

module.exports = {
  listFiles,
  uploadFile,
  deleteFile
};
