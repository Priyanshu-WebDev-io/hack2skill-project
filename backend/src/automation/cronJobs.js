const cron = require('node-cron');
const { runAutomationCycle } = require('./seminarAutomation');

const initCronJobs = () => {
  const cronSchedule = process.env.AUTOMATION_CRON_SCHEDULE || '* * * * *';

  cron.schedule(cronSchedule, async () => {
    console.log('[Cron] Running scheduled automation check...');
    try {
      const result = await runAutomationCycle('cron');
      console.log('[Cron] Automation cycle summary:', result);
    } catch (error) {
      console.error('[Cron] Error running automation job:', error);
    }
  });
  
  console.log(`[Cron] Automation jobs initialized. Schedule: ${cronSchedule}`);
};

module.exports = { initCronJobs };
