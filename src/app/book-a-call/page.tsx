"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ContactForm from "@/components/ContactForm";

export default function BookACallPage() {
  const router = useRouter();
  const [isCalendlyShown, setIsCalendlyShown] = useState(false);

  return (
    <div className="font-sans text-primary-text">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-white font-bold text-xl">
            <Image
              src="/jda-logo-horizontal.png"
              alt="JD Alchemy"
              width={180}
              height={60}
              className="h-8 sm:h-12 w-auto"
            />
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            <button
              className="button relative z-10 cursor-pointer hover:!bg-yellow-400 hover:!text-black transition-colors text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
              onClick={() => router.back()}
            >
            Back &larr;
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Schedule Your Personalized <span className="text-gold">Discovery Call</span>
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed mb-12 text-secondary-text-80 max-w-4xl mx-auto">
              If you&apos;re a startup founder struggling to get investor attention, you might just be one strategic narrative away from transforming from &quot;unrecognized&quot; to &quot;industry authority that investors seek out.&quot;
            </p>
          </div>

          {/* Video Placeholder */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Watch This Quick Video</h2>
              <p className="text-lg text-secondary-text-80 mb-8">
                To book your discovery call: 1) Watch this video to completion 2) Fill out your information 3) Schedule your call
              </p>
            </div>

            <div className="rounded-xl overflow-hidden bg-[#1a1a2e] aspect-video mb-8 flex items-center justify-center">
              <div className="w-20 h-20 bg-gold/90 rounded-full flex items-center justify-center cursor-pointer">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>

            <div className="text-center">
              <p className="text-secondary-text-80 text-sm">📹 Video Explanation - 3 minutes that could change your business forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Qualification Section */}
      <section id="qualification-section" className="py-16 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'var(--primary-bg)'}}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: "#ffffff" }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-black">Get Started with JD Alchemy</h2>
              {!isCalendlyShown && (
                <p className="text-black">Please fill out this quick form to help us prepare for your call</p>
              )}
            </div>
            <ContactForm 
              appearance="light" 
              calendlyHeight={600}
              onCalendlyShow={setIsCalendlyShown}
            />
          </div>
        </div>
      </section>

      {/* Calendly booking is handled inside ContactForm; no separate Calendly section here */}
    </div>
  );
}


