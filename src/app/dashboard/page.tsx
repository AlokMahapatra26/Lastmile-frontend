'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import RiderDashboard from '@/components/Dashboard/RiderDashboard';
import DriverDashboard from '@/components/Dashboard/DriverDashboard';
import { LogOut, User, Settings } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/role-selection');
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/role-selection');
  };

  // Debug logging
  useEffect(() => {
    console.log('Dashboard - User object:', user);
    console.log('Dashboard - User role:', user?.role);
    console.log('Dashboard - Is authenticated:', isAuthenticated);
  }, [user, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Additional safety check
  if (!user.role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Role Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't determine your account type.</p>
          <Button onClick={handleLogout}>Return to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">RideApp</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
                {user.role}
              </span>
              {/* Debug info - remove in production */}
              <span className="ml-2 text-xs text-gray-500">
                (Debug: {user.role})
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Debug info - remove in production */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Debug Info (Remove in Production):</h3>
          <p className="text-sm text-yellow-700">User Role: {user.role}</p>
          <p className="text-sm text-yellow-700">User ID: {user.id}</p>
          <p className="text-sm text-yellow-700">User Email: {user.email}</p>
          <p className="text-sm text-yellow-700">Full Name: {user.fullName}</p>
        </div>

        {/* Conditional Dashboard Rendering */}
        {user.role === 'rider' ? (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-green-600">Showing Rider Dashboard</h2>
            <RiderDashboard />
          </div>
        ) : user.role === 'driver' ? (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-blue-600">Showing Driver Dashboard</h2>
            <DriverDashboard />
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Unknown Role</h2>
            <p className="text-gray-600 mb-4">Role '{user.role}' is not recognized.</p>
            <Button onClick={handleLogout}>Return to Login</Button>
          </div>
        )}
      </main>
    </div>
  );
}
