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
 Users,
 X,
 Menu,
 ChevronDown,
 ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Appointment({ 
 professional, 
 serviceInformation, 
 location, 
 onSuccess, 
 onCancel,
 variant = 'marketplace', // 'marketplace' | 'direct'
 selectedProfessionals = [] // Array of selected professionals for targeted marketplace
}) {
 const { user } = useUserStore();
 const [loading, setLoading] = useState(false);
 const [errors, setErrors] = useState({});
 const [currentStep, setCurrentStep] = useState(1);
 const [isMobile, setIsMobile] = useState(false);
 const [showStepNav, setShowStepNav] = useState(false);
 
 // Mobile detection
 useEffect(() => {
   const checkMobile = () => {
     setIsMobile(window.innerWidth < 768);
   };
   
   checkMobile();
   window.addEventListener('resize', checkMobile);
   return () => window.removeEventListener('resize', checkMobile);
 }, []);

 // Determine workflow type based on variant and selectedProfessionals
 const isMarketplace = variant === 'marketplace';
 const isTargetedMarketplace = isMarketplace && selectedProfessionals.length > 0;
 const isOpenMarketplace = isMarketplace && selectedProfessionals.length === 0;
 
 // Enhanced 5-step flow with mobile-friendly descriptions
 const steps = useMemo(() => [
   { 
     id: 1, 
     title: isMobile ? 'Project' : 'Project Details', 
     icon: FileText, 
     description: isMobile ? 'Describe needs' : 'Describe your needs',
     mobileDescription: 'What do you need done?'
   },
   { 
     id: 2, 
     title: 'Files', 
     icon: Upload, 
     description: isMobile ? 'Add references' : 'Upload references',
     mobileDescription: 'Photos & documents'
   },
   { 
     id: 3, 
     title: 'Schedule', 
     icon: Calendar, 
     description: isMobile ? 'When needed' : (isMarketplace ? 'When needed' : 'Pick a time'),
     mobileDescription: 'Pick your preferred time'
   },
   { 
     id: 4, 
     title: 'Location', 
     icon: MapPin, 
     description: isMobile ? 'Where' : 'Service address',
     mobileDescription: 'Where should we come?'
   },
   { 
     id: 5, 
     title: 'Review', 
     icon: CheckCircle, 
     description: isMobile ? 'Confirm' : 'Confirm details',
     mobileDescription: 'Review and submit'
   }
 ], [isMarketplace, isMobile]);

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
   { value: 'low', label: isMobile ? 'Flexible' : 'Flexible (1 week)', priceMultiplier: 0.9, badge: '-10%', color: 'bg-green-100 text-green-800' },
   { value: 'standard', label: isMobile ? 'Standard' : 'Standard (3 days)', priceMultiplier: 1.0, badge: '', color: 'bg-blue-100 text-blue-800' },
   { value: 'high', label: isMobile ? 'Priority' : 'Priority (24hrs)', priceMultiplier: 1.2, badge: '+20%', color: 'bg-orange-100 text-orange-800' },
   { value: 'urgent', label: isMobile ? 'Urgent' : 'Urgent (ASAP)', priceMultiplier: 1.5, badge: '+50%', color: 'bg-red-100 text-red-800' }
 ], [isMobile]);

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
       console.log('🏠 Fetching customer address for account:', user.account.account_id);
       
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

     console.log('🏠 Address ID to use:', addressId);

     // Upload files first if any exist
     let attachmentIds = [];
     if (formData.attachments && formData.attachments.length > 0) {
       console.log('📤 Uploading', formData.attachments.length, 'files...');
       
       // GET SESSION FOR AUTHENTICATION
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
                 'Authorization': `Bearer ${session.access_token}`,
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
       open_to_all_professionals: isOpenMarketplace,
       recipients: isTargetedMarketplace ? selectedProfessionals.map(p => p.professional_id) : [],
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

     const responseText = await response.text();
     console.log('📡 Raw response text:', responseText);

     let result;
     try {
       result = JSON.parse(responseText);
       console.log('📡 Parsed response:', result);
     } catch (parseError) {
       console.error('❌ Failed to parse response as JSON:', parseError);
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
     setShowStepNav(false);
   }
 }, [currentStep, steps.length]);

 const prevStep = useCallback(() => {
   if (currentStep > 1) {
     setCurrentStep(prev => prev - 1);
     setShowStepNav(false);
   }
 }, [currentStep]);

 const goToStep = useCallback((stepNumber) => {
   if (stepNumber >= 1 && stepNumber <= steps.length && isStepValid(stepNumber)) {
     setCurrentStep(stepNumber);
     setShowStepNav(false);
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

 // Mobile Step Navigation Dropdown
 const MobileStepNavigation = () => (
   <div className={`${isMobile ? 'relative' : 'hidden'}`}>
     <Button
       type="button"
       variant="outline"
       onClick={() => setShowStepNav(!showStepNav)}
       className="w-full justify-between h-12"
     >
       <span className="flex items-center gap-2">
         <Menu className="h-4 w-4" />
         Step {currentStep}: {steps[currentStep - 1]?.title}
       </span>
       {showStepNav ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
     </Button>
     
     {showStepNav && (
       <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50">
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
                 "w-full flex items-center gap-3 p-3 text-left transition-colors border-b border-border last:border-b-0",
                 status === 'active' && "bg-primary/10 text-primary",
                 status === 'completed' && "text-green-700 hover:bg-green-50",
                 status === 'available' && "text-orange-700 hover:bg-orange-50",
                 status === 'pending' && "text-muted-foreground opacity-50 cursor-not-allowed"
               )}
             >
               <div className={cn(
                 "flex h-8 w-8 items-center justify-center rounded-full text-xs",
                 status === 'active' && "bg-primary text-primary-foreground",
                 status === 'completed' && "bg-green-100 text-green-700",
                 status === 'available' && "bg-orange-100 text-orange-700",
                 status === 'pending' && "bg-muted text-muted-foreground"
               )}>
                 {status === 'completed' ? (
                   <CheckCircle className="h-4 w-4" />
                 ) : (
                   <StepIcon className="h-4 w-4" />
                 )}
               </div>
               <div className="flex-1">
                 <div className="font-medium text-sm">{step.title}</div>
                 <div className="text-xs opacity-80">{step.mobileDescription}</div>
               </div>
             </button>
           );
         })}
       </div>
     )}
   </div>
 );

 return (
   <div className={`flex flex-col ${isMobile ? 'h-screen' : 'h-full max-h-[95vh]'}`}>
     
     {/* Fixed Header with Progress and Step Navigation */}
     <div className={`flex-shrink-0 bg-background border-b ${isMobile ? 'p-4' : 'p-6'}`}>
       <div className="w-full max-w-4xl mx-auto space-y-4">
         
         {/* Workflow Type Indicator - ENHANCED */}
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             {isMarketplace ? (
               <>
                 <Users className="h-5 w-5 text-blue-600 flex-shrink-0" />
                 <div className="min-w-0">
                   <h3 className={`font-semibold text-blue-900 ${isMobile ? 'text-sm' : ''}`}>
                     {isTargetedMarketplace ? 'Targeted Request' : 'Service Request'}
                   </h3>
                   <p className={`text-blue-600 ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
                     {isMobile ? (
                       isTargetedMarketplace ? `${selectedProfessionals.length} selected` : 'Multiple quotes'
                     ) : (
                       getWorkflowDescription()
                     )}
                   </p>
                 </div>
               </>
             ) : (
               <>
                 <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                 <div className="min-w-0">
                   <h3 className={`font-semibold text-green-900 ${isMobile ? 'text-sm' : ''}`}>Direct Booking</h3>
                   <p className={`text-green-600 ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
                     {isMobile ? professionalName.split(' ')[0] : getWorkflowDescription()}
                   </p>
                 </div>
               </>
             )}
           </div>
           
           <div className="flex items-center gap-2 flex-shrink-0">
             {isTargetedMarketplace && (
               <Badge variant="outline" className="text-xs">
                 {selectedProfessionals.length}
               </Badge>
             )}
             <Badge variant={isMarketplace ? "default" : "secondary"} className={isMobile ? "text-xs" : "text-sm"}>
               {isTargetedMarketplace ? "Targeted" : isOpenMarketplace ? "Marketplace" : "Direct"}
             </Badge>
           </div>
         </div>
         
         {/* Progress Bar */}
         <div className="space-y-3">
           <div className="flex justify-between items-center">
             <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
               Step {currentStep} of {steps.length}
             </span>
             <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
               {Math.round(calculateProgress())}% Complete
             </span>
           </div>
           <Progress value={calculateProgress()} className="h-2" />
         </div>

         {/* Desktop Step Navigation / Mobile Step Dropdown */}
         {isMobile ? (
           <MobileStepNavigation />
         ) : (
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
         )}
       </div>
     </div>

     {/* Scrollable Content Area */}
     <div className="flex-1 overflow-y-auto">
       <div className={`w-full max-w-4xl mx-auto ${isMobile ? 'p-4' : 'p-6'}`}>
         <div className="space-y-6">
           
           {/* Step 1: Project Description */}
           {currentStep === 1 && (
             <Card>
               <CardHeader className={isMobile ? 'px-4 py-4' : ''}>
                 <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                   <FileText className="h-5 w-5" />
                   Describe Your Project
                 </CardTitle>
                 <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm'} leading-relaxed`}>
                   {isTargetedMarketplace 
                     ? `Tell your ${selectedProfessionals.length} selected professionals what you need.`
                     : isOpenMarketplace
                     ? 'Tell us what you need so we can match you with qualified professionals.'
                     : `Tell ${professionalName} what you need help with.`
                   }
                 </p>
               </CardHeader>
               <CardContent className={`space-y-6 ${isMobile ? 'px-4' : ''}`}>
                 <div className="space-y-2">
                   <Label htmlFor="description">What do you need done? *</Label>
                   <Textarea
                     id="description"
                     rows={isMobile ? 6 : 5}
                     value={formData.description}
                     onChange={(e) => handleChange('description', e.target.value)}
                     placeholder="Describe your project in detail. Include any specific requirements, materials needed, or preferences you have..."
                     className={`${errors.description ? 'border-destructive' : ''} ${isMobile ? 'min-h-[120px]' : ''}`}
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
                     className={`${errors.deadline ? 'border-destructive' : ''} ${isMobile ? 'h-12' : ''}`}
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
               <CardHeader className={isMobile ? 'px-4 py-4' : ''}>
                 <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                   <Upload className="h-5 w-5" />
                   Upload Project Files
                 </CardTitle>
                 <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm'} leading-relaxed`}>
                   {isTargetedMarketplace
                     ? `Share photos, measurements, or specifications to help your ${selectedProfessionals.length} selected professionals understand your project better.`
                     : isOpenMarketplace
                     ? 'Share photos, measurements, or specifications to help professionals understand your project better.'
                     : `Share photos, measurements, or specifications to help ${professionalName} understand your project better.`
                   }
                 </p>
               </CardHeader>
               <CardContent className={`space-y-6 ${isMobile ? 'px-4' : ''}`}>
                 
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
                     <AlertDescription className={isMobile ? 'text-sm' : ''}>
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

           {/* Step 3: Schedule Selection */}
           {currentStep === 3 && (
             <Card className="overflow-hidden">
               <CardHeader className={`border-b bg-muted/30 ${isMobile ? 'px-4 py-4' : ''}`}>
                 <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-lg'}`}>
                   <Calendar className="h-5 w-5" />
                   {isMarketplace ? 'When do you need this done?' : 'Select Assessment Time'}
                 </CardTitle>
                 <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm'} leading-relaxed`}>
                   {isMarketplace 
                     ? 'Choose your preferred timeframe for the work to be completed'
                     : 'Choose when you\'d like the professional to assess your project'
                   }
                 </p>
               </CardHeader>
               
               <div className={`overflow-hidden ${isMobile ? 'h-[400px]' : 'h-[500px]'}`}>
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
               <CardHeader className={isMobile ? 'px-4 py-4' : ''}>
                 <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                   <MapPin className="h-5 w-5" />
                   Service Location
                 </CardTitle>
                 <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm'}`}>
                   Where should the service be performed?
                 </p>
               </CardHeader>
               <CardContent className={`space-y-6 ${isMobile ? 'px-4' : ''}`}>
                 <div className="flex items-center space-x-2">
                   <Checkbox 
                     id="use_different_address"
                     checked={formData.use_different_address}
                     onCheckedChange={(checked) => handleChange('use_different_address', checked)}
                   />
                   <Label htmlFor="use_different_address" className={`font-medium ${isMobile ? 'text-sm' : 'text-sm'}`}>
                     Use a different address for this service
                   </Label>
                 </div>

                 {!formData.use_different_address ? (
                   <Alert>
                     <MapPin className="h-4 w-4" />
                     <AlertDescription>
                       <div className="space-y-1">
                         <div className="font-medium">Using your primary address</div>
                         <div className={isMobile ? 'text-xs' : 'text-sm'}>
                           {formData.service_location?.formatted_address || 'Your confirmed location will be used'}
                         </div>
                       </div>
                     </AlertDescription>
                   </Alert>
                 ) : (
                   <div className="space-y-4">
                     <div className={`p-4 border rounded-lg bg-muted/30 ${isMobile ? 'p-3' : ''}`}>
                       <h4 className={`font-medium mb-2 ${isMobile ? 'text-sm' : ''}`}>Service Address</h4>
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
               <CardHeader className={isMobile ? 'px-4 py-4' : ''}>
                 <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                   <CheckCircle className="h-5 w-5" />
                   Review & Confirm
                 </CardTitle>
                 <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm'} leading-relaxed`}>
                   {isTargetedMarketplace 
                     ? `Please review your request before sending to ${selectedProfessionals.length} selected professionals`
                     : isOpenMarketplace
                     ? 'Please review your service request before posting'
                     : 'Please review your appointment details before submitting'
                   }
                 </p>
               </CardHeader>
               <CardContent className={`space-y-6 ${isMobile ? 'px-4' : ''}`}>
                 
                 {/* Service Summary */}
                 <div className={`space-y-4 p-4 bg-muted/30 rounded-lg ${isMobile ? 'p-3' : ''}`}>
                   <div className={`flex items-start justify-between ${isMobile ? 'flex-col gap-3' : ''}`}>
                     <div className="flex-1">
                       <h4 className={`font-semibold ${isMobile ? 'text-base' : ''}`}>{serviceInformation?.name}</h4>
                       <p className={`text-muted-foreground mt-1 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                         {formData.description.substring(0, isMobile ? 100 : 150)}
                         {formData.description.length > (isMobile ? 100 : 150) && '...'}
                       </p>
                     </div>
                     {serviceInformation?.base_price && (
                       <Badge variant="outline" className={`font-semibold ${isMobile ? 'text-base self-start' : 'text-lg ml-4'}`}>
                         {isMarketplace ? 'Est. ' : ''}JMD ${estimatedPrice}
                       </Badge>
                     )}
                   </div>

                   <Separator />

                   {/* Appointment Details Grid */}
                   <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                     <div className="flex items-center gap-3">
                       <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                       <div className="min-w-0">
                         <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                           {isMarketplace ? 'Preferred Date' : 'Assessment Date'}
                         </div>
                         <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                           {formData.session && new Date(formData.session).toLocaleDateString('en-US', {
                             weekday: isMobile ? 'short' : 'long',
                             year: 'numeric',
                             month: isMobile ? 'short' : 'long',
                             day: 'numeric'
                           })}
                         </div>
                       </div>
                     </div>

                     <div className="flex items-center gap-3">
                       <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                       <div className="min-w-0">
                         <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Time</div>
                         <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
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
                         <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                         <div className="min-w-0">
                           <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Complete by</div>
                           <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
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
                         <Users className="h-4 w-4 text-purple-600 flex-shrink-0" />
                         <div className="min-w-0">
                           <div className={`font-medium text-purple-900 ${isMobile ? 'text-sm' : ''}`}>Targeted Request</div>
                           <div className={`text-purple-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                             Sending to {selectedProfessionals.length} selected professional{selectedProfessionals.length !== 1 ? 's' : ''}
                           </div>
                         </div>
                       </>
                     ) : isOpenMarketplace ? (
                       <>
                         <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                         <div className="min-w-0">
                           <div className={`font-medium text-blue-900 ${isMobile ? 'text-sm' : ''}`}>Open Marketplace Request</div>
                           <div className={`text-blue-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Multiple professionals will respond with quotes</div>
                         </div>
                       </>
                     ) : (
                       <>
                         <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                         <div className="min-w-0">
                           <div className={`font-medium text-green-900 ${isMobile ? 'text-sm' : ''}`}>Direct Booking</div>
                           <div className={`text-green-600 ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>Sending directly to {professionalName}</div>
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
                           <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Selected Professionals ({selectedProfessionals.length})</div>
                         </div>
                         <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                           {selectedProfessionals.map((prof) => (
                             <div key={prof.professional_id} className="flex items-center gap-2 p-2 bg-background rounded border">
                               <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                               <span className={`truncate flex-1 ${isMobile ? 'text-sm' : 'text-sm'}`}>
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
                           <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Attached Files ({formData.attachments.length})</div>
                         </div>
                         <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                           {formData.attachments.map((file, index) => (
                             <div key={file.id || index} className="flex items-center gap-2 p-2 bg-background rounded border">
                               <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                               <span className={`truncate flex-1 ${isMobile ? 'text-sm' : 'text-sm'}`}>{file.name}</span>
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
                         <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                         <div className="min-w-0">
                           <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Service Location</div>
                           <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
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
                     rows={isMobile ? 4 : 3}
                     value={formData.customer_message}
                     onChange={(e) => handleChange('customer_message', e.target.value)}
                     placeholder={isTargetedMarketplace 
                       ? `Any special instructions, preferences, or questions for your ${selectedProfessionals.length} selected professionals...`
                       : isOpenMarketplace
                       ? "Any special instructions, preferences, or questions for the professionals..."
                       : `Any special instructions, preferences, or questions for ${professionalName}...`
                     }
                     className={isMobile ? 'min-h-[100px]' : ''}
                   />
                 </div>

                 {/* Error Display */}
                 {errors.general && (
                   <Alert variant="destructive">
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription className={isMobile ? 'text-sm' : ''}>{errors.general}</AlertDescription>
                   </Alert>
                 )}

                 {/* Terms Notice - ENHANCED */}
                 <Alert>
                   <MessageSquare className="h-4 w-4" />
                   <AlertDescription className={isMobile ? 'text-sm' : ''}>
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

     {/* Fixed Footer with Action Buttons */}
     <div className={`flex-shrink-0 bg-background border-t shadow-lg ${isMobile ? 'p-4' : ''}`}>
       <div className={`w-full max-w-4xl mx-auto ${isMobile ? '' : 'p-6'}`}>
         <div className={`flex justify-between items-center ${isMobile ? 'gap-2' : ''}`}>
           <div className="flex gap-2">
             {currentStep > 1 && (
               <Button 
                 type="button"
                 variant="outline"
                 onClick={prevStep}
                 className={`gap-2 ${isMobile ? 'h-12 flex-1' : ''}`}
                 disabled={loading}
               >
                 <ArrowLeft className="h-4 w-4" />
                 {isMobile ? 'Back' : 'Back'}
               </Button>
             )}
             
             {currentStep === 1 && (
               <Button 
                 type="button"
                 variant="outline"
                 onClick={onCancel}
                 disabled={loading}
                 className={isMobile ? 'h-12 flex-1' : ''}
               >
                 Cancel
               </Button>
             )}
           </div>

           {/* Mobile step indicators */}
           {isMobile && currentStep < steps.length && (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
               {/* Show file count on file step */}
               {currentStep === 2 && formData.attachments.length > 0 && (
                 <>
                   <Upload className="h-4 w-4" />
                   <span>{formData.attachments.length} file{formData.attachments.length !== 1 ? 's' : ''}</span>
                 </>
               )}

               {/* Show selected time on schedule step */}
               {currentStep === 3 && formData.session && (
                 <>
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
                 </>
               )}
             </div>
           )}

           {/* Desktop indicators (non-mobile) */}
           {!isMobile && (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
               {/* Show file count indicator on file step */}
               {currentStep === 2 && formData.attachments.length > 0 && (
                 <>
                   <Upload className="h-4 w-4" />
                   <span>{formData.attachments.length} file{formData.attachments.length !== 1 ? 's' : ''} selected</span>
                 </>
               )}

               {/* Show selected time on schedule step */}
               {currentStep === 3 && formData.session && (
                 <>
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
                 </>
               )}

               {/* Show workflow type on review step - ENHANCED */}
               {currentStep === 5 && (
                 <>
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
               className={`gap-2 ${isMobile ? 'h-12 flex-1' : ''}`}
             >
               {currentStep === 2 && formData.attachments.length === 0 ? 'Skip Files' : 'Continue'}
               <ArrowRight className="h-4 w-4" />
             </Button>
           ) : (
             <Button
               type="button"
               onClick={handleSubmit}
               disabled={loading}
               size={isMobile ? "default" : "lg"}
               className={`gap-2 ${isMobile ? 'h-12 flex-1 text-sm' : 'px-8'}`}
             >
               {loading ? (
                 <>
                   <Loader2 className="h-4 w-4 animate-spin" />
                   {isTargetedMarketplace 
                     ? 'Sending...'
                     : isOpenMarketplace
                     ? 'Posting...' 
                     : 'Creating...'
                   }
                 </>
               ) : (
                 <>
                   <CheckCircle className="h-4 w-4" />
                   {isMobile ? (
                     isTargetedMarketplace 
                       ? `Send to ${selectedProfessionals.length}`
                       : isOpenMarketplace
                       ? 'Post Request' 
                       : 'Send Request'
                   ) : (
                     isTargetedMarketplace 
                       ? `Send to ${selectedProfessionals.length} Professionals`
                       : isOpenMarketplace
                       ? 'Post Service Request' 
                       : 'Send Appointment Request'
                   )}
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