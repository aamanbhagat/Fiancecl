import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Calculator, Info, ArrowRight, ShieldCheck, DollarSign } from "lucide-react"
import Link from "next/link"
import { AuthorBio } from "@/components/author-bio"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "FHA vs Conventional Loan: Complete Comparison Guide 2026",
    description: "Compare FHA vs Conventional loans side-by-side. Calculate costs, check eligibility requirements, and decide which mortgage is right for your home purchase.",
    openGraph: {
        title: "FHA vs Conventional Loan: Which is Better?",
        description: "Compare down payments, credit scores, and mortgage insurance costs.",
        type: "article"
    }
}

export default function FhaVsConventionalPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
                {/* Article Header */}
                <section className="relative py-16 bg-muted/30">
                    <div className="container">
                        <Breadcrumbs
                            items={[
                                { name: "Resources", href: "/calculators" }, // Linking to main hub for now
                                { name: "FHA vs Conventional", href: "/guides/fha-vs-conventional-loan" },
                            ]}
                        />
                        <div className="mt-8 max-w-4xl mx-auto text-center">
                            <Badge className="mb-4">Mortgage Comparison</Badge>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
                                FHA vs. Conventional Loan: Which is Right for You?
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                Detailed side-by-side comparison of requirements, costs, and benefits to help you choose the best mortgage path.
                            </p>

                            <div className="flex flex-wrap justify-center gap-4">
                                <Button size="lg" asChild>
                                    <Link href="/calculators/mortgage">
                                        <Calculator className="mr-2 h-4 w-4" />
                                        Calculate Mortgage
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/calculators/fha-loan">
                                        <Calculator className="mr-2 h-4 w-4" />
                                        FHA Calculator
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Comparison Table Section */}
                <section className="py-16">
                    <div className="container max-w-5xl">
                        <h2 className="text-2xl font-bold mb-8 text-center">At a Glance Comparison</h2>

                        <div className="overflow-x-auto rounded-lg border shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-base">Feature</th>
                                        <th className="px-6 py-4 font-bold text-base text-blue-600">FHA Loan</th>
                                        <th className="px-6 py-4 font-bold text-base text-green-600">Conventional Loan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <tr className="bg-background">
                                        <td className="px-6 py-4 font-medium">Minimum Credit Score</td>
                                        <td className="px-6 py-4">500-580+</td>
                                        <td className="px-6 py-4">620+</td>
                                    </tr>
                                    <tr className="bg-muted/10">
                                        <td className="px-6 py-4 font-medium">Minimum Down Payment</td>
                                        <td className="px-6 py-4">3.5% (with 580 score)</td>
                                        <td className="px-6 py-4">3% (First-time buyers)</td>
                                    </tr>
                                    <tr className="bg-background">
                                        <td className="px-6 py-4 font-medium">Mortgage Insurance (PMI/MIP)</td>
                                        <td className="px-6 py-4">Required for life of loan (usually)</td>
                                        <td className="px-6 py-4">Removable after 20% equity</td>
                                    </tr>
                                    <tr className="bg-muted/10">
                                        <td className="px-6 py-4 font-medium">Debt-to-Income (DTI) Ratio</td>
                                        <td className="px-6 py-4">Up to 57% allowed</td>
                                        <td className="px-6 py-4">Usually max 43-50%</td>
                                    </tr>
                                    <tr className="bg-background">
                                        <td className="px-6 py-4 font-medium">Loan Limits (2025)</td>
                                        <td className="px-6 py-4">Lower ($498k - $1.15M)</td>
                                        <td className="px-6 py-4">Higher ($766k - $1.15M)</td>
                                    </tr>
                                    <tr className="bg-muted/10">
                                        <td className="px-6 py-4 font-medium">Property Use</td>
                                        <td className="px-6 py-4">Primary Residence Only</td>
                                        <td className="px-6 py-4">Primary, Second Home, Investment</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Deep Dive Section */}
                <section className="py-16 bg-muted/30">
                    <div className="container max-w-4xl">
                        <div className="grid gap-12">
                            {/* FHA Breakdown */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold">FHA Loan Deep Dive</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    Federal Housing Administration (FHA) loans are government-backed mortgages designed to help low-to-moderate income borrowers buy homes. They are famous for their lenient credit score requirements.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" /> Pros
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <p>• Easier to qualify with low credit</p>
                                            <p>• Low down payment (3.5%)</p>
                                            <p>• Higher DTI ratios accepted</p>
                                            <p>• Assumable mortgages</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-500" /> Cons
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <p>• Mortgage insurance (MIP) is permanent</p>
                                            <p>• Upfront MIP fee (1.75%)</p>
                                            <p>• Strict property appraisals</p>
                                            <p>• Primary residence only</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Conventional Breakdown */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Conventional Loan Deep Dive</h2>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    Conventional loans are not insured by the government. They are offered by private lenders and usually sold to Fannie Mae or Freddie Mac. They reward borrowers with good credit.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" /> Pros
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <p>• No mortgage insurance with 20% down</p>
                                            <p>• PMI is cancellable</p>
                                            <p>• Flexible terms (10, 15, 20, 30 years)</p>
                                            <p>• Investment properties allowed</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-500" /> Cons
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <p>• Harder to qualify (620+ credit)</p>
                                            <p>• Higher rates for low credit scores</p>
                                            <p>• Stricter DTI limits</p>
                                            <p>• Higher down payment for some</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Decision Helper */}
                <section className="py-16">
                    <div className="container max-w-3xl text-center">
                        <h2 className="text-2xl font-bold mb-6">Which Should You Choose?</h2>
                        <div className="space-y-4 text-left">
                            <Card className="border-l-4 border-l-blue-600">
                                <CardContent className="pt-6">
                                    <h3 className="font-bold text-lg mb-2 text-blue-600">Choose FHA if:</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                        <li>Your credit score is below 620.</li>
                                        <li>You have a high debt-to-income ratio (above 43%).</li>
                                        <li>You have a small down payment and low credit.</li>
                                        <li>You plan to move or refinance before the permanent mortgage insurance becomes too costly.</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-green-600">
                                <CardContent className="pt-6">
                                    <h3 className="font-bold text-lg mb-2 text-green-600">Choose Conventional if:</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                        <li>Your credit score is 700 or higher (you'll get better rates).</li>
                                        <li>You can put down 20% to avoid insurance entirely.</li>
                                        <li>You plan to stay in the home long-term and cancel PMI later.</li>
                                        <li>You are buying a second home or investment property.</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-12">
                            <h3 className="text-xl font-semibold mb-4">Run the Numbers</h3>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild size="lg" className="w-full sm:w-auto">
                                    <Link href="/calculators/mortgage">
                                        Calculate Conventional Payments
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                                    <Link href="/calculators/fha-loan">
                                        Calculate FHA Payments
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 bg-muted/30">
                    <div className="container max-w-4xl">
                        <AuthorBio
                            author={{
                                name: "Financial Editorial Team",
                                role: "Mortgage Specialists",
                                image: "/authors/team.jpg",
                                bio: "Our editorial team consists of mortgage professionals and financial analysts dedicated to helping you navigate the home buying process."
                            }}
                        />
                    </div>
                </section>
            </main>
            <SiteFooter />
        </div>
    )
}
