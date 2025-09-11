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
import { ArrowLeft, MapPin, Navigation, Map } from 'lucide-react';

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
    }
  }, [pickupLocation, dropoffLocation]);

  useEffect(() => {
    if (pickupLocation && selectedVehicle) {
      fetchAvailableDrivers();
    }
  }, [pickupLocation, selectedVehicle]);

  const calculateFareEstimates = async () => {
    if (!pickupLocation || !dropoffLocation) return;

    setFareLoading(true);
    setFareEstimates({});
    setSelectedVehicle(null);

    const vehicleTypes: VehicleType[] = ['auto', 'bike', 'cycle', 'car'];

    try {
      const estimates = await Promise.allSettled(
        vehicleTypes.map(async (vehicleType) => {
          const estimate = await RideService.getFareEstimate(
            pickupLocation.latitude,
            pickupLocation.longitude,
            dropoffLocation.latitude,
            dropoffLocation.longitude,
            vehicleType
          );
          return { vehicleType, estimate };
        })
      );

      const newFareEstimates: { [key in VehicleType]?: FareEstimate } = {};
      let successCount = 0;

      estimates.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { vehicleType, estimate } = result.value;
          newFareEstimates[vehicleType] = estimate;
          successCount++;
        }
      });

      if (successCount === 0) {
        throw new Error('Failed to calculate fare estimates');
      }

      setFareEstimates(newFareEstimates);

      // Auto-select the first available vehicle type
      const firstAvailableType = vehicleTypes.find(type => newFareEstimates[type]);
      if (firstAvailableType) {
        setSelectedVehicle(firstAvailableType);
      }

    } catch (error) {
      console.error('Error calculating fare estimates:', error);
      toast.error('Failed to calculate fare estimates. Please try again.');
    } finally {
      setFareLoading(false);
    }
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
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setAvailableDrivers([]);
    } finally {
      setDriversLoading(false);
    }
  };

  const handleBookRide = async () => {
    if (!pickupLocation || !dropoffLocation || !selectedVehicle) {
        toast.error('Please select pickup, dropoff locations and vehicle type.');
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
      toast.error(error?.response?.data?.message || 'Failed to book ride. Please try again.');
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
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
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
