'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useUserStore } from '@/store/userStore'
import { Tooltip } from 'react-tooltip'
import ArtifactInterface from '@/artifacts/ArtifactInterface'


export default function Education() {
  const { user } = useUserStore()
  const supabase = useSupabaseClient()

  const [educationList, setEducationList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEducation = async () => {
      const professionalId = user?.profile?.professional_id
      console.log('📍 Resolved Professional ID:', professionalId)

      if (!professionalId) {
        console.warn('❌ No professional ID found in user.profile')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('professional_education')
        .select(`
          education_id,
          description,
          start_date,
          end_date,
          education_level,
          study_mode,
          field_of_study(name),
          degree(name),
          institution(name)
        `)
        .eq('professional_id', professionalId)

      if (error) {
        console.error('⚠️ Supabase query failed:', error)
      } else {
        console.log('📚 Education records:', data)
        setEducationList(data)
      }

      setLoading(false)
    }

    fetchEducation()
  }, [user?.profile?.professional_id, supabase])

  if (!user) return <p>Loading user info...</p>
  if (loading) return <p>Loading education history...</p>

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h5 className="list-title mb-0 fw-bold">Education</h5>
        <button className="btn btn-outline-primary btn-sm d-flex align-items-center">
          <i className="fas fa-plus me-2"></i>
          Add Education
        </button>
      </div>

      {/* Timeline Container */}
      <div className="position-relative">
        {/* Vertical Timeline Line */}
        <div 
          className="position-absolute bg-secondary opacity-25" 
          style={{
            left: '12px',
            top: '0',
            bottom: '0',
            width: '1px',
            zIndex: 1
          }}
        ></div>

        {educationList.length === 0 ? (
  <div className="text-center py-5">
    <div className="text-muted mb-3">
      <i className="fas fa-graduation-cap fa-3x"></i>
    </div>
    <h6 className="text-muted">No education records found</h6>
    <p className="small text-muted">Add your educational background to showcase your qualifications</p>
  </div>
) : (
  <ArtifactInterface
    artifacts={educationList.map((edu) => ({
      id: edu.education_id,
      type: 'education',
      content: edu
    }))}
  />
)}

      </div>

      <style jsx>{`
        .badge {
          font-weight: 500;
        }
        .dropdown-toggle::after {
          display: none;
        }
      `}</style>
    </div>
  )
}