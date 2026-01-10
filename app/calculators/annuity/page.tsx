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
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, BadgeDollarSign, Calendar, User, Users, Clock, Briefcase, Percent } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import AnnuitySchema from './schema';

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

export default function AnnuityCalculator() {
  // Basic Inputs
  const [payment, setPayment] = useState<number>(1000)
  const [periods, setPeriods] = useState<number>(20)
  const [interestRate, setInterestRate] = useState<number>(6)
  const [paymentFrequency, setPaymentFrequency] = useState<string>("monthly")
  
  // Advanced Inputs
  const [annuityType, setAnnuityType] = useState<string>("ordinary")
  const [inflationRate, setInflationRate] = useState<number>(2)
  const [taxRate, setTaxRate] = useState<number>(25)
  const [includeInflation, setIncludeInflation] = useState<boolean>(false)
  const [includeTax, setIncludeTax] = useState<boolean>(false)
  
  // Results State
  const [presentValue, setPresentValue] = useState<number>(0)
  const [futureValue, setFutureValue] = useState<number>(0)
  const [totalPayments, setTotalPayments] = useState<number>(0)
  const [interestEarned, setInterestEarned] = useState<number>(0)
  const [paymentSchedule, setPaymentSchedule] = useState<{
    period: number;
    payment: number;
    interest: number;
    balance: number;
  }[]>([])

  // Calculate frequency multiplier
  const getFrequencyMultiplier = (freq: string): number => {
    switch (freq) {
      case "annually": return 1
      case "semi-annually": return 2
      case "quarterly": return 4
      case "monthly": return 12
      case "bi-weekly": return 26
      case "weekly": return 52
      default: return 12
    }
  }

  // Calculate annuity values
  useEffect(() => {
    const freqMultiplier = getFrequencyMultiplier(paymentFrequency)
    const totalPeriods = periods * freqMultiplier
    const periodicRate = interestRate / (100 * freqMultiplier)
    const effectiveRate = includeInflation ? 
      (1 + periodicRate) / (1 + inflationRate / (100 * freqMultiplier)) - 1 : 
      periodicRate

    // Calculate present value
    const pv = payment * (1 - Math.pow(1 + effectiveRate, -totalPeriods)) / effectiveRate
    const pvDue = annuityType === "due" ? pv * (1 + effectiveRate) : pv

    // Calculate future value
    const fv = payment * (Math.pow(1 + effectiveRate, totalPeriods) - 1) / effectiveRate
    const fvDue = annuityType === "due" ? fv * (1 + effectiveRate) : fv

    // Calculate total payments and interest
    const totalPmt = payment * totalPeriods
    const interest = fvDue - totalPmt

    // Generate payment schedule
    const schedule = []
    let balance = 0
    for (let i = 0; i <= totalPeriods; i++) {
      const periodInterest = balance * effectiveRate
      balance = (balance + payment) * (1 + effectiveRate)
      
      if (i % freqMultiplier === 0) {
        schedule.push({
          period: Math.floor(i / freqMultiplier),
          payment: payment * freqMultiplier,
          interest: periodInterest * freqMultiplier,
          balance: balance
        })
      }
    }

    // Apply tax if enabled
    const afterTaxFV = includeTax ? 
      fvDue * (1 - taxRate / 100) : 
      fvDue

    setPresentValue(pvDue)
    setFutureValue(afterTaxFV)
    setTotalPayments(totalPmt)
    setInterestEarned(interest)
    setPaymentSchedule(schedule)

  }, [
    payment,
    periods,
    interestRate,
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

  // Growth over time chart
  const generateGrowthChart = () => {
    return {
      labels: paymentSchedule.map(p => `Year ${p.period}`),
      datasets: [
        {
          label: 'Account Balance',
          data: paymentSchedule.map(p => p.balance),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Total Contributions',
          data: paymentSchedule.map(p => p.period * payment * getFrequencyMultiplier(paymentFrequency)),
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

  // Contribution breakdown chart
  const pieChartData = {
    labels: ['Total Contributions', 'Interest Earned'],
    datasets: [{
      data: [totalPayments, interestEarned],
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
          return ((value / (totalPayments + interestEarned)) * 100).toFixed(1) + '%'
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
    pdf.save('annuity-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <AnnuitySchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Annuity <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate the present and future values of your annuity payments, and understand how your money grows over time.
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
                      Provide information about your periodic payments and investment terms.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Basic Inputs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="payment">Periodic Payment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="payment"
                              type="number"
                              className="pl-9"
                              value={payment || ''} onChange={(e) => setPayment(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="periods">Number of Years</Label>
                          <Input
                            id="periods"
                            type="number"
                            value={periods || ''} onChange={(e) => setPeriods(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interest-rate">Interest Rate</Label>
                            <span className="text-sm text-muted-foreground">{interestRate}%</span>
                          </div>
                          <Slider
                            id="interest-rate"
                            min={0}
                            max={15}
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
                              <SelectItem value="annually">Annually</SelectItem>
                              <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
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
                            <Label htmlFor="inflation-toggle">Account for Inflation</Label>
                            <Switch
                              id="inflation-toggle"
                              checked={includeInflation}
                              onCheckedChange={setIncludeInflation}
                            />
                          </div>
                          {includeInflation && (
                            <div className="flex items-center justify-between mt-2">
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
                            <Label htmlFor="tax-toggle">Include Tax Calculations</Label>
                            <Switch
                              id="tax-toggle"
                              checked={includeTax}
                              onCheckedChange={setIncludeTax}
                            />
                          </div>
                          {includeTax && (
                            <div className="flex items-center justify-between mt-2">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Future Value</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(futureValue)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Present Value</p>
                        <p className="text-2xl font-bold">{formatCurrency(presentValue)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="growth" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="growth">Growth</TabsTrigger>
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                      </TabsList>

                      <TabsContent value="growth" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateGrowthChart()} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Growth Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Contributions</span>
                              <span className="font-medium">{formatCurrency(totalPayments)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Interest Earned</span>
                              <span className="font-medium">{formatCurrency(interestEarned)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Final Balance</span>
                              <span>{formatCurrency(futureValue)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Value Breakdown</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Contribution Percentage</span>
                              <span className="font-medium">
                                {((totalPayments / (totalPayments + interestEarned)) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Interest Percentage</span>
                              <span className="font-medium">
                                {((interestEarned / (totalPayments + interestEarned)) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="schedule" className="space-y-4">
                        <div className="max-h-[300px] overflow-auto">
                          <table className="w-full">
                            <thead className="sticky top-0 bg-background">
                              <tr>
                                <th className="text-left p-2">Year</th>
                                <th className="text-right p-2">Payment</th>
                                <th className="text-right p-2">Interest</th>
                                <th className="text-right p-2">Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paymentSchedule.map((period) => (
                                <tr key={period.period} className="border-t">
                                  <td className="p-2">{period.period}</td>
                                  <td className="text-right p-2">{formatCurrency(period.payment)}</td>
                                  <td className="text-right p-2">{formatCurrency(period.interest)}</td>
                                  <td className="text-right p-2">{formatCurrency(period.balance)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Additional Information */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Payment Schedule</p>
                            <p className="text-sm text-muted-foreground">
                              {payment > 0 ? (
                                <>
                                  Making {formatCurrency(payment)} {paymentFrequency} payments for {periods} years
                                  {annuityType === "due" ? " at the start" : " at the end"} of each period
                                  {includeInflation ? `, adjusted for ${inflationRate}% inflation` : ""}
                                  {includeTax ? `, with ${taxRate}% tax rate` : ""}.
                                </>
                              ) : (
                                "Enter a payment amount to see schedule details."
                              )}
                            </p>
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
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Annuities: Your Complete Guide</h2>
                <p className="mt-3 text-muted-foreground text-lg">Create reliable income streams for a secure retirement</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding Annuities
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 id="what-is-annuity" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is an Annuity?</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                      <p>
                        An <strong>Annuity</strong> is a financial contract between you and an insurance company designed to provide a guaranteed income stream. You make a lump sum payment or series of payments, and in return, the insurer commits to regular disbursements beginning either immediately or at some point in the future.
                      </p>
                      <p className="mt-2">
                        Annuities serve as a crucial retirement planning tool by addressing one of retirees' biggest concerns: outliving their savings. They effectively transfer longevity risk to insurance companies, providing financial security regardless of how long you live.
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Guaranteed income for a specified period or lifetime</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Tax-deferred growth potential</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Various payout options to match your needs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>Optional features for beneficiary protection</span>
                        </li>
                      </ul>
                      <p>
                        Understanding annuities is essential for creating a comprehensive retirement strategy, especially for those seeking predictable income to supplement Social Security and other retirement assets.
                      </p>
                    </div>
                    <div className="md:w-[300px] h-[260px] flex-shrink-0">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                          <CardTitle className="text-sm font-medium text-center">Annuity vs. Traditional Investments</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full">
                            <Bar 
                              data={{
                                labels: ['Guaranteed Income', 'Longevity Protection', 'Principal Safety', 'Growth Potential', 'Liquidity'],
                                datasets: [
                                  {
                                    label: 'Annuities',
                                    data: [95, 90, 80, 50, 30],
                                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                                  },
                                  {
                                    label: 'Traditional Investments',
                                    data: [30, 20, 40, 85, 90],
                                    backgroundColor: 'rgba(20, 184, 166, 0.7)',
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    max: 100
                                  }
                                },
                                plugins: {
                                  legend: {
                                    position: 'bottom',
                                    labels: { boxWidth: 10, padding: 10 }
                                  }
                                }
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <h4 id="types-of-annuities" className="font-semibold text-xl mt-6">Types of Annuities</h4>
                  <div className="mt-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-900">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Fixed Annuities</p>
                          <p className="text-sm text-blue-700 dark:text-blue-400">Offer guaranteed interest rates and predictable income payments</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Variable Annuities</p>
                          <p className="text-sm text-blue-700 dark:text-blue-400">Payments fluctuate based on the performance of underlying investments</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Indexed Annuities</p>
                          <p className="text-sm text-blue-700 dark:text-blue-400">Returns tied to market index performance with downside protection</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Immediate vs. Deferred</p>
                          <p className="text-sm text-blue-700 dark:text-blue-400">Begin payments right away or after a specified accumulation period</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p>
                    An annuity calculator helps you understand the potential income you could receive from different types of annuities based on your initial investment, time horizon, and payout options. This knowledge is essential for determining whether annuities fit your retirement strategy and which type might best suit your needs.
                  </p>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Making the Most of Your Annuity</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="annuity-calculation" className="font-bold text-xl mb-4">How Annuity Calculations Work</h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Fixed Annuity Formula</h4>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="text-center font-medium text-blue-800 dark:text-blue-300">
                          Payment = Principal W Payout Rate
                        </p>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Example Calculation</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <span className="text-sm">Initial Investment</span>
                            <span className="font-medium">$250,000</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <span className="text-sm">Payout Rate (at age 65)</span>
                            <span className="font-medium">5.25%</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 font-semibold">
                            <span>Annual Income</span>
                            <span>$13,125</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 font-semibold">
                            <span>Monthly Income</span>
                            <span>$1,094</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Key Variables in Annuity Calculations</h4>
                      
                      <div className="space-y-4">
                        <Card className="border-blue-200 dark:border-blue-900">
                          <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-blue-600" />
                              Principal Amount
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-3 text-sm">
                            <p>
                              The initial investment or premium paid into the annuity. Larger investments generate higher income payments proportionally.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-blue-200 dark:border-blue-900">
                          <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              Age at Annuitization
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-3 text-sm">
                            <p>
                              Older annuitants receive higher payout rates due to shorter expected payment periods. Starting payments at 70 vs. 65 can increase rates by 10-20%.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-blue-200 dark:border-blue-900">
                          <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              Payout Period
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-3 text-sm">
                            <p>
                              Lifetime payments offer security but at lower rates than period-certain options (e.g., 10 or 20 years) which guarantee payments for a specific duration.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 id="payout-options" className="font-bold text-xl mt-8 mb-4">Annuity Payout Options</h3>
                
                <div className="mb-6">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Payout Option</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Best For</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Single Life</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Payments for your lifetime only, stopping at death</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Single individuals seeking maximum income</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Joint Life</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Payments continue until both you and spouse die</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Married couples needing survivor protection</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Period Certain</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Guaranteed payments for specific number of years</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Those concerned about early death after purchase</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Life with Period Certain</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Lifetime payments with minimum guaranteed period</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Balancing longevity protection with legacy concerns</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Installment Refund</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Payments continue until full premium is returned</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Those wanting to ensure full premium recovery</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Payment Frequency Options:</strong> Most annuities offer payment flexibility, allowing you to receive disbursements monthly, quarterly, semi-annually, or annually. Monthly payments are typically about 8% lower than the equivalent annual payment due to administrative costs and time value of money.
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
                        <span className="text-2xl">Strategic Annuity Decisions</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Understanding these elements will help you optimize your annuity strategy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h3 id="timing-decisions" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Timing Your Annuity Purchase
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p>
                            <strong>When</strong> you purchase an annuity can significantly impact your income payments. Interest rates directly affect annuity payout rateshigher market rates generally lead to better annuity terms.
                          </p>
                          <ul className="mt-4 space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">?</span>
                              <span>Consider laddering annuity purchases over time to diversify interest rate risk</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">?</span>
                              <span>For immediate annuities, each year you delay starting (until age ~85) typically increases payout rates by 5-8%</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">?</span>
                              <span>Purchase during higher interest rate environments when possible</span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                              <strong>Interest Rate Impact:</strong> 1% increase in interest rates
                            </p>
                            <ul className="text-sm mt-1 text-purple-700 dark:text-purple-400">
                              <li>65-year-old purchaser</li>
                              <li>Can increase payout rates by approximately 8-10%</li>
                              <li>On $250,000: $1,094 ? $1,203 monthly (additional $1,308/year)</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="h-[250px]">
                          <h4 className="text-center text-sm font-medium mb-2">Payout Rates by Age</h4>
                          <Bar 
                            data={{
                              labels: ['Age 60', 'Age 65', 'Age 70', 'Age 75', 'Age 80'],
                              datasets: [
                                {
                                  label: 'Annual Payout Rate (%)',
                                  data: [4.60, 5.25, 6.10, 7.25, 8.70],
                                  backgroundColor: 'rgba(124, 58, 237, 0.7)',
                                  borderColor: 'rgba(124, 58, 237, 1)',
                                  borderWidth: 1
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-8" />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 id="product-features" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Optional Annuity Features
                        </h3>
                        <p>Many annuities offer additional features for customization, though these typically reduce your income payments.</p>
                        
                        <div className="mt-4 space-y-4">
                          <Card className="border-indigo-200 dark:border-indigo-800">
                            <CardHeader className="bg-indigo-50 dark:bg-indigo-900/30 py-3">
                              <CardTitle className="text-base">Inflation Protection</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-3 text-sm">
                              <ul className="space-y-1">
                                <li> Payments increase annually by fixed percentage (2-3%) or CPI</li>
                                <li> Reduces initial payment by 15-30%</li>
                                <li> Break-even point typically at 10-12 years</li>
                                <li> Essential for lengthy retirement periods</li>
                              </ul>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-indigo-200 dark:border-indigo-800">
                            <CardHeader className="bg-indigo-50 dark:bg-indigo-900/30 py-3">
                              <CardTitle className="text-base">Death Benefits</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-3 text-sm">
                              <ul className="space-y-1">
                                <li> Return of premium guarantees</li>
                                <li> Cash refund or installment refund options</li>
                                <li> Reduces payments by 5-15% depending on age</li>
                                <li> Valuable for leaving legacy to beneficiaries</li>
                              </ul>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-indigo-200 dark:border-indigo-800">
                            <CardHeader className="bg-indigo-50 dark:bg-indigo-900/30 py-3">
                              <CardTitle className="text-base">Liquidity Provisions</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-3 text-sm">
                              <ul className="space-y-1">
                                <li> Commutation riders for emergency withdrawals</li>
                                <li> 10-15% free annual withdrawals</li>
                                <li> May reduce payments by 2-7%</li>
                                <li> Consider if emergency access is a concern</li>
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      
                      <div>
                        <h3 id="tax-considerations" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Tax Implications
                        </h3>
                        <p>
                          Understanding the tax treatment of your annuity is crucial for accurate retirement planning. Different annuity types and funding sources have distinct tax consequences.
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">Tax Treatment by Funding Source</h4>
                          <div className="mt-3">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-blue-100/50 dark:bg-blue-900/50">
                                  <tr>
                                    <th className="p-2 text-left">Funding Source</th>
                                    <th className="p-2 text-left">Tax Treatment of Payments</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-blue-100 dark:border-blue-800">
                                    <td className="p-2">Qualified Funds<br/>(IRA, 401(k))</td>
                                    <td className="p-2">Fully taxable as ordinary income</td>
                                  </tr>
                                  <tr className="border-b border-blue-100 dark:border-blue-800">
                                    <td className="p-2">Non-qualified<br/>(After-tax money)</td>
                                    <td className="p-2">Partially taxable (exclusion ratio applies)</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2">Roth IRA</td>
                                    <td className="p-2">Tax-free if annuitized after age 59&frac12; and account open &gt;5 years</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        
                        <h3 id="comparing-options" className="text-xl font-bold text-green-700 dark:text-green-400 mt-6 mb-4 flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          Comparing Annuity Options
                        </h3>
                        <p className="mb-4">
                          When evaluating annuities, focus on the total guaranteed value rather than just the initial payout rate. Consider how features like inflation protection affect lifetime value.
                        </p>
                        <div className="h-[170px]">
                          <Line 
                            data={{
                              labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25'],
                              datasets: [
                                {
                                  label: 'Fixed Payment',
                                  data: [15000, 15000, 15000, 15000, 15000, 15000],
                                  borderColor: 'rgba(16, 185, 129, 0.7)',
                                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                },
                                {
                                  label: '3% Annual Increase',
                                  data: [12000, 13465, 15986, 18938, 21959, 25455],
                                  borderColor: 'rgba(59, 130, 246, 0.7)',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                                  title: {
                                    display: true,
                                    text: 'Annual Payment ($)'
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Annuity Trends Section with Statistics */}
              <div className="mb-12" id="annuity-statistics">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Annuity Market Trends and Statistics
                </h2>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Market Growth</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">12.3%</p>
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">Annual annuity sales growth (2025)</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                          <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">Average Payout Rate</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">5.4%</p>
                        <p className="mt-1 text-sm text-green-600 dark:text-green-500">For 65-year-olds (SPIA)</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                          <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Average Premium</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">$187K</p>
                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">Initial annuity investment</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                          <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Purchase Age</h3>
                        <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">67.2</p>
                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">Average age at annuity purchase</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="annuity-challenges" className="text-xl font-bold mb-4">Common Annuity Concerns</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40">
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </span>
                        <CardTitle className="text-base">Liquidity Limitations</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Most annuities limit access to your principal after purchase, creating potential hardship during financial emergencies. Consider maintaining liquid reserves outside annuities.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40">
                          <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </span>
                        <CardTitle className="text-base">High Fees</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Variable and indexed annuities often carry substantial fees that can reduce returns. Fixed annuities typically have lower explicit fees but may offer lower returns.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40">
                          <Percent className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </span>
                        <CardTitle className="text-base">Inflation Risk</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Standard fixed annuities provide constant payments that lose purchasing power over time. Inflation-protected options address this but start with significantly lower initial payments.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="inflation-impact" className="text-xl font-bold mb-4">Inflation Impact on Annuity Income</h3>
                <Card className="bg-white dark:bg-gray-900 mb-4">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p>
                          <strong>Inflation</strong> represents one of the greatest threats to annuity income, particularly for fixed payouts that remain constant over decades while the cost of living increases.
                        </p>
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Fixed Annuity Purchasing Power Loss</h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">$2,000 monthly today</span>
                              <span className="font-medium text-red-700 dark:text-red-400">$2,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">After 10 years (3% inflation)</span>
                              <span className="font-medium text-red-700 dark:text-red-400">$1,488</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">After 20 years (3% inflation)</span>
                              <span className="font-medium text-red-700 dark:text-red-400">$1,107</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-sm text-red-800 dark:text-red-300">After 30 years (3% inflation)</span>
                              <span className="text-red-800 dark:text-red-300">$824</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-[280px]">
                        <h4 className="text-center text-sm font-medium mb-3">Fixed vs. Inflation-Adjusted Annuity Comparison</h4>
                        <Line 
                          data={{
                            labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
                            datasets: [
                              {
                                label: 'Fixed Annuity (Nominal)',
                                data: [24000, 24000, 24000, 24000, 24000, 24000, 24000],
                                borderColor: 'rgba(99, 102, 241, 0.8)',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              },
                              {
                                label: 'Fixed Annuity (Real Value)',
                                data: [24000, 20703, 17858, 15402, 13284, 11456, 9879],
                                borderColor: 'rgba(220, 38, 38, 0.8)',
                                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                borderWidth: 2
                              },
                              {
                                label: 'Inflation-Protected Annuity',
                                data: [16800, 19480, 22586, 26183, 30362, 35211, 40832],
                                borderColor: 'rgba(16, 185, 129, 0.8)',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: { 
                                  callback: value => '$' + Number(value).toLocaleString()
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
                      <p className="font-medium text-amber-800 dark:text-amber-300">Inflation Protection Strategies</p>
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                        Rather than putting all retirement funds into a fixed annuity, consider a diversified approach: allocate a portion to a fixed annuity for guaranteed baseline income, supplement with an inflation-protected annuity for essential expenses that grow over time, and maintain growth investments to address future inflation concerns.
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
                      Integrating Annuities Into Your Retirement Plan
                    </CardTitle>
                    <CardDescription>
                      Smart strategies for creating lifetime income security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      <strong>Annuities</strong> can play a valuable role in your retirement strategy by providing guaranteed income that continues regardless of how long you live. By understanding the various types of annuities, payout options, and planning considerations, you can determine whetherand howannuities should fit into your broader retirement portfolio.
                    </p>
                    
                    <p className="mt-4" id="next-steps">
                      Consider these strategies when evaluating annuities:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Practical Approaches</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                            <span className="text-blue-800 dark:text-blue-300">Use annuities to cover essential expenses not met by Social Security</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                            <span className="text-blue-800 dark:text-blue-300">Consider annuitizing only a portion of your retirement assets</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                            <span className="text-blue-800 dark:text-blue-300">Compare quotes from multiple insurance providers</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Advanced Planning</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                            <span className="text-green-800 dark:text-green-300">Consider annuity laddering to diversify across time periods</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                            <span className="text-green-800 dark:text-green-300">Evaluate hybrid strategies combining annuities with other investments</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                            <span className="text-green-800 dark:text-green-300">Analyze the tax implications based on your personal situation</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to explore annuity options?</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use our <strong>Annuity Calculator</strong> above to evaluate different scenarios and find the right solution for your retirement needs! For more retirement planning tools, explore our related calculators:
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
                                <Briefcase className="h-4 w-4 mr-1" />
                                Social Security Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/pension">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Pension Calculator
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