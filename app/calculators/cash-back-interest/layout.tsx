import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cash Back Interest Calculator | CalculateHub",
  description: "Calculate the value of credit card cash back rewards, optimize your reward strategy, and compare different cash back programs with our free cash back interest calculator.",
  keywords: "cash back calculator, credit card rewards calculator, cash back interest calculator, credit card comparison, rewards optimization, cash back value calculator",
  openGraph: {
    title: "Cash Back Interest Calculator | CalculateHub",
    description: "Calculate the true value of your credit card cash back rewards and maximize your returns.",
    type: "website",
    url: "https://calculatorhub.space/calculators/cash-back-interest",
    images: [
      {
        url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Cash Back Interest Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Cash Back Interest Calculator | CalculateHub",
    description: "Calculate the true value of your credit card cash back rewards and maximize your returns.",
    images: ["https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Removed alternates.canonical that was causing conflicts
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function CashBackInterestCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/cash-back-interest" 
      />
      {children}
    </>
  )
}