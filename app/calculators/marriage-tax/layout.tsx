import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Marriage Tax Calculator | CalculateHub",
  description: "Calculate potential marriage tax benefits or penalties, compare tax scenarios before and after marriage, and plan your filing strategy with our free marriage tax calculator.",
  keywords: "marriage tax calculator, marriage tax penalty calculator, marriage tax bonus calculator, joint filing calculator, tax planning for couples, marriage tax implications",
  openGraph: {
    title: "Marriage Tax Calculator | CalculateHub",
    description: "Calculate how marriage affects your taxes and determine the best filing strategy for your household.",
    type: "website",
    url: "https://calculatorhub.space/calculators/marriage-tax",
    images: [
      {
        url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Marriage Tax Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Marriage Tax Calculator | CalculateHub",
    description: "Calculate how marriage affects your taxes and determine the best filing strategy for your household.",
    images: ["https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
    canonical: "https://calculatorhub.space/calculators/marriage-tax"
  }
}

export default function MarriageTaxCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}