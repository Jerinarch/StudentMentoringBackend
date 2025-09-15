const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('../config');

const { router: authRoutes } = require('../routes/auth');
const meetingRoutes = require('../routes/meetings');
const feedbackRoutes = require('../routes/feedback');
const studentRoutes = require('../routes/student');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// lightweight request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

let isConnected = false;
async function connectToDatabase() {
  if (isConnected) return;
  await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  isConnected = true;
}

app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    res.status(500).json({ message: 'Database connection error' });
  }
});

// Simple health and root endpoints for diagnostics
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Student Mentoring API running', connectedToDb: isConnected });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', db: isConnected ? 'connected' : 'disconnected', time: new Date().toISOString() });
});

// Config probe (safe values only)
app.get('/config', (req, res) => {
  res.status(200).json({
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Mount without /api because Vercel prefixes it
app.use('/auth', authRoutes);
app.use('/meetings', meetingRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/student', studentRoutes);

module.exports = app;


