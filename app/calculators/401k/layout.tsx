import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "401K Calculator | CalculateHub",
  description: "Plan your retirement with our free 401K calculator. Estimate your future savings, analyze contribution impacts, and optimize your retirement strategy.",
  keywords: "401K calculator, retirement calculator, retirement savings calculator, 401K contribution calculator, retirement planning, investment growth calculator",
  openGraph: {
    title: "401K Calculator | CalculateHub",
    description: "Plan your retirement and see how your 401K contributions can grow over time.",
    type: "website",
    url: "https://calculatorshub.store/calculators/401k",
    images: [
      {
        url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "401K Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "401K Calculator | CalculateHub",
    description: "Plan your retirement and see how your 401K contributions can grow over time.",
    images: ["https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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

export default function FourZeroOneKCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/401k" 
      />
      {children}
    </>
  )
}