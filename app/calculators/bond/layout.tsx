import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bond Calculator | CalculateHub",
  description: "Calculate bond yields, prices, and returns with our free bond calculator. Analyze fixed-income investments and make informed decisions about your bond portfolio.",
  keywords: "bond calculator, bond yield calculator, bond price calculator, bond valuation, yield to maturity, coupon rate calculator, fixed income calculator",
  openGraph: {
    title: "Bond Calculator | CalculateHub",
    description: "Calculate bond yields, prices, and returns to optimize your fixed-income investments.",
    type: "website",
    url: "https://calculatorshub.store/calculators/bond",
    images: [
      {
        url: "https://images.unsplash.com/photo-1621264448270-9ef00e4e8a41?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Bond Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Bond Calculator | CalculateHub",
    description: "Calculate bond yields, prices, and returns to optimize your fixed-income investments.",
    images: ["https://images.unsplash.com/photo-1621264448270-9ef00e4e8a41?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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

export default function BondCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/bond" 
      />
      {children}
    </>
  )
}