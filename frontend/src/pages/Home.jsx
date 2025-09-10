import React, { useState } from "react";
import NavBar from "../components/NavBar";
import FilterSidebar from "../components/FilterSidebar";
import AccessibleMap from "../components/AccessibleMap";
import SummaryCards from "../components/SummaryCards";
import ContributionBanner from "../components/ContributionBanner";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

export default function Home() {
  const [locationInfo, setLocationInfo] = useState(null);

  const handleLocationDetected = (locationData) => {
    setLocationInfo(locationData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar locationInfo={locationInfo} />
      <main className="flex-1">
        {/* Hero Section - Responsive Layout */}
        <section className="flex flex-col lg:flex-row w-full h-auto lg:h-[600px]">
          {/* Filter Sidebar - Full width on mobile, sidebar on desktop */}
          <div className="w-full lg:w-80 order-2 lg:order-1">
            <FilterSidebar />
          </div>
          {/* Map - Full width on mobile, remaining space on desktop */}
          <div className="w-full lg:flex-1 order-1 lg:order-2 h-[400px] lg:h-full">
            <AccessibleMap onLocationDetected={handleLocationDetected} />
          </div>
        </section>
        {/* <SummaryCards /> */}
        {/* <ContributionBanner /> */}
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
