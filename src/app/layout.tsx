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
              gtag('config', 'G-16WV2WNMXF');
            `,
          }}
        />
        
        {/* Session ID Tracking Script */}
        <Script
          id="session-id-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Wait for gtag to be available
              function initializeSessionTracking() {
                if (typeof gtag !== 'undefined') {
                  // Get the session ID and store it
                  gtag('get', 'G-16WV2WNMXF', 'session_id', function(sid) {
                    window.dataLayer.push({
                      event: 'session_id_ready',
                      session_id_custom: sid
                    });
                    
                    // Store session ID globally for use in tracking functions
                    window.GA_SESSION_ID = sid;
                  });
                } else {
                  // Retry after a short delay if gtag is not yet available
                  setTimeout(initializeSessionTracking, 100);
                }
              }
              
              // Initialize session tracking
              initializeSessionTracking();
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
