import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Business Loan Calculator | CalculateHub",
  description: "Calculate monthly business loan payments, analyze commercial financing options, and plan your business capital needs with our free business loan calculator.",
  keywords: "business loan calculator, commercial loan calculator, small business financing calculator, business loan payment calculator, SBA loan calculator, business funding planner",
  openGraph: {
    title: "Business Loan Calculator | CalculateHub",
    description: "Calculate monthly business loan payments and compare commercial financing options for your business.",
    type: "website",
    url: "https://calculatorshub.store/calculators/business-loan",
    images: [
      {
        url: "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Business Loan Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Loan Calculator | CalculateHub",
    description: "Calculate monthly business loan payments and compare commercial financing options for your business.",
    images: ["https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function BusinessLoanCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/business-loan" 
      />
      {children}
    </>
  )
}