// src/components/search/DiscoveryCard.jsx
import { Star, MapPin, Clock, User, Building, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function DiscoveryCard({ result, layout = 'grid' }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'service':
        return <Tag className="h-4 w-4" />;
      case 'professional':
        return <User className="h-4 w-4" />;
      case 'industry':
      case 'vertical':
        return <Building className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'service':
        return 'bg-blue-100 text-blue-700';
      case 'professional':
        return 'bg-green-100 text-green-700';
      case 'industry':
      case 'vertical':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatPrice = (price, pricingModel) => {
    if (!price) return 'Quote required';
    const formatted = new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD',
      minimumFractionDigits: 0
    }).format(price);
    
    if (pricingModel === 'hourly') return `${formatted}/hr`;
    if (pricingModel === 'daily') return `${formatted}/day`;
    return `From ${formatted}`;
  };

  if (layout === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-md ${getTypeColor(result.type)}`}>
                  {getTypeIcon(result.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{result.service_name || result.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.description || result.subtitle}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {result.category || result.type}
                        </Badge>
                        {result.is_featured && (
                          <Badge className="text-xs bg-yellow-100 text-yellow-800">
                            Featured
                          </Badge>
                        )}
                        {result.match_type === 'keyword' && (
                          <Badge variant="outline" className="text-xs">
                            Keyword: {result.matched_keyword}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {formatPrice(result.base_price || result.price, result.pricing_model)}
                      </div>
                      {result.duration_minutes && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {Math.round(result.duration_minutes / 60)}h
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-md ${getTypeColor(result.type)}`}>
            {getTypeIcon(result.type)}
          </div>
          {result.is_featured && (
            <Badge className="bg-yellow-100 text-yellow-800">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <h3 className="font-semibold mb-2">{result.service_name || result.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {result.description || result.subtitle}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {result.category || result.type}
            </Badge>
            <div className="font-semibold">
              {formatPrice(result.base_price || result.price, result.pricing_model)}
            </div>
          </div>
          
          {result.duration_minutes && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {Math.round(result.duration_minutes / 60)} hours
            </div>
          )}
          
          {result.match_type === 'keyword' && (
            <Badge variant="outline" className="text-xs">
              Found via: {result.matched_keyword}
            </Badge>
          )}
        </div>

        <Button className="w-full mt-4" size="sm">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
