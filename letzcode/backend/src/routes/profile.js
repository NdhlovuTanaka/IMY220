const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
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
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Invalid or expired token'
    });
  }
};

// @route   GET /api/profile/:userId
// @desc    Get user profile by ID
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('friends', 'name username profileImage');

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    res.json({
      ok: true,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error fetching profile'
    });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', authenticate, async (req, res) => {
  try {
    const { name, bio, location, website, birthday, work } = req.body;

    // Validate data
    if (bio && bio.length > 500) {
      return res.status(400).json({
        ok: false,
        message: 'Bio cannot exceed 500 characters'
      });
    }

    // Update user
    const user = req.user;
    
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (birthday !== undefined) user.birthday = birthday;
    if (work !== undefined) user.work = work;
    
    // Mark profile as completed
    user.profileCompleted = true;

    await user.save();

    res.json({
      ok: true,
      message: 'Profile updated successfully',
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error updating profile'
    });
  }
});

// @route   DELETE /api/profile
// @desc    Delete user account
// @access  Private
router.delete('/', authenticate, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.json({
      ok: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error deleting account'
    });
  }
});

module.exports = router;