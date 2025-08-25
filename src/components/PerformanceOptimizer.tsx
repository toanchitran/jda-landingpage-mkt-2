"use client";

import { useEffect } from 'react';

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    const preloadResources = [
      { href: '/hero_bg_thumbnail.jpg', as: 'image' },
      { href: '/ff_logo.png', as: 'image' },
    ];

    preloadResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      document.head.appendChild(link);
    });

    // Lazy load non-critical resources after page load
    const lazyLoadResources = () => {
      const videos = document.querySelectorAll('video[data-src]');
      videos.forEach(video => {
        const videoElement = video as HTMLVideoElement;
        if (videoElement.dataset.src) {
          videoElement.src = videoElement.dataset.src;
          videoElement.load();
        }
      });
    };

    // Load non-critical resources after initial page load
    if (document.readyState === 'complete') {
      setTimeout(lazyLoadResources, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(lazyLoadResources, 1000);
      });
    }

    // Optimize scroll performance
    let ticking = false;
    const optimizedScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Your scroll logic here
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });

    return () => {
      window.removeEventListener('scroll', optimizedScrollHandler);
    };
  }, []);

  return null; // This component doesn't render anything
}
