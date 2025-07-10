'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { createClient } from '@/utils/supabase/client';
import AppointmentAddressSelector from '@/components/forms/AppointmentAddressSelector';
import CustomerAvailabilityCalendar from '@/components/forms/CustomerAvailabilityCalendar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
 Calendar, 
 Clock, 
 MapPin, 
 CheckCircle, 
 ArrowLeft, 
 ArrowRight,
 Loader2,
 AlertCircle,
 FileText,
 MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Appointment({ 
 professional, 
 serviceInformation, 
 location, 
 onSuccess, 
 onCancel 
}) {
 const { user } = useUserStore();
 const [loading, setLoading] = useState(false);
 const [errors, setErrors] = useState({});
 const [currentStep, setCurrentStep] = useState(1);
 
 const steps = useMemo(() => [
   { id: 1, title: 'Project', icon: FileText, description: 'Describe your needs' },
   { id: 2, title: 'Schedule', icon: Calendar, description: 'Pick a time' },
   { id: 3, title: 'Location', icon: MapPin, description: 'Service address' },
   { id: 4, title: 'Review', icon: CheckCircle, description: 'Confirm details' }
 ], []);

 // Form state
 const [formData, setFormData] = useState({
   title: serviceInformation?.name || '',
   description: '',
   deadline: '',
   preferred_start: '',
   urgency: 'standard',
   customer_message: '',
   use_different_address: false,
   service_location: location || {
     street_address: '',
     city: '',
     parish: '',
     community: '',
     landmark: '',
     is_rural: false,
     latitude: null,
     longitude: null,
     formatted_address: '',
     place_id: null
   }
 });

 // 🔥 DEBUG: Track component mount/unmount
 useEffect(() => {
   console.log('🔥 APPOINTMENT FORM MOUNTED');
   return () => console.log('🔥 APPOINTMENT FORM UNMOUNTED - This should NOT happen during normal use');
 }, []);

 // Update form data when props change
 useEffect(() => {
   if (location) {
     setFormData(prev => ({ ...prev, service_location: location }));
   }
 }, [location]);

 useEffect(() => {
   if (serviceInformation?.name) {
     setFormData(prev => ({ ...prev, title: serviceInformation.name }));
   }
 }, [serviceInformation?.name]);

 // Urgency options with pricing
 const urgencyOptions = useMemo(() => [
   { value: 'low', label: 'Flexible (1 week)', priceMultiplier: 0.9, badge: '-10%', color: 'bg-green-100 text-green-800' },
   { value: 'standard', label: 'Standard (3 days)', priceMultiplier: 1.0, badge: '', color: 'bg-blue-100 text-blue-800' },
   { value: 'high', label: 'Priority (24hrs)', priceMultiplier: 1.2, badge: '+20%', color: 'bg-orange-100 text-orange-800' },
   { value: 'urgent', label: 'Urgent (ASAP)', priceMultiplier: 1.5, badge: '+50%', color: 'bg-red-100 text-red-800' }
 ], []);

 // Calculate estimated price
 const estimatedPrice = useMemo(() => {
   if (!serviceInformation?.base_price) return 0;
   const urgencyMultiplier = urgencyOptions.find(opt => opt.value === formData.urgency)?.priceMultiplier || 1.0;
   return (serviceInformation.base_price * urgencyMultiplier).toFixed(2);
 }, [serviceInformation?.base_price, formData.urgency, urgencyOptions]);

 // Handle form field changes
 const handleChange = useCallback((field, value) => {
   setFormData(prev => ({ ...prev, [field]: value }));
   if (errors[field]) {
     setErrors(prev => ({ ...prev, [field]: null }));
   }
 }, [errors]);

 // Form validation
 const validateForm = useCallback(() => {
   const newErrors = {};
   
   if (!formData.description.trim()) {
     newErrors.description = 'Project description is required';
   }
   
   if (!formData.preferred_start) {
     newErrors.preferred_start = 'Please select your preferred start time';
   } else {
     const startDate = new Date(formData.preferred_start);
     if (startDate <= new Date()) {
       newErrors.preferred_start = 'Start time must be in the future';
     }
   }

   if (formData.use_different_address) {
     if (!formData.service_location.street_address) {
       newErrors.street_address = 'Street address is required';
     }
     if (!formData.service_location.city) {
       newErrors.city = 'City is required';
     }
     if (!formData.service_location.parish) {
       newErrors.parish = 'Parish is required';
     }
   }

   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
 }, [formData]);

 // Submit form
 const handleSubmit = useCallback(async () => {
   if (currentStep !== steps.length) return false;
   if (!validateForm()) return;
   if (!user?.profile?.customer_id) {
     setErrors({ general: 'Please log in to make an appointment request' });
     return;
   }

   setLoading(true);

   try {
     const supabase = createClient();
     let addressId = null;
     
     if (!formData.use_different_address) {
       const { data: customerAddress } = await supabase
         .from('address')
         .select('address_id')
         .eq('account_id', user.account.account_id)
         .eq('is_primary', true)
         .single();
       
       addressId = customerAddress?.address_id;
     }

     const requestData = {
       customer_id: user.profile.customer_id,
       professional_id: professional?.professional_id || null,
       service_id: serviceInformation.service_id,
       address_id: addressId,
       description: formData.description,
       deadline: formData.deadline || null,
       preferred_start: formData.preferred_start,
       urgency: formData.urgency,
       customer_message: formData.customer_message || null,
       service_location: formData.use_different_address ? {
         ...formData.service_location,
         latitude: location?.lat,
         longitude: location?.lng,
         formatted_address: `${formData.service_location.street_address}, ${formData.service_location.city}, ${formData.service_location.parish}`
       } : null
     };

     const response = await fetch('/api/appointments', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(requestData)
     });

     const result = await response.json();

     if (!response.ok) {
       throw new Error(result.error || 'Failed to create appointment request');
     }

     onSuccess?.(result.appointment);

   } catch (error) {
     console.error('Appointment request error:', error);
     setErrors({ general: error.message });
   } finally {
     setLoading(false);
   }
 }, [formData, validateForm, user, professional, serviceInformation, location, onSuccess, currentStep, steps.length]);

 // Step navigation
 const nextStep = useCallback(() => {
   if (currentStep < steps.length) {
     setCurrentStep(prev => prev + 1);
   }
 }, [currentStep, steps.length]);

 const prevStep = useCallback(() => {
   if (currentStep > 1) {
     setCurrentStep(prev => prev - 1);
   }
 }, [currentStep]);

 const goToStep = useCallback((stepNumber) => {
   if (stepNumber >= 1 && stepNumber <= steps.length && isStepValid(stepNumber)) {
     setCurrentStep(stepNumber);
   }
 }, [steps.length]);

 // Check if step is valid for navigation
 const isStepValid = useCallback((step) => {
   switch (step) {
     case 1: return formData.description.trim() !== '';
     case 2: return formData.preferred_start !== '';
     case 3: return !formData.use_different_address || (
       formData.service_location.street_address &&
       formData.service_location.city &&
       formData.service_location.parish
     );
     case 4: return true;
     default: return false;
   }
 }, [formData]);

 // Progress calculation
 const calculateProgress = useCallback(() => {
   return ((currentStep - 1) / (steps.length - 1)) * 100;
 }, [currentStep, steps.length]);

 // Get step status
 const getStepStatus = useCallback((stepId) => {
   if (currentStep > stepId) return 'completed';
   if (currentStep === stepId) return 'active';
   if (isStepValid(stepId)) return 'available';
   return 'pending';
 }, [currentStep, isStepValid]);

 // Handle calendar slot selection
 const handleSlotSelect = useCallback((datetime) => {
   handleChange('preferred_start', datetime);
 }, [handleChange]);

 return (
   <div className="flex flex-col h-full max-h-[95vh]">
     
     {/* 🔧 FIX: Fixed Header with Progress */}
     <div className="flex-shrink-0 bg-background border-b p-6">
       <div className="w-full max-w-4xl mx-auto space-y-6">
         {/* Progress Bar */}
         <div className="space-y-3">
           <div className="flex justify-between items-center">
             <span className="text-sm text-muted-foreground">
               Step {currentStep} of {steps.length}
             </span>
           </div>
           <Progress value={calculateProgress()} className="h-2" />
         </div>

         {/* Step Navigation */}
         <div className="grid grid-cols-4 gap-2">
           {steps.map((step) => {
             const status = getStepStatus(step.id);
             const StepIcon = step.icon;
             
             return (
               <button
                 key={step.id}
                 type="button"
                 onClick={() => goToStep(step.id)}
                 disabled={status === 'pending'}
                 className={cn(
                   "flex flex-col items-center gap-2 p-3 rounded-lg transition-all text-center",
                   status === 'active' && "bg-primary text-primary-foreground",
                   status === 'completed' && "bg-green-100 text-green-700 hover:bg-green-200",
                   status === 'available' && "bg-orange-50 text-orange-700 hover:bg-orange-100",
                   status === 'pending' && "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                 )}
               >
                 <StepIcon className="h-5 w-5" />
                 <div>
                   <div className="font-medium text-sm">{step.title}</div>
                   <div className="text-xs opacity-80">{step.description}</div>
                 </div>
               </button>
             );
           })}
         </div>
       </div>
     </div>

     {/* 🔧 FIX: Scrollable Content Area */}
     <div className="flex-1 overflow-y-auto">
       <div className="w-full max-w-4xl mx-auto p-6">
         <div className="space-y-6">
           
           {/* Step 1: Project Details */}
           {currentStep === 1 && (
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <FileText className="h-5 w-5" />
                   Describe Your Project
                 </CardTitle>
                 <p className="text-sm text-muted-foreground">
                   Tell us what you need help with so we can match you with the right professional.
                 </p>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="space-y-2">
                   <Label htmlFor="description">What do you need done? *</Label>
                   <Textarea
                     id="description"
                     rows={4}
                     value={formData.description}
                     onChange={(e) => handleChange('description', e.target.value)}
                     placeholder="Describe your project in detail. Include any specific requirements, materials needed, or preferences you have..."
                     className={errors.description ? 'border-destructive' : ''}
                   />
                   {errors.description && (
                     <p className="text-sm text-destructive flex items-center gap-1">
                       <AlertCircle className="h-3 w-3" />
                       {errors.description}
                     </p>
                   )}
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="deadline">Preferred completion date (Optional)</Label>
                   <Input
                     type="date"
                     id="deadline"
                     value={formData.deadline}
                     onChange={(e) => handleChange('deadline', e.target.value)}
                     min={new Date().toISOString().split('T')[0]}
                     className={errors.deadline ? 'border-destructive' : ''}
                   />
                   <p className="text-xs text-muted-foreground">
                     When would you like the work to be completed?
                   </p>
                 </div>

                 {/* Urgency Selection
                 <div className="space-y-3">
                   <Label>How quickly do you need this done?</Label>
                   <div className="grid gap-3 sm:grid-cols-2">
                     {urgencyOptions.map((option) => (
                       <label
                         key={option.value}
                         className={cn(
                           "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all",
                           formData.urgency === option.value 
                             ? "border-primary bg-primary/5" 
                             : "border-border hover:border-primary/50"
                         )}
                       >
                         <input
                           type="radio"
                           name="urgency"
                           value={option.value}
                           checked={formData.urgency === option.value}
                           onChange={(e) => handleChange('urgency', e.target.value)}
                           className="sr-only"
                         />
                         <div className="flex items-center gap-2">
                           <div className={cn("w-3 h-3 rounded-full border-2", 
                             formData.urgency === option.value ? "bg-primary border-primary" : "border-muted-foreground"
                           )} />
                           <span className="font-medium">{option.label}</span>
                         </div>
                         {option.badge && (
                           <Badge variant="secondary" className={option.color}>
                             {option.badge}
                           </Badge>
                         )}
                       </label>
                     ))}
                   </div>
                 </div> */}
               </CardContent>
             </Card>
           )}

           {/* Step 2: Calendar */}
           {currentStep === 2 && (
             <Card className="overflow-hidden">
               <CardHeader className="border-b bg-muted/30">
                 <CardTitle className="text-lg">Select Assessment Time</CardTitle>
                 <p className="text-sm text-muted-foreground">
                   Choose when you'd like the professional to assess your project
                 </p>
               </CardHeader>
               
               <div className="h-[500px] overflow-hidden">
                 <CustomerAvailabilityCalendar
                   professionalId={professional?.professional_id}
                   onSlotSelect={handleSlotSelect}
                   selectedSlot={formData.preferred_start}
                 />
                 
                 {errors.preferred_start && (
                   <Alert variant="destructive" className="m-4">
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription>{errors.preferred_start}</AlertDescription>
                   </Alert>
                 )}
               </div>
             </Card>
           )}

           {/* Step 3: Location */}
           {currentStep === 3 && (
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <MapPin className="h-5 w-5" />
                   Service Location
                 </CardTitle>
                 <p className="text-sm text-muted-foreground">
                   Where should the service be performed?
                 </p>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="flex items-center space-x-2">
                   <Checkbox 
                     id="use_different_address"
                     checked={formData.use_different_address}
                     onCheckedChange={(checked) => handleChange('use_different_address', checked)}
                   />
                   <Label htmlFor="use_different_address" className="text-sm font-medium">
                     Use a different address for this service
                   </Label>
                 </div>

                 {!formData.use_different_address ? (
                   <Alert>
                     <MapPin className="h-4 w-4" />
                     <AlertDescription>
                       <div className="space-y-1">
                         <div className="font-medium">Using your primary address</div>
                         <div className="text-sm">
                           {formData.service_location?.formatted_address || 'Your confirmed location will be used'}
                         </div>
                       </div>
                     </AlertDescription>
                   </Alert>
                 ) : (
                   <div className="space-y-4">
                     <div className="p-4 border rounded-lg bg-muted/30">
                       <h4 className="font-medium mb-2">Service Address</h4>
                       <AppointmentAddressSelector
                         onAddressSelect={(address) => {
                           setFormData(prev => ({
                             ...prev,
                             service_location: address
                           }));
                         }}
                         currentAddress={formData.service_location}
                       />
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>
           )}

           {/* Step 4: Review & Confirm */}
           {currentStep === 4 && (
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <CheckCircle className="h-5 w-5" />
                   Review & Confirm
                 </CardTitle>
                 <p className="text-sm text-muted-foreground">
                   Please review your appointment details before submitting
                 </p>
               </CardHeader>
               <CardContent className="space-y-6">
                 {/* Service Summary */}
                 <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                   <div className="flex items-start justify-between">
                     <div>
                       <h4 className="font-semibold">{serviceInformation?.name}</h4>
                       <p className="text-sm text-muted-foreground mt-1">
                         {formData.description.substring(0, 100)}
                         {formData.description.length > 100 && '...'}
                       </p>
                     </div>
                     <Badge variant="outline" className="text-lg font-semibold">
                       JMD ${estimatedPrice}
                     </Badge>
                   </div>

                   <Separator />

                   <div className="grid gap-3 sm:grid-cols-2">
                     <div className="flex items-center gap-2">
                       <Calendar className="h-4 w-4 text-muted-foreground" />
                       <div>
                         <div className="font-medium">Assessment Date</div>
                         <div className="text-sm text-muted-foreground">
                           {formData.preferred_start && new Date(formData.preferred_start).toLocaleDateString('en-US', {
                             weekday: 'long',
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })}
                         </div>
                       </div>
                     </div>

                     <div className="flex items-center gap-2">
                       <Clock className="h-4 w-4 text-muted-foreground" />
                       <div>
                         <div className="font-medium">Time</div>
                         <div className="text-sm text-muted-foreground">
                           {formData.preferred_start && new Date(formData.preferred_start).toLocaleTimeString('en-US', {
                             hour: 'numeric',
                             minute: '2-digit',
                             hour12: true
                           })}
                         </div>
                       </div>
                     </div>

                     <div className="flex items-center gap-2">
                       <Badge 
                         variant="secondary" 
                         className={urgencyOptions.find(opt => opt.value === formData.urgency)?.color}
                       >
                         {urgencyOptions.find(opt => opt.value === formData.urgency)?.label}
                       </Badge>
                     </div>

                     {formData.deadline && (
                       <div className="flex items-center gap-2">
                         <div className="font-medium">Complete by:</div>
                         <div className="text-sm text-muted-foreground">
                           {new Date(formData.deadline).toLocaleDateString()}
                         </div>
                       </div>
                     )}
                   </div>

                   {formData.use_different_address && formData.service_location.street_address && (
                     <>
                       <Separator />
                       <div className="flex items-start gap-2">
                         <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                         <div>
                           <div className="font-medium">Service Location</div>
                           <div className="text-sm text-muted-foreground">
                             {formData.service_location.street_address}<br />
                             {formData.service_location.city}, {formData.service_location.parish}
                           </div>
                         </div>
                       </div>
                     </>
                   )}
                 </div>

                 {/* Additional Message */}
                 <div className="space-y-2">
                   <Label htmlFor="customer_message">Additional Message (Optional)</Label>
                   <Textarea
                     id="customer_message"
                     rows={3}
                     value={formData.customer_message}
                     onChange={(e) => handleChange('customer_message', e.target.value)}
                     placeholder="Any special instructions, preferences, or questions for the professional..."
                   />
                 </div>

                 {/* Error Display */}
                 {errors.general && (
                   <Alert variant="destructive">
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription>{errors.general}</AlertDescription>
                   </Alert>
                 )}

                 {/* Terms Notice */}
                 <Alert>
                   <MessageSquare className="h-4 w-4" />
                   <AlertDescription>
                     <strong>Next Steps:</strong> Your appointment request will be sent to the professional. 
                     They will review your requirements and either accept, decline, or send you a custom quote. 
                     You'll be notified via email and in your dashboard.
                   </AlertDescription>
                 </Alert>
               </CardContent>
             </Card>
           )}
         </div>
       </div>
     </div>

     {/* 🔧 FIX: Fixed Footer with Action Buttons - ALWAYS VISIBLE */}
     <div className="flex-shrink-0 bg-background border-t shadow-lg">
       <div className="w-full max-w-4xl mx-auto p-6">
         <div className="flex justify-between items-center">
           <div className="flex gap-2">
             {currentStep > 1 && (
               <Button 
                 type="button"
                 variant="outline"
                 onClick={prevStep}
                 className="gap-2"
                 disabled={loading}
               >
                 <ArrowLeft className="h-4 w-4" />
                 Back
               </Button>
             )}
             
             {currentStep === 1 && (
               <Button 
                 type="button"
                 variant="outline"
                 onClick={onCancel}
                 disabled={loading}
               >
                 Cancel
               </Button>
             )}
           </div>

           {currentStep < steps.length ? (
             <Button 
               type="button"
               onClick={nextStep}
               disabled={!isStepValid(currentStep) || loading}
               className="gap-2"
             >
               Continue
               <ArrowRight className="h-4 w-4" />
             </Button>
           ) : (
             <Button
               type="button"
               onClick={handleSubmit}
               disabled={loading}
               size="lg"
               className="gap-2 px-8"
             >
               {loading ? (
                 <>
                   <Loader2 className="h-4 w-4 animate-spin" />
                   Creating Request...
                 </>
               ) : (
                 <>
                   <CheckCircle className="h-4 w-4" />
                   Send Appointment Request
                 </>
               )}
             </Button>
           )}
         </div>
       </div>
     </div>
   </div>
 );
}