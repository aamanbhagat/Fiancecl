import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Annuity Payout Calculator | CalculateHub",
  description: "Determine your periodic annuity payments, estimate income streams from your investments, and plan for retirement distributions with our free annuity payout calculator.",
  keywords: "annuity payout calculator, retirement income calculator, annuity distribution, pension payout, fixed income calculator, retirement withdrawal calculator",
  openGraph: {
    title: "Annuity Payout Calculator | CalculateHub",
    description: "Calculate your regular income from annuities and plan your retirement distributions.",
    type: "website",
    url: "https://calculatorhub.space/calculators/annuity-payout",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Annuity Payout Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Annuity Payout Calculator | CalculateHub",
    description: "Calculate your regular income from annuities and plan your retirement distributions.",
    images: ["https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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

export default function AnnuityPayoutCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/annuity-payout" 
      />
      {children}
    </>
  )
}