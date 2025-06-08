// components/customer/account/AccountOverview.jsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from '@supabase/supabase-js';

// Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AccountOverview({ userInformation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(true);

  // Fetch phone number when userInformation changes
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      if (!userInformation?.account_id) {
        setPhoneNumber('');
        setPhoneLoading(false);
        return;
      }

      try {
        setPhoneLoading(true);
        
        const { data, error } = await supabase
          .from('phone')
          .select('*')
          .eq('account_id', userInformation.account_id)
          .eq('is_primary', true)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setPhoneNumber(data.phone_number);
        } else {
          setPhoneNumber('');
        }
      } catch (err) {
        console.error('Error fetching phone number:', err);
        setPhoneNumber('');
      } finally {
        setPhoneLoading(false);
      }
    };

    fetchPhoneNumber();
  }, [userInformation?.account_id]);

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
              src={userInformation?.profile_picture_url || "/images/team/default-profile.png"}
              style={{
                height: "71px",
                width: "71px",
                objectFit: "cover",
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
                  value={`${userInformation?.first_name || ''} ${userInformation?.last_name || ''}`}
                  disabled
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Email Address {userInformation?.email_verified && <span style={{color: "green"}}>(Verified)</span>}
                </label>
                <input
                  type="email"
                  className="form-control" 
                  value={userInformation?.email || ''}
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
                  value={phoneLoading ? 'Loading...' : (phoneNumber || 'No phone number exists')}
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
                  value="Customer"
                  disabled
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="text-start">
                <Link className="ud-btn btn-thm" href="/customer/account/profile">
                  Edit Profile
                  <i className="fal fa-arrow-right-long" />
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}