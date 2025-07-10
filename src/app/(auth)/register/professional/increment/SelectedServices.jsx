'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Calendar, Tag } from "lucide-react"

export default function SelectedServices({
  selected,
  toggleService,
  services,
  formData,
  updateFormData
}) {
  const selectedServices = services.filter(service =>
    selected.includes(service.service_id)
  )

  return (
    <Card className="mb-6">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Your Selected Services
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {selected.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {selectedServices.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectedServices.map(service => (
              <Card key={service.service_id} className="relative">
                <CardContent className="p-4 space-y-4">
                  
                  {/* Service Header */}
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      {service.name}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleService(service.service_id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      title="Remove service"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Start Date Input */}
                  <div className="space-y-2">
                    <Label htmlFor={`service-date-${service.service_id}`} className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      When did you start offering this service?
                    </Label>
                    <Input
                      type="date"
                      id={`service-date-${service.service_id}`}
                      value={formData.serviceStartDates?.[service.service_id] || ''}
                      onChange={(e) =>
                        updateFormData({
                          target: {
                            name: 'serviceStartDates',
                            value: {
                              ...formData.serviceStartDates,
                              [service.service_id]: e.target.value
                            }
                          }
                        })
                      }
                      className="text-sm"
                    />
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No services selected yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Search and select services from the dropdown above to add them here. You can specify when you started offering each service.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}