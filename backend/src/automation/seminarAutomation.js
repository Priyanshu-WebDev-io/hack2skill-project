const Seminar = require('../models/Seminar');
const Participant = require('../models/Participant');
const AutomationLog = require('../models/AutomationLog');
const { sendZoomLinkEmail } = require('./mailer');
const { logAction } = require('./actionLogger');
const { buildWeeklySeminarSchedule, isEnrollmentOpen } = require('../utils/weekSchedule');
const {
  isZoomConfigured,
  getConfiguredDefaultZoomLink,
  isPlaceholderZoomLink,
  createZoomMeetingForSeminar
} = require('./zoomService');

const getAutoZoomLink = async (schedule, force = false) => {
  const fallbackLink = getConfiguredDefaultZoomLink();

  if (isZoomConfigured()) {
    try {
      const zoomMeeting = await createZoomMeetingForSeminar({
        topic: schedule.weekLabel,
        startTime: schedule.seminarDate,
        durationMinutes: Number(process.env.ZOOM_MEETING_DURATION_MINUTES || 90)
      });
      return zoomMeeting.joinUrl || fallbackLink;
    } catch (err) {
      // Re-throw so the caller can log it and fall back to no link,
      // but first try the DEFAULT_ZOOM_LINK if configured
      const zoomErr = err.response?.data || err.message;
      console.error('[Zoom] API error, falling back to DEFAULT_ZOOM_LINK:', zoomErr);
      if (fallbackLink) {
        console.log(`[Zoom] Using DEFAULT_ZOOM_LINK as fallback: ${fallbackLink}`);
        return fallbackLink;
      }
      throw err; // re-throw only if no fallback is available
    }
  }

  return fallbackLink || null;
};

const syncSeminarState = async (seminar, now = new Date()) => {
  const shouldBeOpen = isEnrollmentOpen(seminar, now);
  const shouldBeCompleted = now > seminar.date;

  if (seminar.registrationOpen !== shouldBeOpen || seminar.isCompleted !== shouldBeCompleted) {
    seminar.registrationOpen = shouldBeOpen;
    seminar.isCompleted = shouldBeCompleted;
    await seminar.save();
  }

  return seminar;
};

const ensureCurrentWeekSeminar = async (source = 'cron') => {
  const now = new Date();
  const schedule = buildWeeklySeminarSchedule(now);

  const existingSeminar = await Seminar.findOne({
    seminarYear: schedule.weekYear,
    weekNumber: schedule.weekNumber
  });

  if (existingSeminar) {
    const syncedSeminar = await syncSeminarState(existingSeminar, now);
    return {
      created: false,
      reason: 'current_week_exists',
      seminar: syncedSeminar
    };
  }

  let resolvedZoomLink = null;

  try {
    resolvedZoomLink = await getAutoZoomLink(schedule);
    if (!isPlaceholderZoomLink(resolvedZoomLink)) {
      await logAction(
        null,
        'zoom_meeting_created',
        'success',
        `Created zoom link for ${schedule.weekLabel}`
      );
    }
  } catch (error) {
    console.error(`[Zoom] Failed to create meeting for ${schedule.weekLabel}:`, error.response?.data || error.message);
    await logAction(
      null,
      'zoom_meeting_created',
      'failed',
      `Zoom meeting creation failed for ${schedule.weekLabel}: ${error.message}`
    );
    // Seminar will be created without a zoom link; repairPlaceholderSeminarLinks will retry
  }

  // Always create the seminar regardless of whether zoom succeeded.
  // The admin can update the zoom link manually, or the repair cycle will fix it.
  const newSeminar = await Seminar.create({
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
    }, now),
    isCompleted: false
  });

  await logAction(
    null,
    'seminar_created',
    'success',
    `Auto-created ${schedule.weekLabel} via ${source}`,
    { seminarId: newSeminar._id }
  );

  return {
    created: true,
    reason: 'seminar_created',
    seminar: newSeminar
  };
};

const repairPlaceholderSeminarLinks = async () => {
  const now = new Date();
  const upcomingSeminars = await Seminar.find({
    isCompleted: false,
    date: { $gte: now }
  });

  let repairedCount = 0;

  for (const seminar of upcomingSeminars) {
    if (!isPlaceholderZoomLink(seminar.zoomLink)) {
      continue;
    }

    const schedule = {
      weekLabel: seminar.weekLabel || seminar.title,
      seminarDate: seminar.date
    };

    try {
      const repairedLink = await getAutoZoomLink(schedule, true);
      if (isPlaceholderZoomLink(repairedLink)) {
        continue;
      }

      seminar.zoomLink = repairedLink;
      await seminar.save();
      repairedCount += 1;

      await logAction(
        null,
        'zoom_meeting_created',
        'success',
        `Repaired placeholder zoom link for ${seminar.weekLabel || seminar.title}`,
        { seminarId: seminar._id }
      );
    } catch (error) {
      await logAction(
        null,
        'zoom_meeting_created',
        'failed',
        `Failed to repair zoom link for ${seminar.weekLabel || seminar.title}: ${error.message}`,
        { seminarId: seminar._id }
      );
    }
  }

  return repairedCount;
};

const processPendingEmails = async () => {
  const now = new Date();
  const upcomingSeminars = await Seminar.find({
    isCompleted: false,
    date: { $gte: now }
  });

  let emailsSent = 0;
  let emailsSkipped = 0;

  for (const seminar of upcomingSeminars) {
    await syncSeminarState(seminar, now);
    const participants = await Participant.find({ seminarId: seminar._id });

    for (const participant of participants) {
      const existingLog = await AutomationLog.findOne({
        participantId: participant._id,
        seminarId: seminar._id,
        actionType: 'email_sent',
        status: 'success'
      });

      if (existingLog) {
        emailsSkipped += 1;
        continue;
      }

      const sent = await sendZoomLinkEmail(participant, seminar);
      if (sent) {
        emailsSent += 1;
      }
    }
  }

  return {
    emailsSent,
    emailsSkipped,
    seminarsChecked: upcomingSeminars.length
  };
};

const runAutomationCycle = async (source = 'cron') => {
  const seminarResult = await ensureCurrentWeekSeminar(source);

  await Seminar.updateMany(
    { date: { $lt: new Date() }, isCompleted: false },
    { $set: { isCompleted: true, registrationOpen: false } }
  );

  await Seminar.updateMany(
    { registrationEndDate: { $lt: new Date() }, registrationOpen: true },
    { $set: { registrationOpen: false } }
  );

  const repairedLinks = await repairPlaceholderSeminarLinks();

  const emailResult = await processPendingEmails();

  await logAction(
    null,
    'automation_run',
    'success',
    `Automation run via ${source}. Seminar created: ${seminarResult.created}. Repaired links: ${repairedLinks}. Emails sent: ${emailResult.emailsSent}`,
    { seminarId: seminarResult.seminar?._id || null }
  );

  return {
    seminar: {
      created: seminarResult.created,
      reason: seminarResult.reason,
      id: seminarResult.seminar?._id || null,
      weekNumber: seminarResult.seminar?.weekNumber || null,
      title: seminarResult.seminar?.title || null
    },
    repairedZoomLinks: repairedLinks,
    emails: emailResult
  };
};

module.exports = {
  ensureCurrentWeekSeminar,
  processPendingEmails,
  runAutomationCycle
};
