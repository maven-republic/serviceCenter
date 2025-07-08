import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace";
import MessageInfo from "@/components/professional-workspace/section/MessageInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Message",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <ProfessionalWorkspace>
        <MessageInfo />
      </ProfessionalWorkspace>
    </>
  );
}

