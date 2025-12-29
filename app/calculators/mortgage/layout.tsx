import type { Metadata } from "next"
import { generateCalculatorMetadata, calculatorKeywords } from "@/lib/calculator-metadata"

export const metadata: Metadata = generateCalculatorMetadata({
  title: "Mortgage Calculator",
  description: "Calculate your monthly mortgage payments, view detailed amortization schedules, and understand the total cost of your home loan with our comprehensive mortgage calculator. Get accurate estimates for principal, interest, taxes, and insurance.",
  keywords: calculatorKeywords.mortgage,
  path: "/calculators/mortgage",
  image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
  category: "mortgage"
})

export const viewport = {
  themeColor: '#ffffff',
}

export default function MortgageCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/mortgage" 
      />
      
      {/* Mortgage Calculator Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Mortgage Calculator",
            "description": "Calculate monthly mortgage payments and view amortization schedules",
            "url": "https://calculatorhub.space/calculators/mortgage",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Monthly payment calculation",
              "Amortization schedule",
              "Principal and interest breakdown",
              "Total interest calculation",
              "Payment charts and graphs"
            ],
            "provider": {
              "@type": "Organization",
              "name": "CalculatorHub",
              "url": "https://calculatorhub.space"
            }
          })
        }}
      />
      
      {children}
    </>
  )
}