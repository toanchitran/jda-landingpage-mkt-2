"use client";

import { useEffect } from "react";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";

interface VideoTrackerProps {
  videoTitle: string;
  videoIndex: number;
  embedUrl: string;
}

export default function VideoTracker({ videoTitle, videoIndex, embedUrl }: VideoTrackerProps) {
  const { trackCallConfirmedVideoPlay, trackCallConfirmedVideoComplete } = useGoogleAnalytics();

  useEffect(() => {
    // Track video play events from YouTube iframe
    const handleMessage = (event: MessageEvent) => {
      // Only handle YouTube iframe messages
      if (event.origin !== "https://www.youtube.com") return;
      
      try {
        const data = JSON.parse(event.data);
        
        // YouTube iframe API sends events with info object
        if (data.event === "video-progress" && data.info) {
          const { playerState } = data.info;
          
          // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          if (playerState === 1) {
            // Video started playing
            trackCallConfirmedVideoPlay(videoTitle, videoIndex);
          } else if (playerState === 0) {
            // Video ended
            trackCallConfirmedVideoComplete(videoTitle, videoIndex);
          }
        }
      } catch (error) {
        // Ignore parsing errors
        console.debug("Video tracking: Could not parse message data", error);
      }
    };

    window.addEventListener("message", handleMessage);
    
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [videoTitle, videoIndex, trackCallConfirmedVideoPlay, trackCallConfirmedVideoComplete]);

  const getIframeSrc = () => {
    const baseUrl = embedUrl;
    const separator = embedUrl.includes('?') ? '&' : '?';
    const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
    return `${baseUrl}${separator}enablejsapi=1${origin ? `&origin=${origin}` : ''}`;
  };

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        className="w-full h-full"
        src={getIframeSrc()}
        title={videoTitle || `Training Video ${videoIndex + 1}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
