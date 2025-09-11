export interface LocationResult {
  latitude: number;
  longitude: number;
  address: string;
}

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Get current location
  async getCurrentLocation(): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position: GeolocationPosition) => {
          try {
            const address = await this.reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: address
            });
          } catch (error) {
            // Fallback to coordinates if address lookup fails
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            });
          }
        },
        (error) => {
          // Provide a default location if geolocation fails (you can change this to your city)
          const defaultLocation = {
            latitude: 28.6139, // New Delhi coordinates
            longitude: 77.2090,
            address: 'New Delhi, India'
          };
          
          console.warn('Geolocation failed, using default location:', error.message);
          resolve(defaultLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  // Watch position changes
  watchPosition(callback: (location: LocationResult) => void): number {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    return navigator.geolocation.watchPosition(
      async (position: GeolocationPosition) => {
        try {
          const address = await this.reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: address
          });
        } catch (error) {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          });
        }
      },
      (error) => console.error('Location watch error:', error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000
      }
    );
  }

  // Stop watching position
  clearWatch(watchId: number): void {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  // Reverse geocoding (convert coordinates to address)
  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    const geocodingServices = [
      // Service 1: BigDataCloud (free, no API key required)
      {
        name: 'BigDataCloud',
        url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        parseResponse: (data: any) => {
          if (data.locality && data.locality !== 'null') {
            const parts = [];
            if (data.locality) parts.push(data.locality);
            if (data.city && data.city !== data.locality) parts.push(data.city);
            if (data.principalSubdivision) parts.push(data.principalSubdivision);
            if (data.countryName) parts.push(data.countryName);
            return parts.join(', ') || data.display_name;
          }
          return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
      },
      // Service 2: OpenStreetMap Nominatim (free, no API key required)
      {
        name: 'Nominatim',
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        parseResponse: (data: any) => {
          if (data.display_name) {
            return data.display_name;
          }
          if (data.address) {
            const addr = data.address;
            const parts = [];
            if (addr.house_number && addr.road) parts.push(`${addr.house_number} ${addr.road}`);
            else if (addr.road) parts.push(addr.road);
            if (addr.suburb) parts.push(addr.suburb);
            if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
            if (addr.state) parts.push(addr.state);
            if (addr.country) parts.push(addr.country);
            return parts.join(', ');
          }
          return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
      }
    ];

    // Try each service until one works
    for (const service of geocodingServices) {
      try {
        console.log(`Trying ${service.name} for reverse geocoding...`);
        
        const response = await fetch(service.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'RideApp/1.0'
          }
        });
        
        if (!response.ok) {
          console.warn(`${service.name} failed with status:`, response.status);
          continue;
        }

        const data = await response.json();
        const address = service.parseResponse(data);
        
        if (address && address.trim() !== '') {
          console.log(`${service.name} succeeded:`, address);
          return address;
        }
      } catch (error) {
        console.warn(`${service.name} error:`, error);
        continue;
      }
    }

    // If all services fail, return coordinates
    console.warn('All geocoding services failed, returning coordinates');
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  // Forward geocoding (convert address to coordinates) - Updated to use multiple services
  async geocodeAddress(address: string): Promise<LocationResult[]> {
    const geocodingServices = [
      // Service 1: Nominatim (OpenStreetMap) - Free, no API key
      {
        name: 'Nominatim',
        url: `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1&countrycodes=IN`, // Added country code for India
        parseResponse: (data: any[]) => {
          return data.map((item: any) => ({
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            address: item.display_name
          }));
        }
      },
      // Service 2: Photon (OpenStreetMap based) - Free, no API key
      {
        name: 'Photon',
        url: `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=5&lang=en`,
        parseResponse: (data: any) => {
          if (data.features) {
            return data.features.map((feature: any) => ({
              latitude: feature.geometry.coordinates[1],
              longitude: feature.geometry.coordinates[0],
              address: feature.properties.name + (feature.properties.city ? `, ${feature.properties.city}` : '') + (feature.properties.country ? `, ${feature.properties.country}` : '')
            }));
          }
          return [];
        }
      }
    ];

    // Try each service until one works
    for (const service of geocodingServices) {
      try {
        console.log(`Trying ${service.name} for forward geocoding...`);
        
        const response = await fetch(service.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'RideApp/1.0'
          }
        });
        
        if (!response.ok) {
          console.warn(`${service.name} failed with status:`, response.status);
          continue;
        }

        const data = await response.json();
        const results = service.parseResponse(data);
        
        if (results && results.length > 0) {
          console.log(`${service.name} found ${results.length} results`);
          return results;
        }
      } catch (error) {
        console.warn(`${service.name} error:`, error);
        continue;
      }
    }

    // If all services fail, return empty array
    console.warn('All forward geocoding services failed');
    return [];
  }

  // Calculate distance between two points (in km)
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get popular places/suggestions for a city (mock data for now)
  getPopularPlaces(city: string = 'Delhi'): LocationResult[] {
    const popularPlaces: { [key: string]: LocationResult[] } = {
      'Delhi': [
        { latitude: 28.6562, longitude: 77.2410, address: 'Red Fort, Delhi' },
        { latitude: 28.6129, longitude: 77.2295, address: 'India Gate, Delhi' },
        { latitude: 28.5562, longitude: 77.1000, address: 'IGI Airport, Delhi' },
        { latitude: 28.6507, longitude: 77.2334, address: 'Chandni Chowk, Delhi' },
        { latitude: 28.5355, longitude: 77.3910, address: 'Noida Sector 18' },
        { latitude: 28.4595, longitude: 77.0266, address: 'Gurgaon Cyber City' },
      ],
      'Mumbai': [
        { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai Central' },
        { latitude: 19.0896, longitude: 72.8656, address: 'Bandra West, Mumbai' },
        { latitude: 19.0330, longitude: 72.8397, address: 'Chhatrapati Shivaji Terminus' },
      ]
    };

    return popularPlaces[city] || popularPlaces['Delhi'];
  }
}

export const locationService = LocationService.getInstance();
