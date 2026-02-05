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

export const sendMail = async () => {
  const emailDetails = {
    from: '"Mixalab" <ortizjuliocesar102@gmail.com>',
    to: "ortizjuliocesar101@gmail.com",
    subject: "Prueba de envio de correo",
    html: "<h1>Prueba de envio de correo</h1>",
  };

  return await transporter.sendMail(emailDetails);
};
