import Link from "next/link"
import { Calculator, Facebook, Instagram, Linkedin, Twitter, Home, Coins, Building, Landmark, DollarSign, PiggyBank, RefreshCw, Youtube, Github, Twitch, Disc as Discord, BookText as TikTok, Pointer as Pinterest } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="px-4 sm:px-0">
            <Link href="/" className="flex items-center space-x-2" aria-label="CalculateHub Home">
              <Calculator className="h-6 w-6" aria-hidden="true" />
              <span className="font-bold">CalculateHub</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Empowering you to make informed financial decisions with our suite of easy-to-use calculators.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <Youtube className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                  <Discord className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <TikTok className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                  <Pinterest className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="px-4 sm:px-0">
            <h2 className="mb-4 text-sm font-semibold">Popular Calculators</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/calculators/mortgage" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Home className="h-4 w-4" aria-hidden="true" />
                  <span>Mortgage Calculator</span>
                </Link>
              </li>
              <li>
                <Link href="/calculators/compound-interest" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Coins className="h-4 w-4" aria-hidden="true" />
                  <span>Compound Interest</span>
                </Link>
              </li>
              <li>
                <Link href="/calculators/investment" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <DollarSign className="h-4 w-4" aria-hidden="true" />
                  <span>Investment Calculator</span>
                </Link>
              </li>
              <li>
                <Link href="/calculators/401k" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <PiggyBank className="h-4 w-4" aria-hidden="true" />
                  <span>401(k) Calculator</span>
                </Link>
              </li>
              <li>
                <Link href="/calculators/house-affordability" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Building className="h-4 w-4" aria-hidden="true" />
                  <span>Affordability Calculator</span>
                </Link>
              </li>
              <li>
                <Link href="/calculators/auto-loan" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Calculator className="h-4 w-4" aria-hidden="true" />
                  <span>Auto Loan Calculator</span>
                </Link>
              </li>
              <li>
                <Link href="/calculators" className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
                  <Calculator className="h-4 w-4" aria-hidden="true" />
                  <span>View All 65+ Calculators →</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="px-4 sm:px-0">
            <h2 className="mb-4 text-sm font-semibold">Company</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div className="px-4 sm:px-0">
            <h2 className="mb-4 text-sm font-semibold">Subscribe to our newsletter</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Get the latest updates, calculator tips, and financial insights.
            </p>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Your email"
                className="max-w-[220px]"
                aria-label="Email for newsletter"
              />
              <Button type="submit">Subscribe</Button>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CalculateHub. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-foreground">
                Cookies
              </Link>
              <Link href="/sitemap.xml" className="hover:text-foreground">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}