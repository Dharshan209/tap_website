import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Advanced Tooltip component with animation and positioning
 * 
 * @param {string} content - The tooltip content
 * @param {React.ReactNode} children - The component to attach the tooltip to
 * @param {string} position - Position of the tooltip: top, right, bottom, left
 * @param {boolean} arrow - Whether to show an arrow pointing to the trigger
 * @param {string} variant - Visual variant: default, dark, info, warning
 * @param {boolean} delay - Delay in ms before showing the tooltip (0 for no delay)
 * @param {string} className - Additional classes for the tooltip
 */
const Tooltip = ({ 
  content,
  children,
  position = 'top',
  arrow = true,
  variant = 'default',
  delay = 300,
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);

  // Variants for different tooltip styles
  const tooltipVariants = {
    default: 'bg-popover text-popover-foreground border border-border',
    dark: 'bg-gray-900 text-white',
    info: 'bg-info text-info-foreground',
    warning: 'bg-warning text-warning-foreground',
    error: 'bg-danger text-danger-foreground',
    success: 'bg-success text-success-foreground',
  };

  // Animation variants for different positions
  const animationVariants = {
    top: {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    },
    right: {
      hidden: { opacity: 0, x: -10 },
      visible: { opacity: 1, x: 0 },
    },
    bottom: {
      hidden: { opacity: 0, y: -10 },
      visible: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: 10 },
      visible: { opacity: 1, x: 0 },
    },
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    // Calculate position based on trigger and tooltip dimensions
    let x, y;
    
    switch (position) {
      case 'top':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollLeft;
        y = triggerRect.top - tooltipRect.height - 8 + scrollTop;
        break;
      case 'right':
        x = triggerRect.right + 8 + scrollLeft;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + scrollTop;
        break;
      case 'bottom':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollLeft;
        y = triggerRect.bottom + 8 + scrollTop;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8 + scrollLeft;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + scrollTop;
        break;
      default:
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollLeft;
        y = triggerRect.top - tooltipRect.height - 8 + scrollTop;
    }
    
    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust horizontal position if outside viewport
    if (x < 0) {
      x = 4;
    } else if (x + tooltipRect.width > viewportWidth) {
      x = viewportWidth - tooltipRect.width - 4;
    }
    
    // Adjust vertical position if outside viewport
    if (y < 0) {
      y = 4;
    } else if (y + tooltipRect.height > viewportHeight) {
      y = viewportHeight - tooltipRect.height - 4;
    }
    
    setTooltipPosition({ x, y });
  };

  // Handle mouseover/focus events
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };
  
  // Handle mouseout/blur events
  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  // Calculate position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      // Use RAF to ensure the tooltip is rendered before calculating position
      requestAnimationFrame(calculatePosition);
      
      // Recalculate on window resize
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
      
      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
      };
    }
  }, [isVisible]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Get arrow positioning based on tooltip position
  const getArrowClass = () => {
    switch (position) {
      case 'top': return 'bottom-[-4px] left-1/2 transform -translate-x-1/2 rotate-45';
      case 'right': return 'left-[-4px] top-1/2 transform -translate-y-1/2 rotate-45';
      case 'bottom': return 'top-[-4px] left-1/2 transform -translate-x-1/2 rotate-45';
      case 'left': return 'right-[-4px] top-1/2 transform -translate-y-1/2 rotate-45';
      default: return 'bottom-[-4px] left-1/2 transform -translate-x-1/2 rotate-45';
    }
  };

  // Clone and add ref to the trigger element
  const trigger = React.cloneElement(React.Children.only(children), {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleMouseEnter,
    onBlur: handleMouseLeave,
  });

  return (
    <>
      {trigger}
      
      {createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={tooltipRef}
              className={cn(
                "fixed z-50 rounded-md px-3 py-1.5 text-xs font-medium shadow-md",
                tooltipVariants[variant],
                className
              )}
              style={{ 
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                pointerEvents: 'none',
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={animationVariants[position]}
              transition={{ duration: 0.15 }}
              {...props}
            >
              {content}
              
              {arrow && (
                <div 
                  className={cn(
                    "absolute h-2 w-2",
                    tooltipVariants[variant],
                    getArrowClass()
                  )}
                  aria-hidden="true"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Tooltip;