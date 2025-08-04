"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Settings, 
  GraduationCap,
  Briefcase,
  CheckCircle,
  Edit,
  Eye,
  TrendingUp,
  AlertCircle
} from "lucide-react";

// Import your existing components
import Education from "./Education";
import AccountOverview from "./AccountOverview";
import Competence from "./Competence";
import WorkExperience from "./WorkExperience";
import ChangePassword from "./ChangePassword";
import ConfirmPassword from "./ConfirmPassword";

// Profile completion calculation
const calculateProfileCompletion = (user) => {
  if (!user) return 0;
  
  const checks = [
    user?.account?.first_name,
    user?.account?.last_name,
    user?.account?.email,
    user?.profile?.bio,
    user?.profile?.profile_picture_url,
    user?.addresses?.length > 0,
    user?.phones?.length > 0,
    user?.education?.length > 0,
    user?.workExperience?.length > 0,
    user?.services?.length > 0
  ];
  
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

export default function ProfessionalAccountOverview() {
  const { user, fetchUser, updateUser } = useUserStore();
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    if (user) {
      setProfileCompletion(calculateProfileCompletion(user));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const needsProfileBoost = profileCompletion < 80;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.account?.first_name || 'Professional'}! 👋
              </h1>
              {profileCompletion >= 80 && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Complete
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground max-w-3xl">
              Manage your professional profile and account settings to attract more clients and grow your business.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview Profile
            </Button>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Quick Edit
            </Button>
          </div>
        </div>

        {/* Profile Completion Progress */}
        <Card className={needsProfileBoost ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950" : ""}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">Profile Completion</h3>
                  <p className="text-sm text-muted-foreground">
                    {profileCompletion >= 80 ? "Your profile looks great!" : "Complete your profile to attract more clients"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{profileCompletion}%</div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
              <Progress value={profileCompletion} className="h-2" />
              
              {needsProfileBoost && (
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Complete your profile to improve visibility and attract up to 40% more clients.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Full Width */}
      <div className="space-y-6">
        {/* Account Overview Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Account Overview</CardTitle>
                  <p className="text-sm text-muted-foreground">Basic account information and contact details</p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Essential
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <AccountOverview />
          </CardContent>
        </Card>

        {/* Professional Services Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">Professional Services</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage the services you offer to clients</p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Required
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Competence />
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Education & Qualifications</CardTitle>
                <p className="text-sm text-muted-foreground">Showcase your educational background</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Education />
          </CardContent>
        </Card>

        {/* Work Experience Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Work Experience</CardTitle>
                <p className="text-sm text-muted-foreground">Professional experience and career history</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WorkExperience />
          </CardContent>
        </Card>

        {/* Security Settings Section - Now Inline */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                <CheckCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Security Settings</CardTitle>
                <p className="text-sm text-muted-foreground">Manage your account security and password</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Change Password Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Change Password</h4>
              <ChangePassword />
            </div>

            {/* Confirm Password Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Confirm Password</h4>
              <ConfirmPassword />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}