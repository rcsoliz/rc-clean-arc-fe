import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as signalR from '@microsoft/signalr'
import { getAccessToken } from '@/services/api'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  let connection = null

  async function startConnection() {
    connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7255/hubs/notifications', {
        accessTokenFactory: () => getAccessToken() ?? '',
      })
      .withAutomaticReconnect()
      .build()

    connection.on('ReceiveNotification', (notification) => {
      notifications.value.unshift(notification)
      unreadCount.value++
    })

    try {
      await connection.start()
    } catch (err) {
      console.error('SignalR connection error:', err)
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
    startConnection,
    stopConnection,
    markAllRead,
  }
})
