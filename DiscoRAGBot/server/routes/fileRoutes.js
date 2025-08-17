const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileService = require('../services/fileService');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// Add logging middleware for all requests to this router
router.use((req, res, next) => {
  console.log(`File routes - ${req.method} ${req.originalUrl} - User: ${req.user ? req.user._id : 'Not authenticated'}`);
  console.log('Request Content-Type:', req.get('Content-Type'));
  console.log('Request Content-Length:', req.get('Content-Length'));
  next();
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination callback called');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    console.log('Multer filename callback called for file:', file.originalname);
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('Multer fileFilter called for file:', file.originalname);
  // Check file type
  const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.md'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    console.log('File type allowed:', ext);
    cb(null, true);
  } else {
    console.log('File type not allowed:', ext);
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and MD files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 // Reduced to 1MB to work with proxy constraints
  }
});

// Add error handling for multer
const handleMulterError = (err, req, res, next) => {
  console.error('Multer error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 1MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// GET /api/files - Get all files for authenticated user
router.get('/', requireUser, async (req, res) => {
  try {
    console.log(`GET /api/files - User: ${req.user._id}`);
    const files = await FileService.getByUserId(req.user._id);

    // Transform files to match frontend expectations
    const transformedFiles = files.map(file => ({
      _id: file._id,
      name: file.originalName,
      size: file.size,
      uploadDate: file.uploadDate,
      status: file.status,
      type: file.type
    }));

    res.json({ files: transformedFiles });
  } catch (error) {
    console.error('Error in GET /api/files:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/files/upload - Upload a new file
router.post('/upload', (req, res, next) => {
  console.log('POST /api/files/upload - ROUTE HIT!');
  console.log('Request headers:', req.headers);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Content-Length:', req.get('Content-Length'));
  console.log('Request body (before multer):', req.body);
  next();
}, requireUser, (req, res, next) => {
  console.log('POST /api/files/upload - After auth middleware');
  console.log('User authenticated:', req.user ? req.user._id : 'No user');
  next();
}, upload.single('file'), handleMulterError, async (req, res) => {
  try {
    console.log(`POST /api/files/upload - Processing upload for user: ${req.user._id}`);
    console.log('Request body (after multer):', req.body);
    console.log('Request file (after multer):', req.file);

    if (!req.file) {
      console.log('No file in request after multer processing');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File uploaded successfully:', req.file.originalname, 'Size:', req.file.size);

    const file = await FileService.create(req.file, req.user._id);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileId: file._id
    });
  } catch (error) {
    console.error('Error in POST /api/files/upload:', error);

    // Clean up uploaded file if database save failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/files/:id - Delete a file
router.delete('/:id', requireUser, async (req, res) => {
  try {
    console.log(`DELETE /api/files/${req.params.id} - User: ${req.user._id}`);

    await FileService.delete(req.params.id, req.user._id);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/files/:id:', error);

    if (error.message === 'File not found') {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
});

module.exports = router;