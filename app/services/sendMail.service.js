import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async (to, subject, html) => {
  const emailDetails = {
    from: `"Mixalab" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  return await transporter.sendMail(emailDetails);
};
