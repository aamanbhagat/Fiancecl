import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Finance Calculator | CalculateHub",
  description: "Plan your financial future, analyze investments, and make informed money decisions with our comprehensive suite of finance calculators.",
  keywords: "finance calculator, financial planning calculator, investment calculator, money management tools, personal finance calculator, financial decision calculator",
  openGraph: {
    title: "Finance Calculator | CalculateHub",
    description: "Access comprehensive financial planning tools to make smarter money decisions.",
    type: "website",
    url: "https://calculatorhub.space/calculators/finance",
    images: [
      {
        url: "https://images.unsplash.com/photo-1565514020179-026b92b2d95b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Finance Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Finance Calculator | CalculateHub",
    description: "Access comprehensive financial planning tools to make smarter money decisions.",
    images: ["https://images.unsplash.com/photo-1565514020179-026b92b2d95b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Remove the alternates.canonical property completely
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function FinanceCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/finance" 
      />
      {children}
    </>
  )
}