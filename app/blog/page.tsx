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
      title: "How to Calculate Your Mortgage Payment: A Step-by-Step Guide",
      excerpt: "Understanding your mortgage payment is crucial when buying a home. Learn how to calculate it accurately with our comprehensive guide.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      date: "June 15, 2025",
      author: "Sarah Johnson",
      category: "Mortgage",
      readTime: "8 min read"
    },
    {
      id: 2,
      title: "5 Investment Strategies to Grow Your Wealth in 2025",
      excerpt: "Discover the most effective investment strategies that can help you build and grow your wealth in the current economic climate.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      date: "May 28, 2025",
      author: "Michael Rodriguez",
      category: "Investment",
      readTime: "10 min read"
    },
    {
      id: 3,
      title: "The Ultimate Guide to Paying Off Credit Card Debt",
      excerpt: "Learn effective strategies to tackle credit card debt and regain financial freedom with our comprehensive guide.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      date: "May 10, 2025",
      author: "David Chen",
      category: "Debt",
      readTime: "12 min read"
    }
  ]

  const recentPosts = [
    {
      id: 4,
      title: "Understanding Amortization: How Your Loan Balance Changes Over Time",
      excerpt: "Dive deep into the concept of amortization and understand how your loan payments affect your balance throughout the life of the loan.",
      image: "https://images.unsplash.com/photo-1589666564459-93cdd3ab856a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "April 22, 2025",
      author: "Sarah Johnson",
      category: "Loans",
      readTime: "7 min read"
    },
    {
      id: 5,
      title: "How to Calculate Your Debt-to-Income Ratio and Why It Matters",
      excerpt: "Learn how to calculate your debt-to-income ratio and understand why this metric is crucial for your financial health and loan applications.",
      image: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "April 15, 2025",
      author: "Michael Rodriguez",
      category: "Personal Finance",
      readTime: "6 min read"
    },
    {
      id: 6,
      title: "Rent vs. Buy: Making the Right Housing Decision",
      excerpt: "Explore the financial implications of renting versus buying a home and learn how to make the decision that's right for your situation.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "April 8, 2025",
      author: "David Chen",
      category: "Housing",
      readTime: "9 min read"
    },
    {
      id: 7,
      title: "Retirement Planning: How Much Do You Really Need to Save?",
      excerpt: "Calculate how much you need to save for retirement and develop a strategy to reach your financial goals for your golden years.",
      image: "https://images.unsplash.com/photo-1469571486292-b53601010b89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "March 30, 2025",
      author: "Sarah Johnson",
      category: "Retirement",
      readTime: "11 min read"
    },
    {
      id: 8,
      title: "Understanding APR vs. Interest Rate: What's the Difference?",
      excerpt: "Learn the crucial differences between APR and interest rate and how they affect the total cost of your loans and credit cards.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "March 22, 2025",
      author: "Michael Rodriguez",
      category: "Credit",
      readTime: "8 min read"
    },
    {
      id: 9,
      title: "How to Create a Personal Budget That Actually Works",
      excerpt: "Discover practical tips for creating a personal budget that you can stick to and that helps you achieve your financial goals.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      date: "March 15, 2025",
      author: "David Chen",
      category: "Budgeting",
      readTime: "10 min read"
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