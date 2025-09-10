import React, { useEffect, useRef, useState } from "react";
import { usePlaces } from "../context/PlacesContext";

// Leaflet will be imported dynamically to avoid SSR issues
let L = null;

const filtersList = [
  { key: "wheelchair", label: "Wheelchair access", icon: "♿" },
  { key: "braille", label: "Braille signage", icon: "🧑‍🦯" },
  { key: "tactile", label: "Tactile paving", icon: "🧑‍🦯" },
  { key: "toilet", label: "Accessible toilets", icon: "🚻" },
  { key: "elevator", label: "Elevator availability", icon: "🛗" },
  { key: "elderly", label: "Elderly-friendly", icon: "👴" },
];

// Custom marker icons for accessibility types
const createCustomIcon = (type) => {
  const iconHtml = `
    <div style="
      background: #2563eb;
      border: 3px solid #ffffff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    ">
      ${filtersList.find(f => f.key === type)?.icon || "♿"}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Function to get location name from coordinates
const getLocationName = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
    );
    if (response.ok) {
      const data = await response.json();
      if (data.address) {
        // Try to get city name, fallback to other location names
        const city = data.address.city || 
                    data.address.town || 
                    data.address.village || 
                    data.address.county ||
                    data.address.state;
        return city || data.display_name.split(',')[0];
      }
    }
  } catch (error) {
    console.log('Reverse geocoding failed:', error.message);
  }
  return null;
};

export default function AccessibleMap({ onLocationDetected }) {
  const { places, filters, boundBox, isLoading: placesLoading, error, fetchPlacesFromAPI } = usePlaces();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Filter places based on selected filters
  const filteredPlaces = places.filter((place) => {
    const activeFilters = Object.entries(filters)
      .filter(([k, v]) => v && k !== "area" && k !== "onlyMine")
      .map(([k]) => k);
    
    if (activeFilters.length === 0) return true;
    return activeFilters.every((filter) => place.accessibilityType.includes(filter));
  });

  // Hybrid geolocation function
  const detectUserLocation = async () => {
    // Try browser geolocation first (most accurate)
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          });
        });

        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Get location name
        const name = await getLocationName(latitude, longitude);
        const locationName = name || 'Your Location';
        
        // Pass location info to parent component
        if (onLocationDetected) {
          onLocationDetected({ lat: latitude, lng: longitude, name: locationName, type: 'precise' });
        }
        
        return { lat: latitude, lng: longitude };
      } catch (error) {
        console.log('Browser geolocation failed:', error.message);
        // Continue to IP geolocation fallback
      }
    }

    // Fallback to IP geolocation
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        if (data.latitude && data.longitude) {
          setUserLocation({ lat: data.latitude, lng: data.longitude });
          
          // Get location name from IP geolocation data
          const locationName = data.city || data.region || data.country_name || 'Estimated Location';
          
          // Pass location info to parent component
          if (onLocationDetected) {
            onLocationDetected({ lat: data.latitude, lng: data.longitude, name: locationName, type: 'estimated' });
          }
          
          return { lat: data.latitude, lng: data.longitude };
        }
      }
    } catch (error) {
      console.log('IP geolocation failed:', error.message);
    }

    // Default to India center
    if (onLocationDetected) {
      onLocationDetected({ lat: 22.9734, lng: 78.6569, name: 'India', type: 'default' });
    }
    return { lat: 22.9734, lng: 78.6569 };
  };

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const loadLeaflet = async () => {
      try {
        L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
        setIsLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [22.9734, 78.6569], // Center of India
      zoom: 100, // Increased from 5 to 8 (2x more zoomed in)
      zoomControl: true,
      attributionControl: true,
      // Accessibility options
      keyboard: true,
      keyboardPanDelta: 80,
      keyboardZoomDelta: 2, // Increased from 1 to 2 (2x zoom increment)
    });

    // Add OpenStreetMap tiles (free and accessible)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      // High contrast options for accessibility
      className: 'map-tiles'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add keyboard navigation instructions
    const keyboardInfo = L.control({ position: 'topright' });
    keyboardInfo.onAdd = function() {
      const div = L.DomUtil.create('div', 'keyboard-info');
      div.innerHTML = `
        <div style="
          background: white;
          padding: 8px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          font-size: 12px;
          max-width: 200px;
        ">
          <strong>Keyboard Navigation:</strong><br/>
          Arrow keys: Pan map<br/>
          +/- keys: Zoom in/out
        </div>
      `;
      return div;
    };
    keyboardInfo.addTo(map);

    // Detect user location and update map
    detectUserLocation().then((location) => {
      if (mapInstanceRef.current) {
        // Zoom to user location with appropriate zoom level
        const zoomLevel = userLocation ? 15 : 8; // Closer zoom if location found
        mapInstanceRef.current.setView([location.lat, location.lng], zoomLevel);
        
        // Note: API calls are now only triggered by search button, not automatically
      }
    });

    setMapInitialized(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [L]);

  useEffect(() => {
    if (!L || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    filteredPlaces.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], {
        icon: createCustomIcon(place.accessibilityType[0]),
        keyboard: true,
        title: `${place.name} - ${place.accessibilityType.join(', ')}`
      });

      // Create popup content
      const popupContent = `
        <div style="max-width: 250px; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
            ${place.name}
          </h3>
          <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
            ${place.summary}
          </p>
          <div style="margin-bottom: 12px;">
            ${place.accessibilityType.map((type) => `
              <span style="
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                margin: 2px;
                background: #dbeafe;
                color: #1e40af;
                border-radius: 12px;
                font-size: 12px;
              ">
                <span>${filtersList.find(f => f.key === type)?.icon || "♿"}</span>
                <span style="text-transform: capitalize;">${type}</span>
              </span>
            `).join('')}
          </div>
          <button 
            onclick="window.viewDetails('${place.id}')"
            style="
              width: 100%;
              background: #2563eb;
              color: white;
              border: none;
              padding: 8px 12px;
              border-radius: 4px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
            "
            onmouseover="this.style.background='#1d4ed8'"
            onmouseout="this.style.background='#2563eb'"
          >
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // Fit map to show all markers if there are any, but prioritize user location
    if (filteredPlaces.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      const bounds = group.getBounds();
      
      // If user location is available, include it in bounds
      if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng]);
      }
      
      map.fitBounds(bounds.pad(0.1));
    }

  }, [filteredPlaces, L, userLocation]);

  // Fit to boundBox changes from context (from search)
  useEffect(() => {
    if (!L || !mapInstanceRef.current) return;
    if (!boundBox) return;

    const { southCoordinate, northCoordinate, westCoordinate, eastCoordinate } = boundBox;

    const nums = [southCoordinate, northCoordinate, westCoordinate, eastCoordinate].map(Number);
    if (nums.some(n => Number.isNaN(n))) return;

    const bounds = [
      [southCoordinate, westCoordinate],
      [northCoordinate, eastCoordinate]
    ];
    console.log(bounds+"Bounding Box Changed")

    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [boundBox, L]);

  // Add global function for popup button clicks
  useEffect(() => {
    window.viewDetails = (placeId) => {
      console.log('View details for place:', placeId);
      // Implement your detail view logic here
    };

    return () => {
      delete window.viewDetails;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
        aria-label="Accessible places map"
        role="application"
        tabIndex="0"
      />
      
      {/* Loading overlay for places data */}
      {placesLoading && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 z-[1000]">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-700">Loading accessible places...</span>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-50 border border-red-200 rounded-lg shadow-lg p-3 max-w-sm z-[1000]">
          <div className="flex items-start gap-2">
            <div className="text-red-500 text-lg">⚠️</div>
            <div>
              <p className="text-sm font-medium text-red-800">Failed to load places</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-xs text-red-600 underline mt-1 hover:text-red-800"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Places count indicator */}
      {mapInitialized && !placesLoading && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <div className="text-sm text-gray-700">
            <span className="font-medium">{filteredPlaces.length}</span> accessible places found
          </div>
        </div>
      )}
      
      {/* Custom CSS for better accessibility */}
      <style jsx>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
    </div>
  );
} 