import { Resend } from "resend";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (email, otp) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: `ZyCart <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Your ZyCart OTP Code",
      html: `
        <h2>Your OTP Code</h2>
        <p>Your OTP for ZyCart registration is:</p>
        <h1 style="color:#4CAF50; font-size: 32px;">${otp}</h1>
        <p>This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    console.log("OTP email sent:", data);
    return true;
  } catch (err) {
    console.error("Resend exception:", err);
    return false;
  }
};
