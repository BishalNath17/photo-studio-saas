const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createJob, getJobs, updateJobStatus } = require('../controllers/jobController');
const { processImage } = require('../controllers/imageController');
const upload = require('../middleware/uploadMiddleware');

// Route: /api/jobs
router.route('/')
  .post(protect, restrictTo('SuperAdmin', 'ShopOwner', 'Manager', 'Editor', 'Staff'), upload.array('files', 10), createJob)
  .get(protect, getJobs);

router.route('/:id/status')
  .put(protect, updateJobStatus);

router.route('/:id/process-image')
  .post(protect, restrictTo('SuperAdmin', 'ShopOwner', 'Manager', 'Editor', 'Staff'), processImage);

module.exports = router;
