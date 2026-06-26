<script setup>
import { ref } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import { useRouter } from 'vue-router'
import { formatRelativeTime } from '@/utils/formatDate'

const notificationStore = useNotificationStore()
const router = useRouter()
const showPanel = ref(false)

function togglePanel() {
  showPanel.value = !showPanel.value
  if (showPanel.value) notificationStore.markAllRead()
}

function goToPost(postId) {
  if (postId) router.push({ name: 'post-detail', params: { id: postId } })
  showPanel.value = false
}
</script>

<template>
  <div class="relative">
    <button
      @click.stop="togglePanel"
      class="relative text-slate-500 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.8"
        stroke="currentColor"
        class="w-5 h-5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>

      <!-- Badge contador -->
      <span
        v-if="notificationStore.unreadCount > 0 && !notificationStore.connectionError"
        class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium"
      >
        {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
      </span>

      <!-- Indicador de error de conexión -->
      <span
        v-if="notificationStore.connectionError"
        class="absolute -top-0.5 -right-0.5 bg-amber-400 rounded-full w-2.5 h-2.5"
        title="Sin conexión a notificaciones en tiempo real"
      ></span>
    </button>

    <!-- Panel de notificaciones -->
    <Transition name="dropdown">
      <div
        v-if="showPanel"
        v-click-outside="() => (showPanel = false)"
        @click.stop
        class="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden"
      >
        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p class="text-sm font-semibold text-slate-900">Notificaciones</p>
          <span v-if="notificationStore.notifications.length" class="text-xs text-slate-400">
            {{ notificationStore.notifications.length }} total
          </span>
        </div>

        <div class="max-h-80 overflow-y-auto">
          <div
            v-if="notificationStore.notifications.length === 0"
            class="text-center py-10 text-sm text-slate-400"
          >
            Sin notificaciones aún
          </div>

          <button
            v-for="(notif, i) in notificationStore.notifications"
            :key="i"
            @click="goToPost(notif.postId)"
            class="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              :class="notif.type === 'like' ? 'bg-red-100' : 'bg-violet-100'"
            >
              <svg
                v-if="notif.type === 'like'"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                class="w-4 h-4 text-red-500"
              >
                <path
                  d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.8"
                stroke="currentColor"
                class="w-4 h-4 text-violet-600"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm text-slate-700 leading-snug">{{ notif.message }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ formatRelativeTime(notif.createdAt) }}</p>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
