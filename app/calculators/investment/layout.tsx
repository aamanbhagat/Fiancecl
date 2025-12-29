import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Investment Calculator | CalculateHub",
  description: "Calculate investment returns, analyze portfolio performance, and plan your investment strategy with our free investment calculator.",
  keywords: "investment calculator, ROI calculator, portfolio calculator, investment return calculator, investment growth calculator, stock investment calculator",
  openGraph: {
    title: "Investment Calculator | CalculateHub",
    description: "Calculate your investment returns and develop an effective long-term investment strategy.",
    type: "website",
    url: "https://calculatorhub.space/calculators/investment",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Investment Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Investment Calculator | CalculateHub",
    description: "Calculate your investment returns and develop an effective long-term investment strategy.",
    images: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorhub.space/calculators/investment"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function InvestmentCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/investment" 
      />
      {children}
    </>
  )
}