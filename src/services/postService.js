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

export function getPostsByUserId(userId) {
  return api.get(`/Post/user/${userId}`)
}

export function getPagedPostsByUserId(userId, page, pageSize) {
  return api.get(`/Post/user/${userId}`, { params: { page, pageSize } })
}

export function filterPosts(filter) {
  return api.post('/Post/filter', filter)
}

export function updatePost(id, payload) {
  return api.put(`/PostCategories/${id}`, payload)
}

export function deletePost(id, categoryIds) {
  return api.delete(`/PostCategories/${id}`, { data: categoryIds })
}
