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
              
              // Let GA4 handle UTM parameters automatically
              gtag('config', 'G-16WV2WNMXF', {
                send_page_view: true
              });
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
                      
                      // Extract UTM parameters from URL
                      const urlParams = new URLSearchParams(window.location.search);
                      const utmSource = urlParams.get('utm_source');
                      const utmMedium = urlParams.get('utm_medium');
                      const utmCampaign = urlParams.get('utm_campaign');
                      const utmTerm = urlParams.get('utm_term');
                      const utmContent = urlParams.get('utm_content');
                      
                      // Store UTM parameters in session storage
                      if (utmSource || utmMedium || utmCampaign || utmTerm || utmContent) {
                        const utmData = {
                          utm_source: utmSource,
                          utm_medium: utmMedium,
                          utm_campaign: utmCampaign,
                          utm_term: utmTerm,
                          utm_content: utmContent,
                          timestamp: new Date().toISOString(),
                          page_url: window.location.href,
                        };
                        sessionStorage.setItem('utm_parameters', JSON.stringify(utmData));
                        console.log('UTM parameters stored in session storage:', utmData);
                      }
                      
                      // Store UTM parameters for our custom tracking
                      console.log('Session ID captured and UTM parameters stored');
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
