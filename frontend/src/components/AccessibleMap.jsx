import React, { useState } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { usePlaces } from "../context/PlacesContext";

const iconMap = {
  wheelchair: "https://img.icons8.com/emoji/48/000000/wheelchair-emoji.png",
  toilet: "https://img.icons8.com/emoji/48/000000/restroom-emoji.png",
  elevator: "https://img.icons8.com/ios-filled/50/000000/elevator.png",
  braille: "https://img.icons8.com/ios-filled/50/000000/braille.png",
  tactile: "https://img.icons8.com/ios-filled/50/000000/low-vision.png",
  elderly: "https://img.icons8.com/ios-filled/50/000000/elderly-person.png",
};

export default function AccessibleMap() {
  const { places, filters } = usePlaces();
  const [selected, setSelected] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your key
  });

  // Filter logic (simplified)
  const filteredPlaces = places.filter((place) =>
    Object.entries(filters)
      .filter(([k, v]) => v && k !== "area" && k !== "onlyMine")
      .every(([k]) => place.accessibilityType.includes(k))
  );

  if (!isLoaded) return (
    <div className="flex-1 flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading Map...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full relative">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={{ lat: 22.9734, lng: 78.6569 }}
        zoom={5}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: true,
          // High contrast options for accessibility
          styles: [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#000000" }]
            },
            {
              featureType: "all",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#ffffff" }]
            }
          ]
        }}
        aria-label="Accessible places map"
      >
        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            icon={{
              url: iconMap[place.accessibilityType[0]] || iconMap["wheelchair"],
              scaledSize: { width: 40, height: 40 },
            }}
            onClick={() => setSelected(place)}
            aria-label={`Accessible place: ${place.name}, features: ${place.accessibilityType.join(", ")}`}
          />
        ))}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
            options={{
              maxWidth: 300,
              pixelOffset: { width: 0, height: -40 }
            }}
          >
            <div className="p-2 max-w-xs">
              <h2 className="font-bold text-lg mb-2 text-gray-800">{selected.name}</h2>
              <p className="text-sm text-gray-600 mb-3">{selected.summary}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {selected.accessibilityType.map((type) => (
                  <span key={type} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <span>{filtersList.find(f => f.key === type)?.icon || "♿"}</span>
                    <span className="capitalize">{type}</span>
                  </span>
                ))}
              </div>
              <button 
                className="w-full bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-blue-800 transition-colors" 
                aria-label="View Details"
              >
                View Details
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
} 