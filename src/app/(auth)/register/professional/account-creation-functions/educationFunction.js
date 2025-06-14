import { createEducationArtifact } from '@/artifacts/educationArtifactService'

export async function createEducationRecords(supabase, userId, professionalId, education) {
  console.log('🏗️ Creating education records for professional:', professionalId)

  try {
    for (const entry of education) {
      console.log('🔍 Processing education entry:', JSON.stringify(entry, null, 2))

      // Insert normalized education record
      const { data: eduResult, error: eduError } = await supabase
        .from('professional_education')
        .insert({
          professional_id: professionalId,
          institution_id: entry.institutionId !== '__new' ? entry.institutionId : null,
          degree_id: entry.degreeId || null,
          field_of_study_id: entry.fieldOfStudyId || null,
          degree_title: entry.degreeName || null,
          field_of_study: entry.fieldName || null,
          start_date: entry.startDate || null,
          end_date: entry.endDate || null,
          description: entry.description || null,
          education_level: entry.educationLevel || null,
          study_mode: entry.studyMode || 'full_time'
        })
        .select()
        .single()

      if (eduError || !eduResult) {
        console.error('❌ Education insert error:', eduError)
        throw new Error('Failed to insert education: ' + (eduError?.message || ''))
      }

      // Create artifact representation
      const artifactId = await createEducationArtifact(supabase, {
        userId,
        entry,
        educationId: eduResult.education_id,
        eduResult
      })

      console.log('✅ Education artifact created:', artifactId)

      // Handle competences and media in parallel
      await Promise.allSettled([
        createEducationCompetences(supabase, eduResult.education_id, entry.competenceIds),
        createEducationMedia(supabase, eduResult.education_id, entry.media)
      ])
    }

    console.log('✅ All education records created successfully')
    return { success: true }

  } catch (error) {
    console.error('❌ Education records creation failed:', error)
    throw error
  }
}

async function createEducationCompetences(supabase, educationId, competenceIds) {
  if (!competenceIds?.length) return

  try {
    const competenceRows = competenceIds.map(cid => ({
      education_id: educationId,
      competence_id: cid
    }))
    
    const { error: compErr } = await supabase.from('education_competence').insert(competenceRows)
    if (compErr) {
      console.error('❌ Education competence error:', compErr)
      throw compErr
    }
    
    console.log('✅ Education competences created')
  } catch (error) {
    console.error('❌ Education competences creation failed:', error)
    // Don't throw - this is non-critical
  }
}

async function createEducationMedia(supabase, educationId, media) {
  if (!media?.length) return

  try {
    const mediaRows = media.map(m => ({
      education_id: educationId,
      url: m.previewUrl || '',
      media_type: m.media_type || 'image',
      title: m.title || '',
      description: m.description || ''
    }))
    
    const { error: mediaErr } = await supabase.from('education_media').insert(mediaRows)
    if (mediaErr) {
      console.error('❌ Education media error:', mediaErr)
      throw mediaErr
    }

    console.log('✅ Education media created')
  } catch (error) {
    console.error('❌ Education media creation failed:', error)
    // Don't throw - this is non-critical
  }
}
