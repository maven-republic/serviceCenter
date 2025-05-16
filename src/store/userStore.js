import { create } from 'zustand'

export const useUserStore = create((set) => ({
  user: null,

  fetchUser: async (user, supabase) => {
    if (!user || !supabase) {
      console.warn('⚠️ fetchUser called without valid user or supabase client')
      return
    }

    try {
      const { data: accountData, error: accountError } = await supabase
        .from('account')
        .select('*')
        .eq('account_id', user.id)
        .single()
      if (accountError) throw accountError

      const { data: roleData, error: roleError } = await supabase
        .from('account_role')
        .select('*')
        .eq('account_id', user.id)
      if (roleError) throw roleError

      const primaryRole = roleData.find(r => r.is_primary)?.role_type || roleData[0]?.role_type || null

      console.log('📦 account roles:', roleData)
      console.log('⭐ primaryRole selected:', primaryRole)

      let profileData = null
      if (primaryRole === 'customer') {
        const { data } = await supabase
          .from('individual_customer')
          .select('*')
          .eq('account_id', user.id)
          .single()
        profileData = data
      } else if (primaryRole === 'professional') {
        const { data } = await supabase
          .from('individual_professional')
          .select('*')
          .eq('account_id', user.id)
          .single()
        profileData = data
      }

      set({
        user: {
          ...user,
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

  updateUser: async (userId, updates, profileType = null, supabase) => {
    try {
      await supabase
        .from('account')
        .update(updates)
        .eq('account_id', userId)

      if (profileType === 'professional') {
        await supabase
          .from('individual_professional')
          .update(updates)
          .eq('account_id', userId)
      } else if (profileType === 'customer') {
        await supabase
          .from('individual_customer')
          .update(updates)
          .eq('account_id', userId)
      }

      const fetchUser = useUserStore.getState().fetchUser
      await fetchUser({ id: userId }, supabase)
    } catch (error) {
      console.error('❌ Error updating user:', error)
    }
  },

  logout: async (supabase) => {
    if (supabase) await supabase.auth.signOut()
    set({ user: null })
  },
}))
