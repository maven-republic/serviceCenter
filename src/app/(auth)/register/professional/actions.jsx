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

  // 🔧 Fix: Use headers to get the origin instead of env var
  const origin = process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' // Replace with your actual production domain
    : 'http://localhost:3000'

  console.log('🔗 Email redirect URL:', `${origin}/auth/confirm`)

  const { data, error } = await supabase.auth.signUp({
    email: userEmail,
    password,
    options: {
      shouldPersistSession: false, // Changed from true - server actions don't need sessions
      emailRedirectTo: `${origin}/auth/confirm`,
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  })

  if (error) {
    console.error('❌ Supabase signup error:', error)
    return { error: error.message }
  }

  if (!data?.user?.id) {
    console.error('❌ No user returned from signup')
    return { error: 'Signup failed - no user created' }
  }

  console.log('✅ User created:', data.user.id)
  const userId = data.user.id

  try {
    // Insert account record
    const { error: accErr } = await supabase.from('account').insert({
      account_id: userId,
      email: userEmail,
      password_hash: 'MANAGED_BY_SUPABASE',
      first_name: firstName,
      last_name: lastName,
      account_status: 'pending',
      email_verified: false
    })
    if (accErr) {
      console.error('❌ Account insert error:', accErr)
      throw new Error('Failed to insert into account: ' + accErr.message)
    }

    // Insert role
    const { error: roleErr } = await supabase.from('account_role').insert({
      account_id: userId,
      role_type: 'professional',
      role_status: 'pending',
      is_primary: true
    })
    if (roleErr) {
      console.error('❌ Role insert error:', roleErr)
      throw new Error('Failed to insert into account_role: ' + roleErr.message)
    }

    // Insert phone
    const { error: phoneErr } = await supabase.from('phone').insert({
      account_id: userId,
      phone_type: 'mobile',
      phone_number: phoneNumber,
      is_primary: true
    })
    if (phoneErr) {
      console.error('❌ Phone insert error:', phoneErr)
      throw new Error('Failed to insert into phone: ' + phoneErr.message)
    }

    // Insert professional profile
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
      console.error('❌ Professional insert error:', profErr)
      throw new Error('Failed to insert individual_professional: ' + (profErr?.message || 'No data returned'))
    }

    console.log('✅ Professional created:', professionalData.professional_id)
    const professionalId = professionalData.professional_id

    // Insert availability
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

    // Education processing with artifact creation
    for (const entry of education) {
      console.log('🔍 Education entry data:', JSON.stringify(entry, null, 2));

      // First insert the normalized education record
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

      const educationId = eduResult.education_id

      // Create education artifact
      const artifactId = await createEducationArtifact(supabase, {
        userId,
        entry,
        educationId,
        eduResult
      })

      console.log('✅ Education artifact created:', artifactId)

      // Handle competences
      if (entry.competenceIds?.length) {
        const competenceRows = entry.competenceIds.map(cid => ({
          education_id: educationId,
          competence_id: cid
        }))
        const { error: compErr } = await supabase.from('education_competence').insert(competenceRows)
        if (compErr) console.error('❌ Education competence error:', compErr)
      }

      // Handle media
      if (entry.media?.length) {
        const mediaRows = entry.media.map(m => ({
          education_id: educationId,
          url: m.previewUrl || '',
          media_type: m.media_type || 'image',
          title: m.title || '',
          description: m.description || ''
        }))
        const { error: mediaErr } = await supabase.from('education_media').insert(mediaRows)
        if (mediaErr) console.error('❌ Education media error:', mediaErr)
      }
    }

    // Certification processing
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

      if (certError || !certResult) {
        console.error('❌ Certification insert error:', certError)
        throw new Error('Failed to insert certification: ' + (certError?.message || ''))
      }

      const certificationId = certResult.certification_id

      if (cert.serviceIds?.length) {
        const linkRows = cert.serviceIds.map(cid => ({
          certification_id: certificationId,
          competence_id: cid
        }))
        const { error: linkErr } = await supabase.from('professional_certification_competence').insert(linkRows)
        if (linkErr) console.error('❌ Certification competence error:', linkErr)
      }
    }

    // Work experience processing
    if (workExperience.length > 0) {
      const workRows = workExperience.map(exp => ({
        professional_id: professionalId,
        company_name: exp.freeform_company_name,
        position: exp.position,
        description: exp.description,
        start_date: exp.start_date || null,
        end_date: exp.end_date || null
      }))
      const { error: workErr } = await supabase.from('professional_work_experience').insert(workRows)
      if (workErr) console.error('❌ Work experience error:', workErr)
    }

    console.log('✅ Professional signup completed successfully')
    return { success: true }

  } catch (error) {
    console.error('❌ Professional signup failed:', error)
    return { error: error.message }
  }
}

