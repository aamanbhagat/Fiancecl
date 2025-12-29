import type { Metadata } from "next"
import { generateCalculatorMetadata, calculatorKeywords } from "@/lib/calculator-metadata"

export const metadata: Metadata = generateCalculatorMetadata({
  title: "Compound Interest Calculator",
  description: "Calculate investment growth and analyze the power of compound interest over time. See how your investments can grow with our comprehensive compound interest calculator featuring charts, tables, and detailed projections.",
  keywords: calculatorKeywords.investment,
  path: "/calculators/compound-interest",
  image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
  category: "investment"
})

export const viewport = {
  themeColor: '#ffffff',
}

export default function CompoundInterestCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="canonical" 
        href="https://calculatorhub.space/calculators/compound-interest" 
      />
      
      {/* Compound Interest Calculator Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Compound Interest Calculator",
            "description": "Calculate how your investments grow over time with compound interest",
            "url": "https://calculatorhub.space/calculators/compound-interest",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Compound interest calculation",
              "Investment growth projection",
              "Future value calculation",
              "Interactive charts and graphs",
              "Detailed breakdown tables",
              "Regular contribution modeling"
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