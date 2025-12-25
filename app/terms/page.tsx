"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, AlertTriangle, Copyright, Scale, Ban, Globe, Shield } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
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
                Terms of <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Service</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Last updated: May 15, 2025
              </p>
            </div>
          </div>
        </section>

        {/* Terms of Service Content */}
        <section className="py-12">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Introduction</h2>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Welcome to CalculateHub. These Terms of Service ("Terms") govern your access to and use of the CalculateHub website, including any content, functionality, and services offered on or through calculatehub.com (the "Website").
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Please read the Terms carefully before you start to use the Website. By using the Website, you accept and agree to be bound and abide by these Terms of Service. If you do not want to agree to these Terms of Service, you must not access or use the Website.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Disclaimer</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    The calculators and information provided on this Website are for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the Website or the information, products, services, or related graphics contained on the Website for any purpose.
                  </p>
                  
                  <p className="text-muted-foreground mb-4">
                    The calculators are tools to assist you, but they should not be relied upon as a substitute for professional financial advice. Before making any financial decisions, we recommend consulting with a qualified financial advisor, accountant, or other professional who can provide advice tailored to your specific circumstances.
                  </p>
                  
                  <p className="text-muted-foreground">
                    Any reliance you place on the information provided by our calculators is strictly at your own risk. We will not be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this Website.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Copyright className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Intellectual Property Rights</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    The Website and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by CalculateHub, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                  </p>
                  
                  <p className="text-muted-foreground mb-4">
                    These Terms of Service permit you to use the Website for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Website, except as follows:
                  </p>
                  
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                    <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials.</li>
                    <li>You may store files that are automatically cached by your Web browser for display enhancement purposes.</li>
                    <li>You may print or download one copy of a reasonable number of pages of the Website for your own personal, non-commercial use and not for further reproduction, publication, or distribution.</li>
                    <li>If we provide social media features with certain content, you may take such actions as are enabled by such features.</li>
                  </ul>
                  
                  <p className="text-muted-foreground">
                    You must not:
                  </p>
                  
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Modify copies of any materials from this site.</li>
                    <li>Use any illustrations, photographs, video or audio sequences, or any graphics separately from the accompanying text.</li>
                    <li>Delete or alter any copyright, trademark, or other proprietary rights notices from copies of materials from this site.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Ban className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Prohibited Uses</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    You may use the Website only for lawful purposes and in accordance with these Terms of Service. You agree not to use the Website:
                  </p>
                  
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                    <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
                    <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
                    <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
                    <li>To impersonate or attempt to impersonate CalculateHub, a CalculateHub employee, another user, or any other person or entity.</li>
                    <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Website, or which, as determined by us, may harm CalculateHub or users of the Website, or expose them to liability.</li>
                  </ul>
                  
                  <p className="text-muted-foreground">
                    Additionally, you agree not to:
                  </p>
                  
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Use the Website in any manner that could disable, overburden, damage, or impair the site or interfere with any other party's use of the Website.</li>
                    <li>Use any robot, spider, or other automatic device, process, or means to access the Website for any purpose, including monitoring or copying any of the material on the Website.</li>
                    <li>Use any manual process to monitor or copy any of the material on the Website, or for any other purpose not expressly authorized in these Terms of Service, without our prior written consent.</li>
                    <li>Use any device, software, or routine that interferes with the proper working of the Website.</li>
                    <li>Introduce any viruses, Trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful.</li>
                    <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Website, the server on which the Website is stored, or any server, computer, or database connected to the Website.</li>
                    <li>Attack the Website via a denial-of-service attack or a distributed denial-of-service attack.</li>
                    <li>Otherwise attempt to interfere with the proper working of the Website.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">User Contributions</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    The Website may contain message boards, chat rooms, personal web pages or profiles, forums, bulletin boards, and other interactive features (collectively, "Interactive Services") that allow users to post, submit, publish, display, or transmit to other users or other persons (hereinafter, "post") content or materials (collectively, "User Contributions") on or through the Website.
                  </p>
                  
                  <p className="text-muted-foreground mb-4">
                    All User Contributions must comply with the Content Standards set out in these Terms of Service. Any User Contribution you post to the site will be considered non-confidential and non-proprietary. By providing any User Contribution on the Website, you grant us and our affiliates and service providers, and each of their and our respective licensees, successors, and assigns the right to use, reproduce, modify, perform, display, distribute, and otherwise disclose to third parties any such material.
                  </p>
                  
                  <p className="text-muted-foreground">
                    You represent and warrant that:
                  </p>
                  
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>You own or control all rights in and to the User Contributions and have the right to grant the license granted above to us and our affiliates and service providers, and each of their and our respective licensees, successors, and assigns.</li>
                    <li>All of your User Contributions do and will comply with these Terms of Service.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Limitation of Liability</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    In no event will CalculateHub, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the Website, any websites linked to it, any content on the Website or such other websites, including any direct, indirect, special, incidental, consequential, or punitive damages, including but not limited to, personal injury, pain and suffering, emotional distress, loss of revenue, loss of profits, loss of business or anticipated savings, loss of use, loss of goodwill, loss of data, and whether caused by tort (including negligence), breach of contract, or otherwise, even if foreseeable.
                  </p>
                  
                  <p className="text-muted-foreground">
                    The foregoing does not affect any liability which cannot be excluded or limited under applicable law.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Indemnification</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    You agree to defend, indemnify, and hold harmless CalculateHub, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms of Service or your use of the Website, including, but not limited to, your User Contributions, any use of the Website's content, services, and products other than as expressly authorized in these Terms of Service, or your use of any information obtained from the Website.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Changes to the Terms of Service</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    We may revise and update these Terms of Service from time to time in our sole discretion. All changes are effective immediately when we post them, and apply to all access to and use of the Website thereafter.
                  </p>
                  
                  <p className="text-muted-foreground mb-4">
                    Your continued use of the Website following the posting of revised Terms of Service means that you accept and agree to the changes. You are expected to check this page frequently so you are aware of any changes, as they are binding on you.
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
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  
                  <div className="text-muted-foreground">
                    <p>CalculateHub</p>
                    <p>123 Financial District</p>
                    <p>New York, NY 10004</p>
                    <p>United States</p>
                    <p>Email: <a href="mailto:legal@calculatehub.com" className="text-primary hover:underline">legal@calculatehub.com</a></p>
                    <p>Phone: +1 (800) 555-1234</p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  These Terms of Service were last updated on May 15, 2025.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <Link href="/privacy" className="text-primary hover:underline">
                    View our Privacy Policy
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