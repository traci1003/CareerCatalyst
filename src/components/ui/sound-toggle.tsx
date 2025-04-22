import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toggleSounds, areSoundsEnabled } from '@/lib/sound';

interface SoundToggleProps {
  className?: string;
}

export function SoundToggle({ className }: SoundToggleProps) {
  const [enabled, setEnabled] = useState(areSoundsEnabled());
  
  useEffect(() => {
    // Sync with system settings
    setEnabled(areSoundsEnabled());
  }, []);
  
  const handleToggle = () => {
    const newState = toggleSounds();
    setEnabled(newState);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={handleToggle}
            aria-label={enabled ? "Disable sounds" : "Enable sounds"}
          >
            {enabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{enabled ? "Disable sounds" : "Enable sounds"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}