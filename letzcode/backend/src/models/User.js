const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  name: {
    type: String,
    trim: true,
    default: function() {
      return this.email.split('@')[0];
    }
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  bio: {
    type: String,
    default: '',
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  location: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  birthday: {
    type: Date
  },
  work: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: '/placeholder.svg'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (excluding password)
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    username: this.username,
    bio: this.bio,
    location: this.location,
    website: this.website,
    birthday: this.birthday,
    work: this.work,
    profileImage: this.profileImage,
    role: this.role,
    profileCompleted: this.profileCompleted,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);