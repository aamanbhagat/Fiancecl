import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "College Cost Calculator | CalculateHub",
  description: "Plan for higher education expenses, estimate total college costs, and develop a savings strategy with our free college cost calculator.",
  keywords: "college cost calculator, tuition calculator, education expense calculator, college savings calculator, university cost estimator, student loan calculator",
  openGraph: {
    title: "College Cost Calculator | CalculateHub",
    description: "Estimate the total cost of college education and plan your savings strategy.",
    type: "website",
    url: "https://calculatorshub.store/calculators/college-cost",
    images: [
      {
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "College Cost Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "College Cost Calculator | CalculateHub",
    description: "Estimate the total cost of college education and plan your savings strategy.",
    images: ["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Removed alternates.canonical that was causing conflicts
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function CollegeCostCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/college-cost" 
      />
      {children}
    </>
  )
}