import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "VA Mortgage Calculator | CalculateHub",
  description: "Calculate VA home loan payments, analyze VA funding fees, and understand the benefits of VA mortgages with our free VA mortgage calculator.",
  keywords: "VA mortgage calculator, VA loan calculator, veterans mortgage calculator, military home loan calculator, VA funding fee calculator, VA home loan benefits",
  openGraph: {
    title: "VA Mortgage Calculator | CalculateHub",
    description: "Calculate VA home loan payments and understand the special benefits of VA mortgages for veterans.",
    type: "website",
    url: "https://calculatorshub.store/calculators/va-mortgage",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618021060512-57c2637ce842?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "VA Mortgage Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "VA Mortgage Calculator | CalculateHub",
    description: "Calculate VA home loan payments and understand the special benefits of VA mortgages for veterans.",
    images: ["https://images.unsplash.com/photo-1618021060512-57c2637ce842?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorshub.store/calculators/va-mortgage"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function VAMortgageCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/va-mortgage" 
      />
      {children}
    </>
  )
}