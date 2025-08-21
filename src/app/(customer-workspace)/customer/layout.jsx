
// ===== 2. CUSTOMER WORKSPACE LAYOUT FIX (src/app/(customer-workspace)/customer/layout.jsx) =====
'use client';

import { useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
import CustomerWorkspaceStructure from '@/components/customer-workspace/CustomerWorkspaceStructure';

export default function CustomerWorkspaceLayout({ children }) {
  const { setTheme, actualTheme } = useTheme();

  // Force customer workspace to always use light theme
  useEffect(() => {
    // Always ensure customer workspace uses light theme
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light', 'customer-workspace');
    console.log('Customer workspace: enforced light theme');
  }, []);

  return (
    <div className="customer-workspace min-h-screen bg-background text-foreground">
      <CustomerWorkspaceStructure>
        <div className="customer-workspace-mobile lg:customer-workspace-desktop">
          {children}
        </div>
      </CustomerWorkspaceStructure>
    </div>
  );
}

