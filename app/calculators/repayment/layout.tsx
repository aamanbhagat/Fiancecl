import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Repayment Calculator | CalculateHub",
  description: "Calculate loan repayment schedules, compare different payment strategies, and plan your debt payoff timeline with our free repayment calculator.",
  keywords: "repayment calculator, loan repayment calculator, debt payoff calculator, payment schedule calculator, loan amortization calculator, debt repayment planner",
  openGraph: {
    title: "Repayment Calculator | CalculateHub",
    description: "Calculate loan repayment schedules and find the best strategy to pay off your debt.",
    type: "website",
    url: "https://calculatorhub.space/calculators/repayment",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Repayment Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Repayment Calculator | CalculateHub",
    description: "Calculate loan repayment schedules and find the best strategy to pay off your debt.",
    images: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorhub.space/calculators/repayment"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function RepaymentCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/repayment" 
      />
      {children}
    </>
  )
}