"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Calculator, Search as SearchIcon, X } from "lucide-react"
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// Define the calculator type
interface CalculatorItem {
  title: string
  description: string
  icon: React.ElementType
  href: string
  category: string
}

export function Search({ className, expandOnFocus = false }: { className?: string, expandOnFocus?: boolean }) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [calculators, setCalculators] = useState<CalculatorItem[]>([])
  const [isFocused, setIsFocused] = useState(false)

  // Load all calculators
  useEffect(() => {
    // This would ideally come from an API or context
    // For now, we'll include all calculators from the homepage
    const allCalculators: CalculatorItem[] = [
      // Mortgage & Housing
      {
        title: "Mortgage Calculator",
        description: "Calculate your monthly mortgage payments based on loan amount, interest rate, and term.",
        icon: Calculator,
        href: "/calculators/mortgage",
        category: "Mortgage & Housing"
      },
      {
        title: "Amortization Calculator",
        description: "See a complete breakdown of your loan payments, including principal and interest over time.",
        icon: Calculator,
        href: "/calculators/amortization",
        category: "Mortgage & Housing"
      },
      {
        title: "Mortgage Payoff Calculator",
        description: "Find out how quickly you can pay off your mortgage with extra payments.",
        icon: Calculator,
        href: "/calculators/mortgage-payoff",
        category: "Mortgage & Housing"
      },
      {
        title: "House Affordability Calculator",
        description: "Determine how much house you can afford based on your income and expenses.",
        icon: Calculator,
        href: "/calculators/house-affordability",
        category: "Mortgage & Housing"
      },
      {
        title: "Rent Calculator",
        description: "Calculate how much rent you can afford based on your income and financial situation.",
        icon: Calculator,
        href: "/calculators/rent",
        category: "Mortgage & Housing"
      },
      {
        title: "Refinance Calculator",
        description: "Determine if refinancing your mortgage makes financial sense for your situation.",
        icon: Calculator,
        href: "/calculators/refinance",
        category: "Mortgage & Housing"
      },
      {
        title: "FHA Loan Calculator",
        description: "Calculate payments and eligibility for FHA loans with lower down payment requirements.",
        icon: Calculator,
        href: "/calculators/fha-loan",
        category: "Mortgage & Housing"
      },
      {
        title: "VA Mortgage Calculator",
        description: "Estimate payments for VA loans available to service members, veterans, and eligible spouses.",
        icon: Calculator,
        href: "/calculators/va-mortgage",
        category: "Mortgage & Housing"
      },
      {
        title: "Down Payment Calculator",
        description: "Determine how much you need to save for a down payment on a home purchase.",
        icon: Calculator,
        href: "/calculators/down-payment",
        category: "Mortgage & Housing"
      },
      {
        title: "Rent vs. Buy Calculator",
        description: "Compare the financial benefits of renting versus buying a home over time.",
        icon: Calculator,
        href: "/calculators/rent-vs-buy",
        category: "Mortgage & Housing"
      },
      
      // Auto & Vehicle
      {
        title: "Auto Loan Calculator",
        description: "Calculate monthly payments for a car loan based on price, down payment, and interest rate.",
        icon: Calculator,
        href: "/calculators/auto-loan",
        category: "Auto & Vehicle"
      },
      {
        title: "Cash Back or Low Interest Calculator",
        description: "Compare cash back offers versus low interest rate financing for vehicle purchases.",
        icon: Calculator,
        href: "/calculators/cash-back-interest",
        category: "Auto & Vehicle"
      },
      {
        title: "Auto Lease Calculator",
        description: "Estimate monthly payments and total cost of leasing a vehicle.",
        icon: Calculator,
        href: "/calculators/auto-lease",
        category: "Auto & Vehicle"
      },
      
      // Investment & Savings
      {
        title: "Investment Calculator",
        description: "Project the growth of your investments over time with different contribution scenarios.",
        icon: Calculator,
        href: "/calculators/investment",
        category: "Investment & Savings"
      },
      {
        title: "Compound Interest Calculator",
        description: "See how your money can grow through the power of compound interest.",
        icon: Calculator,
        href: "/calculators/compound-interest",
        category: "Investment & Savings"
      },
      {
        title: "Interest Rate Calculator",
        description: "Determine the interest rate needed to reach your financial goals.",
        icon: Calculator,
        href: "/calculators/interest-rate",
        category: "Investment & Savings"
      },
      {
        title: "Savings Calculator",
        description: "Plan your savings strategy to reach specific financial targets.",
        icon: Calculator,
        href: "/calculators/savings",
        category: "Investment & Savings"
      },
      {
        title: "Simple Interest Calculator",
        description: "Calculate interest earned or paid based on principal, rate, and time.",
        icon: Calculator,
        href: "/calculators/simple-interest",
        category: "Investment & Savings"
      },
      {
        title: "CD Calculator",
        description: "Estimate returns on certificates of deposit with different terms and rates.",
        icon: Calculator,
        href: "/calculators/cd",
        category: "Investment & Savings"
      },
      {
        title: "Bond Calculator",
        description: "Calculate bond yields, prices, and interest payments.",
        icon: Calculator,
        href: "/calculators/bond",
        category: "Investment & Savings"
      },
      {
        title: "Average Return Calculator",
        description: "Determine the average annual return on your investments over time.",
        icon: Calculator,
        href: "/calculators/average-return",
        category: "Investment & Savings"
      },
      {
        title: "IRR Calculator",
        description: "Calculate the internal rate of return for an investment or project.",
        icon: Calculator,
        href: "/calculators/irr",
        category: "Investment & Savings"
      },
      {
        title: "ROI Calculator",
        description: "Measure the return on investment for various financial decisions.",
        icon: Calculator,
        href: "/calculators/roi",
        category: "Investment & Savings"
      },
      {
        title: "Payback Period Calculator",
        description: "Determine how long it will take to recover the cost of an investment.",
        icon: Calculator,
        href: "/calculators/payback-period",
        category: "Investment & Savings"
      },
      {
        title: "Present Value Calculator",
        description: "Calculate the current value of a future sum of money.",
        icon: Calculator,
        href: "/calculators/present-value",
        category: "Investment & Savings"
      },
      {
        title: "Future Value Calculator",
        description: "Project the future value of an investment or savings account.",
        icon: Calculator,
        href: "/calculators/future-value",
        category: "Investment & Savings"
      },
      
      // Retirement & Planning
      {
        title: "401k Calculator",
        description: "Project your retirement savings with employer matching contributions.",
        icon: Calculator,
        href: "/calculators/401k",
        category: "Retirement & Planning"
      },
      {
        title: "Pension Calculator",
        description: "Estimate your pension benefits based on salary and years of service.",
        icon: Calculator,
        href: "/calculators/pension",
        category: "Retirement & Planning"
      },
      {
        title: "Social Security Calculator",
        description: "Estimate your future Social Security benefits based on your earnings history.",
        icon: Calculator,
        href: "/calculators/social-security",
        category: "Retirement & Planning"
      },
      {
        title: "Annuity Calculator",
        description: "Calculate payments or future value of an annuity investment.",
        icon: Calculator,
        href: "/calculators/annuity",
        category: "Retirement & Planning"
      },
      {
        title: "Annuity Payout Calculator",
        description: "Determine how much income an annuity will provide during retirement.",
        icon: Calculator,
        href: "/calculators/annuity-payout",
        category: "Retirement & Planning"
      },
      {
        title: "Roth IRA Calculator",
        description: "Project tax-free growth and withdrawals with a Roth IRA investment.",
        icon: Calculator,
        href: "/calculators/roth-ira",
        category: "Retirement & Planning"
      },
      {
        title: "RMD Calculator",
        description: "Calculate required minimum distributions from retirement accounts.",
        icon: Calculator,
        href: "/calculators/rmd",
        category: "Retirement & Planning"
      },
      
      // Tax & Income
      {
        title: "Income Tax Calculator",
        description: "Estimate your federal and state income tax liability based on your earnings.",
        icon: Calculator,
        href: "/calculators/income-tax",
        category: "Tax & Income"
      },
      {
        title: "Salary Calculator",
        description: "Convert hourly, weekly, or monthly wages to different pay periods.",
        icon: Calculator,
        href: "/calculators/salary",
        category: "Tax & Income"
      },
      {
        title: "Marriage Tax Calculator",
        description: "Compare tax liability as single filers versus married filing jointly or separately.",
        icon: Calculator,
        href: "/calculators/marriage-tax",
        category: "Tax & Income"
      },
      {
        title: "Estate Tax Calculator",
        description: "Estimate potential estate tax liability for inheritance planning.",
        icon: Calculator,
        href: "/calculators/estate-tax",
        category: "Tax & Income"
      },
      {
        title: "Take-Home-Paycheck Calculator",
        description: "Calculate your net pay after taxes and deductions.",
        icon: Calculator,
        href: "/calculators/take-home-paycheck",
        category: "Tax & Income"
      },
      
      // Debt & Credit
      {
        title: "Debt-to-Income Ratio Calculator",
        description: "Calculate your debt-to-income ratio to understand your financial health.",
        icon: Calculator,
        href: "/calculators/debt-to-income",
        category: "Debt & Credit"
      },
      {
        title: "Payment Calculator",
        description: "Calculate monthly payments for loans with different terms and interest rates.",
        icon: Calculator,
        href: "/calculators/payment",
        category: "Debt & Credit"
      },
      {
        title: "Credit Card Calculator",
        description: "Determine how long it will take to pay off credit card debt with different payment strategies.",
        icon: Calculator,
        href: "/calculators/credit-card",
        category: "Debt & Credit"
      },
      {
        title: "Credit Cards Payoff Calculator",
        description: "Create a strategy to pay off multiple credit cards efficiently.",
        icon: Calculator,
        href: "/calculators/credit-cards-payoff",
        category: "Debt & Credit"
      },
      {
        title: "Debt Payoff Calculator",
        description: "Compare debt snowball and avalanche methods to eliminate debt faster.",
        icon: Calculator,
        href: "/calculators/debt-payoff",
        category: "Debt & Credit"
      },
      {
        title: "Debt Consolidation Calculator",
        description: "Evaluate if consolidating your debts will save money and simplify payments.",
        icon: Calculator,
        href: "/calculators/debt-consolidation",
        category: "Debt & Credit"
      },
      {
        title: "Repayment Calculator",
        description: "Create a customized repayment plan for any type of loan.",
        icon: Calculator,
        href: "/calculators/repayment",
        category: "Debt & Credit"
      },
      {
        title: "Student Loan Calculator",
        description: "Calculate monthly payments and total cost of student loans.",
        icon: Calculator,
        href: "/calculators/student-loan",
        category: "Debt & Credit"
      },
      {
        title: "College Cost Calculator",
        description: "Estimate the total cost of college education and plan for savings.",
        icon: Calculator,
        href: "/calculators/college-cost",
        category: "Debt & Credit"
      },
      
      // Business & Finance
      {
        title: "Real Estate Calculator",
        description: "Analyze potential real estate investments with comprehensive ROI calculations.",
        icon: Calculator,
        href: "/calculators/real-estate",
        category: "Business & Finance"
      },
      {
        title: "Finance Calculator",
        description: "Solve for various financial variables including present value, future value, and interest rate.",
        icon: Calculator,
        href: "/calculators/finance",
        category: "Business & Finance"
      },
      {
        title: "Currency Converter",
        description: "Convert between different currencies using current exchange rates.",
        icon: Calculator,
        href: "/calculators/currency-converter",
        category: "Business & Finance"
      },
      {
        title: "Inflation Calculator",
        description: "Calculate the impact of inflation on purchasing power over time.",
        icon: Calculator,
        href: "/calculators/inflation",
        category: "Business & Finance"
      },
      {
        title: "Sales Tax Calculator",
        description: "Calculate sales tax and final price for purchases in different locations.",
        icon: Calculator,
        href: "/calculators/sales-tax",
        category: "Business & Finance"
      },
      {
        title: "VAT Calculator",
        description: "Calculate Value Added Tax for business transactions and consumer purchases.",
        icon: Calculator,
        href: "/calculators/vat",
        category: "Business & Finance"
      },
      {
        title: "Depreciation Calculator",
        description: "Calculate depreciation of assets using different methods for accounting and tax purposes.",
        icon: Calculator,
        href: "/calculators/depreciation",
        category: "Business & Finance"
      },
      {
        title: "Margin Calculator",
        description: "Calculate profit margins, markups, and selling prices for business pricing strategies.",
        icon: Calculator,
        href: "/calculators/margin",
        category: "Business & Finance"
      },
      {
        title: "Discount Calculator",
        description: "Calculate sale prices, discount amounts, and percentage savings.",
        icon: Calculator,
        href: "/calculators/discount",
        category: "Business & Finance"
      },
      {
        title: "Business Loan Calculator",
        description: "Estimate payments and total cost for business financing options.",
        icon: Calculator,
        href: "/calculators/business-loan",
        category: "Business & Finance"
      },
      {
        title: "Personal Loan Calculator",
        description: "Calculate monthly payments and total interest for personal loans.",
        icon: Calculator,
        href: "/calculators/personal-loan",
        category: "Business & Finance"
      },
      {
        title: "Lease Calculator",
        description: "Analyze commercial lease terms and calculate total occupancy costs.",
        icon: Calculator,
        href: "/calculators/lease",
        category: "Business & Finance"
      },
      {
        title: "Budget Calculator",
        description: "Create a comprehensive budget based on income and expenses.",
        icon: Calculator,
        href: "/calculators/budget",
        category: "Business & Finance"
      },
      {
        title: "Commission Calculator",
        description: "Calculate sales commissions based on different commission structures.",
        icon: Calculator,
        href: "/calculators/commission",
        category: "Business & Finance"
      },
      {
        title: "APR Calculator",
        description: "Calculate the true annual cost of borrowing with all fees included.",
        icon: Calculator,
        href: "/calculators/apr",
        category: "Business & Finance"
      },
      {
        title: "Interest Calculator",
        description: "Calculate interest earned or paid over any time period.",
        icon: Calculator,
        href: "/calculators/interest",
        category: "Business & Finance"
      },
      
      // Health & Wellness
      {
        title: "BMI Calculator",
        description: "Calculate your Body Mass Index and understand your health metrics.",
        icon: Calculator,
        href: "/calculators/bmi",
        category: "Health & Wellness"
      },
      
      // Utility
      {
        title: "Temperature Converter",
        description: "Convert between Celsius, Fahrenheit, and Kelvin temperature scales.",
        icon: Calculator,
        href: "/calculators/temperature",
        category: "Utility"
      },
    ]
    
    setCalculators(allCalculators)
  }, [])

  // Function to handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Enhanced fuzzy search function to match even with typos
  const fuzzySearch = (text: string, pattern: string): boolean => {
    pattern = pattern.toLowerCase()
    text = text.toLowerCase()
    
    // Exact match or contains
    if (text.includes(pattern)) return true
    
    // Fuzzy match
    let patternIdx = 0
    let textIdx = 0
    
    while (patternIdx < pattern.length && textIdx < text.length) {
      if (pattern[patternIdx] === text[textIdx]) {
        patternIdx++
      }
      textIdx++
    }
    
    return patternIdx === pattern.length
  }

  // Filter calculators based on search term in real-time
  const filteredCalculators = searchTerm.trim() === "" 
    ? calculators 
    : calculators.filter(calculator => 
        fuzzySearch(calculator.title, searchTerm) || 
        fuzzySearch(calculator.description, searchTerm) ||
        fuzzySearch(calculator.category, searchTerm)
      )

  // Group calculators by category
  const groupedCalculators = filteredCalculators.reduce((acc, calculator) => {
    if (!acc[calculator.category]) {
      acc[calculator.category] = []
    }
    acc[calculator.category].push(calculator)
    return acc
  }, {} as Record<string, CalculatorItem[]>)

  return (
    <>
      <div className={cn("relative", className)}>
        <div className="relative w-full">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search calculator"
            className="pl-10 pr-4 w-full h-9 xl:h-10"
            onClick={() => setOpen(true)}
            readOnly
            aria-label="Search calculators"
          />
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 xl:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search Calculators</DialogTitle>
        <CommandInput 
          placeholder="Search calculator" 
          value={searchTerm}
          onValueChange={setSearchTerm}
          autoFocus
        />
        <CommandList>
          <CommandEmpty>
            No calculators found. Try a different search term.
          </CommandEmpty>
          
          {Object.entries(groupedCalculators).map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((calculator) => (
                <CommandItem
                  key={calculator.href}
                  value={calculator.title}
                  onSelect={() => {
                    window.location.href = calculator.href
                    setOpen(false)
                  }}
                  className="group relative overflow-hidden"
                >
                  {/* Glow effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 opacity-0 group-hover:opacity-100 group-hover:from-primary/10 group-hover:via-primary/20 group-hover:to-primary/10 transition-all duration-300 rounded-md -z-10"></div>
                  
                  {/* Pulsing glow on active/focus */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 group-focus:bg-primary/10 group-active:bg-primary/15 group-active:animate-pulse-glow rounded-md -z-10 transition-all duration-300"></div>
                  
                  <Calculator className="mr-2 h-4 w-4 text-primary group-hover:text-primary group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="group-hover:text-primary transition-colors duration-300">{calculator.title}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1 group-hover:text-primary/70 transition-colors duration-300">
                      {calculator.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}