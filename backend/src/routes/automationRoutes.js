const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/DashboardController');

router.get('/logs', dashboardController.getLogs);

module.exports = router;
