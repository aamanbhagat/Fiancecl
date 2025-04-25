import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Amortization Calculator | CalculateHub",
  description: "Create detailed loan amortization schedules, track principal and interest payments over time, and understand the true cost of your loans with our free amortization calculator.",
  keywords: "amortization calculator, loan amortization, amortization schedule, principal and interest calculator, loan payment breakdown, loan repayment schedule",
  openGraph: {
    title: "Amortization Calculator | CalculateHub",
    description: "Create detailed loan amortization schedules and visualize how your payments reduce principal over time.",
    type: "website",
    url: "https://calculatorhub.space/calculators/amortization",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Amortization Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Amortization Calculator | CalculateHub",
    description: "Create detailed loan amortization schedules and visualize how your payments reduce principal over time.",
    images: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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

export default function AmortizationCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/amortization" 
      />
      {children}
    </>
  )
}