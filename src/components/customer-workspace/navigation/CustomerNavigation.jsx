"use client";

import { customerNavigation } from "@/data/dashboard";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CustomerNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="block lg:hidden">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
          >
            <Menu className="h-4 w-4" />
            Customer Navigation
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64" align="start">
          {/* Workspace Section */}
          <DropdownMenuLabel className="text-sm font-normal text-muted-foreground">
            Workspace
          </DropdownMenuLabel>
          {customerNavigation.workspace?.map((item, i) => (
            <DropdownMenuItem key={`workspace-${i}`} asChild>
              <Link
                href={item.path}
                className={cn(
                  "flex items-center gap-3 w-full cursor-pointer",
                  pathname === item.path && "bg-accent text-accent-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <i className={item.icon} />
                {item.name}
              </Link>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          {/* Account Section */}
          <DropdownMenuLabel className="text-sm font-normal text-muted-foreground">
            Account
          </DropdownMenuLabel>
          {customerNavigation.account?.map((item, i) => (
            <DropdownMenuItem key={`account-${i}`} asChild>
              <Link
                href={item.path}
                className={cn(
                  "flex items-center gap-3 w-full cursor-pointer",
                  pathname === item.path && "bg-accent text-accent-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <i className={item.icon} />
                {item.name}
              </Link>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          {/* Settings Section */}
          <DropdownMenuLabel className="text-sm font-normal text-muted-foreground">
            Settings
          </DropdownMenuLabel>
          {customerNavigation.settings?.map((item, i) => (
            <DropdownMenuItem key={`settings-${i}`} asChild>
              <Link
                href={item.path}
                className={cn(
                  "flex items-center gap-3 w-full cursor-pointer",
                  pathname === item.path && "bg-accent text-accent-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <i className={item.icon} />
                {item.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}