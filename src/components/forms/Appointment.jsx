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
 Image,
 Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Appointment({ 
 professional, 
 serviceInformation, 
 location, 
 onSuccess, 
 onCancel,
 variant = 'marketplace', // 'marketplace' | 'direct'
 selectedProfessionals = [] // NEW: Array of selected professionals for targeted marketplace
}) {
 const { user } = useUserStore();
 const [loading, setLoading] = useState(false);
 const [errors, setErrors] = useState({});
 const [currentStep, setCurrentStep] = useState(1);
 
 // Determine workflow type based on variant and selectedProfessionals
 const isMarketplace = variant === 'marketplace';
 const isTargetedMarketplace = isMarketplace && selectedProfessionals.length > 0;
 const isOpenMarketplace = isMarketplace && selectedProfessionals.length === 0;
 
 // 5-step flow with dedicated file upload step
 const steps = useMemo(() => [
   { id: 1, title: 'Project', icon: FileText, description: 'Describe your needs' },
   { id: 2, title: 'Files', icon: Upload, description: 'Upload references' },
   { id: 3, title: 'Schedule', icon: Calendar, description: isMarketplace ? 'When needed' : 'Pick a time' },
   { id: 4, title: 'Location', icon: MapPin, description: 'Service address' },
   { id: 5, title: 'Review', icon: CheckCircle, description: 'Confirm details' }
 ], [isMarketplace]);

 // Form state with file attachments
 const [formData, setFormData] = useState({
   title: serviceInformation?.name || '',
   description: '',
   deadline: '',
   session: '',
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
   console.log('🔥 APPOINTMENT FORM MOUNTED - Variant:', variant);
   console.log('🔥 Selected Professionals:', selectedProfessionals.length);
   console.log('🔥 Workflow Type:', { isMarketplace, isTargetedMarketplace, isOpenMarketplace });
   return () => console.log('🔥 APPOINTMENT FORM UNMOUNTED');
 }, [variant, selectedProfessionals.length, isMarketplace, isTargetedMarketplace, isOpenMarketplace]);

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
   if (!formData.session) {
     newErrors.session = 'Please select your preferred start time';
   } else {
     const startDate = new Date(formData.session);
     if (startDate <= new Date()) {
       newErrors.session = 'Start time must be in the future';
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

// Enhanced submit handler with TARGETED MARKETPLACE support
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
      console.log('🔍 Fetching customer address for account:', user.account.account_id);
      
      const { data: customerAddress, error: addressError } = await supabase
        .from('address')
        .select('address_id')
        .eq('account_id', user.account.account_id)
        .eq('is_primary', true)
        .single();
      
      if (addressError) {
        console.error('❌ Address fetch error:', addressError);
      } else {
        console.log('✅ Found customer address:', customerAddress);
      }
      
      addressId = customerAddress?.address_id;
    }

    console.log('📍 Address ID to use:', addressId);

   
// Upload files first if any exist
let attachmentIds = [];
if (formData.attachments && formData.attachments.length > 0) {
  console.log('📤 Uploading', formData.attachments.length, 'files...');
  
  // GET SESSION FOR AUTHENTICATION - THIS IS THE KEY FIX
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.access_token) {
    console.error('❌ Authentication error for file upload:', sessionError);
    throw new Error('Authentication required for file upload');
  }

  console.log('🔐 Session found, proceeding with authenticated upload');
  
  for (const fileData of formData.attachments) {
    if (!fileData.uploaded && fileData.file) {
      try {
        const uploadData = new FormData();
        uploadData.append('file', fileData.file);
        
        console.log('📤 Uploading file:', fileData.name, 'Size:', fileData.file.size);
        
        const uploadResponse = await fetch('/api/assets/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`, // ADD THIS AUTH HEADER
            // Don't set Content-Type - let browser handle it for FormData
          },
          body: uploadData
        });
        
        console.log('📡 Upload response status:', uploadResponse.status);
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('❌ Upload response error:', errorText);
          
          let errorMessage;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || `Upload failed with status ${uploadResponse.status}`;
          } catch {
            errorMessage = `Upload failed with status ${uploadResponse.status}: ${errorText}`;
          }
          
          throw new Error(errorMessage);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log('📋 Upload result:', uploadResult);
        
        if (uploadResult.success && uploadResult.asset) {
          attachmentIds.push({
            asset_id: uploadResult.asset.id,
            purpose: fileData.purpose || 'reference'
          });
          console.log('✅ Upload successful for:', fileData.name, 'Asset ID:', uploadResult.asset.id);
        } else {
          console.error('❌ Upload failed for', fileData.name, ':', uploadResult.error);
          throw new Error(`Upload failed for ${fileData.name}: ${uploadResult.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('❌ Upload error for', fileData.name, ':', error.message);
        throw new Error(`Failed to upload ${fileData.name}: ${error.message}`);
      }
    }
  }
  
  console.log('📎 Total attachments ready:', attachmentIds.length);
}

    // Create appointment request with ENHANCED VARIANT-BASED logic
    const requestData = {
      customer_id: user.profile.customer_id,
      professional_id: isMarketplace ? null : professional?.professional_id,
      service_id: serviceInformation.service_id,
      address_id: addressId,
      description: formData.description,
      deadline: formData.deadline || null,
      session: formData.session,
      urgency: formData.urgency,
      customer_message: formData.customer_message || null,
      attachment_ids: attachmentIds,
      
      // UPDATED: Enhanced marketplace logic
      open_to_all_professionals: isOpenMarketplace, // Only true for open marketplace
      recipients: isTargetedMarketplace ? selectedProfessionals.map(p => p.professional_id) : [], // Selected professional IDs
      max_interests: isTargetedMarketplace ? selectedProfessionals.length : (isOpenMarketplace ? 10 : 1),
      auto_accept_verified: false,
      
      service_location: formData.use_different_address ? {
        ...formData.service_location,
        latitude: location?.lat,
        longitude: location?.lng,
        formatted_address: `${formData.service_location.street_address}, ${formData.service_location.city}, ${formData.service_location.parish}`
      } : null
    };

    // Debug the request data thoroughly
    console.log('🔍 DETAILED REQUEST DATA CHECK:');
    console.log('variant:', variant);
    console.log('selectedProfessionals count:', selectedProfessionals.length);
    console.log('isMarketplace:', isMarketplace);
    console.log('isTargetedMarketplace:', isTargetedMarketplace);
    console.log('isOpenMarketplace:', isOpenMarketplace);
    console.log('customer_id:', requestData.customer_id);
    console.log('professional_id:', requestData.professional_id);
    console.log('service_id:', requestData.service_id);
    console.log('address_id:', requestData.address_id);
    console.log('description length:', requestData.description?.length);
    console.log('session:', requestData.session);
    console.log('open_to_all_professionals:', requestData.open_to_all_professionals);
    console.log('recipients:', requestData.recipients);
    console.log('max_interests:', requestData.max_interests);
    console.log('service_location:', requestData.service_location);
    console.log('attachment_ids count:', requestData.attachment_ids?.length);

    // Validate required fields before sending
    const missingFields = [];
    if (!requestData.customer_id) missingFields.push('customer_id');
    if (!requestData.service_id) missingFields.push('service_id');
    if (!requestData.description) missingFields.push('description');
    if (!requestData.session) missingFields.push('session');

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log('📋 Submitting appointment request...');

    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    // Get response text first to see what we actually received
    const responseText = await response.text();
    console.log('📡 Raw response text:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('📡 Parsed response:', result);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      console.error('Response was:', responseText);
      throw new Error(`Server returned invalid JSON. Response: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: result
      });
      
      const errorMessage = result?.error || result?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    console.log('✅ Appointment created successfully:', {
      appointment_id: result.appointment?.appointment_id,
      workflow_type: result.appointment?.workflow_type,
      variant: variant,
      targeted_professionals: isTargetedMarketplace ? selectedProfessionals.length : 0,
      attachments: result.appointment?.attachments?.length || 0,
      interests: result.appointment?.interests?.length || 0
    });

    onSuccess?.(result.appointment);

  } catch (error) {
    console.error('❌ Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Enhanced error handling with more specific messages
    let errorMessage = error.message;
    
    if (error.message.includes('Missing required fields')) {
      errorMessage = 'Please fill in all required information before submitting.';
    } else if (error.message.includes('Customer not found')) {
      errorMessage = 'There was an issue with your account. Please try logging out and back in.';
    } else if (error.message.includes('Service not found')) {
      errorMessage = 'The selected service is no longer available. Please refresh and try again.';
    } else if (error.message.includes('Professional not found')) {
      errorMessage = 'The selected professional is no longer available. Your request will be opened to all qualified professionals.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.message.includes('invalid JSON')) {
      errorMessage = 'Server error. Please try again in a few minutes.';
    }
    
    setErrors({ general: errorMessage });
  } finally {
    setLoading(false);
  }
}, [formData, validateForm, user, professional, serviceInformation, location, onSuccess, currentStep, steps.length, variant, isMarketplace, isTargetedMarketplace, isOpenMarketplace, selectedProfessionals]);

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
     case 3: return formData.session !== '';
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
   handleChange('session', datetime);
 }, [handleChange]);

 // Get professional name for display
 const professionalName = professional?.first_name && professional?.last_name 
   ? `${professional.first_name} ${professional.last_name}`
   : professional?.business_name || 'Professional';

 // Get workflow description for UI
 const getWorkflowDescription = useCallback(() => {
   if (isTargetedMarketplace) {
     return `Get quotes from ${selectedProfessionals.length} selected professional${selectedProfessionals.length !== 1 ? 's' : ''}`;
   } else if (isOpenMarketplace) {
     return 'Get quotes from multiple professionals';
   } else {
     return `Booking with ${professionalName}`;
   }
 }, [isTargetedMarketplace, isOpenMarketplace, selectedProfessionals.length, professionalName]);

 return (
   <div className="flex flex-col h-full max-h-[95vh]">
     
     {/* Conditional Compact Header for Schedule Step */}
     <div className={cn(
       "flex-shrink-0 bg-background border-b",
       currentStep === 3 ? "p-2" : "p-6"
     )}>
       {currentStep === 3 ? (
         // Minimal header for schedule
         <div className="space-y-1">
           <div className="flex justify-between items-center">
             <span className="text-xs text-muted-foreground">
               Step {currentStep} of {steps.length} - Schedule
             </span>
             <Progress value={calculateProgress()} className="h-0.5 w-20" />
           </div>
         </div>
       ) : (
         // Full header for other steps
         <>
           <div className="space-y-2">
             <div className="flex justify-between items-center">
               <span className="text-xs text-muted-foreground">
                 Step {currentStep} of {steps.length}
               </span>
             </div>
             <Progress value={calculateProgress()} className="h-1" />
           </div>
           <Separator className="my-3" />

           <div className="grid grid-cols-5 gap-1">
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
                     "flex flex-col items-center gap-1 p-2 rounded text-center transition-all",
                     status === 'active' && "bg-primary text-primary-foreground",
                     status === 'completed' && "bg-green-100 text-green-700 hover:bg-green-200",
                     status === 'available' && "bg-orange-50 text-orange-700 hover:bg-orange-100",
                     status === 'pending' && "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                   )}
                 >
                   <StepIcon className="h-3 w-3" />
                   <div className="text-xs font-medium">{step.title}</div>
                 </button>
               );
             })}
           </div>
         </>
       )}
     </div>

     {/* Scrollable Content Area */}
     <div className="flex-1 overflow-y-auto">
       <div className={cn(
         "mx-auto",
         currentStep === 3 ? "w-full p-0" : "w-full max-w-4xl p-6"
       )}>
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
                   {isTargetedMarketplace 
                     ? `Tell your ${selectedProfessionals.length} selected professionals what you need.`
                     : isOpenMarketplace
                     ? 'Tell us what you need so we can match you with qualified professionals.'
                     : `Tell ${professionalName} what you need help with.`
                   }
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
                   {isTargetedMarketplace
                     ? `Share photos, measurements, or specifications to help your ${selectedProfessionals.length} selected professionals understand your project better.`
                     : isOpenMarketplace
                     ? 'Share photos, measurements, or specifications to help professionals understand your project better.'
                     : `Share photos, measurements, or specifications to help ${professionalName} understand your project better.`
                   }
                 </p>
               </CardHeader>
               <CardContent className="space-y-6">
                 
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
                       {isTargetedMarketplace 
                         ? ' You can always share files later through messages with your selected professionals.'
                         : isOpenMarketplace
                         ? ' You can always share files later through messages with professionals.'
                         : ` You can always share files later through messages with ${professionalName}.`
                       }
                     </AlertDescription>
                   </Alert>
                 )}
               </CardContent>
             </Card>
           )}

           {/* Step 3: Schedule Selection - COMPACT HEADER DESIGN */}
           {currentStep === 3 && (
             <Card className="overflow-hidden border-0 shadow-none">
               <CardHeader className="border-0 bg-muted/30 px-6 py-4">
                 {/* <CardTitle className="text-lg flex items-center gap-2">
                   <Calendar className="h-5 w-5" />
                   {isMarketplace ? 'When do you need this done?' : 'Select Assessment Time'}
                 </CardTitle> */}
                 {/* <p className="text-sm text-muted-foreground">
                   {isMarketplace 
                     ? 'Choose your preferred timeframe for the work to be completed'
                     : 'Choose when you\'d like the professional to assess your project'
                   }
                 </p> */}
               </CardHeader>
               
               <div className="h-[600px] overflow-hidden">
                 <CustomerAvailabilityCalendar
                   professionalId={isMarketplace ? null : professional?.professional_id}
                   onSlotSelect={handleSlotSelect}
                   selectedSlot={formData.session}
                 />
                 
                 {errors.session && (
                   <Alert variant="destructive" className="m-4">
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription>{errors.session}</AlertDescription>
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

           {/* Step 5: Review & Confirm - ENHANCED */}
           {currentStep === 5 && (
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <CheckCircle className="h-5 w-5" />
                   Review & Confirm
                 </CardTitle>
                 <p className="text-sm text-muted-foreground">
                   {isTargetedMarketplace 
                     ? `Please review your request before sending to ${selectedProfessionals.length} selected professionals`
                     : isOpenMarketplace
                     ? 'Please review your service request before posting'
                     : 'Please review your appointment details before submitting'
                   }
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
                     {serviceInformation?.base_price && (
                       <Badge variant="outline" className="text-lg font-semibold ml-4">
                         {isMarketplace ? 'Est. ' : ''}JMD ${estimatedPrice}
                       </Badge>
                     )}
                   </div>

                   <Separator />

                   {/* Appointment Details Grid */}
                   <div className="grid gap-4 sm:grid-cols-2">
                     <div className="flex items-center gap-3">
                       <Calendar className="h-4 w-4 text-muted-foreground" />
                       <div>
                         <div className="font-medium">
                           {isMarketplace ? 'Preferred Date' : 'Assessment Date'}
                         </div>
                         <div className="text-sm text-muted-foreground">
                           {formData.session && new Date(formData.session).toLocaleDateString('en-US', {
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
                           {formData.session && new Date(formData.session).toLocaleTimeString('en-US', {
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

                   {/* Workflow Type Display - ENHANCED */}
                   <Separator />
                   <div className="flex items-center gap-3">
                     {isTargetedMarketplace ? (
                       <>
                         <Users className="h-4 w-4 text-purple-600" />
                         <div>
                           <div className="font-medium text-purple-900">Targeted Request</div>
                           <div className="text-sm text-purple-600">
                             Sending to {selectedProfessionals.length} selected professional{selectedProfessionals.length !== 1 ? 's' : ''}
                           </div>
                         </div>
                       </>
                     ) : isOpenMarketplace ? (
                       <>
                         <Users className="h-4 w-4 text-blue-600" />
                         <div>
                           <div className="font-medium text-blue-900">Open Marketplace Request</div>
                           <div className="text-sm text-blue-600">Multiple professionals will respond with quotes</div>
                         </div>
                       </>
                     ) : (
                       <>
                         <CheckCircle className="h-4 w-4 text-green-600" />
                         <div>
                           <div className="font-medium text-green-900">Direct Booking</div>
                           <div className="text-sm text-green-600">Sending directly to {professionalName}</div>
                         </div>
                       </>
                     )}
                   </div>

                   {/* Selected Professionals Display for Targeted Marketplace */}
                   {isTargetedMarketplace && selectedProfessionals.length > 0 && (
                     <>
                       <Separator />
                       <div className="space-y-3">
                         <div className="flex items-center gap-2">
                           <Users className="h-4 w-4 text-muted-foreground" />
                           <div className="font-medium">Selected Professionals ({selectedProfessionals.length})</div>
                         </div>
                         <div className="grid gap-2 sm:grid-cols-2">
                           {selectedProfessionals.map((prof) => (
                             <div key={prof.professional_id} className="flex items-center gap-2 p-2 bg-background rounded border">
                               <CheckCircle className="h-3 w-3 text-green-600" />
                               <span className="text-sm truncate flex-1">
                                 {prof.first_name && prof.last_name 
                                   ? `${prof.first_name} ${prof.last_name}`
                                   : prof.business_name || 'Professional'
                                 }
                               </span>
                               <Badge variant="secondary" className="text-xs">
                                 Selected
                               </Badge>
                             </div>
                           ))}
                         </div>
                       </div>
                     </>
                   )}

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
                     placeholder={isTargetedMarketplace 
                       ? `Any special instructions, preferences, or questions for your ${selectedProfessionals.length} selected professionals...`
                       : isOpenMarketplace
                       ? "Any special instructions, preferences, or questions for the professionals..."
                       : `Any special instructions, preferences, or questions for ${professionalName}...`
                     }
                   />
                 </div>

                 {/* Error Display */}
                 {errors.general && (
                   <Alert variant="destructive">
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription>{errors.general}</AlertDescription>
                   </Alert>
                 )}

                 {/* Terms Notice - ENHANCED */}
                 <Alert>
                   <MessageSquare className="h-4 w-4" />
                   <AlertDescription>
                     <strong>Next Steps:</strong> 
                     {isTargetedMarketplace 
                       ? ` Your request will be sent to your ${selectedProfessionals.length} selected professionals. They will review your requirements and send you individual quotes. You'll be able to compare their offers and choose the best one.`
                       : isOpenMarketplace
                       ? ' Your service request will be posted to qualified professionals. Multiple professionals will review your requirements and send you quotes. You\'ll be able to compare offers and choose the best one.'
                       : ` Your appointment request will be sent to ${professionalName}. They will review your requirements and either accept, decline, or send you a custom quote. You\'ll be notified via email and in your dashboard.`
                     }
                   </AlertDescription>
                 </Alert>
               </CardContent>
             </Card>
           )}
         </div>
       </div>
     </div>

     {/* Fixed Footer with Action Buttons - REDUCED HEIGHT */}
     <div className="flex-shrink-0 bg-background border-t shadow-lg">
       <div className="w-full max-w-4xl mx-auto p-1">
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
           {currentStep === 3 && formData.session && (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <Calendar className="h-4 w-4" />
               <span>
                 {new Date(formData.session).toLocaleDateString('en-US', {
                   month: 'short',
                   day: 'numeric',
                   hour: 'numeric',
                   minute: '2-digit',
                   hour12: true
                 })}
               </span>
             </div>
           )}

           {/* Show workflow type on review step - ENHANCED */}
           {currentStep === 5 && (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
               {isTargetedMarketplace ? (
                 <>
                   <Users className="h-4 w-4" />
                   <span>Targeted ({selectedProfessionals.length})</span>
                 </>
               ) : isOpenMarketplace ? (
                 <>
                   <Users className="h-4 w-4" />
                   <span>Open Marketplace</span>
                 </>
               ) : (
                 <>
                   <CheckCircle className="h-4 w-4" />
                   <span>Direct Booking</span>
                 </>
               )}
             </div>
           )}

           {/* Continue/Submit buttons - ENHANCED */}
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
                   {isTargetedMarketplace 
                     ? 'Sending Request...'
                     : isOpenMarketplace
                     ? 'Posting Request...' 
                     : 'Creating Request...'
                   }
                 </>
               ) : (
                 <>
                   <CheckCircle className="h-4 w-4" />
                   {isTargetedMarketplace 
                     ? `Send to ${selectedProfessionals.length} Professionals`
                     : isOpenMarketplace
                     ? 'Post Service Request' 
                     : 'Send Appointment Request'
                   }
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