import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { MouseTail } from '@/components/mouse-tail';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';
import { seoConfig } from '@/lib/seo-config';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.baseUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: '%s | CalculatorHub'
  },
  description: seoConfig.defaultDescription,
  keywords: seoConfig.defaultKeywords.join(', '),
  authors: [{ name: seoConfig.author }],
  creator: seoConfig.author,
  publisher: seoConfig.siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/calculator.png' },
      { url: '/calculator.png', sizes: '16x16', type: 'image/png' },
      { url: '/calculator.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/calculator.png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/calculator.png',
        color: '#5bbad5'
      }
    ]
  },
  manifest: '/manifest.json',
  openGraph: {
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    url: seoConfig.baseUrl,
    siteName: seoConfig.siteName,
    images: [...seoConfig.openGraph.images],
    locale: seoConfig.openGraph.locale,
    type: seoConfig.openGraph.type,
  },
  twitter: {
    card: seoConfig.twitter.card,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [...seoConfig.openGraph.images],
    site: seoConfig.twitter.site,
    creator: seoConfig.twitter.creator,
  },
  robots: seoConfig.robots,
  alternates: {
    canonical: seoConfig.baseUrl,
  },
  category: 'finance',
  classification: 'Financial Tools and Calculators',
  referrer: 'origin-when-cross-origin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="monetag" content="a92aeaf891a963f53dcaba9ad84c9977" />
        <link rel="canonical" href={seoConfig.baseUrl} />
        <meta name="msapplication-TileColor" content="#2d89ef" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="google-adsense-account" content="ca-pub-1720101320139769" />
        
        {/* Performance Optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://quge5.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        
        {/* Structured Data for Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: seoConfig.siteName,
              url: seoConfig.baseUrl,
              description: seoConfig.defaultDescription,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${seoConfig.baseUrl}/search?q={search_term_string}`
                },
                'query-input': 'required name=search_term_string'
              },
              publisher: {
                '@type': 'Organization',
                name: seoConfig.siteName,
                url: seoConfig.baseUrl,
                logo: {
                  '@type': 'ImageObject',
                  url: `${seoConfig.baseUrl}/calculator.png`,
                  width: 512,
                  height: 512
                }
              }
            })
          }}
        />
        
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-E225715SKV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-E225715SKV');
          `}
        </Script>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1720101320139769"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <Script 
          src="https://quge5.com/88/tag.min.js" 
          data-zone="196151" 
          strategy="lazyOnload"
          data-cfasync="false"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MouseTail />
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}