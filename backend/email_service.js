const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-email@gmail.com',
    pass: process.env.GMAIL_PASSWORD || 'your-app-password'
  }
});

async function sendWaitlistEmail(userEmail) {
  try {
    // Email to the admin (you)
    const adminMailOptions = {
      from: process.env.GMAIL_USER || 'your-email@gmail.com',
      to: 'karthikyam2006@gmail.com',
      subject: 'New Waitlist Signup for Newt',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Waitlist Signup!</h2>
          <p>Someone just joined the Newt waitlist:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <strong>Email:</strong> ${userEmail}
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Timestamp: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    // Confirmation email to the user
    const userMailOptions = {
      from: process.env.GMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: 'Welcome to the Newt Waitlist! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); color: white; padding: 0; border-radius: 12px; overflow: hidden;">
          <div style="padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0 0 20px 0; font-size: 32px; font-weight: bold; background: linear-gradient(45deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
              newt
            </h1>
            <h2 style="margin: 0 0 20px 0; color: #bfdbfe;">You're on the list! 🚀</h2>
            <p style="font-size: 18px; line-height: 1.6; color: #dbeafe; margin: 0 0 30px 0;">
              Thanks for joining the Newt waitlist! You'll be among the first to experience AI-powered tech news summaries.
            </p>
            <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #fbbf24;">What to expect:</h3>
              <ul style="text-align: left; color: #e0e7ff; line-height: 1.8; padding-left: 20px;">
                <li>Personalized AI-curated tech news summaries</li>
                <li>Reading streaks and progress tracking</li>
                <li>Connect with other tech enthusiasts</li>
                <li>Early access when we launch</li>
              </ul>
            </div>
            <p style="color: #bfdbfe; font-size: 14px; margin-top: 30px;">
              We'll keep you updated on our progress and let you know as soon as Newt is ready!
            </p>
          </div>
        </div>
      `
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    
    console.log(`Waitlist emails sent successfully for: ${userEmail}`);
    return { success: true, message: 'Emails sent successfully' };
    
  } catch (error) {
    console.error('Error sending emails:', error);
    return { success: false, message: 'Failed to send emails', error: error.message };
  }
}

// Command line interface
if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email address');
    process.exit(1);
  }
  
  sendWaitlistEmail(email)
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error(JSON.stringify({ success: false, error: error.message }));
      process.exit(1);
    });
}

module.exports = { sendWaitlistEmail };
