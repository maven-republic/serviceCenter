// src/components/customer-workspace/interests/CustomerAppointmentDashboard.jsx (Updated with Quote Approval)
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle,
  Users,
  BarChart3,
  User,
  Clock,
  AlertTriangle
} from 'lucide-react';

import InterestSelectionCard from './InterestSelectionCard';
import InterestComparisonView from './InterestComparisonView';
import AssessmentScheduler from './AssessmentScheduler';
import CustomerQuoteComparison from './CustomerQuoteComparison';

const CustomerAppointmentDashboard = ({ appointmentId }) => {
  const [appointmentInformation, setAppointmentData] = useState(null);
  const [interests, setInterests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentInterests();
    }
  }, [appointmentId]);

  useEffect(() => {
    if (interests.length > 0) {
      console.log('🔍 DEBUG: Interests data structure:', interests[0]);
      console.log('🔍 DEBUG: First interest fields:', Object.keys(interests[0]));
      if (interests[0].professional) {
        console.log('🔍 DEBUG: Professional fields:', Object.keys(interests[0].professional));
      }
    }
  }, [interests]);

  const fetchAppointmentInterests = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      
      console.log('🔍 Fetching interests for appointment:', appointmentId);
      
      const response = await fetch(`/api/appointments/${appointmentId}/interests`);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error Response:', errorText);
        setDebugInfo({
          status: response.status,
          statusText: response.statusText,
          responseText: errorText
        });
        setError(`HTTP ${response.status}: ${response.statusText}`);
        return;
      }
      
      const responseText = await response.text();
      console.log('📡 Raw response text (first 500 chars):', responseText.substring(0, 500));
      
      if (!responseText.trim()) {
        console.error('❌ Empty response received');
        setError('Empty response from server');
        setDebugInfo({
          status: response.status,
          responseText: 'EMPTY'
        });
        return;
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ JSON parsed successfully:', data);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ Response text that failed to parse:', responseText);
        setError('Invalid JSON response from server');
        setDebugInfo({
          status: response.status,
          parseError: parseError.message,
          responseText: responseText.substring(0, 1000)
        });
        return;
      }
      
      if (!data) {
        console.error('❌ No data in response');
        setError('No data received from server');
        return;
      }
      
      if (data.success) {
        console.log('✅ Data loaded successfully:', {
          interestsCount: data.interests?.length || 0,
          summary: !!data.summary
        });
        
        // Create a minimal appointment object if not provided
        const appointmentData = data.appointment || { 
          appointment_id: appointmentId,
          status: 'pending'  // Default status
        };
        
        setAppointmentData(appointmentData);
        setInterests(data.interests || []);
        setSummary(data.summary);
      } else {
        console.error('❌ API returned error:', data.error);
        setError(data.error || 'Failed to load appointment interests');
        setDebugInfo({
          apiError: data.error,
          details: data.details
        });
      }
    } catch (error) {
      console.error('💥 Fetch error:', error);
      console.error('💥 Error stack:', error.stack);
      setError(`Network error: ${error.message}`);
      setDebugInfo({
        errorType: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfessional = async (interestId, notes = '') => {
    try {
      setActionLoading(true);
      console.log('🎯 Selecting professional:', { interestId, notes });
      
      const response = await fetch(`/api/appointments/${appointmentId}/interests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'select_professional',
          interest_ids: [interestId],
          data: { customer_notes: notes }
        })
      });

      console.log('📡 Selection response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Selection HTTP Error:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Selection JSON Parse Error:', parseError);
        return { success: false, error: 'Invalid response format' };
      }

      if (result.success) {
        console.log('✅ Professional selected successfully');
        await fetchAppointmentInterests(); // Refresh data
        return { success: true };
      } else {
        console.error('❌ Selection failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('💥 Selection error:', error);
      return { success: false, error: 'Selection failed: ' + error.message };
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProfessional = async (interestId, reason = '') => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/appointments/${appointmentId}/interests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject_interests',
          interest_ids: [interestId],
          data: { rejection_reason: reason }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const responseText = await response.text();
      const result = JSON.parse(responseText);
      
      if (result.success) {
        await fetchAppointmentInterests(); // Refresh data
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error rejecting professional:', error);
      return { success: false, error: 'Rejection failed: ' + error.message };
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ NEW: Quote Update Approval Handler
  const handleApproveQuoteUpdate = useCallback(async (interestId, customerNotes = '') => {
    try {
      setActionLoading(true);
      console.log('✅ Approving quote update:', { interestId, customerNotes });
      
      const response = await fetch(`/api/appointments/${appointmentId}/interests/${interestId}/quote-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          customer_notes: customerNotes
        })
      });

      console.log('📡 Approval response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Approval HTTP Error:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Approval JSON Parse Error:', parseError);
        return { success: false, error: 'Invalid response format' };
      }

      if (result.success) {
        console.log('✅ Quote update approved successfully');
        await fetchAppointmentInterests(); // Refresh data
        
        // Show success message
        alert('Quote update approved! The professional has been notified and the project is confirmed.');
        
        return { success: true };
      } else {
        console.error('❌ Approval failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('💥 Approval error:', error);
      return { success: false, error: 'Approval failed: ' + error.message };
    } finally {
      setActionLoading(false);
    }
  }, [appointmentId, fetchAppointmentInterests]);

  // ✅ NEW: Quote Update Decline Handler
  const handleDeclineQuoteUpdate = useCallback(async (interestId, customerNotes = '') => {
    try {
      setActionLoading(true);
      console.log('❌ Declining quote update:', { interestId, customerNotes });
      
      const response = await fetch(`/api/appointments/${appointmentId}/interests/${interestId}/quote-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decline',
          customer_notes: customerNotes
        })
      });

      console.log('📡 Decline response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Decline HTTP Error:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Decline JSON Parse Error:', parseError);
        return { success: false, error: 'Invalid response format' };
      }

      if (result.success) {
        console.log('✅ Quote update declined successfully');
        await fetchAppointmentInterests(); // Refresh data
        
        // Show success message
        alert('Quote update declined. The professional will need to provide a new response.');
        
        return { success: true };
      } else {
        console.error('❌ Decline failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('💥 Decline error:', error);
      return { success: false, error: 'Decline failed: ' + error.message };
    } finally {
      setActionLoading(false);
    }
  }, [appointmentId, fetchAppointmentInterests]);

  const handleMessageProfessional = (interest) => {
    console.log('Message professional:', interest.professional_id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading professional responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        {debugInfo && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Debug Information</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex space-x-2">
          <button 
            onClick={fetchAppointmentInterests}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
          <button 
            onClick={() => window.open(`/api/appointments/${appointmentId}/interests`, '_blank')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Debug API
          </button>
        </div>
      </div>
    );
  }

  const activeInterests = interests.filter(i => !['withdrawn', 'rejected'].includes(i.status));
  const selectedInterest = interests.find(i => i.selected_by_customer);
  const needsAssessment = selectedInterest?.assessment;
  
  // ✅ NEW: Count quote updates pending approval
  const quoteUpdatesCount = interests.filter(i => i.status === 'updated_quote').length;

  return (
    <div className="space-y-6">
      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <details>
              <summary className="cursor-pointer font-medium">Debug Info</summary>
              <div className="mt-2 text-xs">
                <p>Appointment ID: {appointmentId}</p>
                <p>Interests Count: {interests.length}</p>
                <p>Active Interests: {activeInterests.length}</p>
                <p>Quote Updates Pending: {quoteUpdatesCount}</p>
                <p>Selected Interest: {selectedInterest ? 'Yes' : 'No'}</p>
                <p>Has Appointment Data: {appointmentInformation ? 'Yes' : 'No'}</p>
              </div>
            </details>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue={selectedInterest ? "selected" : "responses"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="responses" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Responses ({activeInterests.length})</span>
            {/* ✅ NEW: Quote update indicator */}
            {quoteUpdatesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                {quoteUpdatesCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="compare" disabled={activeInterests.length < 2}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Compare
          </TabsTrigger>
          <TabsTrigger 
            value="selected" 
            disabled={!selectedInterest}
            className="flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>Selected</span>
          </TabsTrigger>
          <TabsTrigger 
            value="assessment" 
            disabled={!needsAssessment}
            className="flex items-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>Assessment</span>
          </TabsTrigger>
        </TabsList>

        {/* Professional Responses Tab */}
        <TabsContent value="responses" className="space-y-4">
          {/* ✅ NEW: Quote Updates Section */}
          {interests.some(i => i.status === 'updated_quote') && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-orange-100">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800">Quote Updates Pending Your Approval</h3>
                  <p className="text-sm text-orange-600">
                    {interests.filter(i => i.status === 'updated_quote').length} professional(s) have updated their quotes
                  </p>
                </div>
              </div>
              
              {interests
                .filter(i => i.status === 'updated_quote')
                .map((interest) => (
                  <CustomerQuoteComparison
                    key={interest.interest_id}
                    interest={interest}
                    onApprove={handleApproveQuoteUpdate}
                    onDecline={handleDeclineQuoteUpdate}
                    isLoading={actionLoading}
                  />
                ))
              }
              
              <Separator className="my-6" />
            </div>
          )}

          {/* Regular Interests Section */}
          {activeInterests.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No professional responses yet. Qualified professionals are being notified about your request.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {activeInterests
                .filter(i => i.status !== 'updated_quote') // Exclude quote updates from regular list
                .map((interest) => (
                  <InterestSelectionCard 
                    key={interest.interest_id}
                    interest={interest}
                    onSelect={handleSelectProfessional}
                    onReject={handleRejectProfessional}
                    onMessage={handleMessageProfessional}
                    isLoading={actionLoading}
                  />
                ))
              }
            </div>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="compare">
          <InterestComparisonView 
            interests={activeInterests}
            onSelectProfessional={handleSelectProfessional}
            onRejectProfessional={handleRejectProfessional}
            isLoading={actionLoading}
          />
        </TabsContent>

        {/* Selected Professional Tab */}
        <TabsContent value="selected">
          {selectedInterest ? (
            <div className="space-y-6">
              <Alert className="bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Professional Selected!</strong> You've chosen this professional for your project.
                </AlertDescription>
              </Alert>
              
              <InterestSelectionCard 
                interest={selectedInterest}
                onSelect={() => {}}
                onReject={() => {}}
                onMessage={handleMessageProfessional}
                showActions={false}
                className="ring-2 ring-green-200"
              />
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No professional selected yet. Choose from the available responses.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment">
          {needsAssessment && selectedInterest ? (
            <AssessmentScheduler 
              interest={selectedInterest}
              assessment={selectedInterest.assessment}
              onScheduleAssessment={async (data) => {
                console.log('Schedule assessment:', data);
                return { success: true };
              }}
              onConfirmAssessment={async (assessmentId) => {
                console.log('Confirm assessment:', assessmentId);
                return { success: true };
              }}
              onCancelAssessment={async (assessmentId) => {
                console.log('Cancel assessment:', assessmentId);
                return { success: true };
              }}
              isLoading={actionLoading}
            />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No assessment required or no professional selected yet.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerAppointmentDashboard;