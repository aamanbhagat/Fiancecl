import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Real Estate Calculator | CalculateHub",
  description: "Analyze property investments, calculate ROI on real estate, and make informed property buying decisions with our free real estate calculator.",
  keywords: "real estate calculator, property investment calculator, real estate ROI calculator, rental property calculator, property value calculator, real estate investment tool",
  openGraph: {
    title: "Real Estate Calculator | CalculateHub",
    description: "Analyze property investments and calculate potential returns on real estate.",
    type: "website",
    url: "https://calculatorhub.space/calculators/real-estate",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Real Estate Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Estate Calculator | CalculateHub",
    description: "Analyze property investments and calculate potential returns on real estate.",
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Remove this problematic property entirely
  // alternates: {
  //   canonical: "https://calculatorhub.space/calculators/real-estate"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function RealEstateCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/real-estate" 
      />
      {children}
    </>
  )
}