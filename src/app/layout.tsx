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
              
              // Configure GA4 with UTM parameters for proper attribution
              const configParams = {};
              if (utmSource) configParams.campaign_source = utmSource;
              if (utmMedium) configParams.campaign_medium = utmMedium;
              if (utmCampaign) configParams.campaign_name = utmCampaign;
              if (utmTerm) configParams.campaign_term = utmTerm;
              if (utmContent) configParams.campaign_content = utmContent;
              
              console.log('GA4 Config with UTM:', configParams);
              gtag('config', 'G-16WV2WNMXF', configParams);
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
