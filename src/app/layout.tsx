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
  title: "VanMitra: Friend of the Forest",
  description:
    "A digital companion for mapping forest rights, resources, and development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en">
      <head>
        {/* Script runs before hydration to set theme attr */}
        <link rel="icon" href="/vanmitra.png" />
        
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
