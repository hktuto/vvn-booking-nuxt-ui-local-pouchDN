import type { PackageDocument } from './usePouchDB'
import { usePouchDB, usePouchCRUD } from './usePouchDB'

// Transform PouchDB document to display format
const transformPackageDoc = (doc: PackageDocument) => ({
  id: doc._id,
  name: doc.name,
  description: doc.description,
  price: doc.price,
  credits: doc.credits,
  duration_days: doc.duration_days,
  active: doc.active,
  created_at: doc.created_at,
  updated_at: doc.updated_at
})

export const usePackages = () => {
  const { packages: packagesDB } = usePouchDB()
  const packagesCRUD = usePouchCRUD<PackageDocument>(packagesDB)
  
  // Reactive packages list
  const packages = ref<ReturnType<typeof transformPackageDoc>[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load all packages
  const loadPackages = async () => {
    loading.value = true
    error.value = null
    
    try {
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
      const doc = await packagesCRUD.create({
        type: 'package',
        ...packageData
      })
      
      const package_ = transformPackageDoc(doc)
      packages.value.unshift(package_) // Add to beginning for newest first
      
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

  // Initialize - load packages on first use
  onMounted(() => {
    loadPackages()
  })

  return {
    packages: readonly(packages),
    loading: readonly(loading),
    error: readonly(error),
    addPackage,
    updatePackage,
    deletePackage,
    getPackageById,
    getActivePackages,
    loadPackages
  }
}