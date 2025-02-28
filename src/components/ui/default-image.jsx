import React from 'react';
import { cn } from '../../lib/utils';
import { Image, FileImage, User, Book } from 'lucide-react';

/**
 * DefaultImage - SVG placeholder images for various content types
 * 
 * Provides default SVG images for:
 * - products
 * - user avatars
 * - general images
 * - book covers
 */
const DefaultImage = ({
  type = 'image',
  color = 'currentColor',
  bgColor = 'bg-muted/30',
  size = 'medium',
  className,
  iconClassName,
  ...props
}) => {
  // Determine icon size based on prop
  const iconSize = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  }[size] || 'w-10 h-10';
  
  // Choose the appropriate icon based on content type
  const Icon = () => {
    switch (type) {
      case 'product':
        return <FileImage className={cn(iconSize, 'text-muted-foreground', iconClassName)} />;
      case 'avatar':
        return <User className={cn(iconSize, 'text-muted-foreground', iconClassName)} />;
      case 'book':
        return <Book className={cn(iconSize, 'text-muted-foreground', iconClassName)} />;
      case 'image':
      default:
        return <Image className={cn(iconSize, 'text-muted-foreground', iconClassName)} />;
    }
  };

  // Return SVG placeholder
  return (
    <div 
      className={cn(
        'flex items-center justify-center',
        bgColor,
        className
      )}
      {...props}
    >
      <Icon />
    </div>
  );
};

// Generate a base64 encoded SVG for use in img src
export const getDefaultImageSrc = (type = 'image') => {
  // Define the SVG content based on type
  let svgContent = '';
  
  switch (type) {
    case 'product':
      // Simple product icon SVG
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="2"/><path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22"/></svg>`;
      break;
    case 'avatar':
      // Simple user avatar icon SVG
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
      break;
    case 'book':
      // Simple book icon SVG
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`;
      break;
    case 'image':
    default:
      // Simple image icon SVG
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
      break;
  }
  
  // Encode SVG as base64
  const encodedSVG = btoa(svgContent);
  return `data:image/svg+xml;base64,${encodedSVG}`;
};

export default DefaultImage;