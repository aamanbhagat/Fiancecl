import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "APR Calculator | CalculateHub",
  description: "Calculate the true cost of loans with our free APR calculator. Compare loan offers, understand interest rates, and make informed borrowing decisions.",
  keywords: "APR calculator, annual percentage rate calculator, loan comparison calculator, effective interest rate, true cost of borrowing, credit card APR calculator",
  openGraph: {
    title: "APR Calculator | CalculateHub",
    description: "Calculate the true cost of loans and compare different loan offers with our APR calculator.",
    type: "website",
    url: "https://calculatorhub.space/calculators/apr",
    images: [
      {
        url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "APR Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "APR Calculator | CalculateHub",
    description: "Calculate the true cost of loans and compare different loan offers with our APR calculator.",
    images: ["https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  },
  alternates: {
    canonical: "https://calculatorhub.space/calculators/apr"
  }
}

export default function APRCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}