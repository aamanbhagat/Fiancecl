import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Calculator,
    Shield,
    CheckCircle,
    RefreshCw,
    Lock,
    BookOpen,
    Users,
    Award,
    ExternalLink
} from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "About Our Calculators | CalculatorHub - Accuracy & Methodology",
    description: "Learn about our calculator methodology, data sources, accuracy standards, and privacy practices. All formulas are verified against industry standards.",
    openGraph: {
        title: "About Our Calculators | CalculatorHub",
        description: "Learn about our calculator methodology and accuracy standards.",
    }
}

const trustFeatures = [
    {
        icon: <CheckCircle className="h-6 w-6 text-green-600" />,
        title: "Verified Formulas",
        description: "Every calculator uses industry-standard formulas verified by financial professionals. We cross-reference our calculations with authoritative sources."
    },
    {
        icon: <RefreshCw className="h-6 w-6 text-blue-600" />,
        title: "Regular Updates",
        description: "Tax brackets, contribution limits, and interest rate data are updated annually. We monitor regulatory changes to keep calculators current."
    },
    {
        icon: <Lock className="h-6 w-6 text-purple-600" />,
        title: "100% Private",
        description: "All calculations happen in your browser. We never store your financial data on our servers. Your privacy is our priority."
    },
    {
        icon: <BookOpen className="h-6 w-6 text-orange-600" />,
        title: "Transparent Methodology",
        description: "Each calculator includes explanations of the formulas used. We show our work so you can understand and verify results."
    }
]

const dataSources = [
    {
        name: "Federal Reserve Economic Data (FRED)",
        url: "https://fred.stlouisfed.org/",
        usage: "Interest rates, economic indicators, mortgage rate data"
    },
    {
        name: "Internal Revenue Service (IRS)",
        url: "https://www.irs.gov/",
        usage: "Tax brackets, deduction limits, retirement contribution limits"
    },
    {
        name: "Consumer Financial Protection Bureau (CFPB)",
        url: "https://www.consumerfinance.gov/",
        usage: "Mortgage regulations, consumer protection guidelines"
    },
    {
        name: "Social Security Administration",
        url: "https://www.ssa.gov/",
        usage: "Social Security benefits, retirement age calculations"
    },
    {
        name: "Department of Labor",
        url: "https://www.dol.gov/",
        usage: "401(k) regulations, ERISA guidelines"
    },
    {
        name: "Securities and Exchange Commission (SEC)",
        url: "https://www.sec.gov/",
        usage: "Investment regulations, disclosure requirements"
    }
]

const calculatorCategories = [
    { name: "Home & Mortgage", count: 12, examples: "Mortgage, Refinance, Affordability" },
    { name: "Investment & Savings", count: 15, examples: "Compound Interest, ROI, Savings" },
    { name: "Retirement Planning", count: 8, examples: "401(k), Roth IRA, Social Security" },
    { name: "Debt Management", count: 10, examples: "Credit Card, Debt Payoff, Consolidation" },
    { name: "Loans & Interest", count: 12, examples: "Auto Loan, Personal Loan, APR" },
    { name: "Tax Planning", count: 8, examples: "Income Tax, Salary, Take-Home Pay" }
]

