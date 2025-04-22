import React, { createContext, useState, useContext, useEffect } from "react";

interface SoundContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playSound: (soundType: SoundType) => void;
}

export type SoundType = 'click' | 'success' | 'error' | 'notification';

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage if available, otherwise default to true
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const savedValue = localStorage.getItem("soundEnabled");
    return savedValue !== null ? savedValue === "true" : true;
  });

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("soundEnabled", String(soundEnabled));
  }, [soundEnabled]);

  // Cache audio instances
  const [audioCache, setAudioCache] = useState<Record<SoundType, HTMLAudioElement | null>>({
    click: null,
    success: null,
    error: null,
    notification: null
  });

  // Initialize audio elements when the component mounts
  useEffect(() => {
    const cache: Record<SoundType, HTMLAudioElement> = {
      click: new Audio("/sounds/click.mp3"),
      success: new Audio("/sounds/success.mp3"),
      error: new Audio("/sounds/error.mp3"),
      notification: new Audio("/sounds/notification.mp3"),
    };
    
    // Set volume levels
    cache.click.volume = 0.3;
    cache.success.volume = 0.5;
    cache.error.volume = 0.5;
    cache.notification.volume = 0.4;
    
    // Preload sounds
    Object.values(cache).forEach(audio => {
      audio.load();
    });
    
    setAudioCache(cache);
    
    // Cleanup function to remove audio elements
    return () => {
      Object.values(cache).forEach(audio => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  const playSound = (soundType: SoundType) => {
    if (!soundEnabled || !audioCache[soundType]) return;
    
    try {
      // Reset the audio to the beginning in case it's already playing
      const audio = audioCache[soundType]!;
      audio.currentTime = 0;
      audio.play().catch(err => {
        // Handle browser autoplay restrictions gracefully
        console.warn("Sound couldn't play:", err);
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, setSoundEnabled, playSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}