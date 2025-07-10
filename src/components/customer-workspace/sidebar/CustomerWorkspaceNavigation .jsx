"use client";

import { logout } from "@/app/(auth)/logout/actions";
import { customerNavigation } from "@/data/dashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function CustomerWorkspaceNavigation() {
  const pathname = usePathname();

  const NavigationItem = ({ item, isActive = false }) => (
    <Link
      href={item.path}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground font-medium"
      )}
    >
      <i className={item.icon} />
      {item.name}
    </Link>
  );

  const LogoutButton = ({ item, isActive = false }) => (
    <form>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 h-auto px-3 py-2 text-sm font-normal",
          isActive && "bg-accent text-accent-foreground font-medium"
        )}
        formAction={logout}
      >
        <i className={item.icon} />
        {item.name}
      </Button>
    </form>
  );

  return (
    <div className="hidden lg:block w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto">
          <nav className="p-4 space-y-6">
            {/* Workspace Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground px-3">
                Workspace
              </h4>
              <div className="space-y-1">
                {customerNavigation.workspace?.map((item, i) => (
                  <NavigationItem
                    key={`workspace-${i}`}
                    item={item}
                    isActive={pathname === item.path}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Account Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground px-3">
                Account
              </h4>
              <div className="space-y-1">
                {customerNavigation.account?.map((item, i) => (
                  <NavigationItem
                    key={`account-${i}`}
                    item={item}
                    isActive={pathname === item.path}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Settings Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground px-3">
                Settings
              </h4>
              <div className="space-y-1">
                {customerNavigation.settings?.map((item, i) => (
                  <div key={`settings-${i}`}>
                    {item.name === "Logout" ? (
                      <LogoutButton
                        item={item}
                        isActive={pathname === item.path}
                      />
                    ) : (
                      <NavigationItem
                        item={item}
                        isActive={pathname === item.path}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}