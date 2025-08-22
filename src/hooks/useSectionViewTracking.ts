'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGoogleAnalytics } from './useGoogleAnalytics';

interface SectionViewTrackingOptions {
  threshold?: number; // Percentage of section that must be visible (0-1)
  minViewTime?: number; // Minimum time in seconds before tracking view
  trackScrollDepth?: boolean; // Whether to track scroll depth within sections
  scrollDepthThresholds?: number[]; // Scroll depth percentages to track (e.g., [25, 50, 75, 90])
}

interface SectionViewData {
  sectionName: string;
  sectionId?: string;
  startTime: number;
  isVisible: boolean;
  lastScrollDepth: number;
  trackedScrollDepths: Set<number>;
}

export const useSectionViewTracking = (options: SectionViewTrackingOptions = {}) => {
  const {
    threshold = 0.5, // 50% of section must be visible
    minViewTime = 2, // Minimum 2 seconds before tracking
    trackScrollDepth = true,
    scrollDepthThresholds = [25, 50, 75, 90]
  } = options;

  const { trackSectionViewStart, trackSectionViewTime, trackSectionViewEnd, trackSectionScrollDepth } = useGoogleAnalytics();
  const sectionDataRef = useRef<Map<string, SectionViewData>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate scroll depth within a section
  const calculateScrollDepth = useCallback((element: Element): number => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // If section is completely above viewport
    if (rect.bottom <= 0) return 100;
    
    // If section is completely below viewport
    if (rect.top >= windowHeight) return 0;
    
    // Calculate visible portion
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const totalHeight = rect.height;
    
    return Math.round((visibleHeight / totalHeight) * 100);
  }, []);

  // Track scroll depth for a section
  const trackScrollDepthForSection = useCallback((sectionName: string, sectionId: string, currentDepth: number) => {
    const sectionData = sectionDataRef.current.get(sectionName);
    if (!sectionData) return;

    // Check if we've reached any new scroll depth thresholds
    scrollDepthThresholds.forEach(threshold => {
      if (currentDepth >= threshold && !sectionData.trackedScrollDepths.has(threshold)) {
        trackSectionScrollDepth(sectionName, threshold, sectionId);
        sectionData.trackedScrollDepths.add(threshold);
      }
    });

    sectionData.lastScrollDepth = currentDepth;
  }, [trackSectionScrollDepth, scrollDepthThresholds]);

  // Handle intersection observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      const sectionName = entry.target.getAttribute('data-section-name');
      const sectionId = entry.target.getAttribute('data-section-id') || sectionName;
      
      if (!sectionName) return;

      const isVisible = entry.isIntersecting && entry.intersectionRatio >= threshold;
      const currentTime = Date.now();

      if (isVisible) {
        // Section became visible
        if (!sectionDataRef.current.has(sectionName)) {
          // First time seeing this section
          sectionDataRef.current.set(sectionName, {
            sectionName,
            sectionId,
            startTime: currentTime,
            isVisible: true,
            lastScrollDepth: 0,
            trackedScrollDepths: new Set()
          });

          // Track section view start
          trackSectionViewStart(sectionName, sectionId);
        } else {
          // Section was already tracked, just mark as visible again
          const sectionData = sectionDataRef.current.get(sectionName)!;
          sectionData.isVisible = true;
          sectionData.startTime = currentTime;
        }
      } else {
        // Section is no longer visible
        const sectionData = sectionDataRef.current.get(sectionName);
        if (sectionData && sectionData.isVisible) {
          sectionData.isVisible = false;
          
          // Calculate total view time
          const viewTimeSeconds = (currentTime - sectionData.startTime) / 1000;
          
          // Only track if minimum view time is met
          if (viewTimeSeconds >= minViewTime) {
            trackSectionViewEnd(sectionName, viewTimeSeconds, sectionId);
          }
        }
      }
    });
  }, [threshold, minViewTime, trackSectionViewStart, trackSectionViewEnd]);

  // Periodic tracking of view time for visible sections
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      
      sectionDataRef.current.forEach((sectionData, sectionName) => {
        if (sectionData.isVisible) {
          const viewTimeSeconds = (currentTime - sectionData.startTime) / 1000;
          
          // Track view time every 5 seconds for visible sections
          if (viewTimeSeconds >= 5 && Math.floor(viewTimeSeconds) % 5 === 0) {
            trackSectionViewTime(sectionName, viewTimeSeconds, sectionData.sectionId);
          }

          // Track scroll depth if enabled
          if (trackScrollDepth) {
            const element = document.querySelector(`[data-section-name="${sectionName}"]`);
            if (element) {
              const scrollDepth = calculateScrollDepth(element);
              trackScrollDepthForSection(sectionName, sectionData.sectionId!, scrollDepth);
            }
          }
        }
      });
    }, 1000); // Check every second

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [trackSectionViewTime, trackScrollDepth, calculateScrollDepth, trackScrollDepthForSection]);

  // Setup intersection observer
  useEffect(() => {
    if (typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: [0, 0.25, 0.5, 0.75, 1], // Multiple thresholds for better tracking
      rootMargin: '0px 0px -10% 0px' // Consider section visible when 10% is still below viewport
    });

    // Observe all sections with data-section-name attribute
    const sections = document.querySelectorAll('[data-section-name]');
    sections.forEach(section => {
      observerRef.current?.observe(section);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Function to manually add a section for tracking
  const addSectionForTracking = useCallback((element: Element, sectionName: string, sectionId?: string) => {
    element.setAttribute('data-section-name', sectionName);
    if (sectionId) {
      element.setAttribute('data-section-id', sectionId);
    }
    
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  return {
    addSectionForTracking
  };
};
