'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, DollarSign, Clock, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DriverDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.fullName}!</h1>
        <p className="text-gray-600">Ready to start earning?</p>
      </div>

      {/* Status Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-700">
            <Car className="w-5 h-5 mr-2" />
            Driver Status: Offline
          </CardTitle>
          <CardDescription>Go online to start receiving ride requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-green-600 hover:bg-green-700">Go Online</Button>
        </CardContent>
      </Card>

      {/* Today's Earnings */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$127.50</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rides Completed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 more than yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.5h</div>
            <p className="text-xs text-muted-foreground">Average: 7.2h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9</div>
            <p className="text-xs text-muted-foreground">Excellent performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
          <CardDescription>Your latest completed rides</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Downtown → Airport</p>
                  <p className="text-sm text-gray-500">John D. • 2:30 PM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">+$28.50</p>
                <p className="text-sm text-gray-500">25 min • 18 miles</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Mall → University</p>
                  <p className="text-sm text-gray-500">Sarah M. • 1:15 PM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">+$15.75</p>
                <p className="text-sm text-gray-500">12 min • 8 miles</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Office → Home</p>
                  <p className="text-sm text-gray-500">Mike R. • 12:45 PM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">+$22.25</p>
                <p className="text-sm text-gray-500">18 min • 12 miles</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>This Week</CardTitle>
          <CardDescription>Your performance summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Earnings Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trip Earnings:</span>
                  <span className="font-medium">$642.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tips:</span>
                  <span className="font-medium">$87.25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bonuses:</span>
                  <span className="font-medium">$45.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">$774.75</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Trip Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Trips:</span>
                  <span className="font-medium">42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hours Online:</span>
                  <span className="font-medium">35.5h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Acceptance Rate:</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating:</span>
                  <span className="font-medium">4.9 ⭐</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
