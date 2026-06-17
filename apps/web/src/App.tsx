import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from '@/components/layout/PrivateRoute'

// Auth pages
import Login       from '@/pages/auth/Login'
import Signup      from '@/pages/auth/Signup'
import VerifyEmail from '@/pages/auth/VerifyEmail'

// App pages (placeholders for now)
import Dashboard   from '@/pages/dashboard/Dashboard'
import Onboarding  from '@/pages/auth/Onboarding'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login"        element={<Login />} />
        <Route path="/signup"       element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />


        {/* Protected app */}
        <Route element={<PrivateRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={
            <Navigate to="/dashboard" replace />
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={
          <Navigate to="/dashboard" replace />
        } />

      </Routes>
    </BrowserRouter>
  )
}