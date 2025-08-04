// src/components/customer-workspace/sidebar/navigation/NavigationSection.jsx
"use client";

import { usePathname } from "next/navigation";
import NavigationItem from "./NavigationItem";
import { getIconComponent } from "./iconMapper";
import { cn } from "@/lib/utils";

export default function NavigationSection({ 
  items = [], 
  variant = "default",
  spacing = "space-y-3",
  className = "",
  excludeItems = [] // Array of item names to exclude
}) {
  const pathname = usePathname();

  // Filter out excluded items
  const filteredItems = items.filter(item => 
    !excludeItems.includes(item.name)
  );

  if (!filteredItems.length) return null;

  return (
    <div className={cn(
      "flex flex-col items-center",
      spacing,
      className
    )}>
      {filteredItems.map((item, i) => {
        const IconComponent = getIconComponent(item.icon);
        
        return (
          <NavigationItem
            key={`nav-item-${i}`}
            item={item}
            isActive={pathname === item.path}
            IconComponent={IconComponent}
            variant={variant}
          />
        );
      })}
    </div>
  );
}