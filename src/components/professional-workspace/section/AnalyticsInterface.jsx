// ============ AnalyticsInterface.jsx - Tailwind + shadcn/ui Version ============
import DashboardNavigation from "../header/DashboardNavigation";
import Tensor from './Tensor'

import { BarChart3, TrendingUp } from 'lucide-react';


export default function AnalyticsInterface() {
  return (
    <div className="space-y-6">
     
      {/* Content Sections */}
      <div className="space-y-6">
        <Tensor/>
      </div>
    </div>
  );
}