import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"
import Script from "next/script"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { AuthorBio } from "@/components/author-bio"

// Article data for reuse in metadata and structured data
const articleData = {
  title: "2025 Mortgage Rate Outlook: What Homebuyers Need to Know",
  description: "With mortgage rates averaging 6.62% in December 2025, learn what this means for your home buying power and how to secure the best rates in today's market.",
  author: "Sarah Johnson",
  datePublished: "2025-12-28",
  dateModified: "2025-12-28",
  image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=630",
  category: "Mortgage",
  readingTime: "8 min read",
  url: "https://calculatorhub.space/blog/2025-mortgage-rate-outlook"
}

export const metadata: Metadata = {
  title: `${articleData.title} | CalculatorHub`,
  description: articleData.description,
  authors: [{ name: articleData.author }],
  openGraph: {
    title: articleData.title,
    description: articleData.description,
    type: 'article',
    publishedTime: articleData.datePublished,
    modifiedTime: articleData.dateModified,
    authors: [articleData.author],
    images: [articleData.image],
    section: articleData.category,
  },
  twitter: {
    card: 'summary_large_image',
    title: articleData.title,
    description: articleData.description,
    images: [articleData.image],
  },
  alternates: {
    canonical: articleData.url,
  }
}

export default function BlogPost() {
  // Article structured data for rich search results
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articleData.title,
    description: articleData.description,
    image: articleData.image,
    author: {
      '@type': 'Person',
      name: articleData.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'CalculatorHub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://calculatorhub.space/calculator.png'
      }
    },
    datePublished: articleData.datePublished,
    dateModified: articleData.dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleData.url
    },
    articleSection: articleData.category,
    wordCount: 1500,
    keywords: ['mortgage rates', '2025 housing market', 'home buying', 'mortgage calculator', 'interest rates']
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Article Structured Data */}
      <Script
        id="article-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData)
        }}
      />

      <SiteHeader />
      <main className="flex-1">
        <article className="container max-w-4xl py-12">
          {/* SEO Breadcrumbs */}
          <Breadcrumbs
            items={[
              { name: 'Blog', href: '/blog' },
              { name: '2025 Mortgage Rate Outlook', href: '/blog/2025-mortgage-rate-outlook' }
            ]}
          />

          <Link href="/blog">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>

          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">Mortgage</Badge>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              2025 Mortgage Rate Outlook: What Homebuyers Need to Know
            </h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                December 28, 2025
              </div>
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Sarah Johnson
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                8 min read
              </div>
            </div>
          </div>

          <div className="relative h-96 w-full mb-12 rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
              alt="Modern house exterior representing 2025 mortgage and housing market outlook"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
            />
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead">
              As we close out 2025, mortgage rates have stabilized around 6.62% for a 30-year fixed-rate loan. While this is significantly higher than the historic lows of 2020-2021, understanding the current market dynamics can help you make informed decisions about homeownership.
            </p>

            <h2>Current Market Overview</h2>
            <p>
              The average 30-year fixed mortgage rate stands at approximately 6.62% as of December 2025. This represents a slight decrease from the peak rates seen earlier in the year, offering a window of opportunity for prospective homebuyers.
            </p>

            <h3>Key Rate Benchmarks for December 2025:</h3>
            <ul>
              <li><strong>30-Year Fixed:</strong> 6.62% average</li>
              <li><strong>15-Year Fixed:</strong> 5.89% average</li>
              <li><strong>5/1 ARM:</strong> 5.95% average</li>
              <li><strong>FHA Loans:</strong> 6.15% average</li>
              <li><strong>VA Loans:</strong> 6.05% average</li>
            </ul>

            <h2>What's Driving Current Rates?</h2>
            <p>
              Several factors are influencing mortgage rates in late 2025:
            </p>

            <h3>1. Federal Reserve Policy</h3>
            <p>
              The Federal Reserve has maintained a cautious stance on interest rates, balancing inflation control with economic growth. While rates have plateaued, the Fed's decisions continue to have a ripple effect on mortgage lending.
            </p>

            <h3>2. Inflation Trends</h3>
            <p>
              Inflation has moderated from its 2022-2023 peaks, allowing for some rate stabilization. However, persistent inflation in housing and services keeps upward pressure on rates.
            </p>

            <h3>3. Economic Indicators</h3>
            <p>
              Employment remains strong, and GDP growth is steady, which supports higher interest rates compared to recessionary periods.
            </p>

            <h2>Impact on Homebuying Power</h2>
            <p>
              With median home prices at $436,800 and rates at 6.62%, let's look at what this means for monthly payments:
            </p>

            <div className="bg-muted p-6 rounded-lg my-6">
              <h4 className="font-bold mb-4">Example Scenario:</h4>
              <ul className="space-y-2">
                <li>Home Price: $436,800</li>
                <li>Down Payment (20%): $87,360</li>
                <li>Loan Amount: $349,440</li>
                <li>Interest Rate: 6.62%</li>
                <li><strong>Monthly Payment (P&I): $2,233</strong></li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                *Principal and interest only. Add property taxes, insurance, and HOA fees for total housing cost.
              </p>
            </div>

            <h2>Strategies to Secure the Best Rate</h2>

            <h3>1. Improve Your Credit Score</h3>
            <p>
              Credit scores have a significant impact on the rate you'll receive. Borrowers with scores above 760 can save thousands over the life of a loan compared to those in the 620-680 range.
            </p>

            <h3>2. Shop Multiple Lenders</h3>
            <p>
              Rates can vary by 0.25% to 0.50% between lenders. Getting quotes from at least 3-5 lenders could save you $50-$100 per month on a $350,000 loan.
            </p>

            <h3>3. Consider Points</h3>
            <p>
              Buying discount points (prepaid interest) can lower your rate. Each point typically costs 1% of the loan amount and reduces your rate by about 0.25%.
            </p>

            <h3>4. Choose the Right Loan Term</h3>
            <p>
              While 30-year loans are popular for their lower payments, 15-year loans offer rates 0.5-0.75% lower, potentially saving tens of thousands in interest.
            </p>

            <h3>5. Lock Your Rate Strategically</h3>
            <p>
              Rate locks typically last 30-60 days. Time your lock to match your closing date to avoid extensions or floating in a rising rate environment.
            </p>

            <h2>Alternative Financing Options</h2>

            <h3>Adjustable-Rate Mortgages (ARMs)</h3>
            <p>
              5/1 and 7/1 ARMs offer lower initial rates (around 5.95%) compared to fixed-rate mortgages. This can be beneficial if you plan to sell or refinance within 5-7 years.
            </p>

            <h3>Government-Backed Loans</h3>
            <p>
              FHA and VA loans offer competitive rates and lower down payment requirements. VA loans, in particular, average 6.05% with no down payment required for eligible veterans.
            </p>

            <h3>Assumable Mortgages</h3>
            <p>
              If buying from someone with an FHA or VA loan from 2020-2021, you may be able to assume their lower rate, a significant advantage in today's market.
            </p>

            <h2>Looking Ahead: 2026 Projections</h2>
            <p>
              Economic forecasters project mortgage rates to remain in the 6-7% range through 2026, with potential for modest decreases if inflation continues to moderate. However, rates are unlikely to return to the historic lows of 3-4% seen during the pandemic era.
            </p>

            <h2>Should You Buy Now or Wait?</h2>
            <p>
              The decision to buy depends on your personal circumstances rather than rate predictions:
            </p>

            <h3>Buy Now If:</h3>
            <ul>
              <li>You've found the right home in your budget</li>
              <li>You have stable employment and emergency savings</li>
              <li>You plan to stay in the home for 5+ years</li>
              <li>Your debt-to-income ratio is healthy (below 43%)</li>
            </ul>

            <h3>Wait If:</h3>
            <ul>
              <li>You're stretching financially to afford payments</li>
              <li>Your job situation is uncertain</li>
              <li>You haven't saved a sufficient down payment</li>
              <li>You're only buying to "time the market"</li>
            </ul>

            <h2>Tools and Resources</h2>
            <p>
              Use our <Link href="/calculators/mortgage" className="text-primary hover:underline">Mortgage Calculator</Link> to:
            </p>
            <ul>
              <li>Calculate exact monthly payments at current rates</li>
              <li>Compare different loan terms and amounts</li>
              <li>Estimate the impact of points and down payments</li>
              <li>Visualize your amortization schedule</li>
            </ul>

            <h2>Conclusion</h2>
            <p>
              While 6.62% mortgage rates are higher than recent history, they're still moderate by historical standards. The 1980s saw rates above 18%, and the long-term average hovers around 7-8%.
            </p>
            <p>
              Focus on what you can control: improving your credit, saving for a larger down payment, shopping multiple lenders, and ensuring the home fits your long-term financial plan. Remember, you can always refinance if rates drop significantly in the future.
            </p>
            <p>
              The best mortgage rate is the one that aligns with a home you love and a payment you can comfortably afford.
            </p>
          </div>

          <div className="mt-12 border-t pt-8">
            <h3 className="text-xl font-bold mb-4">Related Calculators</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/calculators/mortgage" className="p-4 border rounded-lg hover:bg-muted transition-colors">
                <h4 className="font-semibold mb-2">Mortgage Calculator</h4>
                <p className="text-sm text-muted-foreground">Calculate your monthly payment</p>
              </Link>
              <Link href="/calculators/house-affordability" className="p-4 border rounded-lg hover:bg-muted transition-colors">
                <h4 className="font-semibold mb-2">Home Affordability</h4>
                <p className="text-sm text-muted-foreground">How much house can you afford?</p>
              </Link>
              <Link href="/calculators/refinance" className="p-4 border rounded-lg hover:bg-muted transition-colors">
                <h4 className="font-semibold mb-2">Refinance Calculator</h4>
                <p className="text-sm text-muted-foreground">Should you refinance?</p>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
