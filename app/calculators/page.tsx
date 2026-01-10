import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Calculator,
    ArrowRight,
    Home,
    TrendingUp,
    PiggyBank,
    CreditCard,
    DollarSign,
    Car,
    Activity,
    GraduationCap,
    Briefcase
} from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
import type { Metadata } from "next"
import { getAllCalculators, calculatorCategories } from "@/lib/calculator-data"

export const metadata: Metadata = {
    title: "All Financial Calculators | CalculatorHub",
    description: "Browse our collection of 65+ free financial calculators for mortgages, loans, investments, retirement, retirement, and more.",
    openGraph: {
        title: "All Financial Calculators | CalculatorHub",
        description: "Browse our collection of 65+ free financial calculators.",
    }
}

// Icon mapping helper
function getCategoryIcon(slug: string) {
    switch (slug) {
        case 'home': return <Home className="h-6 w-6" />;
        case 'investment': return <TrendingUp className="h-6 w-6" />;
        case 'retirement': return <PiggyBank className="h-6 w-6" />;
        case 'debt': return <CreditCard className="h-6 w-6" />;
        case 'tax': return <DollarSign className="h-6 w-6" />;
        case 'auto': return <Car className="h-6 w-6" />;
        case 'business': return <Briefcase className="h-6 w-6" />;
        case 'education': return <GraduationCap className="h-6 w-6" />;
        case 'personal': return <Activity className="h-6 w-6" />;
        default: return <Calculator className="h-6 w-6" />;
    }
}

const categories = calculatorCategories.map(cat => ({
    ...cat,
    icon: getCategoryIcon(cat.slug)
}))

export default function CalculatorsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-16 md:py-24">
                    <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
                    <div className="container relative z-10">
                        <Breadcrumbs
                            items={[
                                { name: "Calculators", href: "/calculators" },
                            ]}
                        />

                        <div className="mx-auto max-w-3xl text-center mt-8">
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                Financial <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Calculators</span>
                            </h1>
                            <p className="mt-6 text-lg text-muted-foreground">
                                Our comprehensive collection of 65+ free financial calculators to help you make smarter money decisions.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                <section className="py-12">
                    <div className="container">
                        <div className="grid gap-12">
                            {categories.map((category) => (
                                <div key={category.name} id={category.slug} className="scroll-mt-24">
                                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            {category.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">{category.name}</h2>
                                            <p className="text-muted-foreground">{category.description}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {category.calculators.map((calc) => (
                                            <Link key={calc.slug} href={`/calculators/${calc.slug}`}>
                                                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 hover:scale-[1.02]">
                                                    <CardHeader className="p-4">
                                                        <CardTitle className="text-lg flex items-center gap-2">
                                                            {calc.name}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-0">
                                                        <CardDescription className="flex items-center justify-between">
                                                            <span>{calc.description}</span>
                                                            <ArrowRight className="h-4 w-4 flex-shrink-0 ml-2 text-muted-foreground" />
                                                        </CardDescription>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 bg-muted/30">
                    <div className="container">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
                            <p className="text-muted-foreground mb-8">
                                Try our search to find specific calculators by keyword
                            </p>
                            <Link
                                href="/search"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                            >
                                Search Calculators
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </div>
    )
}
