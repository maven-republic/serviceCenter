// src/components/customer-workspace/sidebar/navigation/NavigationItem.jsx
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NavigationItem({ 
  item, 
  isActive = false, 
  showTooltip = false,
  IconComponent,
  variant = "default" // default, compact, large
}) {
  const sizeClasses = {
    default: "w-20 py-3 text-[10px]",
    compact: "w-16 py-2 text-[10px]", 
    large: "w-24 py-4 text-sm"
  };

  return (
    <Link
      href={item.path}
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-lg transition-all duration-200",
        sizeClasses[variant],
        "hover:bg-gray-100 hover:text-gray-700",
        isActive 
          ? "bg-black text-white" 
          : "text-gray-500 hover:text-gray-700"
      )}
      title={showTooltip ? item.name : undefined}
    >
      <IconComponent size={26} />
      <span className="mt-1.5 text-center leading-tight px-1 max-w-full break-words hyphens-auto">
        {item.name}
      </span>
      
      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="absolute left-24 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {item.name}
        </div>
      )}
    </Link>
  );
}