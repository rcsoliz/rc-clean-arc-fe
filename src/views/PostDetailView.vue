<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import CommentThread from '@/components/comments/CommentThread.vue'
import { getPostById } from '@/services/postService'
import { getCommentsByPostId, createComment, deleteComment } from '@/services/commentService'
import {
  formatRelativeTime,
  getInitials,
  getAvatarColor,
  getCategoryColor,
} from '@/utils/formatDate'

const route = useRoute()
const authStore = useAuthStore()

const post = ref(null)
const comments = ref([])
const loading = ref(true)
const newComment = ref('')
const replyingTo = ref(null)
const submitting = ref(false)
const visibleCount = ref(5)

const postId = computed(() => Number(route.params.id))

// Solo comentarios raíz (sin padre); las respuestas se anidan dentro
const rootComments = computed(() => comments.value.filter((c) => !c.parentCommentId))

const visibleRootComments = computed(() => rootComments.value.slice(0, visibleCount.value))
const hasMoreComments = computed(() => rootComments.value.length > visibleCount.value)

function showMoreComments() {
  visibleCount.value += 5
}

async function loadData() {
  loading.value = true
  try {
    const [postRes, commentsRes] = await Promise.all([
      getPostById(postId.value),
      getCommentsByPostId(postId.value),
    ])
    post.value = postRes.data
    comments.value = commentsRes.data
  } finally {
    loading.value = false
  }
}

function startReply(comment) {
  replyingTo.value = comment
}

function cancelReply() {
  replyingTo.value = null
}

async function submitComment() {
  if (!newComment.value.trim() || submitting.value) return
  submitting.value = true

  try {
    const { data } = await createComment({
      commentContent: newComment.value.trim(),
      userId: Number(authStore.user?.id),
      postId: postId.value,
      parentCommentId: replyingTo.value?.id ?? null,
    })

    comments.value.push(data)
    newComment.value = ''
    replyingTo.value = null
  } finally {
    submitting.value = false
  }
}

async function handleDelete(commentId) {
  await deleteComment(commentId)
  comments.value = comments.value.filter(
    (c) => c.id !== commentId && c.parentCommentId !== commentId,
  )
}

onMounted(loadData)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />

    <main class="max-w-2xl mx-auto px-4 py-6">
      <div v-if="loading" class="space-y-4">
        <div class="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-slate-200"></div>
            <div class="space-y-2">
              <div class="h-3 w-24 bg-slate-200 rounded"></div>
              <div class="h-2.5 w-16 bg-slate-100 rounded"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-3 bg-slate-100 rounded w-full"></div>
            <div class="h-3 bg-slate-100 rounded w-full"></div>
            <div class="h-3 bg-slate-100 rounded w-3/4"></div>
          </div>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
          <div class="h-4 w-32 bg-slate-200 rounded mb-4"></div>
          <div class="h-12 bg-slate-100 rounded-xl"></div>
        </div>
      </div>

      <template v-else-if="post">
        <article class="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
          <div class="flex items-center gap-3 mb-3">
            <div
              :class="getAvatarColor(post.username)"
              class="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-medium"
            >
              {{ getInitials(post.username) }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ post.username }}</p>
              <p class="text-xs text-slate-400">{{ formatRelativeTime(post.created) }}</p>
            </div>
          </div>

          <p class="text-sm text-slate-700 leading-relaxed mb-3 whitespace-pre-wrap">
            {{ post.postContent }}
          </p>

          <!-- ← agregar este bloque -->
          <div v-if="post.imageUrl" class="mb-3 rounded-xl overflow-hidden bg-slate-100">
            <img
              :src="post.imageUrl"
              :alt="post.postContent"
              class="w-full max-h-[32rem] object-cover"
              @error="$event.target.style.display = 'none'"
            />
          </div>

          <div v-if="post.categories?.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="cat in post.categories"
              :key="cat.categoryId"
              :class="getCategoryColor(cat.categoryId)"
              class="text-xs font-medium px-2.5 py-0.5 rounded-full"
            >
              {{ cat.name }}
            </span>
          </div>
        </article>

        <div class="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 class="text-sm font-semibold text-slate-900 mb-4">
            Comentarios ({{ comments.length }})
          </h2>

          <div class="space-y-4 mb-4">
            <CommentThread
              v-for="comment in visibleRootComments"
              :key="comment.id"
              :comment="comment"
              :all-comments="comments"
              @delete="handleDelete"
              @reply="startReply"
            />
            <p v-if="comments.length === 0" class="text-sm text-slate-400 text-center py-4">
              Sé el primero en comentar.
            </p>
            <div v-if="hasMoreComments" class="text-center pt-2">
              <button
                @click="showMoreComments"
                class="text-sm font-medium text-violet-600 hover:text-violet-700 border border-violet-200 rounded-lg px-4 py-1.5 transition-colors"
              >
                Ver más comentarios (+{{ Math.min(5, rootComments.length - visibleCount) }})
              </button>
            </div>
          </div>

          <div
            v-if="replyingTo"
            class="flex items-center justify-between text-xs text-violet-600 bg-violet-50 rounded-lg px-3 py-1.5 mb-2"
          >
            Respondiendo a {{ replyingTo.username }}
            <button @click="cancelReply" class="text-violet-400 hover:text-violet-700">✕</button>
          </div>

          <form @submit.prevent="submitComment" class="flex gap-2">
            <input
              v-model="newComment"
              type="text"
              placeholder="Escribe un comentario..."
              class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
            <button
              type="submit"
              :disabled="submitting || !newComment.trim()"
              class="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Enviar
            </button>
          </form>
        </div>
      </template>
    </main>
  </div>
</template>
