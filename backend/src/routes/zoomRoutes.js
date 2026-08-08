const express = require('express');
const router = express.Router();
const ZoomWebhookController = require('../controllers/ZoomWebhookController');

// Define webhook endpoint for Zoom events
router.post('/webhook', ZoomWebhookController.handleWebhook);

module.exports = router;
