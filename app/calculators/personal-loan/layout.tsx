import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Personal Loan Calculator | CalculateHub",
  description: "Calculate personal loan payments, compare interest rates, and plan your borrowing with our free personal loan calculator.",
  keywords: "personal loan calculator, loan payment calculator, loan interest calculator, loan repayment calculator, installment loan calculator, loan comparison tool",
  openGraph: {
    title: "Personal Loan Calculator | CalculateHub",
    description: "Calculate your personal loan payments and understand the true cost of borrowing.",
    type: "website",
    url: "https://calculatorshub.store/calculators/personal-loan",
    images: [
      {
        url: "https://images.unsplash.com/photo-1589666564459-93cdd3d3f500?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Personal Loan Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Loan Calculator | CalculateHub",
    description: "Calculate your personal loan payments and understand the true cost of borrowing.",
    images: ["https://images.unsplash.com/photo-1589666564459-93cdd3d3f500?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Important: Do NOT include alternates.canonical here
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function PersonalLoanCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/personal-loan" 
      />
      {children}
    </>
  )
}