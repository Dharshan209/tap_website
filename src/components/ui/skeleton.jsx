import React from "react";
import { cn } from "../../lib/utils";

/**
 * Skeleton component for loading states
 * Displays a placeholder that mimics the shape of content while it's loading
 */
const Skeleton = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60",
        className
      )}
      {...props}
    />
  );
};

/**
 * TextSkeleton component for loading text content
 * Displays placeholder lines that mimic paragraphs
 */
export const TextSkeleton = ({
  lines = 3,
  className,
  lastLineWidth = "3/4",
  ...props
}) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? `w-${lastLineWidth}` : "w-full"
          )}
        />
      ))}
    </div>
  );
};

/**
 * ImageSkeleton component for loading image content
 * Displays a placeholder rectangle with image icon
 */
export const ImageSkeleton = ({
  aspectRatio = "aspect-video",
  className,
  ...props
}) => {
  return (
    <Skeleton 
      className={cn(
        "flex items-center justify-center", 
        aspectRatio,
        className
      )} 
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 text-muted-foreground/40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </Skeleton>
  );
};

/**
 * CardSkeleton component for loading card content
 * Displays a placeholder card with image and text
 */
export const CardSkeleton = ({
  hasImage = true,
  hasFooter = false,
  className,
  ...props
}) => {
  return (
    <div 
      className={cn("space-y-3 rounded-xl border border-border p-4", className)}
      {...props}
    >
      {/* Card image placeholder */}
      {hasImage && <ImageSkeleton className="h-40 w-full" />}
      
      {/* Card header placeholder */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-4/5" />
        <TextSkeleton lines={2} lastLineWidth="2/3" />
      </div>
      
      {/* Optional footer placeholder */}
      {hasFooter && (
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      )}
    </div>
  );
};

/**
 * TableSkeleton component for loading table content
 * Displays a placeholder table with header and rows
 */
export const TableSkeleton = ({
  rows = 5,
  columns = 4,
  hasHeader = true,
  className,
  ...props
}) => {
  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="rounded-md border">
        <div className="divide-y divide-border">
          {/* Table header */}
          {hasHeader && (
            <div className="grid grid-cols-12 gap-2 p-4 bg-muted/30">
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton
                  key={`header-${i}`}
                  className={cn(
                    "h-6",
                    i === 0 ? "col-span-4" : "col-span-2"
                  )}
                />
              ))}
            </div>
          )}
          
          {/* Table rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div 
              key={`row-${rowIndex}`} 
              className="grid grid-cols-12 gap-2 p-4"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={cn(
                    "h-4",
                    colIndex === 0 ? "col-span-4" : "col-span-2"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * ProfileSkeleton component for loading profile content
 * Displays a placeholder profile with avatar and details
 */
export const ProfileSkeleton = ({ className, ...props }) => {
  return (
    <div className={cn("flex space-x-4", className)} {...props}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
};

export default Skeleton;