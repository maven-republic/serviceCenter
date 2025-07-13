import Breadcumb7 from "@/components/breadcumb/Breadcumb7";
import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import Footer from "@/components/footer/Footer";
import Header19 from "@/components/header/Header19";

import Listing14 from "@/components/section/Listing14";
import TabSection1 from "@/components/section/TabSection1";

export const metadata = {
    title: "Freeio - Freelance Marketplace React/Next Js Template | Freelancer 2",
};

export default function page() {
    return (
        <>
            <Header19 />
            <TabSection1 />
            <Breadcumb3 path={["Home", "Services", "Design & Creative"]} />
            <Breadcumb7 />
            <Listing14 />
            <Footer />
        </>
    );
}

