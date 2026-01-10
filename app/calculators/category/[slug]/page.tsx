import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { getCategoryBySlug, calculatorCategories, Calculator as CalculatorType } from "@/lib/calculator-data"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
    Calculator,
    Home,
    TrendingUp,
    PiggyBank,
    CreditCard,
    DollarSign,
    Car,
    Activity,
    Briefcase,
    GraduationCap,
    ArrowRight,
    Star
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

// Icon mapping helper
function getCategoryIcon(slug: string) {
    switch (slug) {
        case 'home': return <Home className="h-8 w-8 text-primary" />;
        case 'investment': return <TrendingUp className="h-8 w-8 text-primary" />;
        case 'retirement': return <PiggyBank className="h-8 w-8 text-primary" />;
        case 'debt': return <CreditCard className="h-8 w-8 text-primary" />;
        case 'tax': return <DollarSign className="h-8 w-8 text-primary" />;
        case 'auto': return <Car className="h-8 w-8 text-primary" />;
        case 'business': return <Briefcase className="h-8 w-8 text-primary" />;
        case 'education': return <GraduationCap className="h-8 w-8 text-primary" />;
        case 'personal': return <Activity className="h-8 w-8 text-primary" />;
        default: return <Calculator className="h-8 w-8 text-primary" />;
    }
}

// Generate static params for all categories
export async function generateStaticParams() {
    return calculatorCategories.map((category) => ({
        slug: category.slug,
    }))
}

// Generate metadata dynamically
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params
    const category = getCategoryBySlug(params.slug)

    if (!category) {
        return {
            title: 'Category Not Found',
        }
    }

    return {
        title: `${category.name} Calculators | CalculatorHub`,
        description: category.description,
        openGraph: {
            title: `${category.name} Calculators | CalculatorHub`,
            description: category.description,
        }
    }
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params
    const category = getCategoryBySlug(params.slug)

    if (!category) {
        notFound()
    }

    const icon = getCategoryIcon(category.slug)

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-16 bg-muted/30">
                    <div className="absolute inset-0 bg-grid-black/5 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
                    <div className="container relative z-10">
                        <Breadcrumbs
                            items={[
                                { name: "Calculators", href: "/calculators" },
                                { name: category.name, href: `/calculators/category/${category.slug}` },
                            ]}
                        />

                        <div className="mt-8 flex flex-col items-center text-center">
                            <div className="p-4 bg-background rounded-full shadow-sm mb-6">
                                {icon}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                                {category.name} <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Calculators</span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl">
                                {category.description}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Calculators Grid */}
                <section className="py-16">
                    <div className="container">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {category.calculators.map((calc) => (
                                <Link key={calc.slug} href={`/calculators/${calc.slug}`}>
                                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 hover:scale-[1.02]">
                                        <CardHeader>
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="secondary" className="text-xs">
                                                    {category.name}
                                                </Badge>
                                                {calc.popular && (
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                )}
                                            </div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {calc.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
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
                </section>

                {/* Internal Linking / Navigation */}
                <section className="py-16 bg-muted/30">
                    <div className="container">
                        <h2 className="text-2xl font-bold mb-8 text-center">Browse Other Categories</h2>
                        <div className="flex flex-wrap justify-center gap-4">
                            {calculatorCategories
                                .filter(c => c.slug !== category.slug)
                                .map(c => (
                                    <Link
                                        key={c.slug}
                                        href={`/calculators/category/${c.slug}`}
                                    >
                                        <Badge variant="outline" className="text-sm py-2 px-4 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                                            {c.name}
                                        </Badge>
                                    </Link>
                                ))}
                        </div>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </div>
    )
}
