require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const projectRoutes = require('./routes/projects');
const activityRoutes = require('./routes/activity');
const friendRoutes = require('./routes/friends');
const notificationRoutes = require('./routes/notifications');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/notifications', notificationRoutes);

const publicDir = path.join(__dirname, "..", "..", "frontend", "public");
app.use(express.static(publicDir));

app.get("*", (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.join(publicDir, "index.html"));
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
});