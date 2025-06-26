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
          <ol className="list-unstyled">
            {educationList.map((edu, idx) => (
              <li key={edu.education_id} className={`position-relative ${idx !== educationList.length - 1 ? 'mb-4 pb-4' : ''}`} style={{ paddingLeft: '1rem' }}>
                {/* Horizontal separator line for all but last item */}
                {idx !== educationList.length - 1 && (
                  <div 
                    className="position-absolute border-bottom w-100"
                    style={{
                      bottom: '0',
                      left: '1rem',
                      right: '0',
                      borderColor: '#e9ecef',
                      opacity: 0.5
                    }}
                  ></div>
                )}
                {/* Content Card */}
                <div className="card border-0">
                  <div className="card-body p-3">
                    {/* Edit/Delete Actions */}
                    <div className="dropdown position-absolute" style={{ top: '1rem', right: '1rem' }}>
                      <button 
                        className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                        type="button" 
                        data-bs-toggle="dropdown"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <i className="fas fa-ellipsis-h"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <a className="dropdown-item d-flex align-items-center" href="#" id={`edit-${edu.education_id}`}>
                            <i className="fas fa-edit me-2 text-primary"></i>
                            Edit
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item d-flex align-items-center text-danger" href="#" id={`delete-${edu.education_id}`}>
                            <i className="fas fa-trash me-2"></i>
                            Delete
                          </a>
                        </li>
                      </ul>
                      <Tooltip anchorSelect={`#edit-${edu.education_id}`} className="ui-tooltip">Edit Education</Tooltip>
                      <Tooltip anchorSelect={`#delete-${edu.education_id}`} className="ui-tooltip">Delete Education</Tooltip>
                    </div>

                    {/* Institution (Primary) */}
                    <h4 className="card-title mb-1 fw-bold text-dark">
                      {edu.institution?.name || 'Institution Not Specified'}
                    </h4>

                    {/* Degree (Secondary) */}
                    <h6 className="card-subtitle mb-2 text-muted fw-normal">
                      {edu.degree?.name || 'Degree Not Specified'}
                      {edu.field_of_study?.name && (
                        <span className="ms-1 text-secondary">
                          , {edu.field_of_study.name}
                        </span>
                      )}
                    </h6>

                    {/* Years (Tertiary) */}
                    <p className="mb-3 text-muted" style={{ fontSize: '0.9rem' }}>
                      {edu.start_date?.slice(0, 4)} - {edu.end_date ? edu.end_date.slice(0, 4) : 'Present'}
                    </p>

                    {/* Description */}
                    {edu.description && (
                      <p className="card-text text-muted mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {edu.description}
                      </p>
                    )}

                    {/* Education Level Badge */}
                    {edu.education_level && (
                      <div className="mt-3">
                        <span className="badge rounded-pill px-3 py-2 fw-normal text-uppercase" style={{ 
                          backgroundColor: 'rgba(91, 187, 123, 0.1)', 
                          color: 'var(--primary-color, #5bbb7b)',
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px',
                          border: '1px solid rgba(91, 187, 123, 0.2)'
                        }}>
                          {edu.education_level.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
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