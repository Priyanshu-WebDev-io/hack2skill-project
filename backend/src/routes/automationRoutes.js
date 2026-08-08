const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/DashboardController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/logs', requireAuth, requireAdmin, dashboardController.getLogs);
router.get('/status', requireAuth, requireAdmin, dashboardController.getAutomationStatus);
router.post('/run', requireAuth, requireAdmin, dashboardController.runAutomationNow);

// Vercel Cron (Secured by CRON_SECRET)
router.get('/cron', dashboardController.vercelCron);

module.exports = router;
