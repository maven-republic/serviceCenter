// ============ Statistics.jsx - Location-Aware Version ============
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Award,
  ArrowUp,
  ArrowDown,
  Users,
  MapPin
} from 'lucide-react';

// 🔄 UPDATED: Accept currencyService prop
export default function Statistics({ 
  vector, 
  professionalProfile, 
  hideEarnings, 
  currencyService 
}) {
  const [stats, setStats] = useState(null);
  
  // Determine if we have real bookings or showing preview data
  const hasRealBookings = vector?.totalBookings > 0 && !vector?.isPreview;

  // 🔧 FIX: Stabilize currencyService reference to prevent useEffect issues
  const stableCurrencyService = useMemo(() => currencyService, [currencyService]);

  useEffect(() => {
    if (vector && professionalProfile) {
      updateStatsFromData();
    }
  }, [vector, professionalProfile, hideEarnings]); // 🔧 FIXED: Remove currencyService from deps to prevent size changes

  const updateStatsFromData = () => {
    const services = professionalProfile.professional_service || [];
    const location = professionalProfile.address || {};
    
    if (hasRealBookings) {
      // Real data statistics from actual bookings
      setStats([
        {
          title: "Total Earnings",
          value: formatCurrency(vector.totalEarnings),
          change: "+15%", // You can calculate this from previous period data
          changeType: "positive",
          subtitle: "This Month",
          icon: DollarSign,
          iconColor: "text-emerald-600",
          iconBg: "bg-emerald-100",
        },
        {
          title: "Total Bookings",
          value: vector.totalBookings.toString(),
          change: "+8%",
          changeType: "positive", 
          subtitle: "Completed",
          icon: TrendingUp,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
        },
        {
          title: "Average Order Value",
          value: formatCurrency(vector.averageOrderValue || 0),
          change: "+12%",
          changeType: "positive",
          subtitle: "Per booking",
          icon: BarChart3,
          iconColor: "text-purple-600",
          iconBg: "bg-purple-100",
        },
        {
          title: "Active Services",
          value: services.length.toString(),
          subtitle: "Offered",
          icon: Award,
          iconColor: "text-orange-600",
          iconBg: "bg-orange-100",
        }
      ]);
    } else {
      // Preview/Beta mode with contextual data
      const basePrice = services[0]?.service?.base_price || 0;
      const marketPotential = vector?.totalEarnings || 0;
      
      setStats([
        {
          title: "Market Potential",
          value: hideEarnings ? "" : formatCurrency(marketPotential),
          subtitle: `${getLocationDisplay()} area`,
          icon: DollarSign,
          iconColor: "text-emerald-600",
          iconBg: "bg-emerald-100",
          isEmpty: hideEarnings || marketPotential === 0,
          previewText: hideEarnings ? "Hidden" : "Monthly potential"
        },
        {
          title: "Services Ready",
          value: services.length.toString(),
          subtitle: "Active offerings",
          icon: Award,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
          isEmpty: false
        },
        {
          title: "Starting Rate",
          value: hideEarnings || !basePrice ? "" : formatCurrency(basePrice),
          subtitle: "Base service price",
          icon: BarChart3,
          iconColor: "text-purple-600",
          iconBg: "bg-purple-100",
          isEmpty: hideEarnings || !basePrice,
          previewText: hideEarnings ? "Hidden" : "Per service"
        },
        {
          title: "Coverage Area", 
          value: professionalProfile.service_radius ? `${professionalProfile.service_radius}km` : "",
          subtitle: getLocationDisplay() || "Set location",
          icon: MapPin,
          iconColor: "text-orange-600",
          iconBg: "bg-orange-100",
          isEmpty: !professionalProfile.service_radius
        }
      ]);
    }
    console.log('🔍 DEBUG: Statistics Processing:', {
  services: services,
  basePrice: services[0]?.service?.base_price,
  isHidden: hideEarnings,
  willShowStartingRate: !hideEarnings && (services[0]?.service?.base_price > 0)
});
  };

  // 🔄 UPDATED: Location-aware currency formatting using stable reference
  const formatCurrency = (amount) => {
    if (stableCurrencyService) {
      return stableCurrencyService.formatCurrency(amount);
    }
    
    // 🔄 UPDATED: Fallback to location-aware formatting
    const country = professionalProfile?.address?.country || 'Jamaica';
    
    const currencyConfig = {
      'Jamaica': { code: 'JMD', locale: 'en-JM' },
      'United States': { code: 'USD', locale: 'en-US' },
      'Canada': { code: 'CAD', locale: 'en-CA' },
      'United Kingdom': { code: 'GBP', locale: 'en-GB' },
      'Australia': { code: 'AUD', locale: 'en-AU' }
    };
    
    const config = currencyConfig[country] || currencyConfig['Jamaica'];
    
    if (typeof amount !== 'number') return config.code === 'JMD' ? 'J$0' : '$0';
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 🆕 NEW: Get location display for UI
  const getLocationDisplay = () => {
    const address = professionalProfile?.address;
    if (!address) return 'Your';
    
    // Return appropriate region name based on country
    const country = address.country || 'Jamaica';
    
    if (country === 'Jamaica') {
      return address.parish || 'Your';
    } else if (country === 'United States') {
      return address.state || 'Your';
    } else if (country === 'Canada') {
      return address.province || 'Your';
    } else if (country === 'United Kingdom') {
      return address.county || 'Your';
    }
    
    return address.city || 'Your';
  };

  // 🆕 NEW: Get currency display for badges using stable reference
  const getCurrencyCode = () => {
    if (stableCurrencyService) {
      return stableCurrencyService.getCurrencyCode();
    }
    
    const country = professionalProfile?.address?.country || 'Jamaica';
    const codes = {
      'Jamaica': 'JMD',
      'United States': 'USD', 
      'Canada': 'CAD',
      'United Kingdom': 'GBP',
      'Australia': 'AUD'
    };
    
    return codes[country] || 'JMD';
  };

  // Loading state
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-8 bg-muted rounded w-16" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const isPositive = stat.changeType === "positive";
        const isNegative = stat.changeType === "negative";
        
        if (stat.isEmpty) {
          // Empty state card for missing data
          return (
            <Card 
              key={index} 
              className="border-2 border-dashed border-muted bg-muted/30 hover:bg-muted/40 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className="h-8 flex items-center">
                      <div className="h-6 w-16 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/40 rounded animate-pulse" />
                    </div>
                    <p className="text-xs text-muted-foreground/80">
                      {stat.previewText || stat.subtitle}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.iconBg} opacity-60`}>
                    <IconComponent className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }

        // Populated card with data
        return (
          <Card 
            key={index} 
            className={`hover:shadow-md transition-shadow duration-200 ${
              hasRealBookings ? 'border-l-4 border-l-emerald-500' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1">
                    {stat.change && (
                      <>
                        <Badge 
                          variant={isPositive ? "default" : isNegative ? "destructive" : "secondary"}
                          className="text-xs gap-1"
                        >
                          {isPositive && <ArrowUp className="h-3 w-3" />}
                          {isNegative && <ArrowDown className="h-3 w-3" />}
                          {stat.change}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {stat.subtitle}
                        </span>
                      </>
                    )}
                    {!stat.change && (
                      <span className="text-xs text-muted-foreground">
                        {stat.subtitle}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.iconBg} relative`}>
                  <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                  {hasRealBookings && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {/* 🔄 UPDATED: Data Source Indicator with currency info */}
      <div className="col-span-full mt-6">
        <div className="flex items-center justify-center gap-4">
          <Badge 
            variant={hasRealBookings ? "default" : "secondary"} 
            className="text-xs px-3 py-1"
          >
            {hasRealBookings ? (
              <>
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
                Live Data from {vector.totalBookings} bookings
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                Preview Mode - {getLocationDisplay()} Market Projection
              </>
            )}
          </Badge>
          
          {/* 🆕 NEW: Currency indicator */}
          <Badge variant="outline" className="text-xs px-2 py-1">
            <DollarSign className="h-3 w-3 mr-1" />
            {getCurrencyCode()}
          </Badge>
        </div>
      </div>
    </div>
  );
}