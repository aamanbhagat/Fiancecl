import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { MouseTail } from '@/components/mouse-tail';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CalculateHub - Free Online Financial Calculators',
  description: 'Access free online financial calculators for mortgage, amortization, refinance, rent, and more. Make informed financial decisions with our easy-to-use tools.',
  keywords: 'financial calculators, mortgage calculator, amortization calculator, refinance calculator, rent calculator, debt-to-income calculator, house affordability calculator',
  icons: {
    icon: [
      { url: 'calculator.png' },
      { url: 'calculator.png', sizes: '16x16', type: 'image/png' },
      { url: 'calculator.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: 'calculator.png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: 'calculator.png',
        color: '#5bbad5'
      }
    ]
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'CalculateHub - Free Online Financial Calculators',
    description: 'Access free online financial calculators for mortgage, amortization, refinance, rent, and more.',
    url: 'https://calculatorhub.space',
    siteName: 'CalculateHub',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'CalculateHub - Financial Calculators',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalculateHub - Free Online Financial Calculators',
    description: 'Access free online financial calculators for mortgage, amortization, refinance, rent, and more.',
    images: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://calculatorhub.space',
  },
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
        <link rel="canonical" href="https://calculatorhub.space" />
        <meta name="msapplication-TileColor" content="#2d89ef" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="google-adsense-account" content="ca-pub-1720101320139769" />
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
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MouseTail />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}