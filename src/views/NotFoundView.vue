<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
    <div class="text-center max-w-sm">
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 text-2xl font-semibold mb-6"
      >
        404
      </div>
      <h1 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">Página no encontrada</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">La página que buscas no existe o fue movida.</p>
      <button
        @click="router.push({ name: 'feed' })"
        class="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        Volver al feed
      </button>
    </div>
  </div>
</template>
