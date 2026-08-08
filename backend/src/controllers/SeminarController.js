const Seminar = require('../models/Seminar');

exports.createSeminar = async (req, res) => {
  try {
    const { title, weekNumber, date, zoomLink } = req.body;
    const seminar = await Seminar.create({ title, weekNumber, date, zoomLink });
    res.status(201).json({ success: true, data: seminar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSeminars = async (req, res) => {
  try {
    const seminars = await Seminar.find().sort({ weekNumber: 1 });
    res.status(200).json({ success: true, data: seminars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const seminar = await Seminar.findByIdAndUpdate(
      id,
      { isCompleted: true, registrationOpen: false },
      { new: true }
    );
    res.status(200).json({ success: true, data: seminar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
