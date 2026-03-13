const Job = require('../models/Job');
const fs = require('fs');

// In-memory fallback
const memoryDB = {
  jobs: [],
  idCounter: 1
};
global.memoryDBBackend = memoryDB;

// @desc    Create new Job (Step 1)
// @route   POST /api/jobs
// @access  Private (Shop Staff +)
exports.createJob = async (req, res) => {
  try {
    const files = req.files;
    const { customerName, customerPhone } = req.body;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const fileMeta = files.map(file => ({
      _id: 'file_' + Date.now() + Math.random().toString(36).substr(2, 5),
      originalName: file.originalname,
      storagePath: file.path, 
      sizeKB: Math.round(file.size / 1024),
      mimeType: file.mimetype,
      isProcessed: false
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
        createdAt: new Date().toISOString()
      };
      memoryDB.jobs.push(newJob);
      return res.status(201).json(newJob);
    }

    const job = await Job.create({
      shopId: req.shopId,
      customerName: customerName || 'Walk-in Customer',
      customerPhone,
      files: fileMeta,
      status: 'Draft',
      currentStep: 2, // Move to settings step
      assignedStaff: req.user._id
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
      const shopJobs = memoryDB.jobs.filter(j => j.shopId === req.shopId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      const jobIdx = memoryDB.jobs.findIndex(j => j._id === req.params.id && j.shopId === req.shopId);
      if (jobIdx === -1) return res.status(404).json({ message: 'Job not found' });
      
      memoryDB.jobs[jobIdx].status = req.body.status || memoryDB.jobs[jobIdx].status;
      memoryDB.jobs[jobIdx].currentStep = req.body.step || memoryDB.jobs[jobIdx].currentStep;
      return res.json(memoryDB.jobs[jobIdx]);
    }

    const job = await Job.findOne({ _id: req.params.id, shopId: req.shopId });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.status = req.body.status || job.status;
    job.currentStep = req.body.step || job.currentStep;
    
    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
