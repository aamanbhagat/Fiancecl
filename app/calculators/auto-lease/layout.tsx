import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Auto Lease Calculator | CalculateHub",
  description: "Calculate monthly car lease payments, compare leasing options, and determine the best auto lease terms with our free auto lease calculator.",
  keywords: "auto lease calculator, car lease calculator, vehicle lease payment calculator, lease vs buy calculator, lease money factor, car lease comparison",
  openGraph: {
    title: "Auto Lease Calculator | CalculateHub",
    description: "Calculate your monthly car lease payments and compare different leasing options.",
    type: "website",
    url: "https://calculatorshub.store/calculators/auto-lease",
    images: [
      {
        url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Auto Lease Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Lease Calculator | CalculateHub",
    description: "Calculate your monthly car lease payments and compare different leasing options.",
    images: ["https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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

export default function AutoLeaseCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/auto-lease" 
      />
      {children}
    </>
  )
}