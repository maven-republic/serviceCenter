'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useUserStore } from '@/store/userStore'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function AccountOverview() {
  const { user, fetchUser } = useUserStore()
  const supabase = useSupabaseClient()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(true)

  useEffect(() => {
    if (user?.account) {
      setFirstName(user.account.first_name || '')
      setLastName(user.account.last_name || '')
      setEmail(user.email || user.account.email || '')
    }
  }, [user])

  useEffect(() => {
    const fetchPhone = async () => {
      if (!user?.account?.account_id) return setPhoneLoading(false)
      const { data } = await supabase
        .from('phone')
        .select('*')
        .eq('account_id', user.account.account_id)
        .order('is_primary', { ascending: false })
        .limit(1)

      if (data?.[0]?.phone_number) setPhoneNumber(data[0].phone_number)
      setPhoneLoading(false)
    }
    fetchPhone()
  }, [user?.account?.account_id, supabase])

  const handleSave = async () => {
    const updates = {
      first_name: firstName,
      last_name: lastName,
      email: email,
    }

    await supabase
      .from('account')
      .update(updates)
      .eq('account_id', user.account.account_id)

    await supabase
      .from('phone')
      .update({ phone_number: phoneNumber })
      .eq('account_id', user.account.account_id)
      .eq('is_primary', true)

    await fetchUser(user, supabase)
  }

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      await handleSave()
      e.target.blur() // optional: remove focus after save
    }
  }

  if (!user) return <p>Loading your profile...</p>

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb25">
        <h5 className="list-title">Account Information</h5>
      </div>

      <div className="col-xl-7">
        <div className="profile-box d-sm-flex align-items-center mb30">
          <div className="profile-img mb20-sm">
            <Image
              height={71}
              width={71}
              className="rounded-circle wa-xs"
              src="/images/team/fl-1.png"
              alt="profile"
              style={{ height: '71px', width: '71px', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      <div className="col-lg-7">
        <form className="form-style1">
          <div className="row">
            <div className="col-sm-6">
              <label className="heading-color ff-heading fw500 mb10">First Name</label>
              <input
                type="text"
                className="form-control mb10"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="col-sm-6">
              <label className="heading-color ff-heading fw500 mb10">Last Name</label>
              <input
                type="text"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="col-sm-6">
              <label className="heading-color ff-heading fw500 mb10">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="col-sm-6">
              <label className="heading-color ff-heading fw500 mb10">Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={phoneLoading ? 'Loading...' : phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleKeyDown}
                disabled={phoneLoading}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
