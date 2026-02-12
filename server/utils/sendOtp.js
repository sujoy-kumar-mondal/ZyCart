import axios from "axios";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (email, otp) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "ZyCart",
          email: process.env.EMAIL_FROM,  // your Gmail
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "Your ZyCart OTP Code",
        htmlContent: `
          <h2>Your OTP Code</h2>
          <p>Your OTP for ZyCart registration is:</p>
          <h1 style="color:#4CAF50; font-size: 32px;">${otp}</h1>
          <p>This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return true;
  } catch (error) {
    return false;
  }
};
export const resetOTP = async (email, otp) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "ZyCart",
          email: process.env.EMAIL_FROM,  // your Gmail
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "Your ZyCart OTP Code",
        htmlContent: `
          <h2>Your OTP Code</h2>
          <p>Your OTP for ZyCart account forgot password is:</p>
          <h1 style="color:#4CAF50; font-size: 32px;">${otp}</h1>
          <p>This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return true;
  } catch (error) {
    return false;
  }
};
