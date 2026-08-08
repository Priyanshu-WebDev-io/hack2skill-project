const express = require('express');
const router = express.Router();
const participantController = require('../controllers/ParticipantController');
const certificateController = require('../controllers/CertificateController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// Public
router.post('/register', participantController.registerParticipant);

// Admin Only
router.post('/:id/attendance', requireAuth, requireAdmin, participantController.markAttendance);

// Authenticated User & Admin
router.get('/', requireAuth, participantController.getParticipants);

// Authenticated User
router.get('/:id/certificate', requireAuth, certificateController.generateCertificate);

module.exports = router;
