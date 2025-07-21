// Minimalist AppointmentInterestStatus.jsx - Clean design with rounded edges
"use client";

import { 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Award,
  Loader2
} from 'lucide-react';

const AppointmentInterestStatus = ({ 
  status, 
  interestCount = 0, 
  selectedInterest = null 
}) => {
  const getStatusConfig = (appointmentStatus) => {
    const configs = {
      'pending': {
        label: 'Pending Professional Response',
        description: 'Waiting for qualified professionals to respond to your request',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: Clock,
        progress: 20
      },
      'interested': {
        label: 'Professionals Interested',
        description: `${interestCount} professional${interestCount !== 1 ? 's have' : ' has'} shown interest`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: Users,
        progress: 40
      },
      'competing': {
        label: 'Multiple Responses Received',
        description: `${interestCount} professionals are competing for your project`,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: Users,
        progress: 60
      },
      'evaluating': {
        label: 'Assessment in Progress',
        description: 'Professional is evaluating your project requirements',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: Calendar,
        progress: 80
      },
      'quoted': {
        label: 'Quote Received',
        description: 'Professional has provided a detailed quote',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: Award,
        progress: 90
      },
      'selected': {
        label: 'Professional Selected',
        description: 'You have selected a professional for this project',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        icon: CheckCircle,
        progress: 100
      },
      'cancelled': {
        label: 'Appointment Cancelled',
        description: 'This appointment has been cancelled',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertTriangle,
        progress: 0
      },
      'completed': {
        label: 'Project Completed',
        description: 'Project has been successfully completed',
        color: 'text-green-800',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        icon: CheckCircle,
        progress: 100
      }
    };

    return configs[appointmentStatus] || {
      label: 'Unknown Status',
      description: 'Status information not available',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: AlertTriangle,
      progress: 0
    };
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'selected':
      case 'completed':
        return 'text-green-700 border-green-300 bg-green-100';
      case 'cancelled':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'pending':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const ProgressBar = ({ value }) => (
    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gray-600 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">{statusConfig.label}</h3>
                  <div className={`text-xs font-medium px-2 py-1 border rounded-md ${getStatusBadgeClass(status)}`}>
                    {status.replace('_', ' ')}
                  </div>
                </div>
                <p className="text-gray-500 text-sm">{statusConfig.description}</p>
              </div>
            </div>

            {/* Status Progress Indicator */}
            <div className="text-right space-y-2">
              <div className="text-2xl font-light text-gray-600">
                {statusConfig.progress}%
              </div>
              <ProgressBar value={statusConfig.progress} />
            </div>
          </div>
        </div>
      </div>

      {/* Status-Specific Alerts and Information */}
      {status === 'pending' && (
        <div className={`border ${statusConfig.borderColor} ${statusConfig.bgColor} rounded-lg p-4`}>
          <div className="flex items-start space-x-2">
            <Clock className={`h-4 w-4 ${statusConfig.color} flex-shrink-0 mt-0.5`} />
            <div className={`text-sm ${statusConfig.color.replace('text-', 'text-')}`}>
              <span className="font-medium">What's happening:</span> Your request has been sent to qualified professionals in your area. 
              You'll typically start receiving responses within 2-4 hours.
            </div>
          </div>
        </div>
      )}

      {status === 'interested' && interestCount > 0 && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Users className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <span className="font-medium">Great news!</span> {interestCount} professional{interestCount !== 1 ? 's have' : ' has'} shown interest. 
              Review their profiles, quotes, and select the best fit for your project.
            </div>
          </div>
        </div>
      )}

      {status === 'competing' && interestCount > 1 && (
        <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Users className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-800">
              <span className="font-medium">Multiple options available:</span> You have {interestCount} professionals competing for your project. 
              Use the comparison tool to evaluate their offers side by side.
            </div>
          </div>
        </div>
      )}

      {status === 'evaluating' && selectedInterest && (
        <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Calendar className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <span className="font-medium">Assessment in progress:</span> {selectedInterest.professional?.business_name || 'The selected professional'} 
              is evaluating your project. You'll receive a detailed quote after the assessment.
            </div>
          </div>
        </div>
      )}

      {status === 'quoted' && selectedInterest && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Award className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <span className="font-medium">Quote received:</span> {selectedInterest.professional?.business_name || 'The professional'} 
              has provided a detailed quote. Review the details and proceed with booking if you're satisfied.
            </div>
          </div>
        </div>
      )}

      {status === 'selected' && selectedInterest && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <span className="font-medium">Professional selected:</span> You've chosen {selectedInterest.professional?.business_name || 'a professional'} 
              for this project. {selectedInterest.assessment ? 'The next step is scheduling the site assessment.' : 'You can now proceed with project planning.'}
            </div>
          </div>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <span className="font-medium">Appointment cancelled:</span> This appointment has been cancelled. 
              You can create a new appointment if you still need this service.
            </div>
          </div>
        </div>
      )}

      {status === 'completed' && selectedInterest && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <span className="font-medium">Project completed:</span> Your project with {selectedInterest.professional?.business_name || 'the professional'} 
              has been completed successfully. Don't forget to leave a review!
            </div>
          </div>
        </div>
      )}

      {/* Interest Count Summary */}
      {interestCount > 0 && !['cancelled', 'completed'].includes(status) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 text-center">
              <div className="text-2xl font-light text-blue-600">{interestCount}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Total Response{interestCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {selectedInterest && (
            <>
              <div className="border border-gray-200 rounded-lg bg-white">
                <div className="p-4 text-center">
                  <div className="text-2xl font-light text-green-600">1</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Selected</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg bg-white">
                <div className="p-4 text-center">
                  <div className="text-2xl font-light text-gray-600">{interestCount - 1}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Not Selected</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {interestCount === 0 && status === 'pending' && (
        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-blue-100 rounded-full border border-blue-200">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Searching for Professionals</h3>
                <p className="text-gray-500 text-sm max-w-md">
                  We're notifying qualified professionals in your area. 
                  Most customers receive their first response within 2 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentInterestStatus;