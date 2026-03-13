const Job = require('../models/Job');

// Shared in-memory store — exposed as global so imageController can access it
const memoryDB = { jobs: [], idCounter: 1 };
global.memoryDBBackend = memoryDB;

// @desc    Create new Job
// @route   POST /api/jobs
// @access  Private
exports.createJob = async (req, res) => {
  try {
    const files = req.files;
    const { customerName, customerPhone } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // ──────────────────────────────────────────────────────────
    // Vercel: multer uses memoryStorage, so files come as buffers.
    // Store the buffer in fileMeta for later Sharp processing.
    // ──────────────────────────────────────────────────────────
    const fileMeta = files.map(file => ({
      _id: 'file_' + Date.now() + Math.random().toString(36).substr(2, 5),
      originalName: file.originalname,
      sizeKB: Math.round(file.size / 1024),
      mimeType: file.mimetype,
      buffer: file.buffer, // memory buffer — used by imageController
      isProcessed: false,
    }));

    if (!global.isDbConnected || !global.isDbConnected()) {
      const newJob = {
        _id: 'job_' + memoryDB.idCounter++,
        shopId: req.shopId,
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        files: fileMeta,
        status: 'Draft',
        currentStep: 2,
        assignedStaff: req.user._id,
        createdAt: new Date().toISOString(),
      };
      memoryDB.jobs.push(newJob);
      // Return without buffer in response
      return res.status(201).json({ ...newJob, files: fileMeta.map(f => ({ ...f, buffer: undefined })) });
    }

    const job = await Job.create({
      shopId: req.shopId,
      customerName: customerName || 'Walk-in Customer',
      customerPhone,
      files: fileMeta.map(f => ({ ...f, buffer: undefined })), // don't store buffer in MongoDB
      status: 'Draft',
      currentStep: 2,
      assignedStaff: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all jobs for a shop
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res) => {
  try {
    if (!global.isDbConnected || !global.isDbConnected()) {
      const shopJobs = memoryDB.jobs
        .filter(j => j.shopId === req.shopId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(j => ({ ...j, files: j.files.map(f => ({ ...f, buffer: undefined })) }));
      return res.json(shopJobs);
    }

    const jobs = await Job.find({ shopId: req.shopId })
      .populate('assignedStaff', 'name')
      .sort('-createdAt');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update Job Status
// @route   PUT /api/jobs/:id/status
// @access  Private
exports.updateJobStatus = async (req, res) => {
  try {
    if (!global.isDbConnected || !global.isDbConnected()) {
      const jobIdx = memoryDB.jobs.findIndex(
        j => j._id === req.params.id && j.shopId === req.shopId
      );
      if (jobIdx === -1) return res.status(404).json({ message: 'Job not found' });

      if (req.body.status) memoryDB.jobs[jobIdx].status = req.body.status;
      if (req.body.step) memoryDB.jobs[jobIdx].currentStep = req.body.step;
      return res.json({ ...memoryDB.jobs[jobIdx], files: memoryDB.jobs[jobIdx].files.map(f => ({ ...f, buffer: undefined })) });
    }

    const job = await Job.findOne({ _id: req.params.id, shopId: req.shopId });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (req.body.status) job.status = req.body.status;
    if (req.body.step) job.currentStep = req.body.step;
    const updated = await job.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
