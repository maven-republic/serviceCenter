// src/app/(customer-workspace)/customer/appointments/page.jsx
import { AppointmentsOverview } from '@/components/customer-workspace/customer/AppointmentsOverview';

export default function CustomerAppointmentsPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Your Appointments
        </h1>
        <p className="text-gray-600">
          Manage your scheduled services and bookings
        </p>
      </div>

      {/* Appointments Content */}
      <AppointmentsOverview />
    </div>
  );
}