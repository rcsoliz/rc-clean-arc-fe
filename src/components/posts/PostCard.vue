<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { createLike, deleteLike } from '@/services/likeService'
import {
  formatRelativeTime,
  getInitials,
  getAvatarColor,
  getCategoryColor,
} from '@/utils/formatDate'

const props = defineProps({
  post: { type: Object, required: true },
})

const router = useRouter()
const authStore = useAuthStore()

const likeCount = ref(props.post.likeCount ?? 0)
const likedByMe = ref(false)
const myLikeId = ref(null)
const likeLoading = ref(false)

async function toggleLike() {
  if (likeLoading.value) return
  likeLoading.value = true
  try {
    if (!likedByMe.value) {
      const { data } = await createLike({
        userId: Number(authStore.user?.id),
        postId: props.post.id,
        commentId: null,
      })
      myLikeId.value = data.id
      likedByMe.value = true
      likeCount.value++
    } else {
      await deleteLike(myLikeId.value)
      myLikeId.value = null
      likedByMe.value = false
      likeCount.value--
    }
  } catch {
    // revertir si falla
    if (likedByMe.value) likeCount.value--
    else likeCount.value++
  } finally {
    likeLoading.value = false
  }
}

function openPost() {
  router.push({ name: 'post-detail', params: { id: props.post.id } })
}
</script>

<template>
  <article class="bg-white border border-slate-200 rounded-2xl p-5">
    <div class="flex items-center gap-3 mb-3">
      <div
        :class="getAvatarColor(post.username)"
        class="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-medium flex-shrink-0"
      >
        {{ getInitials(post.username) }}
      </div>
      <div>
        <p class="text-sm font-medium text-slate-900">{{ post.username }}</p>
        <p class="text-xs text-slate-400">{{ formatRelativeTime(post.created) }}</p>
      </div>
    </div>

    <p
      @click="openPost"
      class="text-sm text-slate-700 leading-relaxed mb-3 cursor-pointer hover:text-slate-900"
    >
      {{ post.postContent }}
    </p>

    <div v-if="post.categories?.length" class="flex flex-wrap gap-1.5 mb-3">
      <span
        v-for="cat in post.categories"
        :key="cat.categoryId"
        :class="getCategoryColor(cat.categoryId)"
        class="text-xs font-medium px-2.5 py-0.5 rounded-full"
      >
        {{ cat.name }}
      </span>
    </div>

    <div class="flex items-center gap-5 pt-3 border-t border-slate-100">
      <button
        @click="toggleLike"
        :disabled="likeLoading"
        class="flex items-center gap-1.5 text-sm transition-colors"
        :class="likedByMe ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :fill="likedByMe ? 'currentColor' : 'none'"
          viewBox="0 0 24 24"
          stroke-width="1.8"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
        {{ likeCount }}
      </button>

      <button
        @click="openPost"
        class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.8"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
          />
        </svg>
        {{ post.commentCount }}
      </button>
    </div>
  </article>
</template>
