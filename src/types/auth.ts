export type UserRole = 'rider' | 'driver';
export type VehicleType = 'auto' | 'cycle' | 'car' | 'bike';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isEmailVerified: boolean;
  email_confirmed_at?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleInfo {
  type: VehicleType;
  model: string;
  plate: string;
  color?: string;
  license: string;
  preferredType?: VehicleType;
}

export interface DriverInfo {
  id: string;
  userId: string;
  licenseNumber: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor?: string;
  rating: string;
  totalRides: number;
  isOnline: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface RiderInfo {
  id: string;
  userId: string;
  preferredVehicleType?: VehicleType;
  rating: string;
  totalRides: number;
  createdAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  vehicleInfo?: VehicleInfo;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  profile: Profile;
  driverInfo?: DriverInfo;
  riderInfo?: RiderInfo;
  emailSent?: boolean;
}
