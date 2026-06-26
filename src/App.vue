<script setup>
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import ScrollToTop from '@/components/ui/ScrollToTop.vue'
import { usePageTitle } from '@/composables/usePageTitle'

usePageTitle()
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
  <ToastContainer />
  <ScrollToTop />
</template>
