import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api, { setTokens, clearTokens, getAccessToken } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(getAccessToken())

  const isAuthenticated = computed(() => !!accessToken.value)

  async function login(email, password) {
    const { data } = await api.post('/Authentication/login', { email, password })

    setTokens(data.accessToken, data.refreshToken)
    accessToken.value = data.accessToken
    user.value = {
      username: data.username,
      email: data.email,
    }

    return data
  }

  async function register(username, email, password) {
    const { data } = await api.post('/User/register', { username, email, password })
    return data
  }

  function logout() {
    clearTokens()
    accessToken.value = null
    user.value = null
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    login,
    register,
    logout,
  }
})
