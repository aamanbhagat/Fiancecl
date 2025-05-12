import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Define your domain with protocol
  const baseUrl = 'https://calculatorhub.space'

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
    'bmi',
    'temperature',
  ]

  // Static pages with absolute URLs
  const staticPages = [
    {
      url: `${baseUrl}/`,           // Root path
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,     // About page
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,      // Blog page
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contact`,   // Contact page
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/calculators`, // Calculators index page
      lastModified: new Date(),
    },
  ]

  // Calculator pages with absolute URLs
  const calculatorPages = calculators.map((calculator) => ({
    url: `${baseUrl}/calculators/${calculator}`, // Individual calculator pages
    lastModified: new Date(),
  }))

  // Combine and return all sitemap entries
  return [...staticPages, ...calculatorPages]
}