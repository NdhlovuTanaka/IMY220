const express = require('express');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
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

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, type, languages, version, filesInfo } = req.body;

    // Validation
    if (!name || !description || !type) {
      return res.status(400).json({
        ok: false,
        message: 'Please provide name, description, and type'
      });
    }

    // Convert filesInfo to files array if provided
    let files = [];
    if (filesInfo && Array.isArray(filesInfo)) {
      files = filesInfo.map(fileInfo => ({
        name: fileInfo.name,
        size: fileInfo.size,
        path: `/${fileInfo.name}`,
        uploadedBy: req.user._id
      }));
    }

    // Create project
    const project = new Project({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
      type,
      languages: languages || [],
      version: version || '1.0.0',
      files: files
    });

    await project.save();

    // Create activity
    const activity = new Activity({
      type: 'create',
      user: req.user._id,
      project: project._id,
      message: `Created project "${name}"`
    });

    await activity.save();

    // Populate project with user details
    await project.populate('owner', 'name username email profileImage');
    await project.populate('members', 'name username email profileImage');

    res.status(201).json({
      ok: true,
      message: 'Project created successfully',
      project: project.toPublicJSON()
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error creating project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/projects
// @desc    Get all projects or user's projects
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, userId } = req.query;

    let query = {};

    if (type === 'my') {
      // Get projects where user is owner or member
      query = {
        $or: [
          { owner: req.user._id },
          { members: req.user._id }
        ]
      };
    } else if (userId) {
      query = {
        $or: [
          { owner: userId },
          { members: userId }
        ]
      };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name username email profileImage')
      .populate('members', 'name username email profileImage')
      .populate('checkedOutBy', 'name username')
      .sort({ lastUpdated: -1 });

    res.json({
      ok: true,
      projects: projects.map(p => p.toPublicJSON())
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error fetching projects'
    });
  }
});

// @route   GET /api/projects/:projectId
// @desc    Get single project
// @access  Private
router.get('/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'name username email profileImage')
      .populate('members', 'name username email profileImage')
      .populate('checkedOutBy', 'name username')
      .populate('files.uploadedBy', 'name username')
      .populate('checkIns.user', 'name username profileImage');

    if (!project) {
      return res.status(404).json({
        ok: false,
        message: 'Project not found'
      });
    }

    res.json({
      ok: true,
      project
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error fetching project'
    });
  }
});

// @route   PUT /api/projects/:projectId
// @desc    Update project
// @access  Private (Owner only)
router.put('/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        ok: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        ok: false,
        message: 'Only the project owner can update project details'
      });
    }

    const { name, description, type, languages, image } = req.body;

    if (name) project.name = name;
    if (description) project.description = description;
    if (type) project.type = type;
    if (languages) project.languages = languages;
    if (image) project.image = image;

    await project.save();

    // Create activity
    const activity = new Activity({
      type: 'update',
      user: req.user._id,
      project: project._id,
      message: `Updated project details`
    });

    await activity.save();

    await project.populate('owner', 'name username email profileImage');
    await project.populate('members', 'name username email profileImage');

    res.json({
      ok: true,
      message: 'Project updated successfully',
      project: project.toPublicJSON()
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error updating project'
    });
  }
});

// @route   DELETE /api/projects/:projectId
// @desc    Delete project
// @access  Private (Owner only)
router.delete('/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        ok: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        ok: false,
        message: 'Only the project owner can delete the project'
      });
    }

    // Delete all related activities
    await Activity.deleteMany({ project: project._id });

    await Project.findByIdAndDelete(req.params.projectId);

    res.json({
      ok: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error deleting project'
    });
  }
});

// @route   POST /api/projects/:projectId/checkout
// @desc    Check out project
// @access  Private (Members only)
router.post('/:projectId/checkout', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        ok: false,
        message: 'Project not found'
      });
    }

    // Check if user is a member
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({
        ok: false,
        message: 'Only project members can check out the project'
      });
    }

    // Check if already checked out
    if (project.status === 'checked-out') {
      return res.status(400).json({
        ok: false,
        message: 'Project is already checked out'
      });
    }

    project.status = 'checked-out';
    project.checkedOutBy = req.user._id;
    await project.save();

    // Create activity
    const activity = new Activity({
      type: 'check-out',
      user: req.user._id,
      project: project._id,
      message: `Checked out project`
    });

    await activity.save();

    await project.populate('owner', 'name username email profileImage');
    await project.populate('members', 'name username email profileImage');
    await project.populate('checkedOutBy', 'name username');

    res.json({
      ok: true,
      message: 'Project checked out successfully',
      project
    });

  } catch (error) {
    console.error('Checkout project error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error checking out project'
    });
  }
});

