/**
 * Performance optimization utilities for Windsurf UI Theme
 */

/**
 * Debounce function to limit the rate at which a function can fire
 * Used for performance-intensive operations like glassmorphism transitions
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure a function doesn't run more than once in a specified time period
 * Useful for scroll and resize events that might trigger glassmorphism recalculations
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if reduced motion is preferred by the user
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Use hardware acceleration for animations when available
 * @param element The DOM element to optimize
 */
export function optimizeForAnimation(element: HTMLElement): void {
  // Use hardware acceleration
  element.style.willChange = 'transform';
  element.style.transform = 'translateZ(0)';
  
  // Clean up after animation ends to free resources
  element.addEventListener('transitionend', () => {
    element.style.willChange = 'auto';
  }, { once: true });
}

/**
 * Create an intersection observer to only animate elements when they're in view
 * @param callback Function to run when element is visible
 */
export function createVisibilityObserver(
  callback: (entry: IntersectionObserverEntry) => void
): IntersectionObserver {
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });
}

/**
 * Apply glassmorphism effects conditionally based on device capability
 * @returns Boolean indicating if device can handle complex glassmorphism
 */
export function canUseComplexGlassmorphism(): boolean {
  // Check for backdrop-filter support
  const hasBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)');
  
  // Check for decent performance (heuristic)
  const isHighEndDevice = window.navigator.hardwareConcurrency > 4;
  
  return hasBackdropFilter && isHighEndDevice && !prefersReducedMotion();
}

/**
 * Apply critical CSS inline to speed up initial rendering
 * @param css The CSS string to inject
 */
export function injectCriticalCSS(css: string): void {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

// Critical CSS for glassmorphism components
export const criticalGlassmorphismCSS = `
  .glass-primary,
  .glass-secondary,
  .glass-accent,
  .glass-dark {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transform: translateZ(0);
  }
`;
