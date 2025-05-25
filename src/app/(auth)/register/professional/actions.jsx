'use server'

import { createClient } from '@/utils/supabase/server'

export async function signupProfessional(formData) {
  const supabase = await createClient()

  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')
  const userEmail = formData.get('email')
  const phoneNumber = formData.get('phone')
  const experience = formData.get('experience')
  const hourlyRate = formData.get('hourlyRate')
  const dailyRate = formData.get('dailyRate')
  const serviceRadius = formData.get('serviceRadius')
  const websiteUrl = formData.get('websiteUrl')
  const portfolioUrl = formData.get('portfolioUrl')
  const password = formData.get('password')

  const services = JSON.parse(formData.get('services') || '[]')
  const serviceStartDates = JSON.parse(formData.get('serviceStartDates') || '{}')
  const availability = JSON.parse(formData.get('availability') || '[]')
  const availabilityOverrides = JSON.parse(formData.get('availabilityOverrides') || '[]')
  const availabilityProtocol = JSON.parse(formData.get('availabilityProtocol') || '{}')
  const education = JSON.parse(formData.get('education') || '[]')
  const certifications = JSON.parse(formData.get('certifications') || '[]')
  const workExperience = JSON.parse(formData.get('workExperience') || '[]')
  

  const { data, error } = await supabase.auth.signUp({ email: userEmail, password })
  if (error || !data?.user?.id) {
    return { error: error?.message || 'Signup failed' }
  }

  const userId = data.user.id

  const { error: accErr } = await supabase.from('account').insert({
    account_id: userId,
    email: userEmail,
    password_hash: 'MANAGED_BY_SUPABASE',
    first_name: firstName,
    last_name: lastName,
    account_status: 'pending',
    email_verified: false
  })
  if (accErr) throw new Error('Failed to insert into account: ' + accErr.message)

  const { error: roleErr } = await supabase.from('account_role').insert({
    account_id: userId,
    role_type: 'professional',
    role_status: 'pending',
    is_primary: true
  })
  if (roleErr) throw new Error('Failed to insert into account_role: ' + roleErr.message)

  const { error: phoneErr } = await supabase.from('phone').insert({
    account_id: userId,
    phone_type: 'mobile',
    phone_number: phoneNumber,
    is_primary: true
  })
  if (phoneErr) throw new Error('Failed to insert into phone: ' + phoneErr.message)

  const { data: professionalData, error: profErr } = await supabase
    .from('individual_professional')
    .insert({
      account_id: userId,
      experience: experience || null,
      hourly_rate: hourlyRate || null,
      daily_rate: dailyRate || null,
      website_url: websiteUrl || null,
      portfolio_url: portfolioUrl || null,
      service_radius: serviceRadius || null,
      verification_status: 'pending',
      default_event_duration: availabilityProtocol.default_event_duration || null,
      min_notice_hours: availabilityProtocol.min_notice_hours || null,
      buffer_minutes: availabilityProtocol.buffer_minutes || null,
      max_bookings_per_day: availabilityProtocol.max_bookings_per_day || null
    })
    .select()
    .single()

  if (profErr || !professionalData) {
    throw new Error('Failed to insert individual_professional: ' + (profErr?.message || 'No data returned'))
  }

  const professionalId = professionalData.professional_id

  if (availability.length > 0) {
    const { error: availErr } = await supabase.from('availability').insert(
      availability.map(a => ({
        professional_id: professionalId,
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time
      }))
    )
    if (availErr) throw new Error('Failed to insert availability: ' + availErr.message)
  }

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
    if (overrideErr) throw new Error('Failed to insert availability overrides: ' + overrideErr.message)
  }

  if (services.length > 0) {
    const rows = services.map(service_id => ({
      professional_id: professionalId,
      service_id,
      service_start_date: serviceStartDates[service_id] || null
    }))
    const { error: svcErr } = await supabase.from('professional_service').insert(rows)
    if (svcErr) throw new Error('Failed to insert professional_service: ' + svcErr.message)
  }

  for (const entry of education) {
    const { data: eduResult, error: eduError } = await supabase
      .from('professional_education')
      .insert({
        professional_id: professionalId,
        institution_id: entry.institutionId !== '__new' ? entry.institutionId : null,
        degree_id: entry.degreeId || null,
        field_of_study_id: entry.fieldOfStudyId || null,
        start_date: entry.startDate || null,
        end_date: entry.endDate || null,
        description: entry.description || null,
        education_level: entry.educationLevel || null

      })
      .select()
      .single()

    if (eduError || !eduResult) throw new Error('Failed to insert education: ' + (eduError?.message || ''))

    const educationId = eduResult.education_id

    if (entry.competenceIds?.length) {
      const competenceRows = entry.competenceIds.map(cid => ({
        education_id: educationId,
        service_id: cid
      }))
      await supabase.from('education_competence').insert(competenceRows)
    }

    if (entry.media?.length) {
      const mediaRows = entry.media.map(m => ({
        education_id: educationId,
        url: m.previewUrl || '',
        media_type: m.media_type || 'image',
        title: m.title || '',
        description: m.description || ''
      }))
      await supabase.from('education_media').insert(mediaRows)
    }
  }

  for (const cert of certifications) {
    const { data: ref } = await supabase
      .from('certification')
      .select('certification_id')
      .eq('name', cert.certificationName)
      .maybeSingle()

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

    if (certError || !certResult) throw new Error('Failed to insert certification: ' + (certError?.message || ''))

    const certificationId = certResult.certification_id

    if (cert.serviceIds?.length) {
      const linkRows = cert.serviceIds.map(cid => ({
        certification_id: certificationId,
        competence_id: cid
      }))
      await supabase.from('professional_certification_competence').insert(linkRows)
    }
  }

  if (workExperience.length > 0) {
    const workRows = workExperience.map(exp => ({
      professional_id: professionalId,
      company_name: exp.freeform_company_name,
      position: exp.position,
      description: exp.description,
      start_date: exp.start_date || null,
      end_date: exp.end_date || null
    }))
    await supabase.from('professional_work_experience').insert(workRows)
  }

  return { success: true }
}
