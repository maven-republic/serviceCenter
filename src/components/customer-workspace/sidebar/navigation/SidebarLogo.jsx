// src/components/customer-workspace/sidebar/navigation/SidebarLogo.jsx
"use client";

import { Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SidebarLogo({ 
  variant = "default",
  className = ""
}) {
  const sizeClasses = {
    default: "w-12 h-16 mt-4",
    compact: "w-10 h-12 mt-3",
    large: "w-14 h-20 mt-6"
  };

  const iconSizes = {
    default: 24,
    compact: 20,
    large: 28
  };

  return (
    <div className={cn(
      "flex items-center justify-center",
      sizeClasses[variant],
      className
    )}>
      <div className="text-gray-800">
        <Grid3X3 size={iconSizes[variant]} />
      </div>
    </div>
  );
}