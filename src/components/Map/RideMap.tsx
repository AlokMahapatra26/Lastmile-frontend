'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationResult } from '@/services/locationService';
import { Driver } from '@/types/ride';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RideMapProps {
  pickupLocation?: LocationResult | null;
  dropoffLocation?: LocationResult | null;
  drivers?: Driver[];
  showRoute?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
}

// Route service configurations
interface RouteService {
  name: string;
  getRoute: (pickup: LocationResult, dropoff: LocationResult) => Promise<[number, number][]>;
}

const routingServices: RouteService[] = [
  // Service 1: Simple straight line (always works as fallback)
  {
    name: 'Direct Line',
    getRoute: async (pickup: LocationResult, dropoff: LocationResult) => {
      // Create a simple route with intermediate points for better visualization
      const steps = 10;
      const route: [number, number][] = [];
      
      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const lat = pickup.latitude + (dropoff.latitude - pickup.latitude) * ratio;
        const lng = pickup.longitude + (dropoff.longitude - pickup.longitude) * ratio;
        route.push([lat, lng]);
      }
      
      return route;
    }
  },
  // Service 2: OSRM Demo Server (free, no API key)
  {
    name: 'OSRM',
    getRoute: async (pickup: LocationResult, dropoff: LocationResult) => {
      const url = `https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${dropoff.longitude},${dropoff.latitude}?overview=full&geometries=geojson`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`OSRM API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes[0] && data.routes[0].geometry) {
        const coordinates = data.routes[0].geometry.coordinates;
        return coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
      }
      
      throw new Error('No route found in OSRM response');
    }
  },
  // Service 3: GraphHopper (has free tier)
  {
    name: 'GraphHopper',
    getRoute: async (pickup: LocationResult, dropoff: LocationResult) => {
      // Using GraphHopper's public demo API (limited)
      const url = `https://graphhopper.com/api/1/route?point=${pickup.latitude},${pickup.longitude}&point=${dropoff.latitude},${dropoff.longitude}&vehicle=car&locale=en&calc_points=true&key=`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`GraphHopper API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.paths && data.paths[0] && data.paths[0].points) {
        // Decode GraphHopper polyline (simplified)
        const coordinates = data.paths[0].points.coordinates;
        return coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
      }
      
      throw new Error('No route found in GraphHopper response');
    }
  }
];

// Map update component to handle center changes
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useRef<L.Map>(null);
  
  useEffect(() => {
    if (map.current) {
      map.current.setView(center, zoom);
    }
  }, [center, zoom]);

  return null;
}

