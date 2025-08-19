"use client";

import Image from "next/image";
import { useEffect, useState, useRef, useMemo } from "react";
// import ContactForm from "@/components/ContactForm";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";

// Audio Player Component with Animation
function AudioPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  // const [currentTime, setCurrentTime] = useState(0);
  // const [duration, setDuration] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | null>(null);
  const { trackAudioPlay, trackAudioPause, trackAudioComplete } = useGoogleAnalytics();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize wave heights - only on client to prevent hydration mismatch
  useEffect(() => {
    if (mounted) {
      const heights = Array.from({ length: 120 }, () => Math.random() * 30 + 20);
      setWaveHeights(heights);
    }
  }, [mounted]);

  // Animate waveform when playing
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setWaveHeights(prev => prev.map(() => Math.random() * 70 + 20));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // const updateTime = () => setCurrentTime(audio.currentTime);
    // const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      trackAudioComplete(audio.duration, src);
    };

    // audio.addEventListener('timeupdate', updateTime);
    // audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      // audio.removeEventListener('timeupdate', updateTime);
      // audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [trackAudioComplete, src]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      trackAudioPause(audio.currentTime, audio.duration, src);
    } else {
      audio.play();
      trackAudioPlay(audio.currentTime, src);
    }
    setIsPlaying(!isPlaying);
  };

  // const formatTime = (time: number) => {
  //   const minutes = Math.floor(time / 60);
  //   const seconds = Math.floor(time % 60);
  //   return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  // };

  // const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full rounded-2xl p-8 bg-transparent">
      <audio ref={audioRef} src={src} />
      
      {/* Waveform with Play Button Overlay */}
      <div className="relative w-full h-32 flex items-center justify-center">
        {/* Full Width Waveform */}
        <div className="absolute inset-0 flex items-end justify-stretch">
          {waveHeights.map((height, i) => (
            <div
              key={i}
              className="rounded-t transition-all duration-75"
              style={{
                backgroundColor: '#c0a876',
                height: `${height}%`,
                opacity: isPlaying ? 1 : 0.7,
                width: `${100 / waveHeights.length}%`,
                marginRight: i < waveHeights.length - 1 ? '1px' : '0',
              }}
            />
          ))}
        </div>
        
        {/* Play/Pause Button Overlay */}
        <div className="relative z-10">
          <button
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            style={{backgroundColor: '#6b624b', color: '#ffffff'}}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}



