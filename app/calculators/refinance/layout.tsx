import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Refinance Calculator | CalculateHub",
  description: "Calculate potential savings from refinancing your mortgage, compare loan options, and determine if refinancing makes financial sense with our free refinance calculator.",
  keywords: "refinance calculator, mortgage refinance calculator, loan refinance savings, refinance break-even calculator, refinance comparison tool, mortgage rate calculator",
  openGraph: {
    title: "Refinance Calculator | CalculateHub",
    description: "Calculate potential savings from refinancing your mortgage and determine if it's the right financial move.",
    type: "website",
    url: "https://calculatorshub.store/calculators/refinance",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Refinance Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Refinance Calculator | CalculateHub",
    description: "Calculate potential savings from refinancing your mortgage and determine if it's the right financial move.",
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
  // Remove this problematic property entirely
  // alternates: {
  //   canonical: "https://calculatorshub.store/calculators/refinance"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function RefinanceCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/refinance" 
      />
      {children}
    </>
  )
}