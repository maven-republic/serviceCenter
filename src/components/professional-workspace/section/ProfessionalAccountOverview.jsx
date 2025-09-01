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
  AlertCircle,
  Star,
  BarChart3,
  Shield
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
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center space-y-4 sm:space-y-6 w-full max-w-sm">
          <div className="relative">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-primary-100 to-brand-primary-200 mx-auto flex items-center justify-center">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-brand-primary-600" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 sm:h-6 sm:w-6 rounded-full bg-primary animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Loading your profile...</h3>
            <p className="text-sm text-muted-foreground">Setting up your professional workspace</p>
          </div>
        </div>
      </div>
    );
  }

  const needsProfileBoost = profileCompletion < 80;
  const isProfileComplete = profileCompletion >= 90;

  return (
    <div className="space-y-6 sm:space-y-8 p-1">
      {/* Enhanced Welcome Header - Mobile Responsive */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6 lg:space-y-0">
          <div className="space-y-3 sm:space-y-4 flex-1">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  Welcome back, {user?.account?.first_name || 'Professional'}! 👋
                </h1>
                <div className="flex flex-wrap gap-2">
                  {isProfileComplete && (
                    <Badge className="gradient-brand text-white border-0 gap-1.5 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Elite Profile
                    </Badge>
                  )}
                  {profileCompletion >= 80 && profileCompletion < 90 && (
                    <Badge variant="default" className="gap-1.5 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                      <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Complete
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl leading-relaxed">
                Manage your professional profile and account settings to attract more clients and grow your business.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto lg:flex-shrink-0">
            <Button variant="outline" size="sm" className="btn-enhanced gap-2 h-10 sm:h-11 text-sm w-full sm:w-auto">
              <Eye className="h-4 w-4" />
              Preview Profile
            </Button>
            <Button size="sm" className="btn-enhanced btn-brand gap-2 h-10 sm:h-11 text-sm w-full sm:w-auto">
              <Edit className="h-4 w-4" />
              Quick Edit
            </Button>
          </div>
        </div>

      </div>

      {/* Enhanced Main Content - Mobile Responsive - BORDERLESS */}
      <div className="space-y-6 sm:space-y-8">
        {/* Account Overview Section - REMOVED OUTER BORDER */}
        <div className="hover:bg-muted/20 transition-colors duration-300 rounded-lg">
          <div className="p-4 sm:p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex-shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl font-semibold text-foreground">Account Overview</h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Manage your basic account information and contact details</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Essential
                </Badge>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <AccountOverview />
          </div>
        </div>

        {/* Professional Services Section - REMOVED OUTER BORDER */}
        <div className="hover:bg-muted/20 transition-colors duration-300 rounded-lg">
          <div className="p-4 sm:p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex-shrink-0">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl font-semibold text-foreground">Professional Services</h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Define and manage the services you offer to clients</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="gap-1.5 border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300 text-xs">
                  <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Required
                </Badge>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <Competence />
          </div>
        </div>

        {/* Education Section - REMOVED OUTER BORDER */}
        <div className="hover:bg-muted/20 transition-colors duration-300 rounded-lg">
          <div className="p-4 sm:p-6 border-b border-border">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800 flex-shrink-0">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-semibold text-foreground">Education & Qualifications</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Showcase your educational background and certifications</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <Education />
          </div>
        </div>

        {/* Work Experience Section - REMOVED OUTER BORDER */}
        <div className="hover:bg-muted/20 transition-colors duration-300 rounded-lg">
          <div className="p-4 sm:p-6 border-b border-border">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-100 to-amber-200 dark:from-orange-900 dark:to-amber-800 flex-shrink-0">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-semibold text-foreground">Work Experience</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Document your professional experience and career achievements</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <WorkExperience />
          </div>
        </div>

        {/* Security Settings Section - REMOVED OUTER BORDER */}
        <div className="hover:bg-muted/20 transition-colors duration-300 rounded-lg">
          <div className="p-4 sm:p-6 border-b border-border">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-100 to-pink-200 dark:from-red-900 dark:to-pink-800 flex-shrink-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-semibold text-foreground">Security Settings</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Manage your account security and password preferences</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Change Password Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 sm:h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                <h4 className="text-base sm:text-lg font-semibold text-foreground">Change Password</h4>
              </div>
              <ChangePassword />
            </div>

            {/* Confirm Password Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 sm:h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                <h4 className="text-base sm:text-lg font-semibold text-foreground">Confirm Password</h4>
              </div>
              <ConfirmPassword />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}