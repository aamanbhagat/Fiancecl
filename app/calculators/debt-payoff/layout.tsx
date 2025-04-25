import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Debt Payoff Calculator | CalculateHub",
  description: "Create a personalized debt payoff plan, compare different repayment strategies, and track your journey to financial freedom with our free debt payoff calculator.",
  keywords: "debt payoff calculator, debt snowball calculator, debt avalanche calculator, debt free calculator, debt elimination plan, debt repayment strategy",
  openGraph: {
    title: "Debt Payoff Calculator | CalculateHub",
    description: "Create a personalized plan to become debt-free faster with different repayment strategies.",
    type: "website",
    url: "https://calculatorhub.space/calculators/debt-payoff",
    images: [
      {
        url: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Debt Payoff Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Debt Payoff Calculator | CalculateHub",
    description: "Create a personalized plan to become debt-free faster with different repayment strategies.",
    images: ["https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Removed the problematic alternates.canonical property
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function DebtPayoffCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/debt-payoff" 
      />
      {children}
    </>
  )
}