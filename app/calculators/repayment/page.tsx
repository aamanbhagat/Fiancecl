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
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Calendar, Clock, TrendingDown, Percent, BadgeDollarSign, Wallet, Hourglass, Target, AlertTriangle, XCircle, CheckCircle, ChevronRight, Home } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement, ChartOptions } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import Link from 'next/link'
import RepaymentSchema from './schema';

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

interface PaymentSchedule {
  payment: number
  principal: number
  interest: number
  balance: number
  date: Date
  extraPayment: number
}

export default function RepaymentCalculator() {
  // Loan Details
  const [loanAmount, setLoanAmount] = useState(50000)
  const [interestRate, setInterestRate] = useState(6.5)
  const [loanTerm, setLoanTerm] = useState(5)
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'bi-weekly' | 'weekly'>('monthly')
  const [startDate, setStartDate] = useState(new Date())
  
  // Additional Options
  const [originationFee, setOriginationFee] = useState(0)
  const [includeOriginationFee, setIncludeOriginationFee] = useState(false)
  const [extraPayment, setExtraPayment] = useState(0)
  const [extraPaymentFrequency, setExtraPaymentFrequency] = useState<'one-time' | 'monthly'>('monthly')
  const [extraPaymentStartDate, setExtraPaymentStartDate] = useState(new Date())
  const [balloonPayment, setBalloonPayment] = useState(0)
  const [includeBalloonPayment, setIncludeBalloonPayment] = useState(false)
  
  // Results State
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [payoffDate, setPayoffDate] = useState<Date>(new Date())
  const [amortizationSchedule, setAmortizationSchedule] = useState<PaymentSchedule[]>([])
  const [interestSaved, setInterestSaved] = useState(0)
  const [timeReduced, setTimeReduced] = useState(0)

  // Calculate loan amortization and payments
  useEffect(() => {
    // Calculate periodic interest rate
    const periodsPerYear = paymentFrequency === 'monthly' ? 12 : paymentFrequency === 'bi-weekly' ? 26 : 52
    const periodicRate = (interestRate / 100) / periodsPerYear
    const totalPeriods = loanTerm * periodsPerYear
    
    // Calculate base loan amount including origination fee if selected
    const baseLoanAmount = includeOriginationFee ? loanAmount + originationFee : loanAmount
    
    // Calculate base periodic payment (without extra payments)
    const basePayment = baseLoanAmount * 
      (periodicRate * Math.pow(1 + periodicRate, totalPeriods)) / 
      (Math.pow(1 + periodicRate, totalPeriods) - 1)
    
    // Generate amortization schedule
    let schedule: PaymentSchedule[] = []
    let balance = baseLoanAmount
    let currentDate = new Date(startDate)
    let totalInterestPaid = 0
    
    for (let period = 0; period < totalPeriods && balance > 0; period++) {
      const interestPayment = balance * periodicRate
      let principalPayment = basePayment - interestPayment
      let extraPaymentAmount = 0
      
      // Add extra payment if applicable
      if (extraPayment > 0) {
        if (extraPaymentFrequency === 'monthly' && period % (periodsPerYear / 12) === 0) {
          extraPaymentAmount = extraPayment
        } else if (extraPaymentFrequency === 'one-time' && period === 0) {
          extraPaymentAmount = extraPayment
        }
      }
      
      // Adjust for balloon payment on last period
      if (includeBalloonPayment && period === totalPeriods - 1) {
        principalPayment = balance - balloonPayment
      }
      
      // Calculate total payment and update balance
      principalPayment = Math.min(principalPayment + extraPaymentAmount, balance)
      balance = Math.max(0, balance - principalPayment)
      totalInterestPaid += interestPayment
      
      // Add payment to schedule
      schedule.push({
        payment: principalPayment + interestPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance,
        date: new Date(currentDate),
        extraPayment: extraPaymentAmount
      })
      
      // Increment date based on payment frequency
      if (paymentFrequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1)
      } else if (paymentFrequency === 'bi-weekly') {
        currentDate.setDate(currentDate.getDate() + 14)
      } else {
        currentDate.setDate(currentDate.getDate() + 7)
      }
      
      // Break if loan is paid off
      if (balance === 0) break
    }
    
    // Calculate savings from extra payments
    const baseSchedule = generateBaseSchedule(baseLoanAmount, periodicRate, totalPeriods)
    const interestSavings = baseSchedule.totalInterest - totalInterestPaid
    const timeReductionMonths = Math.round((baseSchedule.schedule.length - schedule.length) * (12 / periodsPerYear))
    
    // Update state with calculations
    setMonthlyPayment(basePayment)
    setTotalInterest(totalInterestPaid)
    setTotalCost(baseLoanAmount + totalInterestPaid)
    setPayoffDate(schedule[schedule.length - 1].date)
    setAmortizationSchedule(schedule)
    setInterestSaved(interestSavings)
    setTimeReduced(timeReductionMonths)
    
  }, [
    loanAmount,
    interestRate,
    loanTerm,
    paymentFrequency,
    startDate,
    originationFee,
    includeOriginationFee,
    extraPayment,
    extraPaymentFrequency,
    extraPaymentStartDate,
    balloonPayment,
    includeBalloonPayment
  ])

  // Generate base schedule for comparison
  const generateBaseSchedule = (principal: number, periodicRate: number, periods: number) => {
    const payment = principal * 
      (periodicRate * Math.pow(1 + periodicRate, periods)) / 
      (Math.pow(1 + periodicRate, periods) - 1)
    
    let schedule: PaymentSchedule[] = []
    let balance = principal
    let totalInterest = 0
    let currentDate = new Date(startDate)
    
    for (let period = 0; period < periods && balance > 0; period++) {
      const interest = balance * periodicRate
      const principalPart = payment - interest
      
      balance = Math.max(0, balance - principalPart)
      totalInterest += interest
      
      schedule.push({
        payment,
        principal: principalPart,
        interest,
        balance,
        date: new Date(currentDate),
        extraPayment: 0
      })
      
      if (paymentFrequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1)
      } else if (paymentFrequency === 'bi-weekly') {
        currentDate.setDate(currentDate.getDate() + 14)
      } else {
        currentDate.setDate(currentDate.getDate() + 7)
      }
    }
    
    return { schedule, totalInterest }
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
            .map(payment => payment.balance),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Principal Paid',
          data: amortizationSchedule
            .filter((_, i) => i % 12 === 0)
            .map(payment => payment.principal),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4
        },
        {
          label: 'Interest Paid',
          data: amortizationSchedule
            .filter((_, i) => i % 12 === 0)
            .map(payment => payment.interest),
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return format(date, 'MMMM yyyy')
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
    pdf.save('repayment-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <RepaymentSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Repayment <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your loan repayment schedule and explore different payment strategies to become debt-free faster.
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
                      Provide information about your loan to calculate the repayment schedule.
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
                              value={loanAmount || ''} onChange={(e) => setLoanAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interest-rate">Interest Rate (APR)</Label>
                            <span className="text-sm text-muted-foreground">{interestRate}%</span>
                          </div>
                          <Slider
                            id="interest-rate"
                            min={1}
                            max={30}
                            step={0.1}
                            value={[interestRate]}
                            onValueChange={(value) => setInterestRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loan-term">Loan Term (Years)</Label>
                          <Select value={String(loanTerm)} onValueChange={(value) => setLoanTerm(Number(value))}>
                            <SelectTrigger id="loan-term">
                              <SelectValue placeholder="Select loan term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Year</SelectItem>
                              <SelectItem value="2">2 Years</SelectItem>
                              <SelectItem value="3">3 Years</SelectItem>
                              <SelectItem value="4">4 Years</SelectItem>
                              <SelectItem value="5">5 Years</SelectItem>
                              <SelectItem value="7">7 Years</SelectItem>
                              <SelectItem value="10">10 Years</SelectItem>
                              <SelectItem value="15">15 Years</SelectItem>
                              <SelectItem value="20">20 Years</SelectItem>
                              <SelectItem value="25">25 Years</SelectItem>
                              <SelectItem value="30">30 Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-frequency">Payment Frequency</Label>
                          <Select 
                            value={paymentFrequency} 
                            onValueChange={(value) => setPaymentFrequency(value as 'monthly' | 'bi-weekly' | 'weekly')}
                          >
                            <SelectTrigger id="payment-frequency">
                              <SelectValue placeholder="Select payment frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Options</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="origination-fee-toggle">Include Origination Fee</Label>
                            <Switch
                              id="origination-fee-toggle"
                              checked={includeOriginationFee}
                              onCheckedChange={setIncludeOriginationFee}
                            />
                          </div>
                          {includeOriginationFee && (
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="origination-fee"
                                type="number"
                                className="pl-9"
                                value={originationFee || ''} onChange={(e) => setOriginationFee(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="extra-payment">Extra Payment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="extra-payment"
                              type="number"
                              className="pl-9"
                              value={extraPayment || ''} onChange={(e) => setExtraPayment(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                          <Select 
                            value={extraPaymentFrequency} 
                            onValueChange={(value) => setExtraPaymentFrequency(value as 'one-time' | 'monthly')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Extra payment frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="one-time">One-Time Payment</SelectItem>
                              <SelectItem value="monthly">Monthly Extra Payment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="balloon-payment-toggle">Include Balloon Payment</Label>
                            <Switch
                              id="balloon-payment-toggle"
                              checked={includeBalloonPayment}
                              onCheckedChange={setIncludeBalloonPayment}
                            />
                          </div>
                          {includeBalloonPayment && (
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="balloon-payment"
                                type="number"
                                className="pl-9"
                                value={balloonPayment || ''} onChange={(e) => setBalloonPayment(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
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
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="savings">Savings</TabsTrigger>
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
                            {includeOriginationFee && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Origination Fee</span>
                                <span className="font-medium">{formatCurrency(originationFee)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Cost</span>
                              <span>{formatCurrency(totalCost)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="schedule" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateAmortizationChart()} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Payment Schedule</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">First Payment Date</span>
                              <span className="font-medium">{formatDate(startDate)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Last Payment Date</span>
                              <span className="font-medium">{formatDate(payoffDate)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Payments</span>
                              <span className="font-medium">{amortizationSchedule.length}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="savings" className="space-y-4">
                        {extraPayment > 0 ? (
                          <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-primary/10">
                              <h4 className="font-medium mb-2">Extra Payment Impact</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Interest Saved</span>
                                  <span className="font-medium">{formatCurrency(interestSaved)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Time Saved</span>
                                  <span className="font-medium">{timeReduced} months</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              By making extra payments, you'll save {formatCurrency(interestSaved)} in interest and pay off your loan {timeReduced} months earlier.
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h4 className="font-medium mb-2">No Extra Payments</h4>
                            <p className="text-sm text-muted-foreground">
                              Add extra payments to see potential savings and time reduction.
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    {/* Loan Details Summary */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Loan Summary</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• {formatCurrency(monthlyPayment)} {paymentFrequency} payments</li>
                              <li>• {formatCurrency(totalInterest)} total interest</li>
                              <li>• Loan payoff date: {formatDate(payoffDate)}</li>
                              {extraPayment > 0 && (
                                <li>• {formatCurrency(interestSaved)} saved with extra payments</li>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Financial Resource</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Loan Repayment Strategies</h2>
        <p className="mt-3 text-muted-foreground text-lg">Optimize your debt reduction plan and save money on interest</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            The Loan Repayment Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                Understanding how loan repayments work is essential for making informed financial decisions. Every loan payment consists of two parts: <strong>principal</strong> (reducing what you owe) and <strong>interest</strong> (the cost of borrowing).
              </p>
              <p className="mt-4">
                Most loans follow an <strong>amortization schedule</strong>, where early payments are mostly interest while later payments primarily reduce principal. This fundamental concept affects how quickly you build equity and your total interest costs.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Why This Matters</h4>
                <p className="text-sm mt-2 text-blue-700 dark:text-blue-400">
                  Understanding your loan structure enables you to develop strategies that could save thousands in interest and potentially shorten your loan term significantly.
                </p>
              </div>
            </div>
            
            <div className="h-[250px]">
              <h4 className="text-center text-sm font-medium mb-2">Payment Breakdown Over Time</h4>
              <Bar 
                data={{
                  labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
                  datasets: [
                    {
                      label: 'Interest',
                      data: [11500, 10800, 9600, 7800, 5200, 2700, 300],
                      backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    },
                    {
                      label: 'Principal',
                      data: [3500, 4200, 5400, 7200, 9800, 12300, 14700],
                      backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { stacked: true },
                    y: { stacked: true, ticks: { callback: (value) => '$' + value } }
                  }
                }}
              />
              <p className="text-xs text-center mt-1 text-muted-foreground">Example: $300,000 mortgage at 4% interest</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Repayment Concepts */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Key Repayment Concepts Visualized</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                Amortization Explained
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Amortization refers to the process of paying off a debt over time through regular payments that cover both principal and interest.</p>
              
              <div className="h-[220px] mb-3">
                <Line 
                  data={{
                    labels: ['Start', '5 Years', '10 Years', '15 Years', '20 Years', '25 Years', '30 Years'],
                    datasets: [
                      {
                        label: 'Remaining Balance',
                        data: [300000, 272465, 236522, 189571, 128242, 48571, 0],
                        borderColor: 'rgba(59, 130, 246, 0.8)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
              <p className="text-sm text-muted-foreground">
                Notice how the balance decreases slowly at first, then accelerates as more of each payment goes toward principal.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-blue-600" />
                Interest Rate Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Even small changes in interest rates can dramatically affect your total repayment amount over the life of a loan.</p>
              
              <div className="h-[220px] mb-3">
                <Bar 
                  data={{
                    labels: ['3%', '4%', '5%', '6%', '7%'],
                    datasets: [
                      {
                        label: 'Total Interest Paid',
                        data: [155332, 215609, 279767, 347515, 418651],
                        backgroundColor: [
                          'rgba(16, 185, 129, 0.7)',
                          'rgba(14, 165, 233, 0.7)',
                          'rgba(139, 92, 246, 0.7)',
                          'rgba(249, 115, 22, 0.7)',
                          'rgba(239, 68, 68, 0.7)'
                        ],
                        borderWidth: 1
                      }
                    ]
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
              <p className="text-sm text-muted-foreground">
                On a $300,000 30-year loan, each 1% increase adds approximately $60,000-70,000 in total interest.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5 text-blue-600" />
              Extra Payment Power
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Making additional payments can dramatically reduce your loan term and total interest paid. Extra payments applied to principal have their greatest impact early in the loan term.
                </p>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800 mb-4">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Impact of Extra $200 Monthly</h4>
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                    <li className="flex justify-between">
                      <span>Original loan term:</span>
                      <span className="font-medium">30 years</span>
                    </li>
                    <li className="flex justify-between">
                      <span>New payoff time:</span>
                      <span className="font-medium">24.3 years</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Time saved:</span>
                      <span className="font-medium">5.7 years</span>
                    </li>
                    <li className="flex justify-between border-t border-green-200 dark:border-green-800 pt-2 mt-2">
                      <span>Interest savings:</span>
                      <span className="font-bold">$58,427</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="h-[250px]">
                <Line 
                  data={{
                    labels: ['Start', '5 Years', '10 Years', '15 Years', '20 Years', '25 Years', '30 Years'],
                    datasets: [
                      {
                        label: 'Regular Payments',
                        data: [300000, 272465, 236522, 189571, 128242, 48571, 0],
                        borderColor: 'rgba(59, 130, 246, 0.8)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                      },
                      {
                        label: 'With Extra $200/month',
                        data: [300000, 259302, 207697, 142038, 57884, 0, 0],
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
            </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                Payment Frequency Effects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Bi-weekly payments (26 half-payments per year) effectively make one extra monthly payment annually, accelerating your loan payoff.
              </p>
              
              <div className="h-[200px] mb-3">
                <Bar 
                  data={{
                    labels: ['Monthly', 'Bi-Weekly'],
                    datasets: [
                      {
                        label: 'Loan Term (Years)',
                        data: [30, 25.6],
                        backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)'],
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </div>
              <p className="text-sm text-center">
                Bi-weekly payments can save you <strong>4.4 years</strong> and <strong>$33,000</strong> in interest on a 30-year, $300,000 loan at 4%.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hourglass className="h-5 w-5 text-blue-600" />
                Term Length Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Shorter loan terms mean higher monthly payments but substantially less interest paid over the life of the loan.
              </p>
              
              <div className="h-[200px] mb-3">
                <Pie 
                  data={{
                    labels: ['Principal', '30-Year Interest', '15-Year Interest'],
                    datasets: [{
                      data: [300000, 215609, 99431],
                      backgroundColor: [
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(59, 130, 246, 0.7)'
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' },
                      datalabels: {
                        color: '#fff',
                        font: { weight: 'bold' },
                        formatter: (value) => '$' + value.toLocaleString()
                      }
                    }
                  }}
                />
              </div>
              <p className="text-sm text-center">
                A 15-year loan saves <strong>$116,178</strong> in interest compared to a 30-year term at 4%.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Repayment Strategies */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Strategic Repayment Methods
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="text-lg">Avalanche Method</CardTitle>
              <CardDescription>Prioritize by interest rate</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <p>
                  The avalanche method targets debts with the highest interest rates first, minimizing total interest paid over time.
                </p>
                
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: "80%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>Credit Card (18% APR)</span>
                      <span>First Priority</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: "60%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>Personal Loan (10% APR)</span>
                      <span>Second Priority</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: "40%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>Car Loan (5% APR)</span>
                      <span>Third Priority</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "20%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>Mortgage (3.5% APR)</span>
                      <span>Fourth Priority</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Best for:</strong> Mathematically optimal approach that minimizes total interest paid.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-green-50 dark:bg-green-900/30">
              <CardTitle className="text-lg">Snowball Method</CardTitle>
              <CardDescription>Prioritize by balance size</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <p>
                  The snowball method pays off smallest debts first, providing psychological wins that help maintain motivation.
                </p>
                
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "20%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>Store Card ($850)</span>
                      <span>First Priority</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: "40%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>Credit Card ($2,400)</span>
                      <span>Second Priority</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: "60%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>Personal Loan ($8,500)</span>
                      <span>Third Priority</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: "80%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>Car Loan ($15,000)</span>
                      <span>Fourth Priority</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Best for:</strong> Creating momentum through quick wins, especially if motivation is a challenge.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Method Comparison: $35,000 Total Debt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-[280px]">
                <Line 
                  data={{
                    labels: ['Start', '6 Mo', '12 Mo', '18 Mo', '24 Mo', '30 Mo', '36 Mo'],
                    datasets: [
                      {
                        label: 'Avalanche Method',
                        data: [35000, 29400, 22800, 16500, 10400, 4300, 0],
                        borderColor: 'rgba(239, 68, 68, 0.8)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        borderWidth: 2
                      },
                      {
                        label: 'Snowball Method',
                        data: [35000, 30200, 23500, 17200, 10900, 4800, 0],
                        borderColor: 'rgba(16, 185, 129, 0.8)', 
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        borderWidth: 2,
                        borderDash: [5, 5]
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' }
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
              
              <div className="space-y-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="py-2 px-3 text-left">Method</th>
                      <th className="py-2 px-3 text-left">Payoff Time</th>
                      <th className="py-2 px-3 text-left">Total Interest</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2 px-3 font-medium">Avalanche</td>
                      <td className="py-2 px-3">36 months</td>
                      <td className="py-2 px-3">$5,245</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2 px-3 font-medium">Snowball</td>
                      <td className="py-2 px-3">36 months</td>
                      <td className="py-2 px-3">$5,810</td>
                    </tr>
                    <tr className="bg-blue-50 dark:bg-blue-900/20">
                      <td className="py-2 px-3 font-medium">Difference</td>
                      <td className="py-2 px-3">0 months</td>
                      <td className="py-2 px-3 font-medium">$565</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Key Insight:</strong> The avalanche method saves more money, but the difference is often modest compared to the psychological benefits of the snowball method's quick wins. Choose the approach that best matches your personality and motivation style.
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Sample debt mix: $10K credit card (18%), $5K store card (22%), $15K auto loan (6%), $5K personal loan (10%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Mistakes */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Avoiding Repayment Pitfalls
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-red-50 dark:bg-red-900/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Common Mistakes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Making only minimum payments</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      On a $10,000 credit card balance at 18% APR, minimum payments would take 28+ years to pay off and cost over $15,000 in interest.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Missing payment due dates</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Late payments can trigger fees, penalty interest rates, and damage your credit score by up to 110 points.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Focusing on the wrong debts</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Prioritizing low-interest debt while carrying high-interest balances costs you money every month.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Taking on new debt while repaying</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Adding new debt while trying to pay down existing obligations creates a dangerous debt cycle.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Automate your payments</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set up automatic payments at least at the minimum amount to avoid late fees and protect your credit score.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Create a payoff plan visualization</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track your progress with visual aids to maintain motivation throughout your repayment journey.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Apply windfalls strategically</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Put tax refunds, bonuses, and other unexpected income toward debt for maximum impact.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Explore refinancing options</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Regularly check for opportunities to lower interest rates through refinancing or consolidation.
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
              <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Your Path to Debt Freedom
            </CardTitle>
            <CardDescription>
              Taking control of your financial future
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Effective loan repayment</strong> requires understanding how your payments work and implementing a strategic approach. By visualizing your debt journey, prioritizing the right obligations, and making consistent (and when possible, extra) payments, you can significantly reduce your total interest costs and accelerate your path to financial freedom.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Take Action Today</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Use our calculator to create your personalized repayment plan</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Set up automatic payments for at least the minimum amount due</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Find one expense to cut and redirect that money to extra payments</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Track Your Progress</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Create visual charts to celebrate your debt reduction milestones</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Recalculate your plan quarterly to incorporate any windfalls or changes</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Share your goals with someone who will hold you accountable</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to accelerate your debt repayment?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Repayment Calculator</strong> above to create your personalized plan. For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/debt-consolidation">
                        <BadgeDollarSign className="h-4 w-4 mr-1" />
                        Debt Consolidation
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/mortgage">
                        <Home className="h-4 w-4 mr-1" />
                        Mortgage Calculator
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
                  <CardTitle className="text-lg">Amortization Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    See a detailed breakdown of your loan payments over time.
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
                  <CardTitle className="text-lg">Debt Payoff Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compare different debt payoff strategies to become debt-free faster.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/debt-payoff">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Refinance Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    See if refinancing your loans could save you money.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/refinance">Try Calculator</Link>
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