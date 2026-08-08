const nodemailer = require('nodemailer');
const { logAction } = require('./actionLogger');

// Configure your SMTP transporter here
// For MVP demo purposes, we will use a test Ethereal account if real credentials are not set
let transporter;

async function initTransporter() {
  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const port = Number(process.env.SMTP_PORT) || 587;
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: port === 465, // True for 465, false for 587/25
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      return;
    }

    // Generate test account for local testing
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('[Mailer] Using Ethereal test account');
  } catch (error) {
    transporter = null;
    console.error('[Mailer] Failed to initialize transporter:', error.message);
  }
}

const sendZoomLinkEmail = async (participant, seminar) => {
  try {
    if (!transporter) await initTransporter();

    const mailOptions = {
      from: '"Seminar Autopilot" <noreply@seminar.com>',
      to: participant.email,
      subject: `Your Zoom Link for ${seminar.title}`,
      text: `Hi ${participant.name},\n\nYour seminar "${seminar.title}" is starting soon.\nJoin here: ${seminar.zoomLink}\n\nSee you there!`,
      html: `<p>Hi ${participant.name},</p><p>Your seminar "<b>${seminar.title}</b>" is starting soon.</p><p>Join here: <a href="${seminar.zoomLink}">${seminar.zoomLink}</a></p><p>See you there!</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Message sent to ${participant.email}: %s`, info.messageId);
    
    // Log the successful action
    await logAction(
      participant._id,
      'email_sent',
      'success',
      `Sent zoom link for ${seminar.title}`,
      { seminarId: seminar._id }
    );
    return true;
  } catch (error) {
    console.error('[Mailer] Error sending email:', error);
    await logAction(participant._id, 'email_sent', 'failed', error.message, {
      seminarId: seminar?._id || null
    });
    return false;
  }
};

const sendWeeklyFollowUpEmail = async (participant, seminar) => {
  try {
    if (!transporter) await initTransporter();

    const seminarName = seminar.weekLabel || seminar.title;
    const joinHref = seminar.zoomLink || '#';
    const mailOptions = {
      from: '"Seminar Autopilot" <noreply@seminar.com>',
      to: participant.email,
      subject: `Reminder: ${seminarName} is happening this week`,
      text: `Hi ${participant.name},\n\nThis is your daily reminder for ${seminarName}.\nSeminar date: ${new Date(seminar.date).toDateString()}\nJoin here: ${seminar.zoomLink || 'Link will be shared soon'}\n\nSee you there!`,
      html: `<p>Hi ${participant.name},</p><p>This is your daily reminder for <b>${seminarName}</b>.</p><p>Seminar date: <b>${new Date(seminar.date).toDateString()}</b></p><p>Join here: <a href="${joinHref}">${seminar.zoomLink || 'Link will be shared soon'}</a></p><p>See you there!</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Follow-up email sent to ${participant.email}: %s`, info.messageId);

    await logAction(
      participant._id,
      'followup_email_sent',
      'success',
      `Sent daily follow-up for ${seminarName}`,
      { seminarId: seminar._id }
    );

    return true;
  } catch (error) {
    console.error('[Mailer] Error sending follow-up email:', error);
    await logAction(participant._id, 'followup_email_sent', 'failed', error.message, {
      seminarId: seminar?._id || null
    });
    return false;
  }
};

const sendOtpEmail = async (user, otpCode) => {
  try {
    if (!transporter) await initTransporter();

    const mailOptions = {
      from: '"Seminar Autopilot" <noreply@seminar.com>',
      to: user.email,
      subject: `Your Verification Code: ${otpCode}`,
      text: `Hi ${user.name},\n\nYour 6-digit verification code is: ${otpCode}\nThis code will expire in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4F46E5;">Email Verification</h2>
          <p>Hi ${user.name},</p>
          <p>Please use the following 6-digit code to verify your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">${otpCode}</span>
          </div>
          <p style="color: #666; font-size: 12px;">This code will expire in 10 minutes.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] OTP email sent to ${user.email}: %s`, info.messageId);
    return true;
  } catch (error) {
    console.error('[Mailer] Error sending OTP email:', error);
    return false;
  }
};

module.exports = { sendZoomLinkEmail, sendWeeklyFollowUpEmail, sendOtpEmail };
