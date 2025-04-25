import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Commission Calculator | CalculateHub",
  description: "Calculate sales commissions, determine earnings based on different commission rates, and analyze compensation structures with our free commission calculator.",
  keywords: "commission calculator, sales commission calculator, commission rate calculator, sales compensation calculator, earnings calculator, sales incentive calculator",
  openGraph: {
    title: "Commission Calculator | CalculateHub",
    description: "Calculate sales commissions and analyze different compensation structures for your business.",
    type: "website",
    url: "https://calculatorhub.space/calculators/commission",
    images: [
      {
        url: "https://images.unsplash.com/photo-1589666564459-93cdd3ab856c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Commission Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Commission Calculator | CalculateHub",
    description: "Calculate sales commissions and analyze different compensation structures for your business.",
    images: ["https://images.unsplash.com/photo-1589666564459-93cdd3ab856c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Removed alternates.canonical property
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function CommissionCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/commission" 
      />
      {children}
    </>
  )
}