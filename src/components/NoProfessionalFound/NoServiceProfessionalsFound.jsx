'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Search, 
  ArrowLeft, 
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function NoServiceProfessionalsFound({ 
  serviceId, 
  serviceName = "this service",
  className = "" 
}) {

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-xl font-bold text-slate-950">
          No Professionals Available
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* Main Message */}
        <div className="text-center">
          <p className="text-slate-700 leading-relaxed mb-4">
            We do not currently have any professionals offering <strong>{serviceName}</strong> on our platform.
          </p>
          
          
        </div>

        {/* Action Options */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/customer/workspace">
                <Search className="h-4 w-4 mr-2" />
                Browse Other Services
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="justify-start">
              <Link href="/contact">
                <AlertCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-slate-950 mb-2">What you can do:</h4>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>• Check back in a few days as we regularly add new professionals</li>
            <li>• Try browsing similar services that might meet your needs</li>
            <li>• Contact us if you know professionals who offer this service</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <Button asChild variant="ghost">
            <Link href="/customer/workspace">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Service Search
            </Link>
          </Button>
        </div>
        
      </CardContent>
    </Card>
  )
}