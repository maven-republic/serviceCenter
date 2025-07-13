// app/(professional-workspace)/professional/account-information/page.jsx
import ProfessionalAccountOverview from "@/components/professional-workspace/section/ProfessionalAccountOverview";

export const metadata = {
  title: "Professional Account Information - Service Center",
  description: "Manage your professional profile, skills, education, and account settings"
};

export default function AccountInformationInterface() {
  return (
    <div className="container mx-auto space-y-6">
      
      
      {/* Main Component */}
      <ProfessionalAccountOverview />
    </div>
  );
}