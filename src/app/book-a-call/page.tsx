"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import ContactForm from "@/components/ContactForm";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";

export default function BookACallPage() {
  const router = useRouter();
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showQualificationSection, setShowQualificationSection] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { trackVideoPlay, trackVideoStop, trackVideoComplete, trackLeadQualificationShow } = useGoogleAnalytics();

  useEffect(() => {
    if (videoCompleted && !showQualificationSection) {
      setShowQualificationSection(true);
      trackLeadQualificationShow();
      
      // Auto scroll to qualification section after a short delay
      setTimeout(() => {
        const qualificationSection = document.getElementById('qualification-section');
        if (qualificationSection) {
          qualificationSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 500); // 500ms delay to ensure the section has rendered
    }
  }, [videoCompleted, showQualificationSection, trackLeadQualificationShow]);

  const handleVideoPlay = () => {
    if (videoRef.current) {
      trackVideoPlay(videoRef.current.currentTime);
    }
  };

  const handleVideoPause = () => {
    if (videoRef.current) {
      trackVideoStop(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    if (videoRef.current) {
      trackVideoComplete(videoRef.current.duration);
      setVideoCompleted(true);
    }
  };

  return (
    <div className="font-sans text-primary-text">
      <style jsx>{`
        video::-webkit-media-controls-timeline {
          display: none !important;
        }
        video::-webkit-media-controls-current-time-display {
          display: none !important;
        }
        video::-webkit-media-controls-time-remaining-display {
          display: none !important;
        }
        video::-moz-progress-bar {
          display: none !important;
        }
        video::-webkit-progress-bar {
          display: none !important;
        }
      `}</style>
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-white font-bold text-xl">
            <button 
                onClick={() => router.back()}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/ff_logo.png"
                  alt="Fundraising Flywheel"
                  width={210}
                  height={65}
                  className="h-8 sm:h-12 w-auto"
                />
              </button>
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            <button
              className="button"
              
              onClick={() => {
                window.open('https://jdalchemy.com', '_blank');
              }}
            >
            About Us
            </button>
          </div>
        </div>
      </nav>

      {/* Hero + Video Section */}
      <section
        className="relative min-h-screen overflow-hidden px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'var(--primary-bg)'}}
      >
        <div className="relative max-w-6xl mx-auto pt-32 pb-16 z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl mb-6 leading-tight">
              Schedule Your Personalized<br/>Discovery Call
            </h1>
            <p className="text-lg md:text-xl leading-relaxed mb-12 max-w-4xl mx-auto" style={{color: 'var(--medium-grey)'}}>
              If you&apos;re a startup founder struggling to get investor attention, you might just be one strategic narrative away from transforming from &quot;unrecognized&quot; to &quot;industry authority that investors seek out.&quot;
            </p>
          </div>

          {/* Video Placeholder */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Watch This Quick Video</h2>
              <p className="text-lg mb-8" style={{color: 'var(--medium-grey)'}}>
                To book your discovery call: 1) Watch this video to completion for pop fill-out form 2) Fill out your information<br/>3) Schedule your call
              </p>
            </div>

            <div className="rounded-xl overflow-hidden bg-[#1a1a2e] aspect-video mb-8">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoEnded}
                controls
                controlsList="nodownload nofullscreen noremoteplayback"
                style={{
                  '--webkit-media-controls-timeline': 'none',
                  '--webkit-media-controls-current-time-display': 'none',
                  '--webkit-media-controls-time-remaining-display': 'none'
                } as React.CSSProperties}
              >
                <source src="/optimized_brandbeam.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="text-center">
              <p className="text-secondary-text-80 text-sm">📹 Video Explanation - 3 minutes that could change your business forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Qualification Section - Only show after video completion */}
      {showQualificationSection && (
        <section id="qualification-section" className="py-16 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'var(--primary-bg)'}}>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: "#ffffff" }}>
              <ContactForm 
                appearance="light" 
                calendlyHeight={600}
                showFormHeader={true}
              />
            </div>
          </div>
        </section>
      )}

      {/* Calendly booking is handled inside ContactForm; no separate Calendly section here */}
    </div>
  );
}


