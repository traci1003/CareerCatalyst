import React, { createContext, useState, useContext, useEffect } from "react";

// Define the type for the animation context
interface AnimationContextType {
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  backgroundAnimationsEnabled: boolean;
  setBackgroundAnimationsEnabled: (enabled: boolean) => void;
}

// Create the context with a default value
const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

// Animation provider component
export function AnimationProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage if available, otherwise default to true
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(() => {
    const savedValue = localStorage.getItem("animationsEnabled");
    return savedValue !== null ? savedValue === "true" : true;
  });
  
  const [backgroundAnimationsEnabled, setBackgroundAnimationsEnabled] = useState<boolean>(() => {
    const savedValue = localStorage.getItem("backgroundAnimationsEnabled");
    return savedValue !== null ? savedValue === "true" : true;
  });

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem("animationsEnabled", String(animationsEnabled));
  }, [animationsEnabled]);

  useEffect(() => {
    localStorage.setItem("backgroundAnimationsEnabled", String(backgroundAnimationsEnabled));
  }, [backgroundAnimationsEnabled]);

  // Create the value object for the context
  const value = {
    animationsEnabled,
    setAnimationsEnabled,
    backgroundAnimationsEnabled,
    setBackgroundAnimationsEnabled,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

// Custom hook to use the animation context
export function useAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
}