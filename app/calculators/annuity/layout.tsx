import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Annuity Calculator | CalculateHub",
  description: "Calculate future value of annuities, determine payment amounts, and plan your investment strategy with our free annuity calculator.",
  keywords: "annuity calculator, annuity payment calculator, present value of annuity, future value of annuity, retirement annuity, investment calculator",
  openGraph: {
    title: "Annuity Calculator | CalculateHub",
    description: "Calculate annuity payments and analyze investment growth over time.",
    type: "website",
    url: "https://calculatorhub.space/calculators/annuity",
    images: [
      {
        url: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Annuity Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Annuity Calculator | CalculateHub",
    description: "Calculate annuity payments and analyze investment growth over time.",
    images: ["https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function AnnuityCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/annuity" 
      />
      {children}
    </>
  )
}