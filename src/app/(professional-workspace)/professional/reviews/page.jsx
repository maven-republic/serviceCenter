import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace";
import ReviewsInfo from "@/components/professional-workspace/section/ReviewsInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Review",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <ProfessionalWorkspace>
        <ReviewsInfo />
      </ProfessionalWorkspace>
    </>
  );
}

