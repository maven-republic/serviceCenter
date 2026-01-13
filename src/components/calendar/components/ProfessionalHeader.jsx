import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star, Shield, DollarSign } from 'lucide-react'

export function ProfessionalHeader({ 
  professional, 
  slotsCount,
  isMobile = false 
}) {
  const getName = () => {
    return professional.name || `Professional ${professional.id?.slice(0, 8) || 'Unknown'}`
  }

  const getRating = () => {
    return professional.rating || professional.average_rating || 4.8
  }

  const getPrice = () => {
    if (professional.hourly_rate) return `$${professional.hourly_rate}/hr`
    if (professional.daily_rate) return `$${professional.daily_rate}/day`
    return 'Quote'
  }

  const isVerified = professional.verification_status === 'verified'

  // Mobile compact view
  if (isMobile) {
    return (
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={professional.profile_picture_url} />
          <AvatarFallback className="text-xs">
            {getName().substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{getName()}</span>
      </div>
    )
  }

  // Desktop detailed view
  return (
    <div className="flex items-center gap-3 pb-2 border-b">
      <Avatar className="h-8 w-8">
        <AvatarImage src={professional.profile_picture_url} />
        <AvatarFallback className="text-xs">
          {getName().substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{getName()}</h4>
          {isVerified && (
            <Shield className="h-3 w-3 text-green-600" aria-label="Verified professional" />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{getRating()}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>{getPrice()}</span>
          </div>
        </div>
      </div>
      <Badge variant="secondary" className="text-xs">
        {slotsCount} slot{slotsCount !== 1 ? 's' : ''}
      </Badge>
    </div>
  )
}