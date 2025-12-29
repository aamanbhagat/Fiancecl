"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, User, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function BlogPage() {
  const featuredPosts = [
    {
      id: 1,
      title: "2025 Mortgage Rate Outlook: What Homebuyers Need to Know",
      excerpt: "With mortgage rates averaging 6.62% in December 2025, learn what this means for your home buying power and how to secure the best rates in today's market.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      date: "December 28, 2025",
      author: "Sarah Johnson",
      category: "Mortgage",
      readTime: "8 min read",
      slug: "2025-mortgage-rate-outlook"
    },
    {
      id: 2,
      title: "Maximize Your 401(k) in 2025: New $23,500 Contribution Limits",
      excerpt: "The IRS increased 401(k) contribution limits to $23,500 for 2025. Discover strategies to maximize your retirement savings with these new limits.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      date: "December 25, 2025",
      author: "Michael Rodriguez",
      category: "Retirement",
      readTime: "10 min read",
      slug: "maximize-401k-2025"
    },
    {
      id: 3,
      title: "Credit Card Debt at 21.5% APR: Smart Payoff Strategies for 2025",
      excerpt: "With average credit card rates at 21.5%, learn the most effective strategies to eliminate high-interest debt and save thousands in interest.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      date: "December 22, 2025",
      author: "David Chen",
      category: "Debt",
      readTime: "12 min read",
      slug: "credit-card-debt-strategies-2025"
    }
  ]

  const recentPosts = [
    {
      id: 4,
      title: "Home Prices Hit $436,800: Affordability Strategies for 2025 Buyers",
      excerpt: "With median home prices at $436,800, discover practical strategies to afford your dream home in today's competitive market.",
      image: "https://images.unsplash.com/photo-1589666564459-93cdd3ab856a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "December 20, 2025",
      author: "Sarah Johnson",
      category: "Housing",
      readTime: "7 min read",
      slug: "home-affordability-2025"
    },
    {
      id: 5,
      title: "Understanding Your Debt-to-Income Ratio in 2025's Lending Market",
      excerpt: "Lenders are scrutinizing DTI ratios more than ever. Learn how to calculate yours and improve your chances of loan approval.",
      image: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "December 18, 2025",
      author: "Michael Rodriguez",
      category: "Personal Finance",
      readTime: "6 min read",
      slug: "debt-to-income-ratio-2025"
    },
    {
      id: 6,
      title: "Rent vs. Buy Calculator: Which Makes Sense in Today's Market?",
      excerpt: "With rising home prices and high mortgage rates, use our calculator to determine whether renting or buying is right for you.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "December 15, 2025",
      author: "David Chen",
      category: "Housing",
      readTime: "9 min read",
      slug: "rent-vs-buy-2025"
    },
    {
      id: 7,
      title: "IRA Contribution Limits 2025: Maximize Your Retirement Savings",
      excerpt: "Roth IRA limits increased to $7,000 in 2025. Learn how to maximize tax-advantaged retirement savings with updated contribution strategies.",
      image: "https://images.unsplash.com/photo-1469571486292-b53601010b89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "December 12, 2025",
      author: "Sarah Johnson",
      category: "Retirement",
      readTime: "11 min read",
      slug: "ira-limits-2025"
    },
    {
      id: 8,
      title: "Auto Loan Rates in 2025: How to Get the Best Deal",
      excerpt: "Auto loan rates remain elevated in 2025. Learn negotiation tactics and financing strategies to secure the best possible rate.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "December 10, 2025",
      author: "Michael Rodriguez",
      category: "Auto Loans",
      readTime: "8 min read",
      slug: "auto-loan-rates-2025"
    },
    {
      id: 9,
      title: "The 50/30/20 Budget Rule: Still Effective in 2025?",
      excerpt: "With inflation and rising costs, discover how to adapt the classic 50/30/20 budgeting rule for today's economic reality.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "December 8, 2025",
      author: "David Chen",
      category: "Budgeting",
      readTime: "10 min read",
      slug: "50-30-20-budget-2025"
    },
    {
      id: 10,
      title: "Student Loan Forgiveness Updates: What Changed in 2025",
      excerpt: "Stay current on the latest student loan forgiveness programs and repayment options available in 2025.",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "December 5, 2025",
      author: "Sarah Johnson",
      category: "Student Loans",
      readTime: "9 min read",
      slug: "student-loan-forgiveness-2025"
    },
    {
      id: 11,
      title: "Investment Portfolio Rebalancing for Year-End 2025",
      excerpt: "As 2025 closes, learn why and how to rebalance your investment portfolio to maintain your target asset allocation.",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "December 2, 2025",
      author: "Michael Rodriguez",
      category: "Investment",
      readTime: "10 min read",
      slug: "portfolio-rebalancing-2025"
    },
    {
      id: 12,
      title: "Social Security COLA 2025: How Much Will Benefits Increase?",
      excerpt: "Social Security benefits received a cost-of-living adjustment in 2025. Learn how this impacts your retirement planning.",
      image: "https://images.unsplash.com/photo-1483389127117-b6a2102724ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "November 28, 2025",
      author: "David Chen",
      category: "Retirement",
      readTime: "7 min read",
      slug: "social-security-cola-2025"
    }
  ]

  const categories = [
    { name: "Mortgage", count: 12 },
    { name: "Investment", count: 18 },
    { name: "Debt", count: 9 },
    { name: "Retirement", count: 7 },
    { name: "Budgeting", count: 11 },
    { name: "Credit", count: 8 },
    { name: "Housing", count: 6 },
    { name: "Personal Finance", count: 15 },
    { name: "Loans", count: 10 }
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Financial Insights & <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Guides</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Explore our collection of articles, guides, and tips to help you make informed financial decisions.
              </p>
              <div className="mt-8 flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search articles..."
                    className="pl-10 pr-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-12">
          <div className="container">
            <h2 className="text-2xl font-bold tracking-tight mb-8">Featured Articles</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50">
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      priority={post.id <= 3}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading={post.id <= 3 ? 'eager' : 'lazy'}
                    />
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardDescription className="line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      {post.date}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="mr-1 h-3 w-3" />
                      {post.author}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Main Articles */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mb-8 bg-muted/80 rounded-lg border border-border/40">
                    <TabsTrigger value="all" className="text-sm">All Posts</TabsTrigger>
                    <TabsTrigger value="mortgage" className="text-sm">Mortgage</TabsTrigger>
                    <TabsTrigger value="investment" className="text-sm">Investment</TabsTrigger>
                    <TabsTrigger value="debt" className="text-sm">Debt</TabsTrigger>
                    <TabsTrigger value="retirement" className="text-sm">Retirement</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-0">
                    <div className="grid gap-8">
                      {recentPosts.map((post) => (
                        <Card key={post.id} className="overflow-hidden">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="relative h-48 md:h-full">
                              <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                loading="lazy"
                              />
                            </div>
                            <div className="md:col-span-2 p-6">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary">{post.category}</Badge>
                                <span className="text-xs text-muted-foreground">{post.readTime}</span>
                              </div>
                              <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                              <p className="text-muted-foreground mb-4 line-clamp-2">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  {post.date}
                                  <span className="mx-2">•</span>
                                  <User className="mr-1 h-3 w-3" />
                                  {post.author}
                                </div>
                                <Button variant="ghost" size="sm" className="text-primary">
                                  Read More <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <div className="mt-8 flex justify-center">
                      <Button variant="outline">Load More Articles</Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mortgage" className="mt-0">
                    <div className="p-8 text-center">
                      <h3 className="text-xl font-bold mb-2">Mortgage Articles</h3>
                      <p className="text-muted-foreground">
                        Showing filtered articles for the Mortgage category.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="investment" className="mt-0">
                    <div className="p-8 text-center">
                      <h3 className="text-xl font-bold mb-2">Investment Articles</h3>
                      <p className="text-muted-foreground">
                        Showing filtered articles for the Investment category.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="debt" className="mt-0">
                    <div className="p-8 text-center">
                      <h3 className="text-xl font-bold mb-2">Debt Articles</h3>
                      <p className="text-muted-foreground">
                        Showing filtered articles for the Debt category.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="retirement" className="mt-0">
                    <div className="p-8 text-center">
                      <h3 className="text-xl font-bold mb-2">Retirement Articles</h3>
                      <p className="text-muted-foreground">
                        Showing filtered articles for the Retirement category.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Sidebar */}
              <div>
                <div className="sticky top-24">
                  {/* Categories */}
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category.name} className="flex items-center justify-between">
                            <Link href={`/blog/category/${category.name.toLowerCase()}`} className="text-muted-foreground hover:text-foreground">
                              {category.name}
                            </Link>
                            <Badge variant="secondary">{category.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Newsletter */}
                  <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                      <CardTitle>Subscribe to Our Newsletter</CardTitle>
                      <CardDescription className="text-primary-foreground/80">
                        Get the latest financial tips and insights delivered to your inbox.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Input
                          type="email"
                          placeholder="Your email address"
                          className="bg-primary-foreground/10 border-primary-foreground/20 placeholder:text-primary-foreground/50"
                        />
                        <Button variant="secondary" className="w-full">
                          Subscribe
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}