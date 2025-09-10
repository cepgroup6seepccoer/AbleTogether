/**
 * OpenStreetMap Overpass API service for fetching accessibility data
 */

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Request throttling to prevent rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

/**
 * Generate Overpass QL query for wheelchair accessible places in a bounding box
 * @param {Object} bounds - Bounding box coordinates
 * @param {number} bounds.south - South latitude
 * @param {number} bounds.north - North latitude  
 * @param {number} bounds.west - West longitude
 * @param {number} bounds.east - East longitude
 * @returns {string} Overpass QL query
 */
const generateWheelchairQuery = (bounds) => {
  const { south, north, west, east } = bounds;
  return `[out:json][timeout:25];
(
  node["wheelchair"="yes"](${south},${west},${north},${east});
  way["wheelchair"="yes"](${south},${west},${north},${east});
  relation["wheelchair"="yes"](${south},${west},${north},${east});
);
out geom;`;
};

/**
 * Generate Overpass QL query for accessible toilets
 * @param {Object} bounds - Bounding box coordinates
 * @returns {string} Overpass QL query
 */
const generateToiletQuery = (bounds) => {
  const { south, north, west, east } = bounds;
  return `[out:json][timeout:25];
(
  node["amenity"="toilets"]["wheelchair"="yes"](${south},${west},${north},${east});
  way["amenity"="toilets"]["wheelchair"="yes"](${south},${west},${north},${east});
);
out geom;`;
};

/**
 * Generate Overpass QL query for elevators
 * @param {Object} bounds - Bounding box coordinates
 * @returns {string} Overpass QL query
 */
const generateElevatorQuery = (bounds) => {
  const { south, north, west, east } = bounds;
  return `[out:json][timeout:25];
(
  node["highway"="elevator"](${south},${west},${north},${east});
  way["highway"="elevator"](${south},${west},${north},${east});
);
out geom;`;
};

/**
 * Generate Overpass QL query for tactile paving
 * @param {Object} bounds - Bounding box coordinates
 * @returns {string} Overpass QL query
 */
const generateTactilePavingQuery = (bounds) => {
  const { south, north, west, east } = bounds;
  return `[out:json][timeout:25];
(
  way["tactile_paving"="yes"](${south},${west},${north},${east});
  node["tactile_paving"="yes"](${south},${west},${north},${east});
);
out geom;`;
};

/**
 * Execute Overpass API query with throttling
 * @param {string} query - Overpass QL query
 * @returns {Promise<Object>} API response
 */
const executeQuery = async (query) => {
  // Throttle requests to prevent rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Throttling request: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before searching again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Overpass API error:', error);
    throw error;
  }
};

/**
 * Transform OSM element to our place format
 * @param {Object} element - OSM element
 * @returns {Object} Transformed place object
 */
const transformOSMElement = (element) => {
  const { id, lat, lon, tags = {}, type } = element;
  
  // Determine accessibility types based on tags
  const accessibilityTypes = [];
  
  if (tags.wheelchair === 'yes') {
    accessibilityTypes.push('wheelchair');
  }
  
  if (tags.amenity === 'toilets' && tags.wheelchair === 'yes') {
    accessibilityTypes.push('toilet');
  }
  
  if (tags.highway === 'elevator') {
    accessibilityTypes.push('elevator');
  }
  
  if (tags.tactile_paving === 'yes') {
    accessibilityTypes.push('tactile');
  }
  
  // Add braille if mentioned in tags
  if (tags.braille === 'yes' || (tags.description && tags.description.toLowerCase().includes('braille'))) {
    accessibilityTypes.push('braille');
  }
  
  // Determine if elderly-friendly based on tags
  if (tags.bench === 'yes' || tags.shelter === 'yes' || tags.covered === 'yes') {
    accessibilityTypes.push('elderly');
  }

  // Generate a summary based on available tags
  const summaryParts = [];
  if (tags.wheelchair === 'yes') summaryParts.push('Wheelchair accessible');
  if (tags.amenity === 'toilets') summaryParts.push('Accessible toilets');
  if (tags.highway === 'elevator') summaryParts.push('Elevator available');
  if (tags.tactile_paving === 'yes') summaryParts.push('Tactile paving');
  if (tags.braille === 'yes') summaryParts.push('Braille signage');
  
  const summary = summaryParts.length > 0 
    ? summaryParts.join(', ') 
    : 'Accessibility features available';

  return {
    id: `${type}_${id}`,
    name: tags.name || tags.amenity || tags.highway || 'Unnamed Location',
    lat: lat || (element.center && element.center.lat),
    lng: lon || (element.center && element.center.lon),
    summary,
    accessibilityType: accessibilityTypes.length > 0 ? accessibilityTypes : ['wheelchair'],
    osmId: id,
    osmType: type,
    tags
  };
};

/**
 * Fetch accessible places from Overpass API
 * @param {Object} bounds - Bounding box coordinates
 * @param {Array} filterTypes - Types of accessibility features to fetch
 * @returns {Promise<Array>} Array of accessible places
 */
export const fetchAccessiblePlaces = async (bounds, filterTypes = ['wheelchair']) => {
  const queries = [];
  
  // Generate queries based on requested filter types
  if (filterTypes.includes('wheelchair')) {
    queries.push(generateWheelchairQuery(bounds));
  }
  
  if (filterTypes.includes('toilet')) {
    queries.push(generateToiletQuery(bounds));
  }
  
  if (filterTypes.includes('elevator')) {
    queries.push(generateElevatorQuery(bounds));
  }
  
  if (filterTypes.includes('tactile')) {
    queries.push(generateTactilePavingQuery(bounds));
  }

  try {
    // Execute all queries in parallel
    const responses = await Promise.all(
      queries.map(query => executeQuery(query))
    );

    // Combine and transform results
    const allElements = [];
    responses.forEach(response => {
      if (response.elements) {
        allElements.push(...response.elements);
      }
    });

    // Transform elements to our format and filter out invalid ones
    const places = allElements
      .map(transformOSMElement)
      .filter(place => place.lat && place.lng && place.accessibilityType.length > 0);

    // Remove duplicates based on coordinates and name
    const uniquePlaces = places.filter((place, index, self) => 
      index === self.findIndex(p => 
        p.lat === place.lat && 
        p.lng === place.lng && 
        p.name === place.name
      )
    );

    return uniquePlaces;
  } catch (error) {
    console.error('Error fetching accessible places:', error);
    throw error;
  }
};

/**
 * Get bounding box from map bounds
 * @param {Object} mapBounds - Leaflet map bounds
 * @returns {Object} Bounding box coordinates
 */
export const getBoundingBox = (mapBounds) => {
  const southWest = mapBounds.getSouthWest();
  const northEast = mapBounds.getNorthEast();
  
  return {
    south: southWest.lat,
    west: southWest.lng,
    north: northEast.lat,
    east: northEast.lng
  };
};

/**
 * Get bounding box from center point and radius (in km)
 * @param {number} lat - Center latitude
 * @param {number} lng - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Object} Bounding box coordinates
 */
export const getBoundingBoxFromCenter = (lat, lng, radiusKm = 5) => {
  // Approximate conversion: 1 degree ≈ 111 km
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  
  return {
    south: lat - latDelta,
    north: lat + latDelta,
    west: lng - lngDelta,
    east: lng + lngDelta
  };
};
