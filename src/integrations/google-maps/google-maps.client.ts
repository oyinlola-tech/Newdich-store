export class GoogleMapsClient {
  constructor(private readonly apiKey: string) {}

  async geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address);
    url.searchParams.set('key', this.apiKey);

    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as {
      status: string;
      results?: Array<{ geometry: { location: { lat: number; lng: number } } }>;
    };

    if (body.status !== 'OK' || !body.results?.length) {
      return null;
    }

    const location = body.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  }
}
