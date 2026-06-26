<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import AppHeader from '@/components/layout/AppHeader.vue'
import { createPost } from '@/services/postService'
import { getAllCategories } from '@/services/categoryService'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()

const MAX_CHARS = 1000
const postContent = ref('')
const imageUrl = ref('')
const selectedCategoryIds = ref([])
const categories = ref([])
const errorMessage = ref('')
const submitting = ref(false)

const charsLeft = computed(() => MAX_CHARS - postContent.value.length)
const charsColor = computed(() => {
  if (charsLeft.value < 0) return 'text-red-500'
  if (charsLeft.value < 100) return 'text-amber-500'
  return 'text-slate-400'
})

async function loadCategories() {
  const { data } = await getAllCategories()
  categories.value = data
}

function toggleCategory(id) {
  const index = selectedCategoryIds.value.indexOf(id)
  if (index === -1) {
    selectedCategoryIds.value.push(id)
  } else {
    selectedCategoryIds.value.splice(index, 1)
  }
}

async function handleSubmit() {
  if (!postContent.value.trim()) return
  errorMessage.value = ''
  submitting.value = true

  try {
    await createPost({
      postContent: postContent.value.trim(),
      userId: Number(authStore.user?.id),
      imageUrl: imageUrl.value.trim() || null,
      categoryIds: selectedCategoryIds.value,
    })
    toast.success('¡Publicación creada!')
    router.push({ name: 'feed' })
  } catch (error) {
    const msg = error.response?.data?.errors
      ? Object.values(error.response.data.errors).flat().join(' ')
      : 'Ocurrió un error al crear el post.'
    errorMessage.value = msg
    toast.error(msg)
  } finally {
    submitting.value = false
  }
}

onMounted(loadCategories)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />

    <main class="max-w-2xl mx-auto px-4 py-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-6">
        <h1 class="text-lg font-semibold text-slate-900 mb-4">Crear publicación</h1>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >¿Qué quieres compartir?</label
            >
            <textarea
              v-model="postContent"
              rows="5"
              required
              placeholder="Escribe el contenido de tu post..."
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
            ></textarea>
            <div class="flex justify-end mt-1">
              <span class="text-xs" :class="charsColor">{{ charsLeft }} caracteres restantes</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              URL de imagen <span class="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              v-model="imageUrl"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div v-if="categories.length">
            <label class="block text-sm font-medium text-slate-700 mb-2">Categorías</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in categories"
                :key="cat.id"
                type="button"
                @click="toggleCategory(cat.id)"
                class="text-sm font-medium px-3 py-1.5 rounded-full border transition-colors"
                :class="
                  selectedCategoryIds.includes(cat.id)
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-violet-300'
                "
              >
                {{ cat.name }}
              </button>
            </div>
          </div>

          <div
            v-if="errorMessage"
            class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          >
            {{ errorMessage }}
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="router.push({ name: 'feed' })"
              class="text-sm font-medium text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="submitting || !postContent.trim()"
              class="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {{ submitting ? 'Publicando...' : 'Publicar' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
