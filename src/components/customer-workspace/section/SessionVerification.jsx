"use client";

import { useState, useEffect } from 'react';
import { createClient, ensureSession, refreshSession } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export function SessionVerification() {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Starting comprehensive session check...');
      
      // Check localStorage directly
      const localStorageKeys = [];
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('supabase')) {
            localStorageKeys.push(key);
          }
        }
      }
      
      // Check cookies
      const cookies = typeof document !== 'undefined' ? 
        document.cookie.split(';').filter(cookie => cookie.includes('supabase')) : [];
      
      // Check session
      const { session, error: sessionError } = await ensureSession();
      
      // Try refresh if no session
      let refreshedSession = null;
      if (!session && !sessionError) {
        console.log('🔄 No session found, trying refresh...');
        const { session: refreshed, error: refreshError } = await refreshSession();
        refreshedSession = refreshed;
        if (refreshError) {
          console.log('❌ Refresh failed:', refreshError.message);
        }
      }
      
      setSessionInfo({
        hasSession: !!(session || refreshedSession),
        session: session || refreshedSession,
        sessionError,
        localStorageKeys,
        cookies: cookies.map(c => c.trim()),
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('Session check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAllAuth = () => {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      }
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        if (c.includes('supabase')) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        }
      });
      
      console.log('🧹 Cleared all auth data');
      checkSession();
    }
  };

  const forceLogin = async () => {
    const client = createClient();
    
    // Redirect to login
    window.location.href = '/login';
  };

  useEffect(() => {
    checkSession();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Session Verification (Dev Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={checkSession} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Check Session
          </Button>
          <Button onClick={clearAllAuth} size="sm" variant="outline">
            🧹 Clear All Auth
          </Button>
          <Button onClick={forceLogin} size="sm">
            🔐 Go to Login
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        )}

        {sessionInfo && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {sessionInfo.hasSession ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                Session Status: {sessionInfo.hasSession ? 'Found' : 'Not Found'}
              </span>
            </div>

            {sessionInfo.session && (
              <div className="text-sm space-y-1">
                <div><strong>User Email:</strong> {sessionInfo.session.user?.email}</div>
                <div><strong>User ID:</strong> {sessionInfo.session.user?.id}</div>
                <div><strong>Expires At:</strong> {new Date(sessionInfo.session.expires_at * 1000).toLocaleString()}</div>
                <div><strong>Access Token:</strong> {sessionInfo.session.access_token ? '✅ Present' : '❌ Missing'}</div>
              </div>
            )}

            <div className="text-xs space-y-1">
              <div><strong>LocalStorage Keys ({sessionInfo.localStorageKeys.length}):</strong></div>
              {sessionInfo.localStorageKeys.length > 0 ? (
                <ul className="ml-4 space-y-1">
                  {sessionInfo.localStorageKeys.map(key => (
                    <li key={key}>• {key}</li>
                  ))}
                </ul>
              ) : (
                <div className="ml-4 text-red-600">No Supabase keys found in localStorage</div>
              )}
              
              <div><strong>Cookies ({sessionInfo.cookies.length}):</strong></div>
              {sessionInfo.cookies.length > 0 ? (
                <ul className="ml-4 space-y-1">
                  {sessionInfo.cookies.map((cookie, i) => (
                    <li key={i}>• {cookie.split('=')[0]}</li>
                  ))}
                </ul>
              ) : (
                <div className="ml-4 text-red-600">No Supabase cookies found</div>
              )}
              
              <div><strong>Last Check:</strong> {new Date(sessionInfo.timestamp).toLocaleString()}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}