import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Take-Home Paycheck Calculator | CalculateHub",
  description: "Calculate your net pay after taxes and deductions, estimate your take-home income, and plan your budget with our free take-home paycheck calculator.",
  keywords: "take-home paycheck calculator, net pay calculator, after-tax income calculator, paycheck estimator, salary deductions calculator, income tax calculator",
  openGraph: {
    title: "Take-Home Paycheck Calculator | CalculateHub",
    description: "Calculate your net pay after taxes and deductions to better plan your budget.",
    type: "website",
    url: "https://calculatorhub.space/calculators/take-home-paycheck",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-1696413565d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Take-Home Paycheck Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Take-Home Paycheck Calculator | CalculateHub",
    description: "Calculate your net pay after taxes and deductions to better plan your budget.",
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
  //   canonical: "https://calculatorhub.space/calculators/take-home-paycheck"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function TakeHomePaycheckCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/take-home-paycheck" 
      />
      {children}
    </>
  )
}