// File: src/app/(customer-workspace)/customer/services/[id]/components/LocationSelector.jsx
// 📍 Location selection component when no location is provided

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import AddressConfirmation from '@/components/AddressConfirmation/AddressConfirmation'

export default function LocationSelector({ 
  serviceId,
  accountId, 
  onLocationConfirmed,
  className
}) {
  return (
    <div className={`max-w-2xl mx-auto py-4 sm:py-0 ${className || ''}`}>
      {/* Debug Info in Development */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs sm:text-sm">
          <h3 className="font-bold text-yellow-800">🔍 Debug Info:</h3>
          <ul className="text-yellow-700 mt-2 space-y-1">
            <li>Service ID: {serviceId || 'Missing'}</li>
            <li>Account ID: {accountId || 'Missing'}</li>
            <li>Has Location Callback: {onLocationConfirmed ? 'Yes' : 'No'}</li>
          </ul>
        </div>
      )} */}

        
        <CardContent className="pt-0">
          <AddressConfirmation 
            accountId={accountId} 
            onLocationConfirmed={onLocationConfirmed} 
          />
        </CardContent>
    </div>
  )
}