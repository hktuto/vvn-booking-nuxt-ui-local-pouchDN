/**
 * Test script to verify CouchDB user creation
 * Run this in browser console to test
 */

export const testCouchDBUserCreation = async () => {
  try {
    const config = useRuntimeConfig()
    const baseUrl = config.couchdbUrl || config.public.couchdbBaseUrl
    
    if (!baseUrl) {
      throw new Error('CouchDB URL not configured')
    }

    console.log('Testing CouchDB user creation...')
    console.log('Base URL:', baseUrl)

    // Test creating a user
    const testUsername = 'test_teacher_' + Date.now()
    const testPassword = 'testpassword123'
    
    const couchUserUrl = new URL('/_users/org.couchdb.user:' + encodeURIComponent(testUsername), baseUrl).toString()
    const couchUserDoc = {
      _id: `org.couchdb.user:${testUsername}`,
      name: testUsername,
      password: testPassword,
      roles: ['teacher'],
      type: 'user'
    }
    
    console.log('Creating test user:', testUsername)
    console.log('URL:', couchUserUrl)
    
    const response = await fetch(couchUserUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couchUserDoc)
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create test user: ${error}`)
    }
    
    const result = await response.json()
    console.log('✅ Test user created successfully:', result)
    
    // Test authentication
    console.log('Testing authentication...')
    const sessionUrl = new URL('/_session', baseUrl).toString()
    const authResponse = await fetch(sessionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: testUsername, password: testPassword }).toString()
    })
    
    if (authResponse.ok) {
      const authResult = await authResponse.json()
      console.log('✅ Authentication successful:', authResult)
    } else {
      console.log('❌ Authentication failed')
    }
    
    // Clean up - delete test user
    console.log('Cleaning up test user...')
    const deleteResponse = await fetch(couchUserUrl + `?rev=${result.rev}`, {
      method: 'DELETE'
    })
    
    if (deleteResponse.ok) {
      console.log('✅ Test user deleted successfully')
    } else {
      console.log('⚠️ Failed to delete test user (manual cleanup may be needed)')
    }
    
    return { success: true, testUsername }
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

// Auto-run test if called directly
if (typeof window !== 'undefined') {
  // Make it available globally for testing
  (window as any).testCouchDBUserCreation = testCouchDBUserCreation
}
