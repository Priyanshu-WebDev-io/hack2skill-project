const AutomationLog = require('../models/AutomationLog');

const logAction = async (
  participantId,
  actionType,
  status = 'success',
  details = '',
  extra = {}
) => {
  try {
    await AutomationLog.create({
      participantId,
      seminarId: extra.seminarId || null,
      actionType,
      status,
      details
    });
    console.log(`[ActionLogger] Logged ${actionType} - ${status}`);
  } catch (error) {
    console.error('[ActionLogger] Failed to log action:', error);
  }
};

module.exports = { logAction };
