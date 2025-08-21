"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Edit3, User, Mail, Phone, Shield, Camera } from "lucide-react";

// Supabase client setup
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
      if (!user?.account?.account_id) {
        setPhoneNumber('');
        setPhoneLoading(false);
        return;
      }

      try {
        setPhoneLoading(true);
        
        const { data, error } = await supabase
          .from('phone')
          .select('*')
          .eq('account_id', user.account.account_id)
          .order('is_primary', { ascending: false })
          .limit(1);

        if (error) throw error;

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
    <div className="w-full">
      {/* Mobile-First Container */}
      <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Card className="w-full border-0 shadow-sm sm:border sm:shadow-md">
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6 space-y-2">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="hidden sm:inline">Customer Information</span>
              <span className="sm:hidden">Profile</span>
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View and manage your account details
            </p>
          </CardHeader>
          
          <Separator className="hidden sm:block" />
          
          <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
            <div className="space-y-6 sm:space-y-8">
              
              {/* Mobile-Optimized Profile Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                {/* Avatar with Mobile Upload */}
                <div className="relative">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 ring-2 ring-border">
                    <AvatarImage 
                      src={selectedImage || "/images/team/customer-default.png"}
                      alt="Customer Profile"
                      className="object-cover"
                    />
                    <AvatarFallback className="text-sm sm:text-lg font-medium">
                      {user?.account?.first_name?.[0]}{user?.account?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Mobile Photo Change - Floating Button */}
                  <label htmlFor="photo-upload-mobile" className="absolute -bottom-1 -right-1 sm:hidden">
                    <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg cursor-pointer hover:bg-primary/90 transition-colors">
                      <Camera className="h-3 w-3" />
                    </div>
                    <input
                      id="photo-upload-mobile"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="flex-1 text-center sm:text-left space-y-2 sm:space-y-3">
                  <h3 className="text-lg sm:text-xl font-semibold">
                    {user?.account?.first_name} {user?.account?.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customer Account
                  </p>
                  
                  {/* Desktop Photo Change Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden sm:flex gap-2 h-10 touch-target"
                    onClick={() => document.getElementById('photo-upload-desktop')?.click()}
                  >
                    <Edit3 className="h-4 w-4" />
                    Change Photo
                  </Button>
                  <input
                    id="photo-upload-desktop"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <Separator />

              {/* Mobile-First Form Grid */}
              <div className="space-y-4 sm:space-y-6">
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Full Name</span>
                    </Label>
                    <Input
                      value={`${user?.account?.first_name || ''} ${user?.account?.last_name || ''}`}
                      disabled
                      className="bg-muted h-11 touch-target"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>Email Address</span>
                      </div>
                      {user?.email_confirmed_at && (
                        <Badge variant="default" className="text-xs gap-1 ml-auto sm:ml-2">
                          <CheckCircle className="h-3 w-3" />
                          <span className="hidden sm:inline">Verified</span>
                          <span className="sm:hidden">✓</span>
                        </Badge>
                      )}
                    </Label>
                    <Input
                      type="email"
                      value={user?.email || user?.account?.email || ''}
                      disabled
                      className="bg-muted h-11 touch-target"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>Phone Number</span>
                    </Label>
                    <Input
                      value={phoneLoading ? 'Loading...' : (phoneNumber || 'No phone number')}
                      disabled
                      className="bg-muted h-11 touch-target"
                    />
                  </div>

                  {/* Membership */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Membership</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value="Customer"
                        disabled
                        className="bg-muted flex-1 h-11 touch-target"
                      />
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Mobile-Optimized Statistics */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Account Statistics
                </h4>
                
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-primary">0</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Active Bookings
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-secondary/5 border-secondary/20 hover:bg-secondary/10 transition-colors">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold">0</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Completed Services
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-accent/5 border-accent/20 hover:bg-accent/10 transition-colors sm:col-span-2 lg:col-span-1">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold">5.0</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Average Rating
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Mobile-First Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="grid gap-3 sm:flex sm:gap-3">
                  <Button 
                    asChild 
                    className="gap-2 h-11 touch-target w-full sm:w-auto"
                  >
                    <Link href="/customer/edit-profile">
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    asChild 
                    className="gap-2 h-11 touch-target w-full sm:w-auto"
                  >
                    <Link href="/customer/settings">
                      <Shield className="h-4 w-4" />
                      <span>Account Settings</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}