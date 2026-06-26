import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as signalR from '@microsoft/signalr'
import { getAccessToken } from '@/services/api'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const connectionError = ref(false)
  let connection = null

  async function startConnection() {
    const hubUrl = `${import.meta.env.VITE_HUB_BASE_URL}/hubs/notifications`

    connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getAccessToken() ?? '',
      })
      .withAutomaticReconnect()
      .build()

    connection.on('ReceiveNotification', (notification) => {
      notifications.value.unshift(notification)
      unreadCount.value++
    })

    connection.onreconnecting(() => {
      connectionError.value = true
    })

    connection.onreconnected(() => {
      connectionError.value = false
    })

    try {
      await connection.start()
      connectionError.value = false
    } catch {
      connectionError.value = true
    }
  }

  function stopConnection() {
    if (connection) {
      connection.stop()
      connection = null
    }
  }

  function markAllRead() {
    unreadCount.value = 0
  }

  return {
    notifications,
    unreadCount,
    connectionError,
    startConnection,
    stopConnection,
    markAllRead,
  }
})
