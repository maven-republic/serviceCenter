import { create } from 'zustand'

export const useUserStore = create((set) => ({
  user: null,

  fetchUser: async (sessionUser, supabase) => {
    if (!sessionUser || !supabase) {
      console.warn('⚠️ fetchUser called without valid session or supabase client')
      return
    }

    try {
      // 1. Lookup account via email
      const { data: accountData, error: accountError } = await supabase
        .from('account')
        .select('*')
        .eq('email', sessionUser.email)
        .single()
      if (accountError || !accountData) throw accountError

      const accountId = accountData.account_id

      // 2. Lookup roles
      const { data: roleData, error: roleError } = await supabase
        .from('account_role')
        .select('*')
        .eq('account_id', accountId)
      if (roleError) throw roleError

      const primaryRole = roleData.find(r => r.is_primary)?.role_type || roleData[0]?.role_type || null

      console.log('📦 account roles:', roleData)
      console.log('⭐ primaryRole selected:', primaryRole)

      // 3. Lookup profile
      let profileData = null
      if (primaryRole === 'customer') {
        const { data } = await supabase
          .from('individual_customer')
          .select('*')
          .eq('account_id', accountId)
          .single()
        profileData = data
      } else if (primaryRole === 'professional') {
        const { data } = await supabase
          .from('individual_professional')
          .select('*')
          .eq('account_id', accountId)
          .single()
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
      })
    } catch (error) {
      console.error('❌ Error fetching user:', error)
    }
  },

  updateUser: async (accountId, updates, profileType = null, supabase) => {
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

      const fetchUser = useUserStore.getState().fetchUser
      await fetchUser({ email: updates.email }, supabase)
    } catch (error) {
      console.error('❌ Error updating user:', error)
    }
  },

  logout: async (supabase) => {
    if (supabase) await supabase.auth.signOut()
    set({ user: null })
  },
}))

