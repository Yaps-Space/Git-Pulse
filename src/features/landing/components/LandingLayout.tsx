import { LandingAbout } from "./LandingAbout";
import { LandingCTA } from "./LandingCta";
import { LandingFeatures } from "./LandingFeatures";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import { LandingHowItWorks } from "./LandingHowItWorks";
import { LandingNavbar } from "./LandingNavbar";
import { LandingRoles } from "./LandingRoles";
import { LandingTechStack } from "./LandingTechStack";

export function LandingLayout() {
  return (
    <main className="bg-black text-white overflow-x-hidden">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingRoles />
      <LandingTechStack />
      <LandingAbout />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}