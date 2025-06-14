// ===================================================================
// FILE: workExperienceFunction.js
// ===================================================================
export async function createWorkExperienceRecords(supabase, professionalId, workExperience) {
  console.log('🏗️ Creating work experience records for professional:', professionalId)

  try {
    if (workExperience.length > 0) {
      const workRows = workExperience.map(exp => ({
        professional_id: professionalId,
        company_name: exp.freeform_company_name,
        position: exp.position,
        description: exp.description,
        start_date: exp.start_date || null,
        end_date: exp.end_date || null
      }))
      
      const { error: workErr } = await supabase
        .from('professional_work_experience')
        .insert(workRows)
        
      if (workErr) {
        console.error('❌ Work experience insert error:', workErr)
        throw new Error('Failed to insert work experience: ' + workErr.message)
      }

      console.log('✅ Work experience records created:', workExperience.length)
    }

    console.log('✅ All work experience records created successfully')
    return { success: true }

  } catch (error) {
    console.error('❌ Work experience records creation failed:', error)
    throw error
  }
}