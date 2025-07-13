import { useEffect, useRef, useState } from 'react';
import { 
  canUseComplexGlassmorphism,
  createVisibilityObserver,
  injectCriticalCSS,
  optimizeForAnimation,
  prefersReducedMotion,
  criticalGlassmorphismCSS
} from '@/lib/optimizations';

/**
 * Hook for optimizing UI elements with performance considerations
 * Provides utilities for applying optimizations to glassmorphism and animations
 */
export function useOptimizedUI() {
  // State to track if complex glassmorphism effects should be used
  const [useComplexEffects, setUseComplexEffects] = useState(false);
  // Track if critical CSS has been injected
  const criticalCSSInjected = useRef(false);
  // Track if the component using this hook is visible
  const [isVisible, setIsVisible] = useState(false);
  // Reference to the element to optimize
  const elementRef = useRef<HTMLElement | null>(null);
  
  // Initialize states on mount
  useEffect(() => {
    // Check device capabilities for glassmorphism effects
    setUseComplexEffects(canUseComplexGlassmorphism());
    
    // Inject critical CSS once if not done yet
    if (!criticalCSSInjected.current) {
      injectCriticalCSS(criticalGlassmorphismCSS);
      criticalCSSInjected.current = true;
    }
    
    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMotionPreferenceChange = () => {
      setUseComplexEffects(canUseComplexGlassmorphism());
    };
    
    mediaQuery.addEventListener('change', handleMotionPreferenceChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
    };
  }, []);
  
  // Set up visibility observer when ref is populated
  useEffect(() => {
    if (!elementRef.current) return;
    
    const observer = createVisibilityObserver((entry) => {
      setIsVisible(true);
      
      // Apply performance optimization when element becomes visible
      if (useComplexEffects && entry.target instanceof HTMLElement) {
        optimizeForAnimation(entry.target);
      }
      
      // Stop observing after it's visible to save resources
      observer.unobserve(entry.target);
    });
    
    observer.observe(elementRef.current);
    
    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [elementRef.current, useComplexEffects]);
  
  /**
   * Get the appropriate glassmorphism class based on device capability
   */
  const getOptimizedGlassClass = (variant: string): string => {
    // If device can't handle complex effects, return simpler variant
    if (!useComplexEffects) {
      // Map glass variants to simpler alternatives
      const simplifiedVariants: Record<string, string> = {
        'glass-primary': 'bg-primary/90 border border-primary/20',
        'glass-secondary': 'bg-secondary/90 border border-secondary/20',
        'glass-accent': 'bg-accent/90 border border-accent/20',
        'glass-dark': 'bg-background/90 border border-background/20'
      };
      
      return simplifiedVariants[variant] || variant;
    }
    
    // Otherwise, use full glassmorphism variant
    return variant;
  };
  
  /**
   * Get animation class based on reduced motion preference
   */
  const getOptimizedAnimation = (animationClass: string): string => {
    return prefersReducedMotion() ? '' : animationClass;
  };
  
  return {
    elementRef,
    isVisible,
    useComplexEffects,
    getOptimizedGlassClass,
    getOptimizedAnimation
  };
}
