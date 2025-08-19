import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
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

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const generateTimeSlots = (date) => {
    const slots = [];
    const startHour = 8;
    const endHour = 18;
    
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
      'proposed': { className: 'bg-blue-100 text-blue-800', label: 'Proposed' },
      'accepted': { className: 'bg-green-100 text-green-800', label: 'Accepted' },
      'scheduled': { className: 'bg-green-100 text-green-800', label: 'Scheduled' },
      'confirmed': { className: 'bg-green-100 text-green-800', label: 'Confirmed' },
      'in_progress': { className: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      'completed': { className: 'bg-green-100 text-green-800', label: 'Completed' },
      'cancelled': { className: 'bg-red-100 text-red-800', label: 'Cancelled' },
      'no_show': { className: 'bg-red-100 text-red-800', label: 'No Show' }
    };
    
    const config = statusConfig[status] || { className: 'bg-gray-100 text-gray-700', label: status };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (!interest?.assessment) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Professional Info Header */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={account?.profile_picture_url} />
            <AvatarFallback className="text-lg">
              {account?.first_name?.[0]}{account?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-gray-900">
                {account?.first_name} {account?.last_name}
              </h2>
              {professional?.verification_status === 'verified' && (
                <Shield className="h-5 w-5 text-green-600" />
              )}
            </div>
            
            {professional?.business_name && (
              <p className="text-gray-600">{professional.business_name}</p>
            )}
            
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{account?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Details */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CalendarIcon className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Site Assessment Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-600">Assessment Type</h4>
            <Badge className="bg-blue-100 text-blue-800 capitalize">
              {interest.modality} Assessment
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-600">Duration</h4>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{interest.duration || 60} minutes</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-600">Assessment Fee</h4>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold">
                {interest.fee > 0 ? formatCurrency(interest.fee) : 'Free'}
              </span>
            </div>
          </div>
        </div>

        {interest.fee > 0 && (
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-blue-800 text-sm">
                The assessment fee will be applied to your final project cost if you proceed with this professional.
              </div>
            </div>
          </div>
        )}

        {interest.message && (
          <div className="p-4 bg-gray-50 rounded-xl mt-4">
            <h4 className="font-medium mb-2">Professional's Message:</h4>
            <p className="text-sm text-gray-700">{interest.message}</p>
          </div>
        )}
      </div>

      {/* Current Assessment Status */}
      {assessment && (
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Assessment Status</h3>
            {getAssessmentStatusBadge(assessment.status)}
          </div>
          
          <div className="space-y-4">
            {assessment.proposed_date && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-600">Scheduled Time</h4>
                <p className="font-medium text-gray-900">{formatDateTime(assessment.proposed_date)}</p>
              </div>
            )}

            {assessment.proposal_message && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-600">Professional's Proposal</h4>
                <p className="text-sm text-gray-700">{assessment.proposal_message}</p>
              </div>
            )}

            {assessment.customer_special_instructions && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-600">Your Instructions</h4>
                <p className="text-sm text-gray-700">{assessment.customer_special_instructions}</p>
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
                <div className="bg-green-50 rounded-xl p-3 w-full">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-green-800 text-sm">
                      <strong>Assessment Confirmed!</strong> The professional will contact you before the scheduled time.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule New Assessment */}
      {(!assessment || assessment.status === 'cancelled') && (
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Schedule Assessment</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Calendar */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Select Date</h4>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-xl border border-gray-200 p-3"
              />
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Select Time</h4>
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
               <p className="text-gray-500 text-sm">
                 Please select a date first
               </p>
             )}
           </div>
         </div>

         {/* Special Instructions */}
         <div className="space-y-2 mb-6">
           <h4 className="font-medium text-gray-700">Special Instructions (Optional)</h4>
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
       </div>
     )}

     {/* Assessment Information */}
     <div className="bg-white rounded-xl p-6">
       <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-3">
           <h4 className="font-medium text-gray-700">During the Assessment:</h4>
           <ul className="space-y-2 text-sm text-gray-600">
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
           <h4 className="font-medium text-gray-700">After the Assessment:</h4>
           <ul className="space-y-2 text-sm text-gray-600">
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
     </div>

     {/* Confirmation Dialog */}
     <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
       <DialogContent className="max-w-md">
         <DialogHeader>
           <DialogTitle>Confirm Assessment Schedule</DialogTitle>
           <DialogDescription>
             Please review your assessment details before confirming.
           </DialogDescription>
         </DialogHeader>
         
         <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
               <span className="font-medium text-gray-600">Professional:</span>
               <p>{account?.first_name} {account?.last_name}</p>
             </div>
             <div>
               <span className="font-medium text-gray-600">Date & Time:</span>
               <p>
                 {selectedDate?.toLocaleDateString('en-US', {
                   weekday: 'long',
                   month: 'long',
                   day: 'numeric'
                 })} at {selectedTimeSlot}
               </p>
             </div>
             <div>
               <span className="font-medium text-gray-600">Duration:</span>
               <p>{interest.duration || 60} minutes</p>
             </div>
             <div>
               <span className="font-medium text-gray-600">Fee:</span>
               <p>{interest.fee > 0 ? formatCurrency(interest.fee) : 'Free'}</p>
             </div>
           </div>

           {specialInstructions && (
             <div>
               <span className="font-medium text-gray-600 text-sm">Special Instructions:</span>
               <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{specialInstructions}</p>
             </div>
           )}

           {interest.fee > 0 && (
             <div className="bg-blue-50 rounded-xl p-3">
               <div className="flex items-start space-x-2">
                 <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                 <div className="text-blue-800 text-sm">
                   The assessment fee of {formatCurrency(interest.fee)} will be charged and applied to your final project cost if you proceed.
                 </div>
               </div>
             </div>
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