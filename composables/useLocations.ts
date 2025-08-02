import type { LocationDocument } from './usePouchDB'
import { usePouchDB, usePouchCRUD } from './usePouchDB'

// Transform PouchDB document to display format
const transformLocationDoc = (doc: LocationDocument) => ({
  id: doc._id,
  name: doc.name,
  address: doc.address,
  phone: doc.phone,
  email: doc.email,
  website: doc.website,
  active: doc.active,
  created_at: doc.created_at,
  updated_at: doc.updated_at
})

export const useLocations = () => {
  const { locations: locationsDB } = usePouchDB()
  const locationsCRUD = usePouchCRUD<LocationDocument>(locationsDB)
  
  // Reactive locations list
  const locations = ref<ReturnType<typeof transformLocationDoc>[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load all locations
  const loadLocations = async () => {
    loading.value = true
    error.value = null
    
    try {
      const docs = await locationsCRUD.findAll('location')
      locations.value = docs
        .map(transformLocationDoc)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (err: any) {
      error.value = err.message || 'Failed to load locations'
      console.error('Error loading locations:', err)
    } finally {
      loading.value = false
    }
  }

  // Add new location
  const addLocation = async (locationData: {
    name: string
    address: string
    phone: string
    email: string
    website: string
    active: boolean
  }) => {
    loading.value = true
    error.value = null
    
    try {
      const doc = await locationsCRUD.create({
        type: 'location',
        ...locationData
      })
      
      const location = transformLocationDoc(doc)
      locations.value.unshift(location) // Add to beginning for newest first
      
      return location
    } catch (err: any) {
      error.value = err.message || 'Failed to add location'
      console.error('Error adding location:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update location
  const updateLocation = async (id: string, updates: Partial<{
    name: string
    address: string
    phone: string
    email: string
    website: string
    active: boolean
  }>) => {
    loading.value = true
    error.value = null
    
    try {
      const doc = await locationsCRUD.update(id, updates)
      const location = transformLocationDoc(doc)
      
      // Update in reactive array
      const index = locations.value.findIndex(l => l.id === id)
      if (index !== -1) {
        locations.value[index] = location
      }
      
      return location
    } catch (err: any) {
      error.value = err.message || 'Failed to update location'
      console.error('Error updating location:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete location
  const deleteLocation = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      await locationsCRUD.delete(id)
      
      // Remove from reactive array
      const index = locations.value.findIndex(l => l.id === id)
      if (index !== -1) {
        locations.value.splice(index, 1)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete location'
      console.error('Error deleting location:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get location by ID
  const getLocationById = async (id: string) => {
    try {
      const doc = await locationsCRUD.get(id)
      return transformLocationDoc(doc)
    } catch (err: any) {
      console.error('Error getting location:', err)
      return null
    }
  }

  // Get active locations
  const getActiveLocations = () => {
    return locations.value.filter(location => location.active)
  }

  return {
    locations: readonly(locations),
    loading: readonly(loading),
    error: readonly(error),
    loadLocations,
    addLocation,
    updateLocation,
    deleteLocation,
    getLocationById,
    getActiveLocations
  }
} 