// ===================================================================
// FILE: certificationFunction.js
// ===================================================================
export async function createCertificationRecords(supabase, professionalId, certifications) {
  console.log('🏗️ Creating certification records for professional:', professionalId)

  try {
    for (const cert of certifications) {
      console.log('🔍 Processing certification:', cert.certificationName)

      // Look for existing certification reference
      const { data: ref } = await supabase
        .from('certification')
        .select('certification_id')
        .eq('name', cert.certificationName)
        .maybeSingle()

      // Insert professional certification
      const { data: certResult, error: certError } = await supabase
        .from('professional_certification')
        .insert({
          professional_id: professionalId,
          issue_date: cert.issueDate || null,
          expiration_date: cert.expirationDate || null,
          verification_url: cert.verificationUrl || null,
          certification_reference_id: ref?.certification_id || null
        })
        .select()
        .single()

      if (certError || !certResult) {
        console.error('❌ Certification insert error:', certError)
        throw new Error('Failed to insert certification: ' + (certError?.message || ''))
      }

      // Link certification to competences/services
      if (cert.serviceIds?.length) {
        const linkRows = cert.serviceIds.map(cid => ({
          certification_id: certResult.certification_id,
          competence_id: cid
        }))
        
        const { error: linkErr } = await supabase
          .from('professional_certification_competence')
          .insert(linkRows)
          
        if (linkErr) {
          console.error('❌ Certification competence link error:', linkErr)
          // Don't throw - this is non-critical
        } else {
          console.log('✅ Certification competences linked')
        }
      }

      console.log('✅ Certification created:', certResult.certification_id)
    }

    console.log('✅ All certification records created successfully')
    return { success: true }

  } catch (error) {
    console.error('❌ Certification records creation failed:', error)
    throw error
  }
}
