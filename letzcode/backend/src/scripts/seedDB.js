require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

const users = [
  {
    email: 'john.doe@example.com',
    username: 'johndoe',
    password: 'password123',
    name: 'John Doe',
    bio: 'Full-stack developer passionate about React and Node.js',
    location: 'Johannesburg, South Africa',
    work: 'Senior Developer at TechCorp',
    profileCompleted: true
  },
  {
    email: 'jane.smith@example.com',
    username: 'janesmith',
    password: 'password123',
    name: 'Jane Smith',
    bio: 'Frontend developer specializing in React and Vue.js',
    location: 'Cape Town, South Africa',
    work: 'Lead Developer at WebSolutions',
    profileCompleted: true
  },
  {
    email: 'mike.johnson@example.com',
    username: 'mikejohnson',
    password: 'password123',
    name: 'Mike Johnson',
    bio: 'Backend engineer with expertise in Python and MongoDB',
    location: 'Durban, South Africa',
    work: 'Backend Engineer at DataFlow',
    profileCompleted: true
  },
  {
    email: 'sarah.williams@example.com',
    username: 'sarahwilliams',
    password: 'password123',
    name: 'Sarah Williams',
    bio: 'UI/UX designer and frontend developer',
    location: 'Pretoria, South Africa',
    work: 'Design Lead at CreativeHub',
    profileCompleted: true
  },
  {
    email: 'david.brown@example.com',
    username: 'davidbrown',
    password: 'password123',
    name: 'David Brown',
    bio: 'DevOps engineer and cloud architect',
    location: 'Port Elizabeth, South Africa',
    work: 'DevOps Engineer at CloudTech',
    profileCompleted: true
  }
];

const projectTemplates = [
  {
    name: 'E-Commerce Platform',
    description: 'Full-featured e-commerce platform with cart, checkout, and payment integration',
    type: 'Web Application',
    languages: ['JavaScript', 'React', 'Node.js', 'MongoDB']
  },
  {
    name: 'Task Management System',
    description: 'Collaborative task management tool with real-time updates',
    type: 'Web Application',
    languages: ['TypeScript', 'React', 'Express', 'PostgreSQL']
  },
  {
    name: 'Mobile Fitness Tracker',
    description: 'Cross-platform mobile app for tracking fitness activities',
    type: 'Mobile Application',
    languages: ['React Native', 'JavaScript', 'Firebase']
  },
  {
    name: 'Data Visualization Dashboard',
    description: 'Interactive dashboard for visualizing complex datasets',
    type: 'Web Application',
    languages: ['Python', 'Flask', 'D3.js', 'React']
  },
  {
    name: 'Chat Application',
    description: 'Real-time chat application with video call support',
    type: 'Web Application',
    languages: ['JavaScript', 'Socket.io', 'WebRTC', 'Node.js']
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data (except test user)
    console.log('🗑️  Clearing existing seed data...');
    await User.deleteMany({ email: { $ne: 'test@test.com' } });
    await Project.deleteMany({});
    await Activity.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ ${createdUsers.length} users created`);

    // Create projects
    console.log('📁 Creating projects...');
    const projects = [];
    
    for (let i = 0; i < projectTemplates.length; i++) {
      const template = projectTemplates[i];
      const owner = createdUsers[i % createdUsers.length];
      const memberCount = Math.floor(Math.random() * 3) + 1; // 1-3 members
      const members = [owner._id];
      
      // Add random members
      for (let j = 0; j < memberCount; j++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        if (!members.includes(randomUser._id)) {
          members.push(randomUser._id);
        }
      }

      const project = new Project({
        ...template,
        owner: owner._id,
        members: members,
        version: '1.0.0',
        status: Math.random() > 0.7 ? 'checked-out' : 'checked-in',
        checkedOutBy: Math.random() > 0.7 ? members[0] : null,
        files: [
          {
            name: 'README.md',
            size: '3.2 KB',
            path: '/README.md',
            uploadedBy: owner._id
          },
          {
            name: 'package.json',
            size: '1.5 KB',
            path: '/package.json',
            uploadedBy: owner._id
          }
        ]
      });

      await project.save();
      projects.push(project);

      // Create activity for project creation
      const activity = new Activity({
        type: 'create',
        user: owner._id,
        project: project._id,
        message: `Created project "${template.name}"`
      });
      await activity.save();

      // Create 2-5 random check-ins for each project
      const checkInCount = Math.floor(Math.random() * 4) + 2;
      for (let k = 0; k < checkInCount; k++) {
        const randomMember = members[Math.floor(Math.random() * members.length)];
        const checkInActivity = new Activity({
          type: 'check-in',
          user: randomMember,
          project: project._id,
          message: [
            'Fixed critical bug in authentication',
            'Added new feature for user dashboard',
            'Improved performance and optimization',
            'Updated dependencies and security patches',
            'Refactored code for better maintainability'
          ][k % 5],
          version: `1.${k}.0`
        });
        await checkInActivity.save();
      }
    }

    console.log(`✅ ${projects.length} projects created`);

    // Create friend connections
    console.log('🤝 Creating friend connections...');
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const friendCount = Math.floor(Math.random() * 3) + 1;
      const friends = [];
      
      for (let j = 0; j < friendCount; j++) {
        const randomFriend = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        if (randomFriend._id.toString() !== user._id.toString() && !friends.includes(randomFriend._id)) {
          friends.push(randomFriend._id);
        }
      }
      
      user.friends = friends;
      await user.save();
    }
    console.log('✅ Friend connections created');

    // Display stats
    console.log('\n📊 Database Statistics:');
    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    const activityCount = await Activity.countDocuments();
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Activities: ${activityCount}`);

    console.log('\n✨ Database seeding complete!');
    console.log('\n📝 Sample User Credentials (all have password: password123):');
    createdUsers.forEach(user => {
      console.log(`   ${user.email}`);
    });

  } catch (error) {
    console.error('❌ Database seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

seedDatabase();