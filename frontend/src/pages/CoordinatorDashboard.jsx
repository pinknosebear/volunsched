import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import ShiftCalendar from '../components/common/ShiftCalendar'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Alert from '../components/common/Alert'
import { colors, spacing, typography, shadows } from '../theme'

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
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: colors.surface
      }}>
        <div style={{ fontSize: typography.lg, color: colors.textSecondary }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: colors.surface,
      minHeight: '100vh',
      padding: spacing.xl,
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing.xl,
          paddingBottom: spacing.lg,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <div>
            <h1 style={{
              fontSize: typography['3xl'],
              fontWeight: typography.bold,
              color: colors.text,
              margin: 0,
              marginBottom: spacing.sm,
            }}>
              Coordinator Dashboard
            </h1>
            <p style={{
              fontSize: typography.sm,
              color: colors.textSecondary,
              margin: 0,
            }}>
              Shift Management & Volunteer Coordination
            </p>
          </div>
          <Button
            variant="danger"
            onClick={logout}
          >
            Logout
          </Button>
        </header>

        {error && (
          <div style={{ marginBottom: spacing.lg }}>
            <Alert variant="error" onDismiss={() => setError('')}>
              {error}
            </Alert>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: spacing.sm,
          marginBottom: spacing.xl,
          borderBottom: `2px solid ${colors.border}`,
        }}>
          {['overview', 'shifts', 'calendar', 'volunteers'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                color: activeTab === tab ? 'white' : colors.textSecondary,
                padding: `${spacing.md} ${spacing.lg}`,
                border: 'none',
                cursor: 'pointer',
                fontSize: typography.sm,
                fontWeight: typography.semibold,
                textTransform: 'capitalize',
                transition: `all 200ms ease-in-out`,
                borderBottom: activeTab === tab ? `3px solid ${colors.primary}` : 'none',
                marginBottom: '-2px',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.target.backgroundColor = colors.surface
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.target.backgroundColor = 'transparent'
                }
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: spacing.lg,
              marginBottom: spacing.xl
            }}>
              {[
                { label: 'Total Volunteers', value: dashboard.total_volunteers, color: colors.primary },
                { label: 'Total Shifts', value: dashboard.total_shifts, color: colors.success },
                { label: 'Total Signups', value: dashboard.total_signups, color: colors.info },
                { label: 'Avg Reliability', value: `${dashboard.average_reliability_score}%`, color: colors.warning }
              ].map((stat, idx) => (
                <Card key={idx} elevated>
                  <div style={{
                    fontSize: typography.xs,
                    color: colors.textSecondary,
                    marginBottom: spacing.sm,
                    fontWeight: typography.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {stat.label}
                  </div>
                  <div style={{
                    fontSize: typography['4xl'],
                    fontWeight: typography.bold,
                    color: stat.color,
                    lineHeight: 1
                  }}>
                    {stat.value}
                  </div>
                </Card>
              ))}
            </div>

            {/* Understaffed Shifts */}
            <div>
              <h2 style={{
                fontSize: typography['2xl'],
                fontWeight: typography.bold,
                color: colors.text,
                marginBottom: spacing.lg,
                margin: 0,
                marginBottom: spacing.lg,
              }}>
                Understaffed Shifts
              </h2>
              {dashboard.understaffed_shifts.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: spacing.lg
                }}>
                  {dashboard.understaffed_shifts.map(item => (
                    <Card key={item.shift.id} variant="accent">
                      <div style={{
                        fontWeight: typography.semibold,
                        fontSize: typography.lg,
                        marginBottom: spacing.md,
                        color: colors.text,
                      }}>
                        {item.shift.shift_type} <span style={{ color: colors.textSecondary, fontWeight: typography.normal }}>
                          {new Date(item.shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: spacing.md,
                      }}>
                        <span style={{ color: colors.textSecondary, fontSize: typography.sm }}>
                          Signed up: <span style={{ fontWeight: typography.semibold, color: colors.text }}>
                            {item.current_signups}/{item.shift.capacity}
                          </span>
                        </span>
                        <Badge variant="warning" size="sm">
                          {Math.round((item.current_signups / item.shift.capacity) * 100)}%
                        </Badge>
                      </div>
                      <div style={{
                        fontSize: typography.lg,
                        fontWeight: typography.bold,
                        color: colors.danger,
                      }}>
                        Need: {item.needed} volunteer{item.needed !== 1 ? 's' : ''}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card variant="surface" style={{ textAlign: 'center', padding: spacing.xl }}>
                  <div style={{ color: colors.textSecondary }}>
                    ✓ All shifts are adequately staffed!
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Shifts Tab */}
        {activeTab === 'shifts' && (
          <div>
            <h2 style={{
              fontSize: typography['2xl'],
              fontWeight: typography.bold,
              color: colors.text,
              marginBottom: spacing.lg,
              margin: 0,
              marginBottom: spacing.lg,
            }}>
              Shift Status
            </h2>
            <Card style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: colors.surface,
                    borderBottom: `2px solid ${colors.border}`,
                  }}>
                    <th style={{
                      padding: spacing.md,
                      textAlign: 'left',
                      fontWeight: typography.semibold,
                      fontSize: typography.sm,
                      color: colors.textSecondary,
                    }}>Date</th>
                    <th style={{
                      padding: spacing.md,
                      textAlign: 'left',
                      fontWeight: typography.semibold,
                      fontSize: typography.sm,
                      color: colors.textSecondary,
                    }}>Type</th>
                    <th style={{
                      padding: spacing.md,
                      textAlign: 'left',
                      fontWeight: typography.semibold,
                      fontSize: typography.sm,
                      color: colors.textSecondary,
                    }}>Capacity</th>
                    <th style={{
                      padding: spacing.md,
                      textAlign: 'left',
                      fontWeight: typography.semibold,
                      fontSize: typography.sm,
                      color: colors.textSecondary,
                    }}>Current</th>
                    <th style={{
                      padding: spacing.md,
                      textAlign: 'left',
                      fontWeight: typography.semibold,
                      fontSize: typography.sm,
                      color: colors.textSecondary,
                    }}>Fill %</th>
                    <th style={{
                      padding: spacing.md,
                      textAlign: 'left',
                      fontWeight: typography.semibold,
                      fontSize: typography.sm,
                      color: colors.textSecondary,
                    }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftStatus.map(item => (
                    <tr key={item.shift.id} style={{
                      borderBottom: `1px solid ${colors.border}`,
                    }}>
                      <td style={{ padding: spacing.md, color: colors.text }}>
                        {new Date(item.shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: spacing.md, color: colors.text, fontWeight: typography.semibold }}>
                        {item.shift.shift_type}
                      </td>
                      <td style={{ padding: spacing.md, color: colors.text }}>
                        {item.shift.capacity}
                      </td>
                      <td style={{ padding: spacing.md, color: colors.text, fontWeight: typography.semibold }}>
                        {item.current_signups}
                      </td>
                      <td style={{ padding: spacing.md, color: colors.text }}>
                        {item.fill_percentage}%
                      </td>
                      <td style={{ padding: spacing.md }}>
                        <Badge
                          variant={
                            item.is_full ? 'success'
                            : item.is_understaffed ? 'warning'
                            : 'default'
                          }
                          size="sm"
                        >
                          {item.is_full ? 'Full' : item.is_understaffed ? 'Understaffed' : 'Normal'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            <h2 style={{
              fontSize: typography['2xl'],
              fontWeight: typography.bold,
              color: colors.text,
              marginBottom: spacing.lg,
              margin: 0,
              marginBottom: spacing.lg,
            }}>
              Shift Calendar
            </h2>
            <ShiftCalendar shifts={shifts} signups={allSignups} type="coordinator" />
          </div>
        )}

        {/* Volunteers Tab */}
        {activeTab === 'volunteers' && (
          <div>
            <h2 style={{
              fontSize: typography['2xl'],
              fontWeight: typography.bold,
              color: colors.text,
              marginBottom: spacing.lg,
              margin: 0,
              marginBottom: spacing.lg,
            }}>
              Volunteer Management
            </h2>
            <Card variant="accent" style={{ textAlign: 'center', padding: spacing.xl }}>
              <p style={{
                fontSize: typography.lg,
                fontWeight: typography.semibold,
                color: colors.text,
                margin: 0,
                marginBottom: spacing.md,
              }}>
                Volunteer management features coming soon!
              </p>
              <p style={{
                fontSize: typography.sm,
                color: colors.textSecondary,
                margin: 0,
              }}>
                This will include creating volunteers, managing substitutes, and sending bulk notifications.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
