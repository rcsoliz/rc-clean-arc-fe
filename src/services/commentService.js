import api from './api'

export function getCommentsByPostId(postId) {
  return api.get(`/Comment/post/${postId}`)
}

export function createComment(payload) {
  return api.post('/Comment', payload)
}

export function deleteComment(id) {
  return api.delete(`/Comment/${id}`)
}
