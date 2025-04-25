import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Debt to Income Calculator | CalculateHub",
  description: "Calculate your debt-to-income ratio, assess your financial health, and determine your borrowing capacity with our free debt to income calculator.",
  keywords: "debt to income calculator, DTI calculator, debt ratio calculator, financial health calculator, loan qualification calculator, borrowing capacity calculator",
  openGraph: {
    title: "Debt to Income Calculator | CalculateHub",
    description: "Calculate your debt-to-income ratio and understand how lenders view your financial health.",
    type: "website",
    url: "https://calculatorhub.space/calculators/debt-to-income",
    images: [
      {
        url: "https://images.unsplash.com/photo-1563237023-b1e970526dcb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Debt to Income Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Debt to Income Calculator | CalculateHub",
    description: "Calculate your debt-to-income ratio and understand how lenders view your financial health.",
    images: ["https://images.unsplash.com/photo-1563237023-b1e970526dcb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Removed alternates.canonical property
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function DebtToIncomeCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/debt-to-income" 
      />
      {children}
    </>
  )
}