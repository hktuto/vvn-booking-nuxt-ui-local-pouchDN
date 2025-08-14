export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.couchdbUrl || config.public.couchdbBaseUrl
  
  if (!baseUrl) {
    throw createError({ statusCode: 500, statusMessage: 'CouchDB URL not configured' })
  }

  const body = await readBody<{ code: string }>(event)
  const code = (body?.code || '').trim().toUpperCase()

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Invite code is required' })
  }

  try {
    const dbName = 'vvn-invite'
    const dbUrl = new URL(`/${dbName}`, baseUrl).toString()
    
    // Check if database exists
    const dbCheck = await fetch(dbUrl)
    if (!dbCheck.ok) {
      throw createError({ statusCode: 404, statusMessage: 'Invite code not found' })
    }
    
    // Find the invite code
    const findUrl = new URL(`/${dbName}/_find`, baseUrl).toString()
    const response = await fetch(findUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selector: {
          type: 'invite_code',
          code: code
        }
      })
    })
    
    if (!response.ok) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to validate invite code' })
    }
    
    const result = await response.json()
    
    if (result.docs.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
    }
    
    const inviteCode = result.docs[0]
    
    if (inviteCode.status !== 'active') {
      throw createError({ statusCode: 400, statusMessage: 'Invite code has already been used' })
    }
    
    return {
      success: true,
      inviteCode: {
        id: inviteCode._id,
        code: inviteCode.code,
        status: inviteCode.status,
        created_at: inviteCode.created_at
      }
    }
  } catch (error: any) {
    console.error('Error validating invite code:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || 'Failed to validate invite code' 
    })
  }
})
