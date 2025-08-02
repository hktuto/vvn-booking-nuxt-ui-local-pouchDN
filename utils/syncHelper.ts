import PouchDB from 'pouchdb'

export interface SyncConfig {
  couchUrl: string
  username: string
  password: string
  userRole: 'teacher' | 'admin'
}

export interface UserDatabaseMapping {
  students: string
  packages: string
  classes: string
  bookings: string
  transactions: string
  locations: string
  schedules: string
  classTypes: string
  studentPackages: string
}

/**
 * Generate database names for a specific user
 * This ensures complete isolation between users
 */
export function getUserDatabaseNames(userId: string, userRole: 'teacher' | 'admin'): UserDatabaseMapping {
  const prefix = `user_${userId}_`
  
  return {
    students: `${prefix}students`,
    packages: `${prefix}packages`,
    classes: `${prefix}classes`,
    bookings: `${prefix}bookings`,
    transactions: `${prefix}transactions`,
    locations: `${prefix}locations`,
    schedules: `${prefix}schedules`,
    classTypes: `${prefix}class_types`,
    studentPackages: `${prefix}student_packages`
  }
}

/**
 * Setup sync for all user databases
 */
export async function setupUserSync(
  localDbs: any,
  syncConfig: SyncConfig,
  userId: string
): Promise<Map<string, PouchDB.Replication.Sync<{}>>> {
  const remoteDbNames = getUserDatabaseNames(userId, syncConfig.userRole)
  const syncMap = new Map<string, PouchDB.Replication.Sync<{}>>()

  // Setup sync for each database
  const dbMappings = [
    { local: localDbs.students, remoteName: remoteDbNames.students },
    { local: localDbs.packages, remoteName: remoteDbNames.packages },
    { local: localDbs.classes, remoteName: remoteDbNames.classes },
    { local: localDbs.bookings, remoteName: remoteDbNames.bookings },
    { local: localDbs.transactions, remoteName: remoteDbNames.transactions },
    { local: localDbs.locations, remoteName: remoteDbNames.locations },
    { local: localDbs.schedules, remoteName: remoteDbNames.schedules },
    { local: localDbs.classTypes, remoteName: remoteDbNames.classTypes },
    { local: localDbs.studentPackages, remoteName: remoteDbNames.studentPackages }
  ]

  for (const mapping of dbMappings) {
    const remoteDb = new PouchDB(`${syncConfig.couchUrl}/${mapping.remoteName}`, {
      auth: {
        username: syncConfig.username,
        password: syncConfig.password
      }
    })

    // Setup bidirectional sync
    const sync = mapping.local.sync(remoteDb, {
      live: true,
      retry: true,
      continuous: true
    })

    syncMap.set(mapping.remoteName, sync)
  }

  return syncMap
}

/**
 * Stop all sync processes for a user
 */
export function stopUserSync(syncMap: Map<string, PouchDB.Replication.Sync<{}>>): void {
  syncMap.forEach(sync => {
    sync.cancel()
  })
  syncMap.clear()
}

/**
 * Create user databases on CouchDB server (admin function)
 */
export async function createUserDatabases(
  couchUrl: string,
  adminCredentials: { username: string; password: string },
  userId: string
): Promise<void> {
  const remoteDbNames = getUserDatabaseNames(userId, 'teacher') // Default to teacher role
  
  for (const dbName of Object.values(remoteDbNames)) {
    const remoteDb = new PouchDB(`${couchUrl}/${dbName}`, {
      auth: adminCredentials
    })
    
    try {
      await remoteDb.info()
      console.log(`Database ${dbName} already exists`)
    } catch (error: any) {
      if (error.status === 404) {
        await remoteDb.create()
        console.log(`Created database ${dbName}`)
      } else {
        throw error
      }
    }
  }
}

/**
 * Setup CouchDB security for user databases
 */
export async function setupDatabaseSecurity(
  couchUrl: string,
  adminCredentials: { username: string; password: string },
  userId: string,
  userRole: 'teacher' | 'admin'
): Promise<void> {
  const remoteDbNames = getUserDatabaseNames(userId, userRole)
  
  for (const dbName of Object.values(remoteDbNames)) {
    const remoteDb = new PouchDB(`${couchUrl}/${dbName}`, {
      auth: adminCredentials
    })
    
    // Define security document
    const securityDoc = {
      admins: {
        names: [adminCredentials.username], // Only admin can access
        roles: []
      },
      members: {
        names: [userId], // User can read/write their own data
        roles: []
      }
    }
    
    await remoteDb.putSecurity(securityDoc)
    console.log(`Security configured for ${dbName}`)
  }
}