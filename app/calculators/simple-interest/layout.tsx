import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Simple Interest Calculator | CalculateHub",
  description: "Calculate simple interest on loans and investments, analyze interest earnings without compounding, and compare different interest rates with our free simple interest calculator.",
  keywords: "simple interest calculator, interest calculator, loan interest calculator, investment interest calculator, interest rate calculator, finance calculator",
  openGraph: {
    title: "Simple Interest Calculator | CalculateHub",
    description: "Calculate simple interest on loans and investments and understand your interest earnings or costs.",
    type: "website",
    url: "https://calculatorshub.store/calculators/simple-interest",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611324806569-3a977d9e1c76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Simple Interest Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Simple Interest Calculator | CalculateHub",
    description: "Calculate simple interest on loans and investments and understand your interest earnings or costs.",
    images: ["https://images.unsplash.com/photo-1611324806569-3a977d9e1c76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorshub.store/calculators/simple-interest"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function SimpleInterestCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/simple-interest" 
      />
      {children}
    </>
  )
}