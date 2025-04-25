import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Use relative paths; Next.js will resolve them based on the app's base URL
  const basePath = ''

  const calculators = [
    'mortgage',
    'amortization',
    'mortgage-payoff',
    'house-affordability',
    'rent',
    'refinance',
    'fha-loan',
    'va-mortgage',
    'auto-loan',
    'cash-back-or-low-interest',
    'auto-lease',
    'investment',
    'compound-interest',
    'interest-rate',
    'savings',
    'simple-interest',
    'cd',
    'bond',
    'average-return',
    'irr',
    'roi',
    'payback-period',
    'present-value',
    'future-value',
    '401k',
    'pension',
    'social-security',
    'annuity',
    'annuity-payout',
    'roth-ira',
    'rmd',
    'income-tax',
    'salary',
    'marriage-tax',
    'estate-tax',
    'take-home-paycheck',
    'debt-to-income',
    'payment',
    'credit-card',
    'credit-cards-payoff',
    'debt-payoff',
    'debt-consolidation',
    'repayment',
    'student-loan',
    'college-cost',
    'real-estate',
    'finance',
    'currency-converter',
    'inflation',
    'sales-tax',
    'vat',
    'depreciation',
    'margin',
    'discount',
    'business-loan',
    'personal-loan',
    'lease',
    'budget',
    'commission',
    'apr',
    'interest',
  ]

  // Static pages with relative URLs
  const staticPages = [
    {
      url: `${basePath}/`,           // Root path
      lastModified: new Date(),
    },
    {
      url: `${basePath}/about`,     // About page
      lastModified: new Date(),
    },
    {
      url: `${basePath}/blog`,      // Blog page
      lastModified: new Date(),
    },
    {
      url: `${basePath}/contact`,   // Contact page
      lastModified: new Date(),
    },
    {
      url: `${basePath}/calculators`, // Calculators index page
      lastModified: new Date(),
    },
  ]

  // Calculator pages with relative URLs
  const calculatorPages = calculators.map((calculator) => ({
    url: `${basePath}/calculators/${calculator}`, // Individual calculator pages
    lastModified: new Date(),
  }))

  // Combine and return all sitemap entries
  return [...staticPages, ...calculatorPages]
}