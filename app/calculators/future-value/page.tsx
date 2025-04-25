"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Plus, Minus, Info, DollarSign, Percent, AlertCircle, Wallet } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from "next/link"
import type { ChartOptions } from 'chart.js'
import FutureValueSchema from './schema';

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

interface YearlyBreakdown {
  year: number
  balance: number
  contributions: number
  interest: number
}

export default function FutureValueCalculator() {
  // Basic Inputs
  const [initialInvestment, setInitialInvestment] = useState<number>(10000)
  const [interestRate, setInterestRate] = useState<number>(8)
  const [timePeriod, setTimePeriod] = useState<number>(10)
  const [regularContribution, setRegularContribution] = useState<number>(500)
  const [contributionFrequency, setContributionFrequency] = useState<string>("monthly")
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("monthly")

  // Advanced Options
  const [inflationRate, setInflationRate] = useState<number>(2.5)
  const [includeInflation, setIncludeInflation] = useState<boolean>(false)
  const [taxRate, setTaxRate] = useState<number>(25)
  const [includeTax, setIncludeTax] = useState<boolean>(false)

  // Results
  const [results, setResults] = useState<{
    futureValue: number
    totalContributions: number
    totalInterest: number
    realFutureValue: number
    afterTaxFutureValue: number
    yearlyBreakdown: YearlyBreakdown[]
  }>({
    futureValue: 0,
    totalContributions: 0,
    totalInterest: 0,
    realFutureValue: 0,
    afterTaxFutureValue: 0,
    yearlyBreakdown: []
  })

  // Input Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Calculate number of contributions per year
  const getContributionsPerYear = (frequency: string): number => {
    switch (frequency) {
      case "annually": return 1
      case "semi-annually": return 2
      case "quarterly": return 4
      case "monthly": return 12
      case "bi-weekly": return 26
      case "weekly": return 52
      default: return 12
    }
  }

  // Calculate number of compounding periods per year
  const getCompoundingPeriodsPerYear = (frequency: string): number => {
    switch (frequency) {
      case "annually": return 1
      case "semi-annually": return 2
      case "quarterly": return 4
      case "monthly": return 12
      case "daily": return 365
      default: return 12
    }
  }

  // Validate inputs
  const validateInputs = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    if (initialInvestment < 0) newErrors.initialInvestment = "Initial investment cannot be negative"
    if (regularContribution < 0) newErrors.regularContribution = "Regular contribution cannot be negative"
    if (timePeriod <= 0) newErrors.timePeriod = "Time period must be greater than 0"
    if (interestRate < 0 || interestRate > 100) newErrors.interestRate = "Interest rate must be between 0% and 100%"
    if (includeInflation && (inflationRate < 0 || inflationRate > 100)) newErrors.inflationRate = "Inflation rate must be between 0% and 100%"
    if (includeTax && (taxRate < 0 || taxRate > 100)) newErrors.taxRate = "Tax rate must be between 0% and 100%"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Calculate future value
  useEffect(() => {
    if (!validateInputs()) return

    const contributionsPerYear = getContributionsPerYear(contributionFrequency)
    const compoundingPeriodsPerYear = getCompoundingPeriodsPerYear(compoundingFrequency)
    const yearlyBreakdown: YearlyBreakdown[] = []

    let balance = initialInvestment
    let totalContributions = initialInvestment

    for (let year = 1; year <= timePeriod; year++) {
      const startBalance = balance
      const yearlyContribution = regularContribution * contributionsPerYear

      // Calculate compound interest with periodic contributions
      balance = balance * Math.pow(1 + interestRate / (100 * compoundingPeriodsPerYear), compoundingPeriodsPerYear)
      balance += yearlyContribution

      totalContributions += yearlyContribution

      yearlyBreakdown.push({
        year,
        balance,
        contributions: totalContributions,
        interest: balance - totalContributions
      })
    }

    let realFutureValue = balance
    if (includeInflation) {
      realFutureValue = balance / Math.pow(1 + inflationRate / 100, timePeriod)
    }

    let afterTaxFutureValue = balance
    if (includeTax) {
      const totalGain = balance - totalContributions
      afterTaxFutureValue = totalContributions + (totalGain * (1 - taxRate / 100))
    }

    setResults({
      futureValue: balance,
      totalContributions,
      totalInterest: balance - totalContributions,
      realFutureValue,
      afterTaxFutureValue,
      yearlyBreakdown
    })
  }, [
    initialInvestment,
    interestRate,
    timePeriod,
    regularContribution,
    contributionFrequency,
    compoundingFrequency,
    inflationRate,
    includeInflation,
    taxRate,
    includeTax
  ])

  // Chart data and options
  const chartColors = {
    primary: [
      'rgba(99, 102, 241, 0.9)',
      'rgba(59, 130, 246, 0.9)',
      'rgba(14, 165, 233, 0.9)',
    ],
    secondary: [
      'rgba(99, 102, 241, 0.2)',
      'rgba(59, 130, 246, 0.2)',
      'rgba(14, 165, 233, 0.2)',
    ]
  }

  const growthChartData = useMemo(() => ({
    labels: results.yearlyBreakdown.map(item => `Year ${item.year}`),
    datasets: [
      {
        label: 'Balance',
        data: results.yearlyBreakdown.map(item => item.balance),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4,
        fill: false
      }
    ]
  }), [results.yearlyBreakdown])

  const growthChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`
        }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Balance: ${formatCurrency(context.raw as number)}`
        }
      }
    }
  }

  const breakdownChartData = useMemo(() => ({
    labels: ['Initial Investment', 'Total Contributions', 'Total Interest'],
    datasets: [
      {
        data: [
          initialInvestment,
          results.totalContributions - initialInvestment,
          results.totalInterest
        ],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
        borderWidth: 2
      }
    ]
  }), [initialInvestment, results.totalContributions, results.totalInterest])

  const breakdownChartOptions: ChartOptions<'pie'> = {
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
        formatter: (value: number) => `${(value / results.futureValue * 100).toFixed(1)}%`
      }
    }
  }

  const contributionsChartData = useMemo(() => ({
    labels: results.yearlyBreakdown.map(item => `Year ${item.year}`),
    datasets: [
      {
        label: 'Contributions',
        data: results.yearlyBreakdown.map(item => item.contributions),
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Interest',
        data: results.yearlyBreakdown.map(item => item.interest),
        backgroundColor: chartColors.primary[2],
        borderColor: chartColors.secondary[2].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }), [results.yearlyBreakdown])

  const contributionsChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`
        }
      },
      x: {
        stacked: true,
        grid: { display: false }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw as number)}`
        }
      }
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + '%'
  }

  const exportPDF = async () => {
    const element = document.getElementById('results-section')
    if (!element) return
    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
    pdf.save('future-value-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <FutureValueSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Future Value <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Project the growth of your investments with precision, factoring in contributions, compounding, inflation, and taxes.
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
                    <CardTitle>Investment Details</CardTitle>
                    <CardDescription>
                      Enter your investment parameters to calculate its future value.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Basic Inputs */}
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="initial-investment">Initial Investment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="initial-investment"
                              type="number"
                              className="pl-9"
                              value={initialInvestment}
                              onChange={(e) => setInitialInvestment(Math.max(0, Number(e.target.value)))}
                              aria-describedby="initial-investment-error"
                            />
                          </div>
                          {errors.initialInvestment && (
                            <p id="initial-investment-error" className="text-xs text-red-500">
                              {errors.initialInvestment}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="regular-contribution">Regular Contribution</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="regular-contribution"
                              type="number"
                              className="pl-9"
                              value={regularContribution}
                              onChange={(e) => setRegularContribution(Math.max(0, Number(e.target.value)))}
                              aria-describedby="regular-contribution-error"
                            />
                          </div>
                          {errors.regularContribution && (
                            <p id="regular-contribution-error" className="text-xs text-red-500">
                              {errors.regularContribution}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="contribution-frequency">Contribution Frequency</Label>
                          <Select value={contributionFrequency} onValueChange={setContributionFrequency}>
                            <SelectTrigger id="contribution-frequency" aria-label="Select contribution frequency">
                              <SelectValue placeholder="Select frequency" />
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
                        <div className="space-y-2">
                          <Label htmlFor="compounding-frequency">Compounding Frequency</Label>
                          <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                            <SelectTrigger id="compounding-frequency" aria-label="Select compounding frequency">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="annually">Annually</SelectItem>
                              <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="interest-rate">Annual Interest Rate</Label>
                          <span className="text-sm text-muted-foreground">{interestRate}%</span>
                        </div>
                        <Slider
                          id="interest-rate"
                          min={0}
                          max={30}
                          step={0.1}
                          value={[interestRate]}
                          onValueChange={(value) => setInterestRate(value[0])}
                          aria-label="Adjust annual interest rate"
                        />
                        {errors.interestRate && (
                          <p className="text-xs text-red-500">{errors.interestRate}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time-period">Investment Period (Years)</Label>
                        <Input
                          id="time-period"
                          type="number"
                          value={timePeriod}
                          onChange={(e) => setTimePeriod(Math.max(1, Number(e.target.value)))}
                          aria-describedby="time-period-error"
                        />
                        {errors.timePeriod && (
                          <p id="time-period-error" className="text-xs text-red-500">
                            {errors.timePeriod}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Advanced Options</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="include-inflation">Include Inflation</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Adjust future value for inflation to calculate real purchasing power
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Switch
                              id="include-inflation"
                              checked={includeInflation}
                              onCheckedChange={setIncludeInflation}
                              aria-label="Toggle inflation adjustment"
                            />
                          </div>
                          {includeInflation && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="inflation-rate">Inflation Rate</Label>
                                <span className="text-sm text-muted-foreground">{inflationRate}%</span>
                              </div>
                              <Slider
                                id="inflation-rate"
                                min={0}
                                max={10}
                                step={0.1}
                                value={[inflationRate]}
                                onValueChange={(value) => setInflationRate(value[0])}
                                aria-label="Adjust inflation rate"
                              />
                              {errors.inflationRate && (
                                <p className="text-xs text-red-500">{errors.inflationRate}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="include-tax">Include Tax</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Calculate after-tax future value
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Switch
                              id="include-tax"
                              checked={includeTax}
                              onCheckedChange={setIncludeTax}
                              aria-label="Toggle tax adjustment"
                            />
                          </div>
                          {includeTax && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="tax-rate">Tax Rate</Label>
                                <span className="text-sm text-muted-foreground">{taxRate}%</span>
                              </div>
                              <Slider
                                id="tax-rate"
                                min={0}
                                max={50}
                                step={1}
                                value={[taxRate]}
                                onValueChange={(value) => setTaxRate(value[0])}
                                aria-label="Adjust tax rate"
                              />
                              {errors.taxRate && (
                                <p className="text-xs text-red-500">{errors.taxRate}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              <div id="results-section" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Results</CardTitle>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={exportPDF} aria-label="Export results as PDF">
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
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 text-center">
                        <p className="text-sm text-muted-foreground">Initial Investment</p>
                        <p className="text-2xl font-bold">{formatCurrency(initialInvestment)}</p>
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-sm text-muted-foreground">Future Value</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(results.futureValue)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="growth" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="growth">Growth</TabsTrigger>
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="contributions">Contributions</TabsTrigger>
                      </TabsList>
                      <TabsContent value="growth" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={growthChartData} options={growthChartOptions} />
                        </div>
                        <div className="grid gap-4">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Total Contributions</p>
                              <p className="text-xs text-muted-foreground">Including initial investment</p>
                            </div>
                            <p className="font-bold">{formatCurrency(results.totalContributions)}</p>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Total Interest Earned</p>
                              <p className="text-xs text-muted-foreground">Return on investment</p>
                            </div>
                            <p className="font-bold">{formatCurrency(results.totalInterest)}</p>
                          </div>
                          {includeInflation && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium">Real Future Value</p>
                                <p className="text-xs text-muted-foreground">Adjusted for inflation</p>
                              </div>
                              <p className="font-bold">{formatCurrency(results.realFutureValue)}</p>
                            </div>
                          )}
                          {includeTax && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium">After-Tax Future Value</p>
                                <p className="text-xs text-muted-foreground">Net of taxes</p>
                              </div>
                              <p className="font-bold">{formatCurrency(results.afterTaxFutureValue)}</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={breakdownChartData} options={breakdownChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Breakdown of future value components
                        </div>
                      </TabsContent>
                      <TabsContent value="contributions" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={contributionsChartData} options={contributionsChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Yearly contributions and interest accumulation
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Investment Insight</p>
                            <p className="text-sm text-muted-foreground">
                              {regularContribution > 0
                                ? `Regular contributions of ${formatCurrency(regularContribution)} ${contributionFrequency} significantly boost your future value.`
                                : "Consider adding regular contributions to maximize your investment growth."}
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
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Financial Resource</span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Master the Future Value Calculator: Your Complete Guide</h2>
                <p className="mt-3 text-muted-foreground text-lg">Learn how to project your investment growth effectively</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding the Future Value Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 id="what-is-calculator" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is the Future Value Calculator?</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                      <p>
                        The <strong>Future Value Calculator</strong> is a powerful tool that helps you project the growth of your investments over time. By considering factors like initial investment, regular contributions, interest rates, compounding frequency, inflation, and taxes, it provides a comprehensive view of your investment's potential.
                      </p>
                      <p className="mt-2">
                        Key features include:
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Initial investment and regular contributions</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Interest rate and compounding frequency</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Inflation and tax adjustments</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>Visual breakdowns and growth charts</span>
                        </li>
                      </ul>
                      <p>
                        This calculator is essential for anyone looking to understand how their investments could grow and to make informed financial decisions.
                      </p>
                    </div>
                    <div className="md:w-[300px] h-[260px] flex-shrink-0">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                          <CardTitle className="text-sm font-medium text-center">Investment Growth Over Time</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full">
                            <Line
                              data={{
                                labels: ['Year 0', 'Year 5', 'Year 10'],
                                datasets: [
                                  {
                                    label: 'Balance',
                                    data: [10000, 15000, 22500], // Example data
                                    borderColor: 'rgba(99, 102, 241, 0.8)',
                                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    ticks: { callback: (value) => `$${value}` }
                                  }
                                }
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <h4 id="why-important" className="font-semibold text-xl mt-6">Why Future Value Matters</h4>
                  <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Financial Planning</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Understand how your investments can grow to meet future goals.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Inflation Awareness</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">See how inflation affects your investment's real value.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Tax Efficiency</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Calculate net returns after taxes for better planning.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p>
                    In an era of economic uncertainty, projecting your investment's future value is crucial for achieving financial security and peace of mind.
                  </p>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">How to Use the Future Value Calculator</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="step-by-step" className="font-bold text-xl mb-4">Step-by-Step Guide</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">1</span>
                          Enter Initial Investment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">Input the starting amount of your investment, such as $10,000.</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">2</span>
                          Set Interest Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">Specify the expected annual interest rate, e.g., 8%.</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">3</span>
                          Define Time Period
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">Choose the number of years for the investment, such as 10 years.</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">4</span>
                          Add Regular Contributions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">Input the amount and frequency of additional contributions, e.g., $500 monthly.</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">5</span>
                          Adjust for Inflation and Taxes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">Optionally include inflation and tax rates for a more accurate projection.</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">6</span>
                          Review Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">Analyze the future value, total contributions, and interest earned through charts and summaries.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <h3 id="results" className="font-bold text-xl mt-8 mb-4">Interpreting Your Results</h3>
                
                <div className="mb-6">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Result</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Importance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Future Value</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Total value of investment at the end of the period</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Shows overall growth</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Total Contributions</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Sum of initial investment and regular contributions</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Tracks total input</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Total Interest</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Interest earned over the investment period</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Measures investment efficiency</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Real Future Value</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Future value adjusted for inflation</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Shows actual purchasing power</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">After-Tax Future Value</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Future value after accounting for taxes</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Reflects net returns</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Tip:</strong> Regular contributions and higher compounding frequencies can significantly enhance your future value. Experiment with different scenarios to optimize your investment strategy.
                  </p>
                </div>
              </div>

              {/* Key Concepts Section */}
              <div className="mb-12" id="key-concepts">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        <span className="text-2xl">Key Concepts in Future Value Calculations</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Understanding the building blocks of investment growth
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h3 id="compound-interest" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        The Power of Compound Interest
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p>
                            <strong>Compound interest</strong> is the interest earned on both the initial principal and the accumulated interest from previous periods. This leads to exponential growth over time, making it a powerful force in wealth building.
                          </p>
                          <ul className="mt-4 space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>Frequency Matters:</strong> More frequent compounding accelerates growth.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>Long-Term Impact:</strong> The longer the investment period, the greater the effect.</span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                              <strong>Example:</strong> $1,000 at 5% interest compounded annually grows to $1,628.89 in 10 years, but $1,647.01 if compounded monthly.
                            </p>
                          </div>
                        </div>
                        
                        <div className="h-[220px]">
                          <h4 className="text-center text-sm font-medium mb-2">Compounding Frequency Impact</h4>
                          <Bar
                            data={{
                              labels: ['Annual', 'Semi-Annual', 'Quarterly', 'Monthly'],
                              datasets: [
                                {
                                  label: 'Future Value',
                                  data: [1628.89, 1643.62, 1647.01, 1648.61],
                                  backgroundColor: 'rgba(124, 58, 237, 0.8)',
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { legend: { display: false } },
                              scales: {
                                y: {
                                  beginAtZero: false,
                                  ticks: { callback: (value) => `$${value}` }
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
                        <h3 id="regular-contributions" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                          <RefreshCw className="h-5 w-5" />
                          The Impact of Regular Contributions
                        </h3>
                        <p>
                          <strong>Regular contributions</strong> can significantly enhance the future value of your investment, especially when combined with compound interest.
                        </p>
                        
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Scenario</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Initial Investment</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Monthly Contribution</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Future Value (10 Years, 8%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">No Contributions</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$10,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$0</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$21,589</td>
                              </tr>
                              <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">With Contributions</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$10,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$500</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$94,839</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div>
                        <h3 id="inflation-tax" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <Percent className="h-5 w-5" />
                          Inflation and Tax Considerations
                        </h3>
                        <p>
                          <strong>Inflation</strong> reduces the purchasing power of your future investment, while <strong>taxes</strong> can diminish your net returns. Adjusting for these factors provides a more realistic view of your investment's future value.
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">Real vs. Nominal Value</h4>
                          <div className="mt-3">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div className="font-medium text-blue-700 dark:text-blue-400">Nominal Future Value</div>
                              <div className="text-blue-600 dark:text-blue-500">$100,000</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Inflation Rate</div>
                              <div className="text-blue-600 dark:text-blue-500">2.5%</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Real Future Value</div>
                              <div className="text-blue-600 dark:text-blue-500">$78,353 (over 10 years)</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Investment Trends Section */}
              <div className="mb-12" id="investment-trends">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Investment Growth Insights
                </h2>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Historical Stock Returns</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">10.2%</p>
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">S&P 500 (1926-2023)</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                          <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">Bond Returns</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">5.3%</p>
                        <p className="mt-1 text-sm text-green-600 dark:text-green-500">1926-2023</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                          <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Inflation Rate</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">3.1%</p>
                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">1913-2023</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                          <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Savings Growth</h3>
                        <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">5.5%</p>
                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">Average High-Yield Savings</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="inflation-impact" className="text-xl font-bold mb-4">The Erosion of Purchasing Power</h3>
                <Card className="bg-white dark:bg-gray-900 mb-4">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p>
                          <strong>Inflation</strong> reduces the real value of your future investment, meaning your money buys less over time. For example, at 3% inflation, $100,000 today would have the purchasing power of approximately $74,409 in 10 years.
                        </p>
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Inflation Adjustment</h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">Nominal Future Value</span>
                              <span className="font-medium text-red-700 dark:text-red-400">$100,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">Inflation Rate</span>
                              <span className="font-medium text-red-700 dark:text-red-400">3%</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-sm text-red-800 dark:text-red-300">Real Future Value (10 years)</span>
                              <span className="text-red-800 dark:text-red-300">$74,409</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-[280px]">
                        <h4 className="text-center text-sm font-medium mb-3">Nominal vs. Real Value Over Time</h4>
                        <Line
                          data={{
                            labels: ['Year 0', 'Year 5', 'Year 10'],
                            datasets: [
                              {
                                label: 'Nominal Value',
                                data: [100000, 100000, 100000],
                                borderColor: 'rgba(99, 102, 241, 0.8)',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              },
                              {
                                label: 'Real Value (3% Inflation)',
                                data: [100000, 86261, 74409],
                                borderColor: 'rgba(220, 38, 38, 0.8)',
                                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: { callback: (value) => `$${Number(value).toLocaleString()}` }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conclusion Section */}
              <div className="mb-6" id="conclusion">
                <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
                    <CardTitle id="summary" className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                      Your Path to Financial Growth
                    </CardTitle>
                    <CardDescription>
                      Harness the power of compound interest and strategic planning
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      The <strong>Future Value Calculator</strong> empowers you to visualize your financial future by projecting investment growth with precision. By understanding compound interest, regular contributions, and the impacts of inflation and taxes, you can make informed decisions to achieve your financial goals.
                    </p>
                    
                    <p className="mt-4" id="next-steps">
                      Take control of your financial journey:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Immediate Actions</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                            <span className="text-blue-800 dark:text-blue-300">Set clear investment goals</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                            <span className="text-blue-800 dark:text-blue-300">Start with a solid initial investment</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                            <span className="text-blue-800 dark:text-blue-300">Commit to regular contributions</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Long-Term Strategy</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                            <span className="text-green-800 dark:text-green-300">Monitor and adjust your investment plan</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                            <span className="text-green-800 dark:text-green-300">Diversify your portfolio</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                            <span className="text-green-800 dark:text-green-300">Stay informed about market trends</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to Project Your Future?</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use our <strong>Future Value Calculator</strong> to start planning your investment growth. Explore related tools:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/present-value">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Present Value Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/compound-interest">
                                <Percent className="h-4 w-4 mr-1" />
                                Compound Interest
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/investment">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                Investment Calculator
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