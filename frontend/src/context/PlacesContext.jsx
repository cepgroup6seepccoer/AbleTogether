import React, { createContext, useContext, useState, useCallback } from "react";
import { fetchAccessiblePlaces, getBoundingBoxFromCenter } from "../services/overpassApi";

// Dummy data for demonstration (fallback)
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
];

const PlacesContext = createContext();

export function PlacesProvider({ children }) {
  const [places, setPlaces] = useState(initialPlaces);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchLocation, setLastFetchLocation] = useState(null);
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

  // Get active filter types for API calls
  const getActiveFilterTypes = useCallback(() => {
    return Object.entries(filters)
      .filter(([key, value]) => value && key !== "area" && key !== "onlyMine")
      .map(([key]) => key);
  }, [filters]);

  // Fetch places from Overpass API with throttling
  const fetchPlacesFromAPI = useCallback(async (centerLat, centerLng, radiusKm = 5, forceRefresh = false) => {
    // Check if we already have data for this location (unless force refresh)
    if (!forceRefresh && lastFetchLocation && 
        Math.abs(lastFetchLocation.lat - centerLat) < 0.001 && 
        Math.abs(lastFetchLocation.lng - centerLng) < 0.001) {
      return;
    }

    // Check if we're already loading to prevent multiple simultaneous requests
    if (isLoading) {
      console.log('API request already in progress, skipping...');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bounds = getBoundingBoxFromCenter(centerLat, centerLng, radiusKm);
      const activeFilters = getActiveFilterTypes();
      
      // If no filters are active, fetch all accessibility types
      const filterTypes = activeFilters.length > 0 ? activeFilters : ['wheelchair', 'toilet', 'elevator', 'tactile'];
      
      const apiPlaces = await fetchAccessiblePlaces(bounds, filterTypes);
      
      // Replace places instead of combining to avoid accumulation
      setPlaces(apiPlaces);
      
      setLastFetchLocation({ lat: centerLat, lng: centerLng });
    } catch (err) {
      console.error('Failed to fetch places from API:', err);
      setError(err.message);
      // Keep existing places as fallback
    } finally {
      setIsLoading(false);
    }
  }, [getActiveFilterTypes, lastFetchLocation, isLoading]);

  // Clear places and reset state
  const clearPlaces = useCallback(() => {
    setPlaces(initialPlaces);
    setLastFetchLocation(null);
    setError(null);
  }, []);

  // Update filters without automatic refetching
  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    // Note: API calls are now only triggered by search button, not filter changes
  }, []);

  return (
    <PlacesContext.Provider value={{ 
      places, 
      setPlaces, 
      filters, 
      setFilters: updateFilters,
      boundBox, 
      setBoundBox,
      isLoading,
      error,
      fetchPlacesFromAPI,
      clearPlaces
    }}>
      {children}
    </PlacesContext.Provider>
  );
}

export function usePlaces() {
  return useContext(PlacesContext);
} 