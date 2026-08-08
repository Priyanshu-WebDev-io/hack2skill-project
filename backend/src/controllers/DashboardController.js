const AutomationLog = require('../models/AutomationLog');
const Seminar = require('../models/Seminar');
const { runAutomationCycle } = require('../automation/seminarAutomation');

exports.getLogs = async (req, res) => {
  try {
    const logs = await AutomationLog.find()
      .populate('participantId', 'name email')
      .populate('seminarId', 'title weekNumber date')
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAutomationStatus = async (req, res) => {
  try {
    const now = new Date();
    const activeSeminar = await Seminar.findOne({
      isCompleted: false,
      registrationStartDate: { $lte: now },
      registrationEndDate: { $gte: now }
    }).sort({ seminarYear: -1, weekNumber: -1 });

    const recentRuns = await AutomationLog.find({ actionType: 'automation_run' })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        activeSeminar,
        schedule: process.env.AUTOMATION_CRON_SCHEDULE || '* * * * *',
        recentRuns
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.runAutomationNow = async (req, res) => {
  try {
    const result = await runAutomationCycle('manual');

    res.status(200).json({
      success: true,
      message: 'Automation cycle completed.',
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
