// src/components/customer-workspace/sidebar/navigation/LogoutButton.jsx
"use client";

import { logout } from "@/app/(auth)/logout/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LogoutButton({ 
  item, 
  IconComponent,
  variant = "default" 
}) {
  const sizeClasses = {
    default: "w-20 py-3 text-xs",
    compact: "w-16 py-2 text-[10px]",
    large: "w-24 py-4 text-sm"
  };

  return (
    <form action={logout}>
      <Button
        type="submit"
        variant="ghost"
        className={cn(
          "group relative flex flex-col items-center justify-center rounded-lg transition-all duration-200 p-0",
          sizeClasses[variant],
          "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        )}
        title={item.name}
      >
        <IconComponent size={26} />
        <span className="mt-1.5 text-center leading-tight px-1 max-w-full break-words hyphens-auto">
          {item.name}
        </span>
      </Button>
    </form>
  );
}