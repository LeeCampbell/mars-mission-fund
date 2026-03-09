import { HeroSection } from '../components/HeroSection'
import { StatsSection } from '../components/StatsSection'
import { HowItWorksSection } from '../components/HowItWorksSection'
import { FeaturedMissionsSection } from '../components/FeaturedMissionsSection'
import { ClosingCtaSection } from '../components/ClosingCtaSection'

export function Home() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturedMissionsSection />
      <ClosingCtaSection />
    </main>
  )
}
