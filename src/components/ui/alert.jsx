import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AlertCircle, CheckCircle2, Info, XCircle, AlertTriangle } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        error: "border-danger/50 text-danger dark:border-danger [&>svg]:text-danger",
        warning: "border-warning/50 text-warning dark:border-warning [&>svg]:text-warning",
        success: "border-success/50 text-success dark:border-success [&>svg]:text-success",
        info: "border-info/50 text-info dark:border-info [&>svg]:text-info",
      },
      size: {
        default: "",
        sm: "text-sm p-3 [&>svg]:top-3",
        lg: "text-lg p-5 [&>svg]:top-5 [&>svg]:left-5 [&>svg~*]:pl-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const iconMap = {
  error: XCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
  default: AlertCircle,
};

const Alert = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default",
  title,
  children,
  icon,
  showIcon = true,
  onDismiss,
  dismissable = false,
  ...props 
}, ref) => {
  // Get the appropriate icon component based on variant
  const IconComponent = icon || iconMap[variant] || iconMap.default;

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant, size, className }))}
      {...props}
    >
      {showIcon && <IconComponent className="h-4 w-4" />}
      
      <div className="flex-1">
        {title && (
          <h5 className="mb-1 font-medium leading-none tracking-tight">
            {title}
          </h5>
        )}
        <div className={cn("text-sm [&_p]:leading-relaxed", !title && "pt-0")}>
          {children}
        </div>
      </div>
      
      {dismissable && onDismiss && (
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 inline-flex items-center justify-center rounded-md p-1 text-foreground/50 hover:text-foreground transition-colors focus:outline-none focus:ring-1"
          aria-label="Dismiss alert"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

Alert.displayName = "Alert";

// Create specialized alert components for common use cases
const ErrorAlert = ({ title = "Error", ...props }) => (
  <Alert variant="error" title={title} {...props} />
);

const SuccessAlert = ({ title = "Success", ...props }) => (
  <Alert variant="success" title={title} {...props} />
);

const InfoAlert = ({ title = "Information", ...props }) => (
  <Alert variant="info" title={title} {...props} />
);

const WarningAlert = ({ title = "Warning", ...props }) => (
  <Alert variant="warning" title={title} {...props} />
);

export { 
  Alert, 
  ErrorAlert, 
  SuccessAlert, 
  InfoAlert, 
  WarningAlert,
  alertVariants 
};