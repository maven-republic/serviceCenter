// ===================================================================
// FILE: serviceCompetenceFunction.js
// ===================================================================
export async function createServiceRecords(supabase, professionalId, serviceData) {
  console.log('🏗️ Creating service records for professional:', professionalId)

  try {
    const { services = [], serviceStartDates = {} } = serviceData

    if (services.length > 0) {
      const rows = services.map(service_id => ({
        professional_id: professionalId,
        service_id,
        service_start_date: serviceStartDates[service_id] || null
      }))
      
      const { error: svcErr } = await supabase.from('professional_service').insert(rows)
      if (svcErr) {
        console.error('❌ Service records insert error:', svcErr)
        throw new Error('Failed to insert professional_service: ' + svcErr.message)
      }

      console.log('✅ Service records created:', services.length)
    }

    console.log('✅ All service records created successfully')
    return { success: true }

  } catch (error) {
    console.error('❌ Service records creation failed:', error)
    throw error
  }
}
