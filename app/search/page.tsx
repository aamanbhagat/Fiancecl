"use client"

import { useState, useMemo } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Calculator, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"

// All calculators data for search
const allCalculators = [
    { name: "Mortgage Calculator", slug: "mortgage", category: "Home", description: "Calculate monthly mortgage payments", popular: true },
    { name: "Compound Interest Calculator", slug: "compound-interest", category: "Investment", description: "See how compound interest grows your money", popular: true },
    { name: "Investment Calculator", slug: "investment", category: "Investment", description: "Project investment returns over time", popular: true },
    { name: "401(k) Calculator", slug: "401k", category: "Retirement", description: "Plan your 401(k) retirement savings", popular: true },
    { name: "House Affordability Calculator", slug: "house-affordability", category: "Home", description: "See how much house you can afford", popular: true },
    { name: "Auto Loan Calculator", slug: "auto-loan", category: "Auto", description: "Calculate car loan payments", popular: true },
    { name: "Amortization Calculator", slug: "amortization", category: "Home", description: "View loan amortization schedule" },
    { name: "Refinance Calculator", slug: "refinance", category: "Home", description: "Should you refinance your mortgage?" },
    { name: "Down Payment Calculator", slug: "down-payment", category: "Home", description: "Calculate down payment needed" },
    { name: "Mortgage Payoff Calculator", slug: "mortgage-payoff", category: "Home", description: "Calculate early payoff savings" },
    { name: "Rent vs Buy Calculator", slug: "rent-vs-buy", category: "Home", description: "Compare renting vs buying" },
    { name: "Savings Calculator", slug: "savings", category: "Savings", description: "Plan your savings goals" },
    { name: "CD Calculator", slug: "cd", category: "Savings", description: "Calculate CD returns" },
    { name: "Roth IRA Calculator", slug: "roth-ira", category: "Retirement", description: "Compare Roth IRA benefits" },
    { name: "Retirement Calculator", slug: "pension", category: "Retirement", description: "Plan retirement income" },
    { name: "Social Security Calculator", slug: "social-security", category: "Retirement", description: "Estimate SS benefits" },
    { name: "RMD Calculator", slug: "rmd", category: "Retirement", description: "Required minimum distributions" },
    { name: "Credit Card Calculator", slug: "credit-card", category: "Debt", description: "Credit card payoff calculator" },
    { name: "Debt Payoff Calculator", slug: "debt-payoff", category: "Debt", description: "Plan debt elimination" },
    { name: "Debt Consolidation Calculator", slug: "debt-consolidation", category: "Debt", description: "Consolidate your debts" },
    { name: "Student Loan Calculator", slug: "student-loan", category: "Debt", description: "Student loan repayment" },
    { name: "Personal Loan Calculator", slug: "personal-loan", category: "Loan", description: "Personal loan calculator" },
    { name: "Loan Calculator", slug: "loan", category: "Loan", description: "General loan calculator" },
    { name: "APR Calculator", slug: "apr", category: "Loan", description: "Calculate true APR" },
    { name: "Interest Rate Calculator", slug: "interest-rate", category: "Loan", description: "Calculate interest rates" },
    { name: "ROI Calculator", slug: "roi", category: "Investment", description: "Return on investment" },
    { name: "Bond Calculator", slug: "bond", category: "Investment", description: "Bond yield calculator" },
    { name: "Income Tax Calculator", slug: "income-tax", category: "Tax", description: "Calculate income taxes" },
    { name: "Salary Calculator", slug: "salary", category: "Tax", description: "Salary breakdown calculator" },
    { name: "Take-Home Pay Calculator", slug: "take-home-paycheck", category: "Tax", description: "Calculate net income" },
    { name: "Sales Tax Calculator", slug: "sales-tax", category: "Tax", description: "Calculate sales tax" },
    { name: "Budget Calculator", slug: "budget", category: "Personal Finance", description: "Budget planning tool" },
    { name: "Tip Calculator", slug: "tip", category: "Personal Finance", description: "Calculate tips" },
    { name: "Percentage Calculator", slug: "percentage", category: "Math", description: "Calculate percentages" },
    { name: "BMI Calculator", slug: "bmi", category: "Health", description: "Body mass index calculator" },
    { name: "Calorie Calculator", slug: "calorie", category: "Health", description: "Calculate calorie needs" },
    { name: "Age Calculator", slug: "age", category: "Math", description: "Calculate age from birthdate" },
    { name: "Date Calculator", slug: "date", category: "Math", description: "Calculate date differences" },
    { name: "GPA Calculator", slug: "gpa", category: "Education", description: "Calculate grade point average" },
    { name: "Grade Calculator", slug: "grade", category: "Education", description: "Calculate grades" },
]

