import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]", 
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive: "bg-danger text-danger-foreground hover:bg-danger/90 shadow-sm hover:shadow-md",
        outline: "border-2 border-input bg-background hover:bg-accent/10 hover:border-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm hover:shadow-md",
        ghost: "hover:bg-muted hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:brightness-110 shadow-sm hover:shadow-md",
        "gradient-subtle": "bg-gradient-to-r from-primary/10 to-accent/10 text-foreground hover:from-primary/20 hover:to-accent/20 hover:text-primary",
        "gradient-outline": "border-2 border-primary bg-gradient-to-r from-primary/5 to-accent/5 text-foreground hover:from-primary/10 hover:to-accent/10 hover:border-accent",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm hover:shadow-md",
        "accent-outline": "border-2 border-accent bg-transparent text-accent hover:bg-accent/10",
        "primary-outline": "border-2 border-primary bg-transparent text-primary hover:bg-primary/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-7 px-2 text-xs",
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-xs": "h-6 w-6 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },
      glow: {
        true: "shadow-glow hover:shadow-glow-hover active:shadow-glow",
        false: "",
        subtle: "shadow-glow/50 hover:shadow-glow-hover/60",
        accent: "shadow-glow-accent hover:shadow-glow-accent-hover",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
        xs: "rounded-sm",
        sm: "rounded",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
      },
      animation: {
        none: "",
        bounce: "hover:-translate-y-0.5 active:translate-y-0 transition-transform",
        grow: "hover:scale-105 active:scale-100 transition-transform",
        pulse: "hover:animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: false,
      rounded: "default",
      animation: "none",
    },
  }
);

// Loading spinner styles - consistent with button size
const spinnerSizes = {
  default: "h-4 w-4",
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
  icon: "h-5 w-5",
  "icon-sm": "h-4 w-4",
  "icon-xs": "h-3 w-3",
  "icon-lg": "h-6 w-6",
};

const Button = React.forwardRef(
  ({ 
    className, 
    variant, 
    size = "default", 
    glow, 
    rounded, 
    animation,
    asChild = false, 
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    const spinnerSize = spinnerSizes[size] || spinnerSizes.default;
    
    // Determine what to render inside the button
    const renderContent = () => {
      if (isLoading) {
        return (
          <>
            <Loader2 className={cn("animate-spin mr-2", spinnerSize)} />
            {loadingText || children}
          </>
        );
      }
      
      return (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      );
    };

    return (
      <Comp
        className={cn(buttonVariants({ 
          variant, 
          size, 
          glow, 
          rounded, 
          animation
        }), className)}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {renderContent()}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };