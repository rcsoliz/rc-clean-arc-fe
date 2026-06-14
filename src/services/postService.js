import api from './api'

export function getPagedPosts(page, pageSize) {
  return api.get('/Post/paged', { params: { page, pageSize } })
}

export function getPostById(id) {
  return api.get(`/Post/${id}`)
}

export function createPost(payload) {
  return api.post('/Post', payload)
}
