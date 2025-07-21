// Minimalist CustomerAppointmentDashboard.jsx - Clean design with rounded edges
"use client";

import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('responses');

  // Calculate derived state
  const activeInterests = interests.filter(i => !['withdrawn', 'rejected'].includes(i.status));
  const selectedInterest = interests.find(i => i.selected_by_customer);
  const needsAssessment = selectedInterest?.assessment;

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentInterests();
    }
  }, [appointmentId]);

  // Debug log for interests data structure
  useEffect(() => {
    if (interests.length > 0) {
      console.log('🔍 DEBUG: Interests data structure:', interests[0]);
      console.log('🔍 DEBUG: First interest fields:', Object.keys(interests[0]));
      if (interests[0].professional) {
        console.log('🔍 DEBUG: Professional fields:', Object.keys(interests[0].professional));
      }
    }
  }, [interests]);

  // Auto-set active tab based on data
  useEffect(() => {
    if (selectedInterest) {
      setActiveTab('selected');
    } else {
      setActiveTab('responses');
    }
  }, [selectedInterest]);

  const fetchAppointmentInterests = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      
      console.log('🔍 Fetching interests for appointment:', appointmentId);
      
      const response = await fetch(`/api/appointments/${appointmentId}/interests`);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
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
      <div className="max-w-4xl mx-auto bg-white min-h-screen">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading professional responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white min-h-screen p-6">
        <div className="space-y-4">
          <div className="border border-red-200 bg-red-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">{error}</div>
            </div>
          </div>
          
          {/* Debug Information */}
          {debugInfo && (
            <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Debug Information</summary>
                    <pre className="mt-2 text-xs bg-white p-2 rounded-md border border-gray-200 overflow-auto max-h-40">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button 
              onClick={fetchAppointmentInterests}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => window.open(`/api/appointments/${appointmentId}/interests`, '_blank')}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:text-gray-800 hover:border-gray-300 transition-colors"
            >
              Debug API
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!appointmentInformation) {
    return (
      <div className="max-w-4xl mx-auto bg-white min-h-screen p-6">
        <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">No appointment data found.</div>
          </div>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, label, count, disabled = false }) => (
    <button
      onClick={() => !disabled && setActiveTab(id)}
      disabled={disabled}
      className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
        activeTab === id
          ? 'border-gray-900 text-gray-900' 
          : disabled
          ? 'border-transparent text-gray-300 cursor-not-allowed'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
      }`}
    >
      <div className="flex items-center space-x-2">
        {id === 'responses' && <Users className="h-4 w-4" />}
        {id === 'compare' && <BarChart3 className="h-4 w-4" />}
        {id === 'selected' && <User className="h-4 w-4" />}
        {id === 'assessment' && <Clock className="h-4 w-4" />}
        <span>{label} {count !== undefined && `(${count})`}</span>
      </div>
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-6 border-b border-gray-100">
          <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <details>
                  <summary className="cursor-pointer font-medium">Debug Info</summary>
                  <div className="mt-2 text-xs space-y-1">
                    <p>Appointment ID: {appointmentId}</p>
                    <p>Interests Count: {interests.length}</p>
                    <p>Active Interests: {activeInterests.length}</p>
                    <p>Selected Interest: {selectedInterest ? 'Yes' : 'No'}</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-lg font-medium text-gray-900">Professional Responses</h1>
          <p className="text-sm text-gray-500 mt-1">Review and select a professional for your project</p>
        </div>
        
        {/* Tabs */}
        <div className="px-6 flex space-x-0 border-b border-gray-100">
          <TabButton 
            id="responses" 
            label="Responses" 
            count={activeInterests.length}
          />
          <TabButton 
            id="compare" 
            label="Compare"
            disabled={activeInterests.length < 2}
          />
          <TabButton 
            id="selected" 
            label="Selected"
            disabled={!selectedInterest}
          />
          <TabButton 
            id="assessment" 
            label="Assessment"
            disabled={!needsAssessment}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Professional Responses Tab */}
        {activeTab === 'responses' && (
          <div className="space-y-0">
            {activeInterests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Responses Yet</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Qualified professionals are being notified about your request. 
                  You'll typically start receiving responses within 2-4 hours.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
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
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'compare' && (
          <InterestComparisonView 
            interests={activeInterests}
            onSelectProfessional={handleSelectProfessional}
            onRejectProfessional={handleRejectProfessional}
            isLoading={actionLoading}
          />
        )}

        {/* Selected Professional Tab */}
        {activeTab === 'selected' && (
          <div className="space-y-6">
            {selectedInterest ? (
              <>
                <div className="border-l-4 border-green-500 bg-green-50/30 p-6 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <div className="text-sm text-green-800">
                      <span className="font-medium">Professional Selected!</span> You've chosen this professional for your project.
                    </div>
                  </div>
                </div>
                
                <InterestSelectionCard 
                  interest={selectedInterest}
                  onSelect={() => {}}
                  onReject={() => {}}
                  onMessage={handleMessageProfessional}
                  showActions={false}
                  className="ring-1 ring-green-200"
                />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Professional Selected</h3>
                <p className="text-gray-500 text-sm">Choose from the available responses to continue.</p>
              </div>
            )}
          </div>
        )}

        {/* Assessment Tab */}
        {activeTab === 'assessment' && (
          <div>
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
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Required</h3>
                <p className="text-gray-500 text-sm">No assessment needed or no professional selected yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAppointmentDashboard;