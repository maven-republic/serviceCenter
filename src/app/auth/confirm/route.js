import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  console.log('🔐 Auth confirmation attempt:', { token_hash: !!token_hash, type })

  if (token_hash && type) {
    const supabase = await createClient()

    try {
      // Verify the OTP token
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })

      if (!error) {
        console.log('✅ Email verification successful')
        
        // Get the verified user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (user && !userError) {
          console.log('👤 Updating account status for user:', user.id)
          
          // Update the account record to mark email as verified and account as active
          const { error: updateError } = await supabase
            .from('account')
            .update({ 
              email_verified: true,
              account_status: 'active' 
            })
            .eq('account_id', user.id)

          if (updateError) {
            console.error('❌ Failed to update account status:', updateError)
            // Still redirect to success since auth verification worked
          } else {
            console.log('✅ Account status updated successfully')
          }
        }

        // Redirect to login with success message
        return NextResponse.redirect(
          new URL('/login?message=' + encodeURIComponent('Email verified successfully! You can now log in.'), request.url)
        )
      } else {
        console.error('❌ Email verification failed:', error)
        return NextResponse.redirect(
          new URL('/login?error=' + encodeURIComponent('Email verification failed: ' + error.message), request.url)
        )
      }
    } catch (err) {
      console.error('❌ Email verification exception:', err)
      return NextResponse.redirect(
        new URL('/login?error=' + encodeURIComponent('Email verification failed. Please try again.'), request.url)
      )
    }
  }

  // Missing required parameters
  console.error('❌ Missing token_hash or type parameters')
  return NextResponse.redirect(
    new URL('/login?error=' + encodeURIComponent('Invalid verification link. Please request a new verification email.'), request.url)
  )
}