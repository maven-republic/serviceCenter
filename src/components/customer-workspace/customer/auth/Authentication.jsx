// src/components/customer-workspace/customer/auth/Authentication.jsx
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Shield, LogIn, RefreshCw, ArrowLeft } from 'lucide-react';
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

  const handleGoBack = () => {
    router.push('/customer/workspace');
  };

  return (
    <div className="w-full min-h-screen customer-workspace">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          
          {/* Mobile-First Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 sm:mb-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoBack}
                  className="p-2 h-9 w-9 sm:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Authentication Required</h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Please log in to view your appointments
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Authentication Card - Mobile Optimized */}
          <Card className="border-red-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-red-700 text-lg">
                <Shield className="h-5 w-5 flex-shrink-0" />
                <span>Session Expired</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Primary Error Alert */}
              <Alert variant="destructive" className="border-l-4 border-l-red-500">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Your login session has expired or is invalid.</p>
                    {sessionError && (
                      <p className="text-sm bg-red-50 p-2 rounded border">
                        <strong>Error details:</strong> {sessionError}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Stale Session Alert */}
              {user?.email && (
                <Alert className="border-l-4 border-l-amber-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p>
                      Found cached data for <strong className="font-mono text-sm bg-muted px-1 rounded">{user.email}</strong>
                    </p>
                    <p className="text-sm mt-1 text-muted-foreground">
                      This data will be cleared when you log in again.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons - Mobile First Layout */}
              <div className="space-y-3">
                {/* Primary Actions */}
                <div className="grid gap-3 sm:flex sm:gap-3">
                  <Button 
                    onClick={handleLogin} 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 h-11 touch-target"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Log In to Continue
                  </Button>
                  
                  <Button 
                    onClick={onRetry} 
                    variant="outline"
                    className="w-full sm:w-auto h-11 touch-target"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Again
                  </Button>
                </div>

                {/* Debug Actions - Mobile Collapsible */}
                <details className="border rounded-lg">
                  <summary className="p-3 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Advanced Options & Debug Tools
                  </summary>
                  <div className="px-3 pb-3 space-y-3 border-t bg-muted/20">
                    <div className="grid gap-2 sm:flex sm:gap-2 pt-3">
                      <AccountTypeChecker />
                      <SessionDebugger onRestoreSession={handleRestoreSession} />
                    </div>
                  </div>
                </details>
              </div>

              {/* Help Text */}
              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <p className="font-medium mb-1">What happens next?</p>
                <p>After logging in, you'll be redirected back to this page automatically.</p>
              </div>
            </CardContent>
          </Card>

          {/* Information Card - Mobile Optimized */}
          <Card className="bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Why am I seeing this?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Your browser had some cached user data, but your actual authentication session with our servers has expired.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    This happens for security reasons and is completely normal.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Simply log in again to access your appointments and continue where you left off.
                  </p>
                </div>
              </div>

              {/* Quick Help Actions */}
              <div className="pt-3 border-t border-muted">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
                  <button 
                    onClick={handleGoBack}
                    className="text-primary hover:underline font-medium"
                  >
                    ← Go to Dashboard
                  </button>
                  <a 
                    href="/help" 
                    className="text-primary hover:underline font-medium"
                  >
                    Need Help?
                  </a>
                  <a 
                    href="/contact" 
                    className="text-primary hover:underline font-medium"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Bottom Actions */}
          <div className="block sm:hidden pt-4 border-t">
            <Button 
              onClick={handleLogin}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Continue to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};