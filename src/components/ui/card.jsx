import * as React from "react";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        flat: "border-0 bg-background shadow-none",
        outline: "bg-transparent",
        filled: "bg-muted/50",
        elevated: "shadow-md hover:shadow-lg transition-shadow",
        interactive: "hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer",
        gradient: "bg-gradient-subtle",
      },
      size: {
        default: "",
        sm: "p-4", 
        md: "p-6",
        lg: "p-8",
      },
      rounded: {
        default: "rounded-lg",
        sm: "rounded-md",
        lg: "rounded-xl",
        xl: "rounded-2xl",
        full: "rounded-3xl",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
);

// Base Card component
const Card = React.forwardRef(
  ({ className, variant, size, rounded, animated = false, onClick, ...props }, ref) => {
    // If card is animated, wrap it in a motion.div
    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cn(cardVariants({ variant, size, rounded, className }))}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          whileHover={variant === 'interactive' ? { y: -5 } : {}}
          onClick={onClick}
          {...props}
        />
      );
    }

    // If card is interactive but not animated, add onClick
    if (variant === 'interactive' && onClick) {
      return (
        <div
          ref={ref}
          className={cn(cardVariants({ variant, size, rounded, className }))}
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClick(e);
            }
          }}
          {...props}
        />
      );
    }

    // Default non-animated card
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, rounded, className }))}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

// Card Header component
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// Card Title component
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// Card Description component
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// Card Content component
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0", className)} 
    {...props} 
  />
));
CardContent.displayName = "CardContent";

// Card Footer component
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Card Image component
const CardImage = React.forwardRef(({ 
  src, 
  alt = "", 
  className,
  fallback = "https://via.placeholder.com/400x200?text=Image",
  aspectRatio = "aspect-video",
  ...props 
}, ref) => {
  const [error, setError] = React.useState(false);

  return (
    <div 
      className={cn(
        "overflow-hidden rounded-t-lg", 
        aspectRatio,
        className
      )}
    >
      <img
        ref={ref}
        src={error ? fallback : src}
        alt={alt}
        onError={() => setError(true)}
        className="h-full w-full object-cover transition-all hover:scale-105"
        loading="lazy"
        {...props}
      />
    </div>
  );
});
CardImage.displayName = "CardImage";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  cardVariants,
};