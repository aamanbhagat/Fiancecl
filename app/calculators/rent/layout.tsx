import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Rent Calculator | CalculateHub",
  description: "Determine affordable rent payments, calculate rent-to-income ratios, and plan your housing budget with our free rent calculator.",
  keywords: "rent calculator, apartment rent calculator, rental affordability calculator, rent budget calculator, housing expense calculator, rent-to-income calculator",
  openGraph: {
    title: "Rent Calculator | CalculateHub",
    description: "Calculate affordable rent payments based on your income and budget.",
    type: "website",
    url: "https://calculatorhub.space/calculators/rent",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Rent Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Rent Calculator | CalculateHub",
    description: "Calculate affordable rent payments based on your income and budget.",
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorhub.space/calculators/rent"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function RentCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/rent" 
      />
      {children}
    </>
  )
}