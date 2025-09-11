'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VehicleType } from '@/types/auth';
import { Car, Bike, Zap } from 'lucide-react';

interface VehicleOption {
    type: VehicleType;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    estimatedTime: string;
    baseFare: string;
    features: string[];
    color: string;
    bgColor: string;
}

const vehicleOptions: VehicleOption[] = [
    {
        type: 'auto',
        name: 'Auto Rickshaw',
        description: 'Affordable rides for short distances',
        icon: Zap,
        estimatedTime: '3-5 min',
        baseFare: '$2.50',
        features: ['Economical', 'Quick pickup', 'City rides'],
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200'
    },
    {
        type: 'bike',
        name: 'Motorcycle',
        description: 'Fast and convenient for solo rides',
        icon: Bike,
        estimatedTime: '2-4 min',
        baseFare: '$1.80',
        features: ['Fastest', 'Traffic bypass', 'Solo rider'],
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200'
    },
    {
        type: 'car',
        name: 'Car',
        description: 'Comfortable rides with AC',
        icon: Car,
        estimatedTime: '4-7 min',
        baseFare: '$4.20',
        features: ['AC comfort', 'Spacious', 'All weather'],
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200'
    },
];

interface VehicleSelectionProps {
    selectedVehicle: VehicleType | null;
    onVehicleSelect: (vehicleType: VehicleType) => void;
    mode: 'rider' | 'driver';
}

export default function VehicleSelection({
    selectedVehicle,
    onVehicleSelect,
    mode
}: VehicleSelectionProps) {

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">
                    {mode === 'rider' ? 'Preferred Vehicle Type' : 'Your Vehicle Type'}
                </h3>
                <p className="text-sm text-gray-600">
                    {mode === 'rider'
                        ? 'Select your preferred ride option (you can change this later)'
                        : 'Choose the vehicle you will be driving'
                    }
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicleOptions.map((vehicle) => {
                    const IconComponent = vehicle.icon;
                    const isSelected = selectedVehicle === vehicle.type;

                    return (
                        <Card
                            key={vehicle.type}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${isSelected
                                    ? `ring-2 ring-blue-500 ${vehicle.bgColor}`
                                    : 'hover:shadow-md border-gray-200'
                                }`}
                            onClick={() => onVehicleSelect(vehicle.type)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-500' : 'bg-gray-100'
                                            }`}>
                                            <IconComponent className={`w-6 h-6 ${isSelected ? 'text-white' : vehicle.color
                                                }`} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                                            <CardDescription className="text-sm">
                                                {vehicle.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <Badge variant="default" className="bg-blue-500">
                                            Selected
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm text-gray-600">Est. pickup:</span>
                                    <span className="font-medium">{vehicle.estimatedTime}</span>
                                </div>

                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm text-gray-600">Base fare:</span>
                                    <span className="font-semibold text-green-600">{vehicle.baseFare}</span>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {vehicle.features.map((feature, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {feature}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
