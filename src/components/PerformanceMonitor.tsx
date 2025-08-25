"use client";

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    const reportWebVitals = (metric: any) => {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Web Vital:', metric);
      }
      
      // Send to analytics in production
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        });
      }
    };

    // Dynamically import web-vitals to avoid bundle bloat
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(reportWebVitals);
      onFID(reportWebVitals);
      onFCP(reportWebVitals);
      onLCP(reportWebVitals);
      onTTFB(reportWebVitals);
    }).catch(() => {
      // web-vitals not available, skip monitoring
    });

    // Monitor resource loading performance
    const monitorResources = () => {
      if ('performance' in window) {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const largeResources = resources.filter(resource => 
          resource.transferSize > 100000 // Resources larger than 100KB
        );
        
        if (largeResources.length > 0 && process.env.NODE_ENV === 'development') {
          console.warn('Large resources detected:', largeResources.map(r => ({
            name: r.name,
            size: Math.round(r.transferSize / 1024) + 'KB',
            duration: Math.round(r.duration) + 'ms'
          })));
        }
      }
    };

    // Run resource monitoring after page load
    if (document.readyState === 'complete') {
      setTimeout(monitorResources, 2000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(monitorResources, 2000);
      });
    }

  }, []);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
