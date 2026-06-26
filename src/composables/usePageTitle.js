import { watch } from 'vue'
import { useRoute } from 'vue-router'

const BASE_TITLE = 'DevConnect'

const ROUTE_TITLES = {
  feed: 'Feed',
  login: 'Iniciar sesión',
  register: 'Crear cuenta',
  'create-post': 'Crear publicación',
  'edit-post': 'Editar publicación',
  'post-detail': 'Publicación',
  profile: 'Perfil',
  search: 'Buscar',
  'not-found': 'Página no encontrada',
}

export function usePageTitle(customTitle = null) {
  const route = useRoute()

  function setTitle(title) {
    document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE
  }

  if (customTitle) {
    watch(customTitle, (val) => setTitle(val), { immediate: true })
  } else {
    watch(
      () => route.name,
      (name) => setTitle(ROUTE_TITLES[name] ?? null),
      { immediate: true },
    )
  }
}
