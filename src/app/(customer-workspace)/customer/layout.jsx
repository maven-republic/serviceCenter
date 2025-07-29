// src/app/(customer-workspace)/customer/layout.jsx
'use client';

import { useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
import CustomerWorkspaceStructure from '@/components/customer-workspace/CustomerWorkspaceStructure';

export default function CustomerWorkspaceLayout({ children }) {
  const { setTheme, actualTheme } = useTheme();

  // Optional: Set default theme preference for customer workspace
  // But don't force it - let the theme provider handle the logic
  useEffect(() => {
    // Only set a preference if no theme is set
    // Remove the forcing logic and let users choose
    console.log('Customer workspace loaded, current theme:', actualTheme);
  }, [actualTheme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CustomerWorkspaceStructure>
        {children}
      </CustomerWorkspaceStructure>
    </div>
  );
}