// Retrieve API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Function to validate and return the API key
export function getGoogleMapsApiKey(): string {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not defined in environment variables');
  }
  return GOOGLE_MAPS_API_KEY;
}

// Function to create a URL with API key for Google Maps services
export function createGoogleMapsUrl(endpoint: string, params: Record<string, string> = {}): string {
  const baseUrl = `https://maps.googleapis.com/maps/api/${endpoint}`;
  const queryParams = new URLSearchParams({
    ...params,
    key: getGoogleMapsApiKey(),
  });
  
  return `${baseUrl}?${queryParams.toString()}`;
}

// Add any other configuration constants you need
export const MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: 40.7128,
    lng: -74.0060
  },
  DEFAULT_ZOOM: 13,
  SAFETY_SEARCH_RADIUS: 1500, // meters
};