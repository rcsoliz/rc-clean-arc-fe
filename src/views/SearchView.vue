<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import PostCard from '@/components/posts/PostCard.vue'
import PostCardSkeleton from '@/components/posts/PostCardSkeleton.vue'
import { filterPosts } from '@/services/postService'

const route = useRoute()
const router = useRouter()
const posts = ref([])
const totalCount = ref(0)
const loading = ref(false)
const searched = ref(false)

async function runSearch() {
  const q = route.query.q
  if (!q) return

  loading.value = true
  searched.value = true
  try {
    const { data } = await filterPosts({
      searchText: q,
      page: 1,
      pageSize: 20,
    })
    posts.value = data.items
    totalCount.value = data.totalCount
  } finally {
    loading.value = false
  }
}

onMounted(runSearch)
watch(() => route.query.q, runSearch)
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <AppHeader />

    <main class="max-w-2xl mx-auto px-4 py-6">
      <button
        @click="router.back()"
        class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white mb-4 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Volver
      </button>

      <h1 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        Resultados para "{{ route.query.q }}"
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
        {{ totalCount }} {{ totalCount === 1 ? 'publicación encontrada' : 'publicaciones encontradas' }}
      </p>

      <div v-if="loading" class="space-y-4">
        <PostCardSkeleton v-for="n in 3" :key="n" />
      </div>

      <div v-else class="space-y-4">
        <PostCard v-for="post in posts" :key="post.id" :post="post" />

        <div v-if="searched && posts.length === 0" class="text-center py-12 text-slate-400">
          No se encontraron publicaciones que coincidan con tu búsqueda.<br>
          <span class="text-sm">Intenta con otro término o nombre de usuario.</span>
        </div>
      </div>
    </main>
  </div>
</template>
