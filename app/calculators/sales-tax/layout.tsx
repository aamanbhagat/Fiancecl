import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sales Tax Calculator | CalculateHub",
  description: "Calculate sales tax amounts, determine total purchase prices, and plan for tax-inclusive budgets with our free sales tax calculator.",
  keywords: "sales tax calculator, tax amount calculator, purchase price calculator, state sales tax calculator, VAT calculator, retail tax calculator",
  openGraph: {
    title: "Sales Tax Calculator | CalculateHub",
    description: "Calculate sales tax amounts and determine the final price of purchases including tax.",
    type: "website",
    url: "https://calculatorshub.store/calculators/sales-tax",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-1696413565d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Sales Tax Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Sales Tax Calculator | CalculateHub",
    description: "Calculate sales tax amounts and determine the final price of purchases including tax.",
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
  // Remove this problematic property entirely
  // alternates: {
  //   canonical: "https://calculatorshub.store/calculators/sales-tax"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function SalesTaxCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/sales-tax" 
      />
      {children}
    </>
  )
}