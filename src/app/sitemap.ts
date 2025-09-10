import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL from environment variable or use a default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fundraisingflywheel.io';
  
  // Current date for lastModified
  const currentDate = new Date();
  
  return [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/book-a-call`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/call-confirmed`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    // Add other static routes as needed
    // Don't include dynamic routes with [id] parameters unless you can pre-generate them
    // Don't include API routes
  ];
}
