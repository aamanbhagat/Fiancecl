import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payback Period Calculator | CalculateHub",
  description: "Calculate investment payback periods, determine break-even points, and evaluate project viability with our free payback period calculator.",
  keywords: "payback period calculator, break-even calculator, investment return period, capital budgeting calculator, project evaluation tool, investment recovery calculator",
  openGraph: {
    title: "Payback Period Calculator | CalculateHub",
    description: "Calculate how long it will take to recoup your investment and reach the break-even point.",
    type: "website",
    url: "https://calculatorhub.space/calculators/payback-period",
    images: [
      {
        url: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Payback Period Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Payback Period Calculator | CalculateHub",
    description: "Calculate how long it will take to recoup your investment and reach the break-even point.",
    images: ["https://images.unsplash.com/photo-1604594849809-dfedbc827105?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorhub.space/calculators/payback-period"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function PaybackPeriodCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/payback-period" 
      />
      {children}
    </>
  )
}