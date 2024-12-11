interface LocationData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export class GeocodingService {
  /**
   * Fetches location data (latitude, longitude, city/town name) for a given zip code.
   *
   * @param zipCode The zip code to search for.
   * @returns A Promise that resolves to a LocationData object containing the location information.
   * @throws An error if the API request fails or if no matching location is found.
   */
  async getLocation(zipCode: string): Promise<LocationData> {
    // Use appropriate type for location data
    try {
      const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${zipCode}&count=10&language=en&format=json`;
      const geocodingResponse = await fetch(geocodingUrl);
      if (!geocodingResponse.ok) {
        throw new Error(
          `Geocoding API request failed with status ${geocodingResponse.status}`,
        );
      }
      const geocodingData = await geocodingResponse.json();

      // Find the first US result with the matching zip code
      const location = geocodingData.results.find(
        (result: { country_code: string; postcodes: string | string[] }) =>
          result.country_code === 'US' && result.postcodes.includes(zipCode),
      );
      if (!location) {
        throw new Error(`Location not found for zip code ${zipCode}`);
      }

      return location;
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw error;
    }
  }
}
