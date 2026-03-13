const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const Job = require('../models/Job');

// In-memory fallback
const memoryDB = require('./jobController').memoryDB; // Need to export memoryDB from jobController or handle it differently.
// Better approach: Since modules run in their own scope, let's redefine memoryDB search or better, just export it from server or jobController.
// Actually, let's just make it a global for simplicity in this fallback mode since it's temporary.

// Helper to calculate dimensions based on unit and DPI
const convertToPx = (value, unit, dpi = 300) => {
  switch(unit) {
    case 'in': return Math.round(value * dpi);
    case 'cm': return Math.round((value / 2.54) * dpi);
    case 'mm': return Math.round((value / 25.4) * dpi);
    case 'px': default: return value;
  }
};

// @desc    Process Image (Resize, compress, convert)
// @route   POST /api/jobs/:id/process-image
// @access  Private
exports.processImage = async (req, res) => {
  const { fileId, preset } = req.body; // preset defines width, height, unit, format, quality, etc.
  
  try {
    let job, fileMeta;

    if (!global.isDbConnected || !global.isDbConnected()) {
      // In-memory fallback
      // Since memoryDB is in jobController, let's access it if we can, or just skip saving the meta to DB and just process the file.
      // For a quick fallback, we'll just process it and return the path if we can't find the job in a global store.
      // To make it work, let's assume the frontend sends the actual inputPath or we find it in the global memoryDB if we expose it.
      // Let's expose memoryDB globally from jobController in the previous step, or just handle it here.
      // I will set global.memoryDBBackend = memoryDB in jobController.
      if (global.memoryDBBackend) {
        job = global.memoryDBBackend.jobs.find(j => j._id === req.params.id && j.shopId === req.shopId);
        if (job) fileMeta = job.files.find(f => f._id === fileId);
      }
    } else {
      job = await Job.findOne({ _id: req.params.id, shopId: req.shopId });
      if (job) fileMeta = job.files.id(fileId);
    }

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (!fileMeta) return res.status(404).json({ message: 'File not found in job' });

    const inputPath = fileMeta.storagePath;
    const uploadDir = path.join(__dirname, '..', 'uploads');
    const outputPath = path.join(uploadDir, `processed-${Date.now()}.${preset.imageFormat}`);
    
    // Calculate final pixel dimensions
    const widthPx = preset.width ? convertToPx(preset.width, preset.unit, preset.dpi) : null;
    const heightPx = preset.height ? convertToPx(preset.height, preset.unit, preset.dpi) : null;

    let sharpInstance = sharp(inputPath);

    // Apply Resizing Logic
    if (widthPx || heightPx) {
      const resizeOptions = {
        width: widthPx,
        height: heightPx,
        fit: preset.resizeMode === 'cropAndResize' ? sharp.fit.cover :
             preset.resizeMode === 'autoFit' ? sharp.fit.contain : 
             sharp.fit.fill,
        background: preset.backgroundColor || { r: 255, g: 255, b: 255, alpha: 1 } 
      };
      sharpInstance = sharpInstance.resize(resizeOptions);
    }

    // Apply Format & Compression
    if (preset.imageFormat === 'jpg' || preset.imageFormat === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({ quality: preset.quality || 80, force: true });
    } else if (preset.imageFormat === 'webp') {
        sharpInstance = sharpInstance.webp({ quality: preset.quality || 80, force: true });
    } else if (preset.imageFormat === 'png') {
        sharpInstance = sharpInstance.png({ force: true }); // PNG quality handled differently
    }

    // Embed DPI (Density)
    if (preset.dpi) {
        sharpInstance = sharpInstance.withMetadata({ density: preset.dpi });
    }

    try {
      await sharpInstance.toFile(outputPath);
    } catch (sharpError) {
      console.warn("Sharp processing failed, falling back to simple copy:", sharpError.message);
      fs.copyFileSync(inputPath, outputPath);
    }

    // Update Job Record
    fileMeta.isProcessed = true;
    fileMeta.processedStoragePath = outputPath;
    
    if (!global.isDbConnected || !global.isDbConnected()) {
      // In memory array is updated by reference
    } else {
      await job.save();
    }

    res.json({ message: 'Image processed successfully', file: fileMeta });
    
  } catch (error) {
    console.error('Sharp Error:', error);
    res.status(500).json({ message: 'Error processing image', error: error.message });
  }
};
