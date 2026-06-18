import api from './api'

export function getAllCategories() {
  return api.get('/Category')
}
