import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { CurrencyProvider } from '@/contexts/currency-context';
import { AuthProvider } from '@/contexts/auth-context';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';
import { seoConfig } from '@/lib/seo-config';
import { ServiceWorkerRegistration } from '@/components/service-worker-registration';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { WebVitals } from './web-vitals';

const inter = Inter({
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true
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
    alternateLocale: [...seoConfig.openGraph.alternateLocale],
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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="monetag" content="a92aeaf891a963f53dcaba9ad84c9977" />
        <link rel="canonical" href={seoConfig.baseUrl} />

        {/* International SEO Meta Tags */}
        <meta httpEquiv="content-language" content="en" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="target" content="all" />

        {/* Theme and App Colors */}
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <meta name="google-adsense-account" content="ca-pub-1720101320139769" />
        <meta name="color-scheme" content="dark light" />

        {/* Search Engine Verification Tags */}
        {seoConfig.verification.google && (
          <meta name="google-site-verification" content={seoConfig.verification.google} />
        )}
        {seoConfig.verification.bing && (
          <meta name="msvalidate.01" content={seoConfig.verification.bing} />
        )}
        {seoConfig.verification.yandex && (
          <meta name="yandex-verification" content={seoConfig.verification.yandex} />
        )}

        {/* International SEO - hreflang tags */}
        {seoConfig.alternateLanguages.map((lang) => (
          <link key={lang.hrefLang} rel="alternate" hrefLang={lang.hrefLang} href={lang.href} />
        ))}

        {/* Performance Optimizations - Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />

        {/* DNS Prefetch for third-party resources */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />

        {/* Critical CSS - Inline above-the-fold styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root{--background:0 0% 100%;--foreground:0 0% 3.9%;--card:0 0% 100%;--card-foreground:0 0% 3.9%;--popover:0 0% 100%;--popover-foreground:0 0% 3.9%;--primary:0 0% 9%;--primary-foreground:0 0% 98%;--secondary:0 0% 96.1%;--secondary-foreground:0 0% 9%;--muted:0 0% 96.1%;--muted-foreground:0 0% 45.1%;--accent:0 0% 96.1%;--accent-foreground:0 0% 9%;--border:0 0% 89.8%;--input:0 0% 89.8%;--ring:0 0% 3.9%;--radius:0.5rem}
            .dark{--background:0 0% 3.9%;--foreground:0 0% 98%;--card:0 0% 3.9%;--card-foreground:0 0% 98%;--popover:0 0% 3.9%;--popover-foreground:0 0% 98%;--primary:0 0% 98%;--primary-foreground:0 0% 9%;--secondary:0 0% 14.9%;--secondary-foreground:0 0% 98%;--muted:0 0% 14.9%;--muted-foreground:0 0% 63.9%;--accent:0 0% 14.9%;--accent-foreground:0 0% 98%;--border:0 0% 14.9%;--input:0 0% 14.9%;--ring:0 0% 83.1%}
            *,::after,::before{box-sizing:border-box;border-width:0;border-style:solid;border-color:hsl(var(--border))}
            html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:var(--font-inter),ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif}
            body{margin:0;line-height:inherit;background-color:hsl(var(--background));color:hsl(var(--foreground))}
            .antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
            h1,h2,h3{font-size:inherit;font-weight:inherit;margin:0}
            .container{width:100%;max-width:80rem;margin-left:auto;margin-right:auto;padding-left:1rem;padding-right:1rem}
            @media(min-width:640px){.container{padding-left:1.5rem;padding-right:1.5rem}}
            @media(min-width:768px){.container{padding-left:2rem;padding-right:2rem}}
          `
        }} />

        {/* Structured Data: WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': `${seoConfig.baseUrl}/#website`,
              name: seoConfig.siteName,
              url: seoConfig.baseUrl,
              description: seoConfig.defaultDescription,
              inLanguage: 'en-US',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${seoConfig.baseUrl}/calculators/{calculator_type}`
                },
                'query-input': 'required name=calculator_type'
              }
            })
          }}
        />

        {/* Structured Data: Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': `${seoConfig.baseUrl}/#organization`,
              name: seoConfig.siteName,
              url: seoConfig.baseUrl,
              logo: {
                '@type': 'ImageObject',
                url: `${seoConfig.baseUrl}/calculator.png`,
                width: 512,
                height: 512
              },
              image: `${seoConfig.baseUrl}/og-image.png`,
              description: seoConfig.defaultDescription,
              sameAs: [
                // Add your social media profiles here
                // 'https://twitter.com/calculatorhub',
                // 'https://facebook.com/calculatorhub',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                url: `${seoConfig.baseUrl}/contact`,
                availableLanguage: 'English'
              }
            })
          }}
        />

        {/* Structured Data: SoftwareApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: seoConfig.siteName,
              description: seoConfig.defaultDescription,
              url: seoConfig.baseUrl,
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Any',
              browserRequirements: 'Requires JavaScript',
              softwareVersion: '2.0',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '2547',
                bestRating: '5',
                worstRating: '1'
              },
              author: {
                '@type': 'Organization',
                name: seoConfig.siteName
              },
              featureList: [
                'Mortgage Calculator',
                'Compound Interest Calculator',
                'Investment Calculator',
                'Loan Calculator',
                'Tax Calculator',
                'Retirement Calculator',
                '60+ Free Financial Calculators'
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CurrencyProvider>
              {/* Core Web Vitals Tracking */}
              <WebVitals />
              
              {children}
              <Analytics />
              <SpeedInsights />

              {/* PWA Components */}
              <ServiceWorkerRegistration />
              <PWAInstallPrompt />
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>

        {/* Defer all third-party scripts to after page load */}
        {/* Google Tag Manager - Conditional on GTM ID being set */}
        {seoConfig.googleTagManager?.id && (
          <>
            <Script id="google-tag-manager" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${seoConfig.googleTagManager.id}');
              `}
            </Script>
            {/* GTM noscript fallback */}
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${seoConfig.googleTagManager.id}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          </>
        )}

        {/* Google Analytics 4 - Direct integration (use if GTM not configured) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-E225715SKV"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-E225715SKV', { send_page_view: false });
            gtag('event', 'page_view', { send_to: 'G-E225715SKV' });
          `}
        </Script>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1720101320139769"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}