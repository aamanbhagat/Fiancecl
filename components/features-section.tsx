import { Check, Clock, Lock, Zap } from "lucide-react"
import { memo } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Zap,
    title: "Fast & Accurate",
    description: "Get instant results with our high-precision calculators that use industry-standard formulas."
  },
  {
    icon: Lock,
    title: "100% Secure",
    description: "Your data never leaves your device. We prioritize your privacy with no data storage."
  },
  {
    icon: Check,
    title: "Easy to Use",
    description: "Simple, intuitive interfaces designed for everyone, from beginners to financial experts."
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Make complex financial calculations in seconds instead of hours of manual work."
  }
] as const

const FeatureCard = memo(function FeatureCard({ icon: Icon, title, description }: { icon: typeof Zap, title: string, description: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Icon className="h-10 w-10 text-primary" aria-hidden="true" />
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
})

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
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  )
}