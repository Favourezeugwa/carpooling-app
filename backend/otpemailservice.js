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
    text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
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
async function sendResetPasswordEmail(email, resetUrl) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
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

module.exports = { sendOtpEmail, sendResetPasswordEmail };
