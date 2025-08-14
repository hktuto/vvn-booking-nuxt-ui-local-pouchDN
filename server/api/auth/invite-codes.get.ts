export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  if (!config.couchdbUrl) {
    throw createError({ statusCode: 500, statusMessage: 'CouchDB URL not configured' })
  }

  // Import CouchDB wrapper
  const { couchDBDatabase, couchDBDocument } = await import('../../utils/couchdbApiWrapper')

  try {
    const dbName = 'vvn-invite'
    
    // Check if database exists, if not create it
    if (!(await couchDBDatabase.exists(dbName))) {
      await couchDBDatabase.create(dbName)
    }
    
    // Get all invite codes
    const result = await couchDBDocument.getAll(dbName, true)
    const inviteCodes = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'invite_code')
      .map((doc: any) => ({
        id: doc._id,
        code: doc.code,
        status: doc.status,
        created_at: doc.created_at,
        used_at: doc.used_at,
        used_by: doc.used_by,
        created_by: doc.created_by
      }))
    
    return {
      success: true,
      inviteCodes
    }
  } catch (error: any) {
    console.error('Error fetching invite codes:', error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || 'Failed to fetch invite codes' 
    })
  }
})
