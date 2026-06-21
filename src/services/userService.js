import api from './api'

export function getUserById(id) {
  return api.get(`/User/${id}`)
}
