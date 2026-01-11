"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calculator, Search as SearchIcon } from "lucide-react"
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface CalculatorItem {
  title: string
  description: string
  href: string
  category: string
}

const ALL_CALCULATORS: CalculatorItem[] = [
  // Mortgage & Housing
  { title: "Mortgage Calculator", description: "Calculate monthly mortgage payments", href: "/calculators/mortgage", category: "Mortgage & Housing" },
  { title: "Amortization Calculator", description: "Complete breakdown of loan payments", href: "/calculators/amortization", category: "Mortgage & Housing" },
  { title: "Mortgage Payoff Calculator", description: "Pay off mortgage faster with extra payments", href: "/calculators/mortgage-payoff", category: "Mortgage & Housing" },
  { title: "House Affordability Calculator", description: "How much house you can afford", href: "/calculators/house-affordability", category: "Mortgage & Housing" },
  { title: "Rent Calculator", description: "Calculate affordable rent based on income", href: "/calculators/rent", category: "Mortgage & Housing" },
  { title: "Refinance Calculator", description: "Should you refinance your mortgage", href: "/calculators/refinance", category: "Mortgage & Housing" },
  { title: "FHA Loan Calculator", description: "FHA loans with lower down payments", href: "/calculators/fha-loan", category: "Mortgage & Housing" },
  { title: "VA Mortgage Calculator", description: "VA loans for veterans and service members", href: "/calculators/va-mortgage", category: "Mortgage & Housing" },
  { title: "Down Payment Calculator", description: "Plan your home down payment", href: "/calculators/down-payment", category: "Mortgage & Housing" },
  { title: "Rent vs. Buy Calculator", description: "Compare renting versus buying", href: "/calculators/rent-vs-buy", category: "Mortgage & Housing" },
  
  // Auto & Vehicle
  { title: "Auto Loan Calculator", description: "Calculate car loan payments", href: "/calculators/auto-loan", category: "Auto & Vehicle" },
  { title: "Cash Back or Low Interest Calculator", description: "Compare cash back vs low interest", href: "/calculators/cash-back-interest", category: "Auto & Vehicle" },
  { title: "Auto Lease Calculator", description: "Estimate vehicle lease payments", href: "/calculators/auto-lease", category: "Auto & Vehicle" },
  
  // Investment & Savings
  { title: "Investment Calculator", description: "Project investment growth over time", href: "/calculators/investment", category: "Investment & Savings" },
  { title: "Compound Interest Calculator", description: "Power of compound interest", href: "/calculators/compound-interest", category: "Investment & Savings" },
  { title: "Interest Rate Calculator", description: "Determine needed interest rate", href: "/calculators/interest-rate", category: "Investment & Savings" },
  { title: "Savings Calculator", description: "Plan your savings strategy", href: "/calculators/savings", category: "Investment & Savings" },
  { title: "Simple Interest Calculator", description: "Calculate simple interest", href: "/calculators/simple-interest", category: "Investment & Savings" },
  { title: "CD Calculator", description: "Certificate of deposit returns", href: "/calculators/cd", category: "Investment & Savings" },
  { title: "Bond Calculator", description: "Calculate bond yields and prices", href: "/calculators/bond", category: "Investment & Savings" },
  { title: "Average Return Calculator", description: "Average annual investment return", href: "/calculators/average-return", category: "Investment & Savings" },
  { title: "IRR Calculator", description: "Internal rate of return", href: "/calculators/irr", category: "Investment & Savings" },
  { title: "ROI Calculator", description: "Return on investment", href: "/calculators/roi", category: "Investment & Savings" },
  { title: "Payback Period Calculator", description: "Time to recover investment cost", href: "/calculators/payback-period", category: "Investment & Savings" },
  { title: "Present Value Calculator", description: "Current value of future money", href: "/calculators/present-value", category: "Investment & Savings" },
  { title: "Future Value Calculator", description: "Future value of investments", href: "/calculators/future-value", category: "Investment & Savings" },
  
  // Retirement & Planning
  { title: "401k Calculator", description: "Project retirement savings with 401k", href: "/calculators/401k", category: "Retirement & Planning" },
  { title: "Pension Calculator", description: "Estimate pension benefits", href: "/calculators/pension", category: "Retirement & Planning" },
  { title: "Social Security Calculator", description: "Estimate Social Security benefits", href: "/calculators/social-security", category: "Retirement & Planning" },
  { title: "Annuity Calculator", description: "Calculate annuity payments", href: "/calculators/annuity", category: "Retirement & Planning" },
  { title: "Annuity Payout Calculator", description: "Annuity income during retirement", href: "/calculators/annuity-payout", category: "Retirement & Planning" },
  { title: "Roth IRA Calculator", description: "Tax-free Roth IRA growth", href: "/calculators/roth-ira", category: "Retirement & Planning" },
  { title: "RMD Calculator", description: "Required minimum distributions", href: "/calculators/rmd", category: "Retirement & Planning" },
  
  // Tax & Income
  { title: "Income Tax Calculator", description: "Estimate income tax liability", href: "/calculators/income-tax", category: "Tax & Income" },
  { title: "Salary Calculator", description: "Convert between pay periods", href: "/calculators/salary", category: "Tax & Income" },
  { title: "Marriage Tax Calculator", description: "Single vs married filing", href: "/calculators/marriage-tax", category: "Tax & Income" },
  { title: "Estate Tax Calculator", description: "Estate tax for inheritance", href: "/calculators/estate-tax", category: "Tax & Income" },
  { title: "Take-Home-Paycheck Calculator", description: "Net pay after taxes", href: "/calculators/take-home-paycheck", category: "Tax & Income" },
  
  // Debt & Credit
  { title: "Debt-to-Income Ratio Calculator", description: "Calculate debt-to-income ratio", href: "/calculators/debt-to-income", category: "Debt & Credit" },
  { title: "Payment Calculator", description: "Calculate loan payments", href: "/calculators/payment", category: "Debt & Credit" },
  { title: "Credit Card Calculator", description: "Pay off credit card debt", href: "/calculators/credit-card", category: "Debt & Credit" },
  { title: "Credit Cards Payoff Calculator", description: "Multiple credit cards strategy", href: "/calculators/credit-cards-payoff", category: "Debt & Credit" },
  { title: "Debt Payoff Calculator", description: "Snowball and avalanche methods", href: "/calculators/debt-payoff", category: "Debt & Credit" },
  { title: "Debt Consolidation Calculator", description: "Consolidate debts to save money", href: "/calculators/debt-consolidation", category: "Debt & Credit" },
  { title: "Repayment Calculator", description: "Customized loan repayment plan", href: "/calculators/repayment", category: "Debt & Credit" },
  { title: "Student Loan Calculator", description: "Student loan payments and cost", href: "/calculators/student-loan", category: "Debt & Credit" },
  { title: "College Cost Calculator", description: "Total cost of college education", href: "/calculators/college-cost", category: "Debt & Credit" },
  
  // Business & Finance
  { title: "Real Estate Calculator", description: "Analyze real estate investments", href: "/calculators/real-estate", category: "Business & Finance" },
  { title: "Finance Calculator", description: "Solve financial variables", href: "/calculators/finance", category: "Business & Finance" },
  { title: "Currency Converter", description: "Convert between currencies", href: "/calculators/currency-converter", category: "Business & Finance" },
  { title: "Inflation Calculator", description: "Impact of inflation over time", href: "/calculators/inflation", category: "Business & Finance" },
  { title: "Sales Tax Calculator", description: "Calculate sales tax and final price", href: "/calculators/sales-tax", category: "Business & Finance" },
  { title: "VAT Calculator", description: "Value Added Tax calculator", href: "/calculators/vat", category: "Business & Finance" },
  { title: "Depreciation Calculator", description: "Asset depreciation calculation", href: "/calculators/depreciation", category: "Business & Finance" },
  { title: "Margin Calculator", description: "Profit margins and markups", href: "/calculators/margin", category: "Business & Finance" },
  { title: "Discount Calculator", description: "Calculate sale prices and savings", href: "/calculators/discount", category: "Business & Finance" },
  { title: "Business Loan Calculator", description: "Business financing payments", href: "/calculators/business-loan", category: "Business & Finance" },
  { title: "Personal Loan Calculator", description: "Personal loan payments", href: "/calculators/personal-loan", category: "Business & Finance" },
  { title: "Lease Calculator", description: "Commercial lease analysis", href: "/calculators/lease", category: "Business & Finance" },
  { title: "Budget Calculator", description: "Create comprehensive budget", href: "/calculators/budget", category: "Business & Finance" },
  { title: "Commission Calculator", description: "Calculate sales commissions", href: "/calculators/commission", category: "Business & Finance" },
  { title: "APR Calculator", description: "True annual borrowing cost", href: "/calculators/apr", category: "Business & Finance" },
  { title: "Interest Calculator", description: "Calculate interest over time", href: "/calculators/interest", category: "Business & Finance" },
  
  // Health & Wellness
  { title: "BMI Calculator", description: "Body Mass Index calculator", href: "/calculators/bmi", category: "Health & Wellness" },
  
  // Utility
  { title: "Temperature Converter", description: "Convert temperature scales", href: "/calculators/temperature", category: "Utility" },
]

