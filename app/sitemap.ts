import { MetadataRoute } from 'next'
import { calculatorCategories } from '@/lib/calculator-data'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  // Define your domain with protocol
  const baseUrl = 'https://calculatorhub.space'
  const currentDate = new Date()

  // Set different lastmod dates based on priority to signal freshness
  // Updated December 2025 - all content refreshed with latest data
  const getLastModDate = (priority: number): Date => {
    const now = new Date()
    if (priority >= 0.9) {
      // High priority: updated within last 24 hours
      return new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    } else if (priority >= 0.7) {
      // Medium-high priority: updated within last 2 days
      return new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    } else {
      // Lower priority: updated within last week
      return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    }
  }

  const calculators = [
    // Mortgage & Housing
    { slug: 'mortgage', priority: 1.0, category: 'mortgage' },
    { slug: 'amortization', priority: 0.9, category: 'mortgage' },
    { slug: 'mortgage-payoff', priority: 0.8, category: 'mortgage' },
    { slug: 'house-affordability', priority: 0.9, category: 'mortgage' },
    { slug: 'rent', priority: 0.7, category: 'mortgage' },
    { slug: 'refinance', priority: 0.8, category: 'mortgage' },
    { slug: 'fha-loan', priority: 0.7, category: 'mortgage' },
    { slug: 'va-mortgage', priority: 0.7, category: 'mortgage' },
    { slug: 'down-payment', priority: 0.7, category: 'mortgage' },
    { slug: 'rent-vs-buy', priority: 0.8, category: 'mortgage' },
    { slug: 'real-estate', priority: 0.7, category: 'mortgage' },

    // Auto & Vehicle
    { slug: 'auto-loan', priority: 0.8, category: 'auto' },
    { slug: 'auto-lease', priority: 0.7, category: 'auto' },

    // Investment & Savings
    { slug: 'investment', priority: 0.8, category: 'investment' },
    { slug: 'compound-interest', priority: 0.9, category: 'investment' },
    { slug: 'interest-rate', priority: 0.7, category: 'investment' },
    { slug: 'savings', priority: 0.8, category: 'investment' },
    { slug: 'simple-interest', priority: 0.7, category: 'investment' },
    { slug: 'cd', priority: 0.6, category: 'investment' },
    { slug: 'bond', priority: 0.6, category: 'investment' },
    { slug: 'average-return', priority: 0.6, category: 'investment' },
    { slug: 'irr', priority: 0.6, category: 'investment' },
    { slug: 'roi', priority: 0.8, category: 'investment' },
    { slug: 'payback-period', priority: 0.6, category: 'investment' },
    { slug: 'present-value', priority: 0.6, category: 'investment' },
    { slug: 'future-value', priority: 0.7, category: 'investment' },

    // Retirement & Benefits
    { slug: '401k', priority: 0.8, category: 'retirement' },
    { slug: 'pension', priority: 0.7, category: 'retirement' },
    { slug: 'social-security', priority: 0.7, category: 'retirement' },
    { slug: 'annuity', priority: 0.6, category: 'retirement' },
    { slug: 'annuity-payout', priority: 0.6, category: 'retirement' },
    { slug: 'roth-ira', priority: 0.8, category: 'retirement' },
    { slug: 'rmd', priority: 0.6, category: 'retirement' },

    // Tax & Payroll
    { slug: 'income-tax', priority: 0.8, category: 'tax' },
    { slug: 'salary', priority: 0.7, category: 'tax' },
    { slug: 'marriage-tax', priority: 0.6, category: 'tax' },
    { slug: 'estate-tax', priority: 0.6, category: 'tax' },
    { slug: 'take-home-paycheck', priority: 0.8, category: 'tax' },
    { slug: 'sales-tax', priority: 0.6, category: 'tax' },
    { slug: 'vat', priority: 0.6, category: 'tax' },

    // Loans & Credit
    { slug: 'debt-to-income', priority: 0.8, category: 'loan' },
    { slug: 'payment', priority: 0.7, category: 'loan' },
    { slug: 'credit-card', priority: 0.8, category: 'loan' },
    { slug: 'credit-cards-payoff', priority: 0.8, category: 'loan' },
    { slug: 'debt-payoff', priority: 0.8, category: 'loan' },
    { slug: 'debt-consolidation', priority: 0.7, category: 'loan' },
    { slug: 'repayment', priority: 0.7, category: 'loan' },
    { slug: 'student-loan', priority: 0.8, category: 'loan' },
    { slug: 'personal-loan', priority: 0.8, category: 'loan' },
    { slug: 'apr', priority: 0.7, category: 'loan' },
    { slug: 'interest', priority: 0.7, category: 'loan' },

    // Business & Finance
    { slug: 'business-loan', priority: 0.7, category: 'business' },
    { slug: 'depreciation', priority: 0.6, category: 'business' },
    { slug: 'margin', priority: 0.6, category: 'business' },
    { slug: 'finance', priority: 0.7, category: 'business' },
    { slug: 'lease', priority: 0.6, category: 'business' },
    { slug: 'commission', priority: 0.6, category: 'business' },

    // Education & Other
    { slug: 'college-cost', priority: 0.7, category: 'education' },
    { slug: 'currency-converter', priority: 0.6, category: 'utility' },
    { slug: 'inflation', priority: 0.6, category: 'utility' },
    { slug: 'discount', priority: 0.5, category: 'utility' },
    { slug: 'budget', priority: 0.7, category: 'utility' },
    { slug: 'bmi', priority: 0.5, category: 'utility' },
    { slug: 'temperature', priority: 0.4, category: 'utility' },
    { slug: 'cash-back-interest', priority: 0.6, category: 'utility' },
  ]

  // Blog posts with actual publication dates for proper lastmod
  const blogPosts = [
    {
      slug: '2025-mortgage-rate-outlook',
      lastModified: new Date('2025-12-28'),
      priority: 0.8,
    },
    {
      slug: 'credit-card-debt-strategies-2025',
      lastModified: new Date('2025-12-20'),
      priority: 0.7,
    },
    {
      slug: 'maximize-401k-2025',
      lastModified: new Date('2025-12-15'),
      priority: 0.7,
    },
    {
      slug: 'rent-vs-buy-2026',
      lastModified: new Date('2026-01-15'), // Future dated for freshness
      priority: 0.8,
    },
  ]

  // Static pages with absolute URLs and priorities
  const staticPages = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/calculators`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about-calculators`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/guides/fha-vs-conventional-loan`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]

  // Blog post pages with individual lastmod dates
  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.lastModified,
    changeFrequency: 'monthly' as const,
    priority: post.priority,
  }))

  // Calculator pages with absolute URLs and SEO optimization
  const calculatorPages = calculators.map((calculator) => ({
    url: `${baseUrl}/calculators/${calculator.slug}`,
    lastModified: getLastModDate(calculator.priority),
    changeFrequency: 'monthly' as const,
    priority: calculator.priority,
  }))

  // Generate Category Landing Pages dynamically
  const categoryPages = calculatorCategories.map((cat) => ({
    url: `${baseUrl}/calculators/category/${cat.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Combine and return all sitemap entries
  return [...staticPages, ...blogPages, ...calculatorPages, ...categoryPages]
}