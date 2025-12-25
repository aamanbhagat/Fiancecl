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
        href="https://calculatorshub.store/calculators/compound-interest" 
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
            "url": "https://calculatorshub.store/calculators/compound-interest",
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
              "url": "https://calculatorshub.store"
            }
          })
        }}
      />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does compound interest work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Compound interest is interest earned on both your principal investment and previously earned interest. This creates a snowball effect where your money grows exponentially over time, making it one of the most powerful concepts in investing."
                }
              },
              {
                "@type": "Question",
                "name": "What's a good annual return rate for investments?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Historical stock market averages suggest 7-10% annually over long periods, but returns vary significantly based on investment type, time horizon, and market conditions. Conservative investments like bonds typically yield 3-5%, while stocks can vary widely."
                }
              },
              {
                "@type": "Question",
                "name": "How often should interest be compounded for best results?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "More frequent compounding (daily vs. annually) results in slightly higher returns. However, the difference is usually small. Daily compounding is common in savings accounts, while investment returns are typically calculated annually."
                }
              }
            ]
          })
        }}
      />
      
      {children}
    </>
  )
}