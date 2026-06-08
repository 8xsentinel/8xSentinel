import HeroSection from '../components/sections/HeroSection';
import SearchSection from '../components/sections/SearchSection';
import HowItWorks from '../components/sections/HowItWorks';
import LatestAlerts from '../components/sections/LatestAlerts';
import MissionSection from '../components/sections/MissionSection';
import ResellersCarousel from '../components/sections/ResellersCarousel';
import StatsSection from '../components/sections/StatsSection';

export default function Home() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <SearchSection />
      <StatsSection />
      <HowItWorks />
      <ResellersCarousel />
      <LatestAlerts />
      <MissionSection />
    </main>
  );
}
