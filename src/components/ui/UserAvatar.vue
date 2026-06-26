<script setup>
import { ref } from 'vue'
import { getInitials, getAvatarColor } from '@/utils/formatDate'

const props = defineProps({
  username: { type: String, default: '' },
  avatarUrl: { type: String, default: null },
  size: { type: String, default: 'md' }, // sm, md, lg, xl
})

const imgError = ref(false)

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
}

function onImgError() {
  imgError.value = true
}
</script>

<template>
  <div
    :class="[sizeClasses[size], 'rounded-full flex-shrink-0 overflow-hidden']"
  >
    <img
      v-if="avatarUrl && !imgError"
      :src="avatarUrl"
      :alt="username"
      class="w-full h-full object-cover"
      @error="onImgError"
    />
    <div
      v-else
      :class="[getAvatarColor(username), sizeClasses[size], 'rounded-full text-white flex items-center justify-center font-medium']"
    >
      {{ getInitials(username) }}
    </div>
  </div>
</template>
