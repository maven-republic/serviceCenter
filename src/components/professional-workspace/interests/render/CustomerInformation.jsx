// src/components/professional-workspace/interests/render/CustomerInformation.jsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Phone, MapPin } from 'lucide-react'

export default function CustomerInformation({ appointment }) {
  if (!appointment?.customer) return null

  const customer = appointment.customer

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4" />
          Customer Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border">
            <AvatarImage 
              src={customer.account?.profile_picture_url} 
              alt="Customer"
            />
            <AvatarFallback className="bg-muted text-muted-foreground font-medium">
              {customer.account?.first_name?.[0]}
              {customer.account?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h5 className="font-semibold text-lg">
              {customer.account?.first_name} {customer.account?.last_name}
            </h5>
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{customer.account?.email}</span>
              </div>
              {customer.phone?.phone_number && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{customer.phone.phone_number}</span>
                </div>
              )}
              {appointment.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{appointment.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}