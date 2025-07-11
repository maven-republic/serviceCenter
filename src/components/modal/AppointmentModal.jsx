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
  location 
}) {
  // Handle appointment success
  const handleAppointmentSuccess = useCallback((appointmentRequest) => {
    console.log('✅ appointment successful:', appointmentRequest)
    
    // Show success message or redirect
    // You might want to replace this with a toast notification
    alert('Appointment sent! You will receive a confirmation email shortly.')
    
    // Close modal
    onClose?.()
  }, [onClose])

  // Format professional name for display
  const professionalName = professional?.first_name && professional?.last_name 
    ? `${professional.first_name} ${professional.last_name}`
    : professional?.business_name 
    ? professional.business_name
    : 'Professional'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0">
        
        {/* Add the required DialogHeader with DialogTitle */}
        <DialogHeader className="sr-only">
          <DialogTitle>Book Appointment with {professionalName}</DialogTitle>
          <DialogDescription>
            Schedule your appointment and provide service details
          </DialogDescription>
        </DialogHeader>

        {/* Modal Body - Appointment Form */}
        <div className="flex-1 overflow-y-auto">
          <Appointment
            professional={professional}
            serviceInformation={serviceInformation}
            location={location}
            onSuccess={handleAppointmentSuccess}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}