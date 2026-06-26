import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let nextId = 0

  function add(message, type = 'default', duration = 3500) {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => remove(id), duration)
  }

  function remove(id) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) toasts.value.splice(index, 1)
  }

  // Shortcuts
  const success = (msg) => add(msg, 'success')
  const error = (msg) => add(msg, 'error')
  const warning = (msg) => add(msg, 'warning')

  return { toasts, add, remove, success, error, warning }
})
