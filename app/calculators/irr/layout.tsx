import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "IRR Calculator | CalculateHub",
  description: "Calculate the internal rate of return for investments, compare project profitability, and make informed investment decisions with our free IRR calculator.",
  keywords: "IRR calculator, internal rate of return calculator, investment profitability calculator, project evaluation calculator, ROI comparison calculator, investment analysis tool",
  openGraph: {
    title: "IRR Calculator | CalculateHub",
    description: "Calculate the internal rate of return for your investments and evaluate project profitability.",
    type: "website",
    url: "https://calculatorshub.store/calculators/irr",
    images: [
      {
        url: "https://images.unsplash.com/photo-1620228885847-9eab2a1adddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "IRR Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "IRR Calculator | CalculateHub",
    description: "Calculate the internal rate of return for your investments and evaluate project profitability.",
    images: ["https://images.unsplash.com/photo-1620228885847-9eab2a1adddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorshub.store/calculators/irr"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function IRRCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/irr" 
      />
      {children}
    </>
  )
}