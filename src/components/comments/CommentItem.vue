<script setup>
import { useAuthStore } from '@/stores/auth'
import { formatRelativeTime, getInitials, getAvatarColor } from '@/utils/formatDate'

const props = defineProps({
  comment: { type: Object, required: true },
})

const emit = defineEmits(['delete', 'reply'])

const authStore = useAuthStore()
</script>

<template>
  <div class="flex gap-3">
    <div
      :class="getAvatarColor(comment.username)"
      class="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-medium flex-shrink-0"
    >
      {{ getInitials(comment.username) }}
    </div>
    <div class="flex-1">
      <div class="bg-slate-50 rounded-xl px-3 py-2">
        <p class="text-sm font-medium text-slate-900">{{ comment.username }}</p>
        <p class="text-sm text-slate-700 mt-0.5">{{ comment.commentContent }}</p>
      </div>
      <div class="flex items-center gap-3 mt-1 px-1">
        <span class="text-xs text-slate-400">{{ formatRelativeTime(comment.created) }}</span>
        <button
          @click="emit('reply', comment)"
          class="text-xs text-slate-400 hover:text-violet-600 font-medium"
        >
          Responder
        </button>
        <button
          v-if="Number(authStore.user?.id) === comment.userId"
          @click="emit('delete', comment.id)"
          class="text-xs text-slate-400 hover:text-rose-600 font-medium"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>
