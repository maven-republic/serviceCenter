'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useUserStore } from '@/store/userStore'
import AvailabilityViewer from '@/components/professional-workspace/availability/AvailabilityViewer'

export default function AvailabilityPage() {
  const supabase = createClient()
  const userStore = useUserStore()
  const user = userStore.user

  const [formData, setFormData] = useState({
    availability: [],
    availabilityOverrides: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user?.profile?.professional_id) {
        console.warn('⛔ No professional_id found in user profile')
        return
      }

      const professional_id = user.profile.professional_id

      const { data: availability } = await supabase
        .from('availability')
        .select('day_of_week, start_time, end_time')
        .eq('professional_id', professional_id)

      const { data: overrides } = await supabase
        .from('availability_override')
        .select('override_date, start_time, end_time, is_available')
        .eq('professional_id', professional_id)

      setFormData({
        availability: availability || [],
        availabilityOverrides: overrides || []
      })

      setLoading(false)
    }

    fetchAvailability()
  }, [user])

  if (loading) {
    return <p className="text-center py-5">Loading availability...</p>
  }

  const updateFormData = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <AvailabilityViewer
    availability={formData.availability}
    overrides={formData.availabilityOverrides}
  />
  )

}
