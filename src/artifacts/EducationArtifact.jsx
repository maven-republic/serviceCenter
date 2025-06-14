import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import InstitutionArtifact from './education/InstitutionArtifact'
import CredentialArtifact from './education/CredentialArtifact'
import FieldOfStudyArtifact from './education/FieldOfStudyArtifact'
import EducationTimelineArtifact from './education/EducationTimelineArtifact'
import DescriptionArtifact from './education/DescriptionArtifact'

export default function EducationArtifact({ data }) {
  const supabase = useSupabaseClient()
  const [children, setChildren] = useState([])
  const edu = data

  useEffect(() => {
    const fetchChildren = async () => {
      const { data: childArtifacts, error } = await supabase
        .from('artifact')
        .select('*')
        .eq('parent_artifact_id', edu.artifact_id)
        .order('position')

      if (error) console.error('Failed to load child artifacts:', error)
      else setChildren(childArtifacts)
    }

    fetchChildren()
  }, [edu.artifact_id])

  const getChildByKey = (key) =>
    children.find((child) => child.artifact_key === key)

  return (
    <li className="mb-4 pb-4 position-relative" style={{ paddingLeft: '1rem' }}>
      <div className="position-absolute bg-secondary opacity-25" 
        style={{ left: '12px', top: 0, bottom: 0, width: '1px' }} />

      <div className="card border-0">
        <div className="card-body p-3">

          {/* Institution */}
          <InstitutionArtifact institution={{ name: getChildByKey('institution')?.properties?.text }} />

          {/* Degree + Field */}
          <h6 className="card-subtitle mb-2 text-muted fw-normal">
            <CredentialArtifact degree={{ name: getChildByKey('degree')?.properties?.text }} />
            <FieldOfStudyArtifact field={{ name: getChildByKey('field_of_study')?.properties?.text }} />
          </h6>

          {/* Timeline */}
          <EducationTimelineArtifact
            start={getChildByKey('date_range')?.properties?.text?.split(' – ')[0]}
            end={getChildByKey('date_range')?.properties?.text?.split(' – ')[1]}
          />

          {/* Description */}
          <DescriptionArtifact description={getChildByKey('description')?.properties?.text} />

          {/* Education Level from parent */}
          {edu.properties?.education_level && (
            <div className="mt-3">
              <span className="badge rounded-pill px-3 py-2 fw-normal text-uppercase" style={{
                backgroundColor: 'rgba(91, 187, 123, 0.1)',
                color: 'var(--primary-color, #5bbb7b)',
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                border: '1px solid rgba(91, 187, 123, 0.2)'
              }}>
                {edu.properties.education_level.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
