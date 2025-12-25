import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Debt Consolidation Calculator | CalculateHub",
  description: "Calculate potential savings from consolidating multiple debts, compare interest rates, and plan your path to becoming debt-free with our free debt consolidation calculator.",
  keywords: "debt consolidation calculator, debt refinancing calculator, loan consolidation calculator, debt payoff calculator, interest savings calculator, debt management tool",
  openGraph: {
    title: "Debt Consolidation Calculator | CalculateHub",
    description: "Calculate how much you can save by consolidating your debts into a single loan with a lower interest rate.",
    type: "website",
    url: "https://calculatorshub.store/calculators/debt-consolidation",
    images: [
      {
        url: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Debt Consolidation Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Debt Consolidation Calculator | CalculateHub",
    description: "Calculate how much you can save by consolidating your debts into a single loan with a lower interest rate.",
    images: ["https://images.unsplash.com/photo-1579621970795-87facc2f976d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Removed the alternates.canonical property
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function DebtConsolidationCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/debt-consolidation" 
      />
      {children}
    </>
  )
}