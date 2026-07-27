import { HeroSection } from "@/components/HeroSection";
import { VaultSection } from "@/components/VaultSection";
import { RepaySection } from "@/components/RepaySection";
import { WakeSection } from "@/components/WakeSection";
import { StorySection } from "@/components/StorySection";
import { PlaygroundSection } from "@/components/PlaygroundSection";
import { JoinSection } from "@/components/JoinSection";
import { ScreenNav } from "@/components/ScreenNav";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <VaultSection />
      <RepaySection />
      <WakeSection />
      <StorySection />
      <PlaygroundSection />
      <JoinSection />
      {/* Last, and outside the scroll flow — it finds the sections above by
          query, so it has to mount after they exist. */}
      <ScreenNav />
    </main>
  );
}
