Below are my approach

```
// create all potential databases useState in utils/dbStateHelper.ts

export const useUserState = () => useState('userDB', () => null)
export const useStudentState = () => useState('studentDB', () => null)
export const usePackageState = () => useState('packageDB', () => null)
export const useStudentPackageState = () => useState('studentPackageDB', () => null)
export const useClassTypeState = () => useState('classTypeDB', () => null)
export const useClassState = () => useState('classDB', () => null)
export const useBookingState = () => useState('bookingDB', () => null)
export const useTransactionState = () => useState('transactionDB', () => null)
export const useLocationState = () => useState('locationDB', () => null)


// create a helper to get/init the user database and CRUD helper
export const useUserDB = async() => {
  // permission logic
  const {user} = useAuth()
  const ready = ref(false)
  // check if user is authenticated
  if (!user) {
    throw new Error('User not found')
  }

  if(user.role !== 'admin') {
    throw new Error('User not authorized')
  }
  const db = useUserState()
  if(!db){
    // db is not initialized, initialize it
    db.value = new PouchDB(`${user.id}_users`)
    // setup indexes
    await db.value.createIndex({
      index: { fields: ['type', 'username', 'created_at'] }
    })
    ready.value = true
    // setup indexes
  }
  // then create CRUD helper
  const CRUD = usePouchCRUD(db.value)
  return {db, CRUD, ready}
}

...

```

then i can use the helper to get the user database and CRUD helper

for example, in usePackages.ts
```
 // original code
 export const usePackages = () => {
  const { packages: packagesDB } = usePouchDB()
  const packagesCRUD = usePouchCRUD<PackageDocument>(packagesDB)
  .
  .
  .
 }

// new code
export const usePackages = async() => {
  // wait for db to be ready
  const {db: packagesDB, CRUD: packagesCRUD } = await useUserDB()
  // other code are
  .
  .
  .
}
```