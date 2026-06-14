import api from './api'

export function createLike(payload) {
  return api.post('/Like', payload)
}

export function deleteLike(id) {
  return api.delete(`/Like/${id}`)
}
