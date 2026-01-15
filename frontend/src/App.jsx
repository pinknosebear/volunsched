import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import VolunteerDashboard from './pages/VolunteerDashboard'
import CoordinatorDashboard from './pages/CoordinatorDashboard'

// Protected route component
function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />
  }

  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
      <Route
        path="/volunteer/dashboard"
        element={
          <ProtectedRoute requiredRole="volunteer">
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/dashboard"
        element={
          <ProtectedRoute requiredRole="coordinator">
            <CoordinatorDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