export function Search({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

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

  const filteredCalculators = searchTerm.trim() === "" 
    ? ALL_CALCULATORS 
    : ALL_CALCULATORS.filter(calc => 
        calc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        calc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.category.toLowerCase().includes(searchTerm.toLowerCase())
      )

  const groupedCalculators = filteredCalculators.reduce((acc, calc) => {
    if (!acc[calc.category]) acc[calc.category] = []
    acc[calc.category].push(calc)
    return acc
  }, {} as Record<string, CalculatorItem[]>)

  const handleSelect = (href: string) => {
    setOpen(false)
    setSearchTerm("")
    router.push(href)
  }

  return (
    <>
      <div className={cn("relative", className)}>
        <div className="relative w-full">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search calculators"
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
          placeholder="Search calculators..." 
          value={searchTerm}
          onValueChange={setSearchTerm}
          autoFocus
        />
        <CommandList>
          <CommandEmpty>No calculators found.</CommandEmpty>
          
          {Object.entries(groupedCalculators).map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((calc) => (
                <CommandItem
                  key={calc.href}
                  value={calc.title}
                  onSelect={() => handleSelect(calc.href)}
                  className="cursor-pointer"
                >
                  <Calculator className="mr-2 h-4 w-4 shrink-0" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span>{calc.title}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {calc.description}
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
