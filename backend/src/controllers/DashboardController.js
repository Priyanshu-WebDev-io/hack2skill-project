const AutomationLog = require('../models/AutomationLog');

exports.getLogs = async (req, res) => {
  try {
    const logs = await AutomationLog.find()
      .populate('participantId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
