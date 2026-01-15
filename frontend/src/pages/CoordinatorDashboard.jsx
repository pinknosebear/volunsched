import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import ShiftCalendar from '../components/common/ShiftCalendar'

export default function CoordinatorDashboard() {
  const { logout } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [shiftStatus, setShiftStatus] = useState([])
  const [shifts, setShifts] = useState([])
  const [allSignups, setAllSignups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const dashboardRes = await api.get('/coordinator/dashboard')
      setDashboard(dashboardRes.data)

      const shiftsRes = await api.get('/coordinator/shifts/fill-status')
      setShiftStatus(shiftsRes.data)

      // Fetch all shifts and signups for calendar view
      const shiftsListRes = await api.get('/shifts')
      setShifts(shiftsListRes.data)

      const signupsRes = await api.get('/signups')
      setAllSignups(signupsRes.data)
    } catch (err) {
      setError('Failed to load dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container"><div className="loading">Loading...</div></div>
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <div>
          <h1>Coordinator Dashboard</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>Shift Management & Volunteer Coordination</p>
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

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #ddd' }}>
        {['overview', 'shifts', 'calendar', 'volunteers'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? '#007bff' : 'transparent',
              color: activeTab === tab ? 'white' : '#333',
              padding: '10px 20px',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '3px solid #007bff' : 'none',
              marginBottom: '-2px',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboard && (
        <div>
          {/* Stats */}
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
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>Total Volunteers</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
                {dashboard.total_volunteers}
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>Total Shifts</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
                {dashboard.total_shifts}
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>Total Signups</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#17a2b8' }}>
                {dashboard.total_signups}
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>Avg Reliability</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
                {dashboard.average_reliability_score}%
              </div>
            </div>
          </div>

          {/* Understaffed Shifts */}
          <div>
            <h2 style={{ marginBottom: '20px' }}>Understaffed Shifts</h2>
            {dashboard.understaffed_shifts.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '15px'
              }}>
                {dashboard.understaffed_shifts.map(item => (
                  <div key={item.shift.id} style={{
                    backgroundColor: '#fff3cd',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '2px solid #ffc107'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
                      {item.shift.shift_type} - {new Date(item.shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ marginBottom: '10px', color: '#666' }}>
                      Signed up: {item.current_signups}/{item.shift.capacity}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                      Need: {item.needed} volunteer{item.needed !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                All shifts are adequately staffed!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shifts Tab */}
      {activeTab === 'shifts' && (
        <div>
          <h2 style={{ marginBottom: '20px' }}>Shift Status</h2>
          <div style={{
            overflowX: 'auto',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Capacity</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Current</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Fill %</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {shiftStatus.map(item => (
                  <tr key={item.shift.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>
                      {new Date(item.shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px' }}>{item.shift.shift_type}</td>
                    <td style={{ padding: '12px' }}>{item.shift.capacity}</td>
                    <td style={{ padding: '12px' }}>{item.current_signups}</td>
                    <td style={{ padding: '12px' }}>{item.fill_percentage}%</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: item.is_full ? '#28a745' : item.is_understaffed ? '#ffc107' : '#e9ecef',
                        color: item.is_full ? 'white' : item.is_understaffed ? '#000' : '#666'
                      }}>
                        {item.is_full ? 'Full' : item.is_understaffed ? 'Understaffed' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div>
          <h2 style={{ marginBottom: '20px' }}>Shift Calendar</h2>
          <ShiftCalendar shifts={shifts} signups={allSignups} type="coordinator" />
        </div>
      )}

      {/* Volunteers Tab */}
      {activeTab === 'volunteers' && (
        <div>
          <h2 style={{ marginBottom: '20px' }}>Volunteer Management</h2>
          <div style={{
            backgroundColor: '#e7f3ff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #b3d9ff',
            textAlign: 'center'
          }}>
            <p style={{ marginBottom: '10px' }}>Volunteer management features coming soon!</p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              This will include creating volunteers, managing substitutes, and sending bulk notifications.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
