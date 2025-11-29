import nodemailer from "nodemailer";

// Generate OTP (6 digits)
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (email, otp) => {
  try {
    // Correct Gmail configuration using App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ZyCart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your ZyCart OTP Code",
      html: `
        <h2>Your OTP Code</h2>
        <p>Your OTP for ZyCart registration is:</p>
        <h1 style="color:#4CAF50; font-size: 32px;">${otp}</h1>
        <p>This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP Email sent to:", email);
    return true;

  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
};
