import React, { createContext, useContext, useState } from 'react';
import type { TripDetails } from '../services/aiService';

type PartialTrip = Partial<TripDetails>;

interface TripContextType {
  tripData: PartialTrip;
  setTripData: React.Dispatch<React.SetStateAction<PartialTrip>>;
  updateTrip: (updates: PartialTrip) => void;
  resetTrip: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [tripData, setTripData] = useState<PartialTrip>({});

  const updateTrip = (updates: PartialTrip) => {
    setTripData((prev) => ({ ...prev, ...updates }));
  };

  const resetTrip = () => setTripData({});

  return (
    <TripContext.Provider value={{ tripData, setTripData, updateTrip, resetTrip }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext(): TripContextType {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTripContext must be used inside <TripProvider>');
  }
  return ctx;
}
