import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Discount Calculator | CalculateHub",
  description: "Calculate sale prices, percentage discounts, and savings amounts with our free discount calculator to help you make smart shopping decisions.",
  keywords: "discount calculator, sale price calculator, percent off calculator, savings calculator, price reduction calculator, shopping calculator",
  openGraph: {
    title: "Discount Calculator | CalculateHub",
    description: "Calculate sale prices and understand your savings with different discount percentages.",
    type: "website",
    url: "https://calculatorhub.space/calculators/discount",
    images: [
      {
        url: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Discount Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Discount Calculator | CalculateHub",
    description: "Calculate sale prices and understand your savings with different discount percentages.",
    images: ["https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorhub.space/calculators/discount"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function DiscountCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/discount" 
      />
      {children}
    </>
  )
}