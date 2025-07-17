// src/components/customer-workspace/interests/CustomerAppointmentDashboard.jsx (Debug Version)
"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle,
  Users,
  BarChart3,
  User,
  Clock
} from 'lucide-react';

import InterestSelectionCard from './InterestSelectionCard';
import InterestComparisonView from './InterestComparisonView';
import AssessmentScheduler from './AssessmentScheduler';

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

  const fetchAppointmentInterests = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      
      console.log('🔍 Fetching interests for appointment:', appointmentId);
      
      const response = await fetch(`/api/appointments/${appointmentId}/interests`);
      
      // Debug: Log response details
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is ok
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
      
      // Get response as text first to debug
      const responseText = await response.text();
      console.log('📡 Raw response text (first 500 chars):', responseText.substring(0, 500));
      
      // Check if response is empty
      if (!responseText.trim()) {
        console.error('❌ Empty response received');
        setError('Empty response from server');
        setDebugInfo({
          status: response.status,
          responseText: 'EMPTY'
        });
        return;
      }
      
      // Try to parse JSON
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
      
      // Check if data has expected structure
      if (!data) {
        console.error('❌ No data in response');
        setError('No data received from server');
        return;
      }
      
      if (data.success) {
        console.log('✅ Data loaded successfully:', {
          appointment: !!data.appointment,
          interestsCount: data.interests?.length || 0,
          summary: !!data.summary
        });
        
        setAppointmentData(data.appointment);
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

  const handleMessageProfessional = (interest) => {
    // TODO: Implement messaging functionality
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
        
        {/* Debug Information */}
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

  if (!appointmentInformation) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No appointment data found.
        </AlertDescription>
      </Alert>
    );
  }

  const activeInterests = interests.filter(i => !['withdrawn', 'rejected'].includes(i.status));
  const selectedInterest = interests.find(i => i.selected_by_customer);
  const needsAssessment = selectedInterest?.assessment;

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
                <p>Selected Interest: {selectedInterest ? 'Yes' : 'No'}</p>
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
            <span>Answers ({activeInterests.length})</span>
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
          {activeInterests.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No professional responses yet. Qualified professionals are being notified about your request.
              </AlertDescription>
            </Alert>
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
                />
              ))}
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
                // TODO: Implement assessment scheduling API
                console.log('Schedule assessment:', data);
                return { success: true };
              }}
              onConfirmAssessment={async (assessmentId) => {
                // TODO: Implement assessment confirmation API
                console.log('Confirm assessment:', assessmentId);
                return { success: true };
              }}
              onCancelAssessment={async (assessmentId) => {
                // TODO: Implement assessment cancellation API
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