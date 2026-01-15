import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Alert from '../components/common/Alert'
import { colors, spacing, typography } from '../theme'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    phone: '',
    email: ''
  })

  const navigate = useNavigate()
  const { login, register } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let result
      if (isLogin) {
        result = await login(formData.username, formData.password)
      } else {
        result = await register(
          formData.username,
          formData.password,
          formData.name,
          formData.phone,
          formData.email
        )
      }

      if (result.success) {
        navigate('/')
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: colors.surface,
      padding: spacing.md,
    }}>
      <div style={{
        backgroundColor: colors.background,
        padding: spacing.xl,
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '420px',
      }}>
        <div style={{ marginBottom: spacing.lg, textAlign: 'center' }}>
          <h1 style={{
            fontSize: typography['2xl'],
            fontWeight: typography.bold,
            color: colors.text,
            margin: 0,
            marginBottom: spacing.sm,
          }}>
            Volunteer Scheduling
          </h1>
          <p style={{
            fontSize: typography.sm,
            color: colors.textSecondary,
            margin: 0,
            marginBottom: spacing.lg,
          }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: spacing.lg }}>
            <Alert variant="error" onDismiss={() => setError('')}>
              {error}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            disabled={loading}
          />

          {!isLogin && (
            <>
              <Input
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required={!isLogin}
                disabled={loading}
              />

              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +1 (555) 123-4567"
                required={!isLogin}
                disabled={loading}
                helpText="Include country code"
              />

              <Input
                label="Email (Optional)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled={loading}
              />
            </>
          )}

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            size="lg"
            style={{ marginTop: spacing.lg }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div style={{
          marginTop: spacing.lg,
          paddingTop: spacing.lg,
          borderTop: `1px solid ${colors.border}`,
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: typography.sm,
            color: colors.textSecondary,
            margin: 0,
          }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: colors.primary,
                cursor: 'pointer',
                fontSize: typography.sm,
                fontWeight: typography.semibold,
                textDecoration: 'none',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline'
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none'
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
