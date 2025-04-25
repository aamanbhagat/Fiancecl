import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CD Calculator | CalculateHub",
  description: "Calculate returns on certificates of deposit, compare CD rates, and plan your savings strategy with our free CD calculator.",
  keywords: "CD calculator, certificate of deposit calculator, CD interest calculator, savings calculator, CD comparison tool, CD rate calculator, CD yield calculator",
  openGraph: {
    title: "CD Calculator | CalculateHub",
    description: "Calculate potential earnings on certificates of deposit and optimize your savings strategy.",
    type: "website",
    url: "https://calculatorhub.space/calculators/cd",
    images: [
      {
        url: "https://images.unsplash.com/photo-1565514020179-026b92b2d95b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "CD Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "CD Calculator | CalculateHub",
    description: "Calculate potential earnings on certificates of deposit and optimize your savings strategy.",
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
  // Removed alternates.canonical here
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function CDCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/cd" 
      />
      {children}
    </>
  )
}