// src/components/customer-workspace/interests/AssessmentScheduler.jsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  MapPin, 
  User, 
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Shield
} from 'lucide-react';

const AssessmentScheduler = ({ 
  interest, 
  assessment = null, 
  onScheduleAssessment,
  onConfirmAssessment,
  onCancelAssessment,
  isLoading = false 
}) => {
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  const professional = interest?.professional;
  const account = professional?.account;

  // Generate available time slots for selected date
  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const generateTimeSlots = (date) => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    setAvailableTimeSlots(slots);
  };

  const handleScheduleAssessment = async () => {
    if (!selectedDate || !selectedTimeSlot) return;

    const assessmentDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTimeSlot.split(':');
    assessmentDateTime.setHours(parseInt(hours), parseInt(minutes));

    const result = await onScheduleAssessment({
      interest_id: interest.interest_id,
      proposed_date: assessmentDateTime.toISOString(),
      customer_special_instructions: specialInstructions,
      duration_minutes: interest.duration || 60
    });

    if (result?.success) {
      setShowConfirmDialog(false);
      setSelectedDate(undefined);
      setSelectedTimeSlot('');
      setSpecialInstructions('');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAssessmentStatusBadge = (status) => {
    const statusConfig = {
      'proposed': { variant: 'secondary', label: 'Proposed' },
      'accepted': { variant: 'default', label: 'Accepted' },
      'scheduled': { variant: 'default', label: 'Scheduled' },
      'confirmed': { variant: 'default', label: 'Confirmed' },
      'in_progress': { variant: 'default', label: 'In Progress' },
      'completed': { variant: 'default', label: 'Completed' },
      'cancelled': { variant: 'destructive', label: 'Cancelled' },
      'no_show': { variant: 'destructive', label: 'No Show' }
    };
    
    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // If no assessment is required, don't show the scheduler
  if (!interest?.assessment) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Professional Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={account?.profile_picture_url} />
              <AvatarFallback className="text-lg">
                {account?.first_name?.[0]}{account?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">
                  {account?.first_name} {account?.last_name}
                </h2>
                {professional?.verification_status === 'verified' && (
                  <Shield className="h-5 w-5 text-green-600" />
                )}
              </div>
              
              {professional?.business_name && (
                <p className="text-muted-foreground">{professional.business_name}</p>
              )}
              
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{account?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assessment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Site Assessment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-muted-foreground">Assessment Type</h4>
              <Badge variant="outline" className="capitalize">
                {interest.modality} Assessment
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-muted-foreground">Duration</h4>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{interest.duration || 60} minutes</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-muted-foreground">Assessment Fee</h4>
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold">
                  {interest.fee > 0 ? formatCurrency(interest.fee) : 'Free'}
                </span>
              </div>
            </div>
          </div>

          {interest.fee > 0 && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                The assessment fee will be applied to your final project cost if you proceed with this professional.
              </AlertDescription>
            </Alert>
          )}

          {/* Professional's Message */}
          {interest.message && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Professional's Message:</h4>
              <p className="text-sm">{interest.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Assessment Status */}
      {assessment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Assessment Status</CardTitle>
              {getAssessmentStatusBadge(assessment.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessment.proposed_date && (
              <div className="space-y-2">
                <h4 className="font-medium text-muted-foreground">Scheduled Time</h4>
                <p className="font-medium">{formatDateTime(assessment.proposed_date)}</p>
              </div>
            )}

            {assessment.proposal_message && (
              <div className="space-y-2">
                <h4 className="font-medium text-muted-foreground">Professional's Proposal</h4>
                <p className="text-sm">{assessment.proposal_message}</p>
              </div>
            )}

            {assessment.customer_special_instructions && (
              <div className="space-y-2">
                <h4 className="font-medium text-muted-foreground">Your Instructions</h4>
                <p className="text-sm">{assessment.customer_special_instructions}</p>
              </div>
            )}

            {/* Assessment Actions */}
            <div className="flex space-x-2 pt-4">
              {assessment.status === 'proposed' && (
                <>
                  <Button 
                    onClick={() => onConfirmAssessment(assessment.assessment_id)}
                    disabled={isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Assessment
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onCancelAssessment(assessment.assessment_id)}
                    disabled={isLoading}
                  >
                    Request Different Time
                  </Button>
                </>
              )}

              {assessment.status === 'scheduled' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Assessment Confirmed!</strong> The professional will contact you before the scheduled time.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule New Assessment */}
      {(!assessment || assessment.status === 'cancelled') && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="space-y-4">
                <h4 className="font-medium">Select Date</h4>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                  className="rounded-md border"
                />
              </div>

              {/* Time Slots */}
              <div className="space-y-4">
                <h4 className="font-medium">Select Time</h4>
                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                   {availableTimeSlots.map((slot) => (
                     <Button
                       key={slot}
                       variant={selectedTimeSlot === slot ? "default" : "outline"}
                       size="sm"
                       onClick={() => setSelectedTimeSlot(slot)}
                       className="text-xs"
                     >
                       {slot}
                     </Button>
                   ))}
                 </div>
               ) : (
                 <p className="text-muted-foreground text-sm">
                   Please select a date first
                 </p>
               )}
             </div>
           </div>

           {/* Special Instructions */}
           <div className="space-y-2">
             <h4 className="font-medium">Special Instructions (Optional)</h4>
             <Textarea
               placeholder="e.g., Use side entrance, dogs on property, parking instructions..."
               value={specialInstructions}
               onChange={(e) => setSpecialInstructions(e.target.value)}
               className="min-h-[80px]"
             />
           </div>

           {/* Schedule Button */}
           <Button
             onClick={() => setShowConfirmDialog(true)}
             disabled={!selectedDate || !selectedTimeSlot || isLoading}
             className="w-full"
           >
             <CalendarIcon className="h-4 w-4 mr-2" />
             Schedule Assessment
           </Button>
         </CardContent>
       </Card>
     )}

     {/* Assessment Information */}
     <Card>
       <CardHeader>
         <CardTitle>What to Expect</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-3">
             <h4 className="font-medium">During the Assessment:</h4>
             <ul className="space-y-2 text-sm text-muted-foreground">
               <li className="flex items-start space-x-2">
                 <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                 <span>Professional will examine the work area</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                 <span>Take measurements and photos</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                 <span>Discuss your requirements and preferences</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                 <span>Identify any potential challenges</span>
               </li>
             </ul>
           </div>

           <div className="space-y-3">
             <h4 className="font-medium">After the Assessment:</h4>
             <ul className="space-y-2 text-sm text-muted-foreground">
               <li className="flex items-start space-x-2">
                 <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-600 rounded-full mt-2"></span>
                 <span>Receive detailed, accurate quote</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-600 rounded-full mt-2"></span>
                 <span>Timeline and materials breakdown</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-600 rounded-full mt-2"></span>
                 <span>Clear scope of work document</span>
               </li>
               <li className="flex items-start space-x-2">
                 <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-600 rounded-full mt-2"></span>
                 <span>Option to proceed with the project</span>
               </li>
             </ul>
           </div>
         </div>
       </CardContent>
     </Card>

     {/* Confirmation Dialog */}
     <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>Confirm Assessment Schedule</DialogTitle>
           <DialogDescription>
             Please review your assessment details before confirming.
           </DialogDescription>
         </DialogHeader>
         
         <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
               <span className="font-medium text-muted-foreground">Professional:</span>
               <p>{account?.first_name} {account?.last_name}</p>
             </div>
             <div>
               <span className="font-medium text-muted-foreground">Date & Time:</span>
               <p>
                 {selectedDate?.toLocaleDateString('en-US', {
                   weekday: 'long',
                   month: 'long',
                   day: 'numeric'
                 })} at {selectedTimeSlot}
               </p>
             </div>
             <div>
               <span className="font-medium text-muted-foreground">Duration:</span>
               <p>{interest.duration || 60} minutes</p>
             </div>
             <div>
               <span className="font-medium text-muted-foreground">Fee:</span>
               <p>{interest.fee > 0 ? formatCurrency(interest.fee) : 'Free'}</p>
             </div>
           </div>

           {specialInstructions && (
             <div>
               <span className="font-medium text-muted-foreground text-sm">Special Instructions:</span>
               <p className="text-sm mt-1 p-2 bg-muted rounded">{specialInstructions}</p>
             </div>
           )}

           {interest.fee > 0 && (
             <Alert className="bg-blue-50 border-blue-200">
               <AlertCircle className="h-4 w-4 text-blue-600" />
               <AlertDescription className="text-blue-800 text-sm">
                 The assessment fee of {formatCurrency(interest.fee)} will be charged and applied to your final project cost if you proceed.
               </AlertDescription>
             </Alert>
           )}
         </div>

         <DialogFooter>
           <Button 
             variant="outline" 
             onClick={() => setShowConfirmDialog(false)}
             disabled={isLoading}
           >
             Cancel
           </Button>
           <Button 
             onClick={handleScheduleAssessment}
             disabled={isLoading}
           >
             {isLoading ? 'Scheduling...' : 'Confirm Assessment'}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   </div>
 );
};

export default AssessmentScheduler;