import nodemailer from "nodemailer";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"ZyCart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your ZyCart OTP Code",
      html: `
        <h2>Your OTP Code</h2>
        <p>Your OTP for ZyCart registration is:</p>
        <h1 style="color:#4CAF50; font-size: 32px;">${otp}</h1>
        <p>This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</p>
      `,
    });

    return true;
  } catch (error) {
    console.error("Error sending OTP via Nodemailer:", error);
    return false;
  }
};

export const resetOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"ZyCart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your ZyCart OTP Code",
      html: `
        <h2>Your OTP Code</h2>
        <p>Your OTP for ZyCart account forgot password is:</p>
        <h1 style="color:#4CAF50; font-size: 32px;">${otp}</h1>
        <p>This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</p>
      `,
    });

    return true;
  } catch (error) {
    console.error("Error sending Reset OTP via Nodemailer:", error);
    return false;
  }
};

