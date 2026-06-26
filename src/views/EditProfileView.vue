<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import AppHeader from '@/components/layout/AppHeader.vue'
import { getUserById, updateUser } from '@/services/userService'
import { getInitials, getAvatarColor } from '@/utils/formatDate'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()

const username = ref('')
const bio = ref('')
const avatarUrl = ref('')
const loading = ref(true)
const submitting = ref(false)

const userId = Number(authStore.user?.id)

async function loadProfile() {
  loading.value = true
  try {
    const { data } = await getUserById(userId)
    username.value = data.username ?? ''
    bio.value = data.bio ?? ''
    avatarUrl.value = data.avatarUrl ?? ''
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!username.value.trim()) return
  submitting.value = true
  try {
    const { data } = await updateUser(userId, {
      username: username.value.trim(),
      bio: bio.value.trim() || null,
      avatarUrl: avatarUrl.value.trim() || null,
    })
    authStore.updateUserData({ username: data.username })
    toast.success('Perfil actualizado correctamente')
    router.push({ name: 'profile', params: { id: userId } })
  } catch (error) {
    const msg = error.response?.data?.errors
      ? Object.values(error.response.data.errors).flat().join(' ')
      : 'Error al actualizar el perfil.'
    toast.error(msg)
  } finally {
    submitting.value = false
  }
}

onMounted(loadProfile)
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <AppHeader />

    <main class="max-w-2xl mx-auto px-4 py-6">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <h1 class="text-lg font-semibold text-slate-900 dark:text-white mb-6">Editar perfil</h1>

        <div v-if="loading" class="animate-pulse space-y-4">
          <div class="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div class="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
          <div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div class="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Preview avatar -->
          <div class="flex items-center gap-4">
            <div v-if="avatarUrl" class="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
              <img :src="avatarUrl" class="w-full h-full object-cover" @error="avatarUrl = ''" />
            </div>
            <div v-else :class="getAvatarColor(username)" class="w-16 h-16 rounded-full text-white flex items-center justify-center text-xl font-medium flex-shrink-0">
              {{ getInitials(username) }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900 dark:text-white">{{ username || 'Tu nombre' }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Vista previa del avatar</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre de usuario</label>
            <input
              v-model="username"
              type="text"
              required
              placeholder="carlos"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Biografía <span class="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              v-model="bio"
              rows="3"
              placeholder="Cuéntanos algo sobre ti..."
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              URL de foto de perfil <span class="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              v-model="avatarUrl"
              type="url"
              placeholder="https://ejemplo.com/foto.jpg"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="router.push({ name: 'profile', params: { id: userId } })"
              class="text-sm font-medium text-slate-600 dark:text-slate-400 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="submitting || !username.trim()"
              class="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {{ submitting ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
