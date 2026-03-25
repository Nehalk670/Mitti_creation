import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send verification email
export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const transporter = createTransporter();

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Verify Your Email - Mitti Creation',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f5c542; font-size: 28px; margin: 0;">🪔 Mitti Creation</h1>
            <p style="color: #666; font-size: 16px;">Handcrafted Elegance for Your Festive Celebrations</p>
          </div>
          
          <div style="background-color: #1a1410; padding: 30px; border-radius: 10px; color: white;">
            <h2 style="color: #f5c542; margin-top: 0;">Welcome to Mitti Creation!</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Thank you for joining our community of artisans and craft lovers. 
              To complete your registration and start shopping for beautiful handcrafted items, 
              please verify your email address.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #f5c542; color: #0d0d0d; padding: 15px 30px; 
                        text-decoration: none; border-radius: 25px; font-weight: bold; 
                        font-size: 16px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #ccc; line-height: 1.6;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #f5c542;">${verificationUrl}</a>
            </p>
            
            <p style="font-size: 14px; color: #ccc; margin-top: 30px;">
              This verification link will expire in 24 hours. If you didn't create an account with us, 
              please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>&copy; 2024 Mitti Creation. All rights reserved.</p>
          </div>
        </div>
      `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const transporter = createTransporter();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Reset Your Password - Mitti Creation',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f5c542; font-size: 28px; margin: 0;">🪔 Mitti Creation</h1>
          </div>
          
          <div style="background-color: #1a1410; padding: 30px; border-radius: 10px; color: white;">
            <h2 style="color: #f5c542; margin-top: 0;">Password Reset Request</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #f5c542; color: #0d0d0d; padding: 15px 30px; 
                        text-decoration: none; border-radius: 25px; font-weight: bold; 
                        font-size: 16px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #ccc; line-height: 1.6;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #f5c542;">${resetUrl}</a>
            </p>
            
            <p style="font-size: 14px; color: #ccc; margin-top: 30px;">
              This reset link will expire in 1 hour. If you didn't request a password reset, 
              please ignore this email.
            </p>
          </div>
        </div>
      `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};
