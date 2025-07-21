// src/app/api/appointments/[id]/interests/route.js

import { createClientForAPI } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET method to fetch appointment data, interests, and summary
export async function GET(request, { params }) {
  console.log('🔵 GET /api/appointments/[id]/interests - Starting request');
  
  try {
    const resolvedParams = await params;
    const appointmentId = resolvedParams.id;

    console.log('📝 Fetching data for appointment ID:', appointmentId);

    if (!appointmentId) {
      console.error('❌ Missing appointment ID');
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client with enhanced error handling
    let supabase;
    try {
      supabase = createClientForAPI();  // ✅ Use synchronous API client
      console.log('✅ Supabase client created successfully');
      
      // Test the connection by making a simple query
      const { error: testError } = await supabase
        .from('appointment')
        .select('appointment_id')
        .limit(1);
        
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      console.log('✅ Supabase connection test passed');
    } catch (supabaseError) {
      console.error('❌ Failed to create/test Supabase client:', supabaseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed',
          details: supabaseError.message 
        },
        { status: 500 }
      );
    }

    // Fetch appointment data with simplified query first
    console.log('🔍 Fetching appointment data...');
    
    // Step 1: Get basic appointment data first
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointment')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single();

    if (appointmentError) {
      console.error('❌ Failed to fetch appointment:', appointmentError);
      
      if (appointmentError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Appointment not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch appointment',
          details: appointmentError.message 
        },
        { status: 500 }
      );
    }

    if (!appointment) {
      console.error('❌ Appointment not found');
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    console.log('✅ Appointment data fetched successfully');
    console.log('🔍 Appointment has service_id:', appointment.service_id);

    // Step 2: Get service data separately if service_id exists
    let service = null;
    if (appointment.service_id) {
      console.log('🔍 Fetching service data for service_id:', appointment.service_id);
      const { data: serviceData, error: serviceError } = await supabase
        .from('service')
        .select('service_id, name, description, base_price')
        .eq('service_id', appointment.service_id)
        .single();

      if (serviceError) {
        console.warn('⚠️ Failed to fetch service:', serviceError);
        // Don't fail the whole request for missing service
      } else {
        service = serviceData;
        console.log('✅ Service data fetched successfully');
      }
    }

    // Step 3: Get customer data separately if customer_id exists  
    let customer = null;
    if (appointment.customer_id) {
      console.log('🔍 Fetching customer data for customer_id:', appointment.customer_id);
      const { data: customerData, error: customerError } = await supabase
        .from('individual_customer')  // ✅ Fixed: Use 'individual_customer' table
        .select(`
          customer_id,
          account:account!individual_customer_account_id_fkey(
            first_name,
            last_name,
            email
          )
        `)
        .eq('customer_id', appointment.customer_id)
        .single();

      if (customerError) {
        console.warn('⚠️ Failed to fetch customer:', customerError);
        // Don't fail the whole request for missing customer
      } else {
        customer = customerData;
        console.log('✅ Customer data fetched successfully');
      }
    }

    // Combine the data
    const appointmentWithRelations = {
      ...appointment,
      service,
      customer
    };

    // Fetch interests with simplified query (no complex relationships)
    console.log('🔍 Fetching interests...');
    const { data: interests, error: interestsError } = await supabase
      .from('interest')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false });

    if (interestsError) {
      console.error('❌ Failed to fetch interests:', interestsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch interests',
          details: interestsError.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Interests fetched successfully:', interests?.length || 0);

    // Step 4: Fetch professional data for each interest separately
    const interestsWithProfessionals = [];
    
    if (interests && interests.length > 0) {
      console.log('🔍 Fetching professional data for interests...');
      
      for (const interest of interests) {
        let professionalData = null;
        
        if (interest.professional_id) {
          console.log('🔍 Fetching professional:', interest.professional_id);
          
          const { data: professional, error: profError } = await supabase
            .from('individual_professional')
            .select('*')
            .eq('professional_id', interest.professional_id)
            .single();

          if (profError) {
            console.warn('⚠️ Failed to fetch professional:', profError);
          } else {
            // Get account data for the professional
            if (professional?.account_id) {
              const { data: account, error: accountError } = await supabase
                .from('account')
                .select('first_name, last_name, email, profile_picture_url')  // ✅ Fixed: Removed phone_number
                .eq('account_id', professional.account_id)
                .single();

              if (accountError) {
                console.warn('⚠️ Failed to fetch professional account:', accountError);
              } else {
                professional.account = account;
              }
            }
            
            professionalData = professional;
            console.log('✅ Professional data fetched for:', interest.professional_id);
          }
        }

        interestsWithProfessionals.push({
          ...interest,
          professional: professionalData
        });
      }
    }

    // Generate summary statistics
    const summary = {
      total_interests: interestsWithProfessionals?.length || 0,
      active_interests: interestsWithProfessionals?.filter(i => !['withdrawn', 'rejected'].includes(i.status)).length || 0,
      selected_interests: interestsWithProfessionals?.filter(i => i.selected_by_customer).length || 0,
      pending_interests: interestsWithProfessionals?.filter(i => i.status === 'pending').length || 0,
      quoted_interests: interestsWithProfessionals?.filter(i => i.amount && i.amount > 0).length || 0
    };

    console.log('📊 Summary generated:', summary);

    return NextResponse.json({
      success: true,
      appointment: appointmentWithRelations,
      interests: interestsWithProfessionals || [],
      summary
    });

  } catch (error) {
    console.error('❌ API Error in GET /api/appointments/[id]/interests:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Check if it's specifically a Supabase client error
    if (error.message.includes('supabase.from is not a function')) {
      console.error('❌ Supabase client initialization error detected');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database client initialization failed',
          details: 'Supabase client could not be created properly'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST method to handle customer actions on interests
export async function POST(request, { params }) {
  console.log('🔵 POST /api/appointments/[id]/interests - Starting request');
  
  try {
    const resolvedParams = await params;
    const appointmentId = resolvedParams.id;
    
    console.log('📝 Resolved appointment ID:', appointmentId);
    
    if (!appointmentId) {
      console.error('❌ Missing appointment ID');
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('📝 Request body parsed:', {
        action: body.action,
        interest_ids: body.interest_ids,
        dataKeys: Object.keys(body.data || {})
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { action, interest_ids, data } = body;

    if (!action) {
      console.error('❌ Missing action');
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    if (!interest_ids || !Array.isArray(interest_ids) || interest_ids.length === 0) {
      console.error('❌ Missing or invalid interest_ids');
      return NextResponse.json(
        { success: false, error: 'Interest IDs are required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    let supabase;
    try {
      supabase = createClientForAPI();  // ✅ Use synchronous API client
      console.log('✅ Supabase client created');
    } catch (supabaseError) {
      console.error('❌ Failed to create Supabase client:', supabaseError);
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Handle different customer actions
    switch (action) {
      case 'select_professional':
        return await handleSelectProfessional(supabase, appointmentId, interest_ids[0], data);
      
      case 'reject_interests':
        return await handleRejectInterests(supabase, appointmentId, interest_ids, data);
      
      case 'message_professional':
        return await handleMessageProfessional(supabase, appointmentId, interest_ids[0], data);
        
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ API Error in POST /api/appointments/[id]/interests:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT method for professional responses (kept from original)
export async function PUT(request, { params }) {
  console.log('🔵 PUT /api/appointments/[id]/interests - Starting request');
  
  try {
    const resolvedParams = await params;
    const appointmentId = resolvedParams.id;
    
    console.log('📝 Resolved appointment ID:', appointmentId);
    
    if (!appointmentId) {
      console.error('❌ Missing appointment ID');
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('📝 Request body parsed:', {
        action: body.action,
        professional_id: body.professional_id
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { professional_id, action } = body;

    if (!professional_id) {
      console.error('❌ Missing professional_id');
      return NextResponse.json(
        { success: false, error: 'Professional ID is required' },
        { status: 400 }
      );
    }

    if (!action) {
      console.error('❌ Missing action');
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    let supabase;
    try {
      supabase = createClientForAPI();  // ✅ Use synchronous API client
      console.log('✅ Supabase client created');
    } catch (supabaseError) {
      console.error('❌ Failed to create Supabase client:', supabaseError);
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Find the interest record
    console.log('🔍 Finding interest record...');
    const { data: interest, error: findError } = await supabase
      .from('interest')
      .select('*')
      .eq('appointment_id', appointmentId)
      .eq('professional_id', professional_id)
      .single();

    if (findError) {
      console.error('❌ Database error finding interest:', findError);
      
      if (findError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Interest record not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database error finding interest record',
          details: findError.message 
        },
        { status: 500 }
      );
    }

    if (!interest) {
      console.error('❌ Interest not found');
      return NextResponse.json(
        { success: false, error: 'Interest record not found' },
        { status: 404 }
      );
    }

    console.log('✅ Interest found:', interest.interest_id);

    // Handle different professional actions
    switch (action) {
      case 'decline_selection':
        return await handleProfessionalDecline(supabase, interest, body);
      
      case 'accept_selection':
        return await handleProfessionalAccept(supabase, interest, body);
      
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ API Error in PUT /api/appointments/[id]/interests:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// === CUSTOMER ACTION HANDLERS ===

async function handleSelectProfessional(supabase, appointmentId, interestId, data) {
  console.log('🎯 Selecting professional:', { appointmentId, interestId });
  
  try {
    const { customer_notes } = data || {};

    // Update the selected interest
    const { data: updatedInterest, error: updateError } = await supabase
      .from('interest')
      .update({
        selected_by_customer: true,
        customer_selected_at: new Date().toISOString(),
        customer_notes: customer_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('interest_id', interestId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update interest:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to select professional',
          details: updateError.message 
        },
        { status: 500 }
      );
    }

    // Update appointment status
    const { error: appointmentError } = await supabase
      .from('appointment')
      .update({
        status: 'professional_selected',
        updated_at: new Date().toISOString()
      })
      .eq('appointment_id', appointmentId);

    if (appointmentError) {
      console.warn('⚠️ Failed to update appointment status:', appointmentError);
      // Don't fail the request for this
    }

    console.log('✅ Professional selected successfully');

    return NextResponse.json({
      success: true,
      message: 'Professional selected successfully',
      interest: updatedInterest
    });

  } catch (error) {
    console.error('❌ Error selecting professional:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to select professional',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function handleRejectInterests(supabase, appointmentId, interestIds, data) {
  console.log('❌ Rejecting interests:', { appointmentId, interestIds });
  
  try {
    const { rejection_reason } = data || {};

    // Update multiple interests
    const { data: updatedInterests, error: updateError } = await supabase
      .from('interest')
      .update({
        status: 'customer_rejected',
        customer_rejected_at: new Date().toISOString(),
        rejection_reason: rejection_reason || null,
        updated_at: new Date().toISOString()
      })
      .in('interest_id', interestIds)
      .select();

    if (updateError) {
      console.error('❌ Failed to reject interests:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to reject interests',
          details: updateError.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Interests rejected successfully');

    return NextResponse.json({
      success: true,
      message: 'Interests rejected successfully',
      interests: updatedInterests
    });

  } catch (error) {
    console.error('❌ Error rejecting interests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reject interests',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function handleMessageProfessional(supabase, appointmentId, interestId, data) {
  console.log('💬 Messaging professional:', { appointmentId, interestId });
  
  try {
    // TODO: Implement messaging functionality
    // This would typically create a message record or notification
    
    console.log('✅ Message sent successfully (placeholder)');

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send message',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// === PROFESSIONAL ACTION HANDLERS ===

async function handleProfessionalDecline(supabase, interest, body) {
  const { 
    decline_reason, 
    decline_message, 
    referral_suggestions = [] 
  } = body;

  console.log('📝 Processing professional decline:', {
    interestId: interest.interest_id,
    reason: decline_reason
  });

  try {
    const updateData = {
      status: 'rejected',
      response: 'declined',
      rejection_reason: decline_reason,
      customer_rejected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (decline_message) {
      updateData.notes = decline_message;
    }

    if (referral_suggestions && referral_suggestions.length > 0) {
      const referralData = {
        decline_reason,
        decline_message,
        referral_suggestions,
        declined_at: new Date().toISOString()
      };
      updateData.customer_notes = JSON.stringify(referralData);
    }

    const { data: updatedInterest, error: updateError } = await supabase
      .from('interest')
      .update(updateData)
      .eq('interest_id', interest.interest_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update interest:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update interest record',
          details: updateError.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Professional decline processed successfully');

    return NextResponse.json({
      success: true,
      message: 'Selection declined successfully',
      interest: updatedInterest
    });

  } catch (error) {
    console.error('❌ Error in professional decline:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process decline',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function handleProfessionalAccept(supabase, interest, body) {
  const { 
    response_message,
    updated_quote,
    schedule_assessment,
    assessment_details 
  } = body;

  console.log('✅ Processing professional acceptance:', {
    interestId: interest.interest_id
  });

  try {
    const updateData = {
      response: 'confirmed',
      customer_selected_at: new Date().toISOString(),
      replied: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (response_message) {
      updateData.customer_notes = response_message;
    }

    if (updated_quote) {
      if (updated_quote.amount) updateData.amount = updated_quote.amount;
      if (updated_quote.duration_hours) updateData.estimated_duration_hours = updated_quote.duration_hours;
    }

    const { data: updatedInterest, error: updateError } = await supabase
      .from('interest')
      .update(updateData)
      .eq('interest_id', interest.interest_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update interest:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update interest record',
          details: updateError.message 
        },
        { status: 500 }
      );
    }

    // Update appointment
    const { error: appointmentError } = await supabase
      .from('appointment')
      .update({
        professional_id: interest.professional_id,
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('appointment_id', interest.appointment_id);

    if (appointmentError) {
      console.error('❌ Failed to update appointment:', appointmentError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to assign appointment',
          details: appointmentError.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Professional acceptance processed successfully');

    return NextResponse.json({
      success: true,
      message: 'Selection accepted successfully',
      interest: updatedInterest
    });

  } catch (error) {
    console.error('❌ Error in professional acceptance:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process acceptance',
        details: error.message 
      },
      { status: 500 }
    );
  }
}