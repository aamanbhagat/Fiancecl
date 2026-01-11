"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { SaveCalculationButton } from "@/components/save-calculation-button"
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
  Car,
  Wallet,
  Clock,
  Percent,
  Calendar,
  Check
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import AutoLoanSchema from './schema';

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

export default function AutoLoanCalculator() {
  // Vehicle & Purchase Details
  const [vehiclePrice, setVehiclePrice] = useState<number>(30000)
  const [downPaymentType, setDownPaymentType] = useState<'amount' | 'percentage'>('amount')
  const [downPaymentAmount, setDownPaymentAmount] = useState<number>(3000)
  const [downPaymentPercentage, setDownPaymentPercentage] = useState<number>(10)
  const [includeTrade, setIncludeTrade] = useState<boolean>(false)
  const [tradeInValue, setTradeInValue] = useState<number>(5000)
  const [tradeInOwed, setTradeInOwed] = useState<number>(0)

  // Loan Details
  const [interestRate, setInterestRate] = useState<number>(5.9)
  const [loanTerm, setLoanTerm] = useState<number>(60)
  const [includeExtras, setIncludeExtras] = useState<boolean>(false)
  const [taxRate, setTaxRate] = useState<number>(6)
  const [fees, setFees] = useState<number>(300)
  const [extraPayment, setExtraPayment] = useState<number>(0)

  // Results State
  const [loanAmount, setLoanAmount] = useState<number>(0)
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0)
  const [totalInterest, setTotalInterest] = useState<number>(0)
  const [totalCost, setTotalCost] = useState<number>(0)
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

  // Calculate loan details and payments
  useEffect(() => {
    // Calculate down payment based on type
    const effectiveDownPayment = downPaymentType === 'amount' 
      ? downPaymentAmount 
      : (vehiclePrice * downPaymentPercentage) / 100

    // Calculate trade-in equity
    const tradeInEquity = includeTrade ? Math.max(0, tradeInValue - tradeInOwed) : 0

    // Calculate taxes and fees
    const salesTax = includeExtras ? (vehiclePrice * taxRate) / 100 : 0
    const totalFees = includeExtras ? fees : 0

    // Calculate base loan amount
    const baseLoanAmount = vehiclePrice - effectiveDownPayment - tradeInEquity + salesTax + totalFees

    // Set loan amount
    setLoanAmount(baseLoanAmount)

    // Calculate monthly payment
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm
    
    const monthlyPaymentAmount = baseLoanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    setMonthlyPayment(monthlyPaymentAmount)

    // Generate amortization schedule
    const schedule = {
      balance: [] as number[],
      principal: [] as number[],
      interest: [] as number[]
    }

    let remainingBalance = baseLoanAmount
    let totalInterestPaid = 0
    
    for (let i = 0; i < numberOfPayments; i++) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPaymentAmount - interestPayment + extraPayment
      remainingBalance = Math.max(0, remainingBalance - principalPayment)
      totalInterestPaid += interestPayment
      
      schedule.balance.push(remainingBalance)
      schedule.principal.push(principalPayment)
      schedule.interest.push(interestPayment)

      if (remainingBalance === 0) break
    }

    // Calculate payoff date
    const months = schedule.balance.length
    const payoffDateValue = new Date()
    payoffDateValue.setMonth(payoffDateValue.getMonth() + months)
    
    setAmortizationSchedule(schedule)
    setTotalInterest(totalInterestPaid)
    setTotalCost(baseLoanAmount + totalInterestPaid)
    setPayoffDate(payoffDateValue)

  }, [
    vehiclePrice,
    downPaymentType,
    downPaymentAmount,
    downPaymentPercentage,
    includeTrade,
    tradeInValue,
    tradeInOwed,
    interestRate,
    loanTerm,
    includeExtras,
    taxRate,
    fees,
    extraPayment
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
          return ((value / totalCost) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Amortization chart
  const generateAmortizationChart = () => {
    const years = Array.from(
      { length: Math.ceil(amortizationSchedule.balance.length / 12) },
      (_, i) => `Year ${i + 1}`
    )
    
    return {
      labels: years,
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

  // Compare loan terms chart
  const generateTermComparisonChart = () => {
    const terms = [36, 48, 60, 72]
    const payments = terms.map(term => {
      const monthlyRate = interestRate / 100 / 12
      return loanAmount * 
        (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
        (Math.pow(1 + monthlyRate, term) - 1)
    })

    return {
      labels: terms.map(term => `${term} months`),
      datasets: [
        {
          label: 'Monthly Payment',
          data: payments,
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
        formatter: (value: number) => '$' + value.toFixed(0)
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${(context.raw as number).toLocaleString()}`
        }
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
    pdf.save('auto-loan-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <AutoLoanSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Auto Loan <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your monthly car payments and understand the total cost of your auto loan.
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
                    <CardTitle>Enter Vehicle & Loan Details</CardTitle>
                    <CardDescription>
                      Provide information about the vehicle purchase and loan terms to calculate payments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Vehicle & Purchase Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Vehicle & Purchase Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="vehicle-price">Vehicle Price</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="vehicle-price"
                              type="number"
                              className="pl-9"
                              value={vehiclePrice || ''} onChange={(e) => setVehiclePrice(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="down-payment-type">Down Payment Type</Label>
                          <Select 
                            value={downPaymentType} 
                            onValueChange={(value) => setDownPaymentType(value as 'amount' | 'percentage')}
                          >
                            <SelectTrigger id="down-payment-type">
                              <SelectValue placeholder="Select down payment type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="amount">Dollar Amount</SelectItem>
                              <SelectItem value="percentage">Percentage</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {downPaymentType === 'amount' ? (
                          <div className="space-y-2">
                            <Label htmlFor="down-payment-amount">Down Payment Amount</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="down-payment-amount"
                                type="number"
                                className="pl-9"
                                value={downPaymentAmount || ''} onChange={(e) => setDownPaymentAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {((downPaymentAmount / vehiclePrice) * 100).toFixed(1)}% of vehicle price
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="down-payment-percent">Down Payment Percentage</Label>
                              <span className="text-sm text-muted-foreground">{downPaymentPercentage}%</span>
                            </div>
                            <Slider
                              id="down-payment-percent"
                              min={0}
                              max={100}
                              step={1}
                              value={[downPaymentPercentage]}
                              onValueChange={(value) => setDownPaymentPercentage(value[0])}
                            />
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency((vehiclePrice * downPaymentPercentage) / 100)}
                            </p>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="trade-in">Include Trade-In</Label>
                            <Switch
                              id="trade-in"
                              checked={includeTrade}
                              onCheckedChange={setIncludeTrade}
                            />
                          </div>
                          {includeTrade && (
                            <div className="space-y-2">
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="trade-in-value"
                                  type="number"
                                  className="pl-9"
                                  placeholder="Trade-in value"
                                  value={tradeInValue || ''} onChange={(e) => setTradeInValue(e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </div>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="trade-in-owed"
                                  type="number"
                                  className="pl-9"
                                  placeholder="Amount owed on trade-in"
                                  value={tradeInOwed || ''} onChange={(e) => setTradeInOwed(e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Loan Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Loan Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interest-rate">Interest Rate (APR)</Label>
                            <span className="text-sm text-muted-foreground">{interestRate}%</span>
                          </div>
                          <Slider
                            id="interest-rate"
                            min={0}
                            max={25}
                            step={0.1}
                            value={[interestRate]}
                            onValueChange={(value) => setInterestRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loan-term">Loan Term</Label>
                          <Select value={String(loanTerm)} onValueChange={(value) => setLoanTerm(Number(value))}>
                            <SelectTrigger id="loan-term">
                              <SelectValue placeholder="Select loan term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="36">36 months (3 years)</SelectItem>
                              <SelectItem value="48">48 months (4 years)</SelectItem>
                              <SelectItem value="60">60 months (5 years)</SelectItem>
                              <SelectItem value="72">72 months (6 years)</SelectItem>
                              <SelectItem value="84">84 months (7 years)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="extras">Include Tax & Fees</Label>
                            <Switch
                              id="extras"
                              checked={includeExtras}
                              onCheckedChange={setIncludeExtras}
                            />
                          </div>
                          {includeExtras && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="tax-rate">Sales Tax Rate</Label>
                                <span className="text-sm text-muted-foreground">{taxRate}%</span>
                              </div>
                              <Slider
                                id="tax-rate"
                                min={0}
                                max={15}
                                step={0.1}
                                value={[taxRate]}
                                onValueChange={(value) => setTaxRate(value[0])}
                              />
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="fees"
                                  type="number"
                                  className="pl-9"
                                  placeholder="Additional fees"
                                  value={fees || ''} onChange={(e) => setFees(e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="extra-payment">Extra Monthly Payment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="extra-payment"
                              type="number"
                              className="pl-9"
                              value={extraPayment || ''} onChange={(e) => setExtraPayment(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Optional: Add extra monthly payment to pay off loan faster
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
                      {extraPayment > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Including {formatCurrency(extraPayment)} extra monthly payment
                        </p>
                      )}
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                        <TabsTrigger value="amortization">Amortization</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Loan Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Vehicle Price</span>
                              <span className="font-medium">{formatCurrency(vehiclePrice)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Down Payment</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  downPaymentType === 'amount'
                                    ? downPaymentAmount
                                    : (vehiclePrice * downPaymentPercentage) / 100
                                )}
                              </span>
                            </div>
                            {includeTrade && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Trade-In Equity</span>
                                <span className="font-medium">{formatCurrency(Math.max(0, tradeInValue - tradeInOwed))}</span>
                              </div>
                            )}
                            {includeExtras && (
                              <>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                  <span className="text-sm">Sales Tax</span>
                                  <span className="font-medium">{formatCurrency((vehiclePrice * taxRate) / 100)}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                  <span className="text-sm">Fees</span>
                                  <span className="font-medium">{formatCurrency(fees)}</span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Loan Amount</span>
                              <span className="font-medium">{formatCurrency(loanAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Interest</span>
                              <span className="font-medium">{formatCurrency(totalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Cost</span>
                              <span>{formatCurrency(totalCost)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={generateTermComparisonChart()} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Loan Term Comparison</h4>
                          <p className="text-sm text-muted-foreground">
                            Compare monthly payments across different loan terms. A longer term means lower monthly payments but more interest paid over time.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="amortization" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateAmortizationChart()} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Loan Payoff Details</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Estimated Payoff Date</span>
                              <span className="font-medium">{formatDate(payoffDate)}</span>
                            </div>
                            {extraPayment > 0 && (
                              <div className="flex items-start gap-2 bg-primary/10 p-4 rounded-lg">
                                <Info className="h-4 w-4 mt-1 text-primary" />
                                <div>
                                  <p className="font-medium">Early Payoff Analysis</p>
                                  <p className="text-sm text-muted-foreground">
                                    By paying an extra {formatCurrency(extraPayment)} per month, you'll pay off the loan {Math.floor((loanTerm - amortizationSchedule.balance.length) / 12)} years and {((loanTerm - amortizationSchedule.balance.length) % 12)} months earlier, saving {formatCurrency(loanTerm * monthlyPayment - totalCost)} in interest.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  
                  <SaveCalculationButton
                    calculatorType="auto-loan"
                    inputs={{
                      vehiclePrice,
                      downPaymentAmount,
                      tradeInValue,
                      interestRate,
                      loanTerm,
                      taxRate,
                      extraPayment
                    }}
                    results={{
                      loanAmount,
                      monthlyPayment,
                      totalInterest,
                      totalCost,
                      amortizationSchedule
                    }}
                  />
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
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Auto Finance Tool</span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Auto Loan Calculator: Make Smarter Car Buying Decisions</h2>
                <p className="mt-3 text-muted-foreground text-lg">Understand your auto financing options and find the best payment plan for your budget</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding Auto Loan Calculators
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p>
                        An <strong>Auto Loan Calculator</strong> is an essential tool for anyone looking to finance a vehicle purchase. It helps you understand the full financial impact of an auto loan by calculating monthly payments, total interest costs, and your overall payment schedule based on loan terms and interest rates.
                      </p>
                      <p className="mt-3">
                        When calculating an auto loan, several key factors determine your payment amount:
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Vehicle price and down payment amount</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Interest rate (APR) and loan term length</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Trade-in value and taxes/fees</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>Payment frequency and additional payments</span>
                        </li>
                      </ul>
                      <p>
                        Using an auto loan calculator before shopping for vehicles helps you set a realistic budget, compare different financing options, and potentially save thousands over the life of your loan.
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Average Auto Loan Statistics (2025)</h3>
                        <div className="h-[200px]">
                          <Bar 
                            data={{
                              labels: ['New Car', 'Used Car', 'Refinance'],
                              datasets: [
                                {
                                  label: 'Average Loan Amount',
                                  data: [43500, 28700, 25900],
                                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                  borderColor: 'rgba(59, 130, 246, 1)',
                                  borderWidth: 1
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
                                  beginAtZero: true,
                                  ticks: { callback: (value) => '$' + value.toLocaleString() }
                                }
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Data based on recent national auto financing trends</p>
                      </div>
                      
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          <strong>Did You Know?</strong> The average new car loan term has increased to 72 months, with some lenders offering 84-month terms. While longer terms reduce your monthly payment, they significantly increase the total interest paid over the life of the loan.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Auto Loan Factors Section */}
              <div className="mb-10" id="loan-factors">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  Key Factors That Impact Your Auto Loan
                </h2>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="interest-rates" className="font-bold text-xl mb-4">Understanding Interest Rates</h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-4">
                        Your auto loan's interest rate (APR) is one of the most significant factors affecting both your monthly payment and the total cost of your vehicle. Even small differences in APR can translate to hundreds or thousands of dollars over the life of your loan.
                      </p>
                      
                      <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                        <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Factors That Determine Your Auto Loan Rate:</p>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">1</span>
                            <div>
                              <p className="font-medium text-blue-800 dark:text-blue- étrange"><strong>Credit Score</strong></p>
                              <p className="text-blue-700 dark:text-blue-400">Higher scores (720+) qualify for the best rates; substantial increases typically occur below 660</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">2</span>
                            <div>
                              <p className="font-medium text-blue-800 dark:text-blue-300"><strong>Loan Term</strong></p>
                              <p className="text-blue-700 dark:text-blue-400">Shorter terms (36-48 months) generally offer lower rates than longer terms (72-84 months)</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">3</span>
                            <div>
                              <p className="font-medium text-blue-800 dark:text-blue-300"><strong>New vs. Used</strong></p>
                              <p className="text-blue-700 dark:text-blue-400">New vehicles typically qualify for lower interest rates than used vehicles</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">4</span>
                            <div>
                              <p className="font-medium text-blue-800 dark:text-blue-300"><strong>Down Payment</strong></p>
                              <p className="text-blue-700 dark:text-blue-400">Larger down payments may qualify you for better rates by reducing lender risk</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <h4 className="font-medium mb-3">APR Impact on $30,000 Car Loan (60 months)</h4>
                        <div className="h-[180px]">
                          <Bar
                            data={{
                              labels: ['3% APR', '5% APR', '7% APR', '9% APR', '12% APR'],
                              datasets: [{
                                label: 'Total Interest Paid',
                                data: [2346, 3968, 5640, 7362, 10128],
                                backgroundColor: [
                                  'rgba(14, 165, 233, 0.7)',
                                  'rgba(59, 130, 246, 0.7)',
                                  'rgba(99, 102, 241, 0.7)',
                                  'rgba(139, 92, 246, 0.7)',
                                  'rgba(236, 72, 153, 0.7)'
                                ]
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { 
                                legend: { display: false },
                                tooltip: {
                                  callbacks: {
                                    label: (context) => `$${typeof context.raw === 'number' ? context.raw.toLocaleString() : String(context.raw)}`
                                  }
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: { callback: (value) => `$${value.toLocaleString()}` }
                                }
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">Higher rates dramatically increase your overall cost</p>
                      </div>
                      
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                          <p className="text-sm text-green-700 dark:text-green-400">
                            <strong>Pro Tip:</strong> Get pre-approved for financing before visiting dealerships. This gives you leverage when negotiating and protects you from potentially high-interest dealer financing arrangements.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 id="loan-term" className="font-bold text-xl mt-8 mb-4">Loan Term Length: Finding the Right Balance</h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-3">
                        The loan term you select dramatically impacts both your monthly payment and the total amount you'll pay for your vehicle. While longer terms reduce your monthly obligation, they increase the total interest paid and can lead to owing more than the car is worth (negative equity).
                      </p>
                      
                      <div className="space-y-4 mt-4">
                        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300">Common Auto Loan Terms:</h4>
                          
                          <ul className="mt-3 space-y-3">
                            <li className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">36-48 Months (3-4 years)</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                  Higher monthly payments but lowest total interest; recommended for used vehicles
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">60 Months (5 years)</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                  Most common term; balances affordable payments with reasonable interest costs
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">72-84 Months (6-7 years)</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                  Lowest monthly payments but highest total interest; higher risk of negative equity
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="h-[220px]">
                        <Line
                          data={{
                            labels: ['36 mo', '48 mo', '60 mo', '72 mo', '84 mo'],
                            datasets: [
                              {
                                label: 'Monthly Payment',
                                data: [886, 677, 551, 468, 409],
                                borderColor: 'rgba(59, 130, 246, 0.8)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                tension: 0.4,
                                yAxisID: 'y'
                              },
                              {
                                label: 'Total Interest Paid',
                                data: [1896, 2496, 3060, 3696, 4356],
                                borderColor: 'rgba(236, 72, 153, 0.8)',
                                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                                tension: 0.4,
                                borderDash: [5, 5],
                                yAxisID: 'y1'
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              title: {
                                display: true,
                                text: '$30,000 Loan at 5% APR by Term Length'
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                position: 'left',
                                title: { display: true, text: 'Monthly Payment' },
                                ticks: { callback: (value) => `$${value}` }
                              },
                              y1: {
                                beginAtZero: true,
                                position: 'right',
                                grid: { drawOnChartArea: false },
                                title: { display: true, text: 'Total Interest' },
                                ticks: { callback: (value) => `$${value}` }
                              }
                            }
                          }}
                        />
                      </div>
                      
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <p className="text-sm text-amber-700 dark:text-amber-400">
                            <strong>Negative Equity Risk:</strong> With longer loan terms, your car depreciates faster than you build equity. A 72+ month loan means you'll likely be "underwater" (owing more than the car is worth) for 3-4 years, making it difficult to sell or trade-in without paying additional money.
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
                      <strong>Down Payment Benefits:</strong> A substantial down payment (20%+ of vehicle price) reduces your loan amount, decreases monthly payments, may qualify you for better interest rates, and provides immediate equity in your vehicle. This helps protect against depreciation and can save thousands in interest over the loan term.
                    </p>
                  </div>
                </div>
              </div>

              {/* Using the Calculator Section */}
              <div className="mb-10" id="calculator-guide">
                <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <span className="text-2xl">Using the Auto Loan Calculator</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      How to calculate payments and compare auto financing options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 id="calculator-inputs" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Essential Calculator Inputs
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="font-medium text-green-800 dark:text-green-300">Vehicle & Loan Information</h4>
                            <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5" />
                                <span><strong>Vehicle price:</strong> The purchase price before taxes and fees</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5" />
                                <span><strong>Down payment:</strong> Initial payment that reduces your loan amount</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Wallet className="h-4 w-4 mt-0.5" />
                                <span><strong>Trade-in value:</strong> Credit for your existing vehicle (if applicable)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5" />
                                <span><strong>Taxes & fees:</strong> Sales tax rate and registration/documentation fees</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="font-medium text-green-800 dark:text-green-300">Loan Terms & Options</h4>
                            <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                              <li className="flex items-start gap-2">
                                <Percent className="h-4 w-4 mt-0.5" />
                                <span><strong>Interest rate (APR):</strong> Annual percentage rate for the loan</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 mt-0.5" />
                                <span><strong>Loan term:</strong> Length of loan in months (36, 48, 60, 72, etc.)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 mt-0.5" />
                                <span><strong>Payment start date:</strong> When your first payment is due</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 id="calculator-results" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Understanding Your Results
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300">Key Output Values</h4>
                            
                            <div className="mt-4 space-y-3">
                              <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">Monthly Payment</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    The fixed amount you'll pay each month including principal and interest
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">Total Loan Cost</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    Full amount paid over loan term (principal + interest)
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">Total Interest Paid</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    The cost of borrowing over the full loan term
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">Amortization Schedule</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    Month-by-month breakdown of payments, showing principal and interest
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <p className="text-sm text-blue-700 dark:text-blue-400">
                                <strong>Pro Tip:</strong> Use the calculator to compare different scenarios by adjusting down payment amounts, loan terms, or interest rates. This helps you find the optimal balance between affordable monthly payments and minimizing total interest costs.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <h3 id="affordability" className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-6 mb-4 flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Assessing Affordability
                        </h3>
                        
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                          <h4 className="font-medium text-purple-800 dark:text-purple-300">The 20/4/10 Rule</h4>
                          <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                            Financial experts often recommend the 20/4/10 rule for auto purchases:
                          </p>
                          <ul className="mt-3 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                            <li className="flex items-start gap-2">
                              <DollarSign className="h-4 w-4 mt-0.5" />
                              <span><strong>20%</strong> down payment minimum</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 mt-0.5" />
                              <span><strong>4 years</strong> maximum loan term</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Percent className="h-4 w-4 mt-0.5" />
                              <span><strong>10%</strong> of monthly income maximum for all car expenses (payment, insurance, gas, maintenance)</span>
                            </li>
                          </ul>
                          <p className="text-xs mt-2 text-purple-600 dark:text-purple-500">Following this rule helps ensure your car doesn't become a financial burden</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-8" />
                    
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      Example Auto Loan Comparisons
                    </h3>
                    
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="border-orange-200 dark:border-orange-800">
                        <CardHeader className="bg-orange-50 dark:bg-orange-900/30 py-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-orange-600" />
                            Economy Option: 60 Months
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Vehicle price:</span>
                              <span className="font-medium">$25,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Down payment (10%):</span>
                              <span className="font-medium">$2,500</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Loan amount:</span>
                              <span className="font-medium">$22,500</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Interest rate:</span>
                              <span className="font-medium">4.9%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Loan term:</span>
                              <span className="font-medium">60 months</span>
                            </div>
                            <div className="flex justify-between bg-orange-50 dark:bg-orange-900/20 p-1 rounded">
                              <span className="text-sm font-medium">Monthly payment:</span>
                              <span className="font-bold">$424</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total interest paid:</span>
                              <span className="font-medium">$2,926</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-blue-600" />
                            Mid-Range: 60 Months
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Vehicle price:</span>
                              <span className="font-medium">$35,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Down payment (15%):</span>
                              <span className="font-medium">$5,250</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Loan amount:</span>
                              <span className="font-medium">$29,750</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Interest rate:</span>
                              <span className="font-medium">4.5%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Loan term:</span>
                              <span className="font-medium">60 months</span>
                            </div>
                            <div className="flex justify-between bg-blue-50 dark:bg-blue-900/20 p-1 rounded">
                              <span className="text-sm font-medium">Monthly payment:</span>
                              <span className="font-bold">$554</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total interest paid:</span>
                              <span className="font-medium">$3,498</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-green-600" />
                            Optimal Approach: 48 Months
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Vehicle price:</span>
                              <span className="font-medium">$35,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Down payment (20%):</span>
                              <span className="font-medium">$7,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Loan amount:</span>
                              <span className="font-medium">$28,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Interest rate:</span>
                              <span className="font-medium">3.9%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Loan term:</span>
                              <span className="font-medium">48 months</span>
                            </div>
                            <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-1 rounded">
                              <span className="text-sm font-medium">Monthly payment:</span>
                              <span className="font-bold">$631</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total interest paid:</span>
                              <span className="font-medium">$2,295</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 dark:text-amber-300">Key Insights from Examples</p>
                          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                            Note how the "Optimal Approach" has higher monthly payments than the "Mid-Range" option despite being for the same vehicle price. However, the shorter term and larger down payment result in a significantly lower total interest cost ($2,295 vs $3,498) – a savings of $1,203. Additionally, the higher down payment provides instant equity and protection against depreciation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Strategic Considerations Section */}
              <div className="mb-10" id="strategy-section">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Wallet className="h-6 w-6 text-blue-600" />
                  Strategic Auto Financing Considerations
                </h2>
                
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-bold mb-4">Dealer Financing vs. Outside Lenders</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <Wallet className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-800 dark:text-blue-300">Dealership Financing</h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                <strong>Pros:</strong> Convenient one-stop shopping, special manufacturer promotions (0% APR), ability to negotiate terms
                                <br />
                                <strong>Cons:</strong> Potentially higher interest rates, pressure to accept add-ons, hidden fees
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <Wallet className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-800 dark:text-blue-300">Bank/Credit Union Loans</h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                <strong>Pros:</strong> Generally lower rates, pre-approval gives negotiating power, no pressure for add-ons
                                <br />
                                <strong>Cons:</strong> Additional step in car-buying process, may miss dealer-specific promotions
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <Wallet className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-800 dark:text-blue-300">Online Lenders</h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                <strong>Pros:</strong> Convenient application process, quick pre-approval, competitive rates for excellent credit
                                <br />
                                <strong>Cons:</strong> Potentially higher rates for average or poor credit, less personalized service
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold mb-4">Special Financing Considerations</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                              <Percent className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-800 dark:text-purple-300">Zero Percent Financing</h4>
                              <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                                0% APR offers can save thousands in interest, but often require excellent credit (740+). Compare carefully with rebate options, as sometimes taking a cash rebate and standard financing is the better deal.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                              <Wallet className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-800 dark:text-purple-300">Cash Rebates vs. Low APR</h4>
                              <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                                Manufacturers often offer either cash rebates OR special low-interest financing. Use the auto loan calculator to compare the total cost of both options to determine which saves you more money over the loan term.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                              <Clock className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-800 dark:text-purple-300">Refinancing Opportunities</h4>
                              <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                                If interest rates drop significantly or your credit score improves substantially, refinancing your auto loan can lower your monthly payment and total interest. Most beneficial early in the loan when interest costs are highest.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          <strong>Negotiation Tip:</strong> Focus on negotiating the total vehicle price before mentioning financing. Dealers sometimes offer attractive financing terms but raise the vehicle price to compensate. Get the best price first, then discuss financing options or use your pre-approved loan if it offers better terms.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h3 id="beyond-payment" className="text-xl font-bold mb-4">Beyond the Monthly Payment</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-blue-200 dark:border-blue-900">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total Cost of Ownership</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">
                        Your auto loan payment is just one part of vehicle ownership costs. When budgeting, remember to include:
                      </p>
                      <div className="flex items-start gap-2">
                        <Wallet className="h-4 w-4 text-blue-600 mt-1" />
                        <p className="text-sm"><strong>Insurance:</strong> $1,500-$3,000+ annually depending on vehicle type and coverage</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Wallet className="h-4 w-4 text-blue-600 mt-1" />
                        <p className="text-sm"><strong>Fuel:</strong> $1,500-$4,000+ annually depending on vehicle efficiency and driving habits</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Wallet className="h-4 w-4 text-blue-600 mt-1" />
                        <p className="text-sm"><strong>Maintenance:</strong> $500-$1,500+ annually for routine service and unexpected repairs</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Wallet className="h-4 w-4 text-blue-600 mt-1" />
                        <p className="text-sm"><strong>Registration/Taxes:</strong> $200-$800+ annually depending on vehicle value and location</p>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        These costs can add 50-100% to your monthly vehicle expense beyond the loan payment
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-200 dark:border-purple-900">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Protecting Your Investment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-purple-600 mt-1" />
                        <p className="text-sm"><strong>Gap Insurance:</strong> Consider this if your down payment is less than 20%. It covers the difference between what you owe and what your car is worth if it's totaled.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-purple-600 mt-1" />
                        <p className="text-sm"><strong>Extended Warranties:</strong> Evaluate carefully - third-party warranties are often less expensive than dealer options but research provider reliability.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-purple-600 mt-1" />
                        <p className="text-sm"><strong>Extra Payments:</strong> Making one additional payment per year can shorten your loan term by months and save substantial interest.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-purple-600 mt-1" />
                        <p className="text-sm"><strong>Maintenance Plan:</strong> Following the manufacturer's maintenance schedule preserves value and prevents costly repairs.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      <strong>Understanding Depreciation:</strong> New vehicles typically lose 20-30% of their value in the first year and 50-60% by year five. This rapid depreciation is why large down payments and shorter loan terms are recommended - they help ensure you don't end up owing more than your car is worth (being "underwater" on your loan).
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
                      Making Informed Auto Financing Decisions
                    </CardTitle>
                    <CardDescription>
                      Balancing affordability today with financial well-being tomorrow
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      An <strong>Auto Loan Calculator</strong> empowers you to look beyond attractive monthly payment figures to understand the true cost of vehicle financing. By comparing different scenarios—adjusting factors like down payment amounts, interest rates, and loan terms—you can find an approach that balances comfortable monthly payments with responsible long-term financial planning.
                    </p>
                    
                    <p className="mt-4" id="key-takeaways">
                      Remember these key principles when financing your next vehicle:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Financial Best Practices</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Shop for financing before visiting dealerships</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Make the largest down payment you can reasonably afford</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Choose the shortest loan term that fits your budget</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Questions to Ask Before Signing</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">What is the total cost including all fees and interest?</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Are there prepayment penalties if I pay off early?</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">How does this car's depreciation compare to alternatives?</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to calculate your auto loan options?</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use our <strong>Auto Loan Calculator</strong> above to explore different financing scenarios! For more financial planning tools, explore our related calculators:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/affordability">
                                <Wallet className="h-4 w-4 mr-1" />
                                Vehicle Affordability
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/refinance">
                                <Calculator className="h-4 w-4 mr-1" />
                                Auto Refinance
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/budget">
                                <Wallet className="h-4 w-4 mr-1" />
                                Budget Planning
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
                  <CardTitle className="text-lg">Lease vs. Buy Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compare the costs of leasing versus buying a vehicle to make an informed decision.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/lease-vs-buy">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Auto Lease Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate monthly lease payments and understand the total cost of leasing a vehicle.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/auto-lease">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Auto Refinance Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    See how much you could save by refinancing your current auto loan.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/auto-refinance">Try Calculator</Link>
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