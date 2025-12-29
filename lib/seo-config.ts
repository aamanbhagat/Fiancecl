// SEO Configuration for CalculatorHub
export const seoConfig = {
  baseUrl: 'https://calculatorhub.space',
  siteName: 'CalculatorHub',
  defaultTitle: 'CalculatorHub - Free Online Financial Calculators',
  defaultDescription: 'Access 60+ free online financial calculators for mortgage, amortization, investment, loans, taxes, and more. Make informed financial decisions with our easy-to-use tools.',
  author: 'CalculatorHub Team',
  defaultKeywords: [
    'financial calculators',
    'mortgage calculator',
    'investment calculator',
    'loan calculator',
    'amortization calculator',
    'ROI calculator',
    'compound interest calculator',
    'debt calculator',
    'tax calculator',
    'retirement calculator',
    'savings calculator',
    'budget calculator',
    'business calculator',
    'auto loan calculator',
    'refinance calculator'
  ],
  openGraph: {
    type: 'website' as const,
    locale: 'en_US',
    siteName: 'CalculatorHub',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'CalculatorHub - Free Financial Calculators',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image' as const,
    site: '@calculatorhub',
    creator: '@calculatorhub',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here
    google: '', // Add Google Search Console verification code
    bing: '',   // Add Bing Webmaster verification code
    yandex: '', // Add Yandex verification code
  },
} as const

// Calculator categories for structured data
export const calculatorCategories = {
  'mortgage': {
    name: 'Mortgage & Housing',
    description: 'Calculate mortgage payments, house affordability, and related housing costs',
    keywords: ['mortgage', 'housing', 'home loan', 'real estate', 'property']
  },
  'investment': {
    name: 'Investment & Savings',
    description: 'Analyze investment returns, compound interest, and savings growth',
    keywords: ['investment', 'savings', 'compound interest', 'ROI', 'returns']
  },
  'loan': {
    name: 'Loans & Credit',
    description: 'Calculate loan payments, interest rates, and debt management',
    keywords: ['loan', 'credit', 'debt', 'payment', 'interest rate']
  },
  'tax': {
    name: 'Tax & Payroll',
    description: 'Calculate taxes, take-home pay, and tax-related expenses',
    keywords: ['tax', 'payroll', 'income tax', 'deduction', 'withholding']
  },
  'business': {
    name: 'Business & Finance',
    description: 'Business loan calculators, depreciation, and financial analysis',
    keywords: ['business', 'depreciation', 'finance', 'cash flow', 'profit']
  },
  'auto': {
    name: 'Auto & Vehicle',
    description: 'Auto loan, lease, and vehicle-related financial calculators',
    keywords: ['auto', 'vehicle', 'car loan', 'lease', 'financing']
  },
  'retirement': {
    name: 'Retirement & Benefits',
    description: 'Retirement planning, 401k, pension, and social security calculators',
    keywords: ['retirement', '401k', 'pension', 'social security', 'IRA']
  },
  'utility': {
    name: 'Utility & Conversion',
    description: 'Currency conversion, temperature, and other utility calculators',
    keywords: ['conversion', 'currency', 'temperature', 'utility', 'calculator']
  }
}

// Generate structured data for calculators
export function generateCalculatorStructuredData(calculator: {
  name: string;
  description: string;
  url: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: calculator.name,
    description: calculator.description,
    url: calculator.url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    provider: {
      '@type': 'Organization',
      name: 'CalculatorHub',
      url: seoConfig.baseUrl
    }
  }
}

// Generate FAQ structured data
export function generateFAQStructuredData(faqs: Array<{question: string; answer: string}>) {
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

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(items: Array<{name: string; url: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}
