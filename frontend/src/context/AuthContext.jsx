import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [volunteer, setVolunteer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      // Verify token is still valid
      api.get('/auth/me')
        .then(response => {
          setUser(response.data.user)
          setVolunteer(response.data.volunteer)
        })
        .catch(() => {
          // Token is invalid
          localStorage.removeItem('access_token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    try {
      setError(null)
      const response = await api.post('/auth/login', { username, password })
      const { access_token, user: userData, volunteer: volunteerData } = response.data

      // Store token
      localStorage.setItem('access_token', access_token)

      // Set state
      setUser(userData)
      setVolunteer(volunteerData)

      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const register = async (username, password, name, phone, email) => {
    try {
      setError(null)
      const response = await api.post('/auth/register', {
        username,
        password,
        name,
        phone,
        email
      })
      const { access_token, user: userData, volunteer: volunteerData } = response.data

      // Store token
      localStorage.setItem('access_token', access_token)

      // Set state
      setUser(userData)
      setVolunteer(volunteerData)

      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
    setVolunteer(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        volunteer,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
