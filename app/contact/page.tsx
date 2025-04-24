"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: ""
      })
    }, 1500)
  }

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
                Get in <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Touch</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Have questions, feedback, or suggestions? We'd love to hear from you. Reach out to our team using the contact information below.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-12">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <Mail className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Email Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    <a href="mailto:support@calculatehub.com" className="text-primary hover:underline">
                      support@calculatehub.com
                    </a>
                  </CardDescription>
                  <p className="text-sm text-muted-foreground mt-2">
                    We typically respond within 24 hours on business days.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <Phone className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Call Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    <a href="tel:+18005551234" className="text-primary hover:underline">
                      +1 (800) 555-1234
                    </a>
                  </CardDescription>
                  <p className="text-sm text-muted-foreground mt-2">
                    Available Monday-Friday, 9am-5pm EST.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <MapPin className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Visit Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    123 Financial District<br />
                    New York, NY 10004<br />
                    United States
                  </CardDescription>
                  <p className="text-sm text-muted-foreground mt-2">
                    By appointment only.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="mx-auto bg-green-500/10 p-3 rounded-full w-fit mb-4">
                        <Send className="h-6 w-6 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">
                        Thank you for reaching out. We'll respond to your message shortly.
                      </p>
                      <Button 
                        className="mt-6" 
                        onClick={() => setIsSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name</Label>
                          <Input 
                            id="name" 
                            name="name" 
                            placeholder="John Doe" 
                            required 
                            value={formState.name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            placeholder="john@example.com" 
                            required 
                            value={formState.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input 
                          id="subject" 
                          name="subject" 
                          placeholder="How can we help you?" 
                          required 
                          value={formState.subject}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea 
                          id="message" 
                          name="message" 
                          placeholder="Please provide details about your inquiry..." 
                          rows={6} 
                          required 
                          value={formState.message}
                          onChange={handleChange}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
              <p className="mt-4 text-muted-foreground">
                Find quick answers to common questions about our calculators and services.
              </p>
            </div>
            <div className="mx-auto max-w-3xl grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Are your calculators free to use?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, all of our calculators are completely free to use. We believe financial tools should be accessible to everyone without any paywalls or hidden fees.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>How accurate are your calculators?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our calculators use industry-standard formulas and are regularly reviewed by financial experts. While they provide highly accurate estimates, they should be used as guidance rather than definitive financial advice.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Is my data secure when using your calculators?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Absolutely. Your privacy is our priority. All calculations are performed locally in your browser, and we don't store any of your financial information on our servers.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Can I suggest a new calculator?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We welcome suggestions! If there's a calculator you'd like to see on our platform, please use the contact form above to let us know. We're constantly expanding our suite of tools based on user feedback.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}