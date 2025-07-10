// ============ ChartTabs.jsx - Tailwind + shadcn/ui Version ============
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';

export default function ChartTabs({ activeChart, setActiveChart }) {
  const tabs = [
    { 
      key: 'daily', 
      label: 'Day', 
      icon: BarChart3, 
      description: 'Daily trends',
      color: 'text-primary'
    },
    { 
      key: 'hourly', 
      label: 'Hour', 
      icon: Clock, 
      description: 'Peak hours',
      color: 'text-primary'
    },
    { 
      key: 'weekly', 
      label: 'Week', 
      icon: TrendingUp, 
      description: 'Weekly view',
      color: 'text-primary'
    },
    { 
      key: 'monthly', 
      label: 'Month', 
      icon: Calendar, 
      description: 'Monthly stats',
      color: 'text-primary'
    }
  ];

  return (
    <div className=" bg-muted/50 rounded-xl p-1.5 mb-6 shadow-sm border border-border">
      <div className="flex gap-1 w-full">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeChart === tab.key;
          
          return (
            <Button
              key={tab.key}
              variant={isActive ? "default" : "ghost"}
              onClick={() => setActiveChart(tab.key)}
              className={`
                flex-1 flex flex-col items-center gap-1 h-auto py-3 px-2 
                transition-all duration-300 ease-out rounded-lg
                ${isActive 
                  ? 'bg-foreground text-background shadow-md hover:bg-foreground/90' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/80 hover:shadow-sm hover:-translate-y-0.5'
                }
                active:scale-95 active:translate-y-0
              `}
            >
              {/* Icon */}
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <IconComponent 
                  className={`h-4 w-4 ${isActive ? 'text-background' : tab.color}`} 
                />
              </div>
              
              {/* Label */}
              <div className={`text-xs font-medium ${isActive ? 'text-background' : 'text-foreground'}`}>
                {tab.label}
              </div>
              
              {/* Description */}
              <div className={`
                text-xs transition-opacity duration-300 text-center
                ${isActive 
                  ? 'text-background/90 opacity-90' 
                  : 'text-muted-foreground opacity-70'
                }
              `}>
                {tab.description}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}