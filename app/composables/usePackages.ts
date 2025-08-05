import type { PackageDocument } from './usePouchDB'
import { usePouchCRUD } from './usePouchDB'
import { usePackageDB } from '~/utils/dbStateHelper'

type TransformPackageDoc = {
  id: string
  name: string
  description: string
  price: number
  credits: number
  duration_days: number
  active: boolean
  is_custom: boolean
  created_at: string
  updated_at: string
}
// Transform PouchDB document to display format
const transformPackageDoc = (doc: PackageDocument):TransformPackageDoc => ({
  id: doc._id,
  name: doc.name,
  description: doc.description,
  price: doc.price,
  credits: doc.credits,
  duration_days: doc.duration_days,
  active: doc.active,
  is_custom: doc.is_custom || false,
  created_at: doc.created_at,
  updated_at: doc.updated_at
})
const useUserPackages = () => useState<TransformPackageDoc[]>('userPackages', () => [])
export const usePackages = () => {
  const { getDB } = usePackageDB()
  
  // Reactive packages list
  const packages = useUserPackages()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load all packages
  const loadPackages = async () => {
    loading.value = true
    error.value = null
    
    try {
      const packagesDB = await getDB()
      const packagesCRUD = usePouchCRUD<PackageDocument>(packagesDB)
      const docs = await packagesCRUD.findAll('package')
      packages.value = docs
        .map(transformPackageDoc)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (err: any) {
      error.value = err.message || 'Failed to load packages'
      console.error('Error loading packages:', err)
    } finally {
      loading.value = false
    }
  }

  // Add new package
  const addPackage = async (packageData: {
    name: string
    description: string
    price: number
    credits: number
    duration_days: number
    active: boolean
    is_custom?: boolean
  }) => {
    loading.value = true
    error.value = null
    
    try {
      const packagesDB = await getDB()
      const packagesCRUD = usePouchCRUD<PackageDocument>(packagesDB)
      const doc = await packagesCRUD.create({
        type: 'package',
        ...packageData
      })
      
      const package_ = transformPackageDoc(doc)
      packages.value.unshift(package_) // Add to beginning for newest first
      console.log('packages.value', packages.value, doc)
      return package_
    } catch (err: any) {
      error.value = err.message || 'Failed to add package'
      console.error('Error adding package:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update package
  const updatePackage = async (id: string, updates: Partial<{
    name: string
    description: string
    price: number
    credits: number
    duration_days: number
    active: boolean
  }>) => {
    loading.value = true
    error.value = null
    
    try {
      const packagesDB = await getDB()
      const packagesCRUD = usePouchCRUD<PackageDocument>(packagesDB)
      const doc = await packagesCRUD.update(id, updates)
      const package_ = transformPackageDoc(doc)
      
      // Update in reactive array
      const index = packages.value.findIndex(p => p.id === id)
      if (index !== -1) {
        packages.value[index] = package_
      }
      
      return package_
    } catch (err: any) {
      error.value = err.message || 'Failed to update package'
      console.error('Error updating package:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete package
  const deletePackage = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const packagesDB = await getDB()
      const packagesCRUD = usePouchCRUD<PackageDocument>(packagesDB)
      const success = await packagesCRUD.remove(id)
      
      if (success) {
        // Remove from reactive array
        const index = packages.value.findIndex(p => p.id === id)
        if (index !== -1) {
          packages.value.splice(index, 1)
        }
      }
      
      return success
    } catch (err: any) {
      error.value = err.message || 'Failed to delete package'
      console.error('Error deleting package:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get package by ID
  const getPackageById = async (id: string) => {
    try {
      const packagesDB = await getDB()
      const packagesCRUD = usePouchCRUD<PackageDocument>(packagesDB)
      const doc = await packagesCRUD.findById(id)
      return doc ? transformPackageDoc(doc) : null
    } catch (err: any) {
      console.error('Error getting package by ID:', err)
      return null
    }
  }

  // Get active packages only
  const getActivePackages = () => {
    return packages.value.filter(p => p.active)
  }

  return {
    packages: readonly(packages),
    loading: readonly(loading),
    error: readonly(error),
    loadPackages,
    addPackage,
    updatePackage,
    deletePackage,
    getPackageById,
    getActivePackages
  }
}