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
        color: 'bg-yellow-500',
        icon: Clock,
        progress: 20
      },
      'interested': {
        label: 'Professionals Interested',
        description: `${interestCount} professional${interestCount !== 1 ? 's have' : ' has'} shown interest`,
        color: 'bg-blue-500',
        icon: Users,
        progress: 40
      },
      'competing': {
        label: 'Multiple Responses Received',
        description: `${interestCount} professionals are competing for your project`,
        color: 'bg-purple-500',
        icon: Users,
        progress: 60
      },
      'evaluating': {
        label: 'Assessment in Progress',
        description: 'Professional is evaluating your project requirements',
        color: 'bg-orange-500',
        icon: Calendar,
        progress: 80
      },
      'quoted': {
        label: 'Quote Received',
        description: 'Professional has provided a detailed quote',
        color: 'bg-green-500',
        icon: Award,
        progress: 90
      },
      'selected': {
        label: 'Professional Selected',
        description: 'You have selected a professional for this project',
        color: 'bg-green-600',
        icon: CheckCircle,
        progress: 100
      },
      'cancelled': {
        label: 'Appointment Cancelled',
        description: 'This appointment has been cancelled',
        color: 'bg-red-500',
        icon: AlertTriangle,
        progress: 0
      },
      'completed': {
        label: 'Project Completed',
        description: 'Project has been successfully completed',
        color: 'bg-green-700',
        icon: CheckCircle,
        progress: 100
      }
    };

    return configs[appointmentStatus] || {
      label: 'Unknown Status',
      description: 'Status information not available',
      color: 'bg-gray-500',
      icon: AlertTriangle,
      progress: 0
    };
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'selected':
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getProgressColor = (progress) => {
    if (progress <= 25) return 'bg-red-500';
    if (progress <= 50) return 'bg-yellow-500';
    if (progress <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${statusConfig.color.replace('bg-', 'bg-')} bg-opacity-10`}>
                <StatusIcon className={`h-6 w-6 ${statusConfig.color.replace('bg-', 'text-')}`} />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold">{statusConfig.label}</h3>
                  <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
                    {status.replace('_', ' ')}
                  </Badge>
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
                  className="h-2"
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

      {status === 'selected' && selectedInterest && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Professional selected:</strong> You've chosen {selectedInterest.professional?.business_name || 'a professional'} 
            for this project. {selectedInterest.assessment ? 'The next step is scheduling the site assessment.' : 'You can now proceed with project planning.'}
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
    </div>
  );
};

export default AppointmentInterestStatus;