<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import PostCard from '@/components/posts/PostCard.vue'
import { getPagedPosts } from '@/services/postService'

const router = useRouter()
const posts = ref([])
const page = ref(1)
const pageSize = 5
const totalCount = ref(0)
const loading = ref(false)

const hasMore = computed(() => posts.value.length < totalCount.value)

async function loadPosts(reset = false) {
  if (reset) {
    posts.value = []
    page.value = 1
    totalCount.value = 0
  }
  loading.value = true
  try {
    const { data } = await getPagedPosts(page.value, pageSize)
    posts.value.push(...data.items)
    totalCount.value = data.totalCount
  } finally {
    loading.value = false
  }
}

function loadMore() {
  page.value++
  loadPosts()
}

const unsubscribe = router.afterEach((to, from) => {
  if (to.name === 'feed' && from.name !== 'feed') {
    loadPosts(true)
  }
})

onMounted(() => loadPosts(true))

onUnmounted(() => {
  unsubscribe()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />

    <main class="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div v-if="loading && posts.length === 0" class="text-center py-12 text-slate-400">
        Cargando...
      </div>

      <PostCard v-for="post in posts" :key="post.id" :post="post" />

      <div v-if="!loading && posts.length === 0" class="text-center py-12 text-slate-400">
        Aún no hay publicaciones. ¡Sé el primero en publicar!
      </div>

      <div v-if="hasMore" class="text-center pt-2">
        <button
          @click="loadMore"
          :disabled="loading"
          class="text-sm font-medium text-violet-600 hover:text-violet-700 border border-violet-200 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Cargando...' : 'Cargar más' }}
        </button>
      </div>
    </main>
  </div>
</template>
