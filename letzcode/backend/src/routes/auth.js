const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({
        ok: false,
        message: 'Please provide email, username, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        ok: false,
        message: 'Username must be at least 3 characters long'
      });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        ok: false,
        message: 'Username can only contain letters, numbers, and underscores'
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        ok: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({
          ok: false,
          message: 'An account with this email already exists. Please sign in instead.'
        });
      } else {
        return res.status(400).json({
          ok: false,
          message: 'This username is already taken. Please choose another one.'
        });
      }
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      profileCompleted: false
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      ok: true,
      message: 'Account created successfully! Please complete your profile.',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        ok: false,
        message: `This ${field} is already taken`
      });
    }
    
    res.status(500).json({
      ok: false,
      message: 'Server error during registration. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ... rest of the signin and /me routes remain the same
// @route   POST /api/auth/signin
// @desc    Login user
// @access  Public
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Please provide both email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'No account found with this email. Please sign up first.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        ok: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      ok: true,
      message: 'Login successful! Welcome back!',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      ok: false,
      message: 'Server error during login. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        ok: false,
        message: 'No authentication token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'User account not found'
      });
    }

    res.json({
      ok: true,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Get user error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        ok: false,
        message: 'Invalid authentication token. Please sign in again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        ok: false,
        message: 'Your session has expired. Please sign in again.'
      });
    }
    
    res.status(401).json({
      ok: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;