import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'

// Pages
import SplashScreen    from './pages/SplashScreen'
import WelcomePage     from './pages/WelcomePage'
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import RoleSelectPage  from './pages/RoleSelectPage'
import StudentSetupPage from './pages/StudentSetupPage'
import DriverSetupPage  from './pages/DriverSetupPage'
import HomePage        from './pages/HomePage'
import SearchPage      from './pages/SearchPage'
import TripDetailPage  from './pages/TripDetailPage'
import TripActivePage  from './pages/TripActivePage'
import DriverTripsPage from './pages/DriverTripsPage'
import NewTripPage     from './pages/NewTripPage'
import HistoryPage     from './pages/HistoryPage'
import ProfilePage     from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { user, loading } = useApp()
  if (loading) return null
  if (!user) return <Navigate to="/welcome" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/"         element={<SplashScreen />} />
      <Route path="/welcome"  element={<WelcomePage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Onboarding (requiere auth) */}
      <Route path="/role-select"   element={<ProtectedRoute><RoleSelectPage /></ProtectedRoute>} />
      <Route path="/student-setup" element={<ProtectedRoute><StudentSetupPage /></ProtectedRoute>} />
      <Route path="/driver-setup"  element={<ProtectedRoute><DriverSetupPage /></ProtectedRoute>} />

      {/* App principal */}
      <Route path="/home"         element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/search"       element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="/trip/:id"     element={<ProtectedRoute><TripDetailPage /></ProtectedRoute>} />
      <Route path="/trip-active"  element={<ProtectedRoute><TripActivePage /></ProtectedRoute>} />
      <Route path="/trips"        element={<ProtectedRoute><DriverTripsPage /></ProtectedRoute>} />
      <Route path="/trips/new"    element={<ProtectedRoute><NewTripPage /></ProtectedRoute>} />
      <Route path="/history"      element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
