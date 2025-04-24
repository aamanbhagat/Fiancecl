import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Estate Calculator | CalculateHub",
  description: "Plan your estate, estimate inheritance taxes, and calculate asset distribution with our free estate calculator to help with your legacy planning.",
  keywords: "estate calculator, inheritance tax calculator, estate planning calculator, estate value calculator, legacy planning, estate distribution calculator",
  openGraph: {
    title: "Estate Calculator | CalculateHub",
    description: "Plan your estate and calculate potential inheritance taxes and asset distribution.",
    type: "website",
    url: "https://calculatorhub.space/calculators/estate",
    images: [
      {
        url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Estate Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Estate Calculator | CalculateHub",
    description: "Plan your estate and calculate potential inheritance taxes and asset distribution.",
    images: ["https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
    canonical: "https://calculatorhub.space/calculators/estate"
  }
}

export default function EstateCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}