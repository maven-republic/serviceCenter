'use server'

import { createClient } from '@/utils/supabase/server'

export async function signupProfessional(formData) {
  const supabase = await createClient()

  // Extract basic account data
  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')
  const userEmail = formData.get('email')
  const phoneNumber = formData.get('phone')
  const password = formData.get('password')

  // Extract professional data
  const experience = formData.get('experience')
  const hourlyRate = formData.get('hourlyRate')
  const dailyRate = formData.get('dailyRate')
  const serviceRadius = formData.get('serviceRadius')
  const websiteUrl = formData.get('websiteUrl')
  const portfolioUrl = formData.get('portfolioUrl')

  // Extract address data
  const streetAddress = formData.get('streetAddress')
  const city = formData.get('city')
  const parish = formData.get('parish')
  const community = formData.get('community')
  const landmark = formData.get('landmark')
  const latitude = formData.get('latitude')
  const longitude = formData.get('longitude')
  const formattedAddress = formData.get('formattedAddress')
  const placeId = formData.get('placeId')
  const isRural = formData.get('isRural') === 'true'
  const rawGoogleData = formData.get('rawGoogleData')

  // Extract complex data
  const services = JSON.parse(formData.get('services') || '[]')
  const serviceStartDates = JSON.parse(formData.get('serviceStartDates') || '{}')
  const availability = JSON.parse(formData.get('availability') || '[]')
  const availabilityOverrides = JSON.parse(formData.get('availabilityOverrides') || '[]')
  const availabilityProtocol = JSON.parse(formData.get('availabilityProtocol') || '{}')
  const certifications = JSON.parse(formData.get('certifications') || '[]')
  const workExperience = JSON.parse(formData.get('workExperience') || '[]')

  // Set email redirect URL
  const origin = process.env.NODE_ENV === 'production' 
    ? 'https://mavenrepublic.com/' // Replace with your actual production domain
    : 'http://localhost:3000'

  console.log('🔗 Email redirect URL:', `${origin}/auth/confirm`)

  // Step 1: Create Supabase Auth User
  const { data, error } = await supabase.auth.signUp({
    email: userEmail,
    password,
    options: {
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
    // Step 2: Insert Account Record
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
    console.log('✅ Account record created')

    // Step 3: Insert Account Role
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
    console.log('✅ Professional role assigned')

    // Step 4: Insert Phone Number
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
    console.log('✅ Phone number saved')

    // Step 5: Insert Professional Address (FIXED VALIDATION)
    console.log('📍 Address validation check:', {
      streetAddress: !!streetAddress,
      city: !!city,
      parish: !!parish,
      latitude: !!latitude,
      longitude: !!longitude,
      formattedAddress: !!formattedAddress
    })

    // Use formattedAddress as fallback for streetAddress
    const finalStreetAddress = streetAddress || formattedAddress || 'Address not specified'
    const finalCity = city || 'Kingston' // Default city for Jamaica
    const finalParish = parish || 'Kingston' // Default parish for Jamaica

    if (latitude && longitude) {
      const { error: addressErr } = await supabase.from('address').insert({
        account_id: userId,
        address_type: 'business',
        is_primary: true,
        street_address: finalStreetAddress,
        city: finalCity,
        parish: finalParish,
        community: community || null,
        landmark: landmark || null,
        is_rural: isRural,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        place_id: placeId || null,
        formatted_address: formattedAddress || finalStreetAddress,
        google_place_data: rawGoogleData ? JSON.parse(rawGoogleData) : null
      })
      
      if (addressErr) {
        console.error('❌ Address insert error:', addressErr)
        throw new Error('Failed to insert professional address: ' + addressErr.message)
      }
      
      console.log('✅ Professional address saved successfully')
    } else {
      const missing = []
      if (!latitude) missing.push('latitude')
      if (!longitude) missing.push('longitude')
      
      console.error('❌ Missing required coordinates:', missing.join(', '))
      console.error('Address data received:', {
        streetAddress: finalStreetAddress,
        city: finalCity,
        parish: finalParish,
        latitude,
        longitude,
        formattedAddress
      })
      
      throw new Error('Professional address requires valid coordinates. Please select an address from the dropdown or enter coordinates manually.')
    }

    // Step 6: Insert Individual Professional Profile
    const { data: professionalData, error: profErr } = await supabase
      .from('individual_professional')
      .insert({
        account_id: userId,
        experience: experience || null,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        daily_rate: dailyRate ? parseFloat(dailyRate) : null,
        website_url: websiteUrl || null,
        portfolio_url: portfolioUrl || null,
        service_radius: serviceRadius ? parseInt(serviceRadius) : null,
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

    console.log('✅ Professional profile created:', professionalData.professional_id)
    const professionalId = professionalData.professional_id

    // Step 7: Insert Professional Services
    if (services.length > 0) {
      const serviceRows = services.map(service_id => ({
        professional_id: professionalId,
        service_id,
        service_start_date: serviceStartDates[service_id] || null,
        is_active: true
      }))
      
      const { error: svcErr } = await supabase.from('professional_service').insert(serviceRows)
      if (svcErr) {
        console.error('❌ Professional service error:', svcErr)
        throw new Error('Failed to insert professional_service: ' + svcErr.message)
      }
      console.log('✅ Professional services linked:', services.length)
    }

    // Step 8: Insert Availability Schedule
    if (availability.length > 0) {
      const availabilityRows = availability.map(a => ({
        professional_id: professionalId,
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time
      }))
      
      const { error: availErr } = await supabase.from('availability').insert(availabilityRows)
      if (availErr) {
        console.error('❌ Availability error:', availErr)
        throw new Error('Failed to insert availability: ' + availErr.message)
      }
      console.log('✅ Availability schedule saved:', availability.length, 'slots')
    }

    // Step 9: Insert Availability Overrides
    if (availabilityOverrides.length > 0) {
      const overrideRows = availabilityOverrides.map(o => ({
        professional_id: professionalId,
        override_date: o.override_date,
        start_time: o.start_time,
        end_time: o.end_time,
        is_available: o.is_available !== false
      }))
      
      const { error: overrideErr } = await supabase.from('availability_override').insert(overrideRows)
      if (overrideErr) {
        console.error('❌ Availability override error:', overrideErr)
        throw new Error('Failed to insert availability overrides: ' + overrideErr.message)
      }
      console.log('✅ Availability overrides saved:', availabilityOverrides.length)
    }

    // Step 10: Process Certifications
    for (const cert of certifications) {
      try {
        // Check if certification reference exists
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

        const certificationId = certResult.certification_id

        // Link certification competences
        if (cert.serviceIds?.length) {
          const linkRows = cert.serviceIds.map(cid => ({
            certification_id: certificationId,
            competence_id: cid
          }))
          
          const { error: linkErr } = await supabase.from('professional_certification_competence').insert(linkRows)
          if (linkErr) {
            console.error('❌ Certification competence error:', linkErr)
          }
        }
      } catch (certErr) {
        console.error('❌ Certification processing error:', certErr)
        // Continue with other certifications
      }
    }
    
    if (certifications.length > 0) {
      console.log('✅ Certifications processed:', certifications.length)
    }

    // Step 11: Process Work Experience
    if (workExperience.length > 0) {
      const workRows = workExperience.map(exp => ({
        professional_id: professionalId,
        company_name: exp.freeform_company_name || exp.company_name,
        position: exp.position || null,
        description: exp.description || null,
        start_date: exp.start_date || null,
        end_date: exp.end_date || null,
        freeform_company_name: exp.freeform_company_name || null
      }))
      
      const { error: workErr } = await supabase.from('professional_work_experience').insert(workRows)
      if (workErr) {
        console.error('❌ Work experience error:', workErr)
        // Don't throw - work experience is optional
      } else {
        console.log('✅ Work experience saved:', workExperience.length, 'entries')
      }
    }

    console.log('✅ Professional registration completed successfully')
    return { success: true, professionalId: professionalId }

  } catch (error) {
    console.error('❌ Professional signup failed:', error)
    
    // Cleanup: Try to delete the auth user if database operations failed
    try {
      await supabase.auth.admin.deleteUser(userId)
      console.log('🧹 Cleaned up auth user after database failure')
    } catch (cleanupError) {
      console.error('❌ Failed to cleanup auth user:', cleanupError)
    }
    
    return { error: error.message }
  }
}