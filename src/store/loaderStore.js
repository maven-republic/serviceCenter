import { create } from 'zustand';

export const useLoaderStore = create((set) => ({
  loading: {
    message: '',
    state: false,
  },

  startLoading: (message) =>
    set({
      loading: {
        message: message || 'Loading...',
        state: true, // ✅ loading has started
      },
    }),

  stopLoading: () =>
    set({
      loading: {
        message: '',
        state: false,
      },
    }),
}));
