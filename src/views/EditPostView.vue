<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import { getPostById, updatePost } from '@/services/postService'
import { getAllCategories } from '@/services/categoryService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const postContent = ref('')
const imageUrl = ref('')
const selectedCategoryIds = ref([])
const categories = ref([])
const errorMessage = ref('')
const loading = ref(true)
const submitting = ref(false)

const postId = Number(route.params.id)

function toggleCategory(id) {
  const index = selectedCategoryIds.value.indexOf(id)
  if (index === -1) {
    selectedCategoryIds.value.push(id)
  } else {
    selectedCategoryIds.value.splice(index, 1)
  }
}

async function loadData() {
  loading.value = true
  try {
    const [postRes, categoriesRes] = await Promise.all([getPostById(postId), getAllCategories()])

    const post = postRes.data

    // Verificar que sea el autor
    if (Number(authStore.user?.id) !== post.userId) {
      router.push({ name: 'feed' })
      return
    }

    postContent.value = post.postContent
    imageUrl.value = post.imageUrl ?? ''
    selectedCategoryIds.value = post.categories?.map((c) => c.categoryId) ?? []
    categories.value = categoriesRes.data
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!postContent.value.trim()) return
  errorMessage.value = ''
  submitting.value = true

  try {
    await updatePost(postId, {
      id: postId,
      postContent: postContent.value.trim(),
      userId: Number(authStore.user?.id),
      imageUrl: imageUrl.value.trim() || null,
      categoryIds: selectedCategoryIds.value,
    })

    router.push({ name: 'post-detail', params: { id: postId } })
  } catch (error) {
    if (error.response?.data?.errors) {
      errorMessage.value = Object.values(error.response.data.errors).flat().join(' ')
    } else {
      errorMessage.value = 'Ocurrió un error al actualizar el post.'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />

    <main class="max-w-2xl mx-auto px-4 py-6">
      <div v-if="loading" class="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse">
        <div class="h-4 w-40 bg-slate-200 rounded mb-6"></div>
        <div class="h-32 bg-slate-100 rounded-xl mb-4"></div>
        <div class="h-9 bg-slate-100 rounded-lg mb-4"></div>
        <div class="flex gap-2">
          <div class="h-8 w-20 bg-slate-100 rounded-full"></div>
          <div class="h-8 w-24 bg-slate-100 rounded-full"></div>
        </div>
      </div>

      <div v-else class="bg-white border border-slate-200 rounded-2xl p-6">
        <h1 class="text-lg font-semibold text-slate-900 mb-4">Editar publicación</h1>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Contenido</label>
            <textarea
              v-model="postContent"
              rows="5"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
            ></textarea>
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
              @click="router.push({ name: 'post-detail', params: { id: postId } })"
              class="text-sm font-medium text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="submitting || !postContent.trim()"
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
