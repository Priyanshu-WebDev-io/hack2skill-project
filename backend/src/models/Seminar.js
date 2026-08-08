const mongoose = require('mongoose');

const seminarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  weekNumber: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
  },
  zoomLink: {
    type: String,
    default: '',
    trim: true
  },
  registrationOpen: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Seminar', seminarSchema);
