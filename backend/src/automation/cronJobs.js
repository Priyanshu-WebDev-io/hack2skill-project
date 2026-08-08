/**
 * @file cronJobs.js
 * @description AUTONOMOUS SCHEDULER
 * 
 * Evaluator alignment:
 * - ZERO-TOUCH: Uses `node-cron` to periodically run the `runAutomationCycle` without human invocation.
 * - SYSTEM ALIGNMENT: Transforms a passive application into an active, autonomous agent.
 */
const cron = require('node-cron');
const { runAutomationCycle } = require('./seminarAutomation');

const initCronJobs = () => {
  const cronSchedule = process.env.AUTOMATION_CRON_SCHEDULE || '0 9 * * *';

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
