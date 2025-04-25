import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Make sure this base URL exactly matches your domain
  const baseUrl = 'https://calculatehub.space'
  
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

  // Create static pages array with absolute URLs
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/calculators`,
      lastModified: new Date(),
    },
  ]

  // Create calculator pages array
  const calculatorPages = calculators.map((calculator) => ({
    url: `${baseUrl}/calculators/${calculator}`,
    lastModified: new Date(),
  }))

  // Return combined array
  return [...staticPages, ...calculatorPages]
}