// src/components/customer-workspace/customer/auth/Authentication.jsx
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Shield, LogIn, RefreshCw } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useAccountType } from '@/primitives/customer/useAccountType';
import { AccountTypeChecker } from '../debug/AccountTypeChecker';
import { SessionDebugger } from '../debug/SessionDebugger';

export const Authentication = ({ 
  sessionError, 
  onRetry,
  onRefreshAuth 
}) => {
  const router = useRouter();
  const { user, clearUser } = useUserStore();
  const { restoreSession } = useAccountType();

  const handleLogin = () => {
    // Clear any stale data first
    if (clearUser) clearUser();
    
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(window.location.pathname);
    router.push(`/login?returnTo=${returnUrl}`);
  };

  const handleRestoreSession = async () => {
    const result = await restoreSession(user?.email);
    
    if (result.success) {
      alert('✅ Session restored! Refreshing page...');
      window.location.reload();
    } else {
      if (result.redirectToLogin) {
        const confirmLogin = confirm(result.message + '\n\nClick OK to go to login page, or Cancel to stay here.');
        if (confirmLogin) {
          if (clearUser) clearUser();
          const returnUrl = encodeURIComponent(window.location.pathname);
          const emailParam = result.email ? `&email=${encodeURIComponent(result.email)}` : '';
          window.location.href = `/login?returnTo=${returnUrl}${emailParam}`;
        }
      } else {
        alert(result.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            Please log in to view your appointments
          </p>
        </div>
      </div>

      {/* Authentication Required */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Shield className="h-5 w-5" />
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Session Expired:</strong> Your login session has expired or is invalid. 
              {sessionError && (
                <div className="mt-1 text-sm">
                  Error: {sessionError}
                </div>
              )}
            </AlertDescription>
          </Alert>

          {user?.email && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Found stale session data for <strong>{user.email}</strong>. 
                This data will be cleared when you log in again.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-x-3 flex flex-wrap gap-3">
            <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
              <LogIn className="h-4 w-4 mr-2" />
              Log In to Continue
            </Button>
            
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>

            <AccountTypeChecker />

            <SessionDebugger onRestoreSession={handleRestoreSession} />
          </div>

          <div className="text-sm text-muted-foreground">
            After logging in, you'll be redirected back to this page.
          </div>
        </CardContent>
      </Card>

      {/* Helpful Information */}
      <Card>
        <CardHeader>
          <CardTitle>Why am I seeing this?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Your browser had some cached user data, but your actual authentication session with our servers has expired. 
            This is normal and happens for security reasons.
          </p>
          <p>
            Simply log in again to access your appointments and continue where you left off.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};