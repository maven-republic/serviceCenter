import DashboardLayout from "@/components/store/dashboard/DashboardLayout";
import MessageInfo from "@/components/store/dashboard/section/MessageInfo";

import MobileNavigation from "@/components/store/header/MobileNavigation";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Message",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation />
      <DashboardLayout>
        <MessageInfo />
      </DashboardLayout>
    </>
  );
}
