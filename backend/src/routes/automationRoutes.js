const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/DashboardController');

router.get('/logs', dashboardController.getLogs);
router.get('/status', dashboardController.getAutomationStatus);
router.post('/run', dashboardController.runAutomationNow);

module.exports = router;
