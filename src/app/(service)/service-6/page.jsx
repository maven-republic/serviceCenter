import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import Breadcumb7 from "@/components/breadcumb/Breadcumb7";
import Footer from "@/components/footer/Footer";
import Header19 from "@/components/header/Header19";

import Listing8 from "@/components/section/Listing8";
import TabSection1 from "@/components/section/TabSection1";

export const metadata = {
    title: "Freeio - Freelance Marketplace React/Next Js Template | Service 6",
};

export default function page() {
    return (
        <>
            <Header19 />
            {/* <TabSection1 />9 */}
            <Breadcumb3 path={["Home", "Services", "Design & Creative"]} />
            <Breadcumb7 />
            <Listing8 />
            <Footer />
        </>
    );
}

