import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Future Value Calculator | CalculateHub",
  description: "Calculate the future value of investments, estimate investment growth over time, and plan your financial goals with our free future value calculator.",
  keywords: "future value calculator, investment growth calculator, compound growth calculator, time value of money calculator, investment planning tool, financial projection calculator",
  openGraph: {
    title: "Future Value Calculator | CalculateHub",
    description: "Calculate the future value of your investments and plan for long-term financial growth.",
    type: "website",
    url: "https://calculatorhub.space/calculators/future-value",
    images: [
      {
        url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Future Value Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Future Value Calculator | CalculateHub",
    description: "Calculate the future value of your investments and plan for long-term financial growth.",
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
  // Remove this problematic property
  // alternates: {
  //   canonical: "https://calculatorhub.space/calculators/future-value"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function FutureValueCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/future-value" 
      />
      {children}
    </>
  )
}