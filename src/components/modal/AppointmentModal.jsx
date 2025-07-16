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
  selectedProfessionals = [] // For targeted marketplace
}) {
  // Handle appointment success
  const handleAppointmentSuccess = useCallback((appointmentRequest) => {
    console.log('✅ appointment successful:', appointmentRequest)
    
    // Show success message or redirect
    // You might want to replace this with a toast notification
    if (variant === 'marketplace') {
      alert('Request posted! Multiple professionals will respond with quotes.')
    } else {
      alert('Appointment sent! You will receive a confirmation email shortly.')
    }
    
    // Close modal
    onClose?.()
  }, [onClose, variant])

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
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0">
        
        {/* Updated DialogHeader with dynamic content */}
        <DialogHeader className="sr-only">
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>

        {/* Modal Body - Appointment Form */}
        <div className="flex-1 overflow-y-auto">
          <Appointment
            professional={variant === 'marketplace' ? null : professional}
            serviceInformation={serviceInformation}
            location={location}
            variant={variant}
            selectedProfessionals={selectedProfessionals}
            onSuccess={handleAppointmentSuccess}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}