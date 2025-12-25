"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Eye, FileText, Clock, Globe } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-16">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Privacy <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Policy</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Last updated: May 15, 2025
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Policy Content */}
        <section className="py-12">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Introduction</h2>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    At CalculateHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website calculatehub.com, including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the "Site").
                  </p>
                  <p className="text-muted-foreground">
                    Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Information We Collect</h2>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Personal Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you choose to participate in various activities related to the Site, such as subscribing to our newsletter or submitting a contact form.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3">Derivative Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Information our servers automatically collect when you access the Site, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Site.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3">Financial Data</h3>
                  <p className="text-muted-foreground mb-4">
                    We do not collect or store any financial data you enter into our calculators. All calculations are performed locally in your browser, and this information is not transmitted to our servers.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3">Mobile Device Data</h3>
                  <p className="text-muted-foreground">
                    Device information such as your mobile device ID, model, and manufacturer, and information about the location of your device, if you access the Site from a mobile device.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Use of Your Information</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                  </p>
                  
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                    <li>Create and manage your account.</li>
                    <li>Send you a newsletter.</li>
                    <li>Email you regarding your account or order.</li>
                    <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                    <li>Increase the efficiency and operation of the Site.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                    <li>Notify you of updates to the Site.</li>
                    <li>Resolve disputes and troubleshoot problems.</li>
                    <li>Respond to product and customer service requests.</li>
                    <li>Request feedback and contact you about your use of the Site.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Disclosure of Your Information</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3">By Law or to Protect Rights</h3>
                  <p className="text-muted-foreground mb-4">
                    If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3">Third-Party Service Providers</h3>
                  <p className="text-muted-foreground mb-4">
                    We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3">Marketing Communications</h3>
                  <p className="text-muted-foreground">
                    With your consent, or with an opportunity for you to withdraw consent, we may share your information with third parties for marketing purposes, as permitted by law.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Tracking Technologies</h2>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Cookies and Web Beacons</h3>
                  <p className="text-muted-foreground mb-4">
                    We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Site to help customize the Site and improve your experience. When you access the Site, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the Site.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3">Internet-Based Advertising</h3>
                  <p className="text-muted-foreground">
                    Additionally, we may use third-party software to serve ads on the Site, implement email marketing campaigns, and manage other interactive marketing initiatives. This third-party software may use cookies or similar tracking technology to help manage and optimize your online experience with us.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Third-Party Websites</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    The Site may contain links to third-party websites and applications of interest, including advertisements and external services, that are not affiliated with us. Once you have used these links to leave the Site, any information you provide to these third parties is not covered by this Privacy Policy, and we cannot guarantee the safety and privacy of your information. Before visiting and providing any information to any third-party websites, you should inform yourself of the privacy policies and practices (if any) of the third party responsible for that website, and should take those steps necessary to, in your discretion, protect the privacy of your information. We are not responsible for the content or privacy and security practices and policies of any third parties, including other sites, services or applications that may be linked to or from the Site.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Security of Your Information</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse. Any information disclosed online is vulnerable to interception and misuse by unauthorized parties. Therefore, we cannot guarantee complete security if you provide personal information.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Contact Us</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    If you have questions or comments about this Privacy Policy, please contact us at:
                  </p>
                  
                  <div className="text-muted-foreground">
                    <p>CalculateHub</p>
                    <p>123 Financial District</p>
                    <p>New York, NY 10004</p>
                    <p>United States</p>
                    <p>Email: <a href="mailto:privacy@calculatehub.com" className="text-primary hover:underline">privacy@calculatehub.com</a></p>
                    <p>Phone: +1 (800) 555-1234</p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  This privacy policy was last updated on May 15, 2025.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <Link href="/terms" className="text-primary hover:underline">
                    View our Terms of Service
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}