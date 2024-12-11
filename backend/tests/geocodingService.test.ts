import { GeocodingService } from '../src/services/geocodingService';

describe('GeocodingService', () => {
  let service: GeocodingService;

  beforeEach(() => {
    service = new GeocodingService();
  });

  it('should fetch location data for a given zip code', async () => {
    const zipCode = '10001';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 12345,
            name: 'New York',
            latitude: 40.7128,
            longitude: -74.006,
            elevation: 10,
            feature_code: 'PPL',
            country_code: 'US',
            admin1_id: 6252001,
            timezone: 'America/New_York',
            population: 8405837,
            postcodes: ['10001'],
            country_id: 6252001,
            country: 'United States',
            admin1: 'New York',
          },
        ],
      }),
    }) as jest.Mock;

    const locationData = await service.getLocation(zipCode);

    expect(locationData).toBeDefined();
    expect(locationData.id).toBe(12345);
    expect(locationData.name).toBe('New York');
    expect(locationData.latitude).toBe(40.7128);
    expect(locationData.longitude).toBe(-74.006);
    // Add more assertions for other properties as needed
  });

  it('should throw an error if the API request fails', async () => {
    const zipCode = '10001';
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 500 }),
    ) as jest.Mock;
    await expect(service.getLocation(zipCode)).rejects.toThrow(
      'Geocoding API request failed with status 500',
    );
  });

  it('should throw an error if the location is not found', async () => {
    const zipCode = '10001';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [],
      }),
    }) as jest.Mock;
    await expect(service.getLocation(zipCode)).rejects.toThrow(
      `Location not found for zip code ${zipCode}`,
    );
  });
});
