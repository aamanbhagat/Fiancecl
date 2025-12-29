"use client";

import dynamic from "next/dynamic";
import { useMemo, useEffect, useState, memo } from "react";
import { 
  Home, Calculator, Landmark, Coins, Building, DollarSign, PiggyBank, RefreshCw, 
  Percent, Award, Medal, ArrowDown, Scale, Car, Banknote, Truck, LineChart, 
  TrendingUp, BarChart3, BarChart4, BarChart, Wallet, Clock, Calendar, 
  BadgeDollarSign, Briefcase, ShieldCheck, CircleDollarSign, CreditCard, 
  Divide, Minus, Plus, Repeat, GraduationCap, School, Receipt, Trash2, 
  ShoppingCart, Tag, Store, FileSpreadsheet, Users, Activity, Weight, Thermometer
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { CalculatorCard } from "@/components/calculator-card";
import { SiteFooter } from "@/components/site-footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Lazy load heavy components
const FeaturesSection = dynamic(() => import("@/components/features-section").then(mod => ({ default: mod.FeaturesSection })), {
  loading: () => <div className="h-96 animate-pulse bg-muted" />
});
const TestimonialsSection = dynamic(() => import("@/components/testimonials-section").then(mod => ({ default: mod.TestimonialsSection })), {
  loading: () => <div className="h-96 animate-pulse bg-muted" />
});
const CTASection = dynamic(() => import("@/components/cta-section").then(mod => ({ default: mod.CTASection })), {
  loading: () => <div className="h-64 animate-pulse bg-muted" />
});

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculatorCategories = [
    {
      id: "mortgage",
      name: "Mortgage & Housing",
      calculators: [
        {
          title: "Mortgage Calculator",
          description: "Calculate your monthly mortgage payments based on loan amount, interest rate, and term.",
          icon: Home,
          href: "/calculators/mortgage",
        },
        {
          title: "Amortization Calculator",
          description: "See a complete breakdown of your loan payments, including principal and interest over time.",
          icon: Calculator,
          href: "/calculators/amortization",
        },
        {
          title: "Mortgage Payoff Calculator",
          description: "Find out how quickly you can pay off your mortgage with extra payments.",
          icon: Coins,
          href: "/calculators/mortgage-payoff",
        },
        {
          title: "House Affordability Calculator",
          description: "Determine how much house you can afford based on your income and expenses.",
          icon: Building,
          href: "/calculators/house-affordability",
        },
        {
          title: "Rent Calculator",
          description: "Calculate how much rent you can afford based on your income and financial situation.",
          icon: Landmark,
          href: "/calculators/rent",
        },
        {
          title: "Refinance Calculator",
          description: "Determine if refinancing your mortgage makes financial sense for your situation.",
          icon: RefreshCw,
          href: "/calculators/refinance",
        },
        {
          title: "FHA Loan Calculator",
          description: "Calculate payments and eligibility for FHA loans with lower down payment requirements.",
          icon: Award,
          href: "/calculators/fha-loan",
        },
        {
          title: "VA Mortgage Calculator",
          description: "Estimate payments for VA loans available to service members, veterans, and eligible spouses.",
          icon: Medal,
          href: "/calculators/va-mortgage",
        },
        {
          title: "Down Payment Calculator",
          description: "Determine how much you need to save for a down payment on a home purchase.",
          icon: ArrowDown,
          href: "/calculators/down-payment",
        },
        {
          title: "Rent vs. Buy Calculator",
          description: "Compare the financial benefits of renting versus buying a home over time.",
          icon: Scale,
          href: "/calculators/rent-vs-buy",
        },
      ],
    },
    {
      id: "auto",
      name: "Auto & Vehicle",
      calculators: [
        {
          title: "Auto Loan Calculator",
          description: "Calculate monthly payments for a car loan based on price, down payment, and interest rate.",
          icon: Car,
          href: "/calculators/auto-loan",
        },
        {
          title: "Cash Back or Low Interest Calculator",
          description: "Compare cash back offers versus low interest rate financing for vehicle purchases.",
          icon: Banknote,
          href: "/calculators/cash-back-interest",
        },
        {
          title: "Auto Lease Calculator",
          description: "Estimate monthly payments and total cost of leasing a vehicle.",
          icon: Truck,
          href: "/calculators/auto-lease",
        },
      ],
    },
    {
      id: "investment",
      name: "Investment & Savings",
      calculators: [
        {
          title: "Investment Calculator",
          description: "Project the growth of your investments over time with different contribution scenarios.",
          icon: LineChart,
          href: "/calculators/investment",
        },
        {
          title: "Compound Interest Calculator",
          description: "See how your money can grow through the power of compound interest.",
          icon: TrendingUp,
          href: "/calculators/compound-interest",
        },
        {
          title: "Interest Rate Calculator",
          description: "Determine the interest rate needed to reach your financial goals.",
          icon: Percent,
          href: "/calculators/interest-rate",
        },
        {
          title: "Savings Calculator",
          description: "Plan your savings strategy to reach specific financial targets.",
          icon: PiggyBank,
          href: "/calculators/savings",
        },
        {
          title: "Simple Interest Calculator",
          description: "Calculate interest earned or paid based on principal, rate, and time.",
          icon: BarChart,
          href: "/calculators/simple-interest",
        },
        {
          title: "CD Calculator",
          description: "Estimate returns on certificates of deposit with different terms and rates.",
          icon: Calendar,
          href: "/calculators/cd",
        },
        {
          title: "Bond Calculator",
          description: "Calculate bond yields, prices, and interest payments.",
          icon: BarChart3,
          href: "/calculators/bond",
        },
        {
          title: "Average Return Calculator",
          description: "Determine the average annual return on your investments over time.",
          icon: BarChart4,
          href: "/calculators/average-return",
        },
        {
          title: "IRR Calculator",
          description: "Calculate the internal rate of return for an investment or project.",
          icon: LineChart,
          href: "/calculators/irr",
        },
        {
          title: "ROI Calculator",
          description: "Measure the return on investment for various financial decisions.",
          icon: TrendingUp,
          href: "/calculators/roi",
        },
        {
          title: "Payback Period Calculator",
          description: "Determine how long it will take to recover the cost of an investment.",
          icon: Clock,
          href: "/calculators/payback-period",
        },
        {
          title: "Present Value Calculator",
          description: "Calculate the current value of a future sum of money.",
          icon: DollarSign,
          href: "/calculators/present-value",
        },
        {
          title: "Future Value Calculator",
          description: "Project the future value of an investment or savings account.",
          icon: Wallet,
          href: "/calculators/future-value",
        },
      ],
    },
    {
      id: "retirement",
      name: "Retirement & Planning",
      calculators: [
        {
          title: "401k Calculator",
          description: "Project your retirement savings with employer matching contributions.",
          icon: BadgeDollarSign,
          href: "/calculators/401k",
        },
        {
          title: "Pension Calculator",
          description: "Estimate your pension benefits based on salary and years of service.",
          icon: Briefcase,
          href: "/calculators/pension",
        },
        {
          title: "Social Security Calculator",
          description: "Estimate your future Social Security benefits based on your earnings history.",
          icon: ShieldCheck,
          href: "/calculators/social-security",
        },
        {
          title: "Annuity Calculator",
          description: "Calculate payments or future value of an annuity investment.",
          icon: CircleDollarSign,
          href: "/calculators/annuity",
        },
        {
          title: "Annuity Payout Calculator",
          description: "Determine how much income an annuity will provide during retirement.",
          icon: Coins,
          href: "/calculators/annuity-payout",
        },
        {
          title: "Roth IRA Calculator",
          description: "Project tax-free growth and withdrawals with a Roth IRA investment.",
          icon: PiggyBank,
          href: "/calculators/roth-ira",
        },
        {
          title: "RMD Calculator",
          description: "Calculate required minimum distributions from retirement accounts.",
          icon: Calculator,
          href: "/calculators/rmd",
        },
      ],
    },
    {
      id: "tax",
      name: "Tax & Income",
      calculators: [
        {
          title: "Income Tax Calculator",
          description: "Estimate your federal and state income tax liability based on your earnings.",
          icon: DollarSign,
          href: "/calculators/income-tax",
        },
        {
          title: "Salary Calculator",
          description: "Convert hourly, weekly, or monthly wages to different pay periods.",
          icon: Briefcase,
          href: "/calculators/salary",
        },
        {
          title: "Marriage Tax Calculator",
          description: "Compare tax liability as single filers versus married filing jointly or separately.",
          icon: Users,
          href: "/calculators/marriage-tax",
        },
        {
          title: "Estate Tax Calculator",
          description: "Estimate potential estate tax liability for inheritance planning.",
          icon: Building,
          href: "/calculators/estate-tax",
        },
        {
          title: "Take-Home-Paycheck Calculator",
          description: "Calculate your net pay after taxes and deductions.",
          icon: Wallet,
          href: "/calculators/take-home-paycheck",
        },
      ],
    },
    {
      id: "debt",
      name: "Debt & Credit",
      calculators: [
        {
          title: "Debt-to-Income Ratio Calculator",
          description: "Calculate your debt-to-income ratio to understand your financial health.",
          icon: DollarSign,
          href: "/calculators/debt-to-income",
        },
        {
          title: "Payment Calculator",
          description: "Calculate monthly payments for loans with different terms and interest rates.",
          icon: Calendar,
          href: "/calculators/payment",
        },
        {
          title: "Credit Card Calculator",
          description: "Determine how long it will take to pay off credit card debt with different payment strategies.",
          icon: CreditCard,
          href: "/calculators/credit-card",
        },
        {
          title: "Credit Cards Payoff Calculator",
          description: "Create a strategy to pay off multiple credit cards efficiently.",
          icon: CreditCard,
          href: "/calculators/credit-cards-payoff",
        },
        {
          title: "Debt Payoff Calculator",
          description: "Compare debt snowball and avalanche methods to eliminate debt faster.",
          icon: Minus,
          href: "/calculators/debt-payoff",
        },
        {
          title: "Debt Consolidation Calculator",
          description: "Evaluate if consolidating your debts will save money and simplify payments.",
          icon: Plus,
          href: "/calculators/debt-consolidation",
        },
        {
          title: "Repayment Calculator",
          description: "Create a customized repayment plan for any type of loan.",
          icon: Repeat,
          href: "/calculators/repayment",
        },
        {
          title: "Student Loan Calculator",
          description: "Calculate monthly payments and total cost of student loans.",
          icon: GraduationCap,
          href: "/calculators/student-loan",
        },
        {
          title: "College Cost Calculator",
          description: "Estimate the total cost of college education and plan for savings.",
          icon: School,
          href: "/calculators/college-cost",
        },
      ],
    },
    {
      id: "business",
      name: "Business & Finance",
      calculators: [
        {
          title: "Real Estate Calculator",
          description: "Analyze potential real estate investments with comprehensive ROI calculations.",
          icon: Building,
          href: "/calculators/real-estate",
        },
        {
          title: "Finance Calculator",
          description: "Solve for various financial variables including present value, future value, and interest rate.",
          icon: Calculator,
          href: "/calculators/finance",
        },
        {
          title: "Currency Converter",
          description: "Convert between different currencies using current exchange rates.",
          icon: RefreshCw,
          href: "/calculators/currency-converter",
        },
        {
          title: "Inflation Calculator",
          description: "Calculate the impact of inflation on purchasing power over time.",
          icon: TrendingUp,
          href: "/calculators/inflation",
        },
        {
          title: "Sales Tax Calculator",
          description: "Calculate sales tax and final price for purchases in different locations.",
          icon: Receipt,
          href: "/calculators/sales-tax",
        },
        {
          title: "VAT Calculator",
          description: "Calculate Value Added Tax for business transactions and consumer purchases.",
          icon: Percent,
          href: "/calculators/vat",
        },
        {
          title: "Depreciation Calculator",
          description: "Calculate depreciation of assets using different methods for accounting and tax purposes.",
          icon: Trash2,
          href: "/calculators/depreciation",
        },
        {
          title: "Margin Calculator",
          description: "Calculate profit margins, markups, and selling prices for business pricing strategies.",
          icon: ShoppingCart,
          href: "/calculators/margin",
        },
        {
          title: "Discount Calculator",
          description: "Calculate sale prices, discount amounts, and percentage savings.",
          icon: Tag,
          href: "/calculators/discount",
        },
        {
          title: "Business Loan Calculator",
          description: "Estimate payments and total cost for business financing options.",
          icon: Store,
          href: "/calculators/business-loan",
        },
        {
          title: "Personal Loan Calculator",
          description: "Calculate monthly payments and total interest for personal loans.",
          icon: Wallet,
          href: "/calculators/personal-loan",
        },
        {
          title: "Lease Calculator",
          description: "Analyze commercial lease terms and calculate total occupancy costs.",
          icon: Building,
          href: "/calculators/lease",
        },
        {
          title: "Budget Calculator",
          description: "Create a comprehensive budget based on income and expenses.",
          icon: FileSpreadsheet,
          href: "/calculators/budget",
        },
        {
          title: "Commission Calculator",
          description: "Calculate sales commissions based on different commission structures.",
          icon: Divide,
          href: "/calculators/commission",
        },
        {
          title: "APR Calculator",
          description: "Calculate the true annual cost of borrowing with all fees included.",
          icon: Percent,
          href: "/calculators/apr",
        },
        {
          title: "Interest Calculator",
          description: "Calculate interest earned or paid over any time period.",
          icon: DollarSign,
          href: "/calculators/interest",
        },
      ],
    },
    {
      id: "health",
      name: "Health & Wellness",
      calculators: [
        {
          title: "BMI Calculator",
          description: "Calculate your Body Mass Index to assess if your weight is healthy for your height.",
          icon: Weight,
          href: "/calculators/bmi",
        },
        {
          title: "Temperature Converter",
          description: "Convert between Fahrenheit, Celsius, and Kelvin temperature scales.",
          icon: Thermometer,
          href: "/calculators/temperature",
        },
      ],
    },
  ];

  const allCalculators = calculatorCategories.flatMap(category => category.calculators);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        
        <section id="calculators" className="container mx-auto px-4 sm:px-6 md:px-8 py-16">
          <h2 className="text-3xl font-bold mb-8 sr-only">Calculators</h2>
          <Tabs defaultValue="all" className="w-full">
            <div className="relative w-full overflow-hidden">
              <TabsList className={cn(
                "mb-8 flex h-10 items-center justify-between px-4 whitespace-nowrap overflow-x-auto",
                "bg-muted/80 rounded-lg border border-border/40",
                "no-scrollbar"
              )}>
                <TabsTrigger 
                  value="all" 
                  className={cn(
                    "text-sm font-medium whitespace-nowrap transition-all px-3 py-1.5 rounded-md",
                    "hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  )}
                >
                  All Calculators
                </TabsTrigger>
                {calculatorCategories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id} 
                    className={cn(
                      "text-sm whitespace-nowrap transition-all px-3 py-1.5 rounded-md",
                      "hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    )}
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid gap-6 grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {allCalculators.map((calculator) => (
                  <CalculatorCard
                    key={calculator.title}
                    title={calculator.title}
                    description={calculator.description}
                    icon={calculator.icon}
                    href={calculator.href}
                  />
                ))}
              </div>
            </TabsContent>
            
            {calculatorCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="grid gap-6 grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols stron xl:grid-cols-4 2xl:grid-cols-5">
                  {category.calculators.map((calculator) => (
                    <CalculatorCard
                      key={calculator.title}
                      title={calculator.title}
                      description={calculator.description}
                      icon={calculator.icon}
                      href={calculator.href}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>
        
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}