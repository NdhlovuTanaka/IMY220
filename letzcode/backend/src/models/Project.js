const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const checkInSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true
  },
  files: [fileSchema],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  languages: [{
    type: String,
    trim: true
  }],
  type: {
    type: String,
    required: true,
    enum: ['Web Application', 'Mobile Application', 'Desktop Application', 'Library', 'Framework', 'API', 'Game', 'Other']
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  status: {
    type: String,
    enum: ['checked-in', 'checked-out'],
    default: 'checked-in'
  },
  checkedOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  image: {
    type: String,
    default: '/placeholder.svg'
  },
  files: [fileSchema],
  checkIns: [checkInSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastUpdated on save
projectSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Method to get public project info
projectSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    owner: this.owner,
    members: this.members,
    languages: this.languages,
    type: this.type,
    version: this.version,
    status: this.status,
    checkedOutBy: this.checkedOutBy,
    image: this.image,
    filesCount: this.files.length,
    checkInsCount: this.checkIns.length,
    createdAt: this.createdAt,
    lastUpdated: this.lastUpdated
  };
};

module.exports = mongoose.model('Project', projectSchema);