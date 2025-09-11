'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VehicleType, FareEstimate } from '@/types/ride';
import { Car, Bike, Zap, Clock, DollarSign } from 'lucide-react';

interface VehicleOption {
  type: VehicleType;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const vehicleOptions: VehicleOption[] = [
  {
    type: 'auto',
    name: 'Auto Rickshaw',
    description: 'Affordable rides for short distances',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200'
  },
  {
    type: 'bike',
    name: 'Motorcycle',
    description: 'Fast and convenient for solo rides',
    icon: Bike,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200'
  },
  {
    type: 'cycle',
    name: 'Bicycle',
    description: 'Eco-friendly rides for short distances',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200'
  },
  {
    type: 'car',
    name: 'Car',
    description: 'Comfortable rides with AC',
    icon: Car,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200'
  },
];

interface RideVehicleSelectionProps {
  selectedVehicle: VehicleType | null;
  onVehicleSelect: (vehicleType: VehicleType) => void;
  fareEstimates?: { [key in VehicleType]?: FareEstimate } | null; // Made optional with null check
  loading?: boolean;
  onBookRide?: () => void;
  bookingLoading?: boolean;
}

export default function RideVehicleSelection({ 
  selectedVehicle, 
  onVehicleSelect, 
  fareEstimates = {}, // Default to empty object
  loading = false,
  onBookRide,
  bookingLoading = false
}: RideVehicleSelectionProps) {
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Ride</h3>
        <p className="text-sm text-gray-600">
          Select a vehicle type and see fare estimates
        </p>
      </div>

      <div className="space-y-3">
        {vehicleOptions.map((vehicle) => {
          const IconComponent = vehicle.icon;
          const isSelected = selectedVehicle === vehicle.type;
          // Safe access to fareEstimates with null checks
          const fareEstimate = fareEstimates && fareEstimates[vehicle.type] ? fareEstimates[vehicle.type] : null;
          
          return (
            <Card 
              key={vehicle.type}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? `ring-2 ring-blue-500 ${vehicle.bgColor}` 
                  : 'hover:shadow-md border-gray-200'
              } ${loading ? 'opacity-50' : ''}`}
              onClick={() => !loading && onVehicleSelect(vehicle.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        isSelected ? 'text-white' : vehicle.color
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{vehicle.name}</h4>
                      <p className="text-sm text-gray-500">{vehicle.description}</p>
                      {fareEstimate && (
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <Clock className="w-3 h-3 mr-1" />
                            {fareEstimate.estimatedDuration} min
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <span>📍</span>
                            <span className="ml-1">{fareEstimate.estimatedDistance.toFixed(1)} km</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {loading && !fareEstimate ? (
                      <div className="animate-pulse">
                        <div className="h-6 w-16 bg-gray-200 rounded mb-1"></div>
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
                      </div>
                    ) : fareEstimate ? (
                      <>
                        <div className="text-lg font-bold text-green-600">
                          ₹{fareEstimate.estimatedFare}
                        </div>
                        {parseFloat(fareEstimate.surgePricing) > 1 && (
                          <Badge variant="destructive" className="text-xs">
                            {fareEstimate.surgePricing}x Surge
                          </Badge>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-400">
                        {loading ? 'Loading...' : 'Select for price'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedVehicle && fareEstimates && fareEstimates[selectedVehicle] && onBookRide && (
        <div className="pt-4 border-t">
          <Button 
            onClick={onBookRide}
            disabled={bookingLoading}
            className="w-full h-12 text-lg font-medium"
          >
            {bookingLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Booking Ride...</span>
              </div>
            ) : (
              `Book ${vehicleOptions.find(v => v.type === selectedVehicle)?.name} - ₹${fareEstimates[selectedVehicle]?.estimatedFare}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
