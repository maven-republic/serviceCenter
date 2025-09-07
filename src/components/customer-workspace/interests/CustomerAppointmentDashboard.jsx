// src/components/customer-workspace/interests/CustomerAppointmentDashboard.jsx (Fixed Status Alignment)
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle,
  Users,
  BarChart3,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

import InterestSelectionCard from './InterestSelectionCard';
import InterestComparisonView from './InterestComparisonView';
import AssessmentScheduler from './AssessmentScheduler';
import CustomerQuoteComparison from './CustomerQuoteComparison';
import AppointmentInterestStatus from './AppointmentInterestStatus';

// Import the quote approval hook
import { useQuoteApproval } from '@/primitives/customer/useQuoteApproval';

const CustomerAppointmentDashboard = ({ appointmentId }) => {
  const [appointmentInformation, setAppointmentData] = useState(null);
  const [interests, setInterests] = useState([]); // ✅ Initialize as empty array
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Use the quote approval hook
  const { 
    handleQuoteApproval, 
    loading: quoteApprovalLoading, 
    error: quoteApprovalError,
    clearError: clearQuoteError
  } = useQuoteApproval();

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentInterests();
    }
  }, [appointmentId]);

  useEffect(() => {
    if (interests && interests.length > 0) {
      console.log('🔍 DEBUG: Interests data structure:', interests[0]);
      console.log('🔍 DEBUG: First interest fields:', Object.keys(interests[0]));
      if (interests[0].professional) {
        console.log('🔍 DEBUG: Professional fields:', Object.keys(interests[0].professional));
      }
    }
  }, [interests]);

  // Clear success/error messages after delay
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
          status: 'pending'
        };
        
        setAppointmentData(appointmentData);
        setInterests(data.interests || []); // ✅ Ensure array fallback
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
        setErrorMessage(`Failed to select professional: ${errorText}`);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Selection JSON Parse Error:', parseError);
        setErrorMessage('Invalid response format');
        return { success: false, error: 'Invalid response format' };
      }

      if (result.success) {
        console.log('✅ Professional selected successfully');
        setSuccessMessage('Professional selected successfully!');
        await fetchAppointmentInterests(); // Refresh data
        return { success: true };
      } else {
        console.error('❌ Selection failed:', result.error);
        setErrorMessage(result.error || 'Failed to select professional');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('💥 Selection error:', error);
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
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const responseText = await response.text();
      const result = JSON.parse(responseText);
      
      if (result.success) {
        setSuccessMessage('Professional rejected successfully');
        await fetchAppointmentInterests(); // Refresh data
        return { success: true };
      } else {
        setErrorMessage(result.error || 'Failed to reject professional');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error rejecting professional:', error);
      const errorMsg = 'Rejection failed: ' + error.message;
      setErrorMessage(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setActionLoading(false);
    }
  };

  // Quote approval handler using the hook
  const handleQuoteApprovalAction = useCallback(async (interestId, action, notes = '') => {
    clearQuoteError(); // Clear any previous errors
    
    const result = await handleQuoteApproval(
      appointmentId, 
      interestId, 
      action, 
      notes,
      {
        onSuccess: async (result) => {
          // Refresh data and show success message
          await fetchAppointmentInterests();
          if (action === 'approve') {
            setSuccessMessage('Quote update approved! The professional has been notified and the project is ready to proceed.');
          } else {
            setSuccessMessage('Quote update declined. The professional will need to provide a new response.');
          }
        },
        onError: (error) => {
          setErrorMessage(error.message || `Failed to ${action} quote update`);
        },
        showSuccessMessage: false, // We handle success messages manually
        showErrorMessage: false    // We handle error messages manually
      }
    );

    return result;
  }, [appointmentId, handleQuoteApproval, fetchAppointmentInterests, clearQuoteError]);

  const handleMessageProfessional = (interest) => {
    console.log('Message professional:', interest.professional_id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
            <div className="text-red-800 text-sm">
              {error}
            </div>
          </div>
        </div>
        
        {debugInfo && (
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <details className="text-blue-800 text-sm">
                <summary className="cursor-pointer font-medium">Debug Information</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <button 
            onClick={fetchAppointmentInterests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
          <button 
            onClick={() => window.open(`/api/appointments/${appointmentId}/interests`, '_blank')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Debug API
          </button>
        </div>
      </div>
    );
  }

  // ✅ Safe filtering with null checks
  const activeInterests = interests ? interests.filter(i => !['withdrawn', 'rejected'].includes(i.status)) : [];
  const selectedInterest = interests ? interests.find(i => i.selected_by_customer) : null;
  const needsAssessment = selectedInterest?.assessment;
  
  // Use 'updated' status instead of 'updated_quote'
  const quoteUpdatesCount = interests ? interests.filter(i => i.status === 'updated').length : 0;
  const hasQuoteUpdates = quoteUpdatesCount > 0;

  // Determine appointment status for AppointmentInterestStatus
  const appointmentStatus = appointmentInformation?.status || (hasQuoteUpdates ? 'reviewing' : 'pending');

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-green-800 text-sm">
              {successMessage}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {(errorMessage || quoteApprovalError) && (
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800 text-sm">
              {errorMessage || quoteApprovalError}
            </div>
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

      {/* Debug Panel */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 rounded-xl p-4">
          <details className="text-gray-600 text-sm">
            <summary className="cursor-pointer font-medium">Debug Info</summary>
            <div className="mt-2 text-xs">
              <p>Appointment ID: {appointmentId}</p>
              <p>Appointment Status: {appointmentStatus}</p>
              <p>Interests Count: {interests ? interests.length : 0}</p>
              <p>Active Interests: {activeInterests.length}</p>
              <p>Quote Updates Pending: {quoteUpdatesCount}</p>
              <p>Selected Interest: {selectedInterest ? 'Yes' : 'No'}</p>
              <p>Selected Interest Status: {selectedInterest?.status || 'N/A'}</p>
              <p>Has Appointment Data: {appointmentInformation ? 'Yes' : 'No'}</p>
              <p>Quote Approval Loading: {quoteApprovalLoading ? 'Yes' : 'No'}</p>
            </div>
          </details>
        </div>
      )} */}

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
            {appointmentStatus === 'reviewing' && (
              <Badge variant="outline" className="text-xs">Blocked</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Professional Responses Tab */}
        <TabsContent value="responses" className="space-y-4">
          {/* Quote Updates Section */}
          {interests && interests.some(i => i.status === 'updated') && (
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 rounded-full bg-orange-100">
                    <AlertTriangle className="h-5 w-5 text-orange-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-800 flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>Quote Updates Pending Your Approval</span>
                    </h3>
                    <p className="text-sm text-orange-600">
                      {quoteUpdatesCount} professional(s) have updated their quotes and need your approval
                    </p>
                  </div>
                </div>
                
                <div className="bg-orange-100 rounded-xl p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div className="text-orange-800 text-sm">
                      <strong>Important:</strong> Assessment scheduling is blocked until you approve or decline these quote changes.
                    </div>
                  </div>
                </div>
              </div>
              
              {interests
                .filter(i => i.status === 'updated')
                .map((interest) => (
                  <CustomerQuoteComparison
                    key={interest.interest_id}
                    interest={interest}
                    onApprove={(interestId, notes) => 
                      handleQuoteApprovalAction(interestId, 'approve', notes)
                    }
                    onDecline={(interestId, notes) => 
                      handleQuoteApprovalAction(interestId, 'decline', notes)
                    }
                    isLoading={actionLoading || quoteApprovalLoading}
                  />
                ))
              }
              
              <hr className="border-gray-200 my-6" />
            </div>
          )}

          {/* Regular Interests Section */}
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
              {activeInterests
                .filter(i => i.status !== 'updated') // Exclude quote updates from regular list
                .map((interest) => (
                  <InterestSelectionCard 
                    key={interest.interest_id}
                    interest={interest}
                    onSelect={handleSelectProfessional}
                    onReject={handleRejectProfessional}
                    onMessage={handleMessageProfessional}
                    isLoading={actionLoading}
                    // Disable actions during quote review
                    showActions={appointmentStatus !== 'reviewing'}
                  />
                ))
              }
            </div>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="compare">
          <InterestComparisonView 
            interests={activeInterests.filter(i => i.status !== 'updated')}
            onSelectProfessional={handleSelectProfessional}
            onRejectProfessional={handleRejectProfessional}
            isLoading={actionLoading}
          />
        </TabsContent>

        {/* Selected Professional Tab */}
        <TabsContent value="selected">
          {selectedInterest ? (
            <div className="space-y-6">
              {/* ✅ FIXED: Show different alerts based on status - now using 'approved' instead of 'confirmed' */}
              {appointmentStatus === 'reviewing' ? (
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div className="text-orange-800 text-sm">
                      <strong>Quote Update In Review:</strong> Your selected professional has updated their quote. 
                      Please review the changes in the "Responses" tab before proceeding.
                    </div>
                  </div>
                </div>
              ) : selectedInterest.status === 'approved' ? ( // ✅ FIXED: Changed from 'confirmed' to 'approved'
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-green-800 text-sm">
                      <strong>Project Approved!</strong> Your quote has been approved and the professional is ready to begin.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-green-800 text-sm">
                      <strong>Professional Selected!</strong> You've chosen this professional for your project.
                    </div>
                  </div>
                </div>
              )}
              
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
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-blue-800 text-sm">
                  No professional selected yet. Choose from the available responses.
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment">
          {appointmentStatus === 'reviewing' ? (
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-orange-800 text-sm">
                  <strong>Assessment Scheduling Blocked:</strong> Please approve or decline the pending quote updates 
                  before scheduling an assessment.
                </div>
              </div>
            </div>
          ) : needsAssessment && selectedInterest ? (
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
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-blue-800 text-sm">
                  No assessment required or no professional selected yet.
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerAppointmentDashboard;