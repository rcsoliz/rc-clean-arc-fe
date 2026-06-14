export function formatRelativeTime(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `hace ${diffMin} min`
  if (diffHours < 24) return `hace ${diffHours} h`
  if (diffDays < 7) return `hace ${diffDays} d`

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function getInitials(username) {
  if (!username) return '?'
  return username.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-blue-500',
  'bg-pink-500',
  'bg-emerald-500',
]

export function getAvatarColor(username) {
  if (!username) return AVATAR_COLORS[0]
  const sum = username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

const CATEGORY_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-pink-100 text-pink-700',
]

export function getCategoryColor(categoryId) {
  return CATEGORY_COLORS[categoryId % CATEGORY_COLORS.length]
}
