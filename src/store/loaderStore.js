import { create } from 'zustand'

export const useLoaderStore = create((set) => ({
  loading: false, // Initial state

  startLoading: () => set({ loading: true }),
  stopLoading: () => set({ loading: false }),
}))

