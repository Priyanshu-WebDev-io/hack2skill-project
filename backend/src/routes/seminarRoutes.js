const express = require('express');
const router = express.Router();
const seminarController = require('../controllers/SeminarController');

router.post('/', seminarController.createSeminar);
router.get('/', seminarController.getSeminars);
router.post('/:id/complete', seminarController.markCompleted);

module.exports = router;
