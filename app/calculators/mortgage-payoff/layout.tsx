import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mortgage Payoff Calculator | CalculateHub",
  description: "Calculate how to pay off your mortgage early, analyze different payoff strategies, and see potential interest savings with our free mortgage payoff calculator.",
  keywords: "mortgage payoff calculator, early mortgage payoff, mortgage paydown calculator, mortgage interest savings calculator, mortgage prepayment calculator, extra payment calculator",
  openGraph: {
    title: "Mortgage Payoff Calculator | CalculateHub",
    description: "Calculate how early mortgage payments can reduce your loan term and save thousands in interest.",
    type: "website",
    url: "https://calculatorshub.store/calculators/mortgage-payoff",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Mortgage Payoff Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Mortgage Payoff Calculator | CalculateHub",
    description: "Calculate how early mortgage payments can reduce your loan term and save thousands in interest.",
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
  // Remove this problematic property
  // alternates: {
  //   canonical: "https://calculatorshub.store/calculators/mortgage-payoff"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function MortgagePayoffCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/mortgage-payoff" 
      />
      {children}
    </>
  )
}