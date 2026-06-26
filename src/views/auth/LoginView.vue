<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push({ name: 'feed' })
  } catch (error) {
    if (error.response?.status === 401) {
      errorMessage.value = 'Email o contraseña incorrectos.'
    } else if (error.response?.data?.errors) {
      errorMessage.value = Object.values(error.response.data.errors).flat().join(' ')
    } else {
      errorMessage.value = 'Ocurrió un error. Intenta de nuevo.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600 text-white text-xl font-semibold mb-4">D</div>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">Bienvenido de nuevo</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Inicia sesión en tu cuenta</p>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo electrónico</label>
            <input v-model="email" type="email" required placeholder="tu@email.com" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
            <input v-model="password" type="password" required placeholder="••••••••" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500" />
          </div>
          <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{{ errorMessage }}</div>
          <button type="submit" :disabled="loading" class="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium text-sm py-2.5 rounded-lg transition-colors">
            {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
          </button>
        </form>
      </div>

      <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        ¿No tienes cuenta?
        <RouterLink to="/register" class="text-violet-600 font-medium hover:underline">Regístrate</RouterLink>
      </p>
    </div>
  </div>
</template>
