import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
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
  metadataBase: new URL('https://vanmitra.vercel.app'),
  title: {
    default: "VanMitra: Friend of the Forest - Forest Rights & Resource Mapping",
    template: "%s | VanMitra"
  },
  description: "VanMitra is a comprehensive digital platform for mapping forest rights, resources, and sustainable development. Empowering communities with GIS technology, claim management, and environmental monitoring.",
  keywords: [
    "forest rights",
    "FRA",
    "forest resource mapping",
    "GIS",
    "sustainable development",
    "community forestry",
    "environmental monitoring",
    "land claims",
    "forest management",
    "India forest rights",
    "digital forestry",
    "spatial analysis",
    "environmental data"
  ],
  authors: [{ name: "VanMitra Team" }],
  creator: "VanMitra",
  publisher: "VanMitra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "Environmental Technology",
  classification: "Forest Rights Management Platform",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vanmitra.vercel.app",
    title: "VanMitra: Friend of the Forest - Forest Rights & Resource Mapping",
    description: "A comprehensive digital platform for mapping forest rights, resources, and sustainable development. Empowering communities with GIS technology and environmental monitoring.",
    siteName: "VanMitra",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VanMitra - Forest Rights Mapping Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VanMitra: Friend of the Forest",
    description: "Digital platform for forest rights mapping and sustainable development",
    images: ["/og-image.jpg"],
    creator: "@vanmitra",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
    yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: "https://vanmitra.vercel.app",
  },
  other: {
    "theme-color": "#10b981",
    "color-scheme": "light dark",
    "twitter:site": "@vanmitra",
    "twitter:creator": "@vanmitra",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "VanMitra",
    "description": "A comprehensive digital platform for mapping forest rights, resources, and sustainable development",
    "url": "https://vanmitra.vercel.app",
    "applicationCategory": "EnvironmentalApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "VanMitra Team",
      "url": "https://vanmitra.vercel.app"
    },
    "featureList": [
      "Forest Rights Mapping",
      "GIS Technology",
      "Community Empowerment",
      "Environmental Monitoring",
      "Sustainable Development",
      "Spatial Analysis"
    ],
    "screenshot": "https://vanmitra.vercel.app/og-image.jpg"
  };

  return (
  <html lang="en">
      <head>
        {/* Script runs before hydration to set theme attr */}
        <link rel="icon" href="/vanmitra.png" />
        <link rel="apple-touch-icon" href="/vanmitra.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#10b981" />
        <link rel="canonical" href="https://vanmitra.vercel.app" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
