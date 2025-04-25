import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Credit Cards Payoff Calculator | CalculateHub",
  description: "Create a debt payoff strategy for multiple credit cards, compare payoff methods, and track your journey to becoming debt-free with our free credit cards payoff calculator.",
  keywords: "credit cards payoff calculator, debt snowball calculator, debt avalanche calculator, multiple credit cards, debt payoff strategy, debt free calculator, credit card debt elimination",
  openGraph: {
    title: "Credit Cards Payoff Calculator | CalculateHub",
    description: "Create an effective strategy to pay off multiple credit cards and become debt-free faster.",
    type: "website",
    url: "https://calculatorhub.space/calculators/credit-cards-payoff",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21ed6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Credit Cards Payoff Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Credit Cards Payoff Calculator | CalculateHub",
    description: "Create an effective strategy to pay off multiple credit cards and become debt-free faster.",
    images: ["https://images.unsplash.com/photo-1554224155-8d04cb21ed6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Removed alternates.canonical property
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function CreditCardsPayoffCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/credit-cards-payoff" 
      />
      {children}
    </>
  )
}