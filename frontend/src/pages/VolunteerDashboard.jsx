import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { shiftService } from '../services/shiftService'
import { signupService } from '../services/signupService'
import { volunteerService } from '../services/volunteerService'

export default function VolunteerDashboard() {
  const { user, volunteer, logout } = useAuth()
  const navigate = useNavigate()

  const [shifts, setShifts] = useState([])
  const [mySignups, setMySignups] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedShiftType, setSelectedShiftType] = useState('all')
  const [signingUp, setSigningUp] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [volunteer?.id])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load shifts
      const shiftsData = await shiftService.getShifts()
      setShifts(shiftsData)

      // Load user's signups
      const signupsData = await signupService.getSignups()
      setMySignups(signupsData)

      // Load stats
      if (volunteer?.id) {
        const statsData = await volunteerService.getVolunteerStats(volunteer.id)
        setStats(statsData.stats)
      }
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (shiftId) => {
    try {
      setSigningUp(shiftId)
      setMessage('')

      // Validate first
      const validation = await signupService.validateSignup(volunteer.id, shiftId)

      if (!validation.is_valid) {
        setMessage(`Cannot sign up: ${validation.error_message}`)
        setSigningUp(null)
        return
      }

      // Create signup
      const result = await signupService.createSignup(volunteer.id, shiftId)
      setMessage('✓ Successfully signed up for shift!')
      setStats(result.stats)

      // Reload data
      setTimeout(() => {
        loadData()
        setMessage('')
      }, 2000)
    } catch (err) {
      const errorMsg = err.error || err.message || 'Failed to sign up'
      setMessage(`Error: ${errorMsg}`)
    } finally {
      setSigningUp(null)
    }
  }

  const handleCancelSignup = async (signupId) => {
    if (!window.confirm('Are you sure you want to cancel this signup?')) {
      return
    }

    try {
      await signupService.cancelSignup(signupId)
      setMessage('✓ Signup cancelled')
      setTimeout(() => {
        loadData()
        setMessage('')
      }, 2000)
    } catch (err) {
      setMessage(`Error: ${err.error || 'Failed to cancel signup'}`)
    }
  }

  if (loading) {
    return <div className="container"><div className="loading">Loading...</div></div>
  }

  const filteredShifts = selectedShiftType === 'all'
    ? shifts
    : shifts.filter(s => s.shift_type === selectedShiftType)

  const mySignupIds = new Set(mySignups.map(s => s.shift_id))

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <div>
          <h1>Volunteer Dashboard</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>Welcome, {volunteer?.name}!</p>
        </div>
        <button
          onClick={logout}
          style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px' }}
        >
          Logout
        </button>
      </header>

      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{
          backgroundColor: message.startsWith('✓') ? '#d4edda' : '#f8d7da',
          color: message.startsWith('✓') ? '#155724' : '#721c24',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      {/* Stats Section */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>Kakad Shifts</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {stats.kakad_signups}/{2}
            </div>
            <div style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
              {stats.kakad_remaining} remaining
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>Total Signups</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {stats.total_signups}/{4}
            </div>
            <div style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
              {stats.total_remaining} remaining
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>Thursday Shifts</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {stats.thursday_signups}/{2}
            </div>
            <div style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
              {stats.thursday_remaining} remaining
            </div>
          </div>
        </div>
      )}

      {/* My Signups Section */}
      {mySignups.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>My Signups</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            {mySignups.map(signup => (
              <div key={signup.id} style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #28a745'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      {signup.shift.shift_type}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {new Date(signup.shift.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <span style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {signup.status}
                  </span>
                </div>
                <button
                  onClick={() => handleCancelSignup(signup.id)}
                  style={{
                    width: '100%',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Cancel Signup
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Shifts Section */}
      <div>
        <h2 style={{ marginBottom: '20px' }}>Available Shifts</h2>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          {['all', 'Kakad', 'Robes'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedShiftType(type)}
              style={{
                backgroundColor: selectedShiftType === type ? '#007bff' : '#e9ecef',
                color: selectedShiftType === type ? 'white' : '#333',
                padding: '10px 20px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {type === 'all' ? 'All Shifts' : type}
            </button>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          {filteredShifts.map(shift => {
            const isSignedUp = mySignupIds.has(shift.id)
            const isFull = shift.current_signups >= shift.capacity

            return (
              <div key={shift.id} style={{
                backgroundColor: isSignedUp ? '#d1ecf1' : 'white',
                padding: '15px',
                borderRadius: '8px',
                border: `2px solid ${isSignedUp ? '#17a2b8' : '#ddd'}`,
                opacity: isFull ? 0.6 : 1
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {shift.shift_type}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                    {new Date(shift.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
                    {shift.current_signups}/{shift.capacity} signed up
                  </div>
                </div>

                {isSignedUp && (
                  <div style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}>
                    ✓ You're signed up
                  </div>
                )}

                {!isSignedUp && (
                  <button
                    onClick={() => handleSignup(shift.id)}
                    disabled={isFull || signingUp === shift.id}
                    style={{
                      width: '100%',
                      backgroundColor: isFull ? '#ccc' : '#007bff',
                      color: 'white',
                      padding: '10px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: isFull ? 'not-allowed' : 'pointer',
                      opacity: signingUp === shift.id ? 0.7 : 1
                    }}
                  >
                    {signingUp === shift.id ? 'Signing up...' : isFull ? 'Shift Full' : 'Sign Up'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {filteredShifts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No shifts available for the selected filter.
          </div>
        )}
      </div>
    </div>
  )
}
