import React from "react";
import { usePlaces } from "../context/PlacesContext";

export default function SummaryCards() {
  const { places, filters } = usePlaces();

  // Example stats calculation
  const areaSearched = filters.area.trim() !== "";
  const filtered = areaSearched
    ? places.filter((p) => p.name.toLowerCase().includes(filters.area.toLowerCase()))
    : [];

  if (!areaSearched) return null;

  const wheelchairCount = filtered.filter((p) => p.accessibilityType.includes("wheelchair")).length;
  const toiletCount = filtered.filter((p) => p.accessibilityType.includes("toilet")).length;
  const elevatorCount = filtered.filter((p) => p.accessibilityType.includes("elevator")).length;

  return (
    <section className="w-full bg-white py-6 lg:py-8 px-4 lg:px-8" aria-label="Summary statistics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 max-w-6xl mx-auto">
        <div className="bg-blue-100 rounded-lg p-4 lg:p-6 text-center">
          <div className="text-2xl lg:text-3xl font-bold text-blue-800">{filtered.length}</div>
          <div className="text-sm lg:text-lg text-blue-700">Accessible places found</div>
        </div>
        <div className="bg-green-100 rounded-lg p-4 lg:p-6 text-center">
          <div className="text-2xl lg:text-3xl font-bold text-green-800">{wheelchairCount}</div>
          <div className="text-sm lg:text-lg text-green-700">Wheelchair-friendly entries</div>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4 lg:p-6 text-center">
          <div className="text-2xl lg:text-3xl font-bold text-yellow-800">{toiletCount}</div>
          <div className="text-sm lg:text-lg text-yellow-700">Accessible toilets</div>
        </div>
        <div className="bg-purple-100 rounded-lg p-4 lg:p-6 text-center">
          <div className="text-2xl lg:text-3xl font-bold text-purple-800">{elevatorCount}</div>
          <div className="text-sm lg:text-lg text-purple-700">Elevators available</div>
        </div>
      </div>
    </section>
  );
} 