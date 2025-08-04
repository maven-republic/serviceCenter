// Create this as a new component: src/components/debug/AuthDebug.jsx
"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  User, 
  LogIn, 
  Database,
  RefreshCw 
} from 'lucide-react';

export default function AuthDebug() {
  const [authState, setAuthState] = useState({
    loading: true,
    session: null,
    user: null,
    accountData: null,
    customerData: null,
    error: null
  });

  useEffect(() => {
    checkAuthState();
    
    // Listen for auth changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session);
      checkAuthState();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const supabase = createClient();
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 Current session:', session);
      console.log('🔐 Session error:', sessionError);

      if (sessionError) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: `Session error: ${sessionError.message}` 
        }));
        return;
      }

      if (!session) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          session: null, 
          user: null 
        }));
        return;
      }

      // Get account data
      const { data: accountData, error: accountError } = await supabase
        .from('account')
        .select('*')
        .eq('account_id', session.user.id)
        .single();

      console.log('👤 Account data:', accountData);
      console.log('👤 Account error:', accountError);

      // Get customer data
      const { data: customerData, error: customerError } = await supabase
        .from('customer')
        .select('*')
        .eq('account_id', session.user.id)
        .single();

      console.log('🏠 Customer data:', customerData);
      console.log('🏠 Customer error:', customerError);

      setAuthState({
        loading: false,
        session,
        user: session.user,
        accountData,
        customerData,
        error: null
      });

    } catch (error) {
      console.error('💥 Auth check error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Check failed: ${error.message}` 
      }));
    }
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const StatusBadge = ({ condition, trueText, falseText }) => (
    <Badge variant={condition ? "default" : "secondary"}>
      {condition ? (
        <>
          <CheckCircle className="h-3 w-3 mr-1" />
          {trueText}
        </>
      ) : (
        <>
          <AlertCircle className="h-3 w-3 mr-1" />
          {falseText}
        </>
      )}
    </Badge>
  );

  if (authState.loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p>Checking authentication...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Session Status</p>
              <StatusBadge 
                condition={!!authState.session} 
                trueText="Authenticated" 
                falseText="Not logged in" 
              />
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Account Record</p>
              <StatusBadge 
                condition={!!authState.accountData} 
                trueText="Account found" 
                falseText="No account" 
              />
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Customer Record</p>
              <StatusBadge 
                condition={!!authState.customerData} 
                trueText="Customer found" 
                falseText="No customer" 
              />
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Ready for Appointments</p>
              <StatusBadge 
                condition={!!authState.customerData?.customer_id} 
                trueText="Ready" 
                falseText="Not ready" 
              />
            </div>
          </div>

          <div className="space-x-2">
            <Button onClick={checkAuthState} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            {authState.session ? (
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            ) : (
              <Button onClick={handleLogin} size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {authState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{authState.error}</AlertDescription>
        </Alert>
      )}

      {/* Detailed Information */}
      {authState.session && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              User Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Supabase User ID:</p>
              <p className="text-sm text-muted-foreground font-mono">{authState.user.id}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Email:</p>
              <p className="text-sm text-muted-foreground">{authState.user.email}</p>
            </div>

            {authState.accountData && (
              <div>
                <p className="text-sm font-medium">Account Info:</p>
                <p className="text-sm text-muted-foreground">
                  {authState.accountData.first_name} {authState.accountData.last_name}
                  {authState.accountData.role && ` (${authState.accountData.role})`}
                </p>
              </div>
            )}

            {authState.customerData && (
              <div>
                <p className="text-sm font-medium">Customer ID:</p>
                <p className="text-sm text-muted-foreground font-mono">{authState.customerData.customer_id}</p>
              </div>
            )}

            {authState.customerData?.customer_id && (
              <div>
                <Button 
                  size="sm" 
                  onClick={() => window.open(`/api/customers/${authState.customerData.customer_id}/appointments`, '_blank')}
                >
                  Test Appointments API
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Session Help */}
      {!authState.session && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>You are not logged in.</strong> Please log in to access your appointments.
            <div className="mt-2">
              <Button onClick={handleLogin} size="sm">
                Go to Login Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}