const categories = ["All", "Home", "Investment", "Retirement", "Debt", "Loan", "Tax", "Savings", "Personal Finance", "Auto", "Health", "Math", "Education"]

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")

    const filteredCalculators = useMemo(() => {
        return allCalculators.filter((calc) => {
            const matchesSearch =
                calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                calc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                calc.category.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesCategory = selectedCategory === "All" || calc.category === selectedCategory

            return matchesSearch && matchesCategory
        })
    }, [searchQuery, selectedCategory])

    const popularCalculators = allCalculators.filter((calc) => calc.popular)

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-12 md:py-16">
                    <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
                    <div className="container relative z-10">
                        <Breadcrumbs
                            items={[
                                { name: "Search", href: "/search" },
                            ]}
                        />

                        <div className="mx-auto max-w-3xl text-center mt-8">
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                Search <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Calculators</span>
                            </h1>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Find the perfect calculator from our collection of 65+ free financial tools
                            </p>

                            {/* Search Input */}
                            <div className="mt-8 relative">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search calculators... (e.g., mortgage, 401k, compound interest)"
                                    className="pl-12 pr-4 h-14 text-lg"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {/* Category Filters */}
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {categories.map((category) => (
                                    <Badge
                                        key={category}
                                        variant={selectedCategory === category ? "default" : "secondary"}
                                        className="cursor-pointer px-3 py-1 text-sm transition-all hover:scale-105"
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Results Section */}
                <section className="py-12 bg-muted/30">
                    <div className="container">
                        {/* Results Count */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-muted-foreground">
                                {filteredCalculators.length} calculator{filteredCalculators.length !== 1 ? 's' : ''} found
                                {searchQuery && ` for "${searchQuery}"`}
                                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                            </p>
                        </div>

                        {/* Results Grid */}
                        {filteredCalculators.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredCalculators.map((calc) => (
                                    <Link key={calc.slug} href={`/calculators/${calc.slug}`}>
                                        <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 hover:scale-[1.02] cursor-pointer">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="text-xs">
                                                        {calc.category}
                                                    </Badge>
                                                    {calc.popular && (
                                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    )}
                                                </div>
                                                <CardTitle className="text-lg flex items-center gap-2 mt-2">
                                                    <Calculator className="h-5 w-5 text-primary" />
                                                    {calc.name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription className="flex items-center justify-between">
                                                    <span>{calc.description}</span>
                                                    <ArrowRight className="h-4 w-4 flex-shrink-0 ml-2" />
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No calculators found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Try adjusting your search or browse by category
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("")
                                        setSelectedCategory("All")
                                    }}
                                    className="text-primary hover:underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Popular Calculators (when no search) */}
                {!searchQuery && selectedCategory === "All" && (
                    <section className="py-12">
                        <div className="container">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                                Most Popular Calculators
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {popularCalculators.map((calc) => (
                                    <Link key={calc.slug} href={`/calculators/${calc.slug}`}>
                                        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Calculator className="h-5 w-5 text-primary" />
                                                    {calc.name}
                                                </CardTitle>
                                                <CardDescription>{calc.description}</CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <SiteFooter />
        </div>
    )
}
