import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Rent vs Buy Calculator | CalculateHub",
  description: "Compare the financial benefits of renting versus buying a home, analyze long-term costs, and make an informed housing decision with our free rent vs buy calculator.",
  keywords: "rent vs buy calculator, home buying calculator, renting versus buying, housing cost comparison, mortgage vs rent calculator, property ownership calculator",
  openGraph: {
    title: "Rent vs Buy Calculator | CalculateHub",
    description: "Compare the financial implications of renting versus buying a home to make the best housing decision.",
    type: "website",
    url: "https://calculatorshub.store/calculators/rent-vs-buy",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560518883-b414192d367e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Rent vs Buy Calculator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Rent vs Buy Calculator | CalculateHub",
    description: "Compare the financial implications of renting versus buying a home to make the best housing decision.",
    images: ["https://images.unsplash.com/photo-1560518883-b414192d367e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"]
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
  //   canonical: "https://calculatorshub.store/calculators/rent-vs-buy"
  // }
}

export const viewport = {
  themeColor: '#ffffff',
}

export default function RentVsBuyCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorshub.store/calculators/rent-vs-buy" 
      />
      {children}
    </>
  )
}