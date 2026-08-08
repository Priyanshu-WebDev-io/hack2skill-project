const express = require('express');
const router = express.Router();
const participantController = require('../controllers/ParticipantController');

router.post('/register', participantController.registerParticipant);
router.post('/:id/attendance', participantController.markAttendance);
router.get('/', participantController.getParticipants);

module.exports = router;
