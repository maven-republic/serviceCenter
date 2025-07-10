"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Settings, 
  Award as AwardIcon, 
  GraduationCap,
  Briefcase,
  Shield,
  Key,
  CheckCircle,
  Edit,
  Calendar
} from "lucide-react";

// Import your existing components
import Award from "./Award";
import ChangePassword from "./ChangePassword";
import ConfirmPassword from "./ConfirmPassword";
import Education from "./Education";
import AccountOverview from "./AccountOverview";
import Competence from "./Competence";
import WorkExperience from "./WorkExperience";

export default function ProfessionalAccountOverview() {
  const { user, fetchUser, updateUser } = useUserStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(true);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  console.log('🧠 user from userStore:', user);



  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.account?.first_name || 'Professional'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Manage your professional profile and account settings
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Quick Edit
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Overview Section */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Account Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <AccountOverview />
            </CardContent>
          </Card>

          {/* Professional Skills Section */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-3">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Professional Skills</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Competence />
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-3">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Education</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Education />
            </CardContent>
          </Card>

          {/* Work Experience Section */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-3">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Work Experience</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <WorkExperience />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Security & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profile Views</span>
                <Badge variant="outline">127</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">2 days ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-medium">Jan 2024</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Security Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Change Password */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">Change Password</h4>
                </div>
                <ChangePassword />
              </div>

              <Separator />

              {/* Confirm Password */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">Confirm Password</h4>
                </div>
                <ConfirmPassword />
              </div>
            </CardContent>
          </Card>

          {/* Awards Section (Commented out in original) */}
          {/* 
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-3">
              <div className="flex items-center space-x-2">
                <AwardIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Awards & Certifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Award />
            </CardContent>
          </Card>
          */}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}