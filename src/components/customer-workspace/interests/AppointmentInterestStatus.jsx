import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Award,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AppointmentInterestStatus = ({ 
  status, 
  interestCount = 0, 
  selectedInterest = null,
  hasQuoteUpdates = false
}) => {
  const getStatusConfig = (appointmentStatus) => {
    const configs = {
      'pending': {
        label: interestCount > 0 ? `${interestCount} response${interestCount !== 1 ? 's' : ''}` : 'Waiting for responses',
        icon: interestCount > 0 ? Users : Clock,
        variant: 'outline',
        className: interestCount > 0 
          ? 'text-blue-600 border-blue-200 bg-blue-50'
          : 'text-muted-foreground border-muted-foreground/20'
      },
      'interested': {
        label: `${interestCount} interested`,
        icon: Users,
        variant: 'outline',
        className: 'text-blue-600 border-blue-200 bg-blue-50'
      },
      'competing': {
        label: `${interestCount} competing`,
        icon: Users,
        variant: 'outline', 
        className: 'text-purple-600 border-purple-200 bg-purple-50'
      },
      'evaluating': {
        label: 'Assessment in progress',
        icon: Calendar,
        variant: 'outline',
        className: 'text-orange-600 border-orange-200 bg-orange-50'
      },
      'quoted': {
        label: 'Quote received',
        icon: Award,
        variant: 'outline',
        className: 'text-green-600 border-green-200 bg-green-50'
      },
      'selected': {
        label: 'Professional selected',
        icon: CheckCircle,
        variant: 'default',
        className: 'text-green-700 bg-green-100 border-green-300'
      },
      'reviewing': {
        label: 'Quote updated - review needed',
        icon: AlertTriangle,
        variant: 'outline',
        className: 'text-orange-600 border-orange-300 bg-orange-50 animate-pulse'
      },
      'confirmed': {
        label: 'Confirmed',
        icon: CheckCircle,
        variant: 'default',
        className: 'text-green-800 bg-green-600 text-white'
      },
      'cancelled': {
        label: 'Cancelled',
        icon: AlertTriangle,
        variant: 'outline',
        className: 'text-red-600 border-red-200 bg-red-50'
      }
    };

    return configs[appointmentStatus] || configs.pending;
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  // Only show meaningful states
  if (['completed', 'archived'].includes(status)) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Main Status - Single clean badge */}
      <div className="flex items-center justify-between">
        <Badge 
          variant={statusConfig.variant}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium",
            statusConfig.className
          )}
        >
          <StatusIcon className="h-4 w-4" />
          {statusConfig.label}
        </Badge>

        {/* Quote update indicator */}
        {hasQuoteUpdates && (
          <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
            <RefreshCw className="h-3 w-3 mr-1" />
            Quote updated
          </Badge>
        )}
      </div>

      {/* Only show waiting message when there are actually no responses */}
      {status === 'pending' && interestCount === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Professionals will respond within 2-4 hours</span>
        </div>
      )}

      {status === 'reviewing' && (
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="text-sm text-orange-800">
            <span className="font-medium">Action needed:</span> Review quote changes to continue
          </div>
        </div>
      )}

      {/* Quote change summary - only when relevant */}
      {status === 'reviewing' && selectedInterest?.amount && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Updated quote:</span>
          <span className="font-medium">${selectedInterest.amount.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default AppointmentInterestStatus;