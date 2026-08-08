const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const app = express();

// Security: Set secure HTTP headers
app.use(helmet());

// Efficiency: Compress payload responses
app.use(compression());

// Security: Prevent DDoS and API Spam
// Tell Express to trust the Vercel reverse proxy so rate limiting uses the real client IP
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use(express.json());

// Security: Restrict CORS
const allowedOrigins = [
  'http://localhost:3000', 
  'http://127.0.0.1:3000', 
  'https://hack2skill-seminar-autopilot.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
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

// Code Quality: Global Error Handler
app.use(errorHandler);

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
    
    // Only bind to port and run local cron if not on Vercel Serverless
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        initCronJobs();
        runAutomationCycle('startup').catch(err => {
          console.error('[Startup] Automation cycle failed:', err);
        });
      });
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  });

// Export app for Vercel Serverless deployment
module.exports = app;
