
interface GeocodingResult {
    display_name: string;
    lat: string;
    lon: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Searches for an address string and returns matches.
 * @param query The address to search for.
 */
export const searchAddress = async (query: string): Promise<GeocodingResult[]> => {
    if (!query || query.length < 3) return [];

    try {
        const response = await fetch(`${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        if (!response.ok) throw new Error('Geocoding fetch failed');
        return await response.json();
    } catch (error) {
        console.error("Geocoding error:", error);
        return [];
    }
};

/**
 * Converts coordinates to a human-readable address.
 * @param lat Latitude
 * @param lng Longitude
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (!response.ok) throw new Error('Reverse geocoding fetch failed');
        const data = await response.json();

        // Construct a shorter, cleaner address
        const addr = data.address;
        if (addr) {
            // Priority list for cleaner display name
            const street = addr.road || addr.pedestrian || addr.suburb || '';
            const city = addr.city || addr.town || addr.village || addr.county || '';
            return [street, city].filter(Boolean).join(', ');
        }
        return data.display_name;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
};
/**
 * Converts coordinates specifically to a city name.
 * @param lat Latitude
 * @param lng Longitude
 */
export const reverseGeocodeCity = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (!response.ok) throw new Error('Reverse geocoding fetch failed');
        const data = await response.json();
        const addr = data.address;
        if (addr) {
            return addr.city || addr.town || addr.village || addr.county || '';
        }
        return '';
    } catch (error) {
        console.error("Reverse geocoding city error:", error);
        return '';
    }
};