/**
 * Creates education artifact with child artifacts
 * @param {Object} supabase - Supabase client
 * @param {Object} params - Parameters object
 * @param {string} params.userId - User ID
 * @param {Object} params.entry - Education entry from form
 * @param {string} params.educationId - Education ID from professional_education
 * @param {Object} params.eduResult - Full education result from DB
 * @returns {string} - Artifact ID
 */
async function createEducationArtifact(supabase, { userId, entry, educationId, eduResult }) {
  // Step 1: Insert the education artifact (parent)
  const { data: artifactResult, error: artifactError } = await supabase
    .from('artifact')
    .insert({
      account_id: userId,
      type: 'education',
      context_id: educationId,
      properties: {
        education_level: entry.educationLevel || 'bachelor_degree',
        study_mode: entry.studyMode || 'full_time'
      },
      content: [],
      position: 1
    })
    .select('artifact_id')
    .single();

  if (artifactError || !artifactResult) {
    console.error('❌ Failed to insert education artifact:', artifactError);
    throw new Error('Failed to insert education artifact: ' + (artifactError?.message || 'unknown error'));
  }

  const artifactId = artifactResult.artifact_id;

  // Step 2: Get institution name if we have institution_id
  let institutionName = entry.institutionName || 'Institution';
  if (entry.institutionId && entry.institutionId !== '__new') {
    const { data: instData } = await supabase
      .from('institution')
      .select('name')
      .eq('institution_id', entry.institutionId)
      .single();
    
    if (instData?.name) {
      institutionName = instData.name;
    }
  }

  // Step 3: Define child artifacts with proper data mapping
  const childArtifacts = [
    {
      type: 'heading',
      artifact_key: 'degree',
      properties: { 
        text: entry.degreeName || eduResult.degree_title || 'Degree', 
        level: 2 
      },
      position: 0
    },
    {
      type: 'paragraph',
      artifact_key: 'institution',
      properties: { 
        text: institutionName
      },
      position: 1
    },
    {
      type: 'paragraph',
      artifact_key: 'field_of_study',
      properties: { 
        text: entry.fieldName || eduResult.field_of_study || 'Field of Study' 
      },
      position: 2
    },
    {
      type: 'paragraph',
      artifact_key: 'date_range',
      properties: {
        text: `${entry.startDate || eduResult.start_date || 'Start'} – ${entry.endDate || eduResult.end_date || 'End'}`
      },
      position: 3
    },
    {
      type: 'paragraph',
      artifact_key: 'description',
      properties: { 
        text: entry.description || eduResult.description || '' 
      },
      position: 4
    }
  ];

  console.log('🚸 Prepared child artifacts payload:', JSON.stringify(childArtifacts, null, 2));

  // Step 4: Insert child artifacts
  const { data: insertedChildren, error: childErr } = await supabase
    .from('artifact')
    .insert(
      childArtifacts.map((a) => ({
        account_id: userId,
        type: a.type,
        artifact_key: a.artifact_key,
        properties: a.properties,
        position: a.position,
        parent_artifact_id: artifactId,
        content: []
      }))
    )
    .select();

  if (childErr) {
    console.error('❌ Supabase error inserting child artifacts:', childErr);
    throw new Error('Failed to insert child education artifacts — reason: ' + childErr.message);
  }

  console.log('✅ Inserted child artifacts:', insertedChildren);

  return artifactId;
}