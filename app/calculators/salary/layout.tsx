import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Salary Calculator | CalculateHub",
  description: "Calculate take-home pay, analyze tax withholdings, and plan your finances with our free salary calculator to understand your true earnings.",
  keywords: "salary calculator, income calculator, take home pay calculator, paycheck calculator, net salary calculator, wage calculator, tax withholding calculator",
  openGraph: {
    title: "Salary Calculator | CalculateHub",
    description: "Calculate your take-home pay and understand tax withholdings with our salary calculator.",
    type: "website",
    url: "https://calculatorhub.space/calculators/salary",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-1696413565d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Salary Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Salary Calculator | CalculateHub",
    description: "Calculate your take-home pay and understand tax withholdings with our salary calculator.",
    images: ["https://images.unsplash.com/photo-1554224155-1696413565d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorhub.space/calculators/salary"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function SalaryCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/salary" 
      />
      {children}
    </>
  )
}