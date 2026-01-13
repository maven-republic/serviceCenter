// src/components/customer-workspace/interests/CustomerAppointmentDashboard.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertCircle,
  Users,
  BarChart3,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';

import InterestSelectionCard from './InterestSelectionCard';
import InterestComparisonView from './InterestComparisonView';
import AssessmentScheduler from './AssessmentScheduler';
import CustomerQuoteComparison from './CustomerQuoteComparison';
import AppointmentInterestStatus from './AppointmentInterestStatus';

// Import the quote approval hook
import { useQuoteApproval } from '@/primitives/customer/useQuoteApproval';

const CustomerAppointmentDashboard = ({ appointmentId }) => {
  // ✅ Validate appointmentId immediately
  const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuid && typeof uuid === 'string' && uuidRegex.test(uuid);
  };

  // State
  const [appointmentInformation, setAppointmentData] = useState(null);
  const [interests, setInterests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ ADD: Debug state to show what we fetched
  const [fetchDebug, setFetchDebug] = useState(null);

  const { 
    handleQuoteApproval, 
    loading: quoteApprovalLoading, 
    error: quoteApprovalError,
    clearError: clearQuoteError
  } = useQuoteApproval();

  useEffect(() => {
    if (appointmentId && isValidUUID(appointmentId)) {
      fetchAppointmentInterests();
    }
  }, [appointmentId]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

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
        return;
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ JSON parsed successfully:', data);
        console.log('🔍 Interests array:', data.interests);
        console.log('🔍 Interests count:', data.interests?.length);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        setError('Invalid JSON response from server');
        return;
      }
      
      if (data.success) {
        const interestsArray = data.interests || [];
        
        // ✅ ADD: Set debug info to display on screen
        setFetchDebug({
          appointmentId,
          interestsCount: interestsArray.length,
          interestsData: interestsArray,
          timestamp: new Date().toISOString()
        });
        
        console.log('✅ Data loaded successfully:', {
          interestsCount: interestsArray.length,
          summary: !!data.summary,
          firstInterest: interestsArray[0]
        });
        
        const appointmentData = data.appointment || { 
          appointment_id: appointmentId,
          status: 'pending'
        };
        
        setAppointmentData(appointmentData);
        setInterests(interestsArray);
        setSummary(data.summary);
      } else {
        console.error('❌ API returned error:', data.error);
        setError(data.error || 'Failed to load appointment interests');
      }
    } catch (error) {
      console.error('💥 Fetch error:', error);
      setError(`Network error: ${error.message}`);
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

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(`Failed to select professional: ${errorText}`);
        return { success: false, error: errorText };
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage('Professional selected successfully!');
        await fetchAppointmentInterests();
        return { success: true };
      } else {
        setErrorMessage(result.error || 'Failed to select professional');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = 'Selection failed: ' + error.message;
      setErrorMessage(errorMsg);
      return { success: false, error: errorMsg };
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
        setErrorMessage(`Failed to reject professional: ${errorText}`);
        return { success: false, error: errorText };
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage('Professional rejected successfully');
        await fetchAppointmentInterests();
        return { success: true };
      } else {
        setErrorMessage(result.error || 'Failed to reject professional');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = 'Rejection failed: ' + error.message;
      setErrorMessage(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuoteApprovalAction = useCallback(async (interestId, action, notes = '') => {
    clearQuoteError();
    
    const result = await handleQuoteApproval(
      appointmentId, 
      interestId, 
      action, 
      notes,
      {
        onSuccess: async (result) => {
          await fetchAppointmentInterests();
          if (action === 'approve') {
            setSuccessMessage('Quote update approved!');
          } else {
            setSuccessMessage('Quote update declined.');
          }
        },
        onError: (error) => {
          setErrorMessage(error.message || `Failed to ${action} quote update`);
        },
        showSuccessMessage: false,
        showErrorMessage: false
      }
    );

    return result;
  }, [appointmentId, handleQuoteApproval, fetchAppointmentInterests, clearQuoteError]);

  const handleMessageProfessional = (interest) => {
    console.log('Message professional:', interest.professional_id);
  };

  // ✅ Early validation error
  if (!appointmentId || !isValidUUID(appointmentId)) {
    return (
      <div className="bg-red-50 rounded-xl p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
          <div className="text-red-800 text-sm">
            <strong>Error:</strong> Invalid appointment ID: {appointmentId}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 border-b-2 border-blue-600 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600">Loading professional responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        </div>
        
        {debugInfo && (
          <div className="bg-blue-50 rounded-xl p-4">
            <details className="text-blue-800 text-sm">
              <summary className="cursor-pointer font-medium">Debug Information</summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}
        
        <div className="flex space-x-2">
          <button 
            onClick={fetchAppointmentInterests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ ADD: Debug Display Panel (TEMPORARY - for troubleshooting)
  const showDebugPanel = true; // Set to false once we identify the issue

  const activeInterests = interests ? interests.filter(i => !['withdrawn', 'rejected'].includes(i.status)) : [];
  const selectedInterest = interests ? interests.find(i => i.selected_by_customer) : null;
  const needsAssessment = selectedInterest?.assessment;
  
  const quoteUpdatesCount = interests ? interests.filter(i => i.status === 'updated').length : 0;
  const hasQuoteUpdates = quoteUpdatesCount > 0;

  const appointmentStatus = appointmentInformation?.status || (hasQuoteUpdates ? 'reviewing' : 'pending');

  return (
    <div className="space-y-6">
      {/* ✅ DEBUG PANEL - REMOVE AFTER FIXING */}
      {showDebugPanel && fetchDebug && (
        <Card className="border-2 border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <h4 className="font-bold text-yellow-900 mb-2">🔍 DEBUG INFO (Remove this after fixing)</h4>
            <div className="text-xs space-y-1 text-yellow-900">
              <p><strong>Appointment ID:</strong> {fetchDebug.appointmentId}</p>
              <p><strong>Interests Count:</strong> {fetchDebug.interestsCount}</p>
              <p><strong>Fetched At:</strong> {new Date(fetchDebug.timestamp).toLocaleString()}</p>
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">View Raw Interests Data</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-60">
                  {JSON.stringify(fetchDebug.interestsData, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-green-800 text-sm">{successMessage}</div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {(errorMessage || quoteApprovalError) && (
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800 text-sm">{errorMessage || quoteApprovalError}</div>
          </div>
        </div>
      )}

      {/* Appointment Status Overview */}
      <AppointmentInterestStatus
        status={appointmentStatus}
        interestCount={interests ? interests.length : 0}
        selectedInterest={selectedInterest}
        hasQuoteUpdates={hasQuoteUpdates}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue={selectedInterest ? "selected" : "responses"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white rounded-xl">
          <TabsTrigger value="responses" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Users className="h-4 w-4" />
            <span>Responses ({activeInterests.length})</span>
            {hasQuoteUpdates && (
              <Badge className="ml-1 bg-orange-500 text-white animate-pulse">
                <RefreshCw className="h-3 w-3 mr-1" />
                {quoteUpdatesCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="compare" disabled={activeInterests.length < 2} className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Compare
          </TabsTrigger>
          <TabsTrigger 
            value="selected" 
            disabled={!selectedInterest}
            className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <User className="h-4 w-4" />
            <span>Selected</span>
          </TabsTrigger>
          <TabsTrigger 
            value="assessment" 
            disabled={!needsAssessment || appointmentStatus === 'reviewing'}
            className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Clock className="h-4 w-4" />
            <span>Assessment</span>
          </TabsTrigger>
        </TabsList>

        {/* Professional Responses Tab */}
        <TabsContent value="responses" className="space-y-4">
          {activeInterests.length === 0 ? (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-blue-800 text-sm">
                  No professional responses yet. Qualified professionals are being notified about your request.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeInterests.map((interest) => (
                <InterestSelectionCard 
                  key={interest.interest_id}
                  interest={interest}
                  onSelect={handleSelectProfessional}
                  onReject={handleRejectProfessional}
                  onMessage={handleMessageProfessional}
                  isLoading={actionLoading}
                  showActions={appointmentStatus !== 'reviewing'}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Other tabs remain the same... */}
        <TabsContent value="compare">
          <InterestComparisonView 
            interests={activeInterests}
            onSelectProfessional={handleSelectProfessional}
            onRejectProfessional={handleRejectProfessional}
            isLoading={actionLoading}
          />
        </TabsContent>

        <TabsContent value="selected">
          {selectedInterest ? (
            <InterestSelectionCard 
              interest={selectedInterest}
              onSelect={() => {}}
              onReject={() => {}}
              onMessage={handleMessageProfessional}
              showActions={false}
              className="ring-2 ring-green-200"
            />
          ) : (
            <div className="bg-blue-50 rounded-xl p-4">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <div className="text-blue-800 text-sm">No professional selected yet.</div>
            </div>
          )}
        </TabsContent>

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
            <div className="bg-blue-50 rounded-xl p-4">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <div className="text-blue-800 text-sm">No assessment required.</div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerAppointmentDashboard;