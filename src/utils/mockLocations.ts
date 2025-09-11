import { LocationResult } from '@/services/locationService';

export const mockLocations: { [key: string]: LocationResult[] } = {
  'Delhi': [
    { latitude: 28.6562, longitude: 77.2410, address: 'Red Fort, Old Delhi, New Delhi, India' },
    { latitude: 28.6129, longitude: 77.2295, address: 'India Gate, Rajpath, New Delhi, India' },
    { latitude: 28.5562, longitude: 77.1000, address: 'Indira Gandhi International Airport, New Delhi, India' },
    { latitude: 28.6507, longitude: 77.2334, address: 'Chandni Chowk, Old Delhi, New Delhi, India' },
    { latitude: 28.5355, longitude: 77.3910, address: 'Sector 18, Noida, Uttar Pradesh, India' },
    { latitude: 28.4595, longitude: 77.0266, address: 'Cyber City, Gurgaon, Haryana, India' },
    { latitude: 28.4817, longitude: 77.1873, address: 'Nehru Place, New Delhi, India' },
    { latitude: 28.6304, longitude: 77.2177, address: 'Connaught Place, New Delhi, India' },
    { latitude: 28.6692, longitude: 77.4538, address: 'Akshardham Temple, New Delhi, India' },
    { latitude: 28.5244, longitude: 77.1855, address: 'Saket Mall, New Delhi, India' },
  ],
  'Mumbai': [
    { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai Central, Mumbai, Maharashtra, India' },
    { latitude: 19.0896, longitude: 72.8656, address: 'Bandra West, Mumbai, Maharashtra, India' },
    { latitude: 19.0330, longitude: 72.8397, address: 'Chhatrapati Shivaji Terminus, Mumbai, Maharashtra, India' },
    { latitude: 19.0176, longitude: 72.8562, address: 'Colaba, Mumbai, Maharashtra, India' },
    { latitude: 19.0728, longitude: 72.8826, address: 'Andheri East, Mumbai, Maharashtra, India' },
  ]
};

export function searchMockLocations(query: string, city: string = 'Delhi'): LocationResult[] {
  const locations = mockLocations[city] || mockLocations['Delhi'];
  const searchTerm = query.toLowerCase();
  
  return locations.filter(location => 
    location.address.toLowerCase().includes(searchTerm)
  );
}
