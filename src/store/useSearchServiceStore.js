import { create } from "zustand";
import { createApiClient } from "@/utils/supabase/api"; // Adjust the import path as necessary
export const useSearchServiceStore = create((set, get) => ({
  // Search params
  searchParams: {
    search_text: "",
    min_price: null,
    max_price: null,
    city_filter: null,
    parish_filter: null,
    country_filter: null,
    center_lat: null,
    center_lon: null,
    radius_km: null,
    limit_val: 20,
    offset_val: 0,
  },

  // Search results
  results: [],
  loading: false,
  error: null,

  // Update search params
  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),

  // Clear search params/results
  clearSearch: () =>
    set({
      searchParams: {
        search_text: "",
        min_price: null,
        max_price: null,
        city_filter: null,
        parish_filter: null,
        country_filter: null,
        center_lat: null,
        center_lon: null,
        radius_km: null,
        limit_val: 20,
        offset_val: 0,
      },
      results: [],
      loading: false,
      error: null,
    }),

  fetchResults: async () => {
    set({ loading: true, error: null });
    try {
      const state = get();
      let supabase = createApiClient();
      // ✅ Get user's current session from Supabase client in browser
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // ✅ Build authorization header if user is logged in
      const headers = {
        "Content-Type": "application/json",
        ...(session?.access_token && {
          Authorization: `Bearer ${session.access_token}`,
        }),
      };

      const res = await fetch("/api/search/services", {
        method: "POST",
        headers,
        body: JSON.stringify(state.searchParams),
      });
      console.log(" kk",res);

      const data = await res.json();
      console.log("Search results - kk:", data);
      if (!res.ok) {
        console.error("Search API error:", data);
      }
      if (!res.ok) throw new Error(data.error || "Unknown error");

      set({ results: data, loading: false });
    } catch (err) {
      console.error("Search failed:", err);
      set({ error: err.message, loading: false });
    }
  },
}));
