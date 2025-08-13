export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const body = await readBody<{ username?: string; password?: string }>(event)
  const username = (body?.username || '').trim()
  const password = (body?.password || '').trim()

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing username or password' })
  }

  const baseUrl = config.couchdbUrl || config.public.couchdbBaseUrl
  if (!baseUrl) {
    throw createError({ statusCode: 500, statusMessage: 'CouchDB URL not configured' })
  }

  const sessionUrl = new URL('/_session', baseUrl).toString()

  // Try CouchDB _session authentication first
  try {
    const res = await fetch(sessionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: username, password }).toString()
    })

    if (res.ok) {
      return {
        success: true,
        user: {
          id: username,
          username,
          role: 'user'
        },
        baseUrl: config.public.couchdbBaseUrl || baseUrl
      }
    }
  } catch (_err) {
    // ignore and fallback to Basic auth check
  }

  // Fallback: test Basic auth against CouchDB root
  const testRes = await fetch(baseUrl, {
    method: 'GET',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
    }
  })

  if (testRes.ok) {
    return {
      success: true,
      user: {
        id: username,
        username,
        role: 'user'
      },
      baseUrl: config.public.couchdbBaseUrl || baseUrl
    }
  }

  throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
})