export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  if (!config.couchdbUrl) {
    throw createError({ statusCode: 500, statusMessage: 'CouchDB URL not configured' })
  }

  // Import CouchDB wrapper
  const { couchDBDatabase, couchDBDocument, couchDBUser } = await import('../../utils/couchdbApiWrapper')

  const {
    username,
    password,
    email,
    phone,
    country_code,
    display_name,
    invite_code,
    settings
  } = await readBody<{
    username: string
    password: string
    email?: string
    phone: string
    country_code: string
    display_name: string
    invite_code: string
    settings?: {
      language?: 'en' | 'zh-Hant'
      timezone?: string
      currency?: string
    }
  }>(event)

  // Validate required fields
  if (!username || !password || !phone || !country_code || !display_name || !invite_code) {
    throw createError({ statusCode: 400, statusMessage: 'All required fields must be provided' })
  }

  try {
    // Step 1: Validate invite code
    const inviteCodeDbName = 'vvn-invite'
    
    // Check if invite codes database exists, if not create it
    if (!(await couchDBDatabase.exists(inviteCodeDbName))) {
      await couchDBDatabase.create(inviteCodeDbName)
    }
    
    // Find the invite code
    const findResult = await couchDBDocument.find(inviteCodeDbName, {
      type: 'invite_code',
      code: invite_code.trim().toUpperCase()
    })
    
    if (findResult.docs.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
    }
    
    const inviteCodeDoc = findResult.docs[0]
    
    if (inviteCodeDoc.status !== 'active') {
      throw createError({ statusCode: 400, statusMessage: 'Invite code has already been used' })
    }

    // Step 2: Create user in CouchDB
    const usersDbName = 'vvn-user'
    
    // Check if users database exists, if not create it
    if (!(await couchDBDatabase.exists(usersDbName))) {
      await couchDBDatabase.create(usersDbName)
    }
    
    // Check if username already exists
    const userFindResult = await couchDBDocument.find(usersDbName, {
      type: 'user',
      username: username
    })
    
    if (userFindResult.docs.length > 0) {
      throw createError({ statusCode: 400, statusMessage: 'Username already exists' })
    }
    
    // Create user document
    const password_hash = btoa(password + 'salt') // Simple hash for now
    const userDoc = {
      type: 'user',
      username,
      password_hash,
      email,
      phone,
      country_code,
      role: 'teacher',
      display_name,
      settings: {
        language: settings?.language || 'en',
        timezone: settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        currency: settings?.currency || 'USD'
      },
      created_at: new Date().toISOString()
    }
    
    const createUserResponse = await couchDBDocument.create(usersDbName, userDoc)
    const userResult = await createUserResponse.json()
    
    // Step 3: Create CouchDB user account for sync
    try {
      await couchDBUser.create(username, password, ['teacher'])
      console.log('CouchDB user account created successfully for:', username)
    } catch (couchError) {
      console.warn('Error creating CouchDB user account:', couchError)
      // Don't fail registration if CouchDB user creation fails
    }
    
    // Step 4: Mark invite code as used
    try {
      await couchDBDocument.update(inviteCodeDbName, inviteCodeDoc._id, {
        ...inviteCodeDoc,
        status: 'used',
        used_at: new Date().toISOString(),
        used_by: userResult.id
      })
    } catch (updateError) {
      console.warn('Failed to mark invite code as used, but user was created successfully')
    }
    
    return {
      success: true,
      user: {
        id: userResult.id,
        username,
        display_name,
        role: 'teacher'
      }
    }
  } catch (error: any) {
    console.error('Error during registration:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || 'Registration failed' 
    })
  }
})
