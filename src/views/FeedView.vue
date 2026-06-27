<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import PostCard from '@/components/posts/PostCard.vue'
import PostCardSkeleton from '@/components/posts/PostCardSkeleton.vue'
import { getPagedPosts, filterPosts } from '@/services/postService'
import { getAllCategories } from '@/services/categoryService'
import { getCategoryColor } from '@/utils/formatDate'

const router = useRouter()
const route = useRoute()

const posts = ref([])
const page = ref(1)
const pageSize = 5
const totalCount = ref(0)
const loading = ref(false)
const categories = ref([])
const sentinel = ref(null)
let observer = null

// IDs activos desde la URL: ?categories=1,2,3
const activeCategoryIds = computed(() => {
  const raw = route.query.categories
  if (!raw) return []
  return String(raw).split(',').map(Number).filter(Boolean)
})

const hasMore = computed(() => posts.value.length < totalCount.value)

function toggleCategory(id) {
  const current = [...activeCategoryIds.value]
  const index = current.indexOf(id)
  if (index === -1) {
    current.push(id)
  } else {
    current.splice(index, 1)
  }
  if (current.length === 0) {
    router.push({ name: 'feed' })
  } else {
    router.push({ name: 'feed', query: { categories: current.join(',') } })
  }
}

function clearFilters() {
  router.push({ name: 'feed' })
}

async function loadPosts(reset = false) {
  if (loading.value) return
  if (reset) {
    posts.value = []
    page.value = 1
    totalCount.value = 0
  }
  loading.value = true
  try {
    let data
    if (activeCategoryIds.value.length > 0) {
      const res = await filterPosts({
        categoryIds: activeCategoryIds.value,
        page: page.value,
        pageSize,
      })
      data = res.data
    } else {
      const res = await getPagedPosts(page.value, pageSize)
      data = res.data
    }
    posts.value.push(...data.items)
    totalCount.value = data.totalCount
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  loadPosts()
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

watch(activeCategoryIds, async () => {
  await loadPosts(true)
  setupObserver()
})

const unsubscribe = router.afterEach((to, from) => {
  if (to.name === 'feed' && from.name !== 'feed') {
    loadPosts(true).then(setupObserver)
  }
})

onMounted(async () => {
  const [, catsRes] = await Promise.all([loadPosts(true), getAllCategories()])
  categories.value = catsRes.data
  setupObserver()
})

onUnmounted(() => {
  unsubscribe()
  if (observer) observer.disconnect()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <AppHeader />

    <main class="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <!-- Selector de categorías múltiple -->
      <div v-if="categories.length" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Filtrar por categoría
          </p>
          <button
            v-if="activeCategoryIds.length > 0"
            @click="clearFilters"
            class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-3.5 h-3.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Limpiar filtros
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="toggleCategory(cat.id)"
            class="text-xs font-medium px-3 py-1 rounded-full border transition-all"
            :class="
              activeCategoryIds.includes(cat.id)
                ? 'bg-violet-600 text-white border-violet-600'
                : `${getCategoryColor(cat.id)} border-transparent hover:opacity-80`
            "
          >
            {{ cat.name }}
            <span v-if="activeCategoryIds.includes(cat.id)" class="ml-1 opacity-75">✓</span>
          </button>
        </div>

        <p v-if="activeCategoryIds.length > 0" class="text-xs text-slate-400 mt-2">
          {{ totalCount }} {{ totalCount === 1 ? 'publicación' : 'publicaciones' }} encontradas
        </p>
      </div>

      <template v-if="loading && posts.length === 0">
        <PostCardSkeleton
          v-for="n in 3"
          :key="n"
          :style="{ animationDelay: `${(n - 1) * 0.1}s` }"
        />
      </template>

      <PostCard v-for="post in posts" :key="post.id" :post="post" />

      <div v-if="!loading && posts.length === 0" class="text-center py-12 text-slate-400">
        {{
          activeCategoryIds.length > 0
            ? 'No hay posts en las categorías seleccionadas.'
            : 'Aún no hay publicaciones. ¡Sé el primero en publicar!'
        }}
      </div>

      <template v-if="loading && posts.length > 0">
        <PostCardSkeleton
          v-for="n in 2"
          :key="`loading-${n}`"
          :style="{ animationDelay: `${(n - 1) * 0.1}s` }"
        />
      </template>

      <div v-if="hasMore" ref="sentinel" class="h-4"></div>

      <div v-if="!hasMore && posts.length > 0" class="text-center py-4 text-sm text-slate-400">
        Has visto todas las publicaciones
      </div>
    </main>
  </div>
</template>
