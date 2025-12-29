import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Income Tax Calculator | CalculateHub",
  description: "Calculate your income tax liability, estimate tax brackets and deductions, and plan your tax strategy with our free income tax calculator.",
  keywords: "income tax calculator, tax bracket calculator, tax estimation tool, tax return calculator, tax deduction calculator, tax planning calculator",
  openGraph: {
    title: "Income Tax Calculator | CalculateHub",
    description: "Calculate your income tax liability and understand how different deductions affect your taxes.",
    type: "website",
    url: "https://calculatorhub.space/calculators/income-tax",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-1696413565d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Income Tax Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Income Tax Calculator | CalculateHub",
    description: "Calculate your income tax liability and understand how different deductions affect your taxes.",
    images: ["https://images.unsplash.com/photo-1554224155-1696413565d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorhub.space/calculators/income-tax"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function IncomeTaxCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/income-tax" 
      />
      {children}
    </>
  )
}