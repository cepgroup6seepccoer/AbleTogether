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

export default function AccessibleMap() {
  const { places, filters } = usePlaces();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter places based on selected filters
  const filteredPlaces = places.filter((place) => {
    const activeFilters = Object.entries(filters)
      .filter(([k, v]) => v && k !== "area" && k !== "onlyMine")
      .map(([k]) => k);
    
    if (activeFilters.length === 0) return true;
    return activeFilters.every((filter) => place.accessibilityType.includes(filter));
  });

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
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
      // Accessibility options
      keyboard: true,
      keyboardPanDelta: 80,
      keyboardZoomDelta: 1,
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

    // Fit map to show all markers if there are any
    if (filteredPlaces.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }

  }, [filteredPlaces, L]);

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
      
      {/* Custom CSS for better accessibility */}
      <style jsx>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
        
        .map-tiles {
          filter: contrast(1.1) brightness(1.05);
        }
        
        .keyboard-info {
          pointer-events: none;
        }
        
        .keyboard-info > div {
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
} 