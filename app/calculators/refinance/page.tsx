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
import {
  DollarSign,
  Calculator,
  Download,
  Share2,
  PieChart,
  BarChart3,
  RefreshCw,
  TrendingUp,
  LineChart,
  Info,
  AlertCircle,
  Clock,
  Check,
  Percent,
  Home,
  Users,
  ArrowDown,
  ArrowRight,
  ArrowUp
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import RefinanceSchema from './schema';

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

export default function RefinanceCalculator() {
  // Current Loan State
  const [currentLoanAmount, setCurrentLoanAmount] = useState(300000)
  const [currentInterestRate, setCurrentInterestRate] = useState(6.5)
  const [currentLoanTerm, setCurrentLoanTerm] = useState(30)
  const [remainingBalance, setRemainingBalance] = useState(275000)
  const [monthsRemaining, setMonthsRemaining] = useState(324) // 27 years
  const [currentMonthlyPayment, setCurrentMonthlyPayment] = useState(0)

  // New Loan State
  const [newLoanAmount, setNewLoanAmount] = useState(275000)
  const [newInterestRate, setNewInterestRate] = useState(5.5)
  const [newLoanTerm, setNewLoanTerm] = useState(30)
  const [closingCosts, setClosingCosts] = useState(5500)
  const [includeClosingCosts, setIncludeClosingCosts] = useState(true)
  const [cashOut, setCashOut] = useState(0)
  const [refinanceType, setRefinanceType] = useState("rate-and-term")

  // Results State
  const [newMonthlyPayment, setNewMonthlyPayment] = useState(0)
  const [monthlySavings, setMonthlySavings] = useState(0)
  const [breakEvenMonths, setBreakEvenMonths] = useState(0)
  const [totalSavings, setTotalSavings] = useState(0)
  const [amortizationSchedule, setAmortizationSchedule] = useState<{
    current: { balance: number; interest: number; principal: number }[];
    new: { balance: number; interest: number; principal: number }[];
  }>({
    current: [],
    new: []
  })

  // Calculate monthly payment
  const calculateMonthlyPayment = (principal: number, rate: number, term: number) => {
    const monthlyRate = rate / 100 / 12
    const numberOfPayments = term * 12
    
    return principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  }

  // Calculate amortization schedule
  const calculateAmortizationSchedule = (
    principal: number, 
    rate: number, 
    term: number
  ) => {
    const monthlyRate = rate / 100 / 12
    const monthlyPayment = calculateMonthlyPayment(principal, rate, term)
    const schedule = []
    let balance = principal
    
    for (let i = 0; i < term * 12; i++) {
      const interest = balance * monthlyRate
      const principalPayment = monthlyPayment - interest
      balance -= principalPayment
      
      schedule.push({
        balance: Math.max(0, balance),
        interest,
        principal: principalPayment
      })
    }
    
    return schedule
  }

  // Update calculations when inputs change
  useEffect(() => {
    // Calculate current loan details
    const currentMonthlyPmt = calculateMonthlyPayment(
      currentLoanAmount,
      currentInterestRate,
      currentLoanTerm
    )
    setCurrentMonthlyPayment(currentMonthlyPmt)

    // Calculate new loan details
    const totalNewLoanAmount = includeClosingCosts 
      ? newLoanAmount + closingCosts + cashOut
      : newLoanAmount + cashOut
      
    const newMonthlyPmt = calculateMonthlyPayment(
      totalNewLoanAmount,
      newInterestRate,
      newLoanTerm
    )
    setNewMonthlyPayment(newMonthlyPmt)

    // Calculate savings
    const monthlySavingsAmount = currentMonthlyPmt - newMonthlyPmt
    setMonthlySavings(monthlySavingsAmount)

    // Calculate break-even period
    const breakEvenPeriod = closingCosts / monthlySavingsAmount
    setBreakEvenMonths(breakEvenPeriod)

    // Calculate total savings
    const currentTotalPayments = currentMonthlyPmt * monthsRemaining
    const newTotalPayments = newMonthlyPmt * (newLoanTerm * 12)
    setTotalSavings(currentTotalPayments - newTotalPayments)

    // Generate amortization schedules
    const currentSchedule = calculateAmortizationSchedule(
      remainingBalance,
      currentInterestRate,
      monthsRemaining / 12
    )
    
    const newSchedule = calculateAmortizationSchedule(
      totalNewLoanAmount,
      newInterestRate,
      newLoanTerm
    )

    setAmortizationSchedule({
      current: currentSchedule,
      new: newSchedule
    })

  }, [
    currentLoanAmount,
    currentInterestRate,
    currentLoanTerm,
    remainingBalance,
    monthsRemaining,
    newLoanAmount,
    newInterestRate,
    newLoanTerm,
    closingCosts,
    includeClosingCosts,
    cashOut
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

  // Generate comparison chart data
  const comparisonChartData = {
    labels: ['Monthly Payment', 'Total Interest', 'Loan Balance'],
    datasets: [
      {
        label: 'Current Loan',
        data: [
          currentMonthlyPayment,
          currentMonthlyPayment * monthsRemaining - remainingBalance,
          remainingBalance
        ],
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'New Loan',
        data: [
          newMonthlyPayment,
          newMonthlyPayment * (newLoanTerm * 12) - newLoanAmount,
          newLoanAmount + (includeClosingCosts ? closingCosts : 0) + cashOut
        ],
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
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
        formatter: (value: number) => '$' + value.toLocaleString()
      }
    }
  }

  // Generate balance over time chart data
  const generateBalanceOverTime = () => {
    const years = Array.from({ length: Math.ceil(Math.max(monthsRemaining, newLoanTerm * 12) / 12) }, (_, i) => i + 1)
    
    return {
      labels: years.map(y => `Year ${y}`),
      datasets: [
        {
          label: 'Current Loan Balance',
          data: years.map((_, i) => {
            const monthIndex = i * 12
            return monthIndex < amortizationSchedule.current.length 
              ? amortizationSchedule.current[monthIndex].balance 
              : 0
          }),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'New Loan Balance',
          data: years.map((_, i) => {
            const monthIndex = i * 12
            return monthIndex < amortizationSchedule.new.length 
              ? amortizationSchedule.new[monthIndex].balance 
              : 0
          }),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4
        }
      ]
    }
  }

  const balanceChartOptions: ChartOptions<'line'> = {
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
    pdf.save('refinance-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <RefinanceSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Refinance <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Determine if refinancing your mortgage makes financial sense by comparing your current loan with potential new terms.
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
                      Provide information about your current mortgage and potential refinance terms.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Current Loan Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Current Loan Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="current-loan-amount">Original Loan Amount</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="current-loan-amount"
                              type="number"
                              className="pl-9"
                              value={currentLoanAmount}
                              onChange={(e) => setCurrentLoanAmount(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="remaining-balance">Current Loan Balance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="remaining-balance"
                              type="number"
                              className="pl-9"
                              value={remainingBalance}
                              onChange={(e) => setRemainingBalance(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="current-interest-rate">Current Interest Rate</Label>
                            <span className="text-sm text-muted-foreground">{currentInterestRate}%</span>
                          </div>
                          <Slider
                            id="current-interest-rate"
                            min={2}
                            max={10}
                            step={0.125}
                            value={[currentInterestRate]}
                            onValueChange={(value) => setCurrentInterestRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="months-remaining">Months Remaining</Label>
                          <Input
                            id="months-remaining"
                            type="number"
                            value={monthsRemaining}
                            onChange={(e) => setMonthsRemaining(Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* New Loan Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">New Loan Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="refinance-type">Refinance Type</Label>
                          <Select value={refinanceType} onValueChange={setRefinanceType}>
                            <SelectTrigger id="refinance-type">
                              <SelectValue placeholder="Select refinance type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rate-and-term">Rate & Term Refinance</SelectItem>
                              <SelectItem value="cash-out">Cash-Out Refinance</SelectItem>
                              <SelectItem value="fha">FHA Streamline Refinance</SelectItem>
                              <SelectItem value="va">VA IRRRL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-loan-term">New Loan Term</Label>
                          <Select value={String(newLoanTerm)} onValueChange={(value) => setNewLoanTerm(Number(value))}>
                            <SelectTrigger id="new-loan-term">
                              <SelectValue placeholder="Select loan term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 Years</SelectItem>
                              <SelectItem value="20">20 Years</SelectItem>
                              <SelectItem value="15">15 Years</SelectItem>
                              <SelectItem value="10">10 Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="new-interest-rate">New Interest Rate</Label>
                            <span className="text-sm text-muted-foreground">{newInterestRate}%</span>
                          </div>
                          <Slider
                            id="new-interest-rate"
                            min={2}
                            max={10}
                            step={0.125}
                            value={[newInterestRate]}
                            onValueChange={(value) => setNewInterestRate(value[0])}
                          />
                        </div>
                        {refinanceType === "cash-out" && (
                          <div className="space-y-2">
                            <Label htmlFor="cash-out">Cash-Out Amount</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="cash-out"
                                type="number"
                                className="pl-9"
                                value={cashOut}
                                onChange={(e) => setCashOut(Number(e.target.value))}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Closing Costs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Closing Costs</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="closing-costs">Estimated Closing Costs</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="closing-costs"
                              type="number"
                              className="pl-9"
                              value={closingCosts}
                              onChange={(e) => setClosingCosts(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="include-closing-costs">Include in New Loan</Label>
                            <Switch
                              id="include-closing-costs"
                              checked={includeClosingCosts}
                              onCheckedChange={setIncludeClosingCosts}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Roll closing costs into the new loan amount
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
                    {/* Monthly Payment Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Current Payment</p>
                        <p className="text-2xl font-bold">{formatCurrency(currentMonthlyPayment)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">New Payment</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(newMonthlyPayment)}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Key Metrics */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Monthly Savings</span>
                        <span className="font-medium text-primary">
                          {formatCurrency(Math.max(0, monthlySavings))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Break-Even Period</span>
                        <span className="font-medium">
                          {breakEvenMonths > 0 ? `${Math.ceil(breakEvenMonths)} months` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Savings</span>
                        <span className="font-medium text-primary">
                          {formatCurrency(Math.max(0, totalSavings))}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    {/* Charts */}
                    <Tabs defaultValue="comparison" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                        <TabsTrigger value="balance">Balance Over Time</TabsTrigger>
                      </TabsList>
                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={comparisonChartData} options={comparisonChartOptions} />
                        </div>
                      </TabsContent>
                      <TabsContent value="balance" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateBalanceOverTime()} options={balanceChartOptions} />
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Recommendations */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          {monthlySavings > 0 ? (
                            <>
                              <Info className="h-4 w-4 mt-1 text-primary" />
                              <div className="space-y-1">
                                <p className="font-medium">Refinancing Recommended</p>
                                <p className="text-sm text-muted-foreground">
                                  You could save {formatCurrency(monthlySavings)} per month. 
                                  Break-even period is {Math.ceil(breakEvenMonths)} months.
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 mt-1 text-destructive" />
                              <div className="space-y-1">
                                <p className="font-medium">Refinancing Not Recommended</p>
                                <p className="text-sm text-muted-foreground">
                                  The new loan terms would increase your monthly payment.
                                  Consider adjusting the terms or waiting for better rates.
                                </p>
                              </div>
                            </>
                          )}
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Mortgage Resource</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Refinance Calculator: Is It Time to Refinance Your Mortgage?</h2>
        <p className="mt-3 text-muted-foreground text-lg">Make data-driven decisions about refinancing to potentially save thousands</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Mortgage Refinancing
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                A <strong>Refinance Calculator</strong> is an essential tool for homeowners considering replacing their current mortgage with a new loan. Refinancing can help you secure a lower interest rate, reduce monthly payments, shorten your loan term, tap into home equity, or change loan types—but determining if it's financially beneficial requires careful analysis.
              </p>
              <p className="mt-3">
                Using a refinance calculator helps you:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Calculate potential monthly payment savings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Determine your break-even point for refinance costs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Compare different loan terms and their long-term impact</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Analyze the total interest saved over the life of the loan</span>
                </li>
              </ul>
              <p>
                Making an informed refinancing decision could potentially save you tens of thousands of dollars over your loan term, but timing and market conditions are critical factors to consider.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Refinance Rate Trends</h3>
                <div className="h-[200px]">
                  <Line 
                    data={{
                      labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
                      datasets: [
                        {
                          label: '30-Year Fixed Rate',
                          data: [3.94, 3.11, 2.96, 5.34, 6.61, 5.89, 5.41],
                          borderColor: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4
                        },
                        {
                          label: '15-Year Fixed Rate',
                          data: [3.39, 2.61, 2.27, 4.77, 5.78, 5.12, 4.72],
                          borderColor: 'rgba(16, 185, 129, 0.8)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }
                      },
                      scales: {
                        y: {
                          title: { display: true, text: 'Interest Rate (%)' },
                          min: 2,
                          max: 7
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Historical mortgage rates and recent trends</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> Refinancing typically costs between 2-5% of the loan's principal. For a $300,000 mortgage, that's $6,000-$15,000 in closing costs that should be factored into your decision.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refinance Decision Factors Section */}
      <div className="mb-10" id="refinance-factors">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Key Factors in Your Refinance Decision
        </h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="break-even-point" className="font-bold text-xl mb-4">The Break-Even Point: When Refinancing Makes Financial Sense</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-4">
                The <strong>break-even point</strong> is perhaps the most critical metric in determining whether refinancing is worth it. It represents how long you need to keep your refinanced loan before the monthly savings offset the closing costs.
              </p>
              
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                <div className="font-medium text-blue-700 dark:text-blue-400 mb-2">How to calculate your break-even point:</div>
                <ol className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">1</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Calculate total refinancing costs</p>
                      <p className="text-blue-700 dark:text-blue-400">All closing costs, fees, and points</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">2</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Calculate monthly savings</p>
                      <p className="text-blue-700 dark:text-blue-400">Current monthly payment - New monthly payment</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">3</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Divide costs by monthly savings</p>
                      <p className="text-blue-700 dark:text-blue-400">Break-even (months) = Total costs ÷ Monthly savings</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
            
            <div>
              <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h4 className="font-medium mb-3">Break-Even Point Example</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="font-medium">Original Loan:</p>
                      <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <p>$300,000 at 6.5%</p>
                        <p>30-year fixed rate</p>
                        <p>$1,896/month payment</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-medium">Refinanced Loan:</p>
                      <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <p>$290,000 at 5.5%</p>
                        <p>30-year fixed rate</p>
                        <p>$1,647/month payment</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monthly savings:</span>
                      <span className="font-medium">$249</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refinance costs (3%):</span>
                      <span className="font-medium">$8,700</span>
                    </div>
                    <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <span className="font-medium">Break-even point:</span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">35 months</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">If you plan to stay in your home longer than the break-even point (35 months in this example), refinancing likely makes financial sense.</p>
                </div>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Rule of Thumb:</strong> A refinance typically makes sense if you can lower your interest rate by at least 0.5%-1% and plan to stay in your home past the break-even point.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h3 id="rate-reduction" className="font-bold text-xl mt-8 mb-4">Rate Reduction and Long-Term Savings</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3">
                Even a seemingly small interest rate reduction can translate into significant savings over the life of your mortgage. Here's how different rate reductions impact a $300,000, 30-year mortgage:
              </p>
              
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-50 dark:bg-blue-900/30">
                      <th className="border border-blue-200 dark:border-blue-800 px-3 py-2 text-left">Rate Reduction</th>
                      <th className="border border-blue-200 dark:border-blue-800 px-3 py-2 text-left">Monthly Savings</th>
                      <th className="border border-blue-200 dark:border-blue-800 px-3 py-2 text-left">Lifetime Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">0.5%</td>
                      <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">$87</td>
                      <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">$31,320</td>
                    </tr>
                    <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                      <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">1.0%</td>
                      <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">$178</td>
                      <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">$64,080</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">1.5%</td>
                      <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">$271</td>
                      <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">$97,560</td>
                    </tr>
                    <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                      <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">2.0%</td>
                      <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">$364</td>
                      <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">$131,040</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">*Based on a $300,000 loan with 30-year term, not accounting for refinance costs.</p>
            </div>
            
            <div className="space-y-6">
              <div className="h-[220px]">
                <Bar
                  data={{
                    labels: ['0.5%', '1.0%', '1.5%', '2.0%'],
                    datasets: [{
                      label: 'Lifetime Savings',
                      data: [31320, 64080, 97560, 131040],
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(59, 130, 246, 0.9)',
                        'rgba(59, 130, 246, 1.0)'
                      ]
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Lifetime Savings by Rate Reduction'
                      },
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(context.parsed.y);
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: function(value) {
                            return '$' + value.toLocaleString();
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Important:</strong> Don't focus solely on the monthly payment. A lower rate with a reset 30-year term could cost you more in interest over time if you've already paid several years on your current mortgage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Important Consideration:</strong> Your home's equity position affects your refinancing options. Typically, you need at least 20% equity to qualify for the best rates and avoid private mortgage insurance (PMI). If your home's value has increased since purchase, you may be in a better equity position than you realize.
            </p>
          </div>
        </div>
      </div>

      {/* Refinance Options Section */}
      <div className="mb-10" id="refinance-options">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Types of Refinancing Options</span>
              </div>
            </CardTitle>
            <CardDescription>
              Understanding different refinance strategies to select the best option for your goals
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="rate-term" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Rate-and-Term Refinancing
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">What It Is</h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      The most common type of refinance, where you replace your current mortgage with a new one that has a different interest rate, term length, or both—without changing the loan amount significantly.
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <h5 className="font-medium">Ideal for:</h5>
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 mt-0.5" />
                          <span>Lowering your interest rate to reduce monthly payments</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 mt-0.5" />
                          <span>Shortening your loan term to pay off mortgage faster</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 mt-0.5" />
                          <span>Switching from an adjustable-rate to fixed-rate mortgage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 mt-0.5" />
                          <span>Removing FHA mortgage insurance by refinancing to conventional</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Example Scenario</h4>
                    <div className="mt-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="font-medium text-green-700 dark:text-green-400">Current Loan:</div>
                        <div className="font-medium text-green-700 dark:text-green-400">New Loan:</div>
                        <div className="text-green-600 dark:text-green-500">$250,000 balance</div>
                        <div className="text-green-600 dark:text-green-500">$250,000 balance</div>
                        <div className="text-green-600 dark:text-green-500">6.5% interest rate</div>
                        <div className="text-green-600 dark:text-green-500">5.0% interest rate</div>
                        <div className="text-green-600 dark:text-green-500">20 years remaining</div>
                        <div className="text-green-600 dark:text-green-500">15-year term</div>
                        <div className="font-bold text-green-800 dark:text-green-300">$1,864/month</div>
                        <div className="font-bold text-green-800 dark:text-green-300">$1,976/month</div>
                      </div>
                      <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/40 rounded">
                        <p className="text-sm text-green-800 dark:text-green-300">
                          Result: Slightly higher payment, but saves $135,560 in interest and pays off 5 years sooner
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="cash-out" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cash-Out Refinancing
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">What It Is</h4>
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      A refinance where you borrow more than you currently owe on your mortgage and receive the difference in cash. This allows you to tap into your home equity for other financial needs.
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-blue-700 dark:text-blue-400">
                      <h5 className="font-medium">Ideal for:</h5>
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 mt-0.5" />
                          <span>Home improvements and renovations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 mt-0.5" />
                          <span>Consolidating high-interest debt</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 mt-0.5" />
                          <span>Funding major expenses (education, medical bills)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 mt-0.5" />
                          <span>Investment opportunities</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Example Scenario</h4>
                    <div className="mt-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="font-medium text-blue-700 dark:text-blue-400">Current Situation:</div>
                        <div className="font-medium text-blue-700 dark:text-blue-400">Cash-Out Refinance:</div>
                        <div className="text-blue-600 dark:text-blue-500">$200,000 loan balance</div>
                        <div className="text-blue-600 dark:text-blue-500">$260,000 new loan amount</div>
                        <div className="text-blue-600 dark:text-blue-500">Home value: $400,000</div>
                        <div className="text-blue-600 dark:text-blue-500">$60,000 cash received</div>
                        <div className="text-blue-600 dark:text-blue-500">6.0% interest rate</div>
                        <div className="text-blue-600 dark:text-blue-500">5.5% interest rate</div>
                        <div className="font-bold text-blue-800 dark:text-blue-300">$1,199/month</div>
                        <div className="font-bold text-blue-800 dark:text-blue-300">$1,477/month</div>
                      </div>
                      <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/40 rounded">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          Result: Increased monthly payment, but access to $60,000 for home improvements that could increase property value
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 id="streamline" className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-6 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Streamline Refinancing
                </h3>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <h4 className="font-medium text-purple-800 dark:text-purple-300">What It Is</h4>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    A simplified refinance program with reduced documentation and underwriting requirements, typically available for FHA, VA, and USDA loans. These programs often don't require a new appraisal or extensive income verification.
                  </p>
                  <div className="mt-3">
                    <h5 className="font-medium text-sm text-purple-700 dark:text-purple-400">Key benefits:</h5>
                    <div className="mt-2 grid gap-2">
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                        <span className="text-sm font-medium">Less documentation</span>
                        <span className="text-sm text-purple-600 dark:text-purple-400">Faster approval</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                        <span className="text-sm font-medium">No appraisal required</span>
                        <span className="text-sm text-purple-600 dark:text-purple-400">Lower costs</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                        <span className="text-sm font-medium">More flexible qualification</span>
                        <span className="text-sm text-purple-600 dark:text-purple-400">Accessible option</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Term-Change Strategies: Short vs. Long-Term
            </h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="bg-orange-50 dark:bg-orange-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowDown className="h-5 w-5 text-orange-600" />
                    Shortening Your Term
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <p>Refinancing from a 30-year to a 15-year loan can significantly reduce total interest paid.</p>
                  <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <p className="font-medium">Benefits:</p>
                    <ul className="space-y-1 mt-1">
                      <li>• Build equity faster</li>
                      <li>• Lower interest rates</li>
                      <li>• Pay off mortgage sooner</li>
                      <li>• Save tens of thousands in interest</li>
                    </ul>
                    <p className="mt-2 font-medium">Considerations:</p>
                    <ul className="space-y-1 mt-1">
                      <li>• Higher monthly payments</li>
                      <li>• Less payment flexibility</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                    Maintaining Your Term
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <p>
                    Refinancing to the same term length but at a lower rate can reduce your monthly payment.
                  </p>
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="font-medium">Benefits:</p>
                    <ul className="space-y-1 mt-1">
                      <li>• Lower monthly payments</li>
                      <li>• Improved cash flow</li>
                      <li>• Same payoff timeline</li>
                      <li>• Potential total interest savings</li>
                    </ul>
                    <p className="mt-2 font-medium">Considerations:</p>
                    <ul className="space-y-1 mt-1">
                      <li>• Moderate interest savings</li>
                      <li>• Break-even point is key</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowUp className="h-5 w-5 text-green-600" />
                    Extending Your Term
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <p>
                    Refinancing to a longer term can dramatically lower your monthly payment but may increase total interest paid.
                  </p>
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <p className="font-medium">Benefits:</p>
                    <ul className="space-y-1 mt-1">
                      <li>• Significantly reduced monthly payment</li>
                      <li>• Increased financial flexibility</li>
                      <li>• May free up cash for investments</li>
                      <li>• Can make voluntary extra payments</li>
                    </ul>
                    <p className="mt-2 font-medium">Considerations:</p>
                    <ul className="space-y-1 mt-1">
                      <li>• Higher total interest costs</li>
                      <li>• Longer debt timeline</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Loan Term Strategy Tip</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    If you refinance to a longer term for lower payments but can afford to pay more, consider making the same payments as your original loan. This gives you the flexibility of a lower required payment while still paying off your mortgage faster than the new schedule.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Refinance Scenarios Section */}
      <div className="mb-10" id="refinance-scenarios">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Common Refinance Scenarios: Is This You?
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Percent className="h-5 w-5 text-blue-600" />
                Scenario 1: Rate Drop Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border border-blue-100 dark:border-blue-800 rounded-md bg-blue-50/50 dark:bg-blue-900/20">
                <p className="font-medium text-blue-800 dark:text-blue-300">Profile:</p>
                <ul className="mt-1 space-y-1 text-sm">
                  <li>• Purchased home 3 years ago at 6.75% interest</li>
                  <li>• Current market rates around 5.25%</li>
                  <li>• Plan to stay in home 7+ more years</li>
                  <li>• Strong credit score (740+)</li>
                  <li>• Home value has increased 10%</li>
                </ul>
              </div>
              
              <div className="p-3 border border-emerald-100 dark:border-emerald-800 rounded-md bg-emerald-50/50 dark:bg-emerald-900/20">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">Recommendation:</p>
                <p className="mt-1 text-sm">
                  <strong>Rate-and-term refinance</strong> to capture the 1.5% rate drop. With closing costs of approximately $6,000 and monthly savings of $225, break-even period would be around 27 months—well within your planned stay.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Outcome:</strong> Save $225/month ($2,700/year) and approximately $87,000 in interest over the loan term.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-green-600" />
                Scenario 2: Term Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border border-green-100 dark:border-green-800 rounded-md bg-green-50/50 dark:bg-green-900/20">
                <p className="font-medium text-green-800 dark:text-green-300">Profile:</p>
                <ul className="mt-1 space-y-1 text-sm">
                  <li>• 10 years into a 30-year mortgage at 5.75%</li>
                  <li>• Current rate offers around 5.25%</li>
                  <li>• Strong income and financial stability</li>
                  <li>• Desire to be mortgage-free sooner</li>
                  <li>• Can afford moderately higher monthly payment</li>
                </ul>
              </div>
              
              <div className="p-3 border border-emerald-100 dark:border-emerald-800 rounded-md bg-emerald-50/50 dark:bg-emerald-900/20">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">Recommendation:</p>
                <p className="mt-1 text-sm">
                  <strong>Term-shortening refinance</strong> to a 15-year fixed loan. Instead of having 20 years remaining, you'd pay off the loan in 15 years. The rate on 15-year loans is typically 0.5-0.75% lower than 30-year loans.
                </p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Outcome:</strong> Pay off mortgage 5 years earlier, with monthly payment increase of ~$175 but save approximately $90,000 in interest over the loan term.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Scenario 3: Debt Consolidation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border border-purple-100 dark:border-purple-800 rounded-md bg-purple-50/50 dark:bg-purple-900/20">
                <p className="font-medium text-purple-800 dark:text-purple-300">Profile:</p>
                <ul className="mt-1 space-y-1 text-sm">
                  <li>• Current mortgage: $250,000 at 5.5%</li>
                  <li>• Credit card debt: $30,000 at 18.99% APR</li>
                  <li>• Car loan: $15,000 at 7.5% APR</li>
                  <li>• Home value: $400,000 (50% LTV)</li>
                  <li>• Strong income but stretched by multiple payments</li>
                </ul>
              </div>
              
              <div className="p-3 border border-emerald-100 dark:border-emerald-800 rounded-md bg-emerald-50/50 dark:bg-emerald-900/20">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">Recommendation:</p>
                <p className="mt-1 text-sm">
                  <strong>Cash-out refinance</strong> to consolidate high-interest debts. New loan amount would be $295,000, providing $45,000 to pay off credit card and car loan completely.
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-purple-600 mt-0.5" />
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    <strong>Outcome:</strong> Monthly savings of $950 from eliminated debt payments, while mortgage payment increases by $300. Net monthly improvement: $650.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-amber-600" />
                Scenario 4: Removing Mortgage Insurance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border border-amber-100 dark:border-amber-800 rounded-md bg-amber-50/50 dark:bg-amber-900/20">
                <p className="font-medium text-amber-800 dark:text-amber-300">Profile:</p>
                <ul className="mt-1 space-y-1 text-sm">
                  <li>• FHA loan with 3.5% down payment 3 years ago</li>
                  <li>• Paying $180/month in mortgage insurance premiums</li>
                  <li>• Home value increased 15%</li>
                  <li>• Current equity position: ~18%</li>
                  <li>• Credit score improved from 680 to 740</li>
                </ul>
              </div>
              
              <div className="p-3 border border-emerald-100 dark:border-emerald-800 rounded-md bg-emerald-50/50 dark:bg-emerald-900/20">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">Recommendation:</p>
                <p className="mt-1 text-sm">
                  <strong>Conventional refinance</strong> to eliminate mortgage insurance. With improved credit and increased home value, you may qualify for a conventional loan without PMI (or a small additional down payment may be required to reach 20% equity).
                </p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Outcome:</strong> Save $180/month in mortgage insurance ($2,160/year) with a break-even point of approximately 28-33 months.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 id="when-not-to" className="text-xl font-bold mb-4">When Refinancing May NOT Make Sense</h3>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-700 text-lg font-bold dark:bg-red-900 dark:text-red-300">✕</span>
                  <div>
                    <p className="font-medium text-lg">Short Remaining Timeframe</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      If you plan to move within 2-3 years, you may not recoup the closing costs before selling. Calculate your break-even point carefully.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-700 text-lg font-bold dark:bg-red-900 dark:text-red-300">✕</span>
                  <div>
                    <p className="font-medium text-lg">Minimal Rate Improvement</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      If the new rate is only marginally better (less than 0.5%), closing costs may outweigh the benefits, especially with a smaller loan balance.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-700 text-lg font-bold dark:bg-red-900 dark:text-red-300">✕</span>
                  <div>
                    <p className="font-medium text-lg">Nearly Paid Off Mortgage</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      If you're in the later years of your mortgage, most of your payment is going toward principal. Refinancing restarts the amortization schedule, potentially increasing total interest paid.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-700 text-lg font-bold dark:bg-red-900 dark:text-red-300">✕</span>
                  <div>
                    <p className="font-medium text-lg">Debt Consolidation Without Discipline</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Using cash-out refinancing to pay off consumer debt can backfire if you run up new debt. You're converting unsecured debt to debt secured by your home.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Pro Tip:</strong> If you're close to your break-even point or uncertain about your timeline in the home, consider a "no-cost" refinance where closing costs are rolled into your interest rate. This eliminates the upfront expense but results in a slightly higher rate than paying costs out of pocket.
            </p>
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Making Your Refinance Decision
            </CardTitle>
            <CardDescription>
              Using data to guide your mortgage refinancing choice
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              A <strong>Refinance Calculator</strong> transforms complex financial variables into clear, actionable insights about whether refinancing makes sense for your specific situation. By analyzing your break-even point, potential savings, and comparing different scenarios, you can make a decision based on data rather than guesswork.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Remember these key principles when evaluating refinance opportunities:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Financial Considerations</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">The break-even point is crucial—ensure you'll stay in your home long enough to recoup costs</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Look at total interest over the life of the loan, not just monthly payments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Consider your overall financial situation and goals beyond just the mortgage</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Next Steps</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Use our calculator to evaluate your specific scenario</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Get quotes from multiple lenders to compare offers</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Review the Loan Estimate forms carefully to understand all costs</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to analyze your refinance options?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Refinance Calculator</strong> above to determine if refinancing makes financial sense for your situation! For more mortgage tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/mortgage">
                        <Home className="h-4 w-4 mr-1" />
                        Mortgage Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/affordability">
                        <Calculator className="h-4 w-4 mr-1" />
                        Affordability Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/amortization">
                        <LineChart className="h-4 w-4 mr-1" />
                        Amortization Schedule
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
        <section className="py-12">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Related Calculators</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Mortgage Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate your monthly mortgage payments based on loan amount, interest rate, and term.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/mortgage">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Amortization Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    See a complete breakdown of your loan payments over time, including principal and interest.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/amortization">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Debt-to-Income Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate your debt-to-income ratio to determine if you qualify for refinancing.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/debt-to-income">Try Calculator</Link>
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