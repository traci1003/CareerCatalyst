import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useAnimation } from "@/context/AnimationContext";
import { useSound } from "@/context/SoundContext";
import { AnimationToggle } from "@/components/ui/animation-toggle";
import { useToast } from "@/hooks/use-toast";

export default function AnimationSettings() {
  const { toast } = useToast();
  const { 
    animationsEnabled, 
    setAnimationsEnabled, 
    backgroundAnimationsEnabled, 
    setBackgroundAnimationsEnabled 
  } = useAnimation();
  
  const { 
    soundEnabled, 
    setSoundEnabled
  } = useSound();

  const handleAnimationToggle = (checked: boolean) => {
    setAnimationsEnabled(checked);
    toast({
      title: checked ? "Animations enabled" : "Animations disabled",
      description: checked 
        ? "Interface animations are now active" 
        : "Interface animations have been turned off",
      variant: checked ? "default" : "destructive",
    });
  };

  const handleBackgroundToggle = (checked: boolean) => {
    setBackgroundAnimationsEnabled(checked);
    toast({
      title: checked ? "Background animations enabled" : "Background animations disabled",
      description: checked 
        ? "Background visual effects are now active" 
        : "Background visual effects have been turned off",
      variant: checked ? "default" : "destructive",
    });
  };
  
  const handleSoundToggle = (checked: boolean) => {
    setSoundEnabled(checked);
    toast({
      title: checked ? "Sound effects enabled" : "Sound effects disabled",
      description: checked 
        ? "Sound effects will now play during interactions" 
        : "Sound effects have been muted",
      variant: checked ? "default" : "destructive",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Animation & Sound Settings</CardTitle>
        <CardDescription>
          Customize visual effects and sound settings for the application
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="animations" className="text-base">Interface Animations</Label>
            <p className="text-sm text-muted-foreground">
              Enable smooth transitions and animations for UI elements
            </p>
          </div>
          <AnimationToggle
            checked={animationsEnabled}
            onCheckedChange={handleAnimationToggle}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="background-animations" className="text-base">Background Effects</Label>
            <p className="text-sm text-muted-foreground">
              Enable subtle animated backgrounds and visual effects
            </p>
          </div>
          <AnimationToggle
            checked={backgroundAnimationsEnabled}
            onCheckedChange={handleBackgroundToggle}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sound-effects" className="text-base">Sound Effects</Label>
            <p className="text-sm text-muted-foreground">
              Enable audio feedback for interactions and notifications
            </p>
          </div>
          <AnimationToggle
            checked={soundEnabled}
            onCheckedChange={handleSoundToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
}