// src/app/(customer-workspace)/customer/account-information/page.jsx
import CustomerAccountOverview from "@/components/customer-workspace/section/CustomerAccountOverview";

export const metadata = {
  title: "Account Information - Service Center",
  description: "Manage your account settings and profile information"
};

export default function AccountOverviewInterface() {
  return (
    <div>
    

      {/* Account Content */}
      <CustomerAccountOverview />
    </div>
  );
}