// src/components/customer-workspace/sidebar/navigation/LogoutButton.jsx
"use client";

import { useRouter } from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LogoutButton({ 
  item, 
  IconComponent,
  variant = "default" 
}) {
  const router = useRouter();
  const { logout: clearUserStore } = useUserStore();

  const sizeClasses = {
    default: "w-20 py-3 text-xs",
    compact: "w-16 py-2 text-[10px]",
    large: "w-24 py-4 text-sm"
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      // 1. Create Supabase client
      const supabase = createClientComponentClient();
      
      // 2. Clear user store first
      await clearUserStore(supabase);
      console.log('✅ User store cleared');
      
      // 3. Sign out from Supabase with global scope
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });
      
      if (error) {
        console.error('❌ Supabase logout error:', error);
        throw error;
      }
      
      console.log('✅ Supabase session cleared');
      
      // 4. Force a hard redirect to clear any remaining state
      window.location.href = '/login';
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      
      // Fallback: still try to redirect even if logout partially fails
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  };

  return (
    <Button
      onClick={handleLogout}
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
  );
}