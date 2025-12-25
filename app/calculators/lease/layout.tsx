import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Lease Calculator | CalculateHub",
  description: "Calculate lease payments, compare leasing vs. buying options, and analyze total lease costs with our free lease calculator.",
  keywords: "lease calculator, lease payment calculator, equipment lease calculator, lease vs buy calculator, commercial lease calculator, lease cost calculator",
  openGraph: {
    title: "Lease Calculator | CalculateHub",
    description: "Calculate lease payments and compare different leasing options for equipment and property.",
    type: "website",
    url: "https://calculatorshub.store/calculators/lease",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554435493-93422e8d1c46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Lease Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Lease Calculator | CalculateHub",
    description: "Calculate lease payments and compare different leasing options for equipment and property.",
    images: ["https://images.unsplash.com/photo-1554435493-93422e8d1c46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorshub.store/calculators/lease"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function LeaseCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/lease" 
      />
      {children}
    </>
  )
}