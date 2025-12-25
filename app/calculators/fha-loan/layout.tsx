import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FHA Loan Calculator | CalculateHub",
  description: "Calculate your FHA loan payments, determine eligibility, and estimate mortgage insurance premiums with our free FHA loan calculator.",
  keywords: "FHA loan calculator, Federal Housing Administration loan, FHA mortgage calculator, FHA mortgage insurance calculator, first-time homebuyer calculator, low down payment mortgage calculator",
  openGraph: {
    title: "FHA Loan Calculator | CalculateHub",
    description: "Calculate FHA loan payments and understand the costs of government-backed mortgages.",
    type: "website",
    url: "https://calculatorshub.store/calculators/fha-loan",
    images: [
      {
        url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "FHA Loan Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "FHA Loan Calculator | CalculateHub",
    description: "Calculate FHA loan payments and understand the costs of government-backed mortgages.",
    images: ["https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorshub.store/calculators/fha-loan"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function FHALoanCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/fha-loan" 
      />
      {children}
    </>
  )
}