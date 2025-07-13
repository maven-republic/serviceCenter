'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { createClient } from '@/utils/supabase/client';
import AppointmentAddressSelector from '@/components/forms/AppointmentAddressSelector';
import CustomerAvailabilityCalendar from '@/components/forms/CustomerAvailabilityCalendar';
import AppointmentFileUpload from '@/components/forms/AppointmentFileUpload';
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
 MessageSquare,
 Upload,
 Image
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
 
 // 5-step flow with dedicated file upload step
 const steps = useMemo(() => [
   { id: 1, title: 'Project', icon: FileText, description: 'Describe your needs' },
   { id: 2, title: 'Files', icon: Upload, description: 'Upload references' },
   { id: 3, title: 'Schedule', icon: Calendar, description: 'Pick a time' },
   { id: 4, title: 'Location', icon: MapPin, description: 'Service address' },
   { id: 5, title: 'Review', icon: CheckCircle, description: 'Confirm details' }
 ], []);

 // Form state with file attachments
 const [formData, setFormData] = useState({
   title: serviceInformation?.name || '',
   description: '',
   deadline: '',
   preferred_start: '',
   urgency: 'standard',
   customer_message: '',
   attachments: [], // File attachments array
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

 // Debug component lifecycle
 useEffect(() => {
   console.log('🔥 APPOINTMENT FORM MOUNTED');
   return () => console.log('🔥 APPOINTMENT FORM UNMOUNTED');
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

 // Urgency options with pricing multipliers
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

 // Handle file upload changes
 const handleFilesChange = useCallback((files) => {
   setFormData(prev => ({ ...prev, attachments: files }));
   console.log('📎 Files updated:', files.length, 'files');
 }, []);

 // Form validation
 const validateForm = useCallback(() => {
   const newErrors = {};
   
   // Step 1 validation - Project description required
   if (!formData.description.trim()) {
     newErrors.description = 'Project description is required';
   }
   
   // Step 3 validation - Schedule required
   if (!formData.preferred_start) {
     newErrors.preferred_start = 'Please select your preferred start time';
   } else {
     const startDate = new Date(formData.preferred_start);
     if (startDate <= new Date()) {
       newErrors.preferred_start = 'Start time must be in the future';
     }
   }

   // Step 4 validation - Address if using different location
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

 // Submit appointment with file uploads
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
     
     // Get customer address if not using different address
     if (!formData.use_different_address) {
       const { data: customerAddress } = await supabase
         .from('address')
         .select('address_id')
         .eq('account_id', user.account.account_id)
         .eq('is_primary', true)
         .single();
       
       addressId = customerAddress?.address_id;
     }

     // Upload files first if any exist
     let attachmentIds = [];
     if (formData.attachments && formData.attachments.length > 0) {
       console.log('📤 Uploading', formData.attachments.length, 'files...');
       
       for (const fileData of formData.attachments) {
         if (!fileData.uploaded && fileData.file) {
           try {
             const uploadData = new FormData();
             uploadData.append('file', fileData.file);
             
             const uploadResponse = await fetch('/api/assets/upload', {
               method: 'POST',
               body: uploadData
             });
             
             const uploadResult = await uploadResponse.json();
             
             if (uploadResponse.ok) {
               attachmentIds.push({
                 asset_id: uploadResult.asset.id,
                 purpose: fileData.purpose
               });
               console.log('✅ Uploaded:', fileData.name);
             } else {
               console.error('❌ Upload failed for', fileData.name, ':', uploadResult.error);
               // Continue with other files, don't fail entire process
             }
           } catch (error) {
             console.error('❌ Upload error for', fileData.name, ':', error);
             // Continue with other files
           }
         }
       }
       
       console.log('📎 Total attachments ready:', attachmentIds.length);
     }

     // Create appointment request with attachments
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
       attachment_ids: attachmentIds, // Include attachment IDs
       service_location: formData.use_different_address ? {
         ...formData.service_location,
         latitude: location?.lat,
         longitude: location?.lng,
         formatted_address: `${formData.service_location.street_address}, ${formData.service_location.city}, ${formData.service_location.parish}`
       } : null
     };

     console.log('📋 Submitting appointment with data:', {
       ...requestData,
       attachment_count: attachmentIds.length
     });

     const response = await fetch('/api/appointments', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(requestData)
     });

     const result = await response.json();

     if (!response.ok) {
       throw new Error(result.error || 'Failed to create appointment request');
     }

     console.log('✅ Appointment created successfully with', result.appointment.attachments?.length || 0, 'attachments');
     onSuccess?.(result.appointment);

   } catch (error) {
     console.error('❌ Appointment request error:', error);
     setErrors({ general: error.message });
   } finally {
     setLoading(false);
   }
 }, [formData, validateForm, user, professional, serviceInformation, location, onSuccess, currentStep, steps.length]);

 // Step navigation functions
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

 // Step validation for navigation
 const isStepValid = useCallback((step) => {
   switch (step) {
     case 1: return formData.description.trim() !== '';
     case 2: return true; // File upload is optional
     case 3: return formData.preferred_start !== '';
     case 4: return !formData.use_different_address || (
       formData.service_location.street_address &&
       formData.service_location.city &&
       formData.service_location.parish
     );
     case 5: return true;
     default: return false;
   }
 }, [formData]);

 // Progress calculation
 const calculateProgress = useCallback(() => {
   return ((currentStep - 1) / (steps.length - 1)) * 100;
 }, [currentStep, steps.length]);

 // Get step status for styling
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
     
     {/* Fixed Header with Progress and Step Navigation */}
     <div className="flex-shrink-0 bg-background border-b p-6">
       <div className="w-full max-w-4xl mx-auto space-y-6">
         {/* Progress Bar */}
         <div className="space-y-3">
           <div className="flex justify-between items-center">
             <span className="text-sm text-muted-foreground">
               Step {currentStep} of {steps.length}
             </span>
             <span className="text-sm text-muted-foreground">
               {Math.round(calculateProgress())}% Complete
             </span>
           </div>
           <Progress value={calculateProgress()} className="h-2" />
         </div>

         {/* Step Navigation */}
         <div className="grid grid-cols-5 gap-2">
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

     {/* Scrollable Content Area */}
     <div className="flex-1 overflow-y-auto">
       <div className="w-full max-w-4xl mx-auto p-6">
         <div className="space-y-6">
           
           {/* Step 1: Project Description */}
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
                     rows={5}
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
                   <p className="text-xs text-muted-foreground">
                     Minimum 20 characters. Be specific about what you need to get better quotes.
                   </p>
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
               </CardContent>
             </Card>
           )}

           {/* Step 2: File Upload */}
           {currentStep === 2 && (
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Upload className="h-5 w-5" />
                   Upload Project Files
                 </CardTitle>
                 <p className="text-sm text-muted-foreground">
                   Share photos, measurements, specifications, or any other files that will help the professional understand your project better.
                 </p>
               </CardHeader>
               <CardContent className="space-y-6">
                 
                 {/* Benefits callout */}
                 {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                   <div className="flex items-start gap-3">
                     <Image className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                     <div>
                       <h4 className="font-medium text-blue-900 mb-2">Why upload files?</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-700">
                         <div className="flex items-center gap-2">
                           <CheckCircle className="h-3 w-3" />
                           <span>Get more accurate quotes</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <CheckCircle className="h-3 w-3" />
                           <span>Reduce communication time</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <CheckCircle className="h-3 w-3" />
                           <span>Faster professional responses</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <CheckCircle className="h-3 w-3" />
                           <span>Show specific requirements</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div> */}

                 {/* File upload component */}
                 <AppointmentFileUpload 
                   onFilesChange={handleFilesChange}
                   initialFiles={formData.attachments}
                   maxFiles={10}
                 />

                 {/* Optional step notice */}
                 {formData.attachments.length === 0 && (
                   <Alert>
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription>
                       <strong>Optional Step:</strong> You can skip this step if you don't have files to upload. 
                       You can always share files later through messages with your professional.
                     </AlertDescription>
                   </Alert>
                 )}
               </CardContent>
             </Card>
           )}

           {/* Step 3: Schedule Selection */}
           {currentStep === 3 && (
             <Card className="overflow-hidden">
               <CardHeader className="border-b bg-muted/30">
                 <CardTitle className="text-lg flex items-center gap-2">
                   <Calendar className="h-5 w-5" />
                   Select Assessment Time
                 </CardTitle>
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

           {/* Step 4: Service Location */}
           {currentStep === 4 && (
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

           {/* Step 5: Review & Confirm */}
           {currentStep === 5 && (
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
                     <div className="flex-1">
                       <h4 className="font-semibold">{serviceInformation?.name}</h4>
                       <p className="text-sm text-muted-foreground mt-1">
                         {formData.description.substring(0, 150)}
                         {formData.description.length > 150 && '...'}
                       </p>
                     </div>
                     <Badge variant="outline" className="text-lg font-semibold ml-4">
                       JMD ${estimatedPrice}
                     </Badge>
                   </div>

                   <Separator />

                   {/* Appointment Details Grid */}
                   <div className="grid gap-4 sm:grid-cols-2">
                     <div className="flex items-center gap-3">
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

                     <div className="flex items-center gap-3">
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

                     {formData.deadline && (
                       <div className="flex items-center gap-3">
                         <CheckCircle className="h-4 w-4 text-muted-foreground" />
                         <div>
                           <div className="font-medium">Complete by</div>
                           <div className="text-sm text-muted-foreground">
                             {new Date(formData.deadline).toLocaleDateString()}
                           </div>
                         </div>
                       </div>
                     )}

                     <div className="flex items-center gap-3">
                       <Badge 
                         variant="secondary" 
                         className={cn("text-sm", urgencyOptions.find(opt => opt.value === formData.urgency)?.color)}
                       >
                         {urgencyOptions.find(opt => opt.value === formData.urgency)?.label}
                       </Badge>
                     </div>
                   </div>

                   {/* Attached Files */}
                   {formData.attachments && formData.attachments.length > 0 && (
                     <>
                       <Separator />
                       <div className="space-y-3">
                         <div className="flex items-center gap-2">
                           <Upload className="h-4 w-4 text-muted-foreground" />
                           <div className="font-medium">Attached Files ({formData.attachments.length})</div>
                         </div>
                         <div className="grid gap-2 sm:grid-cols-2">
                           {formData.attachments.map((file, index) => (
                             <div key={file.id || index} className="flex items-center gap-2 p-2 bg-background rounded border">
                               <FileText className="h-3 w-3 text-muted-foreground" />
                               <span className="text-sm truncate flex-1">{file.name}</span>
                               <Badge variant="secondary" className="text-xs">
                                 {file.purpose}
                               </Badge>
                             </div>
                           ))}
                         </div>
                       </div>
                     </>
                   )}

                   {/* Service Location */}
                   {formData.use_different_address && formData.service_location.street_address && (
                     <>
                       <Separator />
                       <div className="flex items-start gap-3">
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

     {/* Fixed Footer with Action Buttons */}
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

           {/* Show file count indicator on file step */}
           {currentStep === 2 && formData.attachments.length > 0 && (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <Upload className="h-4 w-4" />
               <span>{formData.attachments.length} file{formData.attachments.length !== 1 ? 's' : ''} selected</span>
             </div>
           )}

           {/* Show selected time on schedule step */}
           {currentStep === 3 && formData.preferred_start && (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <Calendar className="h-4 w-4" />
               <span>
                 {new Date(formData.preferred_start).toLocaleDateString('en-US', {
                   month: 'short',
                   day: 'numeric',
                   hour: 'numeric',
                   minute: '2-digit',
                   hour12: true
                 })}
               </span>
             </div>
           )}

           {/* Continue/Submit buttons */}
           {currentStep < steps.length ? (
             <Button 
               type="button"
               onClick={nextStep}
               disabled={!isStepValid(currentStep) || loading}
               className="gap-2"
             >
               {currentStep === 2 && formData.attachments.length === 0 ? 'Skip Files' : 'Continue'}
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