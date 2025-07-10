'use client'

import ServiceTag from './ServiceTag'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase } from "lucide-react"

export default function Portfolio({
  portfolio,
  services,
  selectedServices,
  onToggle
}) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          {portfolio.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {services.map(service => (
            <ServiceTag
              key={service.service_id}
              service={service}
              selected={selectedServices.includes(service.service_id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}