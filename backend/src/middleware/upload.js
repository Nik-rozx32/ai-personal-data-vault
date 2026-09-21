const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure temporary upload directory exists
const tempUploadDir = path.resolve(__dirname, '../../temp');
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique temporary filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedExt = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '');
    cb(null, `upload-${uniqueSuffix}${sanitizedExt}`);
  }
});

// Multer Upload Instance
const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200 MB maximum upload limit
  }
});

module.exports = {
  upload,
  tempUploadDir
};
