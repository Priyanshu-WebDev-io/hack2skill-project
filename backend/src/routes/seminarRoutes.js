const express = require('express');
const router = express.Router();
const seminarController = require('../controllers/SeminarController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// Public route (used by frontend landing page)
router.get('/', seminarController.getSeminars);

// Admin-only routes
router.post('/', requireAuth, requireAdmin, seminarController.createSeminar);
router.delete('/:id', requireAuth, requireAdmin, seminarController.deleteSeminar);
router.post('/:id/complete', requireAuth, requireAdmin, seminarController.markCompleted);

module.exports = router;
