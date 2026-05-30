import Catdog from "@/components/home/CatdogSection";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import HeroSection from "@/components/home/HeroSection";
import HomeArticleSection from "@/components/home/HomeArticleSection";
import HomeProductSection from "@/components/home/HomeProductSection";
import ShippingMarquee from "@/components/home/ShippingMarquee";
import StatsSection from "@/components/home/StatsSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ShippingMarquee />
      <HomeProductSection />
      <Catdog />
      <FlashSaleSection />
      <StatsSection />
      <HomeArticleSection />
    </main>
  );
}
