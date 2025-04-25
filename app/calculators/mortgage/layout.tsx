import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mortgage Calculator | CalculateHub",
  description: "Calculate your monthly mortgage payments, view amortization schedules, and understand the total cost of your home loan with our free mortgage calculator.",
  keywords: "mortgage calculator, home loan calculator, monthly mortgage payment, mortgage amortization, mortgage interest calculator, house payment calculator",
  openGraph: {
    title: "Mortgage Calculator | CalculateHub",
    description: "Calculate your monthly payments and understand the total cost of your home loan.",
    type: "website",
    url: "https://calculatorhub.space/calculators/mortgage",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Mortgage Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Mortgage Calculator | CalculateHub",
    description: "Calculate your monthly mortgage payments and understand the total cost of your home loan.",
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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

// Override canonical URL specifically for this route
export const viewport = {
  themeColor: '#ffffff',
}

// This ensures this layout has its own canonical URL that won't conflict
export default function MortgageCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/mortgage" 
      />
      {children}
    </>
  )
}