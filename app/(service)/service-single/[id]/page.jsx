import Breadcumb3 from "@/components/store/breadcumb/Breadcumb3";
import Breadcumb8 from "@/components/store/breadcumb/Breadcumb8";
import Footer from "@/components/store/footer/Footer";
import Header20 from "@/components/store/header/Header20";

import Header3 from "@/components/store/header/Header3";
import ServiceDetail1 from "@/components/store/section/ServiceDetail1";
import TabSection1 from "@/components/store/section/TabSection1";

export const metadata = {
    title: "Freeio - Freelance Marketplace React/Next Js Template | Service Single",
};

export default function page() {
    return (
        <>
            <Header20 />
            <TabSection1 />
            <Breadcumb3 path={["Home", "Services", "Design & Creative"]} />
            <Breadcumb8 />
            <ServiceDetail1 />
            <Footer />
        </>
    );
}
