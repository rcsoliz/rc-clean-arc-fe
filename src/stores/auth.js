import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import api, { setTokens, clearTokens, getAccessToken } from '@/services/api'
import { useNotificationStore } from '@/stores/notifications'

function userFromToken(token) {
  if (!token) return null
  try {
    const decoded = jwtDecode(token)
    return {
      id: Number(decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
      username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
    }
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(getAccessToken())
  const user = ref(userFromToken(accessToken.value))

  const isAuthenticated = computed(() => !!accessToken.value)

  async function login(email, password) {
    const { data } = await api.post('/Authentication/login', { email, password })
    setTokens(data.accessToken, data.refreshToken)
    accessToken.value = data.accessToken
    user.value = userFromToken(data.accessToken)

    // ← Iniciar conexión SignalR
    const notificationStore = useNotificationStore()
    await notificationStore.startConnection()

    return data
  }

  async function register(username, email, password) {
    const { data } = await api.post('/User/register', { username, email, password })
    return data
  }

  function logout() {
    const notificationStore = useNotificationStore()
    notificationStore.stopConnection()
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
