export default defineNuxtRouteMiddleware(async (to) => {
  // Only in client and only for non-public pages
  if (process.server) return

  if (to.meta.auth === false) return
  if (to.path === '/login') return

  try {
    const databases: Array<{ name?: string }> = await (window.indexedDB as any)?.databases?.() || []
    const hasAny = databases.some(d => !!d.name)
    if (!hasAny) {
      return navigateTo('/login')
    }
  } catch {
    // If cannot detect DBs, do nothing
  }
})