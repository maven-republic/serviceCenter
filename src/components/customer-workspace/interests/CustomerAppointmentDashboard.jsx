// src/components/customer-workspace/interests/CustomerAppointmentDashboard.jsx (Updated with all components)
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  User, 
  DollarSign, 
  Award,
  AlertCircle,
  Users,
  BarChart3
} from 'lucide-react';

import InterestSelectionCard from './InterestSelectionCard';
import InterestComparisonView from './InterestComparisonView';
import AppointmentInterestStatus from './AppointmentInterestStatus';
import AssessmentScheduler from './AssessmentScheduler';

const CustomerAppointmentDashboard = ({ appointmentId }) => {
  const [appointmentInformation, setAppointmentData] = useState(null);
  const [interests, setInterests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentInterests();
    }
  }, [appointmentId]);

  const fetchAppointmentInterests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/appointments/${appointmentId}/interests`);
      const data = await response.json();
      
      if (data.success) {
        setAppointmentData(data.appointment);
        setInterests(data.interests);
        setSummary(data.summary);
      } else {
        setError(data.error || 'Failed to load appointment interests');
      }
    } catch (error) {
      console.error('Error fetching appointment interests:', error);
      setError('Failed to load appointment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfessional = async (interestId, notes = '') => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/appointments/${appointmentId}/interests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'select_professional',
          interest_ids: [interestId],
          data: { customer_notes: notes }
        })
      });

      const result = await response.json();
      if (result.success) {
        await fetchAppointmentInterests(); // Refresh data
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error selecting professional:', error);
      return { success: false, error: 'Selection failed' };
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

      const result = await response.json();
      if (result.success) {
        await fetchAppointmentInterests(); // Refresh data
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error rejecting professional:', error);
      return { success: false, error: 'Rejection failed' };
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageProfessional = (interest) => {
    // TODO: Implement messaging functionality
    console.log('Message professional:', interest.professional_id);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
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
      {/* Header with Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{appointmentInformation.title}</h1>
            <p className="text-muted-foreground">
              Professional Interest Management
            </p>
          </div>
        </div>

        <AppointmentInterestStatus 
          status={appointmentInformation.status}
          interestCount={activeInterests.length}
          selectedInterest={selectedInterest}
        />
      </div>

      {/* Summary Statistics */}
      {summary && summary.total_interests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Responses</span>
              </div>
              <p className="text-2xl font-bold">{summary.total_interests}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">With Quotes</span>
              </div>
              <p className="text-2xl font-bold">{summary.quoted_interests}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Avg Response</span>
              </div>
              <p className="text-2xl font-bold">
                {summary.response_time_stats?.average_response_time 
                  ? `${Math.round(summary.response_time_stats.average_response_time)}m`
                  : '—'
                }
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Avg Quote</span>
              </div>
              <p className="text-2xl font-bold">
                {summary.average_quote && summary.average_quote > 0 
                  ? formatCurrency(summary.average_quote) 
                  : '—'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue={selectedInterest ? "selected" : "responses"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="responses" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Responses ({activeInterests.length})</span>
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
            <div className="space-y-6">
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