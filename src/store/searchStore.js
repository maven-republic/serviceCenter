// src/store/searchStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSearchStore = create(
  persist(
    (set, get) => ({
      searchQuery: '',
      searchResults: [],
      
      // Add confirmed address storage
      confirmedAddress: null,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      
      // Store the confirmed address from AddressConfirmation
      setConfirmedAddress: (addressData) => {
        console.log('🏠 Storing confirmed address:', addressData)
        set({ confirmedAddress: addressData })
      },
      
      // Get confirmed address for booking
      getConfirmedAddress: () => {
        const state = get()
        return state.confirmedAddress
      },
      
      // Clear confirmed address
      clearConfirmedAddress: () => set({ confirmedAddress: null })
    }),
    {
      name: 'customer-search-storage', // localStorage key
      partialize: (state) => ({ 
        confirmedAddress: state.confirmedAddress 
      })
    }
  )
)

export default useSearchStore