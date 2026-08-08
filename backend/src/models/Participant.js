const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  seminarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seminar',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  mobileNumber: {
    type: String,
    trim: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  attendanceStatus: {
    type: String,
    enum: ['not_joined', 'attended'],
    default: 'not_joined',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Participant', participantSchema);
