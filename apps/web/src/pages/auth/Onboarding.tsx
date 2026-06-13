import { useAuthStore } from '@/store/auth.store'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Onboarding() {
  const { setHasCompletedOnboarding } = useAuthStore()
  const navigate = useNavigate()

  const finish = () => {
    setHasCompletedOnboarding(true)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center
      justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">
          Set up your studio
        </h1>
        <p className="text-muted-foreground">
          Onboarding wizard goes here.
        </p>
        <Button onClick={finish}>
          Skip for now → Dashboard
        </Button>
      </div>
    </div>
  )
}