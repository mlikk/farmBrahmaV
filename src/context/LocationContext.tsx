
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { GeoJsonObject } from 'geojson';

const LOCATION_STORAGE_KEY = 'farmBrahmaLocation';

interface LocationState {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface FarmDetails {
    soilType: string;
    waterSource: string;
}

interface StoredLocationData {
    location: LocationState | null;
    address: string | null;
    farmArea: number | null;
    farmDetails: FarmDetails | null;
    farmBoundary: GeoJsonObject | null;
}

interface LocationContextType extends StoredLocationData {
  setLocation: (location: LocationState | null) => void;
  setAddress: (address: string | null) => void;
  setFarmArea: (area: number | null) => void;
  setFarmDetails: (details: FarmDetails | null) => void;
  setFarmBoundary: (boundary: GeoJsonObject | null) => void;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, _setLocation] = useState<LocationState | null>(null);
  const [address, _setAddress] = useState<string | null>(null);
  const [farmArea, _setFarmArea] = useState<number | null>(null);
  const [farmDetails, _setFarmDetails] = useState<FarmDetails | null>(null);
  const [farmBoundary, _setFarmBoundary] = useState<GeoJsonObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateAndSave = (updates: Partial<StoredLocationData>) => {
    // This function now relies on the states being set before it's called.
    try {
      const currentState = JSON.parse(window.localStorage.getItem(LOCATION_STORAGE_KEY) || '{}');
      const newState = { ...currentState, ...updates };
      window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  };
  
  const setLocation = (newLocation: LocationState | null) => {
    _setLocation(newLocation);
    updateAndSave({ location: newLocation });
  };

  const setAddress = (newAddress: string | null) => {
    _setAddress(newAddress);
    updateAndSave({ address: newAddress });
  };
  
  const setFarmArea = (newArea: number | null) => {
    _setFarmArea(newArea);
    updateAndSave({ farmArea: newArea });
  };

  const setFarmDetails = (newDetails: FarmDetails | null) => {
    _setFarmDetails(newDetails);
    updateAndSave({ farmDetails: newDetails });
  };

  const setFarmBoundary = (newBoundary: GeoJsonObject | null) => {
    _setFarmBoundary(newBoundary);
    updateAndSave({ farmBoundary: newBoundary });
  };

  // Load from localStorage on initial mount
  useEffect(() => {
    // Start loading immediately.
    setIsLoading(true);
    try {
      const item = window.localStorage.getItem(LOCATION_STORAGE_KEY);
      if (item) {
        const storedData: StoredLocationData = JSON.parse(item);
        _setLocation(storedData.location);
        _setAddress(storedData.address);
        _setFarmArea(storedData.farmArea);
        _setFarmDetails(storedData.farmDetails);
        _setFarmBoundary(storedData.farmBoundary);
      } else {
        // Set default location if nothing is stored
        const defaultState = { latitude: 20.5937, longitude: 78.9629, zoom: 5 };
        const defaultAddress = 'India';
        _setLocation(defaultState);
        _setAddress(defaultAddress);
        // Save these defaults to localStorage
        window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ 
            location: defaultState, 
            address: defaultAddress, 
            farmArea: null, 
            farmDetails: null, 
            farmBoundary: null 
        }));
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
      // Set default location on error
      const defaultState = { latitude: 20.5937, longitude: 78.9629, zoom: 5 };
      _setLocation(defaultState);
      _setAddress('India');
    } finally {
        // Crucially, only set isLoading to false AFTER all state updates have been processed.
        setIsLoading(false);
    }
  }, []);


  return (
    <LocationContext.Provider value={{ location, setLocation, address, setAddress, farmArea, setFarmArea, farmDetails, setFarmDetails, farmBoundary, setFarmBoundary, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
