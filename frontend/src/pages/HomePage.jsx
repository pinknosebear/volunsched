import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (user?.role === 'coordinator') {
      navigate('/coordinator/dashboard')
    } else if (user?.role === 'volunteer') {
      navigate('/volunteer/dashboard')
    }
  }, [user, navigate])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1>Volunteer Scheduling System</h1>
          <p>Redirecting you to your dashboard...</p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
