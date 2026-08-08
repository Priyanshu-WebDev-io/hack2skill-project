const cron = require('node-cron');
const Seminar = require('../models/Seminar');
const Participant = require('../models/Participant');
const AutomationLog = require('../models/AutomationLog');
const { sendZoomLinkEmail } = require('./mailer');

// Run every hour for the MVP, but you can set it to '* * * * *' (every minute) for demo testing
const initCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    console.log('[Cron] Running scheduled automation check...');
    try {
      // Find upcoming active seminars
      const upcomingSeminars = await Seminar.find({ isCompleted: false });
      
      for (const seminar of upcomingSeminars) {
        // Find participants for this seminar who are not yet processed for email
        const participants = await Participant.find({ seminarId: seminar._id });
        
        for (const participant of participants) {
          // Check if we already sent the zoom link to this participant
          const existingLog = await AutomationLog.findOne({
            participantId: participant._id,
            actionType: 'email_sent'
          });

          if (!existingLog) {
            console.log(`[Cron] New participant detected: ${participant.email}. Sending email...`);
            await sendZoomLinkEmail(participant, seminar);
          }
        }
      }
    } catch (error) {
      console.error('[Cron] Error running automation job:', error);
    }
  });
  
  console.log('[Cron] Automation jobs initialized.');
};

module.exports = { initCronJobs };
