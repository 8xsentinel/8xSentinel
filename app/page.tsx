'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/sections/HeroSection';
import SearchSection from '../components/sections/SearchSection';
import StatsSection from '../components/sections/StatsSection';
import HowItWorks from '../components/sections/HowItWorks';
import ResellersCarousel from '../components/sections/ResellersCarousel';
import LatestAlerts from '../components/sections/LatestAlerts';
import MissionSection from '../components/sections/MissionSection';
import { db } from '../lib/db';

export default function Home() {
  const [stats, setStats] = useState({
    totalReports: 0,
    totalScammers: 0,
    totalProtected: 0,
    verifiedSellers: 0
  });

  useEffect(() => {
    // Populate mock DB values on load
    db.getPlatformStats().then((platformStats) => {
      setStats(platformStats.counters);
    });
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection stats={stats} />
        <SearchSection />
        <StatsSection />
        <HowItWorks />
        <ResellersCarousel />
        <LatestAlerts />
        <MissionSection />
      </main>
      <Footer />
    </>
  );
}
