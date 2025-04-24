import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container mx-auto py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to make smarter financial decisions?
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Our calculators are free, accurate, and designed to help you achieve your financial goals.
          </p>
          <div className="mt-8">
            <Button variant="secondary" size="lg" asChild>
              <Link href="#calculators">
                Get Started Now <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}