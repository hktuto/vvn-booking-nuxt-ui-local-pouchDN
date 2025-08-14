import type PouchDB from 'pouchdb'

export type SyncCredentials = {
  username: string
  password: string
  baseUrl: string
}

export type JWTSyncCredentials = {
  token: string
  baseUrl: string
}

export const useSyncState = () => useState<Record<string, any>>('syncHandlers', () => ({}))

export const useSync = () => {
  const { auth } = useAuth()
  const syncHandlers = useSyncState()

  const initializeLocalDatabases = async () => {
    const { getDB: getUserDB } = useUserDB()
    const { getDB: getStudentDB } = useStudentDB()
    const { getDB: getPackageDB } = usePackageDB()
    const { getDB: getStudentPackageDB } = useStudentPackageDB()
    const { getDB: getClassTypeDB } = useClassTypeDB()
    const { getDB: getClassDB } = useClassDB()
    const { getDB: getBookingDB } = useBookingDB()
    const { getDB: getTransactionDB } = useTransactionDB()
    const { getDB: getLocationDB } = useLocationDB()
    const { getDBForYear: getBookingsDBForYear } = useBookingDBByYear()
    const { getDBForYear: getTransactionsDBForYear } = useTransactionDBByYear()

    const currentYear = new Date().getFullYear()

    await Promise.all([
      getUserDB(),
      getStudentDB(),
      getPackageDB(),
      getStudentPackageDB(),
      getClassTypeDB(),
      getClassDB(),
      getBookingDB(),
      getTransactionDB(),
      getLocationDB(),
      getBookingsDBForYear(currentYear),
      getTransactionsDBForYear(currentYear)
    ])
  }

  const buildRemoteUrl = (baseUrl: string, dbName: string, creds: { username: string; password: string }) => {
    const url = new URL(baseUrl)
    url.username = encodeURIComponent(creds.username)
    url.password = encodeURIComponent(creds.password)
    url.pathname = url.pathname.replace(/\/$/, '') + '/' + encodeURIComponent(dbName)
    return url.toString()
  }

  const buildJWTRemoteUrl = (baseUrl: string, dbName: string, token: string) => {
    const url = new URL(baseUrl)
    url.pathname = url.pathname.replace(/\/$/, '') + '/' + encodeURIComponent(dbName)
    return {
      url: url.toString(),
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  }

  const startCouchSync = async (creds: SyncCredentials) => {
    if (!auth.value.isAuthenticated || !auth.value.user) {
      throw new Error('Must be authenticated before starting sync')
    }

    const mapping = [
      { getter: useUserDB().getDB },
      { getter: useStudentDB().getDB },
      { getter: usePackageDB().getDB },
      { getter: useStudentPackageDB().getDB },
      { getter: useClassTypeDB().getDB },
      { getter: useClassDB().getDB },
      { getter: useBookingDB().getDB },
      { getter: useTransactionDB().getDB },
      { getter: useLocationDB().getDB }
    ] as const

    for (const m of mapping) {
      const localDB = await m.getter()
      const remoteUrl = buildRemoteUrl(creds.baseUrl, (localDB as any).name as string, creds)
      const sync = localDB.sync(remoteUrl, { live: true, retry: true })
      sync.on('error', (err: any) => console.error(`[sync:${(localDB as any).name}]`, err))
      syncHandlers.value[(localDB as any).name] = sync as any
    }

    // Also sync year-sharded DBs
    const { listShardYears: listBookingShardYears, getDBForYear: getBookingsDBForYear } = useBookingDBByYear()
    const { listShardYears: listTransactionShardYears, getDBForYear: getTransactionsDBForYear } = useTransactionDBByYear()

    const bookingYears = await listBookingShardYears()
    const transactionYears = await listTransactionShardYears()

    for (const year of Array.from(new Set([...bookingYears, ...transactionYears]))) {
      // bookings shard
      try {
        const bdb = await getBookingsDBForYear(year)
        const burl = buildRemoteUrl(creds.baseUrl, (bdb as any).name as string, creds)
        const bsync = bdb.sync(burl, { live: true, retry: true })
        bsync.on('error', (err: any) => console.error(`[sync:${(bdb as any).name}]`, err))
        syncHandlers.value[(bdb as any).name] = bsync as any
      } catch (e) {
        console.warn('Failed to start bookings shard sync for year', year, e)
      }

      // transactions shard
      try {
        const tdb = await getTransactionsDBForYear(year)
        const turl = buildRemoteUrl(creds.baseUrl, (tdb as any).name as string, creds)
        const tsync = tdb.sync(turl, { live: true, retry: true })
        tsync.on('error', (err: any) => console.error(`[sync:${(tdb as any).name}]`, err))
        syncHandlers.value[(tdb as any).name] = tsync as any
      } catch (e) {
        console.warn('Failed to start transactions shard sync for year', year, e)
      }
    }
  }

  const startJWTSync = async (creds: JWTSyncCredentials) => {
    if (!auth.value.isAuthenticated || !auth.value.user) {
      throw new Error('Must be authenticated before starting sync')
    }

    const mapping = [
      { getter: useUserDB().getDB },
      { getter: useStudentDB().getDB },
      { getter: usePackageDB().getDB },
      { getter: useStudentPackageDB().getDB },
      { getter: useClassTypeDB().getDB },
      { getter: useClassDB().getDB },
      { getter: useBookingDB().getDB },
      { getter: useTransactionDB().getDB },
      { getter: useLocationDB().getDB }
    ] as const

    for (const m of mapping) {
      const localDB = await m.getter()
      const { url, headers } = buildJWTRemoteUrl(creds.baseUrl, (localDB as any).name as string, creds.token)
      const sync = localDB.sync(url, { 
        live: true, 
        retry: true,
        headers 
      })
      sync.on('error', (err: any) => console.error(`[sync:${(localDB as any).name}]`, err))
      syncHandlers.value[(localDB as any).name] = sync as any
    }

    // Also sync year-sharded DBs with JWT
    const { listShardYears: listBookingShardYears, getDBForYear: getBookingsDBForYear } = useBookingDBByYear()
    const { listShardYears: listTransactionShardYears, getDBForYear: getTransactionsDBForYear } = useTransactionDBByYear()

    const bookingYears = await listBookingShardYears()
    const transactionYears = await listTransactionShardYears()

    for (const year of Array.from(new Set([...bookingYears, ...transactionYears]))) {
      // bookings shard
      try {
        const bdb = await getBookingsDBForYear(year)
        const { url: burl, headers: bheaders } = buildJWTRemoteUrl(creds.baseUrl, (bdb as any).name as string, creds.token)
        const bsync = bdb.sync(burl, { 
          live: true, 
          retry: true,
          headers: bheaders
        })
        bsync.on('error', (err: any) => console.error(`[sync:${(bdb as any).name}]`, err))
        syncHandlers.value[(bdb as any).name] = bsync as any
      } catch (e) {
        console.warn('Failed to start bookings shard sync for year', year, e)
      }

      // transactions shard
      try {
        const tdb = await getTransactionsDBForYear(year)
        const { url: turl, headers: theaders } = buildJWTRemoteUrl(creds.baseUrl, (tdb as any).name as string, creds.token)
        const tsync = tdb.sync(turl, { 
          live: true, 
          retry: true,
          headers: theaders
        })
        tsync.on('error', (err: any) => console.error(`[sync:${(tdb as any).name}]`, err))
        syncHandlers.value[(tdb as any).name] = tsync as any
      } catch (e) {
        console.warn('Failed to start transactions shard sync for year', year, e)
      }
    }
  }

  const stopCouchSync = async () => {
    const handlers = syncHandlers.value
    for (const key of Object.keys(handlers)) {
      try {
        handlers[key]?.cancel?.()
      } catch {}
    }
    syncHandlers.value = {}
  }

  return { initializeLocalDatabases, startCouchSync, startJWTSync, stopCouchSync }
}