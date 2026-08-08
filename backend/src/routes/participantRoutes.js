const express = require('express');
const router = express.Router();
const participantController = require('../controllers/ParticipantController');
const certificateController = require('../controllers/CertificateController');

router.post('/register', participantController.registerParticipant);
router.post('/:id/attendance', participantController.markAttendance);
router.get('/', participantController.getParticipants);
router.get('/:id/certificate', certificateController.generateCertificate);

module.exports = router;
