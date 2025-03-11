import Footer from "@/components/store/footer/Footer";
import Header from "@/components/store/header/Header";
import Hero from "@/components/store/hero/Hero";
import BrowserCategory from "@/components/store/section/BrowserCategory";
import CtaBanner from "@/components/store/section/CtaBanner";
import HighestRated from "@/components/store/section/HighestRated";
import LearnFreeio from "@/components/store/section/LearnFreeio";
import NeedSomething from "@/components/store/section/NeedSomething";
import OurPartner from "@/components/store/section/OurPartner";
import PopularService from "@/components/store/section/PopularService";
import PriceTable from "@/components/store/section/PriceTable";

export const metadata = {
    title: "Freeio - Freelance Marketplace React/Next Js Template | Home 2",
};

export default function page() {
    return (
        <>
            <div className="wrapper ovh">
                <Header />
                <Hero />
                <NeedSomething />
                <PopularService />
                <CtaBanner />
                <OurPartner />
                <BrowserCategory />
                <HighestRated />
                <LearnFreeio />
                <PriceTable />
                <Footer />
            </div>
        </>
    );
}
