import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Down Payment Calculator | CalculateHub",
  description: "Calculate how much down payment you need for a home purchase, estimate monthly payments with different down payment amounts, and plan your home buying budget with our free down payment calculator.",
  keywords: "down payment calculator, home down payment calculator, mortgage down payment, house down payment estimator, home buying calculator, minimum down payment calculator",
  openGraph: {
    title: "Down Payment Calculator | CalculateHub",
    description: "Calculate the down payment needed for your home purchase and see how it affects your monthly payments.",
    type: "website",
    url: "https://calculatorhub.space/calculators/down-payment",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Down Payment Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Down Payment Calculator | CalculateHub",
    description: "Calculate the down payment needed for your home purchase and see how it affects your monthly payments.",
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
  // Remove this problematic property
  // alternates: {
  //   canonical: "https://calculatorhub.space/calculators/down-payment"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function DownPaymentCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/down-payment" 
      />
      {children}
    </>
  )
}