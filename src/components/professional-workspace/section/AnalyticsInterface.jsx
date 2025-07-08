// ============ AnalyticsInterface.jsx - Tailwind + shadcn/ui Version ============
import DashboardNavigation from "../header/DashboardNavigation";
import Statistics from "./income/Statistics";
import IncomeInsights from "./income/IncomeInsights";
import { BarChart3, TrendingUp } from 'lucide-react';

export default function AnalyticsInterface() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
            <p className="text-muted-foreground text-sm">
              Track your performance and business insights
            </p>
          </div>
        </div>
        
        {/* Optional breadcrumb or additional navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
          <TrendingUp className="h-4 w-4" />
          <span>Dashboard / Analytics</span>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        <Statistics />
        <IncomeInsights />
      </div>
    </div>
  );
}