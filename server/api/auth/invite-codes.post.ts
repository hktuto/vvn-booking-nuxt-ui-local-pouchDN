export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  if (!config.couchdbUrl) {
    throw createError({ statusCode: 500, statusMessage: 'CouchDB URL not configured' })
  }

  // Import CouchDB wrapper
  const { couchDBDatabase, couchDBDocument } = await import('../../utils/couchdbApiWrapper')

  const body = await readBody<{ count?: number; created_by?: string }>(event)
  const count = body?.count || 1
  const created_by = body?.created_by || 'admin'

  try {
    const dbName = 'vvn-invite'
    
    // Check if database exists, if not create it
    if (!(await couchDBDatabase.exists(dbName))) {
      await couchDBDatabase.create(dbName)
    }
    
    const generatedCodes = []
    
    for (let i = 0; i < count; i++) {
      // Generate a random 8-character invite code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const inviteCode = {
        type: 'invite_code',
        code,
        status: 'active',
        created_at: new Date().toISOString(),
        created_by,
        used_at: null,
        used_by: null
      }
      
      // Create the invite code document
      const response = await couchDBDocument.create(dbName, inviteCode)
      const result = await response.json()
      
      generatedCodes.push({
        id: result.id,
        code,
        status: 'active',
        created_at: inviteCode.created_at
      })
    }
    
    return {
      success: true,
      inviteCodes: generatedCodes
    }
  } catch (error: any) {
    console.error('Error generating invite codes:', error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || 'Failed to generate invite codes' 
    })
  }
})
