import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { RelatedCalculator } from '@/lib/related-calculators'

interface RelatedCalculatorsProps {
  calculators: RelatedCalculator[]
}

export function RelatedCalculators({ calculators }: RelatedCalculatorsProps) {
  if (!calculators || calculators.length === 0) return null

  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold mb-6">Related Calculators</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {calculators.map((calc) => (
          <Link key={calc.slug} href={`/calculators/${calc.slug}`}>
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{calc.icon}</span>
                  <CardTitle className="text-lg">{calc.name}</CardTitle>
                </div>
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
    </section>
  )
}
