import { api } from '@/lib/api';
import { FareEstimate, RideRequest, Driver, CreateRideData } from '@/types/ride';

export class RideService {
  // Get fare estimate
  static async getFareEstimate(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
    vehicleType: string
  ): Promise<FareEstimate> {
    const response = await api.post('/rides/fare-estimate', {
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      vehicleType
    });

    return response.data.data;
  }

  // Create ride request
  static async createRideRequest(rideData: CreateRideData): Promise<RideRequest> {
    const response = await api.post('/rides/request', rideData);
    return response.data.data.rideRequest;
  }

  // Get available drivers
  static async getAvailableDrivers(
    lat: number,
    lng: number,
    vehicleType: string,
    radius: number = 5
  ): Promise<Driver[]> {
    const response = await api.get('/rides/drivers/available', {
      params: { lat, lng, vehicleType, radius }
    });

    return response.data.data.drivers;
  }

  // Get ride request details
  static async getRideRequest(rideId: string): Promise<RideRequest> {
    const response = await api.get(`/rides/request/${rideId}`);
    return response.data.data.ride;
  }

  // Cancel ride request
  static async cancelRideRequest(rideId: string, reason?: string): Promise<RideRequest> {
    const response = await api.put(`/rides/request/${rideId}/cancel`, {
      reason
    });

    return response.data.data;
  }

  // Get user's ride history
  static async getRideHistory(): Promise<RideRequest[]> {
    const response = await api.get('/rides/history');
    return response.data.data.rides;
  }
}
