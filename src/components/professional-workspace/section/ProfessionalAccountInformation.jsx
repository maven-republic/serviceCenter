
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";
import { createClient } from '@supabase/supabase-js';

<<<<<<<< HEAD:src/components/customer-workspace/section/CustomerAccountOverview.jsx
import CustomerNavigation from "../navigation/CustomerNavigation";
// import Award from "./Award";
// import ChangePassword from "./ChangePassword";
// import ConfirmPassword from "./ConfirmPassword";
// import Education from "./Education";
import CustomerAccountInformation from "./CustomerAccountInformation";
// import Competence from "./Competence";
// import WorkExperience from "./WorkExperience";


export default function CustomerAccountOverview() {
========
import DashboardNavigation from "../header/DashboardNavigation";
import Award from "./Award";
import ChangePassword from "./ChangePassword";
import ConfirmPassword from "./ConfirmPassword";
import Education from "./Education";
import ProfileDetails from "./ProfileDetails";
import Competence from "./Competence";
import WorkExperience from "./WorkExperience";


export default function MyProfileInfo() {
>>>>>>>> chat-app-implementation:src/components/professional-workspace/section/ProfessionalAccountInformation.jsx

  const { user, fetchUser, updateUser } = useUserStore();
    const [selectedImage, setSelectedImage] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneLoading, setPhoneLoading] = useState(true);


  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
<<<<<<<< HEAD:src/components/customer-workspace/section/CustomerAccountOverview.jsx
            {/* <CustomerNavigation /> */}
========
            <DashboardNavigation />
>>>>>>>> chat-app-implementation:src/components/professional-workspace/section/ProfessionalAccountInformation.jsx
          </div>
          <div className="col-lg-9">
            <div className="dashboard_title_area">
            {/* <div className="mb20">
               Welcome
                <input
                  type="text"
                  className="form-control" 
                  value={`${user?.account?.first_name || ''} ${user?.account?.last_name || ''}`}
                  disabled
                />
              </div> */}

              <h2>Welcome! {`${user?.account?.first_name || ''} ${user?.account?.last_name || ''}`}</h2>

              {/* <p className="text">Lorem ipsum dolor sit amet, consectetur.</p> */}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
<<<<<<<< HEAD:src/components/customer-workspace/section/CustomerAccountOverview.jsx
            <CustomerAccountInformation />
            {/* <Competence />
========
            <ProfileDetails />
            <Competence />
>>>>>>>> chat-app-implementation:src/components/professional-workspace/section/ProfessionalAccountInformation.jsx
            <Education />
            <WorkExperience />
            <Award />
            <ChangePassword />
<<<<<<<< HEAD:src/components/customer-workspace/section/CustomerAccountOverview.jsx
            <ConfirmPassword /> */}
========
            <ConfirmPassword />
>>>>>>>> chat-app-implementation:src/components/professional-workspace/section/ProfessionalAccountInformation.jsx
          </div>
        </div>
      </div>
    </>
  );
}
<<<<<<<< HEAD:src/components/customer-workspace/section/CustomerAccountOverview.jsx

========
>>>>>>>> chat-app-implementation:src/components/professional-workspace/section/ProfessionalAccountInformation.jsx
