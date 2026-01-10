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
// Add Accordion imports
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, BadgeDollarSign, Calendar, User, Users, Clock, Briefcase, Percent } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import AnnuityPayoutSchema from './schema';

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

export default function AnnuityPayoutCalculator() {
  // Basic Inputs
  const [lumpSum, setLumpSum] = useState<number>(500000)
  const [interestRate, setInterestRate] = useState<number>(5)
  const [payoutPeriod, setPayoutPeriod] = useState<number>(20)
  const [paymentFrequency, setPaymentFrequency] = useState<string>("monthly")
  
  // Advanced Inputs
  const [annuityType, setAnnuityType] = useState<string>("ordinary")
  const [inflationRate, setInflationRate] = useState<number>(2.5)
  const [taxRate, setTaxRate] = useState<number>(25)
  const [includeInflation, setIncludeInflation] = useState<boolean>(true)
  const [includeTax, setIncludeTax] = useState<boolean>(true)
  
  // Results State
  const [periodicPayment, setPeriodicPayment] = useState<number>(0)
  const [totalIncome, setTotalIncome] = useState<number>(0)
  const [afterTaxPayment, setAfterTaxPayment] = useState<number>(0)
  const [inflationAdjustedPayments, setInflationAdjustedPayments] = useState<number[]>([])
  const [paymentSchedule, setPaymentSchedule] = useState<{
    period: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[]>([])

  // Calculate frequency multiplier
  const getFrequencyMultiplier = () => {
    switch (paymentFrequency) {
      case "annually": return 1
      case "semi-annually": return 2
      case "quarterly": return 4
      case "monthly": return 12
      default: return 12
    }
  }

  // Calculate payments and schedule
  useEffect(() => {
    const frequencyMultiplier = getFrequencyMultiplier()
    const periodicRate = interestRate / 100 / frequencyMultiplier
    const totalPeriods = payoutPeriod * frequencyMultiplier
    
    // Calculate base periodic payment
    let payment = lumpSum * (periodicRate * Math.pow(1 + periodicRate, totalPeriods)) / 
                 (Math.pow(1 + periodicRate, totalPeriods) - 1)
    
    // Adjust for annuity due if selected
    if (annuityType === "due") {
      payment *= (1 + periodicRate)
    }
    
    // Calculate payment schedule
    let remainingBalance = lumpSum
    const schedule = []
    let totalIncomeSum = 0
    const inflationAdjusted = []
    
    for (let i = 0; i < totalPeriods; i++) {
      const interest = remainingBalance * periodicRate
      const principal = payment - interest
      remainingBalance = Math.max(0, remainingBalance - principal)
      
      // Calculate inflation adjustment if enabled
      const yearIndex = Math.floor(i / frequencyMultiplier)
      const inflationFactor = includeInflation 
        ? Math.pow(1 + inflationRate / 100, yearIndex) 
        : 1
      const adjustedPayment = payment * inflationFactor
      
      inflationAdjusted.push(adjustedPayment)
      totalIncomeSum += adjustedPayment
      
      schedule.push({
        period: i + 1,
        payment: adjustedPayment,
        principal,
        interest,
        balance: remainingBalance
      })
    }
    
    // Calculate after-tax payment if enabled
    const afterTax = includeTax 
      ? payment * (1 - taxRate / 100) 
      : payment
    
    setPeriodicPayment(payment)
    setTotalIncome(totalIncomeSum)
    setAfterTaxPayment(afterTax)
    setInflationAdjustedPayments(inflationAdjusted)
    setPaymentSchedule(schedule)
    
  }, [
    lumpSum,
    interestRate,
    payoutPeriod,
    paymentFrequency,
    annuityType,
    inflationRate,
    taxRate,
    includeInflation,
    includeTax
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
  const paymentBreakdownData = {
    labels: ['Principal', 'Interest'],
    datasets: [{
      data: [
        paymentSchedule[0]?.principal || 0,
        paymentSchedule[0]?.interest || 0
      ],
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
          const total = periodicPayment
          return ((value / total) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Payment schedule chart
  const generatePaymentScheduleChart = () => {
    const years = Array.from(
      { length: payoutPeriod }, 
      (_, i) => `Year ${i + 1}`
    )
    
    const yearlyPayments = years.map((_, i) => {
      const startIdx = i * getFrequencyMultiplier()
      const endIdx = startIdx + getFrequencyMultiplier()
      return inflationAdjustedPayments
        .slice(startIdx, endIdx)
        .reduce((sum, payment) => sum + payment, 0)
    })
    
    return {
      labels: years,
      datasets: [
        {
          label: 'Annual Payout',
          data: yearlyPayments,
          backgroundColor: chartColors.primary[0],
          borderColor: chartColors.secondary[0].replace('0.2', '1'),
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    }
  }

  const barChartOptions: ChartOptions<'bar'> = {
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

  // Balance over time chart
  const generateBalanceChart = () => {
    const years = Array.from(
      { length: payoutPeriod }, 
      (_, i) => `Year ${i + 1}`
    )
    
    const yearlyBalances = years.map((_, i) => {
      const idx = (i + 1) * getFrequencyMultiplier() - 1
      return paymentSchedule[idx]?.balance || 0
    })
    
    return {
      labels: years,
      datasets: [
        {
          label: 'Remaining Balance',
          data: yearlyBalances,
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        }
      ]
    }
  }

  const lineChartOptions: ChartOptions<'line'> = {
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
    pdf.save('annuity-payout-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <AnnuityPayoutSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Annuity Payout <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate how much regular income you can receive from your retirement savings or investment portfolio.
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
                    <CardTitle>Enter Annuity Details</CardTitle>
                    <CardDescription>
                      Provide information about your investment and desired payout structure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Basic Inputs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="lump-sum">Lump Sum Amount</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="lump-sum"
                              type="number"
                              className="pl-9"
                              value={lumpSum || ''} onChange={(e) => setLumpSum(e.target.value === '' ? 0 : Number(e.target.value))}
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
                            max={10}
                            step={0.1}
                            value={[interestRate]}
                            onValueChange={(value) => setInterestRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payout-period">Payout Period (Years)</Label>
                          <Input
                            id="payout-period"
                            type="number"
                            value={payoutPeriod || ''} onChange={(e) => setPayoutPeriod(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-frequency">Payment Frequency</Label>
                          <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                            <SelectTrigger id="payment-frequency">
                              <SelectValue placeholder="Select payment frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Advanced Options</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="annuity-type">Annuity Type</Label>
                          <Select value={annuityType} onValueChange={setAnnuityType}>
                            <SelectTrigger id="annuity-type">
                              <SelectValue placeholder="Select annuity type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ordinary">Ordinary Annuity (End of Period)</SelectItem>
                              <SelectItem value="due">Annuity Due (Start of Period)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="inflation-toggle">Include Inflation Adjustment</Label>
                            <Switch
                              id="inflation-toggle"
                              checked={includeInflation}
                              onCheckedChange={setIncludeInflation}
                            />
                          </div>
                          {includeInflation && (
                            <div className="flex items-center justify-between">
                              <Label htmlFor="inflation-rate">Inflation Rate</Label>
                              <span className="text-sm text-muted-foreground">{inflationRate}%</span>
                            </div>
                          )}
                          {includeInflation && (
                            <Slider
                              id="inflation-rate"
                              min={0}
                              max={10}
                              step={0.1}
                              value={[inflationRate]}
                              onValueChange={(value) => setInflationRate(value[0])}
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="tax-toggle">Include Tax Calculation</Label>
                            <Switch
                              id="tax-toggle"
                              checked={includeTax}
                              onCheckedChange={setIncludeTax}
                            />
                          </div>
                          {includeTax && (
                            <div className="flex items-center justify-between">
                              <Label htmlFor="tax-rate">Tax Rate</Label>
                              <span className="text-sm text-muted-foreground">{taxRate}%</span>
                            </div>
                          )}
                          {includeTax && (
                            <Slider
                              id="tax-rate"
                              min={0}
                              max={50}
                              step={1}
                              value={[taxRate]}
                              onValueChange={(value) => setTaxRate(value[0])}
                            />
                          )}
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
                      <p className="text-sm text-muted-foreground">
                        {paymentFrequency.charAt(0).toUpperCase() + paymentFrequency.slice(1)} Payment
                      </p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(periodicPayment)}</p>
                      {includeTax && (
                        <p className="text-sm text-muted-foreground">
                          After Tax: {formatCurrency(afterTaxPayment)}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="balance">Balance</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={paymentBreakdownData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Payment Details</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Principal Portion</span>
                              <span className="font-medium">
                                {formatCurrency(paymentSchedule[0]?.principal || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Interest Portion</span>
                              <span className="font-medium">
                                {formatCurrency(paymentSchedule[0]?.interest || 0)}
                              </span>
                            </div>
                            {includeInflation && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">First Year Total</span>
                                <span className="font-medium">
                                  {formatCurrency(periodicPayment * getFrequencyMultiplier())}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Payout</span>
                              <span>{formatCurrency(totalIncome)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="schedule" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={generatePaymentScheduleChart()} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Annual Payment Schedule</h4>
                          <p className="text-sm text-muted-foreground">
                            Shows total payments per year, adjusted for inflation if enabled.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="balance" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateBalanceChart()} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Remaining Balance Over Time</h4>
                          <p className="text-sm text-muted-foreground">
                            Shows how your principal balance decreases over the payout period.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Summary Card */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Payment Summary</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• {paymentFrequency.charAt(0).toUpperCase() + paymentFrequency.slice(1)} payments of {formatCurrency(periodicPayment)}</li>
                              <li>• Total payout over {payoutPeriod} years: {formatCurrency(totalIncome)}</li>
                              {includeInflation && (
                                <li>• Payments adjusted for {inflationRate}% annual inflation</li>
                              )}
                              {includeTax && (
                                <li>• After-tax payment: {formatCurrency(afterTaxPayment)}</li>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Retirement Planning</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Annuity Payout Calculator: Your Complete Guide</h2>
        <p className="mt-3 text-muted-foreground text-lg">Optimize your retirement income with precise annuity projections</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Annuity Payouts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-annuity-payout" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What are Annuity Payouts?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                <strong>Annuity payouts</strong> represent the regular income distributions you receive from an annuity contract. These payments transform your accumulated savings into a reliable income stream designed to provide financial security throughout retirement or for a specified period.
              </p>
              <p className="mt-2">
                Unlike other retirement assets that may fluctuate with market conditions, annuity payouts offer predictability—knowing exactly how much income you'll receive and for how long gives you the confidence to plan your retirement lifestyle with precision.
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Fixed payments on a predetermined schedule</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Calculated based on principal, interest, and time period</span>
                </li>
                <li className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Various payout options to match your specific needs</span>
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Potential protection against outliving your savings</span>
                </li>
              </ul>
              <p>
                Understanding how annuity payouts are calculated is essential for making informed decisions about your retirement income strategy and ensuring your financial security for years to come.
              </p>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                  <CardTitle className="text-sm font-medium text-center">Payout Comparison by Age</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Bar 
                      data={{
                        labels: ['Age 60', 'Age 65', 'Age 70', 'Age 75', 'Age 80'],
                        datasets: [
                          {
                            label: 'Monthly Payout per $100,000',
                            data: [460, 525, 610, 725, 870],
                            backgroundColor: 'rgba(99, 102, 241, 0.8)',
                            borderColor: 'rgba(99, 102, 241, 1)',
                            borderWidth: 1,
                            borderRadius: 4
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, padding: 10 }
                          },
                          datalabels: {
                            color: '#fff',
                            formatter: (value) => '$' + value
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: value => '$' + value
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <h4 id="types-of-payouts" className="font-semibold text-xl mt-6">Types of Annuity Payout Options</h4>
          <div className="mt-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Single Life</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Highest payout rate; payments end upon annuitant's death</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Joint Life</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Payments continue until both annuitants pass away</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Period Certain</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Guarantees payments for a specific timeframe (10, 15, 20 years)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Life with Period Certain</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Lifetime payments with minimum guaranteed period</p>
                </div>
              </div>
            </div>
          </div>
          
          <p>
            An Annuity Payout Calculator allows you to estimate how much income you could receive from your annuity based on factors like your age, premium amount, payout option, and current interest rates. By comparing different scenarios, you can determine which annuity structure best aligns with your retirement income needs and financial goals.
          </p>
        </CardContent>
      </Card>

      {/* How to Use Section */}
      <div className="mb-12" id="how-to-use">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Using the Annuity Payout Calculator</h2>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="calculator-guide" className="font-bold text-xl mb-4">Step-by-Step Calculator Guide</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Input Parameters</h4>
              <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Premium Amount</p>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    The total amount you're investing in the annuity, typically your lump-sum payment or accumulated value
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Age at Annuitization</p>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Your age when payments begin—higher ages generally result in higher payout rates
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Annuity Type & Options</p>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Select single or joint life, period certain guarantees, and inflation protection features
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Payment Frequency</p>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Choose monthly, quarterly, semi-annual, or annual payouts based on your income needs
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Example Calculation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm">Premium Amount</span>
                    <span className="font-medium">$250,000</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm">Age</span>
                    <span className="font-medium">65</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm">Option</span>
                    <span className="font-medium">Single Life</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 font-semibold">
                    <span>Monthly Payout</span>
                    <span>$1,312.50</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 font-semibold">
                    <span>Annual Payout</span>
                    <span>$15,750</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Understanding Your Results</h4>
              
              <div className="space-y-4">
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      Payout Amount
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>
                      The regular payment you'll receive based on your inputs. Compare this to your expected retirement expenses to determine if the income will be adequate.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Percent className="h-4 w-4 text-blue-600" />
                      Payout Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>
                      The annual percentage of your premium you'll receive as income (e.g., $15,750 on $250,000 = 6.3% payout rate). This differs from the internal rate of return, which accounts for return of premium.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      Total Income Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>
                      For lifetime annuities, the calculator will show estimated total income based on life expectancy. For period certain options, it shows the guaranteed total.
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-300">Important Considerations</p>
                    <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                      <li>• Annuity quotes fluctuate with interest rates and market conditions</li>
                      <li>• Calculations are estimates only; actual offerings from insurance companies may vary</li>
                      <li>• Adding features like inflation protection or survivor benefits will reduce initial payments</li>
                      <li>• Health conditions may qualify you for enhanced payout rates through impaired risk annuities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 id="comparing-options" className="font-bold text-xl mt-8 mb-4">Comparing Payout Options</h3>
        
        <div className="mb-6">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Payout Option</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Monthly Payment<br/>(per $100,000)</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Best For</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Considerations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Single Life</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">$525</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Individuals seeking maximum income</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">No legacy; payments stop at death</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Joint Life (100%)</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">$435</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Couples needing income for both lives</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Lower payments but better survivor protection</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">10-Year Period Certain</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">$510</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Those wanting guaranteed minimum payout</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Payments to beneficiaries if death occurs early</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Life with 3% COLA</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">$410</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Planning for longer retirement</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Payments increase annually but start lower</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-2">*Based on a 65-year-old purchaser with current market rates (April 2025)</p>
        </div>
        
        <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Pro Tip:</strong> Use the calculator to run multiple scenarios with different options before making a decision. Even small changes can significantly impact your income over a 20-30 year retirement. For example, delaying annuitization by just 3-5 years can increase your payout rate by 15-25%.
          </p>
        </div>
      </div>

      {/* Key Factors Section with Advanced Components */}
      <div className="mb-12" id="key-factors">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
            <CardTitle>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl">Factors Affecting Your Payout Amount</span>
              </div>
            </CardTitle>
            <CardDescription>
              Understanding these elements helps you maximize your annuity income
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="age-impact" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Age and Life Expectancy
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    <strong>Age</strong> is the most significant factor determining your annuity payout rate. Insurance companies calculate payments based on your life expectancy—the older you are when starting payments, the higher your payout rate.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span>Each year you delay starting payments typically increases payout rates by 0.3-0.5%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span>The "mortality credit" advantage increases with age</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span>Health status can qualify you for enhanced rates through impaired risk annuities</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      <strong>Example:</strong> $100,000 premium in 2025
                    </p>
                    <ul className="text-sm mt-1 text-purple-700 dark:text-purple-400">
                      <li>Age 65: $525/month ($6,300/year)</li>
                      <li>Age 70: $610/month ($7,320/year)</li>
                      <li>Age 75: $725/month ($8,700/year)</li>
                    </ul>
                    <p className="text-xs mt-2 text-purple-600 dark:text-purple-500">Waiting from 65 to 75 increases monthly income by <strong>38%</strong></p>
                  </div>
                </div>
                
                <div className="h-[250px]">
                  <h4 className="text-center text-sm font-medium mb-2">Age Impact on Monthly Payout</h4>
                  <Line 
                    data={{
                      labels: ['Age 60', 'Age 62', 'Age 65', 'Age 67', 'Age 70', 'Age 73', 'Age 75', 'Age 78', 'Age 80'],
                      datasets: [
                        {
                          label: 'Monthly Payout per $100,000',
                          data: [460, 485, 525, 560, 610, 675, 725, 805, 870],
                          borderColor: 'rgba(124, 58, 237, 0.8)',
                          backgroundColor: 'rgba(124, 58, 237, 0.1)',
                          tension: 0.3
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
                          beginAtZero: false,
                          ticks: { callback: value => '$' + value }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="interest-rates" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Interest Rate Environment
                </h3>
                <p>Current interest rates significantly impact annuity payout rates, as insurers base their calculations on returns they can generate from your premium.</p>
                
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">10-Year Treasury<br/>Rate</th>
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Monthly Payout<br/>(Age 65)</th>
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Payout<br/>Rate</th>
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">2.0%</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$485</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">5.82%</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Baseline</td>
                      </tr>
                      <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">3.0%</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$525</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">6.30%</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">+8.2%</td>
                      </tr>
                      <tr>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">4.0%</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$565</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">6.78%</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">+16.5%</td>
                      </tr>
                      <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">5.0%</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$610</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">7.32%</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">+25.8%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">*Per $100,000 premium for a Single Life Immediate Annuity</p>
              </div>
              
              <div>
                <h3 id="payout-options" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Payout Features Impact
                </h3>
                <p>
                  Adding features that provide additional benefits will reduce your initial payout amount. Understanding these trade-offs helps you select the right balance between current income and other priorities.
                </p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">Feature Cost Analysis</h4>
                  <div className="mt-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="font-medium text-blue-700 dark:text-blue-400">Single Life (Baseline):</div>
                      <div className="font-medium text-blue-700 dark:text-blue-400">$525/month</div>
                      <div className="text-blue-600 dark:text-blue-500">Joint Life (100%):</div>
                      <div className="text-blue-600 dark:text-blue-500">$435/month (-17%)</div>
                      <div className="text-blue-600 dark:text-blue-500">10-Year Period Certain:</div>
                      <div className="text-blue-600 dark:text-blue-500">$510/month (-3%)</div>
                      <div className="text-blue-600 dark:text-blue-500">20-Year Period Certain:</div>
                      <div className="text-blue-600 dark:text-blue-500">$475/month (-10%)</div>
                      <div className="text-blue-600 dark:text-blue-500">3% Annual COLA:</div>
                      <div className="text-blue-600 dark:text-blue-500">$410/month (-22%)</div>
                      <div className="text-blue-600 dark:text-blue-500">Cash Refund Feature:</div>
                      <div className="text-blue-600 dark:text-blue-500">$490/month (-7%)</div>
                    </div>
                  </div>
                </div>
                
                <h3 id="product-types" className="text-xl font-bold text-green-700 dark:text-green-400 mt-6 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Annuity Product Types
                </h3>
                <p className="mb-4">
                  Different annuity products offer distinct advantages and payment structures. The calculator helps you compare options across various product types.
                </p>
                <div className="h-[170px]">
                  <Bar 
                    data={{
                      labels: ['SPIA', 'DIA (10yr)', 'QLAC', 'Fixed Indexed', 'Variable'],
                      datasets: [{
                        label: 'Relative Payout Rate',
                        data: [100, 130, 145, 85, 90],
                        backgroundColor: [
                          'rgba(16, 185, 129, 0.7)',
                          'rgba(16, 185, 129, 0.75)',
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(16, 185, 129, 0.65)',
                          'rgba(16, 185, 129, 0.6)'
                        ],
                        borderWidth: 1,
                        borderRadius: 4
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return context.parsed.y + '% (Indexed to SPIA = 100%)';
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 150,
                          ticks: { callback: value => value + '%' }
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  SPIA = Single Premium Immediate Annuity, DIA = Deferred Income Annuity, QLAC = Qualified Longevity Annuity Contract
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Trends Section with Statistics */}
      <div className="mb-12" id="market-statistics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Annuity Payout Trends and Market Insights
        </h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Current Payout Rate</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">6.3%</p>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">Age 65 SPIA (April 2025)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                  <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">5-Year Trend</h3>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">+18%</p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">Increase in payout rates</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Break-Even Point</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">15.9</p>
                <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">Years to recoup premium</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                  <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Average Premium</h3>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">$194K</p>
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">SPIA purchase amount</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 id="market-insights" className="text-xl font-bold mb-4">Current Market Insights</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </span>
                <CardTitle className="text-base">Rising Interest Rate Impact</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                The recent interest rate increases have led to significantly more attractive annuity payout rates, with some providers offering the highest rates seen in over a decade, making immediate annuities more appealing for current retirees.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40">
                  <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                </span>
                <CardTitle className="text-base">Longevity Risk Protection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                With average retirement periods now extending to 25-30 years, longevity protection products like Qualified Longevity Annuity Contracts (QLACs) are growing in popularity, offering higher payouts by focusing on later-life income.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40">
                  <Percent className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </span>
                <CardTitle className="text-base">Hybrid Product Innovation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                New hybrid annuity products combining guaranteed income with limited market participation are gaining traction, offering a compromise between secure income and potential growth to address inflation concerns.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <Calculator className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </span>
                <CardTitle className="text-base">Provider Spread Variations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Significant differences between top and bottom annuity providers have emerged in 2025, with spreads of 12-15% in payout rates, making comparison shopping more important than ever for prospective annuity purchasers.
              </p>
            </CardContent>
          </Card>
        </div>

        <h3 id="historical-trends" className="text-xl font-bold mb-4">Historical Payout Rate Trends</h3>
        <Card className="bg-white dark:bg-gray-900 mb-4">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p>
                  <strong>Annuity payout rates</strong> have fluctuated significantly over the past decade, primarily following the direction of long-term interest rates. Understanding these trends can help you time your annuity purchase more effectively.
                </p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Timing Your Purchase</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-400">Rising rate environment</span>
                      <span className="font-medium text-blue-700 dark:text-blue-400">Consider delaying purchase</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-400">Stable high rates</span>
                      <span className="font-medium text-blue-700 dark:text-blue-400">Optimal purchase window</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-400">Falling rates expected</span>
                      <span className="font-medium text-blue-700 dark:text-blue-400">Lock in current rates quickly</span>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-sm text-blue-800 dark:text-blue-300">Current environment</span>
                      <span className="text-blue-800 dark:text-blue-300">Favorable for purchases</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="h-[280px]">
                <h4 className="text-center text-sm font-medium mb-3">10-Year Historical Payout Rates (Age 65)</h4>
                <Line 
                  data={{
                    labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
                    datasets: [
                      {
                        label: 'Annual Payout Rate (%)',
                        data: [5.3, 5.2, 5.4, 5.7, 5.9, 5.0, 4.8, 5.2, 5.8, 6.1, 6.3],
                        borderColor: 'rgba(59, 130, 246, 0.8)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3
                      },
                      {
                        label: '10-Year Treasury Rate (%)',
                        data: [2.1, 1.8, 2.3, 2.7, 2.1, 0.9, 1.5, 2.3, 3.7, 3.9, 3.1],
                        borderColor: 'rgba(16, 185, 129, 0.8)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderDash: [5, 5],
                        tension: 0.3
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 8,
                        ticks: { 
                          callback: value => value + '%'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Annuity Laddering Strategy</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                Consider implementing an annuity ladder by purchasing multiple smaller annuities over time rather than one large contract. This strategy helps diversify across different interest rate environments and allows you to adjust your strategy as your needs change. It also provides increasing income as you age, when higher payout rates become available.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <div className="mb-6" id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Maximizing Your Annuity Payout
            </CardTitle>
            <CardDescription>
              Strategic approaches to optimize your guaranteed retirement income
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Annuity payout calculators</strong> provide valuable insights into how much guaranteed income you can expect from different annuity products and configurations. By understanding the key factors that impact your payments—age, interest rates, payout options, and product types—you can make strategic decisions that align with your retirement needs and potentially increase your lifetime income significantly.
            </p>
            
            <p className="mt-4" id="next-steps">
              Consider these strategies to maximize your annuity payouts:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Strategic Planning Tips</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                    <span className="text-blue-800 dark:text-blue-300">Compare quotes from multiple providers (variations can exceed 10%)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                    <span className="text-blue-800 dark:text-blue-300">Consider delaying annuitization until at least your mid-60s</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                    <span className="text-blue-800 dark:text-blue-300">Implement an annuity ladder with purchases at different ages</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Balancing Features and Income</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                    <span className="text-green-800 dark:text-green-300">Select only features that address your specific concerns</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                    <span className="text-green-800 dark:text-green-300">Consider partial annuitization to maintain financial flexibility</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                    <span className="text-green-800 dark:text-green-300">Explore enhanced rate annuities if you have health concerns</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to explore your annuity options?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Annuity Payout Calculator</strong> above to estimate your potential retirement income! For more retirement planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <Clock className="h-4 w-4 mr-1" />
                        Retirement Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/social-security">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Social Security Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/annuity">
                        <Percent className="h-4 w-4 mr-1" />
                        Annuity Calculator
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
      </main>
      <SiteFooter />
    </div>
  )
}