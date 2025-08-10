// src/components/customer-workspace/interests/AppointmentInterestStatus.jsx
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Award,
  Loader2,
  Eye,
  XCircle,
  Shield,
  MessageCircle,
  RefreshCw
} from 'lucide-react';

const AppointmentInterestStatus = ({ 
  status, 
  interestCount = 0, 
  selectedInterest = null,
  hasQuoteUpdates = false // NEW: Flag for quote updates pending
}) => {
  const getStatusConfig = (appointmentStatus) => {
    const configs = {
      'pending': {
        label: 'Pending Professional Response',
        description: 'Waiting for qualified professionals to respond to your request',
        color: 'bg-yellow-500',
        icon: Clock,
        progress: 20,
        priority: 'medium'
      },
      'interested': {
        label: 'Professionals Interested',
        description: `${interestCount} professional${interestCount !== 1 ? 's have' : ' has'} shown interest`,
        color: 'bg-blue-500',
        icon: Users,
        progress: 40,
        priority: 'medium'
      },
      'competing': {
        label: 'Multiple Responses Received',
        description: `${interestCount} professionals are competing for your project`,
        color: 'bg-purple-500',
        icon: Users,
        progress: 60,
        priority: 'medium'
      },
      'evaluating': {
        label: 'Assessment in Progress',
        description: 'Professional is evaluating your project requirements',
        color: 'bg-orange-500',
        icon: Calendar,
        progress: 80,
        priority: 'medium'
      },
      'quoted': {
        label: 'Quote Received',
        description: 'Professional has provided a detailed quote',
        color: 'bg-green-500',
        icon: Award,
        progress: 90,
        priority: 'medium'
      },
      'selected': {
        label: 'Professional Selected',
        description: 'You have selected a professional for this project',
        color: 'bg-green-600',
        icon: CheckCircle,
        progress: 95,
        priority: 'high'
      },
      // 🔥 NEW: Reviewing status for quote updates
      'reviewing': {
        label: 'Quote Update Under Review',
        description: 'Professional has updated their quote and is waiting for your approval',
        color: 'bg-orange-500',
        icon: AlertTriangle,
        progress: 85,
        priority: 'urgent'
      },
      'confirmed': {
        label: 'Project Confirmed',
        description: 'Quote approved and professional is ready to begin',
        color: 'bg-green-700',
        icon: CheckCircle,
        progress: 100,
        priority: 'high'
      },
      'cancelled': {
        label: 'Appointment Cancelled',
        description: 'This appointment has been cancelled',
        color: 'bg-red-500',
        icon: AlertTriangle,
        progress: 0,
        priority: 'low'
      },
      'completed': {
        label: 'Project Completed',
        description: 'Project has been successfully completed',
        color: 'bg-green-700',
        icon: CheckCircle,
        progress: 100,
        priority: 'low'
      }
    };

    return configs[appointmentStatus] || {
      label: 'Unknown Status',
      description: 'Status information not available',
      color: 'bg-gray-500',
      icon: AlertTriangle,
      progress: 0,
      priority: 'low'
    };
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'reviewing': // NEW: Orange styling for reviewing
        return 'secondary';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'reviewing':
        return 'bg-orange-100 text-orange-800 border-orange-300 animate-pulse';
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return '';
    }
  };

  const getPriorityBorder = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-l-orange-500';
      case 'high':
        return 'border-l-4 border-l-green-500';
      case 'medium':
        return 'border-l-4 border-l-blue-500';
      default:
        return 'border-l-4 border-l-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <Card className={getPriorityBorder(statusConfig.priority)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${statusConfig.color.replace('bg-', 'bg-')} bg-opacity-10 ${
                statusConfig.priority === 'urgent' ? 'animate-pulse' : ''
              }`}>
                <StatusIcon className={`h-6 w-6 ${statusConfig.color.replace('bg-', 'text-')}`} />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold">{statusConfig.label}</h3>
                  <Badge 
                    variant={getStatusBadgeVariant(status)} 
                    className={`capitalize ${getStatusBadgeClass(status)}`}
                  >
                    {status === 'reviewing' ? 'Needs Review' : status.replace('_', ' ')}
                  </Badge>
                  
                  {/* NEW: Quote update indicator */}
                  {hasQuoteUpdates && (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Quote Updated
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{statusConfig.description}</p>
              </div>
            </div>

            {/* Status Progress Indicator */}
            <div className="text-right space-y-2">
              <div className="text-2xl font-bold text-muted-foreground">
                {statusConfig.progress}%
              </div>
              <div className="w-24">
                <Progress 
                  value={statusConfig.progress} 
                  className={`h-2 ${statusConfig.priority === 'urgent' ? 'bg-orange-100' : ''}`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status-Specific Alerts and Information */}
      {status === 'pending' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>What's happening:</strong> Your request has been sent to qualified professionals in your area. 
            You'll typically start receiving responses within 2-4 hours.
          </AlertDescription>
        </Alert>
      )}

      {status === 'interested' && interestCount > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Users className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Great news!</strong> {interestCount} professional{interestCount !== 1 ? 's have' : ' has'} shown interest. 
            Review their profiles, quotes, and select the best fit for your project.
          </AlertDescription>
        </Alert>
      )}

      {status === 'competing' && interestCount > 1 && (
        <Alert className="border-purple-200 bg-purple-50">
          <Users className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>Multiple options available:</strong> You have {interestCount} professionals competing for your project. 
            Use the comparison tool to evaluate their offers side by side.
          </AlertDescription>
        </Alert>
      )}

      {status === 'evaluating' && selectedInterest && (
        <Alert className="border-orange-200 bg-orange-50">
          <Calendar className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Assessment in progress:</strong> {selectedInterest.professional?.business_name || 'The selected professional'} 
            is evaluating your project. You'll receive a detailed quote after the assessment.
          </AlertDescription>
        </Alert>
      )}

      {status === 'quoted' && selectedInterest && (
        <Alert className="border-green-200 bg-green-50">
          <Award className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Quote received:</strong> {selectedInterest.professional?.business_name || 'The professional'} 
            has provided a detailed quote. Review the details and proceed with booking if you're satisfied.
          </AlertDescription>
        </Alert>
      )}

      {/* 🔥 NEW: Reviewing status alert */}
      {status === 'reviewing' && selectedInterest && (
        <Alert className="border-orange-200 bg-orange-50 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Quote Update Pending Review:</strong> {selectedInterest.professional?.business_name || 'The selected professional'} 
            has updated their quote and requires your approval before proceeding. 
            <strong className="block mt-2">⚠️ Assessment scheduling is temporarily blocked</strong> until you review the changes above.
          </AlertDescription>
        </Alert>
      )}

      {status === 'selected' && selectedInterest && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Professional selected:</strong> You've chosen {selectedInterest.professional?.business_name || 'a professional'} 
            for this project. {selectedInterest.assessment ? 'The next step is scheduling the site assessment.' : 'You can now proceed with project planning.'}
          </AlertDescription>
        </Alert>
      )}

      {/* 🔥 NEW: Confirmed status alert */}
      {status === 'confirmed' && selectedInterest && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Project confirmed:</strong> Your quote has been approved and {selectedInterest.professional?.business_name || 'the professional'} 
            is ready to begin work. {selectedInterest.assessment ? 'You can now schedule the assessment.' : 'Project can proceed as planned.'}
          </AlertDescription>
        </Alert>
      )}

      {status === 'cancelled' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Appointment cancelled:</strong> This appointment has been cancelled. 
            You can create a new appointment if you still need this service.
          </AlertDescription>
        </Alert>
      )}

      {status === 'completed' && selectedInterest && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Project completed:</strong> Your project with {selectedInterest.professional?.business_name || 'the professional'} 
            has been completed successfully. Don't forget to leave a review!
          </AlertDescription>
        </Alert>
      )}

      {/* Interest Count Summary */}
      {interestCount > 0 && !['cancelled', 'completed'].includes(status) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{interestCount}</div>
              <div className="text-sm text-muted-foreground">
                Total Response{interestCount !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>

          {selectedInterest && (
            <>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">1</div>
                  <div className="text-sm text-muted-foreground">Selected</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{interestCount - 1}</div>
                  <div className="text-sm text-muted-foreground">Not Selected</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* 🔥 NEW: Action blockers for reviewing status */}
      {status === 'reviewing' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-semibold text-orange-800">Actions Currently Blocked</h4>
                <p className="text-sm text-orange-700 mt-1">
                  The following actions are temporarily unavailable while the quote update is under review:
                </p>
                <ul className="text-sm text-orange-700 mt-2 space-y-1">
                  <li>• Assessment scheduling</li>
                  <li>• Project timeline planning</li>
                  <li>• Additional professional selection</li>
                </ul>
                <p className="text-sm text-orange-700 mt-2 font-medium">
                  Please review and approve/decline the quote changes above to continue.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {interestCount === 0 && status === 'pending' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Searching for Professionals</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  We're notifying qualified professionals in your area. 
                  Most customers receive their first response within 2 hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🔥 NEW: Quote update summary card */}
      {status === 'reviewing' && hasQuoteUpdates && selectedInterest && (
        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-orange-800">Quote Changes Waiting</h4>
                  <p className="text-sm text-orange-700">
                    {selectedInterest.professional?.business_name || 'Professional'} has updated their quote
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-700">
                  ${selectedInterest.amount?.toLocaleString() || 'TBD'}
                </div>
                <div className="text-sm text-orange-600">
                  {selectedInterest.original_amount && selectedInterest.amount && 
                   selectedInterest.amount !== selectedInterest.original_amount ? (
                    <>
                      {selectedInterest.amount > selectedInterest.original_amount ? '↗️' : '↘️'} 
                      ${Math.abs(selectedInterest.amount - selectedInterest.original_amount).toLocaleString()} change
                    </>
                  ) : (
                    'Quote updated'
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppointmentInterestStatus;