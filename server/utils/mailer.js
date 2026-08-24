const nodemailer = require('nodemailer');

const emailUser = () => String(process.env.EMAIL_USER || '').trim();
const emailPass = () => String(process.env.EMAIL_PASS || '').replace(/\s/g, '');

const hasGmailConfig = () => Boolean(emailUser() && emailPass());

const createTransport = () =>
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser(),
      pass: emailPass(),
    },
  });

const sendMail = async ({ to, subject, text, html }) => {
  if (!hasGmailConfig()) {
    const error = new Error(
      'Gmail SMTP is not configured on the server. Set EMAIL_USER and EMAIL_PASS in server/.env, then restart the API.'
    );
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"EduTrack Portal" <${emailUser()}>`,
    to,
    subject,
    text,
    html,
  });
  return { sent: true };
};

const sendOtpEmail = async (to, otp, name) => {
  try {
    return await sendMail({
      to,
      subject: 'Your EduTrack verification code',
      text: `Hi ${name},\n\nYour EduTrack email verification code is ${otp}. It expires in 10 minutes.\n\nIf you did not create an account, you can ignore this email.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f6f7fb;color:#0b0d12">
          <h2 style="color:#165dff;margin:0 0 12px">EduTrack verification</h2>
          <p>Hi ${name},</p>
          <p>Use this 6-digit code to verify your Gmail and finish registration. It expires in 10 minutes.</p>
          <p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#165dff;margin:24px 0">${otp}</p>
          <p>After verification, an administrator must approve your account before you can log in.</p>
          <p style="color:#5c6475;font-size:13px">If you did not create an EduTrack account, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    if (error.code === 'EMAIL_NOT_CONFIGURED') throw error;
    console.error('[EduTrack OTP] Gmail send failed:', error.message);
    throw new Error('Gmail could not send the verification code. Use a Gmail App Password in server/.env and restart the API.');
  }
};

const sendApprovalEmail = async (to, name, approved) => {
  if (!hasGmailConfig()) return { sent: false };

  const subject = approved ? 'Your EduTrack account is approved' : 'Your EduTrack registration was not approved';
  const body = approved
    ? `Hi ${name},\n\nYour EduTrack account has been approved. You can now log in to the portal.`
    : `Hi ${name},\n\nYour EduTrack registration was not approved. Please contact the campus administrator if you think this is a mistake.`;

  try {
    return await sendMail({ to, subject, text: body, html: `<p>${body.replace(/\n/g, '<br/>')}</p>` });
  } catch (error) {
    console.error('[EduTrack mail] approval email failed:', error.message);
    return { sent: false };
  }
};

module.exports = { sendOtpEmail, sendApprovalEmail, hasGmailConfig };
