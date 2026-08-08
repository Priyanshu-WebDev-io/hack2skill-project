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
const authRoutes = require('./routes/authRoutes');
const zoomRoutes = require('./routes/zoomRoutes');
const seedAdmin = require('./seedAdmin');

// Import Automation Cron
const { initCronJobs } = require('./automation/cronJobs');
const { runAutomationCycle } = require('./automation/seminarAutomation');

// Mount routes
app.use('/api/seminars', seminarRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/zoom', zoomRoutes);

// Connect to DB and Start Server
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const Seminar = require('./models/Seminar');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    Seminar.syncIndexes().catch(err => {
      console.error('Failed to sync seminar indexes:', err);
    });
    seedAdmin(); // Run seed after DB connects
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      initCronJobs();
      runAutomationCycle('startup').catch(err => {
        console.error('[Startup] Automation cycle failed:', err);
      });
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
