import api from './api'

export const shiftService = {
  // Get all shifts with optional filters
  getShifts: async (filters = {}) => {
    try {
      const response = await api.get('/shifts', { params: filters })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get a specific shift
  getShift: async (shiftId) => {
    try {
      const response = await api.get(`/shifts/${shiftId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Create a new shift (coordinator only)
  createShift: async (date, shiftType, capacity) => {
    try {
      const response = await api.post('/shifts', {
        date,
        shift_type: shiftType,
        capacity
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update a shift (coordinator only)
  updateShift: async (shiftId, data) => {
    try {
      const response = await api.put(`/shifts/${shiftId}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Delete a shift (coordinator only)
  deleteShift: async (shiftId) => {
    try {
      const response = await api.delete(`/shifts/${shiftId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}