// Interactive Workflow Component
function InteractiveWorkflow({ onBookCall }: { onBookCall: (location?: string) => void }) {
  const [activeFeature, setActiveFeature] = useState('share');

  const features = {
    share: {
      title: 'You Provide the Raw Material',
      description: 'The easy part. You share your vision, key milestones, and unique industry insights - the core data we need to begin your narrative audit.',
      imageText: 'You Provide the Raw Material',
      image:'/You Provide the Raw Material-v2.jpg'
    },
    refine: {
      title: 'We Forge Your Narrative',
      description: 'We provide the expert framework and guidance to help you forge your own investor-grade narrative, aligning every word with your fundraising goals.',
      imageText: 'We Forge Your Narrative',
      image:'/We Forge Your Narrative-v2.jpg'
    },
    tailor: {
      title: 'You Command the Conversation',
      description: 'With a clear strategic roadmap, you can now deploy your PR activities with purpose and precision.',
      imageText: 'You Command the Conversation',
      image:'/You Command the Conversation-v2.jpg'
    },
    // amplify: {
    //   title: 'Amplify',
    //   description: 'Strategic posting, engagement monitoring, and real-time optimization keep your message reaching the right people',
    //   imageText: 'Amplify - Product UI',
    //   image:'/Amplify.png'
    // }
  };

  return (
    <div className="text-primary-text rounded-3xl" style={{backgroundColor: 'var(--primary-bg)'}}>
      <div className="mb-8 padding-global text-left items-center justify-center">
        <h3 className="text-2xl sm:text-3xl md:text-4xl mb-3 pt-6">Your Simple 3-Step Plan to a Compelling Story</h3>
        <p className="mb-6" style={{color: 'var(--medium-grey)'}}> Stop scrambling for content and start commanding investor attention.</p>
        <button 
          onClick={() => onBookCall('workflow_section')}
          className="button"
        >
          Book a call
        </button>
      </div>
      
      {/* Desktop Layout - Grid with Product UI Screenshot */}
      <div className="hidden md:block padding-global">
        {/* Product UI Screenshot */}
        <div className="w-full mb-8">
          <div className="aspect-video bg-card-accent-2 rounded-2xl flex items-center justify-center overflow-hidden mb-12">
            <Image
              src={features[activeFeature as keyof typeof features].image}
              alt={features[activeFeature as keyof typeof features].imageText}
              width={800}
              height={450}
              className="w-full h-full object-cover"
              unoptimized={true}
            />
          </div>
        </div>
        
        {/* Feature Columns - Improved for better visibility */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {Object.entries(features).map(([key, feature]) => (
            <div 
              key={key}
              className={`p-2 cursor-pointer transition-all duration-300 border-t-2 mb-12 ${
                activeFeature === key 
                  ? 'opacity-100 border-t-accent-elements bg-card-elevated shadow-lg transform scale-105' 
                  : 'opacity-70 border-t-transparent bg-card-elevated/50 hover:opacity-90 hover:bg-card-elevated/70'
              }`}
              onClick={() => setActiveFeature(key)}
            >
              <div 
                className={`w-full h-0.5 mb-3 transition-colors duration-300 ${
                  activeFeature === key ? 'bg-accent-elements' : 'bg-secondary-text-80'
                }`}
              ></div>
              <h4 className="text-xl font-bold mb-2 text-left text-white">{feature.title}</h4>
              <p className="text-sm text-left leading-relaxed" style={{color: 'var(--medium-grey)'}}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile/Tablet Layout - Single Column with Image and Text */}
      <div className="md:hidden space-y-8">
        {Object.entries(features).map(([key, feature]) => (
          <div 
            key={key}
            className="cursor-pointer transition-all duration-300 opacity-100"
            onClick={() => setActiveFeature(key)}
          >
            {/* Feature Image */}
            <div className="w-full mb-4">
              <div className="aspect-video bg-card-accent-2 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.imageText}
                  width={600}
                  height={340}
                  className="w-full h-full object-cover"
                  unoptimized={true}
                />
              </div>
            </div>
            
            {/* Feature Content */}
            <div className="p-4">
              <div className="w-full h-0.5 bg-black mb-3"></div>
              <h4 className="text-xl font-bold mb-2 text-left">{feature.title}</h4>
              <p className="text-sm text-left" style={{color: 'var(--secondary-text-80)'}}>
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Carousel state variables
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(500); // Default width
  const [gapSize, setGapSize] = useState(6); // Default gap (0.375rem = 6px)
  const [isMobile, setIsMobile] = useState(false);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll detection for nav transparency
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const isDesktop = window.innerWidth >= 768;
      
      if (isDesktop) {
        setIsScrolled(scrollTop > 50); // Change transparency after 50px scroll on desktop
      } else {
        setIsScrolled(true); // Always show background on mobile
      }
    };

    if (mounted) {
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      // Check initial scroll position
      handleScroll();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [mounted]);

  // Marquee tags source
  const marqueeTags = useMemo(() => [
    'Access Top-Tier Capital',
    'Higher Valuation Multiples',
    'Favorable Funding Terms',
    'Dismantle Skepticism',
    'Attract premier investors',
    'Boost company valuation',
    'Eliminate investor doubt',
    'Secure better terms'

  ], []);

  const shuffle = (items: string[]): string[] => {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const repeat = (items: string[], times: number): string[] => {
    return Array.from({ length: times }).flatMap(() => items);
  };

  const row1 = useMemo(() => mounted ? repeat(shuffle(marqueeTags), 3) : repeat(marqueeTags, 3), [marqueeTags, mounted]);
  const row2 = useMemo(() => mounted ? repeat(shuffle(marqueeTags), 3) : repeat(marqueeTags, 3), [marqueeTags, mounted]);
  const row3 = useMemo(() => mounted ? repeat(shuffle(marqueeTags), 3) : repeat(marqueeTags, 3), [marqueeTags, mounted]);
  const carouselCards: { key: string; title: string; description: string; videoSrc: string }[] = [
    {
      key: 'Investor_Magnet',
      title: 'Investor Magnet',
      description:
        "Your strategic narrative consistently draws potential investors to you, so you don't have to constantly seek them out.",
      videoSrc: '/Investor_Magnet.mp4',
    },
    {
      key: 'Funding_Advantage',
      title: 'Funding Advantage',
      description:
        "A clear story helps investors instantly understand your vision and market potential, turning a technical achievement into a compelling commercial story.",
      videoSrc: '/Funding_Advantage.mp4',
    },
    {
      key: 'Brand_Power',
      title: 'Brand Power',
      description:
        'A well-articulated narrative builds a memorable brand identity that makes your company stand out and stick in the minds of decision-makers.',
      videoSrc: '/Brand_Power.mp4',
    },
    {
      key: 'Competitive_Edge',
      title: 'Competitive Edge',
      description:
        'Your unique story differentiates you from the competition, ensuring yours is the one investors remember and discuss.',
      videoSrc: '/Competitive_Edge.mp4',
    },
    // {
    //   key: 'always_available',
    //   title: 'Always Available',
    //   description:
    //     '24/7 content creation and engagement monitoring, so you never miss an opportunity to connect with potential investors.',
    //   videoSrc: '/always_available.mp4',
    // },
  ];
  const totalSlides = carouselCards.length;

  // Google Analytics tracking
  const {
    trackBookCallClick,
    trackSiteDeckClick,
    trackLogoClick,
    trackPageView,
    trackUTMParameters,
  } = useGoogleAnalytics();

  // Track page view and UTM parameters on component mount - only on client
  useEffect(() => {
    if (mounted) {
      trackPageView('JD Alchemy - Digital PR Specialists', window.location.pathname);
      trackUTMParameters();
    }
  }, [trackPageView, trackUTMParameters, mounted]);

  const handleBookCall = (location: string = 'hero_section') => {
    trackBookCallClick(location);
    window.location.href = '/book-a-call';
  };

  const handleBookCallHero = () => handleBookCall('hero_section');
  const handleBookCallWorkflow = () => handleBookCall('workflow_section');
  const handleBookCallCarousel = () => handleBookCall('carousel_section');
  const handleBookCallConsider = () => handleBookCall('consider_section');
  const handleBookCallBottom = () => handleBookCall('bottom_cta_section');

 

  // Carousel navigation function - currently unused but kept for future use
  // const scrollCarousel = (direction: 'prev' | 'next') => {
  //   if (direction === 'prev') {
  //     setCurrentSlide(current => current === 0 ? 4 : current - 1);
  //   } else {
  //     setCurrentSlide(current => current === 4 ? 0 : current + 1);
  //   }
  // };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleCardClick = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-advance carousel every 2 seconds (pause when hovered)
  useEffect(() => {
    if (isCarouselHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide(current => (current + 1) % totalSlides);
    }, 2000);

    return () => clearInterval(interval);
  }, [totalSlides, isCarouselHovered]);

  // Handle seamless loop when reaching the end
  useEffect(() => {
    const carousel = document.querySelector('.carousel-container') as HTMLElement;
    if (carousel) {
      carousel.addEventListener('transitionend', () => {
        if (currentSlide === totalSlides) {
          // When we reach the duplicate card, instantly jump back to the first card
          carousel.style.transition = 'none';
          setCurrentSlide(0);
          // Force a reflow
          void carousel.offsetHeight;
          carousel.style.transition = 'transform 700ms ease-in-out';
        }
      });
    }
  }, [currentSlide, totalSlides]);



               // Calculate card width and gap size for responsive carousel
  useEffect(() => {
    const updateCardDimensions = () => {
      if (cardRef.current && cardRef.current.parentElement) {
        const gapStyle = window.getComputedStyle(cardRef.current.parentElement);
        setCardWidth(cardRef.current.offsetWidth);
        setGapSize(parseInt(gapStyle.gap));
      }
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    updateCardDimensions();
    checkMobile();
    
    // Update on window resize for better mobile responsiveness
    window.addEventListener('resize', () => {
      updateCardDimensions();
      checkMobile();
    });
    
    return () => window.removeEventListener('resize', () => {
      updateCardDimensions();
      checkMobile();
    });
  }, []);

  return (
    <div className="font-sans text-primary-text">

      <section className="relative min-h-screen overflow-hidden" style={{backgroundColor: 'var(--primary-bg)'}}>
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/Hero_BG_video.mp4" type="video/mp4" />
          </video>
          {/* <div className="absolute" style={{backgroundColor: 'var(--primary-bg)'}}></div> */}
        </div>
        
        {/* Navigation */}
        <nav 
          className={`fixed top-0 left-0 right-0 z-50 padding-global py-2 sm:py-4 transition-all duration-300 ${
            isScrolled ? 'backdrop-blur-md' : 'md:backdrop-blur-none'
          }`} 
          style={{
            backgroundColor: isScrolled ? 'rgba(3, 3, 46, 0.9)' : 'transparent'
          }}
        >
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="text-white font-bold text-xl">
              <button 
                onClick={() => {
                  trackLogoClick();
                  window.open('https://jdalchemy.com', '_blank');
                }}
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
              {/* <button 
                onClick={handleBookCall}
                className="button relative z-10 cursor-pointer hover:!bg-yellow-400 hover:!text-black transition-colors"
              >
                Book a call
              </button> */}
              <button 
                onClick={() => {
                  trackSiteDeckClick();
                  window.open('https://deckanalysis.fundraisingflywheel.io/', '_blank');
                }}
                className="button relative z-10"
              >
                Free Assessment
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative max-w-6xl mx-auto pt-24 sm:pt-28 pb-16 sm:pb-24 flex items-center min-h-screen z-10 padding-global">
          <div className="text-primary-text">
            <h1 className="is-hero font-bold mb-4 leading-tight">
              Triple Your<br/>Investor Engagement Without Becoming a Content Slave
            </h1>
            {/* <div className="w-80 h-0.5 bg-accent-elements mb-6"></div> */}
            <p className="text-lg sm:text-xl md:text-2xl leading-relaxed mb-6 sm:mb-8" style={{color: 'var(--light-grey)'}}>
            Attract the funding you deserve by shaping your company&apos;s narrative, and make your insights scalable.
            </p>
            <button onClick={handleBookCallHero} className="button relative z-10">
              Book a call
            </button>
          </div>
        </div>
      </section>

             {/*  Is Your Genius Getting Lost in the Noise - Fullscreen with Podcast Background */}
        <section 
          className="relative min-h-screen flex items-center justify-center"
          style={{backgroundColor: 'var(--secondary-bg)'}}
        >
          {/* <div className="absolute inset-0"> */}
            {/* <Image
              src="/Podcast_Audio_BG.png"
              alt="Podcast Audio Background"
              fill
              className="object-cover"
              priority
              unoptimized={true}
            /> */}
            
            {/* <div className="absolute inset-0" style={{backgroundColor: 'rgba(9, 9, 62, 0.7)'}}></div> */}
          {/* </div> */}
          
          
          <div className="max-w-6xl mx-auto relative z-10 padding-global">
            <div className="text-center mb-6 sm:mb-8">
             <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 text-white">Is Your Genius Getting Lost in the Noise?</h1>
              <p className="max-w-3xl mx-auto" style={{color: 'var(--medium-grey)'}}>
              You&apos;ve built a groundbreaking product. You&apos;ve hit your milestones. But you still feel like you&apos;re shouting into the void. You see lesser ideas get funded while you struggle to get a second meeting. This isn&apos;t a product problem; it&apos;s a narrative problem. Investors don&apos;t just invest in products; they invest in stories.
              </p>
            </div>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl p-4 bg-white shadow-lg">
              <div className="aspect-video rounded-xl overflow-hidden">
                <video
                  controls
                  poster="/Podcast_thumbnail.png"
                  className="w-full h-full object-cover"
                >
                  <source src="/Jay-David-Podcast.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-center text-gray-600 text-sm mt-2">Watch our podcast</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your Digital PR Team Section - Deep Blue */}
      <section className="py-16 sm:py-20 padding-global" style={{backgroundColor: 'var(--primary-bg)'}}>
        <div className="max-w-6xl mx-auto padding-global">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 text-primary-text">Where Founder Insight Becomes Investor Magnetism</h1>
            <p className="max-w-4xl mx-auto" style={{color: 'var(--medium-grey)'}}>
            You&apos;ve built something remarkable, but investor trust isn&apos;t automatic. The story behind your work feels invisible, and generic advice falls flat. What you need isn&apos;t another AI tool or agency; it&apos;s a partner who can decode your journey, uncover your real narrative, and tune it for the capital markets you want to win.  
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 items-stretch">
            {/* JayJin - Narrative Architect */}
            <div className="bg-transparent rounded-2xl p-8 flex flex-col">
              {/* Agent Image with Overlay */}
              <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl rounded-lg overflow-hidden shadow-sm" style={{aspectRatio: '3/4'}}>
                  <video
                    src="/Jay.mp4"
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                      />
                      
                      {/* Overlay Tags */}
                      <div className="absolute inset-0">
                        {/* Top Tag */}
                        <div className="absolute top-4 left-4">
                          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                          Jay Jin, Strategic Architect
                          </div>
                        </div>
                        
                        {/* Bottom Tag */}
                        {/* <div className="absolute top-16 left-4">
                          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            Autopilot activated
                          </div>
                        </div> */}
                      </div>
                  

                </div>
              </div>
              
              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-3 text-white">Jay Jin, Strategic Architect</h3>
                <p className="mb-6 leading-relaxed" style={{color: 'var(--medium-grey)'}}>
                Jay is your social influence architect. He helps you identify and engineer the authentic story that investors need to hear, turning your lived experience into a capital-attracting force. His expertise leads to a powerful, actionable 90-Day Investment PR Plan that makes you more attractive and influential.
                </p>
              </div>
              <a 
                href="https://www.linkedin.com/in/jay-jin-60071238/" 
                target="_blank" 
                rel="noopener"
                className="text-white font-semibold hover:text-gray-200 transition-colors mt-auto"
              >
                Meet Jay →
              </a>
            </div>
            
            {/* David Yi, Investment Strategist */}
            <div className="bg-transparent rounded-2xl p-8 flex flex-col">
              {/* Agent Image with Overlay */}
              <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl rounded-lg overflow-hidden shadow-sm" style={{aspectRatio: '3/4'}}>
                
                  <video
                    src="/David.mp4"
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                      
                      {/* Overlay Tags */}
                      <div className="absolute inset-0">
                        {/* Top Tag */}
                        <div className="absolute top-4 left-4">
                          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                          David Yi, Investment Strategist
                          </div>
                        </div>
                        
                        {/* Bottom Tag */}
                        {/* <div className="absolute top-16 left-4">
                          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            Active
                          </div>
                        </div> */}
                      </div>
                  

                </div>
              </div>
              
                            <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-3 text-white">David Yi, Investment Strategist</h3>
                <p className="mb-6 leading-relaxed" style={{color: 'var(--medium-grey)'}}>
                David is your cross-border investment strategist. He provides the critical lens of an investor, ensuring every piece of your story is calibrated with discernment to attract the right conversations and secure funding.
                </p>
              </div>
              <a 
                href="https://www.linkedin.com/in/thedavidyi/" 
                target="_blank" 
                rel="noopener"
                className="text-white font-semibold hover:text-gray-200 transition-colors mt-auto"
              >
                Meet David →
              </a>
            </div>
          </div>
        </div>
      </section>



      {/*  The Funded Future You Can Build - Deep Blue */}
      <section className="py-16 sm:py-20 padding-global" style={{backgroundColor: 'var(--secondary-bg)'}}>
        <div className="w-full padding-global">
          <div className="text-center mb-8 padding-global">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 text-primary-text"> The Funded Future You Can Build</h1>
            <p className="max-w-4xl mx-auto mb-6" style={{color: 'var(--medium-grey)'}}>
            This is the transformation you&apos;ve been working for - a clear, compelling narrative that changes your trajectory. Our strategic guidance fundamentally rewrites how investors see your company, leading to powerful business outcomes that define your legacy.
            </p>
            <button 
              onClick={handleBookCallConsider}
              className="button mb-8"
            >
              Book a call
            </button>
          </div>
          
                         {/* Tags with marquee effect - 3 rows */}
               <div className="relative mb-12 overflow-hidden w-full padding-global">
                 {/* Blur overlay for left edge */}
                 <div 
                   className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
                   style={{
                     width: 'calc(var(--border-radius--padding--global--regular) * 2)',
                     background: 'linear-gradient(to right, var(--secondary-bg), transparent)',
                    //  backdropFilter: 'blur(var(--border-radius--padding--global--regular))'
                   }}
                 ></div>
                 
                 {/* Blur overlay for right edge */}
                 <div 
                   className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
                   style={{
                     width: 'calc(var(--border-radius--padding--global--regular) * 2)',
                     background: 'linear-gradient(to left, var(--secondary-bg), transparent)',
                    //  backdropFilter: 'blur(var(--border-radius--padding--global--regular))'
                   }}
                 ></div>
                             {/* First row - scroll from right to left */}
                 <div className="flex gap-2 mb-2 animate-marquee-left">
                   {row1.map((tag, idx) => (
                     <span key={`row1-${idx}`} className="px-4 py-2 rounded-lg text-sm border whitespace-nowrap" style={{backgroundColor: 'var(--card-elevated)', color: 'var(--light-grey)', borderColor: 'var(--dividers-borders)'}}>{tag}</span>
                   ))}
                 </div>
            
            {/* Second row - scroll from left to right */}
            <div className="flex gap-2 mb-2 animate-marquee-right">
              {row2.map((tag, idx) => (
                <span key={`row2-${idx}`} className="px-4 py-2 rounded-lg text-sm border whitespace-nowrap" style={{backgroundColor: 'var(--card-elevated)', color: 'var(--light-grey)', borderColor: 'var(--dividers-borders)'}}>{tag}</span>
              ))}
            </div>
            
                             {/* Third row - scroll from right to left */}
                 <div className="flex gap-2 animate-marquee-left">
              {row3.map((tag, idx) => (
                <span key={`row3-${idx}`} className="px-4 py-2 rounded-lg text-sm border whitespace-nowrap" style={{backgroundColor: 'var(--card-elevated)', color: 'var(--light-grey)', borderColor: 'var(--dividers-borders)'}}>{tag}</span>
              ))}
            </div>
          </div>
          
          {/* Interactive Workflow */}
          <div>
            <InteractiveWorkflow onBookCall={handleBookCallWorkflow} />
          </div>
        </div>
      </section>

            {/* Carousel Section */}
            <section className="py-16 sm:py-20" style={{backgroundColor: 'var(--primary-bg)'}}>
        {/* Header Content - Centered */}
        <div className="max-w-6xl mx-auto padding-global">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 text-primary-text">The Unfair Advantage of <br/>a Strategic Story</h1>
            <p className="max-w-4xl mx-auto mb-6 text-sm sm:text-base" style={{color: 'var(--medium-grey)'}}>
            In a crowded market, your story is your most powerful asset. It&apos;s the key to building credibility and earning the trust of investors. It&apos;s not just about what you say, but how you say it—and when. 
            </p>
            <button
              onClick={handleBookCallCarousel}
              className="button"
            >
              Book a call
            </button>
          </div>
        </div>

        {/* Carousel Container - Full Width */}
        <div 
          className="relative overflow-hidden w-full mx-auto px-4 md:px-8"
          style={{ maxWidth: '1600px' }}
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
            <div
              className="flex gap-1.5 transition-transform duration-700 ease-in-out"
              style={{ 
                transform: isMobile 
                  ? `translateX(-${currentSlide * 100}%)` 
                  : `translateX(calc(50% - (${cardWidth}px / 2) - ${currentSlide} * (${cardWidth}px + ${gapSize}px)))`
              }}
            >
              {carouselCards.map((card, index) => (
                <div 
                  key={card.key}
                  ref={index === 0 ? cardRef : undefined}
                  className={`aspect-[4/3] flex-shrink-0 w-full sm:w-11/12 md:w-96 lg:w-[500px] xl:w-[500px] cursor-pointer transition-all duration-300 hover:scale-105 ${
                    currentSlide === index ? 'opacity-100 scale-100' : 'opacity-60 scale-95'
                  }`}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="p-6 md:p-10 rounded-2xl">
                    <div className="aspect-[4/3] rounded-xl mb-6 flex items-center justify-center overflow-hidden" style={{backgroundColor: '#f5f5f5'}}>
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      >
                        <source src={card.videoSrc} type="video/mp4" />
                      </video>
                    </div>
                    <p className="text-base font-bold mb-2 text-left" style={{color: '#ffffff'}}>{card.title}</p>
                    <p className="text-base text-left leading-relaxed" style={{color: 'var(--medium-grey)'}}>
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Navigation */}
            <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
              {[...Array(totalSlides).keys()].map((index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors"
                  style={{backgroundColor: index === currentSlide ? 'var(--accent-elements)' : 'var(--dividers-borders)'}}
                ></button>
              ))}
            </div>
        </div>
      </section>

      {/* Lead Magnet Section - Deep Purple */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/Lead_magnet_BG.jpeg"
            alt="Lead Magnet Background"
            fill
            className="object-cover"
            priority
            unoptimized={true}
          />
          
          {/* <div className="absolute inset-0" style={{backgroundColor: 'rgba(9, 9, 62, 0.7)'}}></div> */}
        </div>
        
                {/* Modal Card - Top Right */}
                 <div className="relative z-10 w-full max-w-5xl mx-auto md:ml-auto md:mr-0 padding-global md:min-w-[1000px]">
          <div className="rounded-3xl p-10 shadow-2xl bg-white border border-gray-200 ">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-black">
              Does Your Pitch Deck Tell a Story Worth Funding?
            </h2>
            <p className="text-lg leading-relaxed text-left" style={{color: 'var(--deep-grey)'}}>
            This isn&apos;t a simple scorecard - it&apos;s a forensic analysis that uncovers your hidden narrative strengths and the precise leverage points that create investor conviction. We&apos;ll show you exactly how your story&apos;s coherence, problem sophistication, and vision magnetism are performing, giving you a clear roadmap to a funded narrative.
            </p>
            <div className="z-10 rounded-lg">
                              <Image
                  src="/Lead_Magnet_Teaser.png"
                  alt="Lead Magnet Preview"
                  width={800}
                  height={150}
                  className="rounded-lg w-full h-auto"
                  unoptimized={true}
                />
            </div>
            <button onClick={() => {
              trackSiteDeckClick();
              window.open('https://deckanalysis.fundraisingflywheel.io/', '_blank');
            }} className="button_dark mt-6">
              Analyze My Deck Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </section>



      {/* Testimonials Section - Deep Blue */}
      <section className="py-16 sm:py-20 padding-global" style={{backgroundColor: '#03032e'}}>
        <div className="w-full">
          <div className="text-center padding-global">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 text-primary-text">Trusted by Smart Founders</h1>
          </div>
          
                    {/* Masonry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6 padding-global py-16">
            {/* Top Left Card - Logo Only */}
            <div className="rounded-2xl p-6 lg:col-span-2 relative flex items-center justify-center" style={{backgroundColor: 'var(--kavecon)', height: '250px'}}>
              <Image
                src="/Logo (3).png"
                alt="Kavecon Logo"
                width={120}
                height={40}
                className="object-contain"
                unoptimized={true}
              />
            </div>
            
            {/* Top Center Card - Logo Only */}
            <div className="rounded-2xl p-6 lg:col-span-2 relative flex items-center justify-center" style={{backgroundColor: '#ffffff', height: '250px'}}>
              <Image
                src="/Logo (4).png"
                alt="Superworks Logo"
                width={120}
                height={40}
                className="object-contain"
                unoptimized={true}
              />
            </div>
            
            {/* Top Right Card - Logo Only */}
            <div className="rounded-2xl p-6 lg:col-span-4 relative flex items-center justify-center" style={{backgroundColor: 'var(--digicon)', height: '250px'}}>
              <Image
                src="/Logo (1).png"
                alt="Digicon Logo"
                width={120}
                height={40}
                className="object-contain"
                unoptimized={true}
              />
            </div>
            
            {/* Bottom Left Card - Logo Only */}
            <div className="rounded-2xl p-6 lg:col-span-4 relative flex items-center justify-center" style={{backgroundColor: 'var(--custom-village)', height: '250px'}}>
              <Image
                src="/Logo (5).png"
                alt="Custom Village Logo"
                width={120}
                height={40}
                className="object-contain"
                unoptimized={true}
              />
            </div>
            
            {/* Bottom Center Card - Logo Only */}
                <div className="rounded-2xl p-6 lg:col-span-2 relative flex items-center justify-center" style={{backgroundColor: '#ffffff', height: '250px'}}>
              <Image
                src="/Logo (6).png"
                alt="Dreamcense Logo"
                width={120}
                height={40}
                className="object-contain"
                unoptimized={true}
              />
            </div>
            
            {/* Bottom Right Card - Logo Only */}
            <div className="rounded-2xl p-6 lg:col-span-2 relative flex items-center justify-center" style={{backgroundColor: 'var(--maco)', height: '250px'}}>
              <Image
                src="/Logo (2).png"
                alt="Maco Logo"
                width={120}
                height={40}
                className="object-contain"
                unoptimized={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section - Deep Purple */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/CTA BG.jpeg"
            alt="Bottom CTA Background"
            fill
            className="object-cover object-top"
            priority
          />
        </div>
                 <div className="max-w-6xl mx-auto padding-global relative z-10 md:min-w-[1000px]" >
          <div className="rounded-3xl p-12 bg-white backdrop-blur-md border border-white shadow-2xl" >
            <div className="grid md:grid-cols-2 gap-12 items-center" >
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 text-black"> By Application Only</h1>
                <p className="mb-6 leading-relaxed" style={{color: 'var(--deep-grey)'}}>
                Our highly personalized approach means we partner with a select group of founders each month. We&apos;re not a content factory - we&apos;re your strategic partner in building a funded future.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleBookCallBottom}
                    className="button_dark"
                  >
                    Secure My Strategy Call Now
                  </button>
                </div>
                <p className="text-sm mt-3 italic" style={{color: 'var(--deep-grey)'}}>
                  Only a handful of spots available this month. No commitment, just a conversation.
                </p>
              </div>
              
              <div className="aspect-video bg-card-accent-2 rounded-2xl flex items-center justify-center overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/CTA video.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Deep Blue */}
      {/* <footer className="py-12" style={{backgroundColor: 'var(--deep-blue)'}}>
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="border-t border-dividers-borders mt-8 pt-8 text-center text-sm text-secondary-text-60">
              <p>© 2025 JD Alchemy. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer> */}

          

      {/* Contact Form Modal removed; now routing to /book-a-call */}
    </div>
  );
}
