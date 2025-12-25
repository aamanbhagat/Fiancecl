import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Interest Calculator | CalculateHub",
  description: "Calculate simple and compound interest, compare different interest rates, and analyze investment growth with our free interest calculator.",
  keywords: "interest calculator, simple interest calculator, compound interest calculator, interest rate calculator, investment growth calculator, savings interest calculator",
  openGraph: {
    title: "Interest Calculator | CalculateHub",
    description: "Calculate simple and compound interest and analyze your investment growth over time.",
    type: "website",
    url: "https://calculatorshub.store/calculators/interest",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611324806569-3a977d9e1c76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Interest Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Interest Calculator | CalculateHub",
    description: "Calculate simple and compound interest and analyze your investment growth over time.",
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
  //   canonical: "https://calculatorshub.store/calculators/interest"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function InterestCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/interest" 
      />
      {children}
    </>
  )
}