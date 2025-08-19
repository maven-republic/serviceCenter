import React from 'react';
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
  hasQuoteUpdates = false
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'reviewing':
        return 'bg-orange-100 text-orange-800 animate-pulse';
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityAccent = (priority) => {
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
      {/* Main Status Card - Clean version */}
      <div className={`bg-white rounded-xl p-6 ${getPriorityAccent(statusConfig.priority)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${statusConfig.color.replace('bg-', 'bg-')} bg-opacity-10 ${
              statusConfig.priority === 'urgent' ? 'animate-pulse' : ''
            }`}>
              <StatusIcon className={`h-6 w-6 ${statusConfig.color.replace('bg-', 'text-')}`} />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">{statusConfig.label}</h3>
                <Badge className={`capitalize ${getStatusBadgeClass(status)}`}>
                  {status === 'reviewing' ? 'Needs Review' : status.replace('_', ' ')}
                </Badge>
                
                {hasQuoteUpdates && (
                  <Badge className="bg-orange-100 text-orange-800">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Quote Updated
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">{statusConfig.description}</p>
            </div>
          </div>

          {/* Status Progress Indicator */}
          <div className="text-right space-y-2">
            <div className="text-2xl font-bold text-gray-700">
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
      </div>

      {/* Status-Specific Alerts - Clean version */}
      {status === 'pending' && (
        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">What's happening</h4>
              <p className="text-yellow-800 text-sm mt-1">
                Your request has been sent to qualified professionals in your area. 
                You'll typically start receiving responses within 2-4 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'interested' && interestCount > 0 && (
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Great news!</h4>
              <p className="text-blue-800 text-sm mt-1">
                {interestCount} professional{interestCount !== 1 ? 's have' : ' has'} shown interest. 
                Review their profiles, quotes, and select the best fit for your project.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'reviewing' && selectedInterest && (
        <div className="bg-orange-50 rounded-xl p-4 animate-pulse">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900">Quote Update Pending Review</h4>
              <p className="text-orange-800 text-sm mt-1">
                {selectedInterest.professional?.business_name || 'The selected professional'} 
                has updated their quote and requires your approval before proceeding.
              </p>
              <p className="text-orange-800 text-sm font-medium mt-2">
                ⚠️ Assessment scheduling is temporarily blocked until you review the changes above.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'confirmed' && selectedInterest && (
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Project confirmed</h4>
              <p className="text-green-800 text-sm mt-1">
                Your quote has been approved and {selectedInterest.professional?.business_name || 'the professional'} 
                is ready to begin work. {selectedInterest.assessment ? 'You can now schedule the assessment.' : 'Project can proceed as planned.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interest Count Summary - Clean grid */}
      {interestCount > 0 && !['cancelled', 'completed'].includes(status) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{interestCount}</div>
            <div className="text-sm text-gray-600">
              Total Response{interestCount !== 1 ? 's' : ''}
            </div>
          </div>

          {selectedInterest && (
            <>
              <div className="bg-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">1</div>
                <div className="text-sm text-gray-600">Selected</div>
              </div>

              <div className="bg-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-400">{interestCount - 1}</div>
                <div className="text-sm text-gray-600">Not Selected</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Action blockers for reviewing status */}
      {status === 'reviewing' && (
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <XCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900">Actions Currently Blocked</h4>
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
        </div>
      )}

      {/* Empty State */}
      {interestCount === 0 && status === 'pending' && (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Searching for Professionals</h3>
              <p className="text-gray-600 text-sm max-w-md">
                We're notifying qualified professionals in your area. 
                Most customers receive their first response within 2 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quote update summary card */}
      {status === 'reviewing' && hasQuoteUpdates && selectedInterest && (
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-900">Quote Changes Waiting</h4>
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
        </div>
      )}
    </div>
  );
};

export default AppointmentInterestStatus;