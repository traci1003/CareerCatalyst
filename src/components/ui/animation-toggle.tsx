import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimationToggleProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  // Additional props can be added here if needed
}

const AnimationToggle = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  AnimationToggleProps
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
      asChild
    >
      <motion.div
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {/* Custom dot animation when toggling */}
        <motion.div 
          className="w-full h-full bg-background rounded-full flex items-center justify-center"
          animate={props.checked ? "checked" : "unchecked"}
          variants={{
            checked: { 
              backgroundColor: "hsl(var(--primary))",
              boxShadow: "0 0 8px 2px hsla(var(--primary) / 0.4)"
            },
            unchecked: { 
              backgroundColor: "hsl(var(--card))", 
              boxShadow: "none"
            }
          }}
        >
          {props.checked && (
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-primary-foreground"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.1 }}
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </motion.svg>
          )}
        </motion.div>
      </motion.div>
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
));

AnimationToggle.displayName = "AnimationToggle";

export { AnimationToggle };