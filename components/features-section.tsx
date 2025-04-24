import { Check, Clock, Lock, Zap } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturesSection() {
  return (
    <section className="container mx-auto py-20">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Our Calculators?</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Our financial calculators are designed to help you make better financial decisions with ease and confidence.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <Zap className="h-10 w-10 text-primary" aria-hidden="true" />
            <CardTitle className="mt-4">Fast & Accurate</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get instant results with our high-precision calculators that use industry-standard formulas.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Lock className="h-10 w-10 text-primary" aria-hidden="true" />
            <CardTitle className="mt-4">100% Secure</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Your data never leaves your device. We prioritize your privacy with no data storage.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Check className="h-10 w-10 text-primary" aria-hidden="true" />
            <CardTitle className="mt-4">Easy to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Simple, intuitive interfaces designed for everyone, from beginners to financial experts.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Clock className="h-10 w-10 text-primary" aria-hidden="true" />
            <CardTitle className="mt-4">Save Time</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Make complex financial calculations in seconds instead of hours of manual work.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}