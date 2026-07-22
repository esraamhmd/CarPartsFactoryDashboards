import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/login', '/signup', '/auth/callback'],
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://motorsync.vercel.app/sitemap.xml',
  };
}