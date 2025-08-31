'use client'

import { useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, MapPin, Clock, DollarSign } from "lucide-react"
import Appointment from '@/components/forms/Appointment'
import { cn } from "@/lib/utils"

export default function AppointmentModal({ 
  isOpen, 
  onClose, 
  professional, 
  serviceInformation, 
  location,
  variant = 'marketplace', // 'marketplace' | 'direct'
  selectedProfessionals = [], // For targeted marketplace
  onSuccess,
  isMobile = false
}) {
  // Handle appointment success
  const handleAppointmentSuccess = useCallback((appointmentRequest) => {
    console.log('Appointment successful:', appointmentRequest)
    
    // Show success message based on variant
    if (variant === 'marketplace') {
      if (selectedProfessionals.length > 0) {
        alert(`Success! Your request has been sent to ${selectedProfessionals.length} professional${selectedProfessionals.length !== 1 ? 's' : ''}. You'll receive quotes soon!`)
      } else {
        alert('Request posted! Multiple professionals will respond with quotes.')
      }
    } else {
      alert('Appointment sent! You will receive a confirmation email shortly.')
    }
    
    // Call onSuccess prop if provided
    onSuccess?.(appointmentRequest)
    
    // Close modal
    onClose?.()
  }, [onClose, variant, selectedProfessionals.length, onSuccess])

  // Format professional name for display
  const professionalName = professional?.first_name && professional?.last_name 
    ? `${professional.first_name} ${professional.last_name}`
    : professional?.business_name 
    ? professional.business_name
    : 'Professional'

  // Determine modal title based on variant
  const modalTitle = variant === 'marketplace' 
    ? selectedProfessionals.length > 0
      ? `Request Quotes from ${selectedProfessionals.length} Professional${selectedProfessionals.length !== 1 ? 's' : ''}`
      : `Request ${serviceInformation?.name || 'Service'}`
    : `Book with ${professionalName}`

  const modalDescription = variant === 'marketplace'
    ? selectedProfessionals.length > 0
      ? `Send your service request to ${selectedProfessionals.length} selected professional${selectedProfessionals.length !== 1 ? 's' : ''} and receive quotes`
      : 'Post your service request and receive quotes from multiple professionals'
    : 'Schedule your appointment and provide service details'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0",
        isMobile && "max-w-full max-h-full w-full h-full rounded-none"
      )}>
        
        {/* DialogHeader - Hidden but accessible */}
        <DialogHeader className="sr-only">
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>

        {/* Modal Body - Appointment Form with fixed props */}
        <div className="flex-1 overflow-y-auto">
          <Appointment
            professional={variant === 'marketplace' ? null : professional}
            serviceInformation={serviceInformation}
            location={location}
            variant={variant}
            selectedProfessionals={selectedProfessionals} // ✅ Always pass this prop
            onSuccess={handleAppointmentSuccess}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}