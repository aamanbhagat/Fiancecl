import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Interest Rate Calculator | CalculateHub",
  description: "Calculate effective interest rates, compare loan options, and analyze the true cost of borrowing with our free interest rate calculator.",
  keywords: "interest rate calculator, APR calculator, effective interest rate, loan comparison calculator, mortgage rate calculator, borrowing cost calculator",
  openGraph: {
    title: "Interest Rate Calculator | CalculateHub",
    description: "Calculate effective interest rates and compare different loan options.",
    type: "website",
    url: "https://calculatorshub.store/calculators/interest-rate",
    images: [
      {
        url: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Interest Rate Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Interest Rate Calculator | CalculateHub",
    description: "Calculate effective interest rates and compare different loan options.",
    images: ["https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorshub.store/calculators/interest-rate"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function InterestRateCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/interest-rate" 
      />
      {children}
    </>
  )
}