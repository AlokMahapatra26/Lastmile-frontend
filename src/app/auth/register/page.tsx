'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Car, Bike } from 'lucide-react';
import RiderRegistrationForm from '@/components/RiderRegistrationForm';
import DriverRegistrationForm from '@/components/DriverRegistrationForm';
import EmailVerification from '@/components/EmailVerification';

function RegisterContent() {
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser } = useAuth();
  
  const role = searchParams.get('role') as UserRole;

  useEffect(() => {
    if (!role || (role !== 'rider' && role !== 'driver')) {
      router.push('/auth/role-selection');
    }
  }, [role, router]);

  const handleRegistration = async (data: any) => {
    setLoading(true);
    try {
      await registerUser(data);
      setUserEmail(data.email);
      setShowEmailVerification(true);
      
     toast.success("registration successfull")

    } catch (error: any) {
      toast.error(error?.message)
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/auth/role-selection');
  };

  const handleLoginRedirect = () => {
    router.push('/auth/login');
  };

  if (!role) {
    return null;
  }

  if (showEmailVerification) {
    return <EmailVerification email={userEmail} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to role selection
          </Button>

          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
              {role === 'rider' ? 
                <Bike className="w-8 h-8 text-blue-600" /> : 
                <Car className="w-8 h-8 text-green-600" />
              }
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Join as a {role === 'rider' ? 'Rider' : 'Driver'}
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              {role === 'rider' 
                ? 'Start booking rides and get to your destination safely'
                : 'Start earning by providing rides to passengers'
              }
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {role === 'rider' ? (
            <RiderRegistrationForm 
              onSubmit={handleRegistration}
              loading={loading}
            />
          ) : (
            <DriverRegistrationForm 
              onSubmit={handleRegistration}
              loading={loading}
            />
          )}

          <div className="mt-6 text-center">
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
