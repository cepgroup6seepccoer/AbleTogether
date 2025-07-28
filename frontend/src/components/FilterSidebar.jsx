import React, { useState } from "react";
import { usePlaces } from "../context/PlacesContext";
import { FaFilter, FaChevronDown, FaChevronUp } from "react-icons/fa";

const filtersList = [
  { key: "wheelchair", label: "Wheelchair access", icon: "♿" },
  { key: "braille", label: "Braille signage", icon: "🧑‍🦯" },
  { key: "tactile", label: "Tactile paving", icon: "🧑‍🦯" },
  { key: "toilet", label: "Accessible toilets", icon: "🚻" },
  { key: "elevator", label: "Elevator availability", icon: "🛗" },
  { key: "elderly", label: "Elderly-friendly", icon: "👴" },
];

export default function FilterSidebar() {
  const { filters, setFilters } = usePlaces();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAreaChange = (e) => {
    setFilters((prev) => ({ ...prev, area: e.target.value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement area search logic
  };

  return (
    <aside className="w-full lg:w-80 bg-white border-b lg:border-r lg:border-b-0 p-4 lg:p-6" aria-label="Filter sidebar">
      {/* Mobile Filter Header */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FaFilter />
          Filters
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800"
          aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
        >
          {isExpanded ? <FaChevronUp className="w-5 h-5" /> : <FaChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Filter Header */}
      <div className="hidden lg:block mb-4">
        <h3 className="font-semibold text-lg">Filters</h3>
      </div>

      {/* Filter Content - Hidden on mobile when collapsed */}
      <div className={`lg:block ${isExpanded ? 'block' : 'hidden'}`}>
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <fieldset>
            <legend className="font-semibold text-base lg:text-lg mb-3">Accessibility Filters</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {filtersList.map((f) => (
                <label key={f.key} className="flex items-center gap-2 text-base lg:text-lg cursor-pointer p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name={f.key}
                    checked={filters[f.key]}
                    onChange={handleChange}
                    className="w-4 h-4 lg:w-5 lg:h-5"
                    aria-label={f.label}
                  />
                  <span className="text-xl lg:text-2xl">{f.icon}</span>
                  <span className="text-sm lg:text-base">{f.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          
          <div className="space-y-3">
            <label htmlFor="area-search" className="block font-semibold text-base lg:text-lg">Area Search</label>
            <input
              id="area-search"
              type="text"
              value={filters.area}
              onChange={handleAreaChange}
              className="w-full border rounded px-3 py-2 text-base lg:text-lg"
              placeholder="Enter area name"
              aria-label="Area name"
            />
            <button 
              type="submit" 
              className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-800 text-base lg:text-lg" 
              aria-label="Search area"
            >
              Search
            </button>
          </div>
          
          <label className="flex items-center gap-2 mt-4 text-base lg:text-lg cursor-pointer p-2 rounded hover:bg-gray-50">
            <input
              type="checkbox"
              name="onlyMine"
              checked={filters.onlyMine}
              onChange={handleChange}
              className="w-4 h-4 lg:w-5 lg:h-5"
              aria-label="Only show places I can use"
            />
            <span className="text-sm lg:text-base">Only show places I can use</span>
          </label>
        </form>
      </div>
    </aside>
  );
} 