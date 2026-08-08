const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  },
  actionType: {
    type: String,
    enum: ['email_sent', 'pdf_downloaded'],
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

module.exports = mongoose.model('AutomationLog', automationLogSchema);
