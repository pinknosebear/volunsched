import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { shiftService } from '../services/shiftService'
import { signupService } from '../services/signupService'
import { volunteerService } from '../services/volunteerService'
import ShiftCalendar from '../components/common/ShiftCalendar'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Alert from '../components/common/Alert'
import { colors, spacing, typography } from '../theme'

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
  const [viewMode, setViewMode] = useState('cards')

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

  const filteredShifts = selectedShiftType === 'all'
    ? shifts
    : shifts.filter(s => s.shift_type === selectedShiftType)

  const mySignupIds = new Set(mySignups.map(s => s.shift_id))

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
              Volunteer Dashboard
            </h1>
            <p style={{
              fontSize: typography.sm,
              color: colors.textSecondary,
              margin: 0,
            }}>
              Welcome, {volunteer?.name}!
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

        {message && (
          <div style={{ marginBottom: spacing.lg }}>
            <Alert
              variant={message.startsWith('✓') ? 'success' : 'error'}
              onDismiss={() => setMessage('')}
            >
              {message}
            </Alert>
          </div>
        )}

        {/* Stats Section */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: spacing.lg,
            marginBottom: spacing.xl
          }}>
            {[
              { label: 'Kakad Shifts', current: stats.kakad_signups, max: 2, remaining: stats.kakad_remaining, color: colors.primary },
              { label: 'Total Signups', current: stats.total_signups, max: 4, remaining: stats.total_remaining, color: colors.success },
              { label: 'Thursday Shifts', current: stats.thursday_signups, max: 2, remaining: stats.thursday_remaining, color: colors.warning }
            ].map((stat, idx) => (
              <Card key={idx} elevated>
                <div style={{
                  fontSize: typography.xs,
                  color: colors.textSecondary,
                  marginBottom: spacing.md,
                  fontWeight: typography.semibold,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: typography['2xl'],
                  fontWeight: typography.bold,
                  color: stat.color,
                  marginBottom: spacing.md,
                }}>
                  {stat.current}<span style={{ color: colors.textSecondary, fontSize: typography.lg }}> / {stat.max}</span>
                </div>
                <div style={{
                  fontSize: typography.xs,
                  color: stat.remaining > 0 ? colors.success : colors.danger,
                  fontWeight: typography.semibold,
                }}>
                  {stat.remaining} {stat.remaining === 1 ? 'slot' : 'slots'} remaining
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* View Mode Toggle */}
        <div style={{
          display: 'flex',
          gap: spacing.md,
          marginBottom: spacing.xl,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          {['cards', 'calendar'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                backgroundColor: viewMode === mode ? colors.primary : 'transparent',
                color: viewMode === mode ? 'white' : colors.textSecondary,
                padding: `${spacing.md} ${spacing.lg}`,
                border: 'none',
                cursor: 'pointer',
                fontSize: typography.sm,
                fontWeight: typography.semibold,
                textTransform: 'capitalize',
                transition: `all 200ms ease-in-out`,
                borderBottom: viewMode === mode ? `3px solid ${colors.primary}` : 'none',
                marginBottom: '-1px',
              }}
            >
              {mode === 'cards' ? 'Card View' : 'Calendar View'}
            </button>
          ))}
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div style={{ marginBottom: spacing.xl }}>
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
            <ShiftCalendar shifts={shifts} signups={mySignups} type="volunteer" />
          </div>
        )}

        {/* My Signups Section */}
        {viewMode === 'cards' && mySignups.length > 0 && (
          <div style={{ marginBottom: spacing.xl }}>
            <h2 style={{
              fontSize: typography['2xl'],
              fontWeight: typography.bold,
              color: colors.text,
              marginBottom: spacing.lg,
              margin: 0,
              marginBottom: spacing.lg,
            }}>
              My Signups
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: spacing.lg
            }}>
              {mySignups.map(signup => (
                <Card key={signup.id} elevated>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
                    <div>
                      <div style={{
                        fontWeight: typography.semibold,
                        fontSize: typography.lg,
                        color: colors.text,
                      }}>
                        {signup.shift.shift_type}
                      </div>
                      <div style={{
                        color: colors.textSecondary,
                        fontSize: typography.sm,
                        marginTop: spacing.xs,
                      }}>
                        {new Date(signup.shift.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <Badge variant="success" size="sm">
                      {signup.status}
                    </Badge>
                  </div>
                  <Button
                    variant="danger"
                    fullWidth
                    size="sm"
                    onClick={() => handleCancelSignup(signup.id)}
                  >
                    Cancel Signup
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Shifts Section */}
        {viewMode === 'cards' && (
          <div>
            <h2 style={{
              fontSize: typography['2xl'],
              fontWeight: typography.bold,
              color: colors.text,
              marginBottom: spacing.lg,
              margin: 0,
              marginBottom: spacing.lg,
            }}>
              Available Shifts
            </h2>

            <div style={{
              marginBottom: spacing.lg,
              display: 'flex',
              gap: spacing.md,
              flexWrap: 'wrap',
            }}>
              {['all', 'Kakad', 'Robes'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedShiftType(type)}
                  style={{
                    backgroundColor: selectedShiftType === type ? colors.primary : colors.surface,
                    color: selectedShiftType === type ? 'white' : colors.textSecondary,
                    padding: `${spacing.sm} ${spacing.md}`,
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${selectedShiftType === type ? colors.primary : colors.border}`,
                    cursor: 'pointer',
                    fontSize: typography.sm,
                    fontWeight: typography.semibold,
                    transition: `all 200ms ease-in-out`,
                  }}
                >
                  {type === 'all' ? 'All Shifts' : type}
                </button>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: spacing.lg
            }}>
              {filteredShifts.map(shift => {
                const isSignedUp = mySignupIds.has(shift.id)
                const isFull = shift.current_signups >= shift.capacity

                return (
                  <Card key={shift.id} variant={isSignedUp ? 'accent' : 'default'} style={{ opacity: isFull ? 0.7 : 1 }} elevated>
                    <div style={{ marginBottom: spacing.md }}>
                      <div style={{
                        fontWeight: typography.semibold,
                        fontSize: typography.lg,
                        color: colors.text,
                      }}>
                        {shift.shift_type}
                      </div>
                      <div style={{
                        color: colors.textSecondary,
                        fontSize: typography.sm,
                        marginTop: spacing.xs,
                      }}>
                        {new Date(shift.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div style={{
                        color: colors.textTertiary,
                        fontSize: typography.xs,
                        marginTop: spacing.xs,
                        fontWeight: typography.medium,
                      }}>
                        {shift.current_signups}/{shift.capacity} signed up
                      </div>
                    </div>

                    {isSignedUp && (
                      <Badge variant="success" fullWidth style={{ width: '100%', justifyContent: 'center' }}>
                        ✓ You're signed up
                      </Badge>
                    )}

                    {!isSignedUp && (
                      <Button
                        onClick={() => handleSignup(shift.id)}
                        disabled={isFull || signingUp === shift.id}
                        fullWidth
                        variant={isFull ? 'secondary' : 'primary'}
                        size="sm"
                      >
                        {signingUp === shift.id ? 'Signing up...' : isFull ? 'Shift Full' : 'Sign Up'}
                      </Button>
                    )}
                  </Card>
                )
              })}
            </div>

            {filteredShifts.length === 0 && (
              <Card variant="surface" style={{ textAlign: 'center', padding: spacing.xl }}>
                <div style={{ color: colors.textSecondary }}>
                  No shifts available for the selected filter.
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
