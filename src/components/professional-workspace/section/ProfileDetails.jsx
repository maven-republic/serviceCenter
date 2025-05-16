'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUserStore } from '@/store/userStore'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function ProfileDetails() {
  const { user } = useUserStore()
  const [selectedImage, setSelectedImage] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(true)
  const supabase = useSupabaseClient()

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      if (!user?.account?.account_id) return setPhoneLoading(false)

      try {
        const { data, error } = await supabase
          .from('phone')
          .select('*')
          .eq('account_id', user.account.account_id)
          .order('is_primary', { ascending: false })
          .limit(1)

        if (error) throw error

        if (data?.length) {
          setPhoneNumber(data[0].phone_number)
        }
      } catch (err) {
        console.error('Error fetching phone number:', err)
        setPhoneNumber('')
      } finally {
        setPhoneLoading(false)
      }
    }

    fetchPhoneNumber()
  }, [user?.account?.account_id, supabase])

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
              src={selectedImage || '/images/team/fl-1.png'}
              style={{
                height: '71px',
                width: '71px',
                objectFit: 'cover',
              }}
              alt="profile"
            />
          </div>
        </div>
      </div>
      <div className="col-lg-7">
        <form className="form-style1">
          <div className="row">
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={`${user?.account?.first_name || ''} ${user?.account?.last_name || ''}`}
                  disabled
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Email Address{' '}
                  {user?.email_confirmed_at && (
                    <span style={{ color: 'green' }}>(Verified)</span>
                  )}
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || user?.account?.email}
                  disabled
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={phoneLoading ? 'Loading...' : phoneNumber || 'No phone number exists'}
                  disabled
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Membership
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.primaryRole === 'professional' ? 'Professional' : 'Customer'}
                  disabled
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="text-start">
                <Link className="ud-btn btn-thm" href="/dashboard/edit-profile">
                  Edit Profile
                  <i className="fal fa-arrow-right-long" />
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
