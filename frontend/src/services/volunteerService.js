import api from './api'

export const volunteerService = {
  // Get all volunteers (coordinator only)
  getVolunteers: async () => {
    try {
      const response = await api.get('/volunteers')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get a specific volunteer
  getVolunteer: async (volunteerId) => {
    try {
      const response = await api.get(`/volunteers/${volunteerId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get volunteer signup statistics
  getVolunteerStats: async (volunteerId) => {
    try {
      const response = await api.get(`/volunteers/${volunteerId}/stats`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Create a new volunteer (coordinator only)
  createVolunteer: async (name, phone, email, reliabilityScore = 100) => {
    try {
      const response = await api.post('/volunteers', {
        name,
        phone,
        email,
        reliability_score: reliabilityScore
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update volunteer (self or coordinator)
  updateVolunteer: async (volunteerId, data) => {
    try {
      const response = await api.put(`/volunteers/${volunteerId}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}
