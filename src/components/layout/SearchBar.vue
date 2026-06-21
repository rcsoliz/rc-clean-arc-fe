<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = ref('')
let debounceTimer = null

function handleInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (query.value.trim()) {
      router.push({ name: 'search', query: { q: query.value.trim() } })
    }
  }, 500)
}

function handleSubmit() {
  clearTimeout(debounceTimer)
  if (query.value.trim()) {
    router.push({ name: 'search', query: { q: query.value.trim() } })
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="relative flex-1 max-w-xs">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.8"
      stroke="currentColor"
      class="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
    <input
      v-model="query"
      @input="handleInput"
      type="text"
      placeholder="Buscar posts, usuarios..."
      class="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
    />
  </form>
</template>
