import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Set to true to use full width on mobile and constrained width on larger screens
   */
  responsive?: boolean;
  /**
   * Set to true to use the max-width from the container configuration
   */
  maxWidth?: boolean;
  /**
   * Add padding to the container
   */
  withPadding?: boolean;
}

/**
 * A responsive container component for Windsurf UI Theme
 * Uses Tailwind's container class along with additional responsive behavior
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    responsive = true, 
    maxWidth = true, 
    withPadding = true, 
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'mx-auto w-full',
          
          // Responsive width control
          responsive && 'px-4 sm:px-6 lg:px-8',
          
          // Maximum width control
          maxWidth && 'max-w-7xl',
          
          // Padding control
          withPadding && 'py-6 md:py-8',
          
          // Custom class
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

/**
 * A 12-column grid component that works with the Windsurf design system
 */
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Set the number of columns to use at different breakpoints
   */
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /**
   * Set the gap size between grid items
   */
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }, gap = 'md', children, ...props }, ref) => {
    // Map gap sizes to Tailwind classes
    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4 md:gap-6',
      lg: 'gap-6 md:gap-8',
      xl: 'gap-8 md:gap-12'
    };
    
    // Generate column classes based on breakpoint settings
    const colClasses = [
      cols.xs && `grid-cols-${cols.xs}`,
      cols.sm && `sm:grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`,
      cols.xl && `xl:grid-cols-${cols.xl}`,
    ].filter(Boolean);
    
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          gapClasses[gap],
          ...colClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

/**
 * A flexible responsive column component for use within Grid layouts
 */
interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns to span at different breakpoints (out of 12)
   */
  span?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /**
   * Start column position at different breakpoints (out of 12)
   */
  start?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const Col = React.forwardRef<HTMLDivElement, ColProps>(
  ({ className, span, start, children, ...props }, ref) => {
    // Generate span classes
    const spanClasses = span ? [
      span.xs && `col-span-${span.xs}`,
      span.sm && `sm:col-span-${span.sm}`,
      span.md && `md:col-span-${span.md}`,
      span.lg && `lg:col-span-${span.lg}`,
      span.xl && `xl:col-span-${span.xl}`,
    ].filter(Boolean) : [];
    
    // Generate start classes
    const startClasses = start ? [
      start.xs && `col-start-${start.xs}`,
      start.sm && `sm:col-start-${start.sm}`,
      start.md && `md:col-start-${start.md}`,
      start.lg && `lg:col-start-${start.lg}`,
      start.xl && `xl:col-start-${start.xl}`,
    ].filter(Boolean) : [];
    
    return (
      <div
        ref={ref}
        className={cn(
          ...spanClasses,
          ...startClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Col.displayName = 'Col';
