import nodemailer from "nodemailer";

export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  verificationToken: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    // Optional: verify connection
    transporter.verify((err) => {
      if (err) console.log("SMTP connection error:", err);
      else console.log("SMTP connection successful!");
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: `"YourApp" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2>Hello ${firstName},</h2>
          <p>Please verify your email by clicking the button below:</p>
          <a href="${verificationUrl}" style="
              display: inline-block;
              padding: 10px 20px;
              color: white;
              background-color: #0070f3;
              border-radius: 5px;
              text-decoration: none;
          ">Verify Email</a>
          <p>If the button doesn’t work, copy and paste this link in your browser:</p>
          <p>${verificationUrl}</p>
        </div>
      `,
    });

    console.log("Verification email sent to", email);
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }
};

export const sendForgotPasswordEmail = async (
  email: string,
  firstName: string,
  resetToken: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true if using 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Optional: verify connection
    transporter.verify((err) => {
      if (err) console.log("SMTP connection error:", err);
      else console.log("SMTP connection successful!");
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"YourApp" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2>Hello ${firstName},</h2>
          <p>You requested a password reset. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="
              display: inline-block;
              padding: 10px 20px;
              color: white;
              background-color: #0070f3;
              border-radius: 5px;
              text-decoration: none;
          ">Reset Password</a>
          <p>If the button doesn’t work, copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    console.log("Forgot password email sent to", email);
  } catch (error) {
    console.error("Failed to send forgot password email:", error);
  }
};
