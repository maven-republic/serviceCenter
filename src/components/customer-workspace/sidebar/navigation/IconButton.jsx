// src/components/customer-workspace/sidebar/navigation/IconButton.jsx
"use client";

import { cn } from "@/lib/utils";

export default function IconButton({ 
  icon: Icon, 
  onClick, 
  title, 
  variant = "default",
  className = "" 
}) {
  const sizeClasses = {
    default: "w-20 py-3 text-xs",
    compact: "w-16 py-2 text-[10px]",
    large: "w-24 py-4 text-sm"
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-lg transition-all duration-200",
        sizeClasses[variant],
        "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
        className
      )}
      title={title}
    >
      <Icon size={26} />
      <span className="mt-1.5 text-center leading-tight px-1 max-w-full break-words hyphens-auto">
        {title}
      </span>
    </button>
  );
}