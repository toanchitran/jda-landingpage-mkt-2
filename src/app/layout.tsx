import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import RB2BLoader from "@/components/RB2BLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fundraising Flywheel - Strategic Narrative Consultants for Investor Engagement",
  description: "Triple your investor engagement with a compelling strategic narrative. Jay and David help founders shape their company's story to attract funding and make insights scalable.",
  icons: {
    icon: '/favicon.ico',
  },
  verification: {
    google: 'eLwXDpfk7q64q5bwX9mGFyUVtdlgKF_Ug33iF7G8Dfk',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // Important for iOS safe area handling
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-16WV2WNMXF"
          strategy="afterInteractive"
        />
        <Script
          id="ga4-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              // Get UTM parameters from URL (check both search and hash)
              const urlParams = new URLSearchParams(window.location.search);
              // Also check hash fragment (e.g., #&utm_medium=xxx)
              const hashParams = new URLSearchParams(window.location.hash.substring(1));
              
              let utmSource = urlParams.get('utm_source') || hashParams.get('utm_source');
              let utmMedium = urlParams.get('utm_medium') || hashParams.get('utm_medium');
              const utmCampaign = urlParams.get('utm_campaign') || hashParams.get('utm_campaign');
              const utmTerm = urlParams.get('utm_term') || hashParams.get('utm_term');
              const utmContent = urlParams.get('utm_content') || hashParams.get('utm_content');
              
              console.log('🔍 Current URL:', window.location.href);
              console.log('🔍 Search params:', window.location.search);
              console.log('🔍 Hash params:', window.location.hash);
              console.log('🔍 UTM Medium from URL:', utmMedium);
              
              // Check if utm_medium contains "rec" and save to localStorage as record_id
              if (utmMedium) {
                console.log('🔍 Checking if utm_medium contains "rec":', utmMedium.includes('rec'));
                if (utmMedium.includes('rec')) {
                  try {
                    localStorage.setItem('record_id', utmMedium);
                    console.log('✅ Saved record_id to localStorage:', utmMedium);
                    console.log('✅ Verify - reading back:', localStorage.getItem('record_id'));
                  } catch (e) {
                    console.error('❌ Failed to save record_id:', e);
                  }
                }
              } else {
                console.log('🔍 No utm_medium in URL');
              }
              
              // If no utm_medium in URL, check localStorage for record_id
              if (!utmMedium) {
                try {
                  const storedRecordId = localStorage.getItem('record_id');
                  console.log('🔍 Checking localStorage for record_id:', storedRecordId);
                  if (storedRecordId) {
                    utmMedium = storedRecordId;
                    utmSource = 'revisit';
                    console.log('✅ Using stored record_id as utm_medium:', utmMedium);
                  } else {
                    console.log('🔍 No record_id found in localStorage');
                  }
                } catch (e) {
                  console.error('❌ Failed to retrieve record_id:', e);
                }
              }
              
              // Configure GA4 with UTM parameters for proper attribution
              const configParams = {
                send_page_view: false, // Prevent automatic page view to control UTM attribution
                allow_google_signals: false, // Prevent GA4 from overriding UTM parameters
              };
              
              console.log('GA4 Config params:', configParams);
              gtag('config', 'G-16WV2WNMXF', configParams);
              
              // Use gtag('set') to properly set campaign parameters for GA4 attribution
              if (utmSource || utmMedium || utmCampaign) {
                const campaignParams = {};
                if (utmSource) campaignParams.campaign_source = utmSource;
                if (utmMedium) campaignParams.campaign_medium = utmMedium;
                if (utmCampaign) campaignParams.campaign_name = utmCampaign;
                if (utmTerm) campaignParams.campaign_term = utmTerm;
                if (utmContent) campaignParams.campaign_content = utmContent;
                
                console.log('Setting campaign parameters via gtag set:', campaignParams);
                gtag('set', campaignParams);
              }
              
              // Wait for GA4 to initialize and send session_start before manual page_view
              setTimeout(() => {
                // Send manual page_view - campaign params are already set via gtag('set')
                const pageViewParams = {
                  page_title: document.title,
                  page_location: window.location.href,
                };
                
                // Add campaign parameters to page_view event for immediate attribution
                if (utmSource || utmMedium || utmCampaign) {
                  console.log('Sending manual page_view with UTM attribution');
                  if (utmSource) pageViewParams.campaign_source = utmSource;
                  if (utmMedium) pageViewParams.campaign_medium = utmMedium;
                  if (utmCampaign) pageViewParams.campaign_name = utmCampaign;
                  if (utmTerm) pageViewParams.campaign_term = utmTerm;
                  if (utmContent) pageViewParams.campaign_content = utmContent;
                } else {
                  console.log('Sending manual page_view without UTM (direct traffic)');
                }
                
                gtag('event', 'page_view', pageViewParams);
              }, 100); // Small delay to ensure session_start fires first
            `,
          }}
        />
        
        {/* Custom Session ID Tracking */}
        <Script
          id="custom-session-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Generate our own custom session ID
              function generateCustomSessionId() {
                const timestamp = Date.now();
                const random = Math.random().toString(36).substring(2, 15);
                return 'cs_' + timestamp + '_' + random;
              }
              
              // Get or create custom session ID
              let customSessionId = sessionStorage.getItem('custom_session_id');
              if (!customSessionId) {
                customSessionId = generateCustomSessionId();
                sessionStorage.setItem('custom_session_id', customSessionId);
              }
              
              // Store globally for use in tracking functions
              window.CUSTOM_SESSION_ID = customSessionId;
              console.log('Custom Session ID:', customSessionId);
            `,
          }}
        />
        
        {/* RB2B Tracking via client loader */}

        {/* Hotjar Tracking Code */}
        <Script
          id="hotjar-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:6500450,hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RB2BLoader />
        {children}
      </body>
    </html>
  );
}
