"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, GraduationCap, School, Clock, Calendar, Wallet, Scale, Landmark, Building2, Percent, AlertTriangle, FileText, Target, Award, XCircle, ChevronRight, BadgeDollarSign } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import StudentLoanSchema from './schema';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  ChartTooltip, 
  Legend,
  PointElement,
  LineElement,
  ChartDataLabels
)

// Define repayment plan types
type RepaymentPlan = 'standard' | 'graduated' | 'extended' | 'income-driven'

// Define loan type
type LoanType = 'federal' | 'private'

export default function StudentLoanCalculator() {
  // Loan Details State
  const [loanAmount, setLoanAmount] = useState<number>(30000)
  const [interestRate, setInterestRate] = useState<number>(5.5)
  const [loanTerm, setLoanTerm] = useState<number>(10)
  const [loanType, setLoanType] = useState<LoanType>('federal')
  const [repaymentPlan, setRepaymentPlan] = useState<RepaymentPlan>('standard')
  const [inGracePeriod, setInGracePeriod] = useState<boolean>(false)
  const [gracePeriodMonths, setGracePeriodMonths] = useState<number>(6)
  
  // Income-Driven Repayment Details
  const [annualIncome, setAnnualIncome] = useState<number>(50000)
  const [familySize, setFamilySize] = useState<number>(1)
  const [incomeGrowthRate, setIncomeGrowthRate] = useState<number>(3)
  
  // Additional Payment Details
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(0)
  const [loanFees, setLoanFees] = useState<number>(0)
  
  // Results State
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0)
  const [totalInterest, setTotalInterest] = useState<number>(0)
  const [payoffDate, setPayoffDate] = useState<Date>(new Date())
  const [amortizationSchedule, setAmortizationSchedule] = useState<{
    balance: number[];
    principal: number[];
    interest: number[];
  }>({
    balance: [],
    principal: [],
    interest: []
  })
  const [repaymentComparison, setRepaymentComparison] = useState<{
    plan: RepaymentPlan;
    monthlyPayment: number;
    totalInterest: number;
    totalCost: number;
    payoffMonths: number;
  }[]>([])

  // Calculate monthly payment and amortization schedule
  useEffect(() => {
    // Calculate effective loan amount including fees
    const effectiveLoanAmount = loanAmount + loanFees
    
    // Calculate monthly interest rate
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12
    
    let baseMonthlyPayment = 0
    let totalInterestPaid = 0
    let payoffMonths = numberOfPayments
    
    // Calculate based on repayment plan
    switch (repaymentPlan) {
      case 'standard': {
        // Standard amortization formula
        baseMonthlyPayment = effectiveLoanAmount * 
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
        break
      }
      case 'graduated': {
        // Simplified graduated payment calculation
        // Starts at 50% of standard payment, increases every 2 years
        const standardPayment = effectiveLoanAmount * 
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
        baseMonthlyPayment = standardPayment * 0.5
        break
      }
      case 'extended': {
        // Extended term (25 years)
        const extendedPayments = 300 // 25 years * 12 months
        baseMonthlyPayment = effectiveLoanAmount * 
          (monthlyRate * Math.pow(1 + monthlyRate, extendedPayments)) / 
          (Math.pow(1 + monthlyRate, extendedPayments) - 1)
        break
      }
      case 'income-driven': {
        // Simplified income-driven calculation (10% of discretionary income)
        const povertyLine = 13590 // 2023 poverty guideline for single person
        const discretionaryIncome = Math.max(0, annualIncome - (povertyLine * 1.5))
        baseMonthlyPayment = (discretionaryIncome * 0.1) / 12
        break
      }
    }

    // Add extra monthly payment
    const totalMonthlyPayment = baseMonthlyPayment + extraMonthlyPayment
    
    // Generate amortization schedule
    const schedule = {
      balance: [] as number[],
      principal: [] as number[],
      interest: [] as number[]
    }
    
    let remainingBalance = effectiveLoanAmount
    let month = 0
    
    while (remainingBalance > 0 && month < numberOfPayments) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = Math.min(totalMonthlyPayment - interestPayment, remainingBalance)
      
      remainingBalance -= principalPayment
      totalInterestPaid += interestPayment
      
      schedule.balance.push(remainingBalance)
      schedule.principal.push(principalPayment)
      schedule.interest.push(interestPayment)
      
      month++
    }
    
    payoffMonths = month
    
    // Calculate payoff date
    const payoffDateValue = new Date()
    payoffDateValue.setMonth(payoffDateValue.getMonth() + payoffMonths)
    
    // Generate comparison data for all repayment plans
    const plans: RepaymentPlan[] = ['standard', 'graduated', 'extended', 'income-driven']
    const comparisonData = plans.map(plan => {
      let payment = 0
      let totalInt = 0
      let months = numberOfPayments
      
      switch (plan) {
        case 'standard': {
          payment = effectiveLoanAmount * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
          totalInt = (payment * numberOfPayments) - effectiveLoanAmount
          break
        }
        case 'graduated': {
          const standardPmt = effectiveLoanAmount * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
          payment = standardPmt * 0.5
          totalInt = (payment * numberOfPayments * 1.5) - effectiveLoanAmount // Rough estimate
          break
        }
        case 'extended': {
          const extendedPayments = 300
          payment = effectiveLoanAmount * 
            (monthlyRate * Math.pow(1 + monthlyRate, extendedPayments)) / 
            (Math.pow(1 + monthlyRate, extendedPayments) - 1)
          totalInt = (payment * extendedPayments) - effectiveLoanAmount
          months = extendedPayments
          break
        }
        case 'income-driven': {
          const povertyLine = 13590
          const discretionaryIncome = Math.max(0, annualIncome - (povertyLine * 1.5))
          payment = (discretionaryIncome * 0.1) / 12
          totalInt = (payment * 240) - effectiveLoanAmount // Assumes 20-year forgiveness
          months = 240
          break
        }
      }
      
      return {
        plan,
        monthlyPayment: payment,
        totalInterest: totalInt,
        totalCost: effectiveLoanAmount + totalInt,
        payoffMonths: months
      }
    })
    
    // Update state
    setMonthlyPayment(totalMonthlyPayment)
    setTotalInterest(totalInterestPaid)
    setPayoffDate(payoffDateValue)
    setAmortizationSchedule(schedule)
    setRepaymentComparison(comparisonData)
    
  }, [
    loanAmount,
    interestRate,
    loanTerm,
    loanType,
    repaymentPlan,
    extraMonthlyPayment,
    loanFees,
    annualIncome,
    familySize
  ])

  // Chart colors
  const chartColors = {
    primary: [
      'rgba(99, 102, 241, 0.9)',
      'rgba(59, 130, 246, 0.9)',
      'rgba(14, 165, 233, 0.9)',
      'rgba(6, 182, 212, 0.9)',
      'rgba(20, 184, 166, 0.9)',
    ],
    secondary: [
      'rgba(99, 102, 241, 0.2)',
      'rgba(59, 130, 246, 0.2)',
      'rgba(14, 165, 233, 0.2)',
      'rgba(6, 182, 212, 0.2)',
      'rgba(20, 184, 166, 0.2)',
    ]
  }

  // Payment breakdown chart
  const pieChartData = {
    labels: ['Principal', 'Interest'],
    datasets: [{
      data: [loanAmount, totalInterest],
      backgroundColor: chartColors.primary.slice(0, 2),
      borderColor: chartColors.secondary.slice(0, 2).map(color => color.replace('0.2', '1')),
      borderWidth: 2
    }]
  }

  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => {
          return ((value / (loanAmount + totalInterest)) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Repayment plan comparison chart
  const comparisonChartData = {
    labels: repaymentComparison.map(plan => 
      plan.plan.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ),
    datasets: [
      {
        label: 'Monthly Payment',
        data: repaymentComparison.map(plan => plan.monthlyPayment),
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const comparisonChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => {
            return '$' + (typeof value === 'number' ? value.toLocaleString() : value)
          }
        }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => '$' + value.toFixed(0)
      }
    }
  }

  // Amortization schedule chart
  const amortizationChartData = {
    labels: Array.from({ length: Math.ceil(amortizationSchedule.balance.length / 12) }, (_, i) => `Year ${i + 1}`),
    datasets: [
      {
        label: 'Loan Balance',
        data: amortizationSchedule.balance.filter((_, i) => i % 12 === 0),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      },
      {
        label: 'Principal Paid',
        data: amortizationSchedule.principal.filter((_, i) => i % 12 === 0),
        borderColor: chartColors.primary[1],
        backgroundColor: chartColors.secondary[1],
        tension: 0.4
      },
      {
        label: 'Interest Paid',
        data: amortizationSchedule.interest.filter((_, i) => i % 12 === 0),
        borderColor: chartColors.primary[2],
        backgroundColor: chartColors.secondary[2],
        tension: 0.4
      }
    ]
  }

  const amortizationChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => {
            return '$' + (typeof value === 'number' ? value.toLocaleString() : value)
          }
        }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const exportPDF = async () => {
    const element = document.getElementById('results-section')
    if (!element) return
    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save('student-loan-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <StudentLoanSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Student Loan <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your student loan payments, compare repayment plans, and understand the total cost of your education financing.
      </p>
    </div>
  </div>
</section>


        {/* Calculator Section */}
        <section className="py-12">
          <div className="container max-w-[1200px] px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Loan Details</CardTitle>
                    <CardDescription>
                      Provide information about your student loans to calculate payments and explore repayment options.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Loan Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Loan Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="loan-amount">Loan Amount</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="loan-amount"
                              type="number"
                              className="pl-9"
                              value={loanAmount}
                              onChange={(e) => setLoanAmount(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interest-rate">Interest Rate</Label>
                            <span className="text-sm text-muted-foreground">{interestRate}%</span>
                          </div>
                          <Slider
                            id="interest-rate"
                            min={1}
                            max={12}
                            step={0.1}
                            value={[interestRate]}
                            onValueChange={(value) => setInterestRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loan-type">Loan Type</Label>
                          <Select value={loanType} onValueChange={(value) => setLoanType(value as LoanType)}>
                            <SelectTrigger id="loan-type">
                              <SelectValue placeholder="Select loan type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="federal">Federal Loan</SelectItem>
                              <SelectItem value="private">Private Loan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="repayment-plan">Repayment Plan</Label>
                          <Select value={repaymentPlan} onValueChange={(value) => setRepaymentPlan(value as RepaymentPlan)}>
                            <SelectTrigger id="repayment-plan">
                              <SelectValue placeholder="Select repayment plan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="graduated">Graduated</SelectItem>
                              <SelectItem value="extended">Extended</SelectItem>
                              <SelectItem value="income-driven">Income-Driven</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loan-term">Loan Term (Years)</Label>
                          <Select value={String(loanTerm)} onValueChange={(value) => setLoanTerm(Number(value))}>
                            <SelectTrigger id="loan-term">
                              <SelectValue placeholder="Select loan term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 Years</SelectItem>
                              <SelectItem value="15">15 Years</SelectItem>
                              <SelectItem value="20">20 Years</SelectItem>
                              <SelectItem value="25">25 Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Grace Period & Fees */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Grace Period & Fees</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="grace-period">In Grace Period</Label>
                            <Switch
                              id="grace-period"
                              checked={inGracePeriod}
                              onCheckedChange={setInGracePeriod}
                            />
                          </div>
                          {inGracePeriod && (
                            <div className="space-y-2">
                              <Label htmlFor="grace-months">Months Remaining</Label>
                              <Input
                                id="grace-months"
                                type="number"
                                value={gracePeriodMonths}
                                onChange={(e) => setGracePeriodMonths(Number(e.target.value))}
                                min={1}
                                max={6}
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loan-fees">Loan Fees</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="loan-fees"
                              type="number"
                              className="pl-9"
                              value={loanFees}
                              onChange={(e) => setLoanFees(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Income-Driven Details */}
                    {repaymentPlan === 'income-driven' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Income Details</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="annual-income">Annual Income</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="annual-income"
                                type="number"
                                className="pl-9"
                                value={annualIncome}
                                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="family-size">Family Size</Label>
                            <Input
                              id="family-size"
                              type="number"
                              value={familySize}
                              onChange={(e) => setFamilySize(Number(e.target.value))}
                              min={1}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="income-growth">Expected Annual Income Growth</Label>
                              <span className="text-sm text-muted-foreground">{incomeGrowthRate}%</span>
                            </div>
                            <Slider
                              id="income-growth"
                              min={0}
                              max={10}
                              step={0.5}
                              value={[incomeGrowthRate]}
                              onValueChange={(value) => setIncomeGrowthRate(value[0])}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Extra Payments */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Extra Payments</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="extra-payment">Extra Monthly Payment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="extra-payment"
                              type="number"
                              className="pl-9"
                              value={extraMonthlyPayment}
                              onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Additional amount to pay towards principal each month
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div id="results-section" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Results</CardTitle>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={exportPDF}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export as PDF</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(monthlyPayment)}</p>
                      {extraMonthlyPayment > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Including {formatCurrency(extraMonthlyPayment)} extra monthly payment
                        </p>
                      )}
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Loan Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Principal Amount</span>
                              <span className="font-medium">{formatCurrency(loanAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Interest</span>
                              <span className="font-medium">{formatCurrency(totalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Loan Fees</span>
                              <span className="font-medium">{formatCurrency(loanFees)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Cost</span>
                              <span>{formatCurrency(loanAmount + totalInterest + loanFees)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={comparisonChartData} options={comparisonChartOptions} />
                
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Repayment Plan Comparison</h4>
                          <div className="grid gap-2">
                            {repaymentComparison.map((plan) => (
                              <div key={plan.plan} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <div>
                                  <span className="text-sm font-medium">
                                    {plan.plan.split('-').map(word => 
                                      word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                  </span>
                                  <p className="text-xs text-muted-foreground">
                                    {Math.floor(plan.payoffMonths / 12)} years
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{formatCurrency(plan.monthlyPayment)}/mo</div>
                                  <div className="text-xs text-muted-foreground">
                                    Total: {formatCurrency(plan.totalCost)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="schedule" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={amortizationChartData} options={amortizationChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Loan Payoff Details</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Estimated Payoff Date</span>
                              <span className="font-medium">{formatDate(payoffDate)}</span>
                            </div>
                            {extraMonthlyPayment > 0 && (
                              <div className="flex items-start gap-2 bg-primary/10 p-4 rounded-lg">
                                <Info className="h-4 w-4 mt-1 text-primary" />
                                <div>
                                  <p className="font-medium">Early Payoff Analysis</p>
                                  <p className="text-sm text-muted-foreground">
                                    By paying an extra {formatCurrency(extraMonthlyPayment)} per month, 
                                    you'll save {formatCurrency(totalInterest)} in interest and pay off your loan{' '}
                                    {Math.floor((loanTerm * 12 - amortizationSchedule.balance.length) / 12)} years 
                                    and {(loanTerm * 12 - amortizationSchedule.balance.length) % 12} months earlier.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Loan Details Summary */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <GraduationCap className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Loan Summary</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• {formatCurrency(monthlyPayment)} monthly payment</li>
                              <li>• {loanTerm} year {loanType} loan at {interestRate}% APR</li>
                              <li>• {repaymentPlan.split('-').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')} repayment plan</li>
                              {inGracePeriod && (
                                <li>• {gracePeriodMonths} months remaining in grace period</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
<section id="blog-section" className="py-12 bg-white dark:bg-black">
  <div className="container mx-auto max-w-5xl px-4">
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1 text-center">
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Financial Education</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Navigating Student Loan Decisions</h2>
        <p className="mt-3 text-muted-foreground text-lg">Understanding the real cost of education and optimizing your repayment strategy</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            The Student Loan Landscape
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                In 2025, Americans collectively owe over <strong>$1.9 trillion</strong> in student loan debt, with the average bachelor's degree graduate carrying approximately <strong>$37,500</strong> in educational debt at graduation.
              </p>
              <p className="mt-2">
                Student loans represent a significant financial commitment that can impact your economic well-being for decades after graduation, affecting decisions from career choices to homeownership and retirement planning.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Key Student Loan Statistics</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>• Average time to full repayment: 20 years</li>
                  <li>• Median monthly payment: $222 - $393</li>
                  <li>• Graduates spending {'>'}10% of income on loans: 37%</li>
                  <li>• Default rate within 5 years: 15.5%</li>
                </ul>
              </div>
            </div>
            
            <div className="h-[250px]">
              <h4 className="text-center text-sm font-medium mb-2">Average Student Debt by Degree Type</h4>
              <Bar 
                data={{
                  labels: ['Associate\'s', 'Bachelor\'s', 'Master\'s', 'Professional', 'Doctoral'],
                  datasets: [{
                    label: 'Average Debt',
                    data: [17500, 37500, 71000, 146000, 108400],
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.7)',
                      'rgba(99, 102, 241, 0.7)',
                      'rgba(139, 92, 246, 0.7)',
                      'rgba(168, 85, 247, 0.7)',
                      'rgba(217, 70, 239, 0.7)'
                    ],
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { callback: (value) => '$' + value.toLocaleString() }
                    }
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Federal vs Private Loans Comparison */}
      <div className="mb-10" id="loan-types">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Scale className="h-6 w-6 text-blue-600" />
          Federal vs. Private Student Loans
        </h2>
        
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Feature</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Federal Loans</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Private Loans</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Interest Rates</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Fixed (4.99% - 7.54% for 2024-2025)</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Fixed or Variable (3.22% - 14.96%)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Credit Check</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Not needed (except PLUS loans)</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Required; rates based on credit score</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Repayment Plans</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Multiple income-driven options</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Limited; varies by lender</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Forgiveness Options</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">PSLF, IDR forgiveness, disability</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Rarely available</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Deferment/Forbearance</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Multiple options; standardized</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Limited; lender discretion</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Subsidy Options</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Subsidized loans available</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">No interest subsidies</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-blue-600" />
                Federal Student Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-[180px]">
                  <Pie 
                    data={{
                      labels: ['Direct Subsidized', 'Direct Unsubsidized', 'PLUS Loans', 'Perkins/Other'],
                      datasets: [{
                        data: [39, 42, 17, 2],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(99, 102, 241, 0.8)',
                          'rgba(139, 92, 246, 0.8)',
                          'rgba(168, 85, 247, 0.8)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8 } }
                      }
                    }}
                  />
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Best for:</strong> Most students should maximize federal loans first due to their flexible repayment options, forgiveness programs, and borrower protections.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Private Student Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-[180px]">
                  <Bar 
                    data={{
                      labels: ['Excellent (750+)', 'Good (700-749)', 'Fair (650-699)', 'Poor (<650)'],
                      datasets: [{
                        label: 'Avg Interest Rate',
                        data: [5.2, 7.5, 10.3, 13.4],
                        backgroundColor: [
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(245, 158, 11, 0.8)',
                          'rgba(239, 68, 68, 0.8)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => value + '%' }
                        }
                      }
                    }}
                  />
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Consider for:</strong> Gap financing after maxing federal options or if you have excellent credit and can secure rates lower than federal options.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real Cost of Student Loans */}
      <div className="mb-10" id="loan-cost">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl">Understanding the True Cost of Student Loans</span>
              </div>
            </CardTitle>
            <CardDescription>
              How time, interest rates, and repayment plans affect your total repayment
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="compounding-effects" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                <Percent className="h-5 w-5" />
                The Impact of Interest Accrual
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    Many students underestimate the long-term impact of interest that begins accruing while still in school, particularly on unsubsidized loans.
                  </p>
                  
                  <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900 rounded-lg">
                    <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Example: $30,000 Unsubsidized Loan at 5.5%</h4>
                    <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-400">
                      <li>• 4-year college program + 6-month grace period</li>
                      <li>• Interest accrued before repayment: $7,425</li>
                      <li>• Balance at repayment start: $37,425</li>
                      <li>• Standard 10-year repayment: $407/month</li>
                      <li>• Total paid over loan term: $48,840</li>
                    </ul>
                    <p className="text-sm mt-2 text-purple-600 dark:text-purple-500">
                      <strong>That's $18,840 (63%) more than the original loan amount.</strong>
                    </p>
                  </div>
                </div>
                
                <div className="h-[250px]">
                  <Line 
                    data={{
                      labels: ['Start', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10'],
                      datasets: [
                        {
                          label: 'Original Principal',
                          data: [30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000],
                          borderColor: 'rgba(124, 58, 237, 0.5)',
                          backgroundColor: 'rgba(124, 58, 237, 0.1)',
                          borderDash: [5, 5]
                        },
                        {
                          label: 'Total Repayment',
                          data: [30000, 34884, 39768, 44652, 48840, 48840, 48840, 48840, 48840, 48840, 48840],
                          borderColor: 'rgba(79, 70, 229, 1)',
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900 mt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">Interest Capitalization Alert</p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                      When unpaid interest is added to your principal balance (capitalization), you begin paying interest on your interest. This typically occurs when you enter repayment, change repayment plans, or exit forbearance/deferment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="mb-6">
              <h3 id="repayment-plans" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Comparing Repayment Plans
              </h3>
              
              <div className="h-[300px] mb-6">
                <Line 
                  data={{
                    labels: ['Start', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25'],
                    datasets: [
                      {
                        label: 'Standard (10-Year)',
                        data: [37425, 21990, 0, 0, 0, 0],
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                      },
                      {
                        label: 'Extended (25-Year)',
                        data: [37425, 32820, 26978, 19512, 9911, 0],
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                      },
                      {
                        label: 'Income-Based (4% discretionary)',
                        data: [37425, 33000, 27500, 20100, 10200, 0],
                        borderColor: 'rgba(139, 92, 246, 1)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderDash: [5, 5],
                        tension: 0.4
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { callback: (value) => '$' + value.toLocaleString() }
                      }
                    }
                  }}
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse border border-gray-200 dark:border-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Repayment Plan</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Monthly Payment</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Total Paid</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Repayment Period</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium text-blue-600">Standard</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">$407</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">$48,840</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">10 years</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Lowest total cost; stable budget</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium text-blue-600">Extended</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">$232</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">$69,600</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">25 years</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Lower monthly payments</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium text-blue-600">Graduated</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">$229-$687</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">$55,156</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">10 years</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Expected income growth</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium text-blue-600">Income-Based*</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Varies</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Varies</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">20-25 years</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Low income; PSLF eligibility</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">*Income-Based Repayment amounts depend on your discretionary income and family size; potential forgiveness after 20-25 years of payments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repayment Strategies */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600" />
          Strategic Loan Repayment Approaches
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="text-lg">Avalanche Method</CardTitle>
              <CardDescription>Focus on highest interest rate first</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="h-[180px]">
                  <Bar 
                    data={{
                      labels: ['Before', 'After 1 Year', 'After 2 Years', 'After 3 Years'],
                      datasets: [
                        {
                          label: 'Private Loan (7.5%)',
                          data: [15000, 8000, 0, 0],
                          backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        },
                        {
                          label: 'Unsubsidized (5.5%)',
                          data: [12000, 12000, 7000, 0],
                          backgroundColor: 'rgba(245, 158, 11, 0.7)',
                        },
                        {
                          label: 'Subsidized (4.5%)',
                          data: [10500, 10500, 10500, 8000],
                          backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: { stacked: true },
                        y: { stacked: true, ticks: { callback: (value) => '$' + value.toLocaleString() } }
                      }
                    }}
                  />
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Best for:</strong> Mathematically optimizing interest savings. Make minimum payments on all loans, then apply extra payments to the highest interest loan first.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-green-50 dark:bg-green-900/30">
              <CardTitle className="text-lg">Refinancing Strategy</CardTitle>
              <CardDescription>Lower rates for qualified borrowers</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="h-[180px]">
                  <Line 
                    data={{
                      labels: ['Year 1', 'Year 3', 'Year 5', 'Year 7', 'Year 10'],
                      datasets: [
                        {
                          label: 'Original Loans (6.8% avg)',
                          data: [37500, 31245, 24100, 15800, 0],
                          borderColor: 'rgba(239, 68, 68, 0.8)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        },
                        {
                          label: 'After Refinancing (4.5%)',
                          data: [37500, 29650, 21050, 11600, 0],
                          borderColor: 'rgba(16, 185, 129, 0.8)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10 } }
                      }
                    }}
                  />
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Best for:</strong> Borrowers with strong income, excellent credit, and no need for federal loan benefits. Potential savings: $7,500+ on a $37,500 loan.
                  </p>
                </div>
                
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>Warning:</strong> Refinancing federal loans with private lenders permanently removes access to income-driven repayment plans, forgiveness programs, and federal forbearance options.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Loan Forgiveness Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Public Service Loan Forgiveness (PSLF)</h4>
                <p className="text-sm mb-3">
                  For employees of government or qualifying non-profit organizations who make 120 qualifying payments (10 years) while employed full-time.
                </p>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Key Advantages:</strong> Tax-free forgiveness of remaining balance after 10 years; potentially substantial savings for those with high debt-to-income ratios.
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Income-Driven Forgiveness</h4>
                <p className="text-sm mb-3">
                  After 20-25 years of qualifying payments in an income-driven repayment plan, remaining balance is forgiven (though potentially taxable).
                </p>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Best for:</strong> Borrowers with high debt relative to income who don't qualify for PSLF. New SAVE plan can forgive undergraduate loans in as few as 10 years.
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Teacher Loan Forgiveness</h4>
                <p className="text-sm mb-3">
                  Up to $17,500 in forgiveness for highly qualified teachers working for five consecutive years in low-income schools.
                </p>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Note:</strong> Math, science, and special education teachers at secondary level qualify for maximum amount; other teachers limited to $5,000.
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Healthcare Profession Forgiveness</h4>
                <p className="text-sm mb-3">
                  Multiple programs for healthcare providers working in underserved areas, including NHSC and Nurse Corps, offering up to $100,000+ in forgiveness.
                </p>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Requirements:</strong> Typically 2-3 year service commitments in Health Professional Shortage Areas (HPSAs) or at Critical Access Hospitals.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Mistakes */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Avoiding Student Loan Pitfalls
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader className="bg-amber-50 dark:bg-amber-900/30">
              <CardTitle className="text-lg">Borrowing Mistakes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Borrowing the maximum offered</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Taking all available funds without considering actual needs creates unnecessary debt burden.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Ignoring interest while in school</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Unsubsidized loan interest accumulates during school and grace periods, significantly increasing your balance.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Not researching career earning potential</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Borrowing $80,000+ for a degree leading to a $40,000 salary creates severe financial strain.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader className="bg-amber-50 dark:bg-amber-900/30">
              <CardTitle className="text-lg">Repayment Mistakes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Missing out on forgiveness opportunities</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Not investigating PSLF or income-driven forgiveness when eligible could cost thousands.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Refinancing federal loans without consideration</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Trading federal protections for slightly lower rates often isn't worth the permanent loss of benefits.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Ignoring income-driven options during hardship</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Defaulting instead of enrolling in income-based plans (which can offer payments as low as $0) damages credit unnecessarily.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Taking Control of Your Student Loan Journey
            </CardTitle>
            <CardDescription>
              From education financing to debt freedom
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Student loans</strong> are a significant financial commitment that require careful planning both before borrowing and during repayment. By understanding your options, calculating the true costs, and creating a strategic repayment plan, you can minimize the impact on your financial future while maximizing the value of your education.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">If You're Still in School</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Borrow only what you need, not what's offered</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Consider making interest-only payments while studying</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Maximize scholarships, grants and work-study options</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">If You're in Repayment</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Evaluate forgiveness eligibility before refinancing</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Consider the avalanche method for fastest debt reduction</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Enroll in autopay for a 0.25% interest rate reduction</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to optimize your student loan strategy?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Student Loan Calculator</strong> above to create a personalized repayment plan. For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/loan-payoff">
                        <BadgeDollarSign className="h-4 w-4 mr-1" />
                        Loan Payoff Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/budget">
                        <Wallet className="h-4 w-4 mr-1" />
                        Budget Planning
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <Clock className="h-4 w-4 mr-1" />
                        Retirement Calculator
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</section>

        {/* Related Calculators */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Related Calculators</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">College Cost Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Estimate the total cost of college education and plan for savings.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/college-cost">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Debt-to-Income Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate your debt-to-income ratio to understand your financial health.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/debt-to-income">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Debt Payoff Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create a strategy to pay off your student loans and other debts efficiently.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/debt-payoff">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}