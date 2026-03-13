const express = require('express');
const router = express.Router();
const { registerShop, login, googleLogin, getGoogleUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerShop);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/google-users', protect, getGoogleUsers);

module.exports = router;
