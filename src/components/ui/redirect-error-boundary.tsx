import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container } from './container';
import { cn } from '@/lib/utils';
import { useOptimizedUI } from '@/hooks/useOptimizedUI';

interface Props {
  children: ReactNode;
  fallbackUrl?: string;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * A responsive error boundary component with glassmorphic styling
 * Shows a friendly error message with the Level SuperMind logo
 */
class RedirectErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by RedirectErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className={cn(
            "glass-primary rounded-xl p-6 md:p-8 lg:p-10 w-full max-w-lg mx-auto text-center relative overflow-hidden",
            "border border-solid border-white/15 shadow-lg",
            this.props.className
          )}>
            {/* Logo - Responsive image */}
            <div className="flex justify-center mb-6">
              <img
                src="/assets/Frame 94.png"
                alt="Level SuperMind"
                width={200}
                height={60}
                className="mb-6"
                loading="eager"
              />
            </div>
            
            <h2 className="text-xl md:text-2xl font-medium text-primary mb-3">Something went wrong</h2>
            <p className="text-md text-foreground/80 mb-6">
              We're sorry, but we encountered an error while loading this page.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = this.props.fallbackUrl || '/'}
                className="glass-accent px-4 py-2 rounded-md text-accent-foreground hover:opacity-90 transition-opacity"
              >
                Go to Home
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="glass-secondary px-4 py-2 rounded-md text-secondary-foreground hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
            
            {/* Decorative glass orbs with responsive sizing */}
            <div className="absolute -top-20 -right-20 w-40 h-40 md:w-52 md:h-52 rounded-full bg-primary/10 blur-xl"></div>
            <div className="absolute -bottom-24 -left-12 w-32 h-32 md:w-40 md:h-40 rounded-full bg-accent/10 blur-xl"></div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to use hooks with class component
export const RedirectErrorBoundary = (props: Props) => {
  const { elementRef, isVisible, useComplexEffects, getOptimizedGlassClass } = useOptimizedUI();
  
  // Generate optimized classes based on visibility and device capabilities
  const optimizedClasses = cn(
    isVisible && 'animate-in fade-in duration-500',
    !useComplexEffects && 'reduced-motion'
  );

  return (
    <RedirectErrorBoundaryClass 
      {...props} 
      className={cn(optimizedClasses, props.className)}
      ref={elementRef as any}
    />
  );
};

// Export a hook to trigger error boundary for testing purposes
export const useErrorBoundary = () => {
  const triggerError = () => {
    throw new Error("Manually triggered error");
  };

  return { triggerError };
};
