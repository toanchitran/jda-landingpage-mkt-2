'use client';

import { useCallback } from 'react';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export const useGoogleAnalytics = () => {
  const trackEvent = useCallback((eventName: string, parameters: Record<string, unknown> = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  }, []);

  const trackBookCallClick = useCallback((location: string) => {
    trackEvent('book_call_click', {
      event_category: 'engagement',
      event_label: location,
      value: 1,
      custom_parameter: location,
    });
  }, [trackEvent]);

  const trackSiteDeckClick = useCallback(() => {
    trackEvent('site_deck_click', {
      event_category: 'engagement',
      event_label: 'deckanalysis.fundraisingflywheel.io',
      value: 1,
      custom_parameter: 'deckanalysis.fundraisingflywheel.io',
    });
  }, [trackEvent]);

  const trackLogoClick = useCallback(() => {
    trackEvent('logo_click', {
      event_category: 'navigation',
      event_label: 'jdalchemy_logo',
      value: 1,
      custom_parameter: 'jdalchemy_logo',
    });
  }, [trackEvent]);

  const trackContactFormStart = useCallback(() => {
    trackEvent('contact_form_start', {
      event_category: 'form_interaction',
      event_label: 'contact_form',
      value: 1,
      custom_parameter: 'contact_form',
    });
  }, [trackEvent]);

  const trackContactFormComplete = useCallback(() => {
    trackEvent('contact_form_complete', {
      event_category: 'form_interaction',
      event_label: 'contact_form',
      value: 1,
      custom_parameter: 'contact_form',
    });
  }, [trackEvent]);

  const trackCalendlyStart = useCallback(() => {
    trackEvent('calendly_start', {
      event_category: 'booking',
      event_label: 'calendly_integration',
      value: 1,
      custom_parameter: 'calendly_integration',
    });
  }, [trackEvent]);

  const trackFormFieldInteraction = useCallback((fieldName: string, action: 'focus' | 'blur' | 'change') => {
    trackEvent('form_field_interaction', {
      event_category: 'form_interaction',
      event_label: `${fieldName}_${action}`,
      field_name: fieldName,
      action: action,
      value: 1,
      custom_parameter: `${fieldName}_${action}`,
    });
  }, [trackEvent]);

  const trackPageView = useCallback((pageTitle: string, pagePath: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Get UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');
      const utmTerm = urlParams.get('utm_term');
      const utmContent = urlParams.get('utm_content');

      // Create custom parameters object
      const customParams: Record<string, unknown> = {
        page_title: pageTitle,
        page_location: pagePath,
      };

      // Add UTM parameters if they exist
      if (utmSource) customParams.utm_source = utmSource;
      if (utmMedium) customParams.utm_medium = utmMedium;
      if (utmCampaign) customParams.utm_campaign = utmCampaign;
      if (utmTerm) customParams.utm_term = utmTerm;
      if (utmContent) customParams.utm_content = utmContent;

      window.gtag('config', 'G-16WV2WNMXF', customParams);
    }
  }, []);

  const trackAnalyzeClick = useCallback((fileName: string, fileSize: number) => {
    trackEvent('analyze_click', {
      event_category: 'file_upload',
      event_label: 'pitch_deck_upload',
      file_name: fileName,
      file_size: fileSize,
      value: 1,
      custom_parameter: 'pitch_deck_upload',
    });
  }, [trackEvent]);

  const trackUTMParameters = useCallback(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');

      // Only track if we have UTM parameters
      const hasUTMParams = Boolean(utmSource || utmMedium || utmCampaign);
      if (hasUTMParams) {
        window.gtag('event', 'utm_parameters_detected', {
          event_category: 'traffic_source',
          event_label: 'utm_tracking',
          utm_source: utmSource || 'none',
          utm_medium: utmMedium || 'none',
          utm_campaign: utmCampaign || 'none',
          utm_term: urlParams.get('utm_term') || 'none',
          utm_content: urlParams.get('utm_content') || 'none',
          page_url: window.location.href,
        });
      }
    }
  }, []);

  return {
    trackEvent,
    trackBookCallClick,
    trackSiteDeckClick,
    trackLogoClick,
    trackContactFormStart,
    trackContactFormComplete,
    trackCalendlyStart,
    trackFormFieldInteraction,
    trackPageView,
    trackAnalyzeClick,
    trackUTMParameters,
  };
}; 