// @route   POST /api/projects/:projectId/checkin
// @desc    Check in project
// @access  Private (Member who checked it out)
router.post('/:projectId/checkin', authenticate, async (req, res) => {
  try {
    const { message, version, files } = req.body;

    if (!message) {
      return res.status(400).json({
        ok: false,
        message: 'Check-in message is required'
      });
    }

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        ok: false,
        message: 'Project not found'
      });
    }

    // Check if project is checked out
    if (project.status !== 'checked-out') {
      return res.status(400).json({
        ok: false,
        message: 'Project is not checked out'
      });
    }

    // Check if user is the one who checked it out
    if (project.checkedOutBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        ok: false,
        message: 'Only the user who checked out the project can check it back in'
      });
    }

    // Update project
    project.status = 'checked-in';
    project.checkedOutBy = null;
    if (version) project.version = version;
    if (files && files.length > 0) {
      project.files.push(...files);
    }

    // Add check-in to history
    project.checkIns.unshift({
      user: req.user._id,
      message,
      version: version || project.version,
      files: files || []
    });

    await project.save();

    // Create activity
    const activity = new Activity({
      type: 'check-in',
      user: req.user._id,
      project: project._id,
      message,
      version: version || project.version
    });

    await activity.save();

    await project.populate('owner', 'name username email profileImage');
    await project.populate('members', 'name username email profileImage');
    await project.populate('checkIns.user', 'name username profileImage');

    res.json({
      ok: true,
      message: 'Project checked in successfully',
      project
    });

  } catch (error) {
    console.error('Checkin project error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error checking in project'
    });
  }
});

// @route   POST /api/projects/:projectId/files
// @desc    Add files to project
// @access  Private (Members only)
router.post('/:projectId/files', authenticate, async (req, res) => {
  try {
    const { files } = req.body; // Array of {name, size, content}

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        ok: false,
        message: 'Project not found'
      });
    }

    // Check if user is a member
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({
        ok: false,
        message: 'Only project members can add files'
      });
    }

    // Add files
    if (files && Array.isArray(files)) {
      const newFiles = files.map(file => ({
        name: file.name,
        size: file.size,
        path: `/${file.name}`,
        uploadedBy: req.user._id
      }));

      project.files.push(...newFiles);
      await project.save();
    }

    await project.populate('files.uploadedBy', 'name username');

    res.json({
      ok: true,
      message: 'Files added successfully',
      project
    });

  } catch (error) {
    console.error('Add files error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error adding files'
    });
  }
});

// @route   POST /api/projects/:projectId/members
// @desc    Add member to project
// @access  Private (Owner and existing members can add friends)
router.post('/:projectId/members', authenticate, async (req, res) => {
  try {
    const { userId, role } = req.body; // role: 'member' or 'admin'

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: 'User ID is required'
      });
    }

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        ok: false,
        message: 'Project not found'
      });
    }

    // Check if current user is member or owner
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({
        ok: false,
        message: 'Only project owner and members can add new members'
      });
    }

    // Check if user to be added is a friend
    const currentUser = await User.findById(req.user._id);
    const isFriend = currentUser.friends.some(f => f.toString() === userId);

    if (!isFriend && !isOwner) {
      return res.status(403).json({
        ok: false,
        message: 'You can only add friends to the project'
      });
    }

    // Check if user is already a member
    if (project.members.some(m => m.toString() === userId)) {
      return res.status(400).json({
        ok: false,
        message: 'User is already a member of this project'
      });
    }

    // Add member
    project.members.push(userId);
    await project.save();

    // Create activity
    const newMember = await User.findById(userId);
    const activity = new Activity({
      type: 'update',
      user: req.user._id,
      project: project._id,
      message: `Added ${newMember.name} to the project`
    });
    await activity.save();

    await project.populate('owner', 'name username email profileImage');
    await project.populate('members', 'name username email profileImage');

    res.json({
      ok: true,
      message: 'Member added successfully',
      project
    });

  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error adding member'
    });
  }
});

// @route   DELETE /api/projects/:projectId/members/:memberId
// @desc    Remove member from project
// @access  Private (Owner only)
router.delete('/:projectId/members/:memberId', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        ok: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        ok: false,
        message: 'Only the project owner can remove members'
      });
    }

    // Cannot remove owner
    if (project.owner.toString() === req.params.memberId) {
      return res.status(400).json({
        ok: false,
        message: 'Cannot remove the project owner'
      });
    }

    // Remove member
    project.members = project.members.filter(m => m.toString() !== req.params.memberId);
    await project.save();

    const removedMember = await User.findById(req.params.memberId);
    const activity = new Activity({
      type: 'update',
      user: req.user._id,
      project: project._id,
      message: `Removed ${removedMember.name} from the project`
    });
    await activity.save();

    res.json({
      ok: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      ok: false,
      message: 'Error removing member'
    });
  }
});

module.exports = router;