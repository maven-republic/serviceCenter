import DashboardLayout from "@/components/professional-workspace/DashboardLayout";
import InvoiceInfo from "@/components/professional-workspace/section/InvoiceInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Invoice",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <InvoiceInfo />
      </DashboardLayout>
    </>
  );
}
