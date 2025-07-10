'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Radius, Mountain, AlertCircle } from "lucide-react"
import Address from '@/components/Address/Address'
import AddressMap from '@/components/Address/AddressMap'

export default function GeneralAddress({
  formData,
  errors,
  handleAddressSelect,
  updateFormData
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      
      {/* Left column: Explanation */}
      <div className="lg:col-span-2 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Address & Service Area</h2>
          </div>
          
          <div className="space-y-3 text-muted-foreground">
            <p>
              Provide your home base address and how far you're willing to travel for work.
            </p>
            <p>
              This helps clients find you and understand your service coverage area.
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Radius className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900">Service Area Tips</p>
                <p className="text-xs text-amber-700">
                  A larger service area means more potential clients, but consider travel time and costs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column: Form inputs */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Address Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Street Address
              </Label>
              <Address
                defaultValue={formData.formattedAddress}
                onSelect={handleAddressSelect}
              />
              {errors.streetAddress && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.streetAddress}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Service Radius Slider */}
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Radius className="h-4 w-4" />
                Service Area: {formData.serviceRadius} km
              </Label>
              
              <div className="px-2">
                <Slider
                  value={[parseInt(formData.serviceRadius) || 1]}
                  onValueChange={(value) => 
                    updateFormData({
                      target: {
                        name: 'serviceRadius',
                        value: value[0].toString()
                      }
                    })
                  }
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                
                {/* Slider Labels */}
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                This defines how far away from your home you're willing to work.
              </p>
            </div>

            {/* Map Preview */}
            {formData.latitude && formData.longitude && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Service Area Preview</Label>
                <div className="border rounded-lg overflow-hidden">
                  <AddressMap
                    lat={formData.latitude}
                    lng={formData.longitude}
                    radius={formData.serviceRadius || 0}
                  />
                </div>
              </div>
            )}

            {/* Rural Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRural"
                checked={formData.isRural}
                onCheckedChange={(checked) =>
                  updateFormData({
                    target: {
                      name: 'isRural',
                      value: checked
                    }
                  })
                }
              />
              <Label 
                htmlFor="isRural" 
                className="text-sm font-medium flex items-center gap-2 cursor-pointer"
              >
                <Mountain className="h-4 w-4" />
                This is a rural address
              </Label>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}