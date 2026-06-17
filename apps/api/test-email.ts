import "dotenv/config";
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER!,
    pass: process.env.MAILTRAP_PASS!,
  },
});

transport
  .sendMail({
    from: '"FreeLo" <noreply@freelo.test>',
    to: "test@example.com",
    subject: "Test",
    html: "<p>Hello</p>",
  })
  .then((info) => console.log("Sent!", info))
  .catch((err) => console.error("Error:", err));