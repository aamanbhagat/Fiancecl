import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Currency Converter | CalculateHub",
  description: "Convert between different currencies, calculate exchange rates, and track currency values with our free currency converter calculator.",
  keywords: "currency converter, exchange rate calculator, foreign currency calculator, money converter, international currency converter, forex calculator",
  openGraph: {
    title: "Currency Converter | CalculateHub",
    description: "Convert between different currencies and calculate current exchange rates.",
    type: "website",
    url: "https://calculatorhub.space/calculators/currency-converter",
    images: [
      {
        url: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Currency Converter"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Currency Converter | CalculateHub",
    description: "Convert between different currencies and calculate current exchange rates.",
    images: ["https://images.unsplash.com/photo-1580519542036-c47de6196ba5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  }
  // Removed alternates.canonical property that was causing conflicts
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function CurrencyConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/currency-converter" 
      />
      {children}
    </>
  )
}