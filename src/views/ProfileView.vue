<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import PostCard from '@/components/posts/PostCard.vue'
import PostCardSkeleton from '@/components/posts/PostCardSkeleton.vue'
import { getUserById } from '@/services/userService'
import { getPagedPostsByUserId } from '@/services/postService'
import { getInitials, getAvatarColor } from '@/utils/formatDate'

const route = useRoute()
const authStore = useAuthStore()

const profileUser = ref(null)
const posts = ref([])
const page = ref(1)
const pageSize = 5
const totalCount = ref(0)
const loading = ref(true)
const sentinel = ref(null)
let observer = null

const userId = computed(() => Number(route.params.id))
const isOwnProfile = computed(() => Number(authStore.user?.id) === userId.value)
const hasMore = computed(() => posts.value.length < totalCount.value)

async function loadProfile() {
  loading.value = true
  posts.value = []
  page.value = 1
  totalCount.value = 0
  try {
    const [userRes, postsRes] = await Promise.all([
      getUserById(userId.value),
      getPagedPostsByUserId(userId.value, 1, pageSize),
    ])
    profileUser.value = userRes.data
    posts.value = postsRes.data.items ?? postsRes.data
    totalCount.value = postsRes.data.totalCount ?? posts.value.length
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!hasMore.value || loading.value) return
  loading.value = true
  page.value++
  try {
    const res = await getPagedPostsByUserId(userId.value, page.value, pageSize)
    posts.value.push(...(res.data.items ?? []))
    totalCount.value = res.data.totalCount ?? totalCount.value
  } finally {
    loading.value = false
  }
}

function setupObserver() {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadMore()
    },
    { rootMargin: '200px' },
  )
  if (sentinel.value) observer.observe(sentinel.value)
}

onMounted(async () => {
  await loadProfile()
  setupObserver()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

watch(userId, async () => {
  await loadProfile()
  setupObserver()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />

    <main class="max-w-2xl mx-auto px-4 py-6">
      <!-- Skeleton de cabecera de perfil -->
      <div v-if="loading && !profileUser" class="bg-white border border-slate-200 rounded-2xl p-6 mb-6 animate-pulse">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-slate-200 flex-shrink-0"></div>
          <div class="space-y-2 flex-1">
            <div class="h-4 w-32 bg-slate-200 rounded"></div>
            <div class="h-3 w-48 bg-slate-100 rounded"></div>
            <div class="h-3 w-20 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>

      <template v-if="profileUser">
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
                {{ totalCount }} {{ totalCount === 1 ? 'publicación' : 'publicaciones' }}
              </p>
            </div>
          </div>

        <div class="flex items-center gap-2 mt-4">
          <p class="text-xs text-violet-600 bg-violet-50 dark:bg-violet-950 rounded-lg px-3 py-1.5">
            Este es tu perfil
          </p>
          <RouterLink
            to="/profile/edit"
            class="text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Editar perfil
          </RouterLink>
        </div>
        </div>

        <div class="space-y-4">
          <!-- Skeletons carga inicial de posts -->
          <template v-if="loading && posts.length === 0">
            <PostCardSkeleton
              v-for="n in 3"
              :key="n"
              :style="{ animationDelay: `${(n - 1) * 0.1}s` }"
            />
          </template>

          <PostCard v-for="post in posts" :key="post.id" :post="post" />

          <!-- Skeletons carga de página siguiente -->
          <template v-if="loading && posts.length > 0">
            <PostCardSkeleton
              v-for="n in 2"
              :key="`more-${n}`"
              :style="{ animationDelay: `${(n - 1) * 0.1}s` }"
            />
          </template>

          <div v-if="!loading && posts.length === 0" class="text-center py-12 text-slate-400">
            {{ profileUser.username }} aún no ha publicado nada.
          </div>

          <div v-if="hasMore" ref="sentinel" class="h-4"></div>

          <div v-if="!hasMore && posts.length > 0" class="text-center py-4 text-sm text-slate-400">
            Has visto todas las publicaciones
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
