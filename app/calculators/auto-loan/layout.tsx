import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Auto Loan Calculator | CalculateHub",
  description: "Calculate your monthly car payments, determine affordable loan amounts, and compare different financing options with our free auto loan calculator.",
  keywords: "auto loan calculator, car loan calculator, vehicle financing calculator, car payment calculator, auto financing, car loan interest calculator",
  openGraph: {
    title: "Auto Loan Calculator | CalculateHub",
    description: "Calculate your monthly car payments and determine the best auto financing options.",
    type: "website",
    url: "https://calculatorshub.store/calculators/auto-loan",
    images: [
      {
        url: "https://images.unsplash.com/photo-1549925245-f20a9261f134?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Auto Loan Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Loan Calculator | CalculateHub",
    description: "Calculate your monthly car payments and determine the best auto financing options.",
    images: ["https://images.unsplash.com/photo-1549925245-f20a9261f134?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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

export default function AutoLoanCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/auto-loan" 
      />
      {children}
    </>
  )
}