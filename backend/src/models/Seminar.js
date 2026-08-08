const mongoose = require('mongoose');

const seminarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  weekLabel: {
    type: String,
    required: true,
    trim: true
  },
  weekNumber: {
    type: Number,
    required: true
  },
  seminarYear: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
  },
  registrationStartDate: {
    type: Date,
    required: true,
  },
  registrationEndDate: {
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

seminarSchema.index({ seminarYear: 1, weekNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seminar', seminarSchema);
