"use client"

import React from "react"
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
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Building, Briefcase, Calendar, Clock, FileText, Wallet, Check, AlertTriangle, Percent, Scale, PiggyBank, Lightbulb, Brain, X, ShieldCheck, Plus, Minus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import PersonalLoanSchema from './schema';

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

export default function PersonalLoanCalculator() {
  // Loan Details
  const [loanAmount, setLoanAmount] = useState<number>(10000)
  const [loanTerm, setLoanTerm] = useState<number>(36)
  const [interestRate, setInterestRate] = useState<number>(8.5)
  const [downPayment, setDownPayment] = useState<number>(0)
  const [paymentFrequency, setPaymentFrequency] = useState<string>("monthly")
  const [originationFee, setOriginationFee] = useState<number>(1)
  const [extraPayment, setExtraPayment] = useState<number>(0)
  const [balloonPayment, setBalloonPayment] = useState<number>(0)
  const [prepaymentPenalty, setPrepaymentPenalty] = useState<boolean>(false)
  const [prepaymentPenaltyRate, setPrepaymentPenaltyRate] = useState<number>(2)

  // Results State
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0)
  const [totalInterest, setTotalInterest] = useState<number>(0)
  const [totalCost, setTotalCost] = useState<number>(0)
  const [earlyPayoffDate, setEarlyPayoffDate] = useState<Date>(new Date())
  const [interestSavings, setInterestSavings] = useState<number>(0)
  const [amortizationSchedule, setAmortizationSchedule] = useState<{
    date: Date;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
    totalInterest: number;
  }[]>([])

  // Calculate loan details
  useEffect(() => {
    // Calculate frequency multiplier
const frequencyMultiplier = {
  weekly: 52 / 12,
  biweekly: 26 / 12,
  monthly: 1
}[paymentFrequency] ?? 1; // Add fallback value of 1 if lookup fails

    // Calculate effective loan amount after down payment and origination fee
    const effectiveLoanAmount = loanAmount - downPayment
    const originationFeeAmount = (effectiveLoanAmount * originationFee) / 100
    const totalLoanAmount = effectiveLoanAmount + originationFeeAmount

    // Calculate base monthly payment
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm
    
    const baseMonthlyPayment = totalLoanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    // Generate amortization schedule
    const schedule = []
    let remainingBalance = totalLoanAmount
    let totalInterestPaid = 0
    let currentDate = new Date()
    let earlyPayoffReached = false
    let actualPayments = 0

    for (let i = 0; i < numberOfPayments; i++) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = baseMonthlyPayment - interestPayment + extraPayment
      const actualPrincipalPayment = Math.min(principalPayment, remainingBalance)
      
      totalInterestPaid += interestPayment
      remainingBalance = Math.max(0, remainingBalance - actualPrincipalPayment)

      schedule.push({
        date: new Date(currentDate),
        payment: actualPrincipalPayment + interestPayment,
        principal: actualPrincipalPayment,
        interest: interestPayment,
        balance: remainingBalance,
        totalInterest: totalInterestPaid
      })

      if (remainingBalance === 0 && !earlyPayoffReached) {
        earlyPayoffReached = true
        actualPayments = i + 1
        setEarlyPayoffDate(new Date(currentDate))
      }

      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Calculate total costs and savings
    const scheduledTotalInterest = baseMonthlyPayment * numberOfPayments - totalLoanAmount
    const actualTotalInterest = totalInterestPaid
    const interestSaved = scheduledTotalInterest - actualTotalInterest

    // Update state
    setMonthlyPayment(baseMonthlyPayment / frequencyMultiplier)
    setTotalInterest(actualTotalInterest)
    setTotalCost(totalLoanAmount + actualTotalInterest)
    setInterestSavings(interestSaved)
    setAmortizationSchedule(schedule)

  }, [
    loanAmount,
    loanTerm,
    interestRate,
    downPayment,
    paymentFrequency,
    originationFee,
    extraPayment,
    balloonPayment,
    prepaymentPenalty,
    prepaymentPenaltyRate
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
    labels: ['Principal', 'Interest', 'Fees'],
    datasets: [{
      data: [
        loanAmount - downPayment,
        totalInterest,
        (loanAmount - downPayment) * (originationFee / 100)
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
          label: 'Total Interest Paid',
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

  // Payment comparison chart
  const generatePaymentComparisonChart = () => {
    const scenarios = [
      { label: 'Base Payment', amount: monthlyPayment },
      { label: 'With Extra Payment', amount: monthlyPayment + extraPayment },
      { label: 'Early Payoff Savings', amount: interestSavings / loanTerm }
    ]

    return {
      labels: scenarios.map(s => s.label),
      datasets: [
        {
          label: 'Monthly Amount',
          data: scenarios.map(s => s.amount),
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
        display: false
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => '$' + value.toFixed(0)
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
    pdf.save('personal-loan-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PersonalLoanSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Personal Loan <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your monthly payments, total interest, and understand the true cost of your personal loan.
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
                      Provide information about your personal loan to calculate payments and costs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Loan Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Loan Information</h3>
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
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interest-rate">Interest Rate (APR)</Label>
                            <span className="text-sm text-muted-foreground">{interestRate}%</span>
                          </div>
                          <Slider
                            id="interest-rate"
                            min={1}
                            max={36}
                            step={0.1}
                            value={[interestRate]}
                            onValueChange={(value) => setInterestRate(value[0])}
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
                              <SelectItem value="biweekly">Bi-weekly</SelectItem>
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
                            <Label htmlFor="origination-fee">Origination Fee</Label>
                            <span className="text-sm text-muted-foreground">{originationFee}%</span>
                          </div>
                          <Slider
                            id="origination-fee"
                            min={0}
                            max={6}
                            step={0.1}
                            value={[originationFee]}
                            onValueChange={(value) => setOriginationFee(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="extra-payment">Extra Monthly Payment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="extra-payment"
                              type="number"
                              className="pl-9"
                              value={extraPayment}
                              onChange={(e) => setExtraPayment(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="prepayment-penalty">Prepayment Penalty</Label>
                            <Switch
                              id="prepayment-penalty"
                              checked={prepaymentPenalty}
                              onCheckedChange={setPrepaymentPenalty}
                            />
                          </div>
                          {prepaymentPenalty && (
                            <div className="flex items-center justify-between mt-2">
                              <Label htmlFor="penalty-rate">Penalty Rate</Label>
                              <span className="text-sm text-muted-foreground">{prepaymentPenaltyRate}%</span>
                            </div>
                          )}
                          {prepaymentPenalty && (
                            <Slider
                              id="penalty-rate"
                              min={0}
                              max={5}
                              step={0.1}
                              value={[prepaymentPenaltyRate]}
                              onValueChange={(value) => setPrepaymentPenaltyRate(value[0])}
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
                          <h4 className="font-medium">Loan Cost Breakdown</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Principal Amount</span>
                              <span className="font-medium">{formatCurrency(loanAmount - downPayment)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Interest</span>
                              <span className="font-medium">{formatCurrency(totalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Origination Fee</span>
                              <span className="font-medium">
                                {formatCurrency((loanAmount - downPayment) * (originationFee / 100))}
                              </span>
                            </div>
                            {extraPayment > 0 && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Interest Savings</span>
                                <span className="font-medium text-green-500">{formatCurrency(interestSavings)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Cost of Loan</span>
                              <span>{formatCurrency(totalCost)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={generatePaymentComparisonChart()} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Payment Comparison</h4>
                          {extraPayment > 0 && (
                            <div className="p-4 rounded-lg bg-muted/50">
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 mt-1 text-primary" />
                                <div>
                                  <p className="font-medium">Early Payoff Analysis</p>
                                  <p className="text-sm text-muted-foreground">
                                    By paying an extra {formatCurrency(extraPayment)} per month, you'll pay off the loan 
                                    by {formatDate(earlyPayoffDate)} and save {formatCurrency(interestSavings)} in interest.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="amortization" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateAmortizationChart()} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Amortization Schedule</h4>
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
                    </Tabs>

                    {/* Loan Summary */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Loan Summary</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• {formatCurrency(monthlyPayment)} per month for {loanTerm} months</li>
                              <li>• Total interest paid: {formatCurrency(totalInterest)}</li>
                              <li>• Total cost of loan: {formatCurrency(totalCost)}</li>
                              {extraPayment > 0 && (
                                <li className="text-primary">
                                  • Early payoff date: {formatDate(earlyPayoffDate)}
                                </li>
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
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Personal Finance</span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Personal Loan Calculations</h2>
                <p className="mt-3 text-muted-foreground text-lg">Make informed borrowing decisions to achieve your financial goals</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    What is a Personal Loan Calculator?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p>
                        A <strong>Personal Loan Calculator</strong> is a financial tool that helps you understand the full cost of borrowing money for personal use. Whether you're planning to consolidate debt, finance a home improvement project, cover medical expenses, or pay for a major purchase, this calculator provides clarity on your monthly payments, total interest costs, and overall loan affordability.
                      </p>
                      <p className="mt-3">
                        Personal loans typically have these key characteristics:
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Fixed interest rates and predictable monthly payments</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Loan terms ranging from 12-84 months</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Loan amounts typically from $1,000 to $50,000</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Unsecured borrowing (no collateral required)</span>
                        </li>
                      </ul>
                      <p>
                        Using a personal loan calculator takes the guesswork out of borrowing and helps you make financially sound decisions that align with your budget and goals.
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
                                data: [15000, 2547],
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
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">$15,000 loan at 6.5% for 36 months</p>
                      </div>
                      
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          <strong>Did You Know?</strong> The average personal loan interest rate currently ranges from 6% to 36%, depending on your credit score, income, and other financial factors.
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
                            Know exactly how much you'll pay each month before you borrow
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                      <CardContent className="pt-5">
                        <div className="flex flex-col items-center text-center">
                          <Scale className="h-8 w-8 text-green-600 dark:text-green-400" />
                          <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Compare Options</h3>
                          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                            Compare different loan terms and interest rates to find the best fit
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
                      <CardContent className="pt-5">
                        <div className="flex flex-col items-center text-center">
                          <PiggyBank className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                          <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Budget Planning</h3>
                          <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                            Determine how loan payments fit into your monthly budget
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* How Personal Loans Work */}
              <div className="mb-10" id="loan-basics">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Wallet className="h-6 w-6 text-blue-600" />
                  How Personal Loans Work
                </h2>
                
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      Key Personal Loan Components
                    </CardTitle>
                    <CardDescription>Understanding these elements helps you make better borrowing decisions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="mb-4">
                          Personal loans have several core components that determine their cost and structure. Understanding these elements is essential for making informed borrowing decisions.
                        </p>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <p className="mb-2 font-medium text-blue-700 dark:text-blue-400">Key Loan Terms:</p>
                          <ul className="space-y-2 text-blue-600 dark:text-blue-500">
                            <li className="flex items-start gap-2">
                              <span className="font-medium min-w-[100px]">Principal:</span>
                              <span>The initial amount you borrow from the lender</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-medium min-w-[100px]">Interest Rate:</span>
                              <span>The cost of borrowing, expressed as an annual percentage</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-medium min-w-[100px]">Loan Term:</span>
                              <span>The time period for repayment (typically in months)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-medium min-w-[100px]">Monthly Payment:</span>
                              <span>The amount due each month to repay the loan</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-medium min-w-[100px]">APR:</span>
                              <span>Annual Percentage Rate, which includes interest and fees</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                              <strong>Important:</strong> The APR is typically higher than the stated interest rate because it includes origination fees and other charges. Always compare loans based on APR, not just the interest rate.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium mb-3">Monthly Payment Formula</h4>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
                            <p className="whitespace-normal break-words">
                              Payment = P × (r × (1 + r)^n) ÷ ((1 + r)^n - 1)
                            </p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <p>Where:</p>
                              <p>P = Principal</p>
                              <p>r = Monthly interest rate (annual rate ÷ 12)</p>
                              <p>n = Total number of monthly payments</p>
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
                                  labels: ['Month 1', 'Month 6', 'Month 12', 'Month 18', 'Month 24', 'Month 30', 'Month 36'],
                                  datasets: [
                                    {
                                      label: 'Principal',
                                      data: [358, 369, 382, 395, 409, 423, 436],
                                      borderColor: 'rgba(59, 130, 246, 0.8)',
                                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                      tension: 0.4
                                    },
                                    {
                                      label: 'Interest',
                                      data: [81, 70, 57, 44, 30, 16, 3],
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
                              Payment allocation for a $15,000 loan at 6.5% over 36 months
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
                      <LineChart className="h-5 w-5 text-green-600" />
                      Loan Amortization Explained
                    </CardTitle>
                    <CardDescription>How your loan balance decreases over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="mb-4">
                          <strong>Amortization</strong> refers to the process of paying off your loan through regular monthly payments that include both principal and interest. In an amortizing loan, your payment amount stays the same, but the portion going to principal increases over time while the interest portion decreases.
                        </p>
                        
                        <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                          <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Amortization Benefits</h4>
                          <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span>Predictable monthly payments for easier budgeting</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span>Guaranteed payoff by the end of the loan term</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span>Gradual reduction in interest costs as principal decreases</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                              <strong>Early Payoff Tip:</strong> Making extra payments toward principal can significantly reduce your total interest costs and shorten your loan term. Most personal loans don't have prepayment penalties, allowing you to pay off your loan early without extra fees.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="h-[240px]">
                          <h4 className="text-center text-sm font-medium mb-2">Loan Balance Over Time</h4>
                          <Line 
                            data={{
                              labels: ['Start', '6 Months', '12 Months', '18 Months', '24 Months', '30 Months', '36 Months'],
                              datasets: [{
                                label: 'Loan Balance',
                                data: [15000, 12819, 10417, 7879, 5193, 2344, 0],
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
                                <td className="p-2 text-right">$460</td>
                                <td className="p-2 text-right">$379</td>
                                <td className="p-2 text-right">$81</td>
                                <td className="p-2 text-right">$14,621</td>
                              </tr>
                              <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <td className="p-2">2</td>
                                <td className="p-2 text-right">$460</td>
                                <td className="p-2 text-right">$381</td>
                                <td className="p-2 text-right">$79</td>
                                <td className="p-2 text-right">$14,240</td>
                              </tr>
                              <tr>
                                <td className="p-2">3</td>
                                <td className="p-2 text-right">$460</td>
                                <td className="p-2 text-right">$383</td>
                                <td className="p-2 text-right">$77</td>
                                <td className="p-2 text-right">$13,857</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparing Loan Options */}
              <div className="mb-10" id="loan-comparison">
                <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <span className="text-2xl">Comparing Loan Options</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Finding the right loan for your needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h3 id="term-impact" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        The Impact of Loan Term Length
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p>
                            The length of your loan term has a dramatic effect on both your monthly payments and the total interest you'll pay. Choosing the right term involves balancing affordability today against total cost over time.
                          </p>
                          
                          <div className="mt-4 space-y-2">
                            <h4 className="font-medium">Term Length Considerations:</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Shorter Term Benefits</h5>
                                <ul className="space-y-1 text-blue-600 dark:text-blue-500">
                                  <li>• Lower total interest costs</li>
                                  <li>• Faster debt elimination</li>
                                  <li>• Improved debt-to-income ratio</li>
                                  <li>• Earlier financial freedom</li>
                                </ul>
                              </div>
                              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                                <h5 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Longer Term Benefits</h5>
                                <ul className="space-y-1 text-amber-600 dark:text-amber-500">
                                  <li>• Lower monthly payments</li>
                                  <li>• Improved monthly cash flow</li>
                                  <li>• Less budgetary pressure</li>
                                  <li>• More financial flexibility</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="h-[260px]">
                          <h4 className="text-center text-sm font-medium mb-2">Term Length Comparison ($15,000 at 6.5%)</h4>
                          <Bar 
                            data={{
                              labels: ['24-Month Term', '36-Month Term', '48-Month Term', '60-Month Term'],
                              datasets: [
                                {
                                  label: 'Monthly Payment',
                                  data: [669, 460, 356, 294],
                                  backgroundColor: 'rgba(59, 130, 246, 0.7)',
                                  borderColor: 'rgba(59, 130, 246, 1)',
                                  borderWidth: 1,
                                  yAxisID: 'y'
                                },
                                {
                                  label: 'Total Interest',
                                  data: [1056, 1560, 2088, 2640],
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
                        <h3 id="interest-rates" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                          <Percent className="h-5 w-5" />
                          Interest Rate Impact
                        </h3>
                        <p>
                          Even a small difference in interest rates can significantly affect your total loan cost, especially for longer-term loans.
                        </p>
                        
                        <div className="mt-4 h-[180px]">
                          <Bar 
                            data={{
                              labels: ['5.5%', '6.5%', '7.5%', '8.5%', '9.5%'],
                              datasets: [{
                                label: 'Total Interest on $15,000 (36 months)',
                                data: [1304, 1560, 1812, 2076, 2340],
                                backgroundColor: [
                                  'rgba(16, 185, 129, 0.7)',
                                  'rgba(16, 185, 129, 0.75)',
                                  'rgba(16, 185, 129, 0.8)',
                                  'rgba(16, 185, 129, 0.85)',
                                  'rgba(16, 185, 129, 0.9)'
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
                                  ticks: { callback: value => '$' + Number(value).toLocaleString() }
                                }
                              }
                            }}
                          />
                        </div>
                        
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <p className="text-sm text-green-700 dark:text-green-400">
                              <strong>Pro Tip:</strong> Improving your credit score by just 50 points could potentially save you 1-2% on your interest rate, which translates to hundreds or thousands of dollars over the life of your loan.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 id="loan-fees" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Understanding Loan Fees
                        </h3>
                        <p>
                          Beyond interest, various fees can add to your loan cost. Understanding these fees helps you compare loans more accurately.
                        </p>
                        
                        <div className="mt-4 space-y-4">
                          <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <h4 className="font-medium text-purple-700 dark:text-purple-400">Common Personal Loan Fees</h4>
                            <table className="w-full text-sm mt-2">
                              <thead className="bg-purple-50 dark:bg-purple-900/30">
                                <tr>
                                  <th className="p-2 text-left">Fee Type</th>
                                  <th className="p-2 text-left">Typical Range</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b dark:border-purple-800/30">
                                  <td className="p-2">Origination Fee</td>
                                  <td className="p-2">1-8% of loan amount</td>
                                </tr>
                                <tr className="border-b dark:border-purple-800/30 bg-purple-50/50 dark:bg-purple-900/10">
                                  <td className="p-2">Late Payment Fee</td>
                                  <td className="p-2">$15-$40 or 5% of payment</td>
                                </tr>
                                <tr className="border-b dark:border-purple-800/30">
                                  <td className="p-2">Returned Payment Fee</td>
                                  <td className="p-2">$15-$35</td>
                                </tr>
                                <tr>
                                  <td className="p-2">Prepayment Penalty</td>
                                  <td className="p-2">0-2% of remaining balance</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          
                          <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <h4 className="font-medium text-purple-700 dark:text-purple-400">APR vs. Interest Rate</h4>
                            <p className="mt-1 text-sm">
                              Annual Percentage Rate (APR) includes both interest and fees, providing a more comprehensive measure of loan cost than interest rate alone.
                            </p>
                            <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded-lg text-sm">
                              <div className="flex justify-between items-center">
                                <span>Interest Rate:</span>
                                <span>6.5%</span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span>+ 2% Origination Fee:</span>
                                <span>≈0.7% annualized (36-month term)</span>
                              </div>
                              <div className="flex justify-between items-center mt-1 font-medium">
                                <span>= Effective APR:</span>
                                <span>7.2%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                              <p className="text-sm text-amber-700 dark:text-amber-400">
                                <strong>Watch Out:</strong> A "no-fee" loan often compensates with a higher interest rate. Always calculate the total cost of the loan, not just the monthly payment or advertised rate.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Making Smart Borrowing Decisions */}
              <div className="mb-10" id="borrowing-decisions">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  Making Smart Borrowing Decisions
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        Is a Personal Loan Right for You?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>
                        Before taking out a personal loan, it's important to evaluate whether it's truly the right financial solution for your needs.
                      </p>
                      
                      <div className="grid gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Good Reasons to Consider a Personal Loan</h4>
                          <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                              <span>Consolidating high-interest debt at a lower rate</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                              <span>Financing necessary home improvements</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                              <span>Covering unexpected medical expenses</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                              <span>Funding major life events with a fixed repayment plan</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                          <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">Think Twice About Using a Personal Loan For</h4>
                          <ul className="space-y-1 text-sm text-red-700 dark:text-red-400">
                            <li className="flex items-start gap-2">
                              <X className="h-4 w-4 text-red-600 mt-0.5" />
                              <span>Discretionary purchases you could save for</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <X className="h-4 w-4 text-red-600 mt-0.5" />
                              <span>Paying everyday expenses or bills</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <X className="h-4 w-4 text-red-600 mt-0.5" />
                              <span>Investing or speculative activities</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <X className="h-4 w-4 text-red-600 mt-0.5" />
                              <span>Vacations or other non-essential spending</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <p className="text-sm text-amber-700 dark:text-amber-400">
                            <strong>Key Question:</strong> Will this loan help improve your financial situation or create more challenges? If the loan is for a want rather than a need, consider saving instead of borrowing.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        Loan Affordability Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">
                        Just because you qualify for a certain loan amount doesn't mean it's affordable. Use these guidelines to determine how much you can comfortably borrow.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium flex items-center gap-2">
                            <Percent className="h-4 w-4 text-green-600" />
                            Debt-to-Income Ratio
                          </h4>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Your total monthly debt payments (including the new loan) should not exceed 36% of your gross monthly income. Lower is better.
                          </p>
                          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between">
                                <span>Monthly Income:</span>
                                <span>$5,000</span>
                              </div>
                              <div className="flex justify-between">
                                <span>36% Maximum:</span>
                                <span>$1,800 total debt payments</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Existing Debts:</span>
                                <span>$1,200</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-medium">
                                <span>Available for New Loan:</span>
                                <span>$600/month</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-green-600" />
                            50/30/20 Budget Rule
                          </h4>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Total debt payments should fit within the "needs" category (50%) of your budget, while leaving room for other necessities.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium flex items-center gap-2">
                            <PiggyBank className="h-4 w-4 text-green-600" />
                            Emergency Fund Protection
                          </h4>
                          <p className="mt-2 text-sm text-muted-foreground">
                            After making your loan payment, you should still be able to contribute to your emergency fund. Never deplete emergency savings to make loan payments.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-300">Stress-Test Your Budget</h4>
                        <p className="mt-2 text-xs text-green-700 dark:text-green-400">
                          Before committing to a loan, ask yourself: "Could I still make this payment if my income dropped by 10-20% or if I had an unexpected expense?" If the answer is no, consider a smaller loan or longer term.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <Card className="border-blue-200 dark:border-blue-900">
                    <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
                      <CardTitle className="text-blue-800 dark:text-blue-300">Finding the Best Loan Offers</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <h4 className="font-medium mb-2">1. Check Your Credit First</h4>
                          <p className="text-sm text-muted-foreground">
                            Review your credit report and score before applying. Correct any errors and take steps to improve your score if possible.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <h4 className="font-medium mb-2">2. Compare Multiple Offers</h4>
                          <p className="text-sm text-muted-foreground">
                            Get pre-qualified with at least 3-5 lenders to compare rates and terms. Many lenders offer soft credit pulls that won't affect your credit score.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <h4 className="font-medium mb-2">3. Read the Fine Print</h4>
                          <p className="text-sm text-muted-foreground">
                            Compare the complete loan details including APR, fees, prepayment penalties, and late payment policies—not just the advertised rate.
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-800 dark:text-blue-300">Loan Calculator Best Practices</p>
                            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                              When using our personal loan calculator, try different scenarios with various loan amounts, interest rates, and terms to find the optimal balance between affordable monthly payments and reasonable total cost. Remember to consider both your current budget constraints and your long-term financial goals.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Special Considerations Section */}
              <div className="mb-10" id="special-considerations">
                <Card className="overflow-hidden border-green-200 dark:border-green-900">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <span className="text-2xl">Special Loan Considerations</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Important factors that may affect your loan decision
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">Credit Score Impact</h3>
                        <p className="mb-4">
                          Your credit score significantly impacts both your loan approval chances and the interest rate you'll be offered. Understanding this relationship can help you time your application strategically.
                        </p>
                        
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-medium mb-2">Typical Interest Rates by Credit Score</h4>
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="p-2 text-left">Credit Score Range</th>
                                <th className="p-2 text-left">Typical APR Range</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b dark:border-gray-700">
                                <td className="p-2">Excellent (720-850)</td>
                                <td className="p-2">5.5% - 9.0%</td>
                              </tr>
                              <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <td className="p-2">Good (690-719)</td>
                                <td className="p-2">9.0% - 12.5%</td>
                              </tr>
                              <tr className="border-b dark:border-gray-700">
                                <td className="p-2">Fair (630-689)</td>
                                <td className="p-2">12.5% - 18.0%</td>
                              </tr>
                              <tr className="bg-gray-50 dark:bg-gray-800">
                                <td className="p-2">Poor (300-629)</td>
                                <td className="p-2">18.0% - 36.0%</td>
                              </tr>
                            </tbody>
                          </table>
                          <p className="text-xs text-muted-foreground mt-2">*Approximate ranges as of 2025; actual rates may vary by lender</p>
                        </div>
                        
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                              <strong>Score Improvement Tip:</strong> If your score is below 690, consider waiting 3-6 months to improve it before applying. Each 20-point increase can potentially save you 1-2% in interest, which adds up to significant savings over the life of your loan.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">Secured vs. Unsecured Loans</h3>
                        <p className="mb-4">
                          Most personal loans are unsecured, meaning they don't require collateral. However, secured options exist that may offer better rates if you're willing to back the loan with an asset.
                        </p>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                              <h4 className="font-medium text-sm mb-2">Unsecured Personal Loans</h4>
                              <ul className="space-y-1 text-xs">
                                <li className="flex items-start gap-2">
                                  <Plus className="h-3 w-3 text-green-600 mt-0.5" />
                                  <span>No collateral required</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Plus className="h-3 w-3 text-green-600 mt-0.5" />
                                  <span>Faster application process</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Plus className="h-3 w-3 text-green-600 mt-0.5" />
                                  <span>No asset at risk</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Minus className="h-3 w-3 text-red-600 mt-0.5" />
                                  <span>Higher interest rates</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Minus className="h-3 w-3 text-red-600 mt-0.5" />
                                  <span>Stricter approval requirements</span>
                                </li>
                              </ul>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                              <h4 className="font-medium text-sm mb-2">Secured Personal Loans</h4>
                              <ul className="space-y-1 text-xs">
                                <li className="flex items-start gap-2">
                                  <Plus className="h-3 w-3 text-green-600 mt-0.5" />
                                  <span>Lower interest rates</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Plus className="h-3 w-3 text-green-600 mt-0.5" />
                                  <span>Higher approval chances</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Plus className="h-3 w-3 text-green-600 mt-0.5" />
                                  <span>Potentially larger loan amounts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Minus className="h-3 w-3 text-red-600 mt-0.5" />
                                  <span>Risk of losing collateral</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Minus className="h-3 w-3 text-red-600 mt-0.5" />
                                  <span>More complex application process</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Common Secured Loan Collateral</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm text-green-700 dark:text-green-400">
                              <div>• Savings accounts</div>
                              <div>• Certificates of deposit</div>
                              <div>• Vehicles</div>
                              <div>• Investment accounts</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                      <h3 className="font-semibold text-xl mb-3">Alternative Borrowing Options</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800">
                              <th className="px-3 py-2 text-left">Option</th>
                              <th className="px-3 py-2 text-left">Best For</th>
                              <th className="px-3 py-2 text-left">Typical Rates</th>
                              <th className="px-3 py-2 text-left">Considerations</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b dark:border-gray-700">
                              <td className="px-3 py-2">Personal Line of Credit</td>
                              <td className="px-3 py-2">Ongoing or uncertain expenses</td>
                              <td className="px-3 py-2">7-20%</td>
                              <td className="px-3 py-2">Only pay interest on amounts used</td>
                            </tr>
                            <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                              <td className="px-3 py-2">Credit Card Balance Transfer</td>
                              <td className="px-3 py-2">Existing high-interest debt</td>
                              <td className="px-3 py-2">0% intro, then 14-26%</td>
                              <td className="px-3 py-2">Watch for transfer fees and intro period end dates</td>
                            </tr>
                            <tr className="border-b dark:border-gray-700">
                              <td className="px-3 py-2">Home Equity Loan</td>
                              <td className="px-3 py-2">Large expenses for homeowners</td>
                              <td className="px-3 py-2">4-8%</td>
                              <td className="px-3 py-2">Uses home as collateral; longer approval process</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">Peer-to-Peer Lending</td>
                              <td className="px-3 py-2">Borrowers with good online profiles</td>
                              <td className="px-3 py-2">5-36%</td>
                              <td className="px-3 py-2">Alternative qualifying criteria; possibly higher fees</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Final Checklist Before Applying</p>
                          <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                              <span>Check your credit report and score</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                              <span>Calculate your debt-to-income ratio with the new loan</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                              <span>Compare at least 3-5 different loan offers</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                              <span>Read the complete loan terms and conditions</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                              <span>Have a clear repayment plan in place</span>
                            </li>
                          </ul>
                        </div>
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
                      Making Informed Personal Loan Decisions
                    </CardTitle>
                    <CardDescription>
                      Putting your loan calculations to work
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      <strong>Personal loan calculators</strong> provide valuable insights that help you navigate borrowing decisions with confidence. By understanding the full cost of your loan, payment structures, and long-term financial impacts, you can choose loan options that support your financial goals rather than hinder them.
                    </p>
                    
                    <p className="mt-4" id="key-takeaways">
                      Remember these key principles when evaluating personal loans:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Smart Borrower Principles</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Borrow only what you need, not what you qualify for</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Compare total loan costs, not just monthly payments</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Consider how the loan fits into your overall financial plan</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Repayment Success Strategies</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Set up automatic payments to avoid late fees</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Consider bi-weekly payments to reduce interest costs</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Allocate windfalls (tax refunds, bonuses) to principal</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Next Steps</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Ready to explore your personal loan options? Use our calculator above to model different scenarios, then speak with lenders to get personalized rate quotes. Remember to read all loan agreements carefully and ensure you understand all terms before signing.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Related Calculators */}
              <section className="py-12 bg-muted/30">
                <div className="container mx-auto">
                  <h2 className="text-2xl font-bold text-center mb-8">Related Calculators</h2>
                  <div className="grid gap-6 md:grid-cols-3">
                    <Card className="calculator-card">
                      <CardHeader>
                        <CardTitle className="text-lg">Debt Consolidation Calculator</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          See how much you could save by consolidating your debts into a single loan.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full calculator-card-button">
                          <Link href="/calculators/debt-consolidation">Try Calculator</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="calculator-card">
                      <CardHeader>
                        <CardTitle className="text-lg">Credit Card Payoff Calculator</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Calculate how long it will take to pay off your credit card debt.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full calculator-card-button">
                          <Link href="/calculators/credit-card">Try Calculator</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="calculator-card">
                      <CardHeader>
                        <CardTitle className="text-lg">Debt-to-Income Calculator</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Calculate your debt-to-income ratio to see if you qualify for a loan.
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
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}