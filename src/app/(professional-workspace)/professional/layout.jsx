'use client';

// Force dynamic rendering for all professional workspace pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
import ProfessionalWorkspace from '@/components/professional-workspace/ProfessionalWorkspace';

export default function ProfessionalWorkspaceLayout({ children }) {
  const { setTheme, actualTheme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.add('professional-workspace');
    console.log('Professional workspace: theme management active');
  }, []);

  return (
    <div className="professional-workspace min-h-screen bg-background text-foreground">
      <ProfessionalWorkspace>
        <div className="professional-workspace-mobile lg:professional-workspace-desktop">
          {children}
        </div>
      </ProfessionalWorkspace>
    </div>
  );
}