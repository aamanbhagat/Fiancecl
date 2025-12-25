import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "RMD Calculator | CalculateHub",
  description: "Calculate required minimum distributions from retirement accounts, plan your retirement withdrawals, and ensure tax compliance with our free RMD calculator.",
  keywords: "RMD calculator, required minimum distribution calculator, retirement withdrawal calculator, IRA distribution calculator, 401k distribution calculator, retirement tax planning",
  openGraph: {
    title: "RMD Calculator | CalculateHub",
    description: "Calculate your required minimum distributions from retirement accounts and plan tax-efficient withdrawals.",
    type: "website",
    url: "https://calculatorshub.store/calculators/rmd",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "RMD Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "RMD Calculator | CalculateHub",
    description: "Calculate your required minimum distributions from retirement accounts and plan tax-efficient withdrawals.",
    images: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  // Remove this problematic property entirely
  // alternates: {
  //   canonical: "https://calculatorshub.store/calculators/rmd"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function RMDCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/rmd" 
      />
      {children}
    </>
  )
}