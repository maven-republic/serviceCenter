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
import { CheckCircle, Edit3, User, Mail, Phone, Shield } from "lucide-react";

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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <User className="h-6 w-6" />
          Customer Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View and manage your account details
        </p>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-6">
        {/* Profile Section */}
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={selectedImage || "/images/team/customer-default.png"}
                alt="Customer Profile"
              />
              <AvatarFallback className="text-lg">
                {user?.account?.first_name?.[0]}{user?.account?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {user?.account?.first_name} {user?.account?.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Customer Account
              </p>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit3 className="h-4 w-4" />
                Change Photo
              </Button>
            </div>
          </div>

          <Separator />

          {/* Account Details */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                value={`${user?.account?.first_name || ''} ${user?.account?.last_name || ''}`}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
                {user?.email_confirmed_at && (
                  <Badge variant="default" className="ml-2 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </Label>
              <Input
                type="email"
                value={user?.email || user?.account?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                value={phoneLoading ? 'Loading...' : (phoneNumber || 'No phone number exists')}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Membership */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Membership
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value="Customer"
                  disabled
                  className="bg-muted flex-1"
                />
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Active Bookings</div>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/5 border-secondary/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Completed Services</div>
              </CardContent>
            </Card>
            
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">5.0</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="gap-2">
              <Link href="/customer/edit-profile">
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="gap-2">
              <Link href="/customer/settings">
                <Shield className="h-4 w-4" />
                Account Settings
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}