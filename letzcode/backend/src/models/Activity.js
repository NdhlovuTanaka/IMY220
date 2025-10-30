const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['check-in', 'check-out', 'create', 'update', 'delete'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  version: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
activitySchema.index({ timestamp: -1 });
activitySchema.index({ user: 1, timestamp: -1 });
activitySchema.index({ project: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);