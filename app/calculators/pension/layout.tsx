import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pension Calculator | CalculateHub",
  description: "Estimate retirement income, plan your pension contributions, and develop a secure retirement strategy with our free pension calculator.",
  keywords: "pension calculator, retirement calculator, retirement income calculator, pension planning tool, retirement savings calculator, pension fund calculator",
  openGraph: {
    title: "Pension Calculator | CalculateHub",
    description: "Estimate your future retirement income and plan for financial security during retirement.",
    type: "website",
    url: "https://calculatorshub.store/calculators/pension",
    images: [
      {
        url: "https://images.unsplash.com/photo-1573497019236-61f684a5ef01?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Pension Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Pension Calculator | CalculateHub",
    description: "Estimate your future retirement income and plan for financial security during retirement.",
    images: ["https://images.unsplash.com/photo-1573497019236-61f684a5ef01?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
    canonical: "https://calculatorshub.store/calculators/pension"
  }
}

export default function PensionCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}