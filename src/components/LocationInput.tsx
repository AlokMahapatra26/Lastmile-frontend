'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { locationService, LocationResult } from '@/services/locationService';
import { MapPin, Navigation, Search, X, Clock } from 'lucide-react';

interface LocationInputProps {
  placeholder: string;
  value: LocationResult | null;
  onChange: (location: LocationResult) => void;
  showCurrentLocation?: boolean;
  className?: string;
}

export default function LocationInput({
  placeholder,
  value,
  onChange,
  showCurrentLocation = true,
  className = ''
}: LocationInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPopularPlaces, setShowPopularPlaces] = useState(false);
  const [recentSearches, setRecentSearches] = useState<LocationResult[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value) {
      setInputValue(value.address);
    }
  }, [value]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentLocationSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  const saveRecentSearch = (location: LocationResult) => {
    const updated = [location, ...recentSearches.filter(item => 
      item.address !== location.address
    )].slice(0, 5); // Keep only 5 recent searches
    
    setRecentSearches(updated);
    localStorage.setItem('recentLocationSearches', JSON.stringify(updated));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length > 2) {
      setLoading(true);
      setSuggestions([]);
      
      // Debounce search
      debounceRef.current = setTimeout(() => {
        searchLocations(query);
      }, 800); // Increased debounce time
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
    }
  };

  const searchLocations = async (query: string) => {
    try {
      console.log('Searching for:', query);
      const results = await locationService.geocodeAddress(query);
      
      if (results && results.length > 0) {
        setSuggestions(results);
        setShowSuggestions(true);
        setShowPopularPlaces(false);
      } else {
        // Show popular places if no search results
        const popularPlaces = locationService.getPopularPlaces();
        setSuggestions(popularPlaces);
        setShowSuggestions(true);
        setShowPopularPlaces(true);
      }
    } catch (error) {
      console.error('Location search error:', error);
      // Show popular places as fallback
      const popularPlaces = locationService.getPopularPlaces();
      setSuggestions(popularPlaces);
      setShowSuggestions(true);
      setShowPopularPlaces(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await locationService.getCurrentLocation();
      selectLocation(location);
    } catch (error) {
      console.error('Current location error:', error);
      alert('Unable to get current location. Please check your browser settings and try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectLocation = (location: LocationResult) => {
    onChange(location);
    setInputValue(location.address);
    setShowSuggestions(false);
    setShowPopularPlaces(false);
    setSuggestions([]);
    saveRecentSearch(location);
    
    // Blur input to hide mobile keyboard
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleFocus = () => {
    if (inputValue.length <= 2) {
      // Show recent searches and popular places when focusing empty input
      const combinedSuggestions = [
        ...recentSearches,
        ...locationService.getPopularPlaces()
      ].slice(0, 8);
      
      setSuggestions(combinedSuggestions);
      setShowSuggestions(true);
      setShowPopularPlaces(true);
    }
  };

  const clearInput = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setShowPopularPlaces(false);
    onChange({ latitude: 0, longitude: 0, address: '' });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="pl-10 pr-20"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {loading && (
            <Search className="h-4 w-4 animate-spin text-gray-400" />
          )}
          
          {inputValue && !loading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearInput}
              className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          {showCurrentLocation && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCurrentLocation}
              disabled={loading}
              className="p-1 h-6 w-6 text-blue-500 hover:text-blue-600"
              title="Use current location"
            >
              <Navigation className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-auto shadow-lg">
          {showPopularPlaces && recentSearches.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                RECENT SEARCHES
              </div>
              {recentSearches.map((location, index) => (
                <div
                  key={`recent-${index}`}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                  onClick={() => selectLocation(location)}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm flex-1">{location.address}</span>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {showPopularPlaces && (
            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
              {inputValue.length > 2 ? 'SUGGESTED PLACES' : 'POPULAR PLACES'}
            </div>
          )}
          
          {suggestions.map((suggestion, index) => {
            const isRecent = recentSearches.some(recent => recent.address === suggestion.address);
            if (showPopularPlaces && isRecent) return null; // Don't duplicate recent searches
            
            return (
              <div
                key={index}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => selectLocation(suggestion)}
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <span className="text-sm">{suggestion.address}</span>
                    {showPopularPlaces && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Search className="h-4 w-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-500">Searching...</span>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
