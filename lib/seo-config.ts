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
    alternateLocale: [
      'en_GB',
      'en_CA',
      'en_AU',
      'en_IN',
      'en_NZ',
      'en_IE',
      'en_SG',
      'en_PH',
      'en_ZA',
    ],
    siteName: 'CalculatorHub',
    images: [
      {
        url: 'https://calculatorhub.space/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CalculatorHub - Free Online Financial Calculators',
        type: 'image/png',
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
  /**
   * Search Engine Verification Codes
   * 
   * To get these verification codes:
   * 
   * GOOGLE SEARCH CONSOLE:
   * 1. Go to https://search.google.com/search-console
   * 2. Add your property (https://calculatorhub.space)
   * 3. Choose "HTML tag" verification method
   * 4. Copy the content value from the meta tag (e.g., "abc123xyz...")
   * 
   * BING WEBMASTER TOOLS:
   * 1. Go to https://www.bing.com/webmasters
   * 2. Add your site and verify ownership
   * 3. Get the verification code from the meta tag
   * 
   * YANDEX WEBMASTER:
   * 1. Go to https://webmaster.yandex.com
   * 2. Add your site and get the verification code
   */
  verification: {
    google: '', // Paste your Google Search Console verification code here
    bing: '',   // Paste your Bing Webmaster verification code here
    yandex: '', // Paste your Yandex verification code here (optional, for international SEO)
  },
  /**
   * Google Tag Manager Configuration
   * 
   * GTM provides easier management of analytics, conversion tracking, and third-party tags.
   * 
   * To set up GTM:
   * 1. Go to https://tagmanager.google.com
   * 2. Create a new container for your website
   * 3. Copy the GTM ID (format: GTM-XXXXXXX)
   * 4. Paste it below
   * 5. Configure tags in GTM dashboard (GA4, conversion tracking, etc.)
   */
  googleTagManager: {
    id: '', // Format: GTM-XXXXXXX (leave empty to disable GTM)
  },
  /**
   * International SEO Configuration
   * 
   * hreflang tags tell search engines which language/region each page targets.
   * This helps Google serve the right version to users based on their location/language.
   * 
   * Current setup targets all English-speaking regions with the same content,
   * which is appropriate for a single-language site with global reach.
   * 
   * To add a new language:
   * 1. Create translated content at /[lang-code]/ (e.g., /es/ for Spanish)
   * 2. Add the hreflang entry below
   * 3. Update sitemap.ts to include language-specific URLs
   */
  alternateLanguages: [
    // Default fallback for unmatched languages
    { hrefLang: 'x-default', href: 'https://calculatorhub.space' },

    // Primary English (generic)
    { hrefLang: 'en', href: 'https://calculatorhub.space' },

    // Regional English variants - all point to same content
    // This helps Google understand our site serves all English-speaking regions
    { hrefLang: 'en-US', href: 'https://calculatorhub.space' },  // United States
    { hrefLang: 'en-GB', href: 'https://calculatorhub.space' },  // United Kingdom
    { hrefLang: 'en-CA', href: 'https://calculatorhub.space' },  // Canada
    { hrefLang: 'en-AU', href: 'https://calculatorhub.space' },  // Australia
    { hrefLang: 'en-IN', href: 'https://calculatorhub.space' },  // India
    { hrefLang: 'en-NZ', href: 'https://calculatorhub.space' },  // New Zealand
    { hrefLang: 'en-IE', href: 'https://calculatorhub.space' },  // Ireland
    { hrefLang: 'en-SG', href: 'https://calculatorhub.space' },  // Singapore
    { hrefLang: 'en-PH', href: 'https://calculatorhub.space' },  // Philippines
    { hrefLang: 'en-ZA', href: 'https://calculatorhub.space' },  // South Africa

    // Future language expansion (uncomment when content is available):
    // { hrefLang: 'es', href: 'https://calculatorhub.space/es' },      // Spanish
    // { hrefLang: 'es-MX', href: 'https://calculatorhub.space/es-mx' }, // Spanish (Mexico)
    // { hrefLang: 'fr', href: 'https://calculatorhub.space/fr' },      // French
    // { hrefLang: 'de', href: 'https://calculatorhub.space/de' },      // German
    // { hrefLang: 'pt-BR', href: 'https://calculatorhub.space/pt-br' }, // Portuguese (Brazil)
    // { hrefLang: 'hi', href: 'https://calculatorhub.space/hi' },      // Hindi
  ],

  /**
   * Geographic targeting configuration
   * Used for region-specific content or offerings
   */
  geoTargeting: {
    primaryMarket: 'US',
    supportedRegions: ['US', 'GB', 'CA', 'AU', 'IN', 'NZ', 'IE', 'SG', 'PH', 'ZA'],
    currencyByRegion: {
      US: 'USD',
      GB: 'GBP',
      CA: 'CAD',
      AU: 'AUD',
      IN: 'INR',
      NZ: 'NZD',
      IE: 'EUR',
      SG: 'SGD',
      PH: 'PHP',
      ZA: 'ZAR',
    },
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
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
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
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
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
