// src/components/professional-workspace/assessments/AssessmentSpecifics.jsx
'use client'

import { useState } from 'react'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  Navigation
} from 'lucide-react'
import AssessmentStatus from './AssessmentStatus'
import AssessmentConductForm from './AssessmentConductForm'
import AssessmentFinalQuoteForm from './AssessmentFinalQuoteForm'

export default function AssessmentSpecifics({ 
  open, 
  onOpenChange, 
  assessment,
  professionalId,
  onRefresh,
  onClose
}) {
  const [currentView, setCurrentView] = useState('details') // 'details', 'conduct', 'quote'

  if (!assessment) return null

  const customer = assessment.appointment?.customer?.account
  const address = assessment.appointment?.address
  const appointment = assessment.appointment

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not scheduled'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const canStartAssessment = () => {
    return ['accepted', 'scheduled', 'confirmed'].includes(assessment.status)
  }

  const canProvideQuote = () => {
    return assessment.status === 'completed' || assessment.status === 'active'
  }

  const hasProvidedQuote = () => {
    return assessment.final_quote_provided && assessment.final_quote_amount
  }

  const handleStartAssessment = () => {
    setCurrentView('conduct')
  }

  const handleProvideQuote = () => {
    setCurrentView('quote')
  }

  const handleBack = () => {
    setCurrentView('details')
  }

  const handleSuccess = () => {
    onRefresh?.()
    setCurrentView('details')
  }

  const openDirections = () => {
    if (!address) return
    const query = encodeURIComponent(`${address.street_address}, ${address.city}, ${address.parish || 'Jamaica'}`)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl overflow-hidden flex flex-col">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            {currentView !== 'details' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1">
              <SheetTitle className="text-xl">
                {currentView === 'conduct' ? 'Conduct Assessment' :
                 currentView === 'quote' ? 'Provide Final Quote' :
                 'Assessment Details'}
              </SheetTitle>
              <SheetDescription>
                {currentView === 'details' && 
                  `Assessment for ${customer?.first_name} ${customer?.last_name}`
                }
              </SheetDescription>
            </div>
            <AssessmentStatus status={assessment.status} />
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {currentView === 'details' && (
            <div className="space-y-6 pb-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarImage src={customer?.profile_picture_url} />
                      <AvatarFallback>
                        {customer?.first_name?.[0]}{customer?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {customer?.first_name} {customer?.last_name}
                      </h4>
                      <div className="space-y-1 mt-1">
                        {customer?.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <a href={`mailto:${customer.email}`} className="hover:text-primary">
                              {customer.email}
                            </a>
                          </div>
                        )}
                        {appointment?.customer?.phone?.phone_number && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <a href={`tel:${appointment.customer.phone.phone_number}`} className="hover:text-primary">
                              {appointment.customer.phone.phone_number}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Assessment Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Date & Time</span>
                    <span className="text-sm font-medium">
                      {formatDateTime(assessment.confirmed_date || assessment.proposed_date)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-medium">
                      {assessment.confirmed_duration_minutes || assessment.proposed_duration_minutes || 60} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Assessment Type</span>
                    <Badge variant="outline">
                      {assessment.assessment_type === 'local' ? 'Site Visit' :
                       assessment.assessment_type === 'remote' ? 'Video Call' :
                       'Phone Call'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              {address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Site Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-md">
                      <p className="text-sm font-medium">{address.street_address}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.parish || 'Jamaica'}
                      </p>
                      {address.postal_code && (
                        <p className="text-sm text-muted-foreground">{address.postal_code}</p>
                      )}
                    </div>
                    {assessment.assessment_type === 'local' && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={openDirections}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="font-semibold mb-2">{appointment?.title}</h5>
                    {appointment?.description && (
                      <p className="text-sm text-muted-foreground">{appointment.description}</p>
                    )}
                  </div>
                  {appointment?.customer_message && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800 italic">
                        "{appointment.customer_message}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assessment Fee */}
              {assessment.proposed_fee > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Assessment Fee
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Assessment Fee</span>
                      <span className="text-lg font-semibold">
                        JMD ${parseFloat(assessment.proposed_fee).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-xs text-amber-800">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        This fee will be deducted from your final quote if the customer accepts.
                      </p>
                    </div>
                    {assessment.fee_collected && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Fee Collected
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Assessment Justification */}
              {assessment.assessment_justification && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Why Assessment is Required</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {assessment.assessment_justification}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Final Quote (if provided) */}
              {hasProvidedQuote() && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      Final Quote Provided
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-green-700">Quote Amount</span>
                      <span className="text-xl font-bold text-green-800">
                        JMD ${parseFloat(assessment.final_quote_amount).toLocaleString()}
                      </span>
                    </div>
                    {assessment.final_quote_notes && (
                      <div className="p-3 bg-white border border-green-200 rounded-md">
                        <p className="text-sm text-green-800">{assessment.final_quote_notes}</p>
                      </div>
                    )}
                    {assessment.customer_approved_final_quote && (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Quote Approved by Customer
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentView === 'conduct' && (
            <AssessmentConductForm
              assessment={assessment}
              onSuccess={handleSuccess}
              onCancel={handleBack}
            />
          )}

          {currentView === 'quote' && (
            <AssessmentFinalQuoteForm
              assessment={assessment}
              onSuccess={handleSuccess}
              onCancel={handleBack}
            />
          )}
        </ScrollArea>

        {/* Footer Actions */}
        {currentView === 'details' && (
          <div className="border-t pt-4 mt-4 space-y-2">
            {canStartAssessment() && !hasProvidedQuote() && (
              <Button 
                className="w-full" 
                onClick={handleStartAssessment}
              >
                <Clock className="h-4 w-4 mr-2" />
                Start Assessment
              </Button>
            )}
            
            {canProvideQuote() && !hasProvidedQuote() && (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={handleProvideQuote}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Provide Final Quote
              </Button>
            )}

            {hasProvidedQuote() && !assessment.customer_approved_final_quote && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-center">
                <p className="text-sm text-blue-800">
                  ⏳ Waiting for customer to review your quote
                </p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}