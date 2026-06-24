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

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  console.log("Sending email to:", to);

  const result = await transport.sendMail({
    from: '"FreeLo" <noreply@freelo.test>',
    to,
    subject,
    html,
  });

  console.log("Mailtrap result:", result);

  return result;

}