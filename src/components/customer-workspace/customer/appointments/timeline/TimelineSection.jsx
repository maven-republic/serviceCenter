// src/components/customer-workspace/customer/appointments/timeline/TimelineSection.jsx
"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

import { TimelineAppointmentCard } from './TimelineAppointmentCard';
import { SECTION_CONFIG } from './timeline-constants';

/**
 * Timeline section component (Today, Tomorrow, etc.)
 * Groups appointments by time period
 */
export const TimelineSection = ({ 
  sectionKey, 
  appointments, 
  onAppointmentClick 
}) => {
  const config = SECTION_CONFIG[sectionKey];
  const [isExpanded, setIsExpanded] = useState(config.defaultExpanded);

  if (appointments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      
      {/* Section Header */}
      <div 
        className={cn(
          "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
          config.bgColor,
          "hover:opacity-80"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}

          {/* Section Icon */}
          <span className="text-lg">{config.icon}</span>

          {/* Section Label */}
          <h3 className={cn("font-semibold text-lg", config.color)}>
            {config.label}
          </h3>

          {/* Count Badge */}
          <span className="text-sm text-muted-foreground">
            ({appointments.length})
          </span>
        </div>
      </div>

      {/* Appointments List */}
      {isExpanded && (
        <div className="space-y-3 ml-4">
          {appointments.map((appointment) => (
            <TimelineAppointmentCard
              key={appointment.appointment_id}
              appointment={appointment}
              onClick={() => onAppointmentClick(appointment)}
            />
          ))}
        </div>
      )}
    </div>
  );
};