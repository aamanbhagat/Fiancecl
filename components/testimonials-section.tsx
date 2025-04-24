import Image from "next/image"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function TestimonialsSection() {
  return (
    <section className="bg-muted/50 py-20">
      <div className="container mx-auto">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trusted by Thousands</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our users are saying about how our calculators have helped them make better financial decisions.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-0 bg-background shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array(5)
                    .fill(null)
                    .map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 fill-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "The mortgage calculator helped me understand exactly what I could afford. I was able to make a confident decision when buying my first home."
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-4">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
                    alt="Sarah J."
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">Sarah J.</p>
                  <p className="text-sm text-muted-foreground">First-time Homebuyer</p>
                </div>
              </div>
            </CardFooter>
          </Card>
          <Card className="border-0 bg-background shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array(5)
                    .fill(null)
                    .map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 fill-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "I've been using the amortization calculator to plan my loan repayments. It's incredibly detailed and has helped me save thousands in interest."
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-4">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
                    alt="Michael T."
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">Michael T.</p>
                  <p className="text-sm text-muted-foreground">Financial Planner</p>
                </div>
              </div>
            </CardFooter>
          </Card>
          <Card className="border-0 bg-background shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array(5)
                    .fill(null)
                    .map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 fill-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "The refinance calculator showed me that I could save $350 per month by refinancing my mortgage. The interface is intuitive and the results are clear."
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-4">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
                    alt="Jennifer R."
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">Jennifer R.</p>
                  <p className="text-sm text-muted-foreground">Homeowner</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}