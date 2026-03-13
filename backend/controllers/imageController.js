const sharp = require('sharp');
const Job = require('../models/Job');

// Helper to convert units to pixels at given DPI
const convertToPx = (value, unit, dpi = 300) => {
  switch (unit) {
    case 'in': return Math.round(value * dpi);
    case 'cm': return Math.round((value / 2.54) * dpi);
    case 'mm': return Math.round((value / 25.4) * dpi);
    case 'px':
    default: return Math.round(value);
  }
};

// @desc    Process Image using Sharp (resize, compress, convert)
// @route   POST /api/jobs/:id/process-image
// @access  Private
exports.processImage = async (req, res) => {
  const { fileId, preset } = req.body;

  try {
    let job, fileMeta;

    if (!global.isDbConnected || !global.isDbConnected()) {
      // In-memory fallback: find job via global store set by jobController
      if (global.memoryDBBackend) {
        job = global.memoryDBBackend.jobs.find(
          j => j._id === req.params.id && j.shopId === req.shopId
        );
        if (job) fileMeta = job.files.find(f => f._id === fileId);
      }
    } else {
      job = await Job.findOne({ _id: req.params.id, shopId: req.shopId });
      if (job) fileMeta = job.files.id(fileId);
    }

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (!fileMeta) return res.status(404).json({ message: 'File not found in job' });

    // ──────────────────────────────────────────────────────────
    // Vercel-compatible: files are in memory (req.file.buffer),
    // NOT on disk. We read the buffer stored in fileMeta.buffer.
    // ──────────────────────────────────────────────────────────
    const inputBuffer = fileMeta.buffer;
    if (!inputBuffer) {
      return res.status(400).json({ message: 'File buffer not available. Re-upload the file.' });
    }

    const widthPx = preset.width ? convertToPx(preset.width, preset.unit, preset.dpi) : null;
    const heightPx = preset.height ? convertToPx(preset.height, preset.unit, preset.dpi) : null;

    let sharpInstance = sharp(inputBuffer);

    if (widthPx || heightPx) {
      sharpInstance = sharpInstance.resize({
        width: widthPx || undefined,
        height: heightPx || undefined,
        fit: preset.resizeMode === 'cropAndResize' ? sharp.fit.cover :
             preset.resizeMode === 'autoFit' ? sharp.fit.contain :
             sharp.fit.fill,
        background: preset.backgroundColor || { r: 255, g: 255, b: 255, alpha: 1 },
      });
    }

    const fmt = (preset.imageFormat || 'jpeg').toLowerCase();
    const quality = preset.quality || 80;

    if (fmt === 'jpg' || fmt === 'jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality, force: true });
    } else if (fmt === 'webp') {
      sharpInstance = sharpInstance.webp({ quality, force: true });
    } else if (fmt === 'png') {
      sharpInstance = sharpInstance.png({ force: true });
    }

    if (preset.dpi) {
      sharpInstance = sharpInstance.withMetadata({ density: preset.dpi });
    }

    // Output to buffer — return as base64 dataURL for the frontend to use
    const processedBuffer = await sharpInstance.toBuffer();
    const mimeType = (fmt === 'png') ? 'image/png' : (fmt === 'webp' ? 'image/webp' : 'image/jpeg');
    const dataUrl = `data:${mimeType};base64,${processedBuffer.toString('base64')}`;

    // Update in-memory record
    fileMeta.isProcessed = true;
    if (!global.isDbConnected || !global.isDbConnected()) {
      // already updated by reference
    } else {
      await job.save();
    }

    res.json({
      message: 'Image processed successfully',
      dataUrl,
      file: { ...fileMeta, buffer: undefined }, // don't send buffer back
    });

  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ message: 'Error processing image', error: error.message });
  }
};
