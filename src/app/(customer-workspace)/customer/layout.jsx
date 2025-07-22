// src/app/(customer-workspace)/customer/layout.jsx
'use client';

import { useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
import CustomerWorkspaceStructure from '@/components/customer-workspace/CustomerWorkspaceStructure';
import CustomerHeader from '@/components/customer-workspace/navigation/CustomerHeader';

export default function CustomerWorkspaceLayout({ children }) {
  const { theme, setTheme } = useTheme();

  // Force light theme for customer workspace
  useEffect(() => {
    // Force light theme for customer workspace
    if (theme === 'dark') {
      setTheme('light');
    }
    
    // Ensure DOM classes are correct
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    
    return () => {
      // Cleanup when leaving customer workspace
      root.classList.remove('light');
    };
  }, [theme, setTheme]);

  return (
    <CustomerWorkspaceStructure>
      {children}
    </CustomerWorkspaceStructure>
  );
}