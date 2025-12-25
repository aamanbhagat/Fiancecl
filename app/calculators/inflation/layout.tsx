import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Inflation Calculator | CalculateHub",
  description: "Calculate the effects of inflation on purchasing power, adjust historical prices to today's value, and plan for future expenses with our free inflation calculator.",
  keywords: "inflation calculator, purchasing power calculator, cost of living calculator, inflation rate calculator, price index calculator, historical value calculator",
  openGraph: {
    title: "Inflation Calculator | CalculateHub",
    description: "Calculate how inflation impacts your money's value over time and plan for future expenses.",
    type: "website",
    url: "https://calculatorshub.store/calculators/inflation",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Inflation Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Inflation Calculator | CalculateHub",
    description: "Calculate how inflation impacts your money's value over time and plan for future expenses.",
    images: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Remove this problematic property
  // alternates: {
  //   canonical: "https://calculatorshub.store/calculators/inflation"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function InflationCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/inflation" 
      />
      {children}
    </>
  )
}