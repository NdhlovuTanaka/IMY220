const express = require('express');
const jwt = require('jsonwebtoken');
const Activity = require('../models/Activity');
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

// @route   GET /api/activity
// @desc    Get activity feed (local or global)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { type = 'local', sort = 'date', limit = 50 } = req.query;

    let query = {};

    if (type === 'local') {
      // Get activity from user's friends
      const user = await User.findById(req.user._id).populate('friends');
      const friendIds = user.friends.map(f => f._id);
      friendIds.push(req.user._id); // Include own activity
      
      query = { user: { $in: friendIds } };
    }
    // For global, query remains empty to get all activity

    let sortOption = { timestamp: -1 }; // Default: newest first

    if (sort === 'popularity') {
      // You could add a popularity field to activities based on downloads, etc.
      sortOption = { timestamp: -1 }; // For now, still sort by date
    }

    const activities = await Activity.find(query)
      .populate('user', 'name username email profileImage')
      .populate({
        path: 'project',
        select: 'name description image languages type status owner',
        populate: {
          path: 'owner',
          select: 'name username'
        }
      })
      .sort(sortOption)
      .limit(parseInt(limit));

    res.json({
      ok: true,
      activities
    });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error fetching activity feed'
    });
  }
});

module.exports = router;