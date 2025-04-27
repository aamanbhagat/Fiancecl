"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Cookie, Shield, Eye, Settings, Info, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CookiesPage() {
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
                Cookies <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Policy</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Understanding how we use cookies to improve your experience on CalculateHub
              </p>
            </div>
          </div>
        </section>

        {/* What Are Cookies Section */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight mb-6">What Are Cookies?</h2>
              <p className="text-muted-foreground mb-4">
                Cookies are small text files that are placed on your device when you visit a website. They help the website recognize your device and remember certain information about your visit.
              </p>
              <p className="text-muted-foreground mb-4">
                These files are stored on your computer or mobile device and allow us to provide features that improve your browsing experience, analyze site usage, and assist in our marketing efforts.
              </p>
              <p className="text-muted-foreground">
                At CalculateHub, we use cookies responsibly to ensure the best possible experience while protecting your privacy.
              </p>
            </div>
          </div>
        </section>

        {/* Types of Cookies Section */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Types of Cookies We Use</h2>
              <p className="text-muted-foreground">
                We use different types of cookies for various purposes on our platform.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <Cookie className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">Essential Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies are necessary for the website to function and cannot be switched off in our systems.
                </p>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <Eye className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">Analytics Cookies</h3>
                <p className="text-muted-foreground">
                  These help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <Settings className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">Functional Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences.
                </p>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <Info className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">Performance Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies collect information about how you use our website to help us improve its performance and usability.
                </p>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">Security Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies help protect our website and users from security threats and ensure secure transactions.
                </p>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-2">Consent Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies store your cookie preferences and help us track when you've given consent for various cookie types.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How We Use Cookies Section */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight mb-6">How We Use Cookies</h2>
              <p className="text-muted-foreground mb-4">
                At CalculateHub, we use cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                <li>To ensure our website functions properly and securely</li>
                <li>To remember your preferences and settings</li>
                <li>To understand how visitors interact with our site</li>
                <li>To optimize and improve our calculators and services</li>
                <li>To provide personalized experiences based on your usage patterns</li>
                <li>To protect against unauthorized access and potential security threats</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We never use cookies to collect personally identifiable information without your explicit consent.
              </p>
            </div>
          </div>
        </section>

        {/* Managing Your Cookies Section */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight mb-6">Managing Your Cookies</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to decide whether to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer.
              </p>
              <p className="text-muted-foreground mb-4">
                To manage your cookie preferences, you can:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground mb-4">
                <li>Use our cookie consent tool that appears when you first visit our site</li>
                <li>Adjust your browser settings to block or delete cookies</li>
                <li>Use private browsing or incognito mode, which limits cookie storage</li>
              </ul>
              <p className="text-muted-foreground">
                Please note that restricting cookies may impact your experience on our website, as some features may not function properly without certain cookies.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Questions about our cookie practices?</h2>
              <p className="mb-8">
                If you have any questions about how we use cookies or handle your data, please don't hesitate to contact us.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  Contact Our Privacy Team
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