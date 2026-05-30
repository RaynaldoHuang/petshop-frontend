import HeroSlider from "./HeroSlider";
import { getHeroSection } from "@/lib/getHeroSection";

export default async function HeroSection() {
  const heroes = await getHeroSection();

  if (!heroes || heroes.length === 0) return null;

  return <HeroSlider heroes={heroes} />;
}