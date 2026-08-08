const nodemailer = require('nodemailer');
const { logAction } = require('./actionLogger');

// Configure your SMTP transporter here
// For MVP demo purposes, we will use a test Ethereal account if real credentials are not set
let transporter;

async function initTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
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
  }
}

initTransporter();

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
    await logAction(participant._id, 'email_sent', 'success', `Sent zoom link for ${seminar.title}`);
    return true;
  } catch (error) {
    console.error('[Mailer] Error sending email:', error);
    await logAction(participant._id, 'email_sent', 'failed', error.message);
    return false;
  }
};

module.exports = { sendZoomLinkEmail };
