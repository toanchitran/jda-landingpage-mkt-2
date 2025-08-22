'use client';

import { useCallback } from 'react';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    GA_SESSION_ID?: string;
  }
}

export const useGoogleAnalytics = () => {
  // Helper function to get session ID
  const getSessionId = useCallback(() => {
    if (typeof window !== 'undefined' && window.GA_SESSION_ID) {
      return window.GA_SESSION_ID;
    }
    return null;
  }, []);

  const trackEvent = useCallback((eventName: string, parameters: Record<string, unknown> = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Add session ID to all events if available
      const sessionId = getSessionId();
      if (sessionId) {
        parameters.session_id_custom = sessionId;
      }
      
      window.gtag('event', eventName, parameters);
    }
  }, [getSessionId]);

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

      // Add session ID if available
      const sessionId = getSessionId();
      if (sessionId) {
        customParams.session_id_custom = sessionId;
      }

      // Add UTM parameters if they exist
      if (utmSource) customParams.utm_source = utmSource;
      if (utmMedium) customParams.utm_medium = utmMedium;
      if (utmCampaign) customParams.utm_campaign = utmCampaign;
      if (utmTerm) customParams.utm_term = utmTerm;
      if (utmContent) customParams.utm_content = utmContent;

      window.gtag('config', 'G-16WV2WNMXF', customParams);
    }
  }, [getSessionId]);

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
        const eventParams: Record<string, unknown> = {
          event_category: 'traffic_source',
          event_label: 'utm_tracking',
          utm_source: utmSource || 'none',
          utm_medium: utmMedium || 'none',
          utm_campaign: utmCampaign || 'none',
          utm_term: urlParams.get('utm_term') || 'none',
          utm_content: urlParams.get('utm_content') || 'none',
          page_url: window.location.href,
        };

        // Add session ID if available
        const sessionId = getSessionId();
        if (sessionId) {
          eventParams.session_id_custom = sessionId;
        }

        window.gtag('event', 'utm_parameters_detected', eventParams);
      }
    }
  }, [getSessionId]);

  const trackVideoPlay = useCallback((currentTime: number) => {
    trackEvent('video_play', {
      event_category: 'video_interaction',
      event_label: 'book_call_video',
      video_current_time: currentTime,
      value: 1,
      custom_parameter: 'book_call_video_play',
    });
  }, [trackEvent]);

  const trackVideoStop = useCallback((currentTime: number, duration: number) => {
    trackEvent('video_stop', {
      event_category: 'video_interaction',
      event_label: 'book_call_video',
      video_current_time: currentTime,
      video_duration: duration,
      completion_percentage: Math.round((currentTime / duration) * 100),
      value: 1,
      custom_parameter: 'book_call_video_stop',
    });
  }, [trackEvent]);

  const trackVideoComplete = useCallback((duration: number) => {
    trackEvent('video_complete', {
      event_category: 'video_interaction',
      event_label: 'book_call_video',
      video_duration: duration,
      completion_percentage: 100,
      value: 1,
      custom_parameter: 'book_call_video_complete',
    });
  }, [trackEvent]);

  // Enhanced video tracking with custom metrics for GA4
  const trackVideoStart = useCallback((videoTitle: string = 'book_call_video') => {
    trackEvent('video_start', {
      event_category: 'video_interaction',
      event_label: videoTitle,
      video_title: videoTitle,
      video_view: 1, // Custom metric for video views
      value: 1,
      custom_parameter: `${videoTitle}_start`,
    });
  }, [trackEvent]);

  const trackVideoProgress = useCallback((currentTime: number, duration: number, videoTitle: string = 'book_call_video') => {
    const progressPercentage = Math.round((currentTime / duration) * 100);
    
    trackEvent('video_progress', {
      event_category: 'video_interaction',
      event_label: videoTitle,
      video_title: videoTitle,
      video_current_time: currentTime,
      video_duration: duration,
      progress_percentage: progressPercentage,
      video_play_time: currentTime, // Custom metric for cumulative play time
      value: 1,
      custom_parameter: `${videoTitle}_progress_${progressPercentage}`,
    });
  }, [trackEvent]);

  const trackVideoPause = useCallback((currentTime: number, duration: number, videoTitle: string = 'book_call_video') => {
    const progressPercentage = Math.round((currentTime / duration) * 100);
    
    trackEvent('video_pause', {
      event_category: 'video_interaction',
      event_label: videoTitle,
      video_title: videoTitle,
      video_current_time: currentTime,
      video_duration: duration,
      progress_percentage: progressPercentage,
      video_play_time: currentTime, // Custom metric for cumulative play time
      value: 1,
      custom_parameter: `${videoTitle}_pause`,
    });
  }, [trackEvent]);

  const trackVideoEnd = useCallback((duration: number, videoTitle: string = 'book_call_video') => {
    trackEvent('video_end', {
      event_category: 'video_interaction',
      event_label: videoTitle,
      video_title: videoTitle,
      video_duration: duration,
      video_play_time: duration, // Custom metric for total play time
      completion_percentage: 100,
      value: 1,
      custom_parameter: `${videoTitle}_end`,
    });
  }, [trackEvent]);

  // Track video engagement milestones (25%, 50%, 75%, 90%)
  const trackVideoMilestone = useCallback((milestone: number, currentTime: number, duration: number, videoTitle: string = 'book_call_video') => {
    trackEvent('video_milestone', {
      event_category: 'video_interaction',
      event_label: videoTitle,
      video_title: videoTitle,
      milestone_percentage: milestone,
      video_current_time: currentTime,
      video_duration: duration,
      video_play_time: currentTime, // Custom metric for cumulative play time
      value: 1,
      custom_parameter: `${videoTitle}_milestone_${milestone}`,
    });
  }, [trackEvent]);

  const trackLeadQualificationShow = useCallback(() => {
    trackEvent('lead_qualification_show', {
      event_category: 'form_interaction',
      event_label: 'qualification_section',
      value: 1,
      custom_parameter: 'qualification_section_show',
    });
  }, [trackEvent]);

  const trackCallConfirmedVideoPlay = useCallback((videoTitle: string, videoIndex: number) => {
    trackEvent('call_confirmed_video_play', {
      event_category: 'video_interaction',
      event_label: 'call_confirmed_training',
      video_title: videoTitle,
      video_index: videoIndex,
      value: 1,
      custom_parameter: `call_confirmed_video_${videoIndex}`,
    });
  }, [trackEvent]);

  const trackCallConfirmedVideoComplete = useCallback((videoTitle: string, videoIndex: number) => {
    trackEvent('call_confirmed_video_complete', {
      event_category: 'video_interaction',
      event_label: 'call_confirmed_training',
      video_title: videoTitle,
      video_index: videoIndex,
      completion_percentage: 100,
      value: 1,
      custom_parameter: `call_confirmed_video_complete_${videoIndex}`,
    });
  }, [trackEvent]);

  const trackAudioPlay = useCallback((currentTime: number, audioSrc: string) => {
    trackEvent('audio_play', {
      event_category: 'audio_interaction',
      event_label: 'home_page_audio',
      audio_src: audioSrc,
      audio_current_time: currentTime,
      value: 1,
      custom_parameter: 'home_page_audio_play',
    });
  }, [trackEvent]);

  const trackAudioPause = useCallback((currentTime: number, duration: number, audioSrc: string) => {
    trackEvent('audio_pause', {
      event_category: 'audio_interaction',
      event_label: 'home_page_audio',
      audio_src: audioSrc,
      audio_current_time: currentTime,
      audio_duration: duration,
      completion_percentage: Math.round((currentTime / duration) * 100),
      value: 1,
      custom_parameter: 'home_page_audio_pause',
    });
  }, [trackEvent]);

  const trackAudioComplete = useCallback((duration: number, audioSrc: string) => {
    trackEvent('audio_complete', {
      event_category: 'audio_interaction',
      event_label: 'home_page_audio',
      audio_src: audioSrc,
      audio_duration: duration,
      completion_percentage: 100,
      value: 1,
      custom_parameter: 'home_page_audio_complete',
    });
  }, [trackEvent]);

  // Section view time tracking functions
  const trackSectionViewStart = useCallback((sectionName: string, sectionId?: string) => {
    trackEvent('section_view_start', {
      event_category: 'section_engagement',
      event_label: sectionName,
      section_name: sectionName,
      section_id: sectionId || sectionName,
      value: 1,
      custom_parameter: `${sectionName}_view_start`,
    });
  }, [trackEvent]);

  const trackSectionViewTime = useCallback((sectionName: string, viewTimeSeconds: number, sectionId?: string) => {
    trackEvent('section_view_time', {
      event_category: 'section_engagement',
      event_label: sectionName,
      section_name: sectionName,
      section_id: sectionId || sectionName,
      section_view_time: viewTimeSeconds, // Custom metric for section view time
      value: 1,
      custom_parameter: `${sectionName}_view_time`,
    });
  }, [trackEvent]);

  const trackSectionViewEnd = useCallback((sectionName: string, totalViewTimeSeconds: number, sectionId?: string) => {
    trackEvent('section_view_end', {
      event_category: 'section_engagement',
      event_label: sectionName,
      section_name: sectionName,
      section_id: sectionId || sectionName,
      section_view_time: totalViewTimeSeconds, // Custom metric for total section view time
      value: 1,
      custom_parameter: `${sectionName}_view_end`,
    });
  }, [trackEvent]);

  const trackSectionScrollDepth = useCallback((sectionName: string, scrollPercentage: number, sectionId?: string) => {
    trackEvent('section_scroll_depth', {
      event_category: 'section_engagement',
      event_label: sectionName,
      section_name: sectionName,
      section_id: sectionId || sectionName,
      scroll_percentage: scrollPercentage,
      value: 1,
      custom_parameter: `${sectionName}_scroll_${scrollPercentage}`,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    getSessionId,
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
    trackVideoPlay,
    trackVideoStop,
    trackVideoComplete,
    trackLeadQualificationShow,
    trackCallConfirmedVideoPlay,
    trackCallConfirmedVideoComplete,
    trackAudioPlay,
    trackAudioPause,
    trackAudioComplete,
    // Enhanced video tracking functions
    trackVideoStart,
    trackVideoProgress,
    trackVideoPause,
    trackVideoEnd,
    trackVideoMilestone,
    // Section view time tracking functions
    trackSectionViewStart,
    trackSectionViewTime,
    trackSectionViewEnd,
    trackSectionScrollDepth,
  };
}; 