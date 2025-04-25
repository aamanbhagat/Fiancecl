import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Depreciation Calculator | CalculateHub",
  description: "Calculate asset depreciation, compare different depreciation methods, and plan tax deductions with our free depreciation calculator.",
  keywords: "depreciation calculator, asset depreciation calculator, straight-line depreciation, declining balance depreciation, tax depreciation calculator, business asset calculator",
  openGraph: {
    title: "Depreciation Calculator | CalculateHub",
    description: "Calculate asset depreciation and understand the tax implications for your business.",
    type: "website",
    url: "https://calculatorhub.space/calculators/depreciation",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Depreciation Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Depreciation Calculator | CalculateHub",
    description: "Calculate asset depreciation and understand the tax implications for your business.",
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
  // Remove this problematic alternates.canonical property
  // alternates: {
  //   canonical: "https://calculatorhub.space/calculators/depreciation"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function DepreciationCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/depreciation" 
      />
      {children}
    </>
  )
}