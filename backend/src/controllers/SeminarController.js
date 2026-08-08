const Seminar = require('../models/Seminar');
const { buildWeeklySeminarSchedule, isEnrollmentOpen } = require('../utils/weekSchedule');
const {
  isZoomConfigured,
  getConfiguredDefaultZoomLink,
  isPlaceholderZoomLink,
  createZoomMeetingForSeminar
} = require('../automation/zoomService');
const { logAction } = require('../automation/actionLogger');

exports.createSeminar = async (req, res) => {
  try {
    const { date, zoomLink } = req.body;
    const baseDate = date ? new Date(date) : new Date();

    if (Number.isNaN(baseDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date provided.' });
    }

    const schedule = buildWeeklySeminarSchedule(baseDate);
    const existingSeminar = await Seminar.findOne({
      seminarYear: schedule.weekYear,
      weekNumber: schedule.weekNumber
    });

    if (existingSeminar) {
      return res.status(409).json({
        success: false,
        message: `${schedule.weekLabel} already exists.`,
        data: existingSeminar
      });
    }

    const requestedZoomLink = String(zoomLink || '').trim();
    let resolvedZoomLink = requestedZoomLink || getConfiguredDefaultZoomLink();

    if (!requestedZoomLink && isZoomConfigured()) {
      try {
        const zoomMeeting = await createZoomMeetingForSeminar({
          topic: schedule.weekLabel,
          startTime: schedule.seminarDate,
          durationMinutes: Number(process.env.ZOOM_MEETING_DURATION_MINUTES || 90)
        });

        resolvedZoomLink = zoomMeeting.joinUrl || resolvedZoomLink;

        await logAction(
          null,
          'zoom_meeting_created',
          'success',
          `Created Zoom meeting ${zoomMeeting.id} for ${schedule.weekLabel}`
        );
      } catch (zoomError) {
        return res.status(502).json({
          success: false,
          message: `Unable to auto-create Zoom meeting: ${zoomError.message}`
        });
      }
    }

    if (isPlaceholderZoomLink(resolvedZoomLink)) {
      if (!isZoomConfigured()) {
        return res.status(400).json({
          success: false,
          message: 'Zoom credentials are missing. Configure Zoom or provide a valid zoomLink.'
        });
      }

      try {
        const zoomMeeting = await createZoomMeetingForSeminar({
          topic: schedule.weekLabel,
          startTime: schedule.seminarDate,
          durationMinutes: Number(process.env.ZOOM_MEETING_DURATION_MINUTES || 90)
        });

        resolvedZoomLink = zoomMeeting.joinUrl || null;

        await logAction(
          null,
          'zoom_meeting_created',
          'success',
          `Created Zoom meeting ${zoomMeeting.id} for ${schedule.weekLabel}`
        );
      } catch (zoomError) {
        await logAction(
          null,
          'zoom_meeting_created',
          'failed',
          `Zoom meeting creation failed for ${schedule.weekLabel}: ${zoomError.message}`
        );

        return res.status(502).json({
          success: false,
          message: `Unable to auto-create Zoom meeting: ${zoomError.message}`
        });
      }
    }

    const seminar = await Seminar.create({
      title: schedule.weekLabel,
      weekLabel: schedule.weekLabel,
      weekNumber: schedule.weekNumber,
      seminarYear: schedule.weekYear,
      date: schedule.seminarDate,
      registrationStartDate: schedule.registrationStartDate,
      registrationEndDate: schedule.registrationEndDate,
      zoomLink: resolvedZoomLink,
      registrationOpen: isEnrollmentOpen({
        registrationStartDate: schedule.registrationStartDate,
        registrationEndDate: schedule.registrationEndDate,
        isCompleted: false,
        registrationOpen: true
      }),
      isCompleted: false
    });

    res.status(201).json({ success: true, data: seminar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSeminars = async (req, res) => {
  try {
    const seminars = await Seminar.find().sort({ seminarYear: 1, weekNumber: 1 });
    res.status(200).json({ success: true, data: seminars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const seminar = await Seminar.findByIdAndUpdate(
      id,
      { isCompleted: true, registrationOpen: false },
      { new: true }
    );
    res.status(200).json({ success: true, data: seminar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
