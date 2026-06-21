<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import PostCard from '@/components/posts/PostCard.vue'
import { getUserById } from '@/services/userService'
import { getPostsByUserId } from '@/services/postService'
import { getInitials, getAvatarColor } from '@/utils/formatDate'
import PostCardSkeleton from '@/components/posts/PostCardSkeleton.vue'

const route = useRoute()
const authStore = useAuthStore()

const profileUser = ref(null)
const posts = ref([])
const loading = ref(true)

const userId = computed(() => Number(route.params.id))
const isOwnProfile = computed(() => Number(authStore.user?.id) === userId.value)

async function loadProfile() {
  loading.value = true
  try {
    const [userRes, postsRes] = await Promise.all([
      getUserById(userId.value),
      getPostsByUserId(userId.value),
    ])
    profileUser.value = userRes.data
    posts.value = postsRes.data.items
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)
watch(userId, loadProfile)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />

    <main class="max-w-2xl mx-auto px-4 py-6">
      <div v-if="loading" class="text-center py-12 text-slate-400">Cargando...</div>

      <template v-else-if="profileUser">
        <div class="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
          <div class="flex items-center gap-4">
            <div
              :class="getAvatarColor(profileUser.username)"
              class="w-16 h-16 rounded-full text-white flex items-center justify-center text-xl font-medium flex-shrink-0"
            >
              {{ getInitials(profileUser.username) }}
            </div>
            <div>
              <h1 class="text-lg font-semibold text-slate-900">{{ profileUser.username }}</h1>
              <p class="text-sm text-slate-500">{{ profileUser.email }}</p>
              <p class="text-xs text-slate-400 mt-1">
                {{ posts.length }} {{ posts.length === 1 ? 'publicación' : 'publicaciones' }}
              </p>
            </div>
          </div>

          <p
            v-if="isOwnProfile"
            class="text-xs text-violet-600 bg-violet-50 rounded-lg px-3 py-1.5 mt-4 inline-block"
          >
            Este es tu perfil
          </p>
        </div>

        <div class="space-y-4">
          <PostCard v-for="post in posts" :key="post.id" :post="post" />

          <div v-if="posts.length === 0" class="text-center py-12 text-slate-400">
            {{ profileUser.username }} aún no ha publicado nada.
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
