/**
 * Utility functions for managing CouchDB user accounts
 * Server-side only - for use in API routes
 */

export interface CouchDBUser {
  _id: string
  name: string
  password: string
  roles: string[]
  type: 'user'
}

export const createCouchDBUser = async (baseUrl: string, username: string, password: string, roles: string[] = ['teacher']) => {
  try {
    const couchUserUrl = new URL('/_users/org.couchdb.user:' + encodeURIComponent(username), baseUrl).toString()
    const couchUserDoc: CouchDBUser = {
      _id: `org.couchdb.user:${username}`,
      name: username,
      password: password, // CouchDB will hash this automatically
      roles: roles,
      type: 'user'
    }
    
    const response = await fetch(couchUserUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(couchUserDoc)
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create CouchDB user: ${error}`)
    }
    
    console.log('CouchDB user account created successfully for:', username)
    return true
  } catch (error) {
    console.error('Error creating CouchDB user account:', error)
    throw error
  }
}

export const deleteCouchDBUser = async (baseUrl: string, username: string) => {
  try {
    const couchUserUrl = new URL('/_users/org.couchdb.user:' + encodeURIComponent(username), baseUrl).toString()
    
    // First get the user to get the _rev
    const getResponse = await fetch(couchUserUrl)
    if (!getResponse.ok) {
      throw new Error('User not found')
    }
    
    const userDoc = await getResponse.json()
    
    // Delete the user
    const deleteResponse = await fetch(couchUserUrl + `?rev=${userDoc._rev}`, {
      method: 'DELETE'
    })
    
    if (!deleteResponse.ok) {
      const error = await deleteResponse.text()
      throw new Error(`Failed to delete CouchDB user: ${error}`)
    }
    
    console.log('CouchDB user account deleted successfully for:', username)
    return true
  } catch (error) {
    console.error('Error deleting CouchDB user account:', error)
    throw error
  }
}

export const updateCouchDBUserPassword = async (baseUrl: string, username: string, newPassword: string) => {
  try {
    const couchUserUrl = new URL('/_users/org.couchdb.user:' + encodeURIComponent(username), baseUrl).toString()
    
    // First get the user to get the _rev
    const getResponse = await fetch(couchUserUrl)
    if (!getResponse.ok) {
      throw new Error('User not found')
    }
    
    const userDoc = await getResponse.json()
    
    // Update the password
    const updateDoc = {
      ...userDoc,
      password: newPassword // CouchDB will hash this automatically
    }
    
    const updateResponse = await fetch(couchUserUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateDoc)
    })
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text()
      throw new Error(`Failed to update CouchDB user password: ${error}`)
    }
    
    console.log('CouchDB user password updated successfully for:', username)
    return true
  } catch (error) {
    console.error('Error updating CouchDB user password:', error)
    throw error
  }
}

export const checkCouchDBUserExists = async (baseUrl: string, username: string): Promise<boolean> => {
  try {
    const couchUserUrl = new URL('/_users/org.couchdb.user:' + encodeURIComponent(username), baseUrl).toString()
    const response = await fetch(couchUserUrl)
    return response.ok
  } catch (error) {
    return false
  }
}
