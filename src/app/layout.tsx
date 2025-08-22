import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fundraising Flywheel - PR Specialists for Investor Relations",
  description: "Transform your company's narrative and attract the funding you deserve with our digital PR specialists. Maya and Alex work 24/7 to build your authority and connect with investors.",
  icons: {
    icon: '/favicon.ico',
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
              
              // Get UTM parameters from URL
              const urlParams = new URLSearchParams(window.location.search);
              const utmSource = urlParams.get('utm_source');
              const utmMedium = urlParams.get('utm_medium');
              const utmCampaign = urlParams.get('utm_campaign');
              const utmTerm = urlParams.get('utm_term');
              const utmContent = urlParams.get('utm_content');
              
              // Debug: Log UTM parameters
              console.log('UTM Parameters detected:', {
                utm_source: utmSource,
                utm_medium: utmMedium,
                utm_campaign: utmCampaign,
                utm_term: utmTerm,
                utm_content: utmContent
              });
              
              // Create config parameters
              const configParams = {
                send_page_view: false
              };
              
              // Add UTM parameters to config for proper GA4 attribution
              if (utmSource) configParams.utm_source = utmSource;
              if (utmMedium) configParams.utm_medium = utmMedium;
              if (utmCampaign) configParams.utm_campaign = utmCampaign;
              if (utmTerm) configParams.utm_term = utmTerm;
              if (utmContent) configParams.utm_content = utmContent;
              
              console.log('GA4 Config parameters:', configParams);
              gtag('config', 'G-16WV2WNMXF', configParams);
              
              // Also send UTM parameters as a separate event to ensure they're captured
              if (utmSource || utmMedium || utmCampaign) {
                const utmEventParams = {
                  utm_source: utmSource || 'direct',
                  utm_medium: utmMedium || 'none',
                  utm_campaign: utmCampaign || 'none',
                  utm_term: utmTerm || 'none',
                  utm_content: utmContent || 'none'
                };
                console.log('Sending UTM event:', utmEventParams);
                gtag('event', 'utm_parameters_detected', utmEventParams);
              }
            `,
          }}
        />
        
        {/* Session ID Tracking Script */}
        <Script
          id="session-id-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Wait for gtag to be available and capture session ID
              function initializeSessionTracking() {
                if (typeof gtag !== 'undefined') {
                  // Get the session ID and store it
                  gtag('get', 'G-16WV2WNMXF', 'session_id', function(sid) {
                    if (sid) {
                      window.GA_SESSION_ID = String(sid);
                      console.log('Session ID captured:', window.GA_SESSION_ID);
                      
                      // Get UTM parameters from URL
                      const urlParams = new URLSearchParams(window.location.search);
                      const utmSource = urlParams.get('utm_source');
                      const utmMedium = urlParams.get('utm_medium');
                      const utmCampaign = urlParams.get('utm_campaign');
                      const utmTerm = urlParams.get('utm_term');
                      const utmContent = urlParams.get('utm_content');
                      
                      // Create page view parameters
                      const pageViewParams = {
                        page_title: document.title,
                        page_location: window.location.href,
                        session_id_custom: window.GA_SESSION_ID,
                        debug_mode: true
                      };
                      
                      // Add UTM parameters to page view for proper GA4 attribution
                      if (utmSource) pageViewParams.utm_source = utmSource;
                      if (utmMedium) pageViewParams.utm_medium = utmMedium;
                      if (utmCampaign) pageViewParams.utm_campaign = utmCampaign;
                      if (utmTerm) pageViewParams.utm_term = utmTerm;
                      if (utmContent) pageViewParams.utm_content = utmContent;
                      
                      // Send initial page view with session ID and UTM parameters
                      gtag('event', 'page_view', pageViewParams);
                      
                      // Also send a dedicated UTM event to ensure proper attribution
                      if (utmSource || utmMedium || utmCampaign) {
                        gtag('event', 'session_start_with_utm', {
                          utm_source: utmSource || 'direct',
                          utm_medium: utmMedium || 'none',
                          utm_campaign: utmCampaign || 'none',
                          utm_term: utmTerm || 'none',
                          utm_content: utmContent || 'none',
                          session_id_custom: window.GA_SESSION_ID
                        });
                      }
                    }
                  });
                  return true;
                }
                return false;
              }
              
              // Retry until gtag is ready
              const id = setInterval(() => { 
                if (initializeSessionTracking()) clearInterval(id); 
              }, 200);
            `,
          }}
        />
        
        {/* REB2B Tracking Script */}
        <Script
          id="reb2b-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(key) {
                if (window.reb2b) return;
                window.reb2b = {loaded: true};
                var s = document.createElement("script");
                s.async = true;
                s.src = "https://ddwl4m2hdecbv.cloudfront.net/b/" + key + "/" + key + ".js.gz";
                document.getElementsByTagName("script")[0].parentNode.insertBefore(s, document.getElementsByTagName("script")[0]);
              }("LNKLDHPVZ2OJ");
            `,
          }}
        />

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
        {children}
      </body>
    </html>
  );
}
