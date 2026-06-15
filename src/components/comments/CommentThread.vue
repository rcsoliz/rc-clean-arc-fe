<script setup>
import { ref, computed } from 'vue'
import CommentItem from './CommentItem.vue'

const props = defineProps({
  comment: { type: Object, required: true },
  allComments: { type: Array, required: true },
})

const emit = defineEmits(['delete', 'reply'])

function collectDescendants(commentId) {
  const direct = props.allComments.filter((c) => c.parentCommentId === commentId)
  let all = []
  for (const child of direct) {
    all.push(child)
    all = all.concat(collectDescendants(child.id))
  }
  return all
}

const descendants = computed(() => collectDescendants(props.comment.id))

// --- paginación de respuestas ---
const visibleRepliesCount = ref(3)

const visibleDescendants = computed(() => descendants.value.slice(0, visibleRepliesCount.value))

const hiddenRepliesCount = computed(() => descendants.value.length - visibleRepliesCount.value)

function showMoreReplies() {
  visibleRepliesCount.value += 5
}

function replyToUsername(reply) {
  if (reply.parentCommentId === props.comment.id) return null
  return props.allComments.find((c) => c.id === reply.parentCommentId)?.username ?? null
}
</script>

<template>
  <div>
    <CommentItem
      :comment="comment"
      @delete="(id) => emit('delete', id)"
      @reply="(c) => emit('reply', c)"
    />

    <div v-if="descendants.length" class="ml-11 mt-3 space-y-3">
      <CommentItem
        v-for="reply in visibleDescendants"
        :key="reply.id"
        :comment="reply"
        :reply-to="replyToUsername(reply)"
        @delete="(id) => emit('delete', id)"
        @reply="(c) => emit('reply', c)"
      />

      <button
        v-if="hiddenRepliesCount > 0"
        @click="showMoreReplies"
        class="text-xs font-medium text-violet-600 hover:text-violet-700"
      >
        Ver {{ Math.min(5, hiddenRepliesCount) }} respuestas más
      </button>
    </div>
  </div>
</template>
