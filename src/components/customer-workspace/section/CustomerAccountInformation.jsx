"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";
import { createClient } from '@supabase/supabase-js';

// Supabase client setup (typically in a separate utility file)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CustomerAccountInformation() {
  const { user, fetchUser, updateUser } = useUserStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(true);

  // Fetch phone number when user changes
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      // Ensure we have an account ID to fetch phone numbers
      if (!user?.account?.account_id) {
        setPhoneNumber('');
        setPhoneLoading(false);
        return;
      }

      try {
        setPhoneLoading(true);
        
        // Fetch phone numbers for the specific account
        const { data, error } = await supabase
          .from('phone')
          .select('*')
          .eq('account_id', user.account.account_id)
          .order('is_primary', { ascending: false }) // Primary phones first
          .limit(1); // Limit to first phone number

        if (error) throw error;

        // Set the phone number (primary or first available)
        if (data && data.length > 0) {
          setPhoneNumber(data[0].phone_number);
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
  }, [user?.account?.account_id]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  return (
    <>
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb25">
        <h5 className="list-title">Customer Information</h5>
      </div>
      <div className="col-xl-7">
        <div className="profile-box d-sm-flex align-items-center mb30">
          <div className="profile-img mb20-sm">
            <Image
              height={71}
              width={71}
              className="rounded-circle wa-xs"
              src={selectedImage || "/images/team/customer-default.png"}
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
                  value={`${user?.account?.first_name || ''} ${user?.account?.last_name || ''}`}
                  disabled
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Email Address {user?.email_confirmed_at && <span style={{color: "green"}}>(Verified)</span>}
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
    </>
  );
}