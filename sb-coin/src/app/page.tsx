import { HeroSection } from "@/components/HeroSection";
import { VaultSection } from "@/components/VaultSection";
import { ClaimSection } from "@/components/ClaimSection";
import { MemeYardSection } from "@/components/MemeYardSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <VaultSection />
      <ClaimSection />
      <MemeYardSection />
    </>
  );
}
