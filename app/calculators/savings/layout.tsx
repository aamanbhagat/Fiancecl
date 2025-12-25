import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Savings Calculator | CalculateHub",
  description: "Plan your savings strategy, track progress toward financial goals, and visualize your savings growth with our free savings calculator.",
  keywords: "savings calculator, savings goal calculator, savings planner, goal-based savings calculator, savings growth calculator, systematic savings calculator",
  openGraph: {
    title: "Savings Calculator | CalculateHub",
    description: "Plan your savings strategy and calculate how to reach your financial goals.",
    type: "website",
    url: "https://calculatorshub.store/calculators/savings",
    images: [
      {
        url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Savings Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Savings Calculator | CalculateHub",
    description: "Plan your savings strategy and calculate how to reach your financial goals.",
    images: ["https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorshub.store/calculators/savings"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function SavingsCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/savings" 
      />
      {children}
    </>
  )
}