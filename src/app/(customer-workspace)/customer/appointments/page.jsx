// src/app/(customer-workspace)/customer/appointments/page.jsx
import { AppointmentsOverview } from '@/components/customer-workspace/customer/AppointmentsOverview';

export const metadata = {
  title: "Your Appointments - ServiceCenter",
  description: "Manage your service requests and view responses from professionals",
};

export default function CustomerAppointmentsPage() {
  return (
    <div className="customer-workspace w-full min-h-screen bg-background">
      {/* Mobile-first container with proper spacing */}
      <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <AppointmentsOverview />
      </div>
    </div>
  );
}