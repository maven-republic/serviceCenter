'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { createClient } from '@/utils/supabase/client';
import AppointmentAddressSelector from '@/components/forms/AppointmentAddressSelector';
import CustomerAvailabilityCalendar from '@/components/calendar/CustomerAvailabilityCalendar';
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

  // ✅ FIXED: Determine workflow type based on variant and props
  // CRITICAL: Single selected professional = Direct Booking (PATH A)
  const hasSingleProfessional = selectedProfessionals.length === 1;
  const hasMultipleProfessionals = selectedProfessionals.length > 1;
  
  const isDirectBooking = 
    variant === 'direct' || 
    (!variant.includes('marketplace') && professional?.professional_id) ||
    hasSingleProfessional; // ✅ Single selection = Direct Booking
    
  const isMarketplace = variant === 'marketplace' || variant.includes('marketplace');
  const isTargetedMarketplace = isMarketplace && hasMultipleProfessionals; // Only for 2+ professionals
  const isOpenMarketplace = isMarketplace && selectedProfessionals.length === 0 && !professional?.professional_id && !hasSingleProfessional;
  
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

  // Form state with file attachments and enhanced slot tracking
  const [formData, setFormData] = useState({
    title: serviceInformation?.name || '',
    description: '',
    deadline: '',
    session: '', // Primary selection for validation
    professionalSelections: {}, // Store per-professional selections
    selectedSlotInfo: null, // For direct booking compatibility
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
    console.log('🔍 APPOINTMENT FORM MOUNTED - Configuration:', {
      variant,
      professional: professional?.professional_id ? 'YES' : 'NO',
      professional_id: professional?.professional_id,
      selectedProfessionals: selectedProfessionals.length,
      singleProfessionalSelected: selectedProfessionals.length === 1,
      isDirectBooking,
      isMarketplace,
      isTargetedMarketplace,
      isOpenMarketplace
    });
    
    if (selectedProfessionals.length === 1) {
      console.log('✅ Single professional detected - treating as Direct Booking (PATH A)');
      console.log('   Professional:', selectedProfessionals[0].professional_id);
    }
    
    return () => console.log('APPOINTMENT FORM UNMOUNTED');
  }, [variant, professional?.professional_id, selectedProfessionals.length, isDirectBooking, isMarketplace, isTargetedMarketplace, isOpenMarketplace]);

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
    console.log('Files updated:', files.length, 'files');
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Step 1 validation - Project description required
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }
    
    // Step 3 validation - Schedule required
    if (isTargetedMarketplace) {
      if (Object.keys(formData.professionalSelections).length === 0) {
        newErrors.session = 'Please select at least one preferred time slot';
      }
    } else {
      if (!formData.session) {
        newErrors.session = 'Please select your preferred start time';
      } else {
        const startDate = new Date(formData.session);
        if (startDate <= new Date()) {
          newErrors.session = 'Start time must be in the future';
        }
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
  }, [formData, isTargetedMarketplace]);

  // ✅ FIXED: Enhanced submit handler with proper PATH A support
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
        console.log('Fetching customer address for account:', user.account.account_id);
        
        const { data: customerAddress, error: addressError } = await supabase
          .from('address')
          .select('address_id')
          .eq('account_id', user.account.account_id)
          .eq('is_primary', true)
          .single();
        
        if (addressError) {
          console.error('Address fetch error:', addressError);
        } else {
          console.log('Found customer address:', customerAddress);
        }
        
        addressId = customerAddress?.address_id;
      }

      console.log('Address ID to use:', addressId);

      // Upload files first if any exist
      let attachmentIds = [];
      if (formData.attachments && formData.attachments.length > 0) {
        console.log('Uploading', formData.attachments.length, 'files...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.access_token) {
          console.error('Authentication error for file upload:', sessionError);
          throw new Error('Authentication required for file upload');
        }

        console.log('Session found, proceeding with authenticated upload');
        
        for (const fileData of formData.attachments) {
          if (!fileData.uploaded && fileData.file) {
            try {
              const uploadData = new FormData();
              uploadData.append('file', fileData.file);
              
              console.log('Uploading file:', fileData.name, 'Size:', fileData.file.size);
              
              const uploadResponse = await fetch('/api/assets/upload', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                },
                body: uploadData
              });
              
              console.log('Upload response status:', uploadResponse.status);
              
              if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('Upload response error:', errorText);
                
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
              console.log('Upload result:', uploadResult);
              
              if (uploadResult.success && uploadResult.asset) {
                attachmentIds.push({
                  asset_id: uploadResult.asset.id,
                  purpose: fileData.purpose || 'reference'
                });
                console.log('Upload successful for:', fileData.name, 'Asset ID:', uploadResult.asset.id);
              } else {
                console.error('Upload failed for', fileData.name, ':', uploadResult.error);
                throw new Error(`Upload failed for ${fileData.name}: ${uploadResult.error || 'Unknown error'}`);
              }
            } catch (error) {
              console.error('Upload error for', fileData.name, ':', error.message);
              throw new Error(`Failed to upload ${fileData.name}: ${error.message}`);
            }
          }
        }
        
        console.log('Total attachments ready:', attachmentIds.length);
      }

      // ============================================
      // ✅ FIXED: Enhanced request data with PROPER PATH A DETECTION
      // ============================================
      const requestData = {
        customer_id: user.profile.customer_id,
        
        // ✅ CRITICAL FIX: Properly set professional_id for PATH A
        professional_id: (() => {
          // Direct booking variant with professional prop
          if (variant === 'direct' && professional?.professional_id) {
            console.log('✅ PATH A: Direct booking with professional prop:', professional.professional_id);
            return professional.professional_id;
          }
          // Non-marketplace with professional (implicit direct booking)
          if (!isMarketplace && professional?.professional_id) {
            console.log('✅ PATH A: Implicit direct booking with professional:', professional.professional_id);
            return professional.professional_id;
          }
          // ✅ NEW: Single selected professional = Direct Booking (PATH A)
          if (selectedProfessionals.length === 1 && selectedProfessionals[0]?.professional_id) {
            console.log('✅ PATH A: Single professional selected:', selectedProfessionals[0].professional_id);
            return selectedProfessionals[0].professional_id;
          }
          // Marketplace with multiple or no professionals
          console.log('📍 PATH B: Marketplace appointment (no professional_id)');
          return null;
        })(),
        
        service_id: serviceInformation.service_id,
        address_id: addressId,
        description: formData.description,
        deadline: formData.deadline || null,
        session: formData.session,
        urgency: formData.urgency,
        customer_message: formData.customer_message || null,
        attachment_ids: attachmentIds,
        
        // Enhanced marketplace logic
        open_to_all_professionals: isOpenMarketplace,
        recipients: isTargetedMarketplace ? selectedProfessionals.map(p => p.professional_id) : [], // Only for 2+ professionals
        max_interests: isTargetedMarketplace ? selectedProfessionals.length : (isOpenMarketplace ? 10 : 1),
        auto_accept_verified: false,
        
        // Include multi-professional selections for targeted marketplace
        professional_preferences: isTargetedMarketplace ? formData.professionalSelections : null,
        selected_professional_id: formData.selectedSlotInfo?.selectedProfessional?.professional_id || null,
        
        service_location: formData.use_different_address ? {
          ...formData.service_location,
          latitude: location?.lat,
          longitude: location?.lng,
          formatted_address: `${formData.service_location.street_address}, ${formData.service_location.city}, ${formData.service_location.parish}`
        } : null
      };

      // ✅ ENHANCED DEBUG LOGGING
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 PATH A/B DETECTION DEBUG:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Configuration:');
      console.log('  - variant:', variant);
      console.log('  - professional prop:', professional?.professional_id || 'NONE');
      console.log('  - selectedProfessionals:', selectedProfessionals.length);
      if (selectedProfessionals.length > 0) {
        console.log('  - selected professional IDs:', selectedProfessionals.map(p => p.professional_id));
      }
      console.log('');
      console.log('🎯 Workflow Detection:');
      console.log('  - isDirectBooking:', isDirectBooking);
      console.log('  - isMarketplace:', isMarketplace);
      console.log('  - isTargetedMarketplace:', isTargetedMarketplace);
      console.log('  - isOpenMarketplace:', isOpenMarketplace);
      console.log('');
      console.log('📤 Request Data:');
      console.log('  - professional_id:', requestData.professional_id || 'NULL');
      console.log('  - open_to_all_professionals:', requestData.open_to_all_professionals);
      console.log('  - recipients:', requestData.recipients.length);
      console.log('');
      console.log('✅ Expected Result:');
      if (requestData.professional_id) {
        console.log('  → PATH A (Direct Booking)');
        console.log('  → Backend should: NOT create interest, status="pending"');
        if (selectedProfessionals.length === 1) {
          console.log('  → Single professional selection detected');
        }
      } else if (requestData.recipients.length > 0) {
        console.log('  → PATH B (Targeted Marketplace)');
        console.log('  → Backend should: No auto-interests, selected pros can respond');
      } else {
        console.log('  → PATH B (Open Marketplace)');
        console.log('  → Backend should: Open to all professionals');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Validate required fields before sending
      const missingFields = [];
      if (!requestData.customer_id) missingFields.push('customer_id');
      if (!requestData.service_id) missingFields.push('service_id');
      if (!requestData.description) missingFields.push('description');
      if (!requestData.session) missingFields.push('session');

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      console.log('📤 Submitting appointment request...');

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      console.log('📥 Response status:', response.status);

      const responseText = await response.text();
      console.log('📥 Raw response (first 500 chars):', responseText.substring(0, 500));

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ Parsed response:', result);
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

      console.log('🎉 Appointment created successfully:', {
        appointment_id: result.appointment?.appointment_id,
        professional_id: result.appointment?.professional_id,
        status: result.appointment?.status,
        workflow_type: result.appointment?.workflow_type,
        targeted_professionals: isTargetedMarketplace ? selectedProfessionals.length : 0,
        attachments: result.appointment?.attachments?.length || 0,
        interests: result.appointment?.interests?.length || 0
      });

      // ✅ Verify PATH A was created correctly
      if (requestData.professional_id) {
        console.log('🔍 Verifying PATH A creation:');
        console.log('  - professional_id:', result.appointment?.professional_id || 'MISSING!');
        console.log('  - status:', result.appointment?.status || 'MISSING!');
        console.log('  - interest_count:', result.appointment?.interest_count || 0);
        
        if (!result.appointment?.professional_id) {
          console.error('⚠️ WARNING: PATH A appointment created WITHOUT professional_id!');
        }
        if (result.appointment?.status !== 'pending') {
          console.error('⚠️ WARNING: PATH A appointment has wrong status:', result.appointment?.status);
        }
        if (result.appointment?.interest_count > 0) {
          console.error('⚠️ WARNING: PATH A appointment has interest records!');
        }
      }

      onSuccess?.(result.appointment);

    } catch (error) {
      console.error('💥 Full error details:', {
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
  }, [formData, validateForm, user, professional, serviceInformation, location, onSuccess, currentStep, steps.length, variant, isMarketplace, isTargetedMarketplace, isOpenMarketplace, selectedProfessionals, isDirectBooking]);

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
      case 3: 
        if (isTargetedMarketplace) {
          return Object.keys(formData.professionalSelections).length > 0;
        } else {
          return formData.session !== '';
        }
      case 4: return !formData.use_different_address || (
        formData.service_location.street_address &&
        formData.service_location.city &&
        formData.service_location.parish
      );
      case 5: return true;
      default: return false;
    }
  }, [formData, isTargetedMarketplace]);

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

  // Enhanced calendar slot selection handler
  const handleSlotSelect = useCallback((datetime, slotInfo) => {
    console.log('Slot selected:', { datetime, slotInfo });
    
    if (isTargetedMarketplace) {
      const professionalId = slotInfo.selectedProfessional?.professional_id;
      
      if (professionalId) {
        const conflictingProfessional = Object.entries(formData.professionalSelections).find(
          ([otherProfId, selection]) => {
            if (otherProfId === professionalId) return false;
            
            const otherTime = new Date(selection.datetime);
            const newTime = new Date(datetime);
            
            return otherTime.getTime() === newTime.getTime();
          }
        );
        
        if (conflictingProfessional) {
          const [conflictProfId] = conflictingProfessional;
          const conflictProfessional = selectedProfessionals.find(p => p.professional_id === conflictProfId);
          const conflictProfName = conflictProfessional 
            ? `${conflictProfessional.first_name} ${conflictProfessional.last_name}`
            : `Professional ${conflictProfId.slice(0, 8)}`;
          
          setErrors(prev => ({
            ...prev,
            session: `This time conflicts with your selection for ${conflictProfName}. Please choose a different time slot.`
          }));
          
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          session: datetime,
          professionalSelections: {
            ...prev.professionalSelections,
            [professionalId]: {
              datetime,
              slotInfo
            }
          }
        }));
        
        if (errors.session) {
          setErrors(prev => ({ ...prev, session: null }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        session: datetime,
        selectedSlotInfo: slotInfo
      }));
      
      if (errors.session) {
        setErrors(prev => ({ ...prev, session: null }));
      }
    }
  }, [errors.session, isTargetedMarketplace, formData.professionalSelections, selectedProfessionals]);

  // Get professional name for display
  const professionalName = professional?.first_name && professional?.last_name 
    ? `${professional.first_name} ${professional.last_name}`
    : professional?.business_name || 'Professional';

  // Get workflow description for UI
  const getWorkflowDescription = useCallback(() => {
    if (isDirectBooking) {
      // Get professional name from either prop or selectedProfessionals
      let profName = professionalName;
      if (selectedProfessionals.length === 1) {
        const prof = selectedProfessionals[0];
        profName = `${prof.first_name || ''} ${prof.last_name || ''}`.trim() || 
                   prof.business_name || 
                   `Professional ${prof.professional_id?.slice(0, 8)}`;
      }
      return `Booking with ${profName}`;
    } else if (isTargetedMarketplace) {
      return `Get quotes from ${selectedProfessionals.length} selected professional${selectedProfessionals.length !== 1 ? 's' : ''}`;
    } else if (isOpenMarketplace) {
      return 'Get quotes from multiple professionals';
    }
    return 'New appointment request';
  }, [isDirectBooking, isTargetedMarketplace, isOpenMarketplace, selectedProfessionals, professionalName]);

  // Helper to get selected professional name
  const getSelectedProfessionalName = useCallback(() => {
    if (!formData.selectedSlotInfo?.selectedProfessional) return null;
    const prof = formData.selectedSlotInfo.selectedProfessional;
    return `${prof.first_name || ''} ${prof.last_name || ''}`.trim() || `Professional ${prof.professional_id?.slice(0, 8)}`;
  }, [formData.selectedSlotInfo]);

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
          
          {/* Workflow Type Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDirectBooking ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className={`font-semibold text-green-900 ${isMobile ? 'text-sm' : ''}`}>Direct Booking</h3>
                    <p className={`text-green-600 ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
                      {isMobile ? professionalName.split(' ')[0] : getWorkflowDescription()}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className={`font-semibold text-purple-900 ${isMobile ? 'text-sm' : ''}`}>
                      {isTargetedMarketplace ? 'Targeted Request' : 'Marketplace Request'}
                    </h3>
                    <p className={`text-purple-600 ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
                      {isMobile 
                        ? (isTargetedMarketplace ? `${selectedProfessionals.length} selected` : 'Open request')
                        : getWorkflowDescription()
                      }
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Desktop Step Navigation / Mobile Step Dropdown */}
          {isMobile ? (
            <MobileStepNavigation />
          ) : (
            <div className="flex items-center justify-center gap-1">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const StepIcon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => goToStep(step.id)}
                      disabled={status === 'pending'}
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full transition-all",
                        status === 'active' && "bg-primary text-primary-foreground",
                        status === 'completed' && "bg-green-600 text-white hover:bg-green-700",
                        status === 'available' && "bg-orange-200 text-orange-800 hover:bg-orange-300",
                        status === 'pending' && "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      )}
                      title={`${step.title} - ${step.description}`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </button>
                    
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "w-6 h-px mx-1",
                        (status === 'completed' || (status === 'active' && getStepStatus(steps[index + 1].id) !== 'pending')) 
                          ? "bg-primary" 
                          : "bg-muted"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className={`w-full max-w-3xl mx-auto ${isMobile ? 'p-4' : 'p-6'}`}>
          
          {/* Step 1: Project Description */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">What do you need done? *</Label>
                <Textarea
                  id="description"
                  rows={isMobile ? 6 : 5}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your project in detail..."
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: File Upload */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <AppointmentFileUpload 
                onFilesChange={handleFilesChange}
                initialFiles={formData.attachments}
                maxFiles={10}
              />
              
              {formData.attachments.length === 0 && (
                <div className="text-center text-sm text-muted-foreground p-4">
                  <p>No files selected. You can skip this step and add files later.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Schedule Selection */}
          {currentStep === 3 && (
            <div className={`${isMobile ? 'h-[400px]' : 'h-[500px]'}`}>
              <CustomerAvailabilityCalendar
                professionalId={isDirectBooking ? professional?.professional_id : null}
                serviceId={serviceInformation?.service_id}
                selectedProfessionals={isMarketplace ? selectedProfessionals : []}
                onSlotSelect={handleSlotSelect}
                selectedSlot={isTargetedMarketplace ? formData.professionalSelections : formData.selectedSlotInfo}
                isMultiSelect={isTargetedMarketplace}
              />
              
              {errors.session && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.session}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 4: Service Location */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="use_different_address"
                  checked={formData.use_different_address}
                  onCheckedChange={(checked) => handleChange('use_different_address', checked)}
                />
                <Label htmlFor="use_different_address">Use a different address for this service</Label>
              </div>

              {!formData.use_different_address ? (
                <div className="p-4 bg-muted/20 rounded-lg border">
                  <p className="font-medium">Using your primary address</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.service_location?.formatted_address || 'Your confirmed location will be used'}
                  </p>
                </div>
              ) : (
                <AppointmentAddressSelector
                  onAddressSelect={(address) => {
                    setFormData(prev => ({
                      ...prev,
                      service_location: address
                    }));
                  }}
                  currentAddress={formData.service_location}
                />
              )}
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {currentStep === 5 && (
            <div className="space-y-6">
              
              {/* Service Summary */}
              <div className="p-4 bg-muted/20 rounded-lg space-y-4">
                <div>
                  <h4 className="font-semibold">{serviceInformation?.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.description.substring(0, 150)}
                    {formData.description.length > 150 && '...'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-muted-foreground">
                      {formData.session && new Date(formData.session).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-muted-foreground">
                      {formData.session && new Date(formData.session).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>

                {formData.attachments && formData.attachments.length > 0 && (
                  <div>
                    <p className="font-medium text-sm">{formData.attachments.length} file(s) attached</p>
                  </div>
                )}

                {/* Workflow type display */}
                <div className="pt-2 border-t">
                  {isDirectBooking ? (
                    <p className="text-sm text-green-600">
                      Direct booking with {professionalName}
                    </p>
                  ) : isTargetedMarketplace ? (
                    <p className="text-sm text-purple-600">
                      Sending to {selectedProfessionals.length} selected professional{selectedProfessionals.length !== 1 ? 's' : ''}
                    </p>
                  ) : (
                    <p className="text-sm text-blue-600">
                      Open marketplace request
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Message */}
              <div className="space-y-2">
                <Label htmlFor="customer_message">Additional Message (Optional)</Label>
                <Textarea
                  id="customer_message"
                  rows={3}
                  value={formData.customer_message}
                  onChange={(e) => handleChange('customer_message', e.target.value)}
                  placeholder="Any special instructions or questions..."
                />
              </div>

              {/* Error Display */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
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
                {currentStep === 2 && formData.attachments.length > 0 && (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>{formData.attachments.length} file{formData.attachments.length !== 1 ? 's' : ''}</span>
                  </>
                )}

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

            {/* Continue/Submit buttons */}
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
                    {isDirectBooking
                      ? 'Creating...'
                      : isTargetedMarketplace 
                      ? 'Sending...'
                      : 'Posting...'
                    }
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {isMobile ? (
                      isDirectBooking
                        ? 'Send Request'
                        : isTargetedMarketplace 
                        ? `Send to ${selectedProfessionals.length}`
                        : 'Post Request'
                    ) : (
                      isDirectBooking
                        ? 'Send Appointment Request'
                        : isTargetedMarketplace 
                        ? `Send to ${selectedProfessionals.length} Professionals`
                        : 'Post Service Request'
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