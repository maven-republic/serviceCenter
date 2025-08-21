"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";
import { createClient } from '@supabase/supabase-js';
import CustomerAccountInformation from "./CustomerAccountInformation";

export default function CustomerAccountOverview() {
  const { user, fetchUser, updateUser } = useUserStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(true);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Remove all the legacy Bootstrap-style classes */}
      <div className="w-full max-w-none">
        {/* Mobile-first container with proper padding */}
        <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          
          {/* Optional: Welcome Section */}
          <div className="mb-6 lg:mb-8">
            {/* Only show welcome message if user exists */}
            {user?.account?.first_name && (
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2">
                  Welcome, {user.account.first_name}!
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Manage your account information and preferences
                </p>
              </div>
            )}
          </div>

          {/* Main Content - Full Width */}
          <div className="w-full">
            <CustomerAccountInformation />
          </div>
        </div>
      </div>
    </div>
  );
}