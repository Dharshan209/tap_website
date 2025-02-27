import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * Spinner component for loading states with multiple size and style variants
 * 
 * @param {string} size - Size of the spinner: "sm", "md", "lg", "xl", or any Tailwind size class
 * @param {string} variant - Visual style variant: "default", "primary", "secondary", "accent"
 * @param {string} label - Optional accessibility label
 * @param {string} className - Additional CSS classes
 * @param {boolean} withLabel - Show the label visibly
 */
const Spinner = ({
  size = "md",
  variant = "primary",
  label = "Loading...",
  className,
  withLabel = false,
  ...props
}) => {
  // Size mappings
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  // Color variant mappings
  const variantClasses = {
    default: "text-foreground",
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    muted: "text-muted-foreground",
  };

  // Determine the appropriate size class
  const sizeClass = sizeClasses[size] || size;
  
  // Determine the appropriate color class
  const colorClass = variantClasses[variant] || variantClasses.default;

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Loader2
        className={cn(
          "animate-spin",
          sizeClass,
          colorClass
        )}
        aria-hidden="true"
      />
      
      {withLabel && (
        <span className="text-sm font-medium">{label}</span>
      )}
      
      {/* Hidden label for screen readers when not visibly showing label */}
      {!withLabel && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
};

/**
 * FullPageSpinner component for loading entire pages/sections
 * Enhanced with animation and visual appeal
 */
export const FullPageSpinner = ({
  message = "Loading content...",
  showMessage = true,
  className,
  showLogo = false,
  variant = "primary",
  ...props
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center min-h-[200px] w-full py-12 px-4",
        className
      )}
      {...props}
    >
      {showLogo && (
        <div className="mb-6 animate-float">
          <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 shadow-lg">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TAP
            </span>
          </div>
        </div>
      )}
      
      <div className="relative">
        {/* Animated background glow for extra visual appeal */}
        <div className="absolute inset-0 -z-10 rounded-full blur-xl bg-primary/20 animate-pulse-slow"></div>
        
        <Spinner 
          size="xl" 
          variant={variant} 
          label={message}
          withLabel={false} 
          className="animate-float-subtle"
        />
      </div>
      
      {showMessage && (
        <div className="mt-6 text-center max-w-md mx-auto">
          <p className="text-base font-medium text-foreground mb-1">
            {message}
          </p>
          <p className="text-sm text-muted-foreground">
            This may take a few moments...
          </p>
        </div>
      )}
      
      {/* Small animated dots to indicate progress */}
      <div className="flex space-x-2 mt-6">
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className={`h-2 w-2 rounded-full bg-primary/60 animate-pulse`}
            style={{ 
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.5s' 
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Section loading spinner for content areas
 */
export const SectionSpinner = ({
  message = "Loading...",
  className,
  ...props
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center min-h-[150px] w-full py-6 px-4",
        "border border-border rounded-lg bg-muted/20",
        className
      )}
      {...props}
    >
      <Spinner 
        size="lg" 
        variant="primary" 
        label={message}
        withLabel={true} 
      />
    </div>
  );
};

export default Spinner;