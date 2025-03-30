import { create } from 'zustand'
import { createClient } from '../../utils/supabase/client'

export const useUserStore = create((set) => ({
  user: null,

  fetchUser: async (user) => {
    const supabase = createClient()
    const { data, error } = await supabase.from('user_details').select('*').eq('id', user.id).single()
     
    console.log("help: ",{user, data});
    if (error) console.error('Error fetching user:', error) 
    else set({ user: {...user, ...data} })
  },

  updateUser: async (userId, updates) => {
    const supabase = createClient()
    const { error } = await supabase.from('user_details').update(updates).eq('id', userId)

    if (error) {
      console.error('Update failed:', error)
    } else {
      set((state) => ({ user: { ...state.user, ...updates } }))
    }
  },

  logout: async () => {
    const supabase = createClient()
    await supabase.auth.signOut() 
    set({ user: null }) 
  },
}))
