import { LOCALES, PASSWORD_MAX, PASSWORD_MIN, type Locale } from "@freelo/contracts/auth";
import { schema } from "@freelo/db";
import { passwordChanged, resetPassword, verifyEmail } from "@freelo/templates/email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { haveIBeenPwned, organization } from "better-auth/plugins";

import { db } from "./db";
import { env } from "./env";
import { jobs } from "./jobs";

const localeOf = (user: object): Locale =>
  LOCALES.includes((user as { locale?: Locale }).locale as Locale) ? (user as { locale: Locale }).locale : "en";

const isTest = env.NODE_ENV === "test";

// Better Auth owns sign-up, sign-in, sessions, verification and password reset (03-s1).
// Workspaces, members and invitations go through FreeLo's own workspace module, so the
// plugin's mutating endpoints are disabled below: one path, with our rules and activity log.
export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  trustedOrigins: [env.WEB_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      organization: schema.organization,
      member: schema.member,
      invitation: schema.invitation,
    },
  }),

  user: {
    additionalFields: {
      locale: { type: "string", required: false, defaultValue: "en", input: true },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: PASSWORD_MIN,
    maxPasswordLength: PASSWORD_MAX,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      const email = resetPassword({ locale: localeOf(user), name: user.name, url });
      await jobs.enqueueEmail({ to: user.email, ...email });
    },
    onPasswordReset: async ({ user }) => {
      const email = passwordChanged({ locale: localeOf(user), name: user.name });
      await jobs.enqueueEmail({ to: user.email, ...email });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      const email = verifyEmail({ locale: localeOf(user), name: user.name, url });
      await jobs.enqueueEmail({ to: user.email, ...email });
    },
  },

  socialProviders:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
      : {},
  // Google sign-in links to an existing verified account with the same email.
  account: { accountLinking: { enabled: true, trustedProviders: ["google"] } },

  // 7 days, renewed after 1 day of use. No cookie cache: switching workspace must apply at once.
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({ data: { ...user, email: user.email.trim().toLowerCase(), locale: localeOf(user) } }),
      },
    },
  },

  // Caddy sets X-Forwarded-For in production. Limits from 03-s1 §8.
  // shortcut: in-memory store, correct only with one API process; use the database store before scaling out.
  advanced: { ipAddress: { ipAddressHeaders: ["x-forwarded-for"] } },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 1 },
    },
  },

  disabledPaths: [
    "/organization/create",
    "/organization/update",
    "/organization/delete",
    "/organization/invite-member",
    "/organization/cancel-invitation",
    "/organization/accept-invitation",
    "/organization/reject-invitation",
    "/organization/remove-member",
    "/organization/update-member-role",
    "/organization/leave",
    "/organization/set-active",
  ],

  plugins: [
    // Kept for its schema and the session's activeOrganizationId field.
    organization({ allowUserToCreateOrganization: false, creatorRole: "owner" }),
    // shortcut: skipped in tests to avoid a network call; covered manually.
    ...(isTest ? [] : [haveIBeenPwned()]),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
