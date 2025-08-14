/**
 * Utility script to generate the first invite code
 * This can be run from the browser console or as a development tool
 */

export const generateFirstInviteCode = async () => {
  try {
    const response = await fetch('/api/auth/invite-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        count: 1,
        created_by: 'admin'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ First invite code generated successfully!')
    console.log('Generated codes:', result.inviteCodes)
    return result.inviteCodes[0]
  } catch (error) {
    console.error('❌ Error generating invite code:', error)
    throw error
  }
}

// Auto-generate first invite code if no codes exist
export const ensureFirstInviteCode = async () => {
  try {
    // Check if any invite codes exist
    const response = await fetch('/api/auth/invite-codes')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.inviteCodes.length === 0) {
      console.log('🔄 No invite codes found. Generating first invite code...')
      const firstCode = await generateFirstInviteCode()
      console.log('🎉 First invite code ready for use:', firstCode.code)
      return firstCode
    } else {
      console.log('✅ Invite codes already exist:', result.inviteCodes.length, 'codes available')
      return result.inviteCodes[0]
    }
  } catch (error) {
    console.error('❌ Error ensuring first invite code:', error)
    throw error
  }
}
