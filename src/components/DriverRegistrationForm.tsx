'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VehicleSelection from './VehicleSelection';
import { VehicleType } from '@/types/auth';
import { Eye, EyeOff } from 'lucide-react';

const driverSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  licenseNumber: z.string().min(5, 'License number is required'),
  vehicleModel: z.string().min(2, 'Vehicle model is required'),
  vehiclePlate: z.string().min(4, 'Vehicle plate number is required'),
  vehicleColor: z.string().min(2, 'Vehicle color is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type DriverFormData = z.infer<typeof driverSchema>;

interface DriverRegistrationFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

export default function DriverRegistrationForm({ onSubmit, loading }: DriverRegistrationFormProps) {
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
  });

  const handleFormSubmit = async (data: DriverFormData) => {
    if (!selectedVehicleType) {
      alert('Please select a vehicle type');
      return;
    }

    const formData = {
      ...data,
      role: 'driver',
      vehicleInfo: {
        type: selectedVehicleType,
        model: data.vehicleModel,
        plate: data.vehiclePlate,
        color: data.vehicleColor,
        license: data.licenseNumber,
      }
    };

    await onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Enter your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                {...register('fullName')}
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              {...register('phone')}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Selection</CardTitle>
          <CardDescription>Choose your vehicle type</CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleSelection
            selectedVehicle={selectedVehicleType}
            onVehicleSelect={setSelectedVehicleType}
            mode="driver"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Details</CardTitle>
          <CardDescription>Enter your vehicle information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="licenseNumber">Driving License Number</Label>
            <Input
              id="licenseNumber"
              type="text"
              placeholder="Enter your license number"
              {...register('licenseNumber')}
              className={errors.licenseNumber ? 'border-red-500' : ''}
            />
            {errors.licenseNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.licenseNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicleModel">Vehicle Model</Label>
              <Input
                id="vehicleModel"
                type="text"
                placeholder="e.g., Honda City, Bajaj Auto"
                {...register('vehicleModel')}
                className={errors.vehicleModel ? 'border-red-500' : ''}
              />
              {errors.vehicleModel && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleModel.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="vehiclePlate">Vehicle Plate Number</Label>
              <Input
                id="vehiclePlate"
                type="text"
                placeholder="e.g., ABC-1234"
                {...register('vehiclePlate')}
                className={errors.vehiclePlate ? 'border-red-500' : ''}
              />
              {errors.vehiclePlate && (
                <p className="text-red-500 text-sm mt-1">{errors.vehiclePlate.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="vehicleColor">Vehicle Color</Label>
            <Input
              id="vehicleColor"
              type="text"
              placeholder="e.g., White, Black, Red"
              {...register('vehicleColor')}
              className={errors.vehicleColor ? 'border-red-500' : ''}
            />
            {errors.vehicleColor && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleColor.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSubmit(handleFormSubmit)}
        className="w-full h-12 text-lg" 
        disabled={loading}
      >
        {loading ? 'Creating Driver Account...' : 'Create Driver Account'}
      </Button>
    </div>
  );
}
