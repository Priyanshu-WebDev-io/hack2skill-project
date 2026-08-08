const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: false,
    default: null
  },
  seminarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seminar',
    required: false,
    default: null
  },
  actionType: {
    type: String,
    enum: ['email_sent', 'pdf_downloaded', 'seminar_created', 'automation_run', 'zoom_meeting_created'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  details: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

automationLogSchema.index({ participantId: 1, seminarId: 1, actionType: 1, status: 1 });

module.exports = mongoose.model('AutomationLog', automationLogSchema);
