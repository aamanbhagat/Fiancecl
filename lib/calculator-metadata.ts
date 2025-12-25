import { Metadata } from 'next'
import { seoConfig, generateCalculatorStructuredData } from './seo-config'

interface CalculatorMetadataProps {
  title: string
  description: string
  keywords: string[]
  path: string
  image?: string
  category?: string
  additionalStructuredData?: object[]
}

export function generateCalculatorMetadata({
  title,
  description,
  keywords,
  path,
  image,
  category,
  additionalStructuredData = []
}: CalculatorMetadataProps): Metadata {
  const fullTitle = `${title} | ${seoConfig.siteName}`
  const url = `${seoConfig.baseUrl}${path}`
  const defaultImage = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
  const ogImage = image || defaultImage

  return {
    title: fullTitle,
    description,
    keywords: [...keywords, ...seoConfig.defaultKeywords].join(', '),
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      url,
      siteName: seoConfig.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: seoConfig.openGraph.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      site: seoConfig.twitter.site,
      creator: seoConfig.twitter.creator,
    },
    robots: seoConfig.robots,
    alternates: {
      canonical: url,
    },
    category: category || 'finance',
    other: {
      'calculatorhub:type': 'calculator',
      'calculatorhub:category': category || 'general',
    }
  }
}

// Common keyword sets for different calculator types
export const calculatorKeywords = {
  mortgage: [
    'mortgage calculator',
    'home loan calculator',
    'monthly mortgage payment',
    'mortgage amortization',
    'mortgage interest calculator',
    'house payment calculator',
    'loan payment calculator',
    'principal and interest calculator'
  ],
  investment: [
    'investment calculator',
    'compound interest calculator',
    'ROI calculator',
    'return on investment',
    'investment growth calculator',
    'savings calculator',
    'future value calculator',
    'investment return calculator'
  ],
  loan: [
    'loan calculator',
    'loan payment calculator',
    'personal loan calculator',
    'loan amortization calculator',
    'monthly payment calculator',
    'interest rate calculator',
    'loan interest calculator',
    'payment schedule calculator'
  ],
  tax: [
    'tax calculator',
    'income tax calculator',
    'tax refund calculator',
    'payroll calculator',
    'withholding calculator',
    'tax deduction calculator',
    'estimated tax calculator',
    'tax planning calculator'
  ],
  retirement: [
    'retirement calculator',
    '401k calculator',
    'pension calculator',
    'IRA calculator',
    'retirement planning calculator',
    'retirement savings calculator',
    'social security calculator',
    'retirement income calculator'
  ],
  auto: [
    'auto loan calculator',
    'car loan calculator',
    'vehicle loan calculator',
    'auto lease calculator',
    'car payment calculator',
    'auto financing calculator',
    'vehicle financing calculator',
    'car lease calculator'
  ],
  business: [
    'business calculator',
    'business loan calculator',
    'depreciation calculator',
    'business finance calculator',
    'cash flow calculator',
    'profit calculator',
    'break-even calculator',
    'business investment calculator'
  ],
  debt: [
    'debt calculator',
    'debt payoff calculator',
    'credit card calculator',
    'debt consolidation calculator',
    'debt-to-income calculator',
    'debt management calculator',
    'minimum payment calculator',
    'credit card payoff calculator'
  ]
}

// Generate FAQ structured data for calculators
export function generateCalculatorFAQ(calculatorType: string, customFAQs?: Array<{question: string; answer: string}>) {
  const commonFAQs = {
    mortgage: [
      {
        question: "How accurate is this mortgage calculator?",
        answer: "Our mortgage calculator provides estimates based on the information you enter. Actual loan terms may vary based on your credit score, down payment, and lender requirements."
      },
      {
        question: "What factors affect my monthly mortgage payment?",
        answer: "Your monthly payment depends on loan amount, interest rate, loan term, property taxes, homeowners insurance, and PMI if applicable."
      }
    ],
    investment: [
      {
        question: "How does compound interest work?",
        answer: "Compound interest is interest earned on both your principal investment and previously earned interest, allowing your money to grow exponentially over time."
      },
      {
        question: "What's a good annual return rate for investments?",
        answer: "Historical stock market averages suggest 7-10% annually, but returns vary significantly based on investment type, time horizon, and market conditions."
      }
    ]
  }

  const faqs = customFAQs || commonFAQs[calculatorType as keyof typeof commonFAQs] || []
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}
