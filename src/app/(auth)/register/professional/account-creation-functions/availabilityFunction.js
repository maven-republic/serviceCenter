// ===================================================================
// FILE: availabilityFunction.js
// ===================================================================
export async function createAvailabilityRecords(supabase, professionalId, availabilityData) {
  console.log('🏗️ Creating availability records for professional:', professionalId)

  try {
    const { availability = [], availabilityOverrides = [] } = availabilityData

    // Create regular availability
    if (availability.length > 0) {
      const { error: availErr } = await supabase.from('availability').insert(
        availability.map(a => ({
          professional_id: professionalId,
          day_of_week: a.day_of_week,
          start_time: a.start_time,
          end_time: a.end_time
        }))
      )
      if (availErr) {
        console.error('❌ Availability insert error:', availErr)
        throw new Error('Failed to insert availability: ' + availErr.message)
      }
      console.log('✅ Regular availability created')
    }

    // Create availability overrides
    if (availabilityOverrides.length > 0) {
      const { error: overrideErr } = await supabase.from('availability_override').insert(
        availabilityOverrides.map(o => ({
          professional_id: professionalId,
          override_date: o.override_date,
          start_time: o.start_time,
          end_time: o.end_time,
          is_available: o.is_available !== false
        }))
      )
      if (overrideErr) {
        console.error('❌ Availability override insert error:', overrideErr)
        throw new Error('Failed to insert availability overrides: ' + overrideErr.message)
      }
      console.log('✅ Availability overrides created')
    }

    console.log('✅ All availability records created successfully')
    return { success: true }

  } catch (error) {
    console.error('❌ Availability records creation failed:', error)
    throw error
  }
}