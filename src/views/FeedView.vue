<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-8">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-slate-900">Feed</h1>
        <button
          @click="handleLogout"
          class="text-sm text-slate-500 hover:text-red-600 border border-slate-300 rounded-lg px-3 py-1.5 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
      <div class="bg-white border border-slate-200 rounded-2xl p-6">
        <p class="text-slate-600">
          Bienvenido, <span class="font-medium text-slate-900">{{ authStore.user?.username }}</span
          >. Aquí construiremos el feed de posts.
        </p>
      </div>
    </div>
  </div>
</template>
