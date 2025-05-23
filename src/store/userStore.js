import { create } from 'zustand'
import { createClient } from '../utils/supabase/client'

export const useUserStore = create((set) => ({
  user: null,

  fetchUser: async (user) => {
    const supabase = createClient()
    
    try {
      // Fetch basic account information
      const { data: accountData, error: accountError } = await supabase
        .from('account')
        .select('*')
        .eq('account_id', user.id)
        .single()
      
      if (accountError) throw accountError

      // Fetch user roles
      const { data: roleData, error: roleError } = await supabase
        .from('account_role')
        .select('*')
        .eq('account_id', user.id)
      
      if (roleError) throw roleError

      // Determine primary role
      const roles = roleData || []
      const primaryRole = roles.find(role => role.is_primary)?.role_type || 
                         (roles.length > 0 ? roles[0].role_type : null)
      
      // Fetch profile based on role
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

      // Set user with combined data
      set({ 
        user: {
          ...user,
          account: accountData,
          roles: roles,
          profile: profileData,
          primaryRole: primaryRole
        } 
      })
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  },

  updateUser: async (userId, updates, profileType = null) => {
    const supabase = createClient()
    
    try {
      // Determine which table to update based on the type of data
      if (updates.first_name || updates.last_name || updates.email) {
        // Update account table
        const { error } = await supabase
          .from('account')
          .update({
            first_name: updates.first_name,
            last_name: updates.last_name,
            email: updates.email
          })
          .eq('account_id', userId)
          
        if (error) throw error
      }
      
      // Update profile-specific data
      if (profileType) {
        const profileTable = profileType === 'customer' 
          ? 'individual_customer' 
          : 'individual_professional'
          
        const { error } = await supabase
          .from(profileTable)
          .update(updates)
          .eq('account_id', userId)
          
        if (error) throw error
      }
      
      // Update state
      set((state) => ({ 
        user: { 
          ...state.user, 
          account: { ...state.user.account, ...updates },
          profile: profileType ? { ...state.user.profile, ...updates } : state.user.profile
        } 
      }))
    } catch (error) {
      console.error('Update failed:', error)
    }
  },

  logout: async () => {
    const supabase = createClient()
    await supabase.auth.signOut() 
    set({ user: null }) 
  },
}))