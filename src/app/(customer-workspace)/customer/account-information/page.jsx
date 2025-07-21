// src/app/(customer-workspace)/customer/account-information/page.jsx
import CustomerAccountOverview from "@/components/customer-workspace/section/CustomerAccountOverview";

export const metadata = {
  title: "Account Information - Service Center",
  description: "Manage your account settings and profile information"
};

export default function AccountOverviewInterface() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Account Information
        </h1>
        <p className="text-gray-600">
          Manage your profile, settings, and account preferences
        </p>
      </div>

      {/* Account Content */}
      <CustomerAccountOverview />
    </div>
  );
}