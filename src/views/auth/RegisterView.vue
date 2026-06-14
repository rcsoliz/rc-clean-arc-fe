<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    await authStore.register(username.value, email.value, password.value)
    successMessage.value = 'Cuenta creada correctamente. Redirigiendo...'
    setTimeout(() => router.push({ name: 'login' }), 1200)
  } catch (error) {
    if (error.response?.data?.errors) {
      errorMessage.value = Object.values(error.response.data.errors).flat().join(' ')
    } else {
      errorMessage.value = 'Ocurrió un error al crear la cuenta.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600 text-white text-xl font-semibold mb-4"
        >
          D
        </div>
        <h1 class="text-2xl font-semibold text-slate-900">Crea tu cuenta</h1>
        <p class="text-sm text-slate-500 mt-1">Únete a la comunidad</p>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nombre de usuario</label>
            <input
              v-model="username"
              type="text"
              required
              placeholder="carlos"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="tu@email.com"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              placeholder="Mínimo 6 caracteres"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div
            v-if="errorMessage"
            class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          >
            {{ errorMessage }}
          </div>

          <div
            v-if="successMessage"
            class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2"
          >
            {{ successMessage }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
          >
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>
      </div>

      <p class="text-center text-sm text-slate-500 mt-6">
        ¿Ya tienes cuenta?
        <RouterLink to="/login" class="text-violet-600 font-medium hover:underline"
          >Inicia sesión</RouterLink
        >
      </p>
    </div>
  </div>
</template>
