<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { getInitials, getAvatarColor } from '@/utils/formatDate'
import SearchBar from './SearchBar.vue' // ← agregar

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
    <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
      <RouterLink to="/" class="flex items-center gap-2 flex-shrink-0">
        <div
          class="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-semibold text-sm"
        >
          D
        </div>
        <span class="font-semibold text-slate-900 hidden sm:inline">DevConnect</span>
      </RouterLink>

      <SearchBar />

      <div class="flex items-center gap-3 flex-shrink-0">
        <RouterLink
          to="/posts/new"
          class="text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-3 py-1.5 transition-colors"
        >
          Crear post
        </RouterLink>

        <RouterLink
          v-if="authStore.user?.id"
          :to="{ name: 'profile', params: { id: authStore.user.id } }"
          :class="getAvatarColor(authStore.user?.username)"
          class="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-medium hover:opacity-80 transition-opacity"
          :title="authStore.user?.username"
        >
          {{ getInitials(authStore.user?.username) }}
        </RouterLink>

        <button
          @click="handleLogout"
          class="text-sm text-slate-500 hover:text-red-600 transition-colors"
          title="Cerrar sesión"
        >
          Salir
        </button>
      </div>
    </div>
  </header>
</template>
