import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Base URL from environment variable or use a default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fundraisingflywheel.io';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/lead-qualification-answer/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
