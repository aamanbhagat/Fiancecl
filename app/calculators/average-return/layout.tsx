import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Average Return Calculator | CalculateHub",
  description: "Calculate average investment returns, analyze portfolio performance, and compare different investment options with our free average return calculator.",
  keywords: "average return calculator, investment return calculator, portfolio performance calculator, annualized return, CAGR calculator, investment growth calculator",
  openGraph: {
    title: "Average Return Calculator | CalculateHub",
    description: "Calculate your investment's average return and analyze portfolio performance over time.",
    type: "website",
    url: "https://calculatorhub.space/calculators/average-return",
    images: [
      {
        url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Average Return Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Average Return Calculator | CalculateHub",
    description: "Calculate your investment's average return and analyze portfolio performance over time.",
    images: ["https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function AverageReturnCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/average-return" 
      />
      {children}
    </>
  )
}