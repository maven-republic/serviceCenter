import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";

import HeaderInfo1 from "@/components/section/HeaderInfo1";
import ShopCartArea1 from "@/components/section/ShopCartArea1";

export const metadata = {
    title: "Freeio - Freelance Marketplace React/Next Js Template | Shop Cart",
};

export default function page() {
    return (
        <>
            <Header20 />
            <Breadcumb3 path={["Home", "Services", "Design & Creative"]} />
            <HeaderInfo1
                title="Shop Cart"
                brief="Give your visitor a smooth online experience with a solid UX design"
            />
            <ShopCartArea1 />
            <Footer />
        </>
    );
}

