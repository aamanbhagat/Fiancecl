import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Social Security Calculator | CalculateHub",
  description: "Estimate your Social Security benefits, analyze claiming strategies, and plan for retirement income with our free Social Security calculator.",
  keywords: "social security calculator, retirement benefits calculator, social security estimator, SSI calculator, retirement income calculator, social security claiming strategy",
  openGraph: {
    title: "Social Security Calculator | CalculateHub",
    description: "Estimate your Social Security benefits and optimize your claiming strategy for maximum retirement income.",
    type: "website",
    url: "https://calculatorhub.space/calculators/social-security",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Social Security Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Security Calculator | CalculateHub",
    description: "Estimate your Social Security benefits and optimize your claiming strategy for maximum retirement income.",
    images: ["https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Remove this problematic property entirely - this is the main issue!
  // alternates: {
  //   canonical: "https://calculatorhub.space/calculators/social-security"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function SocialSecurityCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/social-security" 
      />
      {children}
    </>
  )
}