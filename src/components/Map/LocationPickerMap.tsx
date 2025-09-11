'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationResult, locationService } from '@/services/locationService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerMapProps {
  onLocationSelect: (location: LocationResult) => void;
  initialLocation?: LocationResult | null;
  height?: string;
}

function LocationClickHandler({ onLocationSelect }: { onLocationSelect: (location: LocationResult) => void }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        // Reverse geocode the clicked location
        const address = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        )
          .then(res => res.json())
          .then(data => data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);

        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address
        });
      } catch (error) {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        });
      }
    }
  });

  return null;
}

function LocationPickerMapComponent({
  onLocationSelect,
  initialLocation,
  height = '400px'
}: LocationPickerMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(initialLocation || null);
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setCenter([initialLocation.latitude, initialLocation.longitude]);
    } else {
      // Try to get user's current location
      getCurrentLocation();
    }
  }, [initialLocation]);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await locationService.getCurrentLocation();
      setCenter([location.latitude, location.longitude]);
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-sm text-gray-600 mb-2">
          Click on the map to select a location
        </p>
        {selectedLocation && (
          <div className="text-sm">
            <strong>Selected:</strong> {selectedLocation.address}
          </div>
        )}
      </Card>

      <div style={{ height }} className="relative">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationClickHandler onLocationSelect={handleLocationSelect} />

          {selectedLocation && (
            <Marker
              position={[selectedLocation.latitude, selectedLocation.longitude]}
            />
          )}
        </MapContainer>

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg z-[1000]">
            <div className="bg-white p-3 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={getCurrentLocation}
          disabled={loading}
          variant="outline"
          className="flex-1"
        >
          Use Current Location
        </Button>
      </div>
    </div>
  );
}

const LocationPickerMap = dynamic(() => Promise.resolve(LocationPickerMapComponent), {
  ssr: false,
  loading: () => (
    <div 
      className="bg-gray-100 rounded-lg flex items-center justify-center"
      style={{ height: '400px' }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

export default LocationPickerMap;
