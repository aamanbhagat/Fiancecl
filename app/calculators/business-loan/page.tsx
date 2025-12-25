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
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Building, Briefcase, Calendar, Clock, FileText, Wallet, Check, AlertTriangle, Percent } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import BusinessLoanSchema from './schema';

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

export default function BusinessLoanCalculator() {
  // Loan Details
  const [loanAmount, setLoanAmount] = useState<number>(100000)
  const [loanTerm, setLoanTerm] = useState<number>(60)
  const [interestRate, setInterestRate] = useState<number>(7.5)
  const [downPayment, setDownPayment] = useState<number>(20000)
  const [paymentFrequency, setPaymentFrequency] = useState<string>("monthly")
  const [processingFee, setProcessingFee] = useState<number>(1.5)
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(0)
  const [balloonPayment, setBalloonPayment] = useState<boolean>(false)
  const [balloonAmount, setBalloonAmount] = useState<number>(0)
  
  // Additional Options
  const [includeProcessingFee, setIncludeProcessingFee] = useState<boolean>(true)
  const [isVariableRate, setIsVariableRate] = useState<boolean>(false)
  const [rateAdjustment, setRateAdjustment] = useState<number>(0)
  const [rateAdjustmentPeriod, setRateAdjustmentPeriod] = useState<number>(12)
  
  // Results State
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0)
  const [totalInterest, setTotalInterest] = useState<number>(0)
  const [totalCost, setTotalCost] = useState<number>(0)
  const [processingFeeAmount, setProcessingFeeAmount] = useState<number>(0)
  const [amortizationSchedule, setAmortizationSchedule] = useState<{
    date: Date;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
    totalInterest: number;
  }[]>([])
  const [earlyPayoffSavings, setEarlyPayoffSavings] = useState<number>(0)
  const [breakEvenMonths, setBreakEvenMonths] = useState<number>(0)

  // Calculate loan details and generate amortization schedule
  useEffect(() => {
    const calculateLoan = () => {
      // Calculate processing fee
      const processingFeeAmt = includeProcessingFee ? (loanAmount * processingFee) / 100 : 0
      setProcessingFeeAmount(processingFeeAmt)
      
      // Calculate effective loan amount
      const effectiveLoanAmount = loanAmount - downPayment
      
      // Initialize variables for amortization schedule
      const schedule = []
      let remainingBalance = effectiveLoanAmount
      let totalInterestPaid = 0
      let currentDate = new Date()
      let currentRate = interestRate
      
      // Calculate base monthly payment (without balloon)
      const monthlyRate = currentRate / 100 / 12
      const numberOfPayments = loanTerm
      
      // Adjust for balloon payment if enabled
      const balloonFactor = balloonPayment ? Math.pow(1 + monthlyRate, numberOfPayments) : 0
      const monthlyPaymentAmount = balloonPayment
        ? (effectiveLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments - 1)) / 
          (Math.pow(1 + monthlyRate, numberOfPayments - 1) - 1)
        : (effectiveLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      
      // Generate amortization schedule
      for (let i = 0; i < numberOfPayments; i++) {
        // Adjust interest rate if variable
        if (isVariableRate && i > 0 && i % rateAdjustmentPeriod === 0) {
          currentRate = interestRate + rateAdjustment
        }
        
        const monthlyInterestRate = currentRate / 100 / 12
        const interestPayment = remainingBalance * monthlyInterestRate
        let principalPayment = monthlyPaymentAmount - interestPayment
        
        // Handle balloon payment in last month
        if (balloonPayment && i === numberOfPayments - 1) {
          principalPayment = remainingBalance
        }
        
        // Apply any prepayment
        if (prepaymentAmount > 0) {
          principalPayment += prepaymentAmount
        }
        
        remainingBalance = Math.max(0, remainingBalance - principalPayment)
        totalInterestPaid += interestPayment
        
        // Add to schedule
        schedule.push({
          date: new Date(currentDate.setMonth(currentDate.getMonth() + 1)),
          payment: principalPayment + interestPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: remainingBalance,
          totalInterest: totalInterestPaid
        })
        
        // Break if loan is paid off
        if (remainingBalance === 0) break
      }
      
      // Calculate total cost
      const totalCostAmount = effectiveLoanAmount + totalInterestPaid + processingFeeAmt
      
      // Calculate early payoff savings
      const regularSchedule = calculateRegularSchedule(effectiveLoanAmount, interestRate, numberOfPayments)
      const earlyPayoffSavingsAmount = regularSchedule.totalInterest - totalInterestPaid
      
      // Calculate break-even period (months until loan amount is recovered through business income)
      // Assuming average business profit margin of 15% on loan amount
      const monthlyProfit = (effectiveLoanAmount * 0.15) / 12
      const breakEvenPeriod = Math.ceil(totalCostAmount / monthlyProfit)
      
      // Update state
      setMonthlyPayment(monthlyPaymentAmount)
      setTotalInterest(totalInterestPaid)
      setTotalCost(totalCostAmount)
      setAmortizationSchedule(schedule)
      setEarlyPayoffSavings(earlyPayoffSavingsAmount)
      setBreakEvenMonths(breakEvenPeriod)
    }
    
    calculateLoan()
  }, [
    loanAmount,
    loanTerm,
    interestRate,
    downPayment,
    paymentFrequency,
    processingFee,
    prepaymentAmount,
    balloonPayment,
    balloonAmount,
    includeProcessingFee,
    isVariableRate,
    rateAdjustment,
    rateAdjustmentPeriod
  ])

  // Helper function to calculate regular payment schedule without prepayments
  const calculateRegularSchedule = (principal: number, rate: number, term: number) => {
    const monthlyRate = rate / 100 / 12
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                   (Math.pow(1 + monthlyRate, term) - 1)
    
    let balance = principal
    let totalInterest = 0
    
    for (let i = 0; i < term; i++) {
      const interest = balance * monthlyRate
      const principalPart = payment - interest
      balance -= principalPart
      totalInterest += interest
    }
    
    return { totalInterest }
  }

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
    labels: ['Principal', 'Interest', 'Processing Fee'],
    datasets: [{
      data: [
        loanAmount - downPayment,
        totalInterest,
        processingFeeAmount
      ],
      backgroundColor: chartColors.primary.slice(0, 3),
      borderColor: chartColors.secondary.slice(0, 3).map(color => color.replace('0.2', '1')),
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
          return ((value / totalCost) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Amortization chart
  const generateAmortizationChart = () => {
    const years = Array.from(
      { length: Math.ceil(amortizationSchedule.length / 12) },
      (_, i) => `Year ${i + 1}`
    )
    
    return {
      labels: years,
      datasets: [
        {
          label: 'Loan Balance',
          data: amortizationSchedule
            .filter((_, i) => i % 12 === 0)
            .map(entry => entry.balance),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Cumulative Interest',
          data: amortizationSchedule
            .filter((_, i) => i % 12 === 0)
            .map(entry => entry.totalInterest),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
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

  // Break-even analysis chart
  const generateBreakEvenChart = () => {
    const months = Array.from({ length: breakEvenMonths + 6 }, (_, i) => `Month ${i + 1}`)
    const monthlyProfit = (loanAmount * 0.15) / 12
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Cumulative Cost',
          data: months.map((_, i) => totalCost),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0
        },
        {
          label: 'Cumulative Revenue',
          data: months.map((_, i) => monthlyProfit * (i + 1)),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0
        }
      ]
    }
  }

  const breakEvenChartOptions: ChartOptions<'line'> = {
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
      month: 'short',
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
    pdf.save('business-loan-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <BusinessLoanSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Business Loan <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your business loan payments, analyze costs, and understand your break-even point.
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
                      Provide information about your business loan to calculate payments and analyze costs.
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
                          <Label htmlFor="down-payment">Down Payment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="down-payment"
                              type="number"
                              className="pl-9"
                              value={downPayment}
                              onChange={(e) => setDownPayment(Number(e.target.value))}
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
                            max={20}
                            step={0.1}
                            value={[interestRate]}
                            onValueChange={(value) => setInterestRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loan-term">Loan Term (Months)</Label>
                          <Select value={String(loanTerm)} onValueChange={(value) => setLoanTerm(Number(value))}>
                            <SelectTrigger id="loan-term">
                              <SelectValue placeholder="Select loan term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12">12 Months (1 Year)</SelectItem>
                              <SelectItem value="24">24 Months (2 Years)</SelectItem>
                              <SelectItem value="36">36 Months (3 Years)</SelectItem>
                              <SelectItem value="48">48 Months (4 Years)</SelectItem>
                              <SelectItem value="60">60 Months (5 Years)</SelectItem>
                              <SelectItem value="72">72 Months (6 Years)</SelectItem>
                              <SelectItem value="84">84 Months (7 Years)</SelectItem>
                              <SelectItem value="120">120 Months (10 Years)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Payment Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Payment Options</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="payment-frequency">Payment Frequency</Label>
                          <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                            <SelectTrigger id="payment-frequency">
                              <SelectValue placeholder="Select payment frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prepayment">Monthly Prepayment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="prepayment"
                              type="number"
                              className="pl-9"
                              value={prepaymentAmount}
                              onChange={(e) => setPrepaymentAmount(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="balloon-payment">Include Balloon Payment</Label>
                            <Switch
                              id="balloon-payment"
                              checked={balloonPayment}
                              onCheckedChange={setBalloonPayment}
                            />
                          </div>
                          {balloonPayment && (
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type="number"
                                className="pl-9"
                                value={balloonAmount}
                                onChange={(e) => setBalloonAmount(Number(e.target.value))}
                                placeholder="Balloon payment amount"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Costs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Costs</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="processing-fee-toggle">Include Processing Fee</Label>
                            <Switch
                              id="processing-fee-toggle"
                              checked={includeProcessingFee}
                              onCheckedChange={setIncludeProcessingFee}
                            />
                          </div>
                          {includeProcessingFee && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="processing-fee">Processing Fee Rate</Label>
                                <span className="text-sm text-muted-foreground">{processingFee}%</span>
                              </div>
                              <Slider
                                id="processing-fee"
                                min={0}
                                max={5}
                                step={0.1}
                                value={[processingFee]}
                                onValueChange={(value) => setProcessingFee(value[0])}
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="variable-rate">Variable Interest Rate</Label>
                            <Switch
                              id="variable-rate"
                              checked={isVariableRate}
                              onCheckedChange={setIsVariableRate}
                            />
                          </div>
                          {isVariableRate && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="rate-adjustment">Rate Adjustment</Label>
                                <span className="text-sm text-muted-foreground">{rateAdjustment}%</span>
                              </div>
                              <Slider
                                id="rate-adjustment"
                                min={-2}
                                max={2}
                                step={0.25}
                                value={[rateAdjustment]}
                                onValueChange={(value) => setRateAdjustment(value[0])}
                              />
                              <Select 
                                value={String(rateAdjustmentPeriod)} 
                                onValueChange={(value) => setRateAdjustmentPeriod(Number(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Adjustment period" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="6">Every 6 months</SelectItem>
                                  <SelectItem value="12">Every 12 months</SelectItem>
                                  <SelectItem value="24">Every 24 months</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
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
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(monthlyPayment)}</p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Costs</TabsTrigger>
                        <TabsTrigger value="amortization">Schedule</TabsTrigger>
                        <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Cost Breakdown</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Principal Amount</span>
                              <span className="font-medium">{formatCurrency(loanAmount - downPayment)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Interest</span>
                              <span className="font-medium">{formatCurrency(totalInterest)}</span>
                            </div>
                            {includeProcessingFee && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Processing Fee</span>
                                <span className="font-medium">{formatCurrency(processingFeeAmount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Cost</span>
                              <span>{formatCurrency(totalCost)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="amortization" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateAmortizationChart()} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Payment Schedule</h4>
                          <div className="max-h-[200px] overflow-auto">
                            <table className="w-full text-sm">
                              <thead className="sticky top-0 bg-background">
                                <tr>
                                  <th className="text-left p-2">Date</th>
                                  <th className="text-right p-2">Payment</th>
                                  <th className="text-right p-2">Principal</th>
                                  <th className="text-right p-2">Interest</th>
                                  <th className="text-right p-2">Balance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {amortizationSchedule.map((entry, index) => (
                                  <tr key={index} className="border-t border-border/40">
                                    <td className="p-2">{formatDate(entry.date)}</td>
                                    <td className="text-right p-2">{formatCurrency(entry.payment)}</td>
                                    <td className="text-right p-2">{formatCurrency(entry.principal)}</td>
                                    <td className="text-right p-2">{formatCurrency(entry.interest)}</td>
                                    <td className="text-right p-2">{formatCurrency(entry.balance)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="analysis" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateBreakEvenChart()} options={breakEvenChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Business Analysis</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Break-even Period</span>
                              <span className="font-medium">{breakEvenMonths} months</span>
                            </div>
                            {prepaymentAmount > 0 && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Early Payoff Savings</span>
                                <span className="font-medium">{formatCurrency(earlyPayoffSavings)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Effective Interest Rate</span>
                              <span className="font-medium">
                                {((totalInterest / (loanAmount - downPayment)) * 100 / (loanTerm / 12)).toFixed(2)}% APR
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Loan Summary */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Loan Summary</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• {formatCurrency(monthlyPayment)} monthly payment for {loanTerm} months</li>
                              <li>• {formatCurrency(totalInterest)} total interest over loan term</li>
                              {prepaymentAmount > 0 && (
                                <li>• Save {formatCurrency(earlyPayoffSavings)} with prepayments</li>
                              )}
                              <li>• Break-even in {breakEvenMonths} months</li>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Business Finance</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Business Loan Calculations</h2>
        <p className="mt-3 text-muted-foreground text-lg">Make informed borrowing decisions for your business growth and success</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Business Loan Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                A <strong>Business Loan Calculator</strong> is a vital financial planning tool that helps entrepreneurs and business owners understand the full cost of borrowing money. It transforms complex loan formulas into clear, actionable insights about monthly payments, total interest costs, and overall loan affordability.
              </p>
              <p className="mt-3">
                Proper loan calculation is essential for business success, as borrowing decisions directly impact:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Cash flow management and operational stability</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Business growth potential and expansion timing</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Profitability and financial performance</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Debt burden and financial risk levels</span>
                </li>
              </ul>
              <p>
                Whether you're considering financing for equipment, expansion, working capital, or other business needs, understanding the numbers behind your loan is crucial for sound financial decision-making.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Sample Loan Breakdown</h3>
                <div className="h-[200px]">
                  <Pie 
                    data={{
                      labels: ['Principal Amount', 'Total Interest'],
                      datasets: [{
                        data: [250000, 80790],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(14, 165, 233, 0.8)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } },
                        datalabels: {
                          color: '#fff',
                          font: { weight: 'bold' },
                          formatter: (value) => '$' + value.toLocaleString()
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">$250,000 business loan at 6% for 5 years</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> Nearly 43% of small businesses apply for loans to expand their business or pursue new opportunities, according to the Federal Reserve Small Business Credit Survey.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Payment Clarity</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Understand exact payment obligations and prepare your cash flow accordingly
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <LineChart className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Cost Comparison</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Compare different loan options to find the most cost-effective solution
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <PieChart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Strategic Planning</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Make data-driven decisions about financing your business goals
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* How Business Loans Work Section */}
      <div className="mb-10" id="loan-basics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-blue-600" />
          How Business Loans Work
        </h2>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Key Business Loan Components
            </CardTitle>
            <CardDescription>Understanding these elements is essential for effective loan calculations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Business loans have several critical components that determine their overall cost and structure. Calculating loan costs accurately requires understanding each of these elements and how they interact.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="mb-2 font-medium text-blue-700 dark:text-blue-400">Core Loan Elements:</p>
                  <ul className="space-y-2 text-blue-600 dark:text-blue-500">
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Principal:</span>
                      <span>The initial amount borrowed from the lender</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Interest Rate:</span>
                      <span>The cost of borrowing, expressed as an annual percentage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Loan Term:</span>
                      <span>The time period for repayment (months or years)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Payment Schedule:</span>
                      <span>Frequency of payments (monthly, quarterly, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[100px]">Fees:</span>
                      <span>Additional costs like origination fees, closing costs, etc.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>APR vs. Interest Rate:</strong> Annual Percentage Rate (APR) includes both interest and fees, providing a more comprehensive view of borrowing costs than the interest rate alone.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-3">Standard Payment Formula</h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
                    <p className="whitespace-normal break-words">
                      Payment = P × (r × (1 + r)^n) ÷ ((1 + r)^n - 1)
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Where:</p>
                      <p>P = Principal</p>
                      <p>r = Periodic interest rate (annual rate ÷ periods per year)</p>
                      <p>n = Total number of payments</p>
                    </div>
                  </div>
                </div>
                
                <Card className="overflow-hidden">
                  <CardHeader className="py-3 bg-blue-50 dark:bg-blue-900/30">
                    <CardTitle className="text-sm text-blue-700 dark:text-blue-300">Payment Allocation Over Time</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[180px]">
                      <Line 
                        data={{
                          labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                          datasets: [
                            {
                              label: 'Principal',
                              data: [44141, 46851, 49736, 52812, 56090],
                              borderColor: 'rgba(59, 130, 246, 0.8)',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              tension: 0.4
                            },
                            {
                              label: 'Interest',
                              data: [22095, 19385, 16500, 13424, 10146],
                              borderColor: 'rgba(14, 165, 233, 0.8)',
                              backgroundColor: 'rgba(14, 165, 233, 0.1)',
                              tension: 0.4
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: { callback: (value) => '$' + value.toLocaleString() }
                            }
                          },
                          plugins: {
                            legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } }
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      Payment allocation for a $250,000 loan at 6% over 5 years
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Loan Amortization
            </CardTitle>
            <CardDescription>How loan balances decrease over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  <strong>Amortization</strong> refers to the process of paying off a loan through regular payments that include both principal and interest. Understanding amortization is crucial for business owners to track how much of their loan they've paid off and how much equity they've built.
                </p>
                
                <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Key Amortization Insights</h4>
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Early payments are mostly interest, while later payments are mostly principal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Paying extra toward principal can significantly reduce overall interest costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Shorter loan terms mean higher monthly payments but lower total interest</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Early Payoff Considerations:</strong> Some business loans include prepayment penalties. Always check your loan terms before making extra payments or planning an early payoff.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-[240px]">
                  <h4 className="text-center text-sm font-medium mb-2">Loan Balance Over Time</h4>
                  <Line 
                    data={{
                      labels: ['Start', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                      datasets: [{
                        label: 'Loan Balance',
                        data: [250000, 205859, 159008, 109272, 56460, 0],
                        borderColor: 'rgba(16, 185, 129, 0.8)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
                        }
                      },
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-2 text-sm">Example Amortization Schedule (First 3 Months)</h4>
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="p-2 text-left">Payment</th>
                        <th className="p-2 text-right">Payment Amount</th>
                        <th className="p-2 text-right">Principal</th>
                        <th className="p-2 text-right">Interest</th>
                        <th className="p-2 text-right">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700">
                        <td className="p-2">1</td>
                        <td className="p-2 text-right">$4,831</td>
                        <td className="p-2 text-right">$3,581</td>
                        <td className="p-2 text-right">$1,250</td>
                        <td className="p-2 text-right">$246,419</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <td className="p-2">2</td>
                        <td className="p-2 text-right">$4,831</td>
                        <td className="p-2 text-right">$3,599</td>
                        <td className="p-2 text-right">$1,232</td>
                        <td className="p-2 text-right">$242,820</td>
                      </tr>
                      <tr>
                        <td className="p-2">3</td>
                        <td className="p-2 text-right">$4,831</td>
                        <td className="p-2 text-right">$3,617</td>
                        <td className="p-2 text-right">$1,214</td>
                        <td className="p-2 text-right">$239,203</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decision Factors Section */}
      <div className="mb-10" id="decision-factors">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl">Critical Decision Factors</span>
              </div>
            </CardTitle>
            <CardDescription>
              Key considerations when analyzing business loan options
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="loan-term-impact" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                The Impact of Loan Term Length
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    The length of your business loan term dramatically affects both monthly payments and total interest costs. Deciding between a shorter or longer term involves balancing immediate cash flow needs against long-term financial efficiency.
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Term Length Considerations:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Shorter Term Benefits</h5>
                        <ul className="space-y-1 text-blue-600 dark:text-blue-500">
                          <li>• Lower total interest costs</li>
                          <li>• Faster debt elimination</li>
                          <li>• Earlier financial freedom</li>
                          <li>• Higher business equity</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <h5 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Longer Term Benefits</h5>
                        <ul className="space-y-1 text-amber-600 dark:text-amber-500">
                          <li>• Lower monthly payments</li>
                          <li>• Improved cash flow flexibility</li>
                          <li>• More working capital</li>
                          <li>• Reduced financial stress</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-[260px]">
                  <h4 className="text-center text-sm font-medium mb-2">Term Length Comparison ($250,000 at 6%)</h4>
                  <Bar 
                    data={{
                      labels: ['3-Year Term', '5-Year Term', '7-Year Term', '10-Year Term'],
                      datasets: [
                        {
                          label: 'Monthly Payment',
                          data: [7643, 4831, 3615, 2776],
                          backgroundColor: 'rgba(59, 130, 246, 0.7)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 1,
                          yAxisID: 'y'
                        },
                        {
                          label: 'Total Interest',
                          data: [25148, 39860, 53660, 83120],
                          backgroundColor: 'rgba(14, 165, 233, 0.7)',
                          borderColor: 'rgba(14, 165, 233, 1)',
                          borderWidth: 1,
                          yAxisID: 'y1'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: { display: true, text: 'Monthly Payment ($)' },
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          grid: { drawOnChartArea: false },
                          title: { display: true, text: 'Total Interest ($)' },
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
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
                <h3 id="interest-type" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Fixed vs. Variable Interest Rates
                </h3>
                <p>
                  The choice between fixed and variable interest rates is a critical decision for business borrowers that affects both risk exposure and potential cost savings.
                </p>
                
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-700 dark:text-green-400">Fixed Rate Loans</h4>
                    <p className="text-sm mt-1 text-green-600 dark:text-green-500">
                      Interest rate remains constant throughout the loan term, providing payment stability and predictability.
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-green-600 dark:text-green-500">
                      <li>• Ideal for long-term planning and fixed budgets</li>
                      <li>• Protection from rising interest rates</li>
                      <li>• Typically start with slightly higher rates</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-700 dark:text-green-400">Variable Rate Loans</h4>
                    <p className="text-sm mt-1 text-green-600 dark:text-green-500">
                      Interest rate fluctuates based on market indexes, offering potential savings but also increased uncertainty.
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-green-600 dark:text-green-500">
                      <li>• Often start with lower initial rates</li>
                      <li>• Benefit from falling interest environments</li>
                      <li>• Typically include caps on rate increases</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Decision Tip:</strong> For short-term loans (1-3 years), variable rates often provide cost advantages. For longer terms, the stability of fixed rates may outweigh potential savings, especially in low-rate environments with likely future increases.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="loan-costs" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Understanding Total Loan Costs
                </h3>
                <p>
                  Beyond the principal and interest, business loans often include additional costs that impact the true price of borrowing. Being aware of these costs is essential for accurate comparison shopping.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Common Additional Fees</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="font-medium min-w-[130px]">Origination Fee:</span>
                        <span>Typically 1-5% of loan amount</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium min-w-[130px]">Application Fee:</span>
                        <span>$75-500 depending on lender</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium min-w-[130px]">Underwriting Fee:</span>
                        <span>$1,000-5,000 for larger loans</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium min-w-[130px]">Closing Costs:</span>
                        <span>Legal, appraisal, and documentation fees</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium min-w-[130px]">Prepayment Penalty:</span>
                        <span>Often 1-3% of remaining balance</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Calculating APR</h4>
                    <p className="mt-1 text-sm">
                      Annual Percentage Rate (APR) incorporates all loan costs into an annualized rate, allowing for more accurate comparison between loan options.
                    </p>
                    <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                      <p>APR = ((Fees + Total Interest) ÷ Principal) ÷ Loan Term in Years × 100</p>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Example Cost Breakdown</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><strong>Loan Amount:</strong> $250,000</p>
                      <p><strong>Interest Rate:</strong> 6% for 5 years</p>
                      <p><strong>Origination Fee:</strong> $5,000 (2%)</p>
                      <p><strong>Total Interest:</strong> $39,860</p>
                      <p><strong>APR:</strong> Approximately 6.8%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Loan Types Section */}
      <div className="mb-10" id="loan-types">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-blue-600" />
          Business Loan Types and Calculators
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Common Business Loan Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Term Loans</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Traditional loans with a fixed or variable interest rate and set repayment period, ideal for established businesses with good credit. Calculate payments with standard amortization formulas.
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <p><strong>Typical Terms:</strong> 1-10 years</p>
                    <p><strong>Amounts:</strong> $25,000-$500,000+</p>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">SBA Loans</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Government-backed loans with favorable terms, requiring specialized calculations that account for guarantee fees and longer terms.
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <p><strong>Typical Terms:</strong> 5-25 years</p>
                    <p><strong>Amounts:</strong> Up to $5 million</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Equipment Financing</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Loans specifically for purchasing equipment, where the equipment serves as collateral. Calculate with residual value considerations if applicable.
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <p><strong>Typical Terms:</strong> 2-7 years</p>
                    <p><strong>Amounts:</strong> Based on equipment value</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Note:</strong> Different loan types require different calculation approaches. Ensure you're using the appropriate calculator for your specific loan type to get accurate results.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-600" />
                Special Financing Calculators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium flex items-center gap-2">
                    <Percent className="h-4 w-4 text-green-600" />
                    Line of Credit Calculator
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For revolving credit facilities where interest is only charged on the amount drawn. Calculates variable payments based on utilization and helps optimize draw strategies.
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Commercial Mortgage Calculator
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Specialized for real estate purchases with longer terms, different tax considerations, and potentially balloon payment structures or refinancing options.
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    Invoice Factoring Calculator
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Helps determine the effective cost of selling invoices at a discount for immediate cash flow, accounting for advance rates, factoring fees, and reserve amounts.
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    Merchant Cash Advance Calculator
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For financing based on a percentage of future sales, helping convert factor rates into effective APR and estimate repayment timeframes based on sales projections.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="text-blue-800 dark:text-blue-300">Loan Comparison Strategy</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="font-medium mb-2">Step 1: Standardize Terms</h4>
                  <p className="text-sm text-muted-foreground">
                    When comparing different loan options, use the calculator to convert all options to the same loan amount and term for accurate comparison.
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="font-medium mb-2">Step 2: Calculate True APR</h4>
                  <p className="text-sm text-muted-foreground">
                    Look beyond the stated interest rate to calculate the APR including all fees and costs for each option.
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="font-medium mb-2">Step 3: Analyze Cash Flow Impact</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the payment schedule to understand how each loan option affects monthly cash flow and overall business operations.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Loan Calculator Best Practices</p>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                      Always include all fees in your calculations, run multiple scenarios with different rates and terms, consider the opportunity cost of capital when evaluating options, and recognize that the lowest monthly payment doesn't always mean the best deal for your business in the long run.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Considerations Section */}
      <div className="mb-10" id="business-considerations">
        <Card className="overflow-hidden border-green-200 dark:border-green-900">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Strategic Business Considerations</span>
              </div>
            </CardTitle>
            <CardDescription>
              Beyond the numbers: making smart borrowing decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">Debt Service Coverage Ratio</h3>
                <p className="mb-4">
                  The Debt Service Coverage Ratio (DSCR) is a crucial metric that measures your business's ability to service debt with its current income. Lenders typically require a minimum DSCR of 1.25, meaning your business generates 25% more income than needed for loan payments.
                </p>
                
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium mb-2">DSCR Calculation</h4>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
                    <p>DSCR = Annual Net Operating Income ÷ Annual Debt Payments</p>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>DSCR below 1.0:</span>
                      <span className="text-red-500">Negative cash flow</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>DSCR 1.0-1.24:</span>
                      <span className="text-amber-500">Risky position</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>DSCR 1.25-1.5:</span>
                      <span className="text-blue-500">Acceptable to lenders</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>DSCR above 1.5:</span>
                      <span className="text-green-500">Strong position</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Pro Tip:</strong> Calculate your DSCR before applying for financing to determine how much debt your business can realistically handle.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">Return on Invested Capital</h3>
                <p className="mb-4">
                  When borrowing for business expansion or new projects, calculate the expected Return on Invested Capital (ROIC) to ensure the investment generates enough returns to cover loan costs.
                </p>
                
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium mb-2">Simple ROI Assessment</h4>
                  <div className="space-y-4">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
                      <p>ROI = (Net Profit from Investment ÷ Cost of Investment) × 100</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p><strong>Example:</strong></p>
                      <ul className="space-y-1">
                        <li>• Equipment cost: $100,000</li>
                        <li>• Annual loan payment: $23,740 (5% for 5 years)</li>
                        <li>• Annual revenue increase: $45,000</li>
                        <li>• Annual costs (maintenance, etc.): $10,000</li>
                        <li>• Annual net profit: $35,000 - $23,740 = $11,260</li>
                        <li>• Simple ROI: 11.26% annually</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Decision Rule:</strong> For a business loan to make financial sense, the expected ROI should exceed the loan's interest rate by a significant margin (typically at least 3-5%) to account for risk and uncertainty.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium mb-3">Loan Amount Optimization Framework</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="px-3 py-2 text-left">Business Need</th>
                      <th className="px-3 py-2 text-left">Optimal Approach</th>
                      <th className="px-3 py-2 text-left">Calculation Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-700">
                      <td className="px-3 py-2">Working Capital</td>
                      <td className="px-3 py-2">Line of credit based on cash flow cycle</td>
                      <td className="px-3 py-2">Cash conversion cycle timing</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <td className="px-3 py-2">Equipment Purchase</td>
                      <td className="px-3 py-2">Term loan aligned with equipment life</td>
                      <td className="px-3 py-2">Additional revenue vs. payment</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="px-3 py-2">Business Expansion</td>
                      <td className="px-3 py-2">Term loan with growth-based projections</td>
                      <td className="px-3 py-2">Projected revenue growth timeline</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Real Estate Purchase</td>
                      <td className="px-3 py-2">Commercial mortgage with long amortization</td>
                      <td className="px-3 py-2">Rent savings vs. mortgage payment</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Making Informed Borrowing Decisions
            </CardTitle>
            <CardDescription>
              Putting your loan calculations to work
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Business loan calculators</strong> provide crucial insights that help you navigate financing decisions with confidence. By understanding the full cost of borrowing, payment structures, and long-term financial impacts, you can make strategic choices that support your business growth without compromising financial stability.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Remember these key principles when evaluating business loans:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Financial Discipline</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Calculate total cost of financing, not just monthly payments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Compare APRs rather than quoted interest rates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Maintain a minimum DSCR of 1.25 to ensure comfortable repayment</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Strategic Approach</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Match loan term to the lifespan of what you're financing</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Calculate ROI on investments financed through debt</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Balance cash flow needs with minimizing total interest costs</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to explore your business loan options?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Business Loan Calculator</strong> above to analyze different scenarios and find the right financing solution for your business needs. For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/cash-flow">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Cash Flow Projection
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/roi">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        ROI Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/debt-service">
                        <Calculator className="h-4 w-4 mr-1" />
                        DSCR Calculator
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
                  <CardTitle className="text-lg">Debt-to-Income Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate your debt-to-income ratio to understand your borrowing capacity.
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
                  <CardTitle className="text-lg">Break-Even Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Determine how long it will take for your business to become profitable.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/break-even">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">ROI Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate the return on investment for your business decisions.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/roi">Try Calculator</Link>
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