import React, { createContext, useContext, useState } from "react";

// Dummy data for demonstration
const initialPlaces = [
  {
    id: 1,
    name: "Central Park",
    lat: 28.6139,
    lng: 77.2090,
    summary: "Wheelchair accessible, Braille signage, Accessible toilets.",
    accessibilityType: ["wheelchair", "braille", "toilet"],
  },
  {
    id: 2,
    name: "City Mall",
    lat: 19.0760,
    lng: 72.8777,
    summary: "Elevators, Elderly-friendly benches, Tactile paving.",
    accessibilityType: ["elevator", "elderly", "tactile"],
  },
  // ...more places
];

const PlacesContext = createContext();

export function PlacesProvider({ children }) {
  const [places, setPlaces] = useState(initialPlaces);
  const [filters, setFilters] = useState({
    wheelchair: false,
    braille: false,
    tactile: false,
    toilet: false,
    elevator: false,
    elderly: false,
    area: "",
    onlyMine: false,
  });
  const [boundBox, setBoundBox] = useState({
    southCoordinate: 0,
    northCoordinate: 0,
    westCoordinate: 0,
    eastCoordinate: 0,
  });
  return (
    <PlacesContext.Provider value={{ places, setPlaces, filters, setFilters, boundBox, setBoundBox }}>
      {children}
    </PlacesContext.Provider>
  );
}

export function usePlaces() {
  return useContext(PlacesContext);
} 