export default function AboutCalculatorsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />

            {/* Structured Data for Organization */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "AboutPage",
                        "name": "About Our Calculators",
                        "description": "Learn about CalculatorHub's calculator methodology, data sources, and accuracy standards.",
                        "mainEntity": {
                            "@type": "Organization",
                            "name": "CalculatorHub",
                            "url": "https://calculatorhub.space",
                            "logo": "https://calculatorhub.space/og-image.png"
                        }
                    })
                }}
            />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-16 md:py-24">
                    <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
                    <div className="container relative z-10">
                        <Breadcrumbs
                            items={[
                                { name: "About Our Calculators", href: "/about-calculators" },
                            ]}
                        />

                        <div className="mx-auto max-w-3xl text-center mt-8">
                            <Badge variant="secondary" className="mb-4">
                                <Shield className="h-3 w-3 mr-1" />
                                Trusted by Millions
                            </Badge>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                About Our <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Calculators</span>
                            </h1>
                            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                                We're committed to providing accurate, transparent, and privacy-respecting financial calculators.
                                Learn about our methodology, data sources, and quality standards.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Trust Features */}
                <section className="py-16 bg-muted/30">
                    <div className="container">
                        <h2 className="text-2xl font-bold text-center mb-12">Our Commitment to Quality</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {trustFeatures.map((feature, index) => (
                                <Card key={index} className="text-center">
                                    <CardHeader>
                                        <div className="mx-auto mb-2">{feature.icon}</div>
                                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Calculator Statistics */}
                <section className="py-16">
                    <div className="container">
                        <div className="mx-auto max-w-4xl">
                            <h2 className="text-2xl font-bold text-center mb-4">65+ Free Calculators</h2>
                            <p className="text-center text-muted-foreground mb-12">
                                Covering all aspects of personal finance
                            </p>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {calculatorCategories.map((category, index) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{category.name}</CardTitle>
                                                <Badge>{category.count}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">{category.examples}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="text-center mt-8">
                                <Link
                                    href="/calculators"
                                    className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                                >
                                    <Calculator className="h-4 w-4" />
                                    View All Calculators
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data Sources */}
                <section className="py-16 bg-muted/30">
                    <div className="container">
                        <div className="mx-auto max-w-4xl">
                            <h2 className="text-2xl font-bold text-center mb-4">Our Data Sources</h2>
                            <p className="text-center text-muted-foreground mb-12">
                                We rely on authoritative government and financial institutions for accurate data
                            </p>

                            <div className="grid gap-4 md:grid-cols-2">
                                {dataSources.map((source, index) => (
                                    <Card key={index}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <a
                                                        href={source.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium hover:text-primary flex items-center gap-1"
                                                    >
                                                        {source.name}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                    <p className="text-sm text-muted-foreground mt-1">{source.usage}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Methodology */}
                <section className="py-16">
                    <div className="container">
                        <div className="mx-auto max-w-3xl">
                            <h2 className="text-2xl font-bold text-center mb-12">Our Methodology</h2>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Formula Verification</h3>
                                        <p className="text-muted-foreground mt-2">
                                            We research and implement formulas from authoritative financial textbooks and regulatory sources.
                                            Each formula is tested against multiple verification sources before deployment.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Edge Case Testing</h3>
                                        <p className="text-muted-foreground mt-2">
                                            We test calculators with extreme values and unusual scenarios to ensure they handle
                                            all inputs correctly. This includes zero values, negative numbers, and maximum limits.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Cross-Validation</h3>
                                        <p className="text-muted-foreground mt-2">
                                            Results are compared against established financial tools and manual calculations.
                                            We validate that our results match industry standards within acceptable rounding margins.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Continuous Updates</h3>
                                        <p className="text-muted-foreground mt-2">
                                            We monitor regulatory changes, tax law updates, and contribution limit adjustments.
                                            Calculators are updated promptly when official figures change.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Disclaimer */}
                <section className="py-16 bg-muted/30">
                    <div className="container">
                        <div className="mx-auto max-w-3xl">
                            <Card className="border-amber-500/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-amber-500" />
                                        Important Disclaimer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-4">
                                    <p>
                                        The calculators on CalculatorHub are provided for informational and educational purposes only.
                                        Results are estimates based on the information you provide and should not be considered as
                                        financial, legal, or tax advice.
                                    </p>
                                    <p>
                                        <strong>Before making any financial decisions</strong>, we recommend consulting with qualified
                                        financial advisors, tax professionals, or legal experts who can consider your specific circumstances.
                                    </p>
                                    <p>
                                        While we strive for accuracy, we cannot guarantee that all calculations are error-free or
                                        appropriate for your individual situation. Tax laws and regulations vary by jurisdiction and
                                        change frequently.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16">
                    <div className="container">
                        <div className="mx-auto max-w-2xl text-center">
                            <Award className="h-12 w-12 mx-auto text-primary mb-4" />
                            <h2 className="text-2xl font-bold mb-4">Ready to Start Calculating?</h2>
                            <p className="text-muted-foreground mb-8">
                                Explore our collection of 65+ free financial calculators
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/calculators"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                >
                                    <Calculator className="h-5 w-5" />
                                    Browse Calculators
                                </Link>
                                <Link
                                    href="/search"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border rounded-lg hover:bg-muted transition-colors font-medium"
                                >
                                    Search Calculators
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </div>
    )
}
