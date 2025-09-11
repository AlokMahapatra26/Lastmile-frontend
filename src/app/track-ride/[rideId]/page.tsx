'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import LocationInput from '@/components/LocationInput';
import RideVehicleSelection from '@/components/VehicleSelection';
import RideMap from '@/components/Map/RideMap';
import { RideService } from '@/services/rideService';
import { LocationResult } from '@/services/locationService';
import { VehicleType, FareEstimate, Driver } from '@/types/ride';
import { ArrowLeft, MapPin, Navigation, Map, AlertCircle } from 'lucide-react';

export default function BookRidePage() {
  const [pickupLocation, setPickupLocation] = useState<LocationResult | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationResult | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [fareEstimates, setFareEstimates] = useState<{ [key in VehicleType]?: FareEstimate }>({});
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [riderNotes, setRiderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fareLoading, setFareLoading] = useState(false);
  const [driversLoading, setDriversLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const router = useRouter();
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'rider') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      calculateFareEstimates();
    } else {
      setFareEstimates({});
      setSelectedVehicle(null);
      setAvailableDrivers([]);
      setApiError(null);
    }
  }, [pickupLocation, dropoffLocation]);

  useEffect(() => {
    if (pickupLocation && selectedVehicle) {
      fetchAvailableDrivers();
    }
  }, [pickupLocation, selectedVehicle]);

  // Test backend connection
  const testBackendConnection = async (): Promise<boolean> => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch('http://localhost:8000/api/health');
      
      if (response.ok) {
        console.log('Backend connection successful');
        return true;
      } else {
        console.error('Backend responded with error:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  };

  const calculateFareEstimates = async () => {
    if (!pickupLocation || !dropoffLocation) return;

    setFareLoading(true);
    setFareEstimates({});
    setSelectedVehicle(null);
    setApiError(null);

    // First test backend connection
    const backendAvailable = await testBackendConnection();
    
    if (!backendAvailable) {
      setApiError('Backend server is not running. Please start your backend server on http://localhost:5000');
      setFareLoading(false);
      
      // Show mock fare estimates for testing
      const mockEstimates = getMockFareEstimates(pickupLocation, dropoffLocation);
      setFareEstimates(mockEstimates);
      setSelectedVehicle('auto');
      return;
    }

    const vehicleTypes: VehicleType[] = ['auto', 'bike', 'cycle', 'car'];

    try {
      console.log('Calculating fare estimates for:', {
        pickup: `${pickupLocation.latitude}, ${pickupLocation.longitude}`,
        dropoff: `${dropoffLocation.latitude}, ${dropoffLocation.longitude}`
      });

      const estimates = await Promise.allSettled(
        vehicleTypes.map(async (vehicleType) => {
          try {
            console.log(`Requesting fare estimate for ${vehicleType}...`);
            
            const estimate = await RideService.getFareEstimate(
              pickupLocation.latitude,
              pickupLocation.longitude,
              dropoffLocation.latitude,
              dropoffLocation.longitude,
              vehicleType
            );
            
            console.log(`Fare estimate for ${vehicleType}:`, estimate);
            return { vehicleType, estimate };
          } catch (error) {
            console.error(`Error calculating fare for ${vehicleType}:`, error);
            throw error;
          }
        })
      );

      const newFareEstimates: { [key in VehicleType]?: FareEstimate } = {};
      let successCount = 0;
      const errors: string[] = [];

      estimates.forEach((result, index) => {
        const vehicleType = vehicleTypes[index];
        if (result.status === 'fulfilled') {
          const { estimate } = result.value;
          newFareEstimates[vehicleType] = estimate;
          successCount++;
          console.log(`✅ ${vehicleType}: ₹${estimate.estimatedFare}`);
        } else {
          console.error(`❌ ${vehicleType}:`, result.reason?.message || result.reason);
          errors.push(`${vehicleType}: ${result.reason?.message || 'Unknown error'}`);
        }
      });

      if (successCount === 0) {
        console.error('All fare estimates failed:', errors);
        setApiError(`Failed to get fare estimates: ${errors.join(', ')}`);
        
        // Show mock estimates as fallback
        const mockEstimates = getMockFareEstimates(pickupLocation, dropoffLocation);
        setFareEstimates(mockEstimates);
        setSelectedVehicle('auto');
        
        toast.info("mock data")
        return;
      }

      setFareEstimates(newFareEstimates);

      // Auto-select the first available vehicle type
      const firstAvailableType = vehicleTypes.find(type => newFareEstimates[type]);
      if (firstAvailableType) {
        setSelectedVehicle(firstAvailableType);
      }

      console.log('✅ Fare estimates calculated successfully:', newFareEstimates);

    } catch (error) {
      console.error('Error in calculateFareEstimates:', error);
      setApiError(`Fare calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Show mock estimates as fallback
      const mockEstimates = getMockFareEstimates(pickupLocation, dropoffLocation);
      setFareEstimates(mockEstimates);
      setSelectedVehicle('auto');
      
      toast.error("Failed to calculate fare estimates. Using sample data.")
    } finally {
      setFareLoading(false);
    }
  };

  // Mock fare estimates for testing when backend is down
  const getMockFareEstimates = (pickup: LocationResult, dropoff: LocationResult): { [key in VehicleType]: FareEstimate } => {
    // Calculate simple distance
    const distance = Math.sqrt(
      Math.pow(dropoff.latitude - pickup.latitude, 2) + 
      Math.pow(dropoff.longitude - pickup.longitude, 2)
    ) * 111; // Rough km conversion

    const duration = Math.max(5, Math.round(distance * 2));

    return {
      auto: {
        vehicleType: 'auto',
        estimatedDistance: distance,
        estimatedDuration: duration,
        estimatedFare: Math.round((25 + distance * 8 + duration * 1.5) * 100) / 100,
        baseFare: '25',
        perKmRate: '8',
        perMinuteRate: '1.5',
        surgePricing: '1.0'
      },
      bike: {
        vehicleType: 'bike',
        estimatedDistance: distance,
        estimatedDuration: Math.round(duration * 0.8),
        estimatedFare: Math.round((15 + distance * 5 + duration * 1.0) * 100) / 100,
        baseFare: '15',
        perKmRate: '5',
        perMinuteRate: '1.0',
        surgePricing: '1.0'
      },
      cycle: {
        vehicleType: 'cycle',
        estimatedDistance: distance,
        estimatedDuration: Math.round(duration * 1.5),
        estimatedFare: Math.round((10 + distance * 3 + duration * 0.5) * 100) / 100,
        baseFare: '10',
        perKmRate: '3',
        perMinuteRate: '0.5',
        surgePricing: '1.0'
      },
      car: {
        vehicleType: 'car',
        estimatedDistance: distance,
        estimatedDuration: duration,
        estimatedFare: Math.round((40 + distance * 12 + duration * 2.0) * 100) / 100,
        baseFare: '40',
        perKmRate: '12',
        perMinuteRate: '2.0',
        surgePricing: '1.0'
      }
    };
  };

  const fetchAvailableDrivers = async () => {
    if (!pickupLocation || !selectedVehicle) return;

    setDriversLoading(true);
    try {
      const drivers = await RideService.getAvailableDrivers(
        pickupLocation.latitude,
        pickupLocation.longitude,
        selectedVehicle
      );
      setAvailableDrivers(drivers);
      console.log('✅ Found drivers:', drivers.length);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      
      // Mock drivers for testing
      const mockDrivers = generateMockDrivers(pickupLocation, selectedVehicle);
      setAvailableDrivers(mockDrivers);
    } finally {
      setDriversLoading(false);
    }
  };

  // Generate mock drivers for testing
  const generateMockDrivers = (location: LocationResult, vehicleType: VehicleType): Driver[] => {
    return [
      {
        driverId: 'mock_driver_1',
        latitude: (location.latitude + 0.01).toString(),
        longitude: (location.longitude + 0.01).toString(),
        distance: 1.2,
        estimatedArrival: 3,
        driverInfo: {
          vehicleType: vehicleType,
          vehicleModel: vehicleType === 'car' ? 'Honda City' : vehicleType === 'auto' ? 'Bajaj Auto' : 'Honda Activa',
          vehiclePlate: 'DL 01 AB 1234',
          rating: '4.8',
          isVerified: true
        },
        profile: {
          fullName: 'Rajesh Kumar',
          profileImage: undefined
        }
      },
      {
        driverId: 'mock_driver_2',
        latitude: (location.latitude - 0.015).toString(),
        longitude: (location.longitude + 0.008).toString(),
        distance: 2.1,
        estimatedArrival: 5,
        driverInfo: {
          vehicleType: vehicleType,
          vehicleModel: vehicleType === 'car' ? 'Maruti Swift' : vehicleType === 'auto' ? 'TVS Auto' : 'Hero Splendor',
          vehiclePlate: 'DL 02 CD 5678',
          rating: '4.6',
          isVerified: true
        },
        profile: {
          fullName: 'Amit Singh',
          profileImage: undefined
        }
      }
    ];
  };

  const handleBookRide = async () => {
    if (!pickupLocation || !dropoffLocation || !selectedVehicle) {
     toast.error("missing information")
      return;
    }

    setBookingLoading(true);

    try {
      const rideRequest = await RideService.createRideRequest({
        pickupAddress: pickupLocation.address,
        pickupLat: pickupLocation.latitude,
        pickupLng: pickupLocation.longitude,
        dropoffAddress: dropoffLocation.address,
        dropoffLat: dropoffLocation.latitude,
        dropoffLng: dropoffLocation.longitude,
        vehicleType: selectedVehicle,
        paymentMethod,
        riderNotes: riderNotes || undefined,
      });

      toast.success('Ride request created successfully!');

      router.push(`/track-ride/${rideRequest.id}`);

    } catch (error: any) {
      console.error('Booking error:', error);
      
      // For demo purposes, still redirect to tracking with mock ID
      const mockRideId = `mock_ride_${Date.now()}`;
      
     toast.success("demo mode")
      
      router.push(`/track-ride/${mockRideId}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const swapLocations = () => {
    if (pickupLocation && dropoffLocation) {
      const temp = pickupLocation;
      setPickupLocation(dropoffLocation);
      setDropoffLocation(temp);
    }
  };

  if (!isAuthenticated || user?.role !== 'rider') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Book a Ride</h1>
            {apiError && (
              <div className="flex items-center text-orange-600 text-sm bg-orange-50 px-2 py-1 rounded">
                <AlertCircle className="w-4 h-4 mr-1" />
                Demo Mode
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* API Error Warning */}
        {apiError && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Demo Mode Active</h4>
                  <p className="text-sm text-orange-700 mt-1">{apiError}</p>
                  <p className="text-xs text-orange-600 mt-2">
                    💡 To fix this, make sure your backend server is running with: <code className="bg-orange-100 px-1 rounded">npm run dev</code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Location Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Where to?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pickup">Pickup Location</Label>
                  <LocationInput
                    placeholder="Enter pickup location"
                    value={pickupLocation}
                    onChange={setPickupLocation}
                    showCurrentLocation={true}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={swapLocations}
                    disabled={!pickupLocation || !dropoffLocation}
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <Label htmlFor="dropoff">Dropoff Location</Label>
                  <LocationInput
                    placeholder="Where are you going?"
                    value={dropoffLocation}
                    onChange={setDropoffLocation}
                    showCurrentLocation={false}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Selection */}
            {pickupLocation && dropoffLocation && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose Vehicle</CardTitle>
                  {apiError && (
                    <p className="text-sm text-orange-600">Using sample fare estimates</p>
                  )}
                </CardHeader>
                <CardContent>
                  <RideVehicleSelection
                    selectedVehicle={selectedVehicle}
                    onVehicleSelect={setSelectedVehicle}
                    fareEstimates={fareEstimates}
                    loading={fareLoading}
                    onBookRide={handleBookRide}
                    bookingLoading={bookingLoading}
                  />
                </CardContent>
              </Card>
            )}

            {/* Additional Options */}
            {selectedVehicle && fareEstimates[selectedVehicle] && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="payment">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="wallet">Digital Wallet</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Special Instructions (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions for the driver..."
                      value={riderNotes}
                      onChange={(e) => setRiderNotes(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Map */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Map className="w-5 h-5 mr-2" />
                  Live Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <RideMap
                  pickupLocation={pickupLocation}
                  dropoffLocation={dropoffLocation}
                  drivers={availableDrivers}
                  showRoute={true}
                  height="500px"
                />
              </CardContent>
            </Card>

            {/* Available Drivers */}
            {availableDrivers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Available Drivers ({availableDrivers.length})
                    {apiError && <span className="text-sm text-orange-600 font-normal"> (Sample Data)</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {availableDrivers.map((driver, index) => (
                      <div
                        key={driver.driverId}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{driver.profile.fullName}</p>
                            <p className="text-sm text-gray-600">
                              {driver.driverInfo.vehicleModel} • {driver.driverInfo.vehiclePlate}
                            </p>
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-400 text-sm">★</span>
                              <span className="text-sm">{driver.driverInfo.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{driver.distance.toFixed(1)} km</p>
                          <p className="text-xs text-gray-500">{driver.estimatedArrival} min</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {driversLoading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Finding drivers...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
