import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "VAT Calculator | CalculateHub",
  description: "Calculate Value Added Tax amounts, determine pre-tax and post-tax prices, and understand VAT implications for business and personal purchases with our free VAT calculator.",
  keywords: "VAT calculator, Value Added Tax calculator, sales tax calculator, tax inclusive calculator, tax exclusive calculator, business tax calculator",
  openGraph: {
    title: "VAT Calculator | CalculateHub",
    description: "Calculate Value Added Tax amounts and determine prices with and without VAT included.",
    type: "website",
    url: "https://calculatorhub.space/calculators/vat",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-1696413565d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "VAT Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "VAT Calculator | CalculateHub",
    description: "Calculate Value Added Tax amounts and determine prices with and without VAT included.",
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
  // Remove this problematic property entirely - this is the main issue!
  // alternates: {
  //   canonical: "https://calculatorhub.space/calculators/vat"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function VATCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/vat" 
      />
      {children}
    </>
  )
}