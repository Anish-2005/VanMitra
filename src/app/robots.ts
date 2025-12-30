import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://vanmitra.vercel.app/sitemap.xml',
    host: 'https://vanmitra.vercel.app',
  }
}