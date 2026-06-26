import api from './api'

export function getUserById(id) {
  return api.get(`/User/${id}`)
}

export function updateUser(id, payload) {
  return api.put(`/User/${id}`, payload)
}
