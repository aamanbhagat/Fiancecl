import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Budget Calculator | CalculateHub",
  description: "Plan your finances, track expenses, and create a personalized spending plan with our free budget calculator to help you achieve your financial goals.",
  keywords: "budget calculator, personal budget planner, expense tracker, financial planning calculator, income and expense calculator, monthly budget calculator",
  openGraph: {
    title: "Budget Calculator | CalculateHub",
    description: "Create a personalized budget plan and take control of your finances.",
    type: "website",
    url: "https://calculatorhub.space/calculators/budget",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-1696413565d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Budget Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Budget Calculator | CalculateHub",
    description: "Create a personalized budget plan and take control of your finances.",
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
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function BudgetCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/budget" 
      />
      {children}
    </>
  )
}