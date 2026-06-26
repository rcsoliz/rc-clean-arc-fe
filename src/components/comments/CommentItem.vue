<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatRelativeTime, getInitials, getAvatarColor } from '@/utils/formatDate'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const props = defineProps({
  comment: { type: Object, required: true },
  replyTo: { type: String, default: null },
})

const emit = defineEmits(['delete', 'reply'])

const authStore = useAuthStore()
const showDeleteModal = ref(false)

function confirmDelete() {
  emit('delete', props.comment.id)
  showDeleteModal.value = false
}
</script>

<template>
  <div class="flex gap-3">
    <div :class="getAvatarColor(comment.username)" class="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
      {{ getInitials(comment.username) }}
    </div>
    <div class="flex-1">
      <div class="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
        <p class="text-sm font-medium text-slate-900 dark:text-white">{{ comment.username }}</p>
        <p class="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
          <span v-if="replyTo" class="text-violet-600 font-medium">@{{ replyTo }} </span>
          {{ comment.commentContent }}
        </p>
      </div>
      <div class="flex items-center gap-3 mt-1 px-1">
        <span class="text-xs text-slate-400 dark:text-slate-500">{{ formatRelativeTime(comment.created) }}</span>
        <button @click="emit('reply', comment)" class="text-xs text-slate-400 hover:text-violet-600 font-medium">Responder</button>
        <button v-if="Number(authStore.user?.id) === comment.userId" @click="showDeleteModal = true" class="text-xs text-slate-400 hover:text-rose-600 font-medium">Eliminar</button>
      </div>
    </div>
    <ConfirmModal v-if="showDeleteModal" title="Eliminar comentario" message="¿Quieres eliminar este comentario? Las respuestas a este comentario quedarán visibles." confirm-text="Eliminar" :danger="true" @confirm="confirmDelete" @cancel="showDeleteModal = false" />
  </div>
</template>
