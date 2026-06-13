import 'dotenv/config'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from:    'FreeLo <noreply@yourdomain.com>',
    to,
    subject,
    html,
  })

  if (error) throw new Error(error.message)
}