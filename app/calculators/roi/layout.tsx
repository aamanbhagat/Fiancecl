import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ROI Calculator | CalculateHub",
  description: "Calculate return on investment, analyze investment performance, and compare different opportunities with our free ROI calculator.",
  keywords: "ROI calculator, return on investment calculator, investment performance calculator, profit calculator, investment analysis tool, investment comparison calculator",
  openGraph: {
    title: "ROI Calculator | CalculateHub",
    description: "Calculate the return on investment for your projects and compare different investment opportunities.",
    type: "website",
    url: "https://calculatorhub.space/calculators/roi",
    images: [
      {
        url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "ROI Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ROI Calculator | CalculateHub",
    description: "Calculate the return on investment for your projects and compare different investment opportunities.",
    images: ["https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorhub.space/calculators/roi"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function ROICalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/roi" 
      />
      {children}
    </>
  )
}