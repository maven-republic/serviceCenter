'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useUserStore } from '@/store/userStore'
import { Tooltip } from 'react-tooltip'

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
          degree(title),
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
      <div className="bdrb1 pb15 mb30 d-sm-flex justify-content-between">
        <h5 className="list-title">Education</h5>
        <a className="add-more-btn text-thm">
          <i className="icon far fa-plus mr10" />
          Add Education
        </a>
      </div>

      <div className="position-relative educational-quality">
        {educationList.length === 0 ? (
          <p>No education records found.</p>
        ) : (
          educationList.map((edu, idx) => (
            <div key={edu.education_id}>
              <div className={`m-circle ${idx === educationList.length - 1 ? 'before-none' : ''} text-thm`}>
                M
              </div>
              <div className="wrapper mb40 position-relative">
                <div className="del-edit">
                  <div className="d-flex">
                    <a className="icon me-2" id={`edit-${edu.education_id}`}>
                      <Tooltip anchorSelect={`#edit-${edu.education_id}`} className="ui-tooltip">Edit</Tooltip>
                      <span className="flaticon-pencil" />
                    </a>
                    <a className="icon" id={`delete-${edu.education_id}`}>
                      <Tooltip anchorSelect={`#delete-${edu.education_id}`} className="ui-tooltip">Delete</Tooltip>
                      <span className="flaticon-delete" />
                    </a>
                  </div>
                </div>
                <span className="tag">
                  {edu.start_date?.slice(0, 4)} - {edu.end_date ? edu.end_date.slice(0, 4) : 'Present'}
                </span>
                <h5 className="mt15">{edu.degree?.title || '—'}</h5>
                <h6 className="text-thm">
                  {(edu.field_of_study?.name ? edu.field_of_study.name + ', ' : '') +
                    (edu.institution?.name || 'Unknown Institution')}
                </h6>
                <p>{edu.description || '—'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
