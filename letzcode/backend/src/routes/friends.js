const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');


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

// @route   POST /api/friends/request
// @desc    Send friend request
// @access  Private
router.post('/request', authenticate, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: 'User ID is required'
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        ok: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    if (req.user.friends.includes(userId)) {
      return res.status(400).json({
        ok: false,
        message: 'You are already friends with this user'
      });
    }

    if (targetUser.friendRequests.includes(req.user._id)) {
      return res.status(400).json({
        ok: false,
        message: 'Friend request already sent'
      });
    }

    if (req.user.friendRequests.includes(userId)) {
      return res.status(400).json({
        ok: false,
        message: 'This user has already sent you a friend request. Accept it instead.'
      });
    }

    targetUser.friendRequests.push(req.user._id);
    await targetUser.save();

    // Create notification
    await Notification.create({
      recipient: targetUser._id,
      sender: req.user._id,
      type: 'friend-request',
      message: `${req.user.name} sent you a friend request`,
      link: `/profile/${req.user._id}`
    });

    res.json({
      ok: true,
      message: 'Friend request sent successfully'
    });

  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error sending friend request'
    });
  }
});

// @route   POST /api/friends/accept
// @desc    Accept friend request
// @access  Private
router.post('/accept', authenticate, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: 'User ID is required'
      });
    }

    if (!req.user.friendRequests.includes(userId)) {
      return res.status(400).json({
        ok: false,
        message: 'No friend request from this user'
      });
    }

    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    req.user.friends.push(userId);
    req.user.friendRequests = req.user.friendRequests.filter(
      id => id.toString() !== userId
    );
    
    otherUser.friends.push(req.user._id);

    await req.user.save();
    await otherUser.save();

    // Create notification for the user who sent the request
    await Notification.create({
      recipient: otherUser._id,
      sender: req.user._id,
      type: 'friend-accept',
      message: `${req.user.name} accepted your friend request`,
      link: `/profile/${req.user._id}`
    });

    res.json({
      ok: true,
      message: 'Friend request accepted',
      friend: {
        id: otherUser._id,
        name: otherUser.name,
        username: otherUser.username,
        email: otherUser.email,
        profileImage: otherUser.profileImage
      }
    });

  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error accepting friend request'
    });
  }
});

// @route   POST /api/friends/reject
// @desc    Reject friend request
// @access  Private
router.post('/reject', authenticate, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: 'User ID is required'
      });
    }

    // Remove friend request
    req.user.friendRequests = req.user.friendRequests.filter(
      id => id.toString() !== userId
    );
    
    await req.user.save();

    res.json({
      ok: true,
      message: 'Friend request rejected'
    });

  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error rejecting friend request'
    });
  }
});

// @route   DELETE /api/friends/:friendId
// @desc    Remove friend
// @access  Private
router.delete('/:friendId', authenticate, async (req, res) => {
  try {
    const { friendId } = req.params;

    if (!req.user.friends.includes(friendId)) {
      return res.status(400).json({
        ok: false,
        message: 'This user is not your friend'
      });
    }

    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    // Remove from both users' friend lists
    req.user.friends = req.user.friends.filter(
      id => id.toString() !== friendId
    );
    
    friend.friends = friend.friends.filter(
      id => id.toString() !== req.user._id.toString()
    );

    await req.user.save();
    await friend.save();

    res.json({
      ok: true,
      message: 'Friend removed successfully'
    });

  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error removing friend'
    });
  }
});

// @route   GET /api/friends
// @desc    Get user's friends list
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name username email profileImage work location')
      .populate('friendRequests', 'name username email profileImage');

    // Find users who have pending requests from current user
    const sentRequests = await User.find({
      friendRequests: req.user._id
    }).select('name username email profileImage work location');

    res.json({
      ok: true,
      friends: user.friends,
      friendRequests: user.friendRequests,
      sentRequests: sentRequests
    });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error fetching friends'
    });
  }
});

// @route   GET /api/friends/search
// @desc    Search for users
// @access  Private
router.get('/search', authenticate, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        ok: true,
        users: []
      });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name username email profileImage work location friends friendRequests')
    .limit(20);

    // Add friend status for each user
    const usersWithStatus = users.map(user => {
      let friendStatus = 'none';
      
      if (req.user.friends.includes(user._id)) {
        friendStatus = 'friends';
      } else if (req.user.friendRequests.includes(user._id)) {
        friendStatus = 'incoming';
      } else if (user.friendRequests.includes(req.user._id)) {
        friendStatus = 'outgoing';
      }

      return {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        work: user.work,
        location: user.location,
        friendStatus
      };
    });

    res.json({
      ok: true,
      users: usersWithStatus
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error searching users'
    });
  }
});

router.get('/:friendId/mutual', authenticate, async (req, res) => {
  try {
    const { friendId } = req.params;

    const friend = await User.findById(friendId)
      .populate('friends', 'name username email profileImage work location')
      .select('friends');

    if (!friend) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(req.user._id)
      .populate('friends', 'name username email profileImage work location');

    // Find mutual friends
    const mutualFriends = currentUser.friends.filter(currentFriend =>
      friend.friends.some(friendsFriend =>
        friendsFriend._id.toString() === currentFriend._id.toString()
      )
    );

    // Find mutual projects
    const currentUserProjects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'name username')
    .populate('members', 'name username');

    const friendProjects = await Project.find({
      $or: [
        { owner: friendId },
        { members: friendId }
      ]
    });

    const mutualProjects = currentUserProjects.filter(currentProject =>
      friendProjects.some(friendProject =>
        friendProject._id.toString() === currentProject._id.toString()
      )
    );

    res.json({
      ok: true,
      mutualFriends,
      mutualProjects: mutualProjects.map(p => p.toPublicJSON())
    });

  } catch (error) {
    console.error('Get mutual data error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error fetching mutual data'
    });
  }
});

// @route   POST /api/friends/cancel
// @desc    Cancel sent friend request
// @access  Private
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: 'User ID is required'
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    // Remove friend request from target user
    targetUser.friendRequests = targetUser.friendRequests.filter(
      id => id.toString() !== req.user._id.toString()
    );
    
    await targetUser.save();

    res.json({
      ok: true,
      message: 'Friend request cancelled'
    });

  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error cancelling friend request'
    });
  }
});

module.exports = router;