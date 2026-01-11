"use client"

import Link from "next/link"
import { Calculator, Menu, X, ChevronDown, CreditCard, Percent, LineChart, PiggyBank, DollarSign, Building, Car, Wallet, GraduationCap, Briefcase, Scale, Clock, RefreshCw, BadgeDollarSign, FileSpreadsheet, Landmark, Home, Coins, LogIn, UserPlus, User, LogOut } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Search } from "@/components/search"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { user, signOut } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const calculatorCategories = [
    {
      title: "Mortgage & Housing",
      items: [
        { name: "Mortgage Calculator", icon: Home, href: "/calculators/mortgage" },
        { name: "Amortization Calculator", icon: Calculator, href: "/calculators/amortization" },
        { name: "Refinance Calculator", icon: RefreshCw, href: "/calculators/refinance" },
        { name: "Rent Calculator", icon: Landmark, href: "/calculators/rent" },
        { name: "House Affordability", icon: Building, href: "/calculators/house-affordability" },
      ]
    },
    {
      title: "Investment & Savings",
      items: [
        { name: "Investment Calculator", icon: LineChart, href: "/calculators/investment" },
        { name: "Compound Interest", icon: Percent, href: "/calculators/compound-interest" },
        { name: "Savings Calculator", icon: PiggyBank, href: "/calculators/savings" },
        { name: "401k Calculator", icon: BadgeDollarSign, href: "/calculators/401k" },
        { name: "ROI Calculator", icon: LineChart, href: "/calculators/roi" },
      ]
    },
    {
      title: "Debt & Credit",
      items: [
        { name: "Credit Card Calculator", icon: CreditCard, href: "/calculators/credit-card" },
        { name: "Debt-to-Income Calculator", icon: FileSpreadsheet, href: "/calculators/debt-to-income" },
        { name: "Student Loan Calculator", icon: GraduationCap, href: "/calculators/student-loan" },
        { name: "Debt Payoff Calculator", icon: Coins, href: "/calculators/debt-payoff" },
        { name: "Personal Loan Calculator", icon: Wallet, href: "/calculators/personal-loan" },
      ]
    },
    {
      title: "Auto & Business",
      items: [
        { name: "Auto Loan Calculator", icon: Car, href: "/calculators/auto-loan" },
        { name: "Budget Calculator", icon: Wallet, href: "/calculators/budget" },
        { name: "401k Calculator", icon: Briefcase, href: "/calculators/401k" },
        { name: "Rent vs. Buy Calculator", icon: Scale, href: "/calculators/rent-vs-buy" },
        { name: "Payback Period Calculator", icon: Clock, href: "/calculators/payback-period" },
      ]
    }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container pl-4 flex h-12 max-w-screen-2xl items-center">
        {/* Logo and Navigation - Left Side */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" aria-label="CalculateHub Home">
            <Calculator className="h-4 w-4" aria-hidden="true" />
            <span className="font-bold text-sm sm:inline-block">
              CalculateHub
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 px-2 py-1 rounded-md hover:bg-primary/10 text-sm"
            >
              Home
            </Link>
            <Link
              href="/#calculators"
              className="transition-colors hover:text-foreground/80 px-2 py-1 rounded-md hover:bg-primary/10 text-sm"
            >
              Calculators
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 px-2 py-1 rounded-md hover:bg-primary/10 text-sm"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="transition-colors hover:text-foreground/80 px-2 py-1 rounded-md hover:bg-primary/10 text-sm"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground/80 px-2 py-1 rounded-md hover:bg-primary/10 text-sm"
            >
              Contact
            </Link>
            <div 
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button 
                className="flex items-center transition-colors hover:text-foreground/80 px-2 py-1 rounded-md hover:bg-primary/10 text-sm"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                aria-label="More options"
              >
                More
                <ChevronDown className="h-3 w-3 ml-1" aria-hidden="true" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-1 w-[1000px] rounded-md border bg-popover p-0 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 z-50">
                  <div className="grid grid-cols-4 gap-0">
                    {calculatorCategories.map((category, index) => (
                      <div key={index} className="p-4">
                        <h3 className="font-medium text-sm mb-2 text-primary">{category.title}</h3>
                        <ul className="space-y-2">
                          {category.items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <Link 
                                href={item.href} 
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={item.name}
                              >
                                <div className="w-5 h-5 flex items-center justify-center text-primary">
                                  <item.icon className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <span>{item.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  {/* Separator line and View All Calculators link */}
                  <div className="border-t border-border/40 p-3 flex justify-center">
                    <Link 
                      href="/#calculators" 
                      className="flex items-center gap-2 text-primary font-medium hover:underline text-base"
                      onClick={() => setIsDropdownOpen(false)}
                      aria-label="View all calculators"
                    >
                      <Calculator className="h-5 w-5" aria-hidden="true" />
                      <span>View All Calculators</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Search - Center */}
        <div className="flex-1 flex justify-center items-center md:hidden">
          <Search className="w-full max-w-[180px]" />
        </div>
        
        {/* Right side actions - Search, Theme, Login/Signup */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Desktop Search */}
          <div className="hidden md:flex items-center">
            <Search className="w-48 lg:w-56 xl:w-64" expandOnFocus={true} />
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 px-2 text-xs">
                    <User className="h-3 w-3" aria-hidden="true" />
                    <span className="max-w-[100px] truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/my-calculations" className="cursor-pointer">
                      <Calculator className="mr-2 h-4 w-4" />
                      <span>My Calculations</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="flex items-center gap-1 h-8 px-2 text-xs">
                  <Link href="/auth">
                    <LogIn className="h-3 w-3" aria-hidden="true" />
                    <span>Login</span>
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild className="flex items-center gap-1 h-8 px-2 text-xs">
                  <Link href="/auth">
                    <UserPlus className="h-3 w-3" aria-hidden="true" />
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 top-12 z-50 grid h-[calc(100vh-3rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in md:hidden",
          isMenuOpen
            ? "slide-in-from-top-80 bg-background"
            : "slide-out-to-top-80 hidden"
        )}
      >
        <div className="relative z-20 grid gap-6 rounded-md bg-background p-4">
          <Link href="/" className="flex items-center space-x-2" aria-label="CalculateHub Home">
            <Calculator className="h-4 w-4" aria-hidden="true" />
            <span className="font-bold text-sm">CalculateHub</span>
          </Link>
          <nav className="grid grid-flow-row auto-rows-max text-sm">
            <Link
              href="/"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/calculators"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              onClick={() => setIsMenuOpen(false)}
            >
              Calculators
            </Link>
            <div className="p-2">
              <h2 className="mb-2 font-medium text-sm">Popular Calculators</h2>
              <div className="grid grid-cols-1 gap-1 pl-2">
                {calculatorCategories.flatMap(category => category.items).slice(0, 10).map((calculator, index) => (
                  <Link
                    key={index}
                    href={calculator.href}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label={calculator.name}
                  >
                    <calculator.icon className="h-3 w-3" aria-hidden="true" />
                    <span>{calculator.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/about"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/blog"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="border-t border-border/40 mt-2 pt-2">
              <Link
                href="/#calculators"
                className="flex w-full items-center rounded-md p-2 text-sm font-medium text-primary hover:underline"
                onClick={() => setIsMenuOpen(false)}
                aria-label="View all calculators"
              >
                <Calculator className="h-3 w-3 mr-2" aria-hidden="true" />
                View All Calculators
              </Link>
            </div>
          </nav>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <ThemeToggle />
            </div>
            {user ? (
              <>
                <div className="p-2 border rounded-md text-xs">
                  <p className="text-muted-foreground">Signed in as</p>
                  <p className="font-medium truncate">{user.email}</p>
                </div>
                <Button variant="outline" asChild className="flex items-center justify-center gap-1 h-8 text-xs">
                  <Link href="/my-calculations" onClick={() => setIsMenuOpen(false)}>
                    <Calculator className="h-3 w-3" aria-hidden="true" />
                    <span>My Calculations</span>
                  </Link>
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex items-center justify-center gap-1 h-8 text-xs"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-3 w-3" aria-hidden="true" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild className="flex items-center justify-center gap-1 h-8 text-xs">
                  <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                    <LogIn className="h-3 w-3" aria-hidden="true" />
                    <span>Login</span>
                  </Link>
                </Button>
                <Button variant="default" asChild className="flex items-center justify-center gap-1 h-8 text-xs">
                  <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                    <UserPlus className="h-3 w-3" aria-hidden="true" />
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}