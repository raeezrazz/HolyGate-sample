import nodemailer from "nodemailer";

export async function sendMail(otp: string, email: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_USERNAME,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    const mailOptions = {
      from: `"Holy Gate" <${process.env.NODEMAILER_USERNAME}>`,
      to: email,
      subject: "Verify your email",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h1 style="color: #000;">Holy Gate</h1>
              <h2 style="color: #333;">Verify Your Email Address</h2>
              <p style="color: #555; line-height: 1.5;">Enter the following OTP to verify your email address. This code will expire in 1 minute:</p>
              <p style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</p>
              <p style="color: #555;">If you did not request this verification, please ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    };

    
    await transporter.sendMail(mailOptions);

    console.log("✅ OTP sent successfully to:", email);

    
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("❌ Error while sending mail:", error);
    return { success: false, message: "Failed to send OTP", error };
  }
}
