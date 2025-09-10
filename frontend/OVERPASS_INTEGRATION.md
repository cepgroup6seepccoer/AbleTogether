# OpenStreetMap Overpass API Integration

This document describes the integration of the OpenStreetMap Overpass API to fetch real accessibility data for the AbleTogether application.

## Overview

The application now fetches real accessibility data from OpenStreetMap using the Overpass API, providing users with actual wheelchair-accessible places, toilets, elevators, and other accessibility features in their area.

## Architecture

### 1. Overpass API Service (`src/services/overpassApi.js`)

The service handles all communication with the Overpass API:

- **Query Generation**: Creates Overpass QL queries for different accessibility types
- **Data Transformation**: Converts OSM elements to our application format
- **Error Handling**: Manages API errors and timeouts
- **Bounding Box Utilities**: Helper functions for geographic calculations

#### Key Functions:

```javascript
// Fetch accessible places in a bounding box
fetchAccessiblePlaces(bounds, filterTypes)

// Generate bounding box from center point and radius
getBoundingBoxFromCenter(lat, lng, radiusKm)

// Generate bounding box from map bounds
getBoundingBox(mapBounds)
```

### 2. Enhanced Places Context (`src/context/PlacesContext.jsx`)

The context now includes:

- **API Integration**: Fetches data from Overpass API
- **Loading States**: Tracks API request status
- **Error Handling**: Manages and displays API errors
- **Caching**: Avoids duplicate requests for the same location
- **Filter Integration**: Refetches data when filters change

#### New Context Values:

```javascript
{
  places,           // Array of places (now includes real OSM data)
  isLoading,        // Boolean indicating API request status
  error,           // String containing error message if any
  fetchPlacesFromAPI, // Function to fetch places for a location
  clearPlaces,     // Function to reset places to initial state
  // ... existing values
}
```

### 3. Updated Map Component (`src/components/AccessibleMap.jsx`)

The map component now:

- **Auto-fetches Data**: Loads places when user location is detected
- **Dynamic Loading**: Fetches new places when map is moved/zoomed
- **Visual Feedback**: Shows loading indicators and error messages
- **Place Count**: Displays number of found places

## API Queries

### Wheelchair Accessible Places
```overpass
[out:json][timeout:25];
(
  node["wheelchair"="yes"](south,west,north,east);
  way["wheelchair"="yes"](south,west,north,east);
  relation["wheelchair"="yes"](south,west,north,east);
);
out geom;
```

### Accessible Toilets
```overpass
[out:json][timeout:25];
(
  node["amenity"="toilets"]["wheelchair"="yes"](south,west,north,east);
  way["amenity"="toilets"]["wheelchair"="yes"](south,west,north,east);
);
out geom;
```

### Elevators
```overpass
[out:json][timeout:25];
(
  node["highway"="elevator"](south,west,north,east);
  way["highway"="elevator"](south,west,north,east);
);
out geom;
```

### Tactile Paving
```overpass
[out:json][timeout:25];
(
  way["tactile_paving"="yes"](south,west,north,east);
  node["tactile_paving"="yes"](south,west,north,east);
);
out geom;
```

## Data Transformation

OSM elements are transformed to our application format:

```javascript
{
  id: "node_1234567890",           // Unique identifier
  name: "City Mall Entrance",      // Place name
  lat: 18.600123,                  // Latitude
  lng: 73.760987,                  // Longitude
  summary: "Wheelchair accessible", // Generated summary
  accessibilityType: ["wheelchair"], // Array of accessibility types
  osmId: 1234567890,               // Original OSM ID
  osmType: "node",                 // OSM element type
  tags: { ... }                    // Original OSM tags
}
```

## Usage Examples

### Basic Usage
```javascript
import { fetchAccessiblePlaces, getBoundingBoxFromCenter } from '../services/overpassApi';

// Fetch places in a 5km radius around a location
const bounds = getBoundingBoxFromCenter(18.5204, 73.8567, 5);
const places = await fetchAccessiblePlaces(bounds, ['wheelchair', 'toilet']);
```

### Using the Context
```javascript
import { usePlaces } from '../context/PlacesContext';

function MyComponent() {
  const { places, isLoading, error, fetchPlacesFromAPI } = usePlaces();
  
  // Fetch places for a specific location
  const handleLocationChange = (lat, lng) => {
    fetchPlacesFromAPI(lat, lng, 5); // 5km radius
  };
  
  return (
    <div>
      {isLoading && <div>Loading places...</div>}
      {error && <div>Error: {error}</div>}
      {places.map(place => (
        <div key={place.id}>{place.name}</div>
      ))}
    </div>
  );
}
```

## Error Handling

The integration includes comprehensive error handling:

1. **API Timeouts**: 25-second timeout for Overpass queries
2. **Network Errors**: Graceful handling of network failures
3. **Invalid Data**: Filtering out places without coordinates
4. **User Feedback**: Visual indicators for loading and error states

## Performance Considerations

1. **Caching**: Avoids duplicate requests for the same location
2. **Zoom-based Loading**: Only fetches data when zoomed to city level or closer
3. **Parallel Queries**: Executes multiple filter queries simultaneously
4. **Deduplication**: Removes duplicate places based on coordinates and name

## Testing

A test component (`OverpassTest.jsx`) is included for verifying the API integration:

- Tests API connectivity
- Displays sample results
- Shows error handling
- Can be temporarily added to any page for testing

## Future Enhancements

1. **More Accessibility Types**: Add support for additional OSM accessibility tags
2. **Offline Support**: Cache data for offline usage
3. **Data Validation**: Enhanced validation of OSM data quality
4. **Performance Optimization**: Implement request debouncing and smarter caching
5. **User Contributions**: Allow users to add accessibility data back to OSM

## Dependencies

- `leaflet`: For map functionality
- `react`: For component framework
- No additional dependencies required for Overpass API integration

## API Limits

- **Rate Limiting**: Overpass API has built-in rate limiting
- **Query Timeout**: 25-second timeout per query
- **Data Volume**: Large bounding boxes may return many results
- **Free Usage**: No API key required, but subject to fair use policies
