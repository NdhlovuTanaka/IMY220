require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create indexes for better query performance
    console.log('📋 Creating indexes...');
    
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    console.log('✅ User indexes created');

    await Project.collection.createIndex({ owner: 1 });
    await Project.collection.createIndex({ members: 1 });
    await Project.collection.createIndex({ lastUpdated: -1 });
    console.log('✅ Project indexes created');

    await Activity.collection.createIndex({ timestamp: -1 });
    await Activity.collection.createIndex({ user: 1, timestamp: -1 });
    await Activity.collection.createIndex({ project: 1, timestamp: -1 });
    console.log('✅ Activity indexes created');

    // Check if test user exists
    const testUser = await User.findOne({ email: 'test@test.com' });
    
    if (!testUser) {
      console.log('👤 Creating test user...');
      const newTestUser = new User({
        email: 'test@test.com',
        username: 'testuser',
        password: 'test1234',
        name: 'Test User',
        bio: 'This is a test account for development and demo purposes',
        location: 'Pretoria, South Africa',
        website: 'https://github.com/testuser',
        work: 'Software Developer at TestCorp',
        profileCompleted: true
      });
      await newTestUser.save();
      console.log('✅ Test user created');
      
      // Create a sample project for test user
      console.log('📁 Creating sample project...');
      const sampleProject = new Project({
        name: 'Sample React App',
        description: 'A sample React application for testing the LetzCode platform',
        owner: newTestUser._id,
        members: [newTestUser._id],
        type: 'Web Application',
        languages: ['JavaScript', 'React', 'CSS'],
        version: '1.0.0',
        status: 'checked-in',
        files: [
          {
            name: 'App.js',
            size: '2.5 KB',
            path: '/src/App.js',
            uploadedBy: newTestUser._id
          },
          {
            name: 'index.html',
            size: '1.2 KB',
            path: '/public/index.html',
            uploadedBy: newTestUser._id
          }
        ]
      });
      await sampleProject.save();
      console.log('✅ Sample project created');

      // Create sample activity
      console.log('📊 Creating sample activity...');
      const sampleActivity = new Activity({
        type: 'create',
        user: newTestUser._id,
        project: sampleProject._id,
        message: 'Created project "Sample React App"'
      });
      await sampleActivity.save();
      console.log('✅ Sample activity created');
    } else {
      console.log('ℹ️  Test user already exists');
    }

    // Display collection stats
    console.log('\n📊 Database Statistics:');
    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    const activityCount = await Activity.countDocuments();
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Activities: ${activityCount}`);

    console.log('\n✨ Database initialization complete!');
    console.log('\n📝 Test Account Credentials:');
    console.log('   Email: test@test.com');
    console.log('   Password: test1234');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

initializeDatabase();