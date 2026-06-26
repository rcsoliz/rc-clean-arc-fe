import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { useThemeStore } from '@/stores/theme'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Directiva para cerrar dropdowns al hacer clic fuera
app.directive('click-outside', {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!el.contains(event.target)) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  },
})

app.mount('#app')

const authStore = useAuthStore()
const themeStore = useThemeStore()
themeStore.apply()

if (authStore.isAuthenticated) {
  const notificationStore = useNotificationStore()
  notificationStore.startConnection()
}
