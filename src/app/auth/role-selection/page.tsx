'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Bike, ArrowRight } from 'lucide-react';
import { UserRole } from '@/types/auth';

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/auth/register?role=${selectedRole}`);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to RideApp</h1>
          <p className="text-lg text-gray-600">Choose how you'd like to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Rider Card */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === 'rider' 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleRoleSelect('rider')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedRole === 'rider' ? 'bg-blue-500' : 'bg-gray-100'
                }`}>
                  <Bike className={`w-8 h-8 ${
                    selectedRole === 'rider' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
              </div>
              <CardTitle className="text-2xl">I'm a Rider</CardTitle>
              <CardDescription className="text-base">
                Book rides and get to your destination safely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Quick and easy booking
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Real-time tracking
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Secure payments
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Rate your experience
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Driver Card */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === 'driver' 
                ? 'ring-2 ring-green-500 bg-green-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleRoleSelect('driver')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedRole === 'driver' ? 'bg-green-500' : 'bg-gray-100'
                }`}>
                  <Car className={`w-8 h-8 ${
                    selectedRole === 'driver' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
              </div>
              <CardTitle className="text-2xl">I'm a Driver</CardTitle>
              <CardDescription className="text-base">
                Earn money by giving rides to passengers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Flexible working hours
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Weekly payouts
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Driver support 24/7
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Performance bonuses
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Button 
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full max-w-md h-12 text-lg"
          >
            Continue as {selectedRole ? (selectedRole === 'rider' ? 'Rider' : 'Driver') : '...'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <p className="text-gray-600">Already have an account?</p>
            <Button variant="link" onClick={handleLoginRedirect} className="p-0 h-auto">
              Sign in here
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
