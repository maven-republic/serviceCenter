// src/components/customer-workspace/customer/appointments/LiveUpdates.jsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Bell, 
  X,
  Clock,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const LiveUpdates = ({ 
  onRefresh, 
  isLoading = false,
  lastUpdated = null,
  autoRefreshInterval = 30000, // 30 seconds default
  enableNotifications = true 
}) => {
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [countdown, setCountdown] = useState(autoRefreshInterval / 1000);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [newUpdates, setNewUpdates] = useState([]);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-refresh logic
  useEffect(() => {
    if (!isAutoRefreshEnabled || !isOnline || isLoading) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }

    // Start countdown
    setCountdown(autoRefreshInterval / 1000);
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return autoRefreshInterval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto refresh interval
    intervalRef.current = setInterval(() => {
      if (isOnline && !isLoading) {
        onRefresh?.();
      }
    }, autoRefreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isAutoRefreshEnabled, isOnline, isLoading, autoRefreshInterval, onRefresh]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    if (!isLoading) {
      onRefresh?.();
      setCountdown(autoRefreshInterval / 1000); // Reset countdown
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setIsAutoRefreshEnabled(prev => !prev);
  };

  // Mock function to simulate new updates (in real app, this would come from WebSocket/polling)
  const simulateNewUpdate = (type = 'new_appointment') => {
    const mockUpdate = {
      id: Date.now(),
      type,
      message: type === 'new_appointment' 
        ? 'New appointment request received'
        : type === 'status_change'
        ? 'Appointment status updated'
        : 'New response received',
      timestamp: new Date(),
      appointmentId: 'apt_' + Math.random().toString(36).substr(2, 9)
    };

    setNewUpdates(prev => [mockUpdate, ...prev.slice(0, 4)]); // Keep only 5 most recent

    // Auto-remove after 10 seconds
    setTimeout(() => {
      setNewUpdates(prev => prev.filter(update => update.id !== mockUpdate.id));
    }, 10000);
  };

  const formatLastUpdated = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const getUpdateIcon = (type) => {
    switch (type) {
      case 'new_appointment': return <Calendar className="h-3 w-3" />;
      case 'status_change': return <RefreshCw className="h-3 w-3" />;
      case 'new_response': return <MessageSquare className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  const getUpdateColor = (type) => {
    switch (type) {
      case 'new_appointment': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'status_change': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'new_response': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Live Updates Control Bar */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 border">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isOnline ? "text-green-600" : "text-red-600"
            )}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
          </div>

          {/* Auto-refresh countdown */}
          {isAutoRefreshEnabled && isOnline && !isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Next refresh in {countdown}s</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Manual Refresh */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading || !isOnline}
            className="h-8"
          >
            <RefreshCw className={cn(
              "h-3 w-3 mr-1",
              isLoading && "animate-spin"
            )} />
            Refresh
          </Button>

          {/* Auto-refresh Toggle */}
          <Button
            variant={isAutoRefreshEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoRefresh}
            className="h-8"
          >
            <Wifi className="h-3 w-3 mr-1" />
            Auto {isAutoRefreshEnabled ? 'On' : 'Off'}
          </Button>

          {/* Demo: Simulate Updates */}
          <div className="hidden lg:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => simulateNewUpdate('new_appointment')}
              className="h-8 text-xs"
            >
              + Appointment
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => simulateNewUpdate('new_response')}
              className="h-8 text-xs"
            >
              + Response
            </Button>
          </div>
        </div>
      </div>

      {/* New Updates Notifications */}
      {newUpdates.length > 0 && (
        <div className="space-y-2">
          {newUpdates.map((update) => (
            <Card 
              key={update.id} 
              className={cn(
                "border-l-4 animate-in slide-in-from-top-2 duration-300",
                getUpdateColor(update.type)
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-1.5 rounded-full",
                      getUpdateColor(update.type)
                    )}>
                      {getUpdateIcon(update.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{update.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {update.timestamp.toLocaleTimeString()} • ID: {update.appointmentId}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewUpdates(prev => 
                      prev.filter(u => u.id !== update.id)
                    )}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Update Summary Badge */}
      {newUpdates.length > 0 && (
        <div className="flex justify-center">
          <Badge variant="secondary" className="animate-pulse">
            {newUpdates.length} new update{newUpdates.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
    </div>
  );
};