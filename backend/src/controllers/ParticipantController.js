const Participant = require('../models/Participant');
const Seminar = require('../models/Seminar');

exports.registerParticipant = async (req, res) => {
  try {
    const { name, email, mobileNumber, seminarId, amount } = req.body;
    
    // In MVP, we just assign them a success payment for simplicity 
    // unless they specifically want razorpay. Let's just create the lead.
    
    if (!seminarId) {
      return res.status(400).json({ success: false, message: 'Seminar ID is required' });
    }

    const seminar = await Seminar.findById(seminarId);
    if (!seminar || !seminar.registrationOpen) {
      return res.status(400).json({ success: false, message: 'Seminar not found or registration is closed' });
    }

    const participant = await Participant.create({
      name,
      email,
      mobileNumber,
      seminarId,
      paymentStatus: 'success', // Auto success for MVP
    });

    res.status(201).json({ success: true, data: participant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const participant = await Participant.findByIdAndUpdate(
      id,
      { attendanceStatus: 'attended' },
      { new: true }
    );
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }
    res.status(200).json({ success: true, data: participant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getParticipants = async (req, res) => {
  try {
    const { seminarId } = req.query;
    const query = seminarId ? { seminarId } : {};
    const participants = await Participant.find(query).populate('seminarId', 'title date');
    res.status(200).json({ success: true, data: participants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
