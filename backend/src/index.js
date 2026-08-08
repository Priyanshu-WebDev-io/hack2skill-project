const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import routes
const seminarRoutes = require('./routes/seminarRoutes');
const participantRoutes = require('./routes/participantRoutes');
const automationRoutes = require('./routes/automationRoutes');

// Import Automation Cron
const { initCronJobs } = require('./automation/cronJobs');

// Mount routes
app.use('/api/seminars', seminarRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/automation', automationRoutes);

// Connect to DB and Start Server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hack2skill_project';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    
    // Initialize the Automation Engine
    initCronJobs();

    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  });
