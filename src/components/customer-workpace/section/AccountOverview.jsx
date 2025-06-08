// components/customer/account/AccountDashboard.jsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";
import { createClient } from '@supabase/supabase-js';

import AccountInformation from "./AccountInformation";


export default function AccountInformation({ userInformation }) {
  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>Welcome! {`${userInformation?.first_name || ''} ${userInformation?.last_name || ''}`}</h2>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <AccountInformation userInformation={userInformation} />

          </div>
        </div>
      </div>
    </>
  );
}