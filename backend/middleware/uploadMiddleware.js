const multer = require('multer');
const path = require('path');

// ──────────────────────────────────────────────
// Use memory storage — Vercel serverless functions
// have a read-only filesystem. Files are stored in
// memory as buffers and must be processed there.
// ──────────────────────────────────────────────
const storage = multer.memoryStorage();

const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png|webp|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Images only (jpg, jpeg, png, webp) or PDF!'));
};

const upload = multer({
  storage, // memory — works on Vercel
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB (Vercel limit is 4MB request, but for safety)
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

module.exports = upload;
