

export async function createAccount(supabase, userId, userData) {
  console.log('🏗️ Creating account records for:', userId)

  try {
    // Insert account record
    const { error: accErr } = await supabase.from('account').insert({
      account_id: userId,
      email: userData.email,
      password_hash: 'MANAGED_BY_SUPABASE',
      first_name: userData.firstName,
      last_name: userData.lastName,
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
      phone_number: userData.phone,
      is_primary: true
    })
    if (phoneErr) {
      console.error('❌ Phone insert error:', phoneErr)
      throw new Error('Failed to insert into phone: ' + phoneErr.message)
    }

    console.log('✅ Account records created successfully')
    return { success: true }

  } catch (error) {
    console.error('❌ Account creation failed:', error)
    throw error
  }
}