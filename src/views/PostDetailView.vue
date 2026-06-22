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
import { useRouter } from 'vue-router'
import { deletePost } from '@/services/postService'

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

const router = useRouter()
const showOptions = ref(false)
const isOwner = computed(() => Number(authStore.user?.id) === post.value?.userId)

function showMoreComments() {
  visibleCount.value += 5
}

const notFound = ref(false)

async function loadData() {
  loading.value = true
  notFound.value = false
  try {
    const [postRes, commentsRes] = await Promise.all([
      getPostById(postId.value),
      getCommentsByPostId(postId.value),
    ])
    if (!postRes.data) {
      notFound.value = true
      return
    }
    post.value = postRes.data
    comments.value = commentsRes.data
  } catch (error) {
    if (error.response?.status === 404) {
      notFound.value = true
    }
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

async function handleDeletePost() {
  if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return
  const categoryIds = post.value?.categories?.map((c) => c.categoryId) ?? []
  await deletePost(postId.value, categoryIds)
  router.push({ name: 'feed' })
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

          <!-- Menú de opciones solo para el autor -->
          <div v-if="isOwner" class="relative">
            <button
              @click="showOptions = !showOptions"
              class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
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
                  d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                />
              </svg>
            </button>

            <div
              v-if="showOptions"
              v-click-outside="() => (showOptions = false)"
              class="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden"
            >
              <RouterLink
                :to="{ name: 'edit-post', params: { id: postId } }"
                class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                @click="showOptions = false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.8"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                  />
                </svg>
                Editar
              </RouterLink>
              <button
                @click="handleDeletePost"
                class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.8"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
                Eliminar
              </button>
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
      <div v-else-if="notFound" class="text-center py-16">
        <p class="text-slate-900 font-medium mb-2">Esta publicación no existe</p>
        <p class="text-sm text-slate-500 mb-4">Puede que haya sido eliminada.</p>
        <RouterLink to="/" class="text-violet-600 text-sm font-medium hover:underline">
          Volver al feed
        </RouterLink>
      </div>
    </main>
  </div>
</template>
