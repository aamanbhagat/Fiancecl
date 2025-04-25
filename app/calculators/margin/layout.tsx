import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Margin Calculator | CalculateHub",
  description: "Calculate profit margins, determine optimal pricing, and analyze markup percentages for your business with our free margin calculator.",
  keywords: "margin calculator, profit margin calculator, markup calculator, pricing calculator, retail margin calculator, gross margin calculator",
  openGraph: {
    title: "Margin Calculator | CalculateHub",
    description: "Calculate profit margins and determine optimal pricing strategies for your business.",
    type: "website",
    url: "https://calculatorhub.space/calculators/margin",
    images: [
      {
        url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Margin Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Margin Calculator | CalculateHub",
    description: "Calculate profit margins and determine optimal pricing strategies for your business.",
    images: ["https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorhub.space/calculators/margin"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function MarginCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/margin" 
      />
      {children}
    </>
  )
}