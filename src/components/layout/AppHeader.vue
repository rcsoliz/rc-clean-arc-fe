<script setup>
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useRouter } from 'vue-router'
import SearchBar from './SearchBar.vue'
import NotificationBell from './NotificationBell.vue'
import UserAvatar from '@/components/ui/UserAvatar.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
    <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
      <RouterLink to="/" class="flex items-center gap-2 flex-shrink-0">
        <div class="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-semibold text-sm">D</div>
        <span class="font-semibold text-slate-900 dark:text-white hidden sm:inline">DevConnect</span>
      </RouterLink>

      <SearchBar />

      <div class="flex items-center gap-2 flex-shrink-0">
        <button @click="themeStore.toggle()" class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" :title="themeStore.isDark ? 'Modo claro' : 'Modo oscuro'">
          <svg v-if="themeStore.isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
        </button>

        <RouterLink to="/posts/new" class="text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-3 py-1.5 transition-colors">Crear post</RouterLink>

        <NotificationBell />

        <RouterLink v-if="authStore.user?.id" :to="{ name: 'profile', params: { id: authStore.user.id } }" class="hover:opacity-80 transition-opacity" :title="authStore.user?.username">
          <UserAvatar :username="authStore.user?.username" :avatar-url="authStore.user?.avatarUrl" size="sm" />
        </RouterLink>

        <button @click="handleLogout" class="text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors">Salir</button>
      </div>
    </div>
  </header>
</template>
