import api from './api'

export const signupService = {
  // Validate a signup before creating it
  validateSignup: async (volunteerId, shiftId) => {
    try {
      const response = await api.post('/signups/validate', {
        volunteer_id: volunteerId,
        shift_id: shiftId
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Create a new signup
  createSignup: async (volunteerId, shiftId) => {
    try {
      const response = await api.post('/signups', {
        volunteer_id: volunteerId,
        shift_id: shiftId
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get all signups for current user or specific volunteer
  getSignups: async (filters = {}) => {
    try {
      const response = await api.get('/signups', { params: filters })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Cancel a signup
  cancelSignup: async (signupId) => {
    try {
      const response = await api.delete(`/signups/${signupId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update signup status (coordinator only)
  updateSignupStatus: async (signupId, status) => {
    try {
      const response = await api.put(`/signups/${signupId}/status`, {
        status
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}
