export type RideStatus = 'searching' | 'driver_assigned' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type VehicleType = 'auto' | 'bike' | 'cycle' | 'car';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface FareEstimate {
  vehicleType: VehicleType;
  estimatedDistance: number;
  estimatedDuration: number;
  estimatedFare: number;
  baseFare: string;
  perKmRate: string;
  perMinuteRate: string;
  surgePricing: string;
}

export interface RideRequest {
  id: string;
  riderId: string;
  pickupAddress: string;
  pickupLatitude: string;
  pickupLongitude: string;
  dropoffAddress: string;
  dropoffLatitude: string;
  dropoffLongitude: string;
  vehicleType: VehicleType;
  estimatedDistance: string;
  estimatedDuration: number;
  estimatedFare: string;
  status: RideStatus;
  driverId?: string;
  actualFare?: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  riderNotes?: string;
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface Driver {
  driverId: string;
  latitude: string;
  longitude: string;
  distance: number;
  estimatedArrival: number;
  driverInfo: {
    vehicleType: VehicleType;
    vehicleModel: string;
    vehiclePlate: string;
    rating: string;
    isVerified: boolean;
  };
  profile: {
    fullName: string;
    profileImage?: string;
  };
}

export interface CreateRideData {
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  vehicleType: VehicleType;
  paymentMethod?: string;
  riderNotes?: string;
}
