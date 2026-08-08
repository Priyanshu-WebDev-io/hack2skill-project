const AutomationLog = require('../models/AutomationLog');
const Seminar = require('../models/Seminar');
const { runAutomationCycle } = require('../automation/seminarAutomation');

exports.getLogs = async (req, res) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page)   || 1);
    const pageSize  = Math.min(100, parseInt(req.query.limit) || 25);
    const skip      = (page - 1) * pageSize;
    const search    = (req.query.search || '').trim();
    const status    = req.query.status || '';   // 'success' | 'failed' | ''

    // Build filter
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      const Participant = require('../models/Participant');
      const participants = await Participant.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const participantIds = participants.map(p => p._id);

      filter.$or = [
        { actionType: { $regex: search, $options: 'i' } },
        { details:    { $regex: search, $options: 'i' } },
      ];
      
      if (participantIds.length > 0) {
        filter.$or.push({ participantId: { $in: participantIds } });
      }
    }

    const [logs, total] = await Promise.all([
      AutomationLog.find(filter)
        .populate('participantId', 'name email')
        .populate('seminarId', 'title weekNumber date')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      AutomationLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
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

exports.vercelCron = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ success: false, message: 'Unauthorized Vercel Cron' });
    }

    const result = await runAutomationCycle('vercel_cron');

    res.status(200).json({
      success: true,
      message: 'Vercel Cron automation cycle completed.',
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
