import { create } from 'zustand'

export const useUserStore = create((set, get) => ({
  user: null,
  isLoading: false,
  lastFetchTime: 0, // 🛡️ Add rate limiting

  fetchUser: async (sessionUser, supabase) => {
    const state = get()
    const now = Date.now()
    
    // 🛡️ Rate limiting: prevent calls within 2 seconds
    if (now - state.lastFetchTime < 2000) {
      console.log('⏳ Rate limited: fetchUser called too soon, skipping...')
      return
    }
    
    // 🛡️ Prevent duplicate calls
    if (state.isLoading) {
      console.log('⏳ fetchUser already in progress, skipping...')
      return
    }

    // 🛡️ Prevent refetching same user
    if (state.user?.email === sessionUser?.email && state.user?.account) {
      console.log('👋 User already loaded for:', sessionUser?.email)
      return
    }

    if (!sessionUser || !supabase) {
      console.warn('⚠️ fetchUser called without valid session or supabase client')
      return
    }

    // 🔒 Set loading state and update last fetch time
    set({ isLoading: true, lastFetchTime: now })

    try {
      console.log('🚀 Fetching user data for:', sessionUser.email)

      // 1. Lookup account via email
      const { data: accountData, error: accountError } = await supabase
        .from('account')
        .select('*')
        .eq('email', sessionUser.email)
        .single()
      
      if (accountError || !accountData) {
        throw new Error(`Account lookup failed: ${accountError?.message}`)
      }

      const accountId = accountData.account_id

      // 2. Lookup roles
      const { data: roleData, error: roleError } = await supabase
        .from('account_role')
        .select('*')
        .eq('account_id', accountId)
      
      if (roleError) {
        throw new Error(`Role lookup failed: ${roleError?.message}`)
      }

      const primaryRole = roleData.find(r => r.is_primary)?.role_type || roleData[0]?.role_type || null

      console.log('📦 account roles:', roleData)
      console.log('⭐ primaryRole selected:', primaryRole)

      // 3. Lookup profile
      let profileData = null
      if (primaryRole === 'customer') {
        const { data, error } = await supabase
          .from('individual_customer')
          .select('*')
          .eq('account_id', accountId)
          .single()
        
        if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
          console.warn('Customer profile lookup failed:', error)
        }
        profileData = data
      } else if (primaryRole === 'professional') {
        const { data, error } = await supabase
          .from('individual_professional')
          .select('*')
          .eq('account_id', accountId)
          .single()
        
        if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
          console.warn('Professional profile lookup failed:', error)
        }
        profileData = data
      }

      // 4. Save to store
      set({
        user: {
          ...sessionUser,
          account: accountData,
          roles: roleData,
          profile: profileData,
          primaryRole,
        },
        isLoading: false
      })

      console.log('✅ User data loaded successfully')
    } catch (error) {
      console.error('❌ Error fetching user:', error)
      
      // 🚫 Don't retry automatically on errors to prevent loops
      set({ 
        isLoading: false,
        // Keep existing user data if fetch fails
        user: state.user || null
      })
    }
  },

  updateUser: async (accountId, updates, profileType = null, supabase) => {
    const state = get()
    
    try {
      await supabase
        .from('account')
        .update(updates)
        .eq('account_id', accountId)

      if (profileType === 'professional') {
        await supabase
          .from('individual_professional')
          .update(updates)
          .eq('account_id', accountId)
      } else if (profileType === 'customer') {
        await supabase
          .from('individual_customer')
          .update(updates)
          .eq('account_id', accountId)
      }

      // 🛡️ Only refetch if enough time has passed
      const now = Date.now()
      if (now - state.lastFetchTime > 2000) {
        await get().fetchUser({ email: updates.email }, supabase)
      }
    } catch (error) {
      console.error('❌ Error updating user:', error)
    }
  },

  logout: async (supabase) => {
    set({ isLoading: true })
    try {
      if (supabase) {
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      set({ user: null, isLoading: false, lastFetchTime: 0 })
    }
  },

  // 🔄 Manual refresh method with rate limiting
  refreshUser: async (supabase) => {
    const state = get()
    const now = Date.now()
    
    if (now - state.lastFetchTime < 5000) { // 5 second rate limit for manual refresh
      console.log('⏳ Manual refresh rate limited')
      return
    }
    
    if (state.user?.email) {
      await get().fetchUser({ email: state.user.email }, supabase)
    }
  }
}))