require('dotenv').config();
const nodemailer = require('nodemailer');

// Configure Nodemailer with your email provider
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use your email service provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send OTP via email
async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <p>Your OTP Code is:</p>
      <p>${otp}</p>
      <p>It will expire in 5 minutes. Please ignore if you didn't request this</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error; // Propagate the error to the signup route
  }
}

// Function to send the Reset Password Email
async function sendResetPasswordEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset. Use the OTP Code below to reset your password:</p>
      <p>${otp}</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error; // Propagate the error to the forgot password route
  }
}

async function sendInvitationEmail(email, carpoolId) {
  const joinLink = `http://localhost:3000/join-carpool/${carpoolId}`; // frontend URL for joining carpool

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'You’re Invited to Join a Carpool!',
    html: `<p>You've been invited to join a carpool. Click <a href="${joinLink}">here</a> to join.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
  }
}

async function sendNotificationEmail(creatorEmail, message) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: creatorEmail,
    subject: 'Carpool Update',
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to ${creatorEmail}`);
  } catch (error) {
    console.error(`Error sending notification email:`, error);
  }
}

module.exports = { sendOtpEmail, sendResetPasswordEmail, sendInvitationEmail, sendNotificationEmail };
