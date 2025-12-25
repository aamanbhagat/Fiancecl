import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Present Value Calculator | CalculateHub",
  description: "Calculate the present value of future cash flows, analyze investment opportunities, and make informed financial decisions with our free present value calculator.",
  keywords: "present value calculator, time value of money calculator, PV calculator, discount rate calculator, investment worth calculator, future cash flow calculator",
  openGraph: {
    title: "Present Value Calculator | CalculateHub",
    description: "Calculate the present value of future cash flows and analyze investment opportunities.",
    type: "website",
    url: "https://calculatorshub.store/calculators/present-value",
    images: [
      {
        url: "https://images.unsplash.com/photo-1563237023-b1e970526dcb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Present Value Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Present Value Calculator | CalculateHub",
    description: "Calculate the present value of future cash flows and analyze investment opportunities.",
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
  // Remove this problematic property entirely
  // alternates: {
  //   canonical: "https://calculatorshub.store/calculators/present-value"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function PresentValueCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/present-value" 
      />
      {children}
    </>
  )
}