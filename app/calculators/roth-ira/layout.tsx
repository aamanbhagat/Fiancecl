import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Roth IRA Calculator | CalculateHub",
  description: "Plan your retirement with our free Roth IRA calculator. Compare tax-free growth potential, analyze contribution impacts, and optimize your retirement savings strategy.",
  keywords: "Roth IRA calculator, retirement calculator, tax-free investment calculator, IRA comparison calculator, retirement planning tool, retirement savings calculator",
  openGraph: {
    title: "Roth IRA Calculator | CalculateHub",
    description: "Calculate the tax-free growth potential of your Roth IRA investments and plan for retirement.",
    type: "website",
    url: "https://calculatorshub.store/calculators/roth-ira",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Roth IRA Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Roth IRA Calculator | CalculateHub",
    description: "Calculate the tax-free growth potential of your Roth IRA investments and plan for retirement.",
    images: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorshub.store/calculators/roth-ira"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function RothIRACalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/roth-ira" 
      />
      {children}
    </>
  )
}