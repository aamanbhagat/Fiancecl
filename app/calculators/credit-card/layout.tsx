import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Credit Card Calculator | CalculateHub",
  description: "Calculate credit card payments, interest costs, and payoff timelines with our free credit card calculator. Plan your debt repayment strategy effectively.",
  keywords: "credit card calculator, credit card payment calculator, credit card interest calculator, debt payoff calculator, minimum payment calculator, credit card debt calculator",
  openGraph: {
    title: "Credit Card Calculator | CalculateHub",
    description: "Calculate credit card payments and plan an effective debt payoff strategy.",
    type: "website",
    url: "https://calculatorhub.space/calculators/credit-card",
    images: [
      {
        url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Credit Card Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Credit Card Calculator | CalculateHub",
    description: "Calculate credit card payments and plan an effective debt payoff strategy.",
    images: ["https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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

export default function CreditCardCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/credit-card" 
      />
      {children}
    </>
  )
}