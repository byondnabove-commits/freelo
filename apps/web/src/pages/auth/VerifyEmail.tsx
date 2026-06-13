import { useLocation, useNavigate } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Mail, Loader2, RefreshCw } from 'lucide-react'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate  = useNavigate()
  const email     = location.state?.email as string | undefined
  const [resending, setResending] = useState(false)

  const handleResend = async () => {
    if (!email) return
    setResending(true)

    await authClient.sendVerificationEmail(
      { email, callbackURL: '/onboarding' },
      {
        onSuccess: () => {
          toast.success('Verification email resent!')
          setResending(false)
        },
        onError: (ctx) => {
          toast.error(ctx.error.message)
          setResending(false)
        },
      }
    )
  }

  return (
    <div className="min-h-screen flex items-center
      justify-center bg-background p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-primary rounded-lg
            flex items-center justify-center">
            <span className="text-primary-foreground
              font-bold text-sm">F</span>
          </div>
          <span className="text-xl font-bold">FreeLo</span>
        </div>

        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full
              flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                Check your email
              </CardTitle>
              <CardDescription>
                We sent a verification link to{' '}
                {email
                  ? <span className="font-medium text-foreground">
                      {email}
                    </span>
                  : 'your email address'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-sm
              text-muted-foreground space-y-2">
              <p>Click the link in the email to verify
                your account.</p>
              <p>The link expires in 24 hours.</p>
              <p>Check your spam folder if you don't
                see it.</p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resending || !email}
            >
              {resending
                ? <><Loader2 className="w-4 h-4 mr-2
                    animate-spin" />Resending...</>
                : <><RefreshCw className="w-4 h-4 mr-2" />
                    Resend verification email</>}
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}