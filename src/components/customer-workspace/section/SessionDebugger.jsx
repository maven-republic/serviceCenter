"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, User, AlertTriangle } from 'lucide-react';

export function SessionDebugger() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();

  const checkSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Manual session check...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('📊 Session check result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        accessToken: session?.access_token ? 'Present' : 'Missing',
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A'
      });
      
      setSession(session);
      setError(error?.message);
    } catch (err) {
      console.error('Session check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const forceLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your-test-email@example.com', // Replace with your test email
        password: 'your-test-password' // Replace with your test password
      });
      
      if (error) throw error;
      console.log('✅ Force login successful');
      checkSession();
    } catch (err) {
      console.error('❌ Force login failed:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state change in debugger:', event, !!session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Session Debugger (Dev Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkSession} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Check Session
          </Button>
          <Button onClick={forceLogin} size="sm" variant="outline">
            <User className="h-4 w-4 mr-2" />
            Force Login (Test)
          </Button>
        </div>

        <div className="text-sm space-y-2">
          <div><strong>Session Status:</strong> {loading ? 'Checking...' : session ? '✅ Found' : '❌ Not Found'}</div>
          
          {session && (
            <>
              <div><strong>User Email:</strong> {session.user?.email}</div>
              <div><strong>Access Token:</strong> {session.access_token ? '✅ Present' : '❌ Missing'}</div>
              <div><strong>Expires At:</strong> {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</div>
              <div><strong>Email Confirmed:</strong> {session.user?.email_confirmed_at ? '✅ Yes' : '❌ No'}</div>
            </>
          )}
          
          {error && (
            <div className="text-red-600"><strong>Error:</strong> {error}</div>
          )}
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Browser Storage Check:</strong></div>
          <div>• Local Storage: {typeof window !== 'undefined' && window.localStorage ? '✅ Available' : '❌ Not Available'}</div>
          <div>• Cookies: {typeof document !== 'undefined' && document.cookie !== undefined ? '✅ Available' : '❌ Not Available'}</div>
          <div>• Current URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</div>
        </div>
      </CardContent>
    </Card>
  );
}