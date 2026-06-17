import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "./db";
import { sendEmail } from "./services/email";
import "dotenv/config";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [process.env.CLIENT_URL!],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,

    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your FreeLo password",
        html: `
        <h2>Reset your password</h2>
        <p>Click the button below:</p>

        <a href="${url}">
          Reset Password
        </a>

        <p>If you didn't request this, ignore this email.</p>
      `,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your FreeLo account",
        html: `
          <h2>Welcome to FreeLo</h2>
          <p>Click below to verify your email:</p>
          <a href="${url}" style="
            background:#1a6b3c;
            color:white;
            padding:12px 24px;
            border-radius:8px;
            text-decoration:none;
            display:inline-block;
          ">Verify my email</a>
          <p>Link expires in 24 hours.</p>
        `,
      });
    },
  },

  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
});

export type Auth = typeof auth;
