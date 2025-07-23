const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Signup route
router.post('/signup', authController.signup);

// Login route
router.post('/login', authController.login);

// Logout route
router.post('/logout', authController.logout);

// /me route
router.get('/me', authMiddleware, authController.me);

module.exports = router; 