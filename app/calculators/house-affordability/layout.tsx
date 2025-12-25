import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "House Affordability Calculator | CalculateHub",
  description: "Calculate how much house you can afford based on your income, debt, and down payment with our free house affordability calculator. Make informed home buying decisions.",
  keywords: "house affordability calculator, home affordability calculator, mortgage qualification calculator, home buying budget, income to home price calculator, debt-to-income ratio",
  openGraph: {
    title: "House Affordability Calculator | CalculateHub",
    description: "Calculate how much house you can afford based on your income and financial situation.",
    type: "website",
    url: "https://calculatorshub.store/calculators/house-affordability",
    images: [
      {
        url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "House Affordability Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "House Affordability Calculator | CalculateHub",
    description: "Calculate how much house you can afford based on your income and financial situation.",
    images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Remove this problematic property
  // alternates: {
  //   canonical: "https://calculatorshub.store/calculators/house-affordability"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function HouseAffordabilityCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/house-affordability" 
      />
      {children}
    </>
  )
}