const AutomationLog = require('../models/AutomationLog');

const logAction = async (participantId, actionType, status = 'success', details = '') => {
  try {
    await AutomationLog.create({
      participantId,
      actionType,
      status,
      details
    });
    console.log(`[ActionLogger] Logged ${actionType} for participant ${participantId} - ${status}`);
  } catch (error) {
    console.error('[ActionLogger] Failed to log action:', error);
  }
};

module.exports = { logAction };