function RideMapComponent({
  pickupLocation,
  dropoffLocation,
  drivers = [],
  showRoute = true,
  center = [28.6139, 77.2090], // Default to Delhi
  zoom = 13,
  height = '400px',
  className = ''
}: RideMapProps) {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<L.Map>(null);

  // Calculate map bounds to fit all markers
  const calculateBounds = () => {
    const points: [number, number][] = [];
    
    if (pickupLocation) {
      points.push([pickupLocation.latitude, pickupLocation.longitude]);
    }
    if (dropoffLocation) {
      points.push([dropoffLocation.latitude, dropoffLocation.longitude]);
    }
    drivers.forEach(driver => {
      points.push([parseFloat(driver.latitude), parseFloat(driver.longitude)]);
    });

    if (points.length === 0) return { center, zoom };

    if (points.length === 1) {
      return { center: points[0], zoom: 15 };
    }

    // Calculate center and appropriate zoom
    const latitudes = points.map(p => p[0]);
    const longitudes = points.map(p => p[1]);
    
    const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
    const centerLng = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
    
    // Calculate distance to determine zoom level
    const latDiff = Math.max(...latitudes) - Math.min(...latitudes);
    const lngDiff = Math.max(...longitudes) - Math.min(...longitudes);
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let calculatedZoom = 15;
    if (maxDiff > 0.5) calculatedZoom = 10;
    else if (maxDiff > 0.1) calculatedZoom = 12;
    else if (maxDiff > 0.05) calculatedZoom = 13;
    else if (maxDiff > 0.01) calculatedZoom = 14;

    return {
      center: [centerLat, centerLng] as [number, number],
      zoom: calculatedZoom
    };
  };

  // Fetch route between pickup and dropoff
  useEffect(() => {
    if (pickupLocation && dropoffLocation && showRoute) {
      fetchRoute();
    } else {
      setRoute([]);
      setRouteInfo('');
    }
  }, [pickupLocation, dropoffLocation, showRoute]);

  const fetchRoute = async () => {
    if (!pickupLocation || !dropoffLocation) return;

    setLoading(true);
    setRouteInfo('Finding route...');

    // Try each routing service until one works
    for (const service of routingServices) {
      try {
        console.log(`Trying ${service.name} routing service...`);
        
        const routePoints = await service.getRoute(pickupLocation, dropoffLocation);
        
        if (routePoints && routePoints.length > 0) {
          setRoute(routePoints);
          setRouteInfo(`Route via ${service.name}`);
          console.log(`Successfully got route from ${service.name}`);
          break;
        }
      } catch (error) {
        console.warn(`${service.name} routing failed:`, error);
        
        // If this is the last service (Direct Line), it should always work
        if (service.name === 'Direct Line') {
          setRoute([
            [pickupLocation.latitude, pickupLocation.longitude],
            [dropoffLocation.latitude, dropoffLocation.longitude]
          ]);
          setRouteInfo('Direct route');
        }
        continue;
      }
    }

    setLoading(false);
  };

  const { center: mapCenter, zoom: mapZoom } = calculateBounds();

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={mapCenter} zoom={mapZoom} />

        {/* Pickup Location Marker */}
        {pickupLocation && (
          <Marker
            position={[pickupLocation.latitude, pickupLocation.longitude]}
            icon={pickupIcon}
          >
            <Popup>
              <div className="text-center">
                <strong className="text-green-600">Pickup Location</strong>
                <br />
                <span className="text-sm">{pickupLocation.address}</span>
                <br />
                <span className="text-xs text-gray-500">
                  {pickupLocation.latitude.toFixed(4)}, {pickupLocation.longitude.toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Location Marker */}
        {dropoffLocation && (
          <Marker
            position={[dropoffLocation.latitude, dropoffLocation.longitude]}
            icon={dropoffIcon}
          >
            <Popup>
              <div className="text-center">
                <strong className="text-red-600">Dropoff Location</strong>
                <br />
                <span className="text-sm">{dropoffLocation.address}</span>
                <br />
                <span className="text-xs text-gray-500">
                  {dropoffLocation.latitude.toFixed(4)}, {dropoffLocation.longitude.toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Driver Markers */}
        {drivers.map((driver) => (
          <Marker
            key={driver.driverId}
            position={[parseFloat(driver.latitude), parseFloat(driver.longitude)]}
            icon={driverIcon}
          >
            <Popup>
              <div className="text-center min-w-[200px]">
                <strong className="text-blue-600">{driver.profile.fullName}</strong>
                <br />
                <span className="text-sm font-medium">
                  {driver.driverInfo.vehicleModel}
                </span>
                <br />
                <span className="text-sm text-gray-600">
                  {driver.driverInfo.vehiclePlate}
                </span>
                <br />
                <span className="text-xs text-gray-500">
                  {driver.distance.toFixed(1)}km away • {driver.estimatedArrival} min ETA
                </span>
                <br />
                <div className="flex items-center justify-center mt-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm ml-1">{driver.driverInfo.rating}</span>
                  {driver.driverInfo.isVerified && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 rounded">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Line */}
        {route.length > 1 && (
          <Polyline
            positions={route}
            color="#3B82F6"
            weight={4}
            opacity={0.7}
            smoothFactor={1}
          />
        )}
      </MapContainer>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg z-[1000]">
          <div className="bg-white p-3 rounded-lg shadow-lg flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">Loading route...</span>
          </div>
        </div>
      )}

      {/* Route info */}
      {routeInfo && !loading && (
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600 z-[1000]">
          {routeInfo}
        </div>
      )}

      {/* Map controls info */}
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-500 z-[1000]">
        <div>🟢 Pickup 🔴 Dropoff 🔵 Drivers</div>
      </div>
    </div>
  );
}

// Dynamic import to avoid SSR issues
const RideMap = dynamic(() => Promise.resolve(RideMapComponent), {
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

export default RideMap;
