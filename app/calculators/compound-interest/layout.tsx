import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compound Interest Calculator | CalculateHub",
  description: "Calculate investment growth, analyze savings potential, and visualize the power of compound interest with our free compound interest calculator.",
  keywords: "compound interest calculator, investment growth calculator, interest calculator, savings growth calculator, future value calculator, investment return calculator",
  openGraph: {
    title: "Compound Interest Calculator | CalculateHub",
    description: "Calculate how your investments can grow over time with the power of compound interest.",
    type: "website",
    url: "https://calculatorhub.space/calculators/compound-interest",
    images: [
      {
        url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Compound Interest Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Compound Interest Calculator | CalculateHub",
    description: "Calculate how your investments can grow over time with the power of compound interest.",
    images: ["https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
    canonical: "https://calculatorhub.space/calculators/compound-interest"
  }
}

export default function CompoundInterestCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}