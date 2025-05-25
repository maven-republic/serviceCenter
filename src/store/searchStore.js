// src/store/searchStore.js
import { create } from 'zustand'

const useSearchStore = create((set) => ({
  searchQuery: '',
  searchResults: [],
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
}))

export default useSearchStore

