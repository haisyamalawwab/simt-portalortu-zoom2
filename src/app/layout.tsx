import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#047857" },
    { media: "(prefers-color-scheme: dark)", color: "#064e3b" },
  ],
};

export const metadata: Metadata = {
  title: "SIMT MTs - Portal Orang Tua & Siswa",
  description: "Sistem Informasi Manajemen Terpadu Madrasah Tsanawiyah - Portal Orang Tua dan Siswa",
  keywords: ["SIMT", "MTs", "Madrasah", "Portal", "Orang Tua", "Siswa", "Pendidikan"],
  authors: [{ name: "SIMT MTs" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/icon-76x76.png", sizes: "76x76", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SIMT MTs",
  },
  openGraph: {
    title: "SIMT MTs Portal",
    description: "Portal Orang Tua & Siswa - Sistem Informasi Manajemen Terpadu MTs",
    type: "website",
    locale: "id_ID",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* iOS splash screen meta */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SIMT MTs" />
        {/* Prevent text size adjustment on orientation change */}
        <meta name=" HandheldFriendly" content="true" />
        {/* Force rendering in IE edge mode */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Disable automatic detection of phone numbers */}
        <meta name="format-detection" content="telephone=no" />
        {/* Preconnect to API */}
        <link rel="preconnect" href="/" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overscroll-none`}
      >
        {children}
        <Toaster />
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
