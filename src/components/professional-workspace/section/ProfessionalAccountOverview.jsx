"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";

import DashboardNavigation from "../header/DashboardNavigation";
import Award from "./Award";
import ChangePassword from "./ChangePassword";
import ConfirmPassword from "./ConfirmPassword";
import Education from "./Education";
import ProfileDetails from "./ProfileDetails";
import Competence from "./Competence";
import WorkExperience from "./WorkExperience";

export default function MyProfileInfo() {
  const { user, fetchUser, updateUser } = useUserStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(true);


  if (!user) {
  return <p>Loading your profile...</p>
}

  console.log('🧠 user from userStore:', user);


  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>
                Welcome! {`${user?.account?.first_name || ''} ${user?.account?.last_name || ''}`}
              </h2>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <ProfileDetails />
            <Competence />
            <Education />
            <WorkExperience />
            <Award />
            <ChangePassword />
            <ConfirmPassword />
          </div>
        </div>
      </div>
    </>
  );
}
