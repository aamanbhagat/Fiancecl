"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Calculator, Users, Award, Clock, Globe, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                About <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">CalculateHub</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                We're on a mission to make financial calculations accessible, accurate, and easy to understand for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16">
          <div className="container">
            <div className="grid gap-12 md:grid-cols-2 items-center">
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Team working on financial calculators"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-6">Our Story</h2>
                <p className="text-muted-foreground mb-4">
                  CalculateHub was founded in 2023 with a simple idea: financial calculations shouldn't be complicated or confusing. We noticed that many people struggled to make informed financial decisions because the tools available were either too complex, inaccurate, or hidden behind paywalls.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our team of financial experts and software engineers came together to create a suite of calculators that are not only accurate and comprehensive but also intuitive and accessible to everyone, regardless of their financial background.
                </p>
                <p className="text-muted-foreground">
                  Today, CalculateHub serves thousands of users daily, helping them navigate important financial decisions with confidence and clarity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Our Values</h2>
              <p className="text-muted-foreground">
                These core principles guide everything we do at CalculateHub.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <Users className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">Accessibility</h3>
                <p className="text-muted-foreground">
                  We believe financial tools should be available to everyone, regardless of their background or expertise.
                </p>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <Award className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">Accuracy</h3>
                <p className="text-muted-foreground">
                  Our calculators use industry-standard formulas and are regularly reviewed by financial experts.
                </p>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <Clock className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">Efficiency</h3>
                <p className="text-muted-foreground">
                  We design our tools to save you time and help you make decisions quickly without sacrificing quality.
                </p>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <Globe className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">Education</h3>
                <p className="text-muted-foreground">
                  Beyond calculations, we aim to improve financial literacy through clear explanations and resources.
                </p>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <Heart className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">User-Centered</h3>
                <p className="text-muted-foreground">
                  We continuously improve our tools based on user feedback and evolving financial needs.
                </p>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <Calculator className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We're constantly developing new calculators and improving existing ones to address emerging financial challenges.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground">
                The passionate people behind CalculateHub who are dedicated to making finance more accessible.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="relative h-64 w-64 mx-auto mb-4 overflow-hidden rounded-lg">
                  <Image 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
                    alt="David Chen"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">David Chen</h3>
                <p className="text-primary">Founder & CEO</p>
                <p className="text-muted-foreground mt-2">
                  Former financial advisor with a passion for making finance accessible to everyone.
                </p>
              </div>
              <div className="text-center">
                <div className="relative h-64 w-64 mx-auto mb-4 overflow-hidden rounded-lg">
                  <Image 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80"
                    alt="Sarah Johnson"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">Sarah Johnson</h3>
                <p className="text-primary">Chief Financial Officer</p>
                <p className="text-muted-foreground mt-2">
                  Certified financial planner with over 15 years of experience in personal finance.
                </p>
              </div>
              <div className="text-center">
                <div className="relative h-64 w-64 mx-auto mb-4 overflow-hidden rounded-lg">
                  <Image 
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
                    alt="Michael Rodriguez"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">Michael Rodriguez</h3>
                <p className="text-primary">Lead Developer</p>
                <p className="text-muted-foreground mt-2">
                  Software engineer specializing in creating intuitive financial applications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to start calculating?</h2>
              <p className="mb-8">
                Explore our comprehensive suite of financial calculators and take control of your financial future today.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/#calculators">
                  Explore Our Calculators
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}