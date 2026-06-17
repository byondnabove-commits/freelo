import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { organization } from 'better-auth/plugins'

interface SendEmailOptions {
  to:      string
  subject: string
  html:    string
}

interface CreateAuthOptions {
  db:             Parameters<typeof drizzleAdapter>[0]
  secret:         string
  baseURL:        string
  trustedOrigins: string[]
  sendEmail?:     (options: SendEmailOptions) => Promise<void>
}

export function createAuth({
  db,
  secret,
  baseURL,
  trustedOrigins,
  sendEmail,
}: CreateAuthOptions) {
  return betterAuth({
    secret,
    baseURL,
    trustedOrigins,

    database: drizzleAdapter(db, {
      provider: 'pg',
    }),

    emailAndPassword: {
      enabled:                  true,
      requireEmailVerification: true,
      minPasswordLength:        8,
    },

    emailVerification: {
      sendOnSignUp:                true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        if (!sendEmail) return
        await sendEmail({
          to:      user.email,
          subject: 'Verify your FreeLo account',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
              <h2>Welcome to FreeLo</h2>
              <p>Click the button below to verify your email address.</p>
              <a href="${url}" style="
                display:inline-block;
                background:#1a6b3c;
                color:white;
                padding:12px 28px;
                border-radius:8px;
                text-decoration:none;
                font-weight:600;
                margin:16px 0;
              ">Verify my email</a>
              <p style="color:#666;font-size:14px;">
                Link expires in 24 hours.
                If you didn't create a FreeLo account, ignore this email.
              </p>
            </div>
          `,
        })
      },
    },

    plugins: [
      organization({
        allowUserToCreateOrganization: true,
        creatorRole:                   'owner',
      }),
    ],

    session: {
      expiresIn:   60 * 60 * 24 * 7,
      updateAge:   60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge:  60 * 5,
      },
    },
  })
}

export type Auth = ReturnType<typeof createAuth>
export { authSchema } from './schema'
export * from './types'