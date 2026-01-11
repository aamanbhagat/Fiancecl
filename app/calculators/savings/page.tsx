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
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Percent, Clock, Wallet, Calendar } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import SavingsSchema from './schema';

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

export default function SavingsCalculator() {
  // Initial Savings & Contributions
  const [initialAmount, setInitialAmount] = useState<number>(10000)
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500)
  const [contributionGrowth, setContributionGrowth] = useState<number>(2)
  const [enableContributionGrowth, setEnableContributionGrowth] = useState<boolean>(false)
  
  // Interest & Time Settings
  const [interestRate, setInterestRate] = useState<number>(5)
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("monthly")
  const [timeHorizon, setTimeHorizon] = useState<number>(10)
  
  // Additional Options
  const [includeInflation, setIncludeInflation] = useState<boolean>(true)
  const [inflationRate, setInflationRate] = useState<number>(2.5)
  const [taxRate, setTaxRate] = useState<number>(25)
  const [includeTaxes, setIncludeTaxes] = useState<boolean>(false)
  
  // Results State
  const [futureValue, setFutureValue] = useState<number>(0)
  const [realFutureValue, setRealFutureValue] = useState<number>(0)
  const [totalContributions, setTotalContributions] = useState<number>(0)
  const [totalInterest, setTotalInterest] = useState<number>(0)
  const [yearlyBreakdown, setYearlyBreakdown] = useState<{
    year: number;
    balance: number;
    contributions: number;
    interest: number;
    realBalance: number;
  }[]>([])

  // Calculate savings growth
  useEffect(() => {
    const periodsPerYear = {
      annually: 1,
      semiannually: 2,
      quarterly: 4,
      monthly: 12,
      daily: 365
    }[compoundingFrequency] ?? 12;

    const effectiveRate = interestRate / 100
    const periodicRate = effectiveRate / periodsPerYear
    const totalPeriods = timeHorizon * periodsPerYear

    let balance = initialAmount
    let totalContributed = initialAmount
    let currentContribution = monthlyContribution
    let breakdown = []

    for (let year = 1; year <= timeHorizon; year++) {
      let yearlyContributions = 0
      let yearlyInterest = 0
      const startingBalance = balance

      for (let period = 1; period <= periodsPerYear; period++) {
        const periodicContribution = (currentContribution * 12) / periodsPerYear
        yearlyContributions += periodicContribution
        balance += periodicContribution
        const interestEarned = balance * periodicRate
        balance += interestEarned
        yearlyInterest += interestEarned
      }

      if (enableContributionGrowth) {
        currentContribution *= (1 + contributionGrowth / 100)
      }

      totalContributed += yearlyContributions
      const realBalance = includeInflation
        ? balance / Math.pow(1 + inflationRate / 100, year)
        : balance

      if (includeTaxes) {
        yearlyInterest *= (1 - taxRate / 100)
        balance = startingBalance + yearlyContributions + yearlyInterest
      }

      breakdown.push({
        year,
        balance,
        contributions: totalContributed,
        interest: balance - totalContributed,
        realBalance
      })
    }

    setFutureValue(balance)
    setTotalContributions(totalContributed)
    setTotalInterest(balance - totalContributed)
    setRealFutureValue(
      includeInflation
        ? balance / Math.pow(1 + inflationRate / 100, timeHorizon)
        : balance
    )
    setYearlyBreakdown(breakdown)
  }, [
    initialAmount,
    monthlyContribution,
    contributionGrowth,
    enableContributionGrowth,
    interestRate,
    compoundingFrequency,
    timeHorizon,
    includeInflation,
    inflationRate,
    includeTaxes,
    taxRate
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

  // Savings breakdown chart
  const pieChartData = {
    labels: ['Initial Amount', 'Additional Contributions', 'Interest Earned'],
    datasets: [{
      data: [initialAmount, totalContributions - initialAmount, totalInterest],
      backgroundColor: chartColors.primary.slice(0, 3),
      borderColor: chartColors.secondary.slice(0, 3).map(color => color.replace('0.2', '1')),
      borderWidth: 2
    }]
  }

  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' } },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => ((value / futureValue) * 100).toFixed(1) + '%'
      }
    }
  }

  // Growth over time chart
  const generateGrowthChart = () => ({
    labels: yearlyBreakdown.map(y => `Year ${y.year}`),
    datasets: [
      {
        label: 'Total Balance',
        data: yearlyBreakdown.map(y => y.balance),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      },
      {
        label: 'Total Contributions',
        data: yearlyBreakdown.map(y => y.contributions),
        borderColor: chartColors.primary[1],
        backgroundColor: chartColors.secondary[1],
        tension: 0.4
      },
      {
        label: 'Real Value (Inflation Adjusted)',
        data: yearlyBreakdown.map(y => y.realBalance),
        borderColor: chartColors.primary[2],
        backgroundColor: chartColors.secondary[2],
        tension: 0.4,
        hidden: !includeInflation
      }
    ]
  })

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { callback: (value) => '$' + (typeof value === 'number' ? value.toLocaleString() : value) }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' } }
    }
  }

  // Scenario comparison chart
  const generateScenarioChart = () => {
    const scenarios = [
      { rate: Math.max(0, interestRate - 2), label: 'Conservative' },
      { rate: interestRate, label: 'Expected' },
      { rate: interestRate + 2, label: 'Optimistic' }
    ]

    const calculateScenario = (rate: number) => {
      const monthlyRate = rate / 100 / 12
      let balance = initialAmount
      let contribution = monthlyContribution

      for (let month = 1; month <= timeHorizon * 12; month++) {
        balance += contribution
        balance *= (1 + monthlyRate)
        if (enableContributionGrowth && month % 12 === 0) {
          contribution *= (1 + contributionGrowth / 100)
        }
      }
      return balance
    }

    return {
      labels: scenarios.map(s => `${s.label} (${s.rate}%)`),
      datasets: [{
        label: 'Future Value',
        data: scenarios.map(s => calculateScenario(s.rate)),
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }]
    }
  }

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { callback: (value) => '$' + (typeof value === 'number' ? value.toLocaleString() : value) }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => '$' + value.toLocaleString()
      }
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)

  const exportPDF = async () => {
    const element = document.getElementById('results-section')
    if (!element) return
    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save('savings-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <SavingsSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Savings <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Plan your savings goals and see how your money can grow over time with regular contributions and compound interest.
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
                    <CardTitle>Enter Savings Details</CardTitle>
                    <CardDescription>
                      Provide information about your savings plan and goals to calculate potential growth.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Initial Savings & Contributions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Initial Savings & Contributions</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="initial-amount">Initial Amount</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="initial-amount"
                              type="number"
                              className="pl-9"
                              value={initialAmount || ''} onChange={(e) => setInitialAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="monthly-contribution">Monthly Contribution</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="monthly-contribution"
                              type="number"
                              className="pl-9"
                              value={monthlyContribution || ''} onChange={(e) => setMonthlyContribution(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="contribution-growth">Enable Contribution Growth</Label>
                            <Switch
                              id="contribution-growth"
                              checked={enableContributionGrowth}
                              onCheckedChange={setEnableContributionGrowth}
                            />
                          </div>
                          {enableContributionGrowth && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="growth-rate">Annual Growth Rate</Label>
                                <span className="text-sm text-muted-foreground">{contributionGrowth}%</span>
                              </div>
                              <Slider
                                id="growth-rate"
                                min={0}
                                max={10}
                                step={0.5}
                                value={[contributionGrowth]}
                                onValueChange={(value) => setContributionGrowth(value[0])}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interest & Time Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Interest & Time Settings</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interest-rate">Annual Interest Rate</Label>
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
                          <Label htmlFor="compounding-frequency">Compounding Frequency</Label>
                          <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                            <SelectTrigger id="compounding-frequency">
                              <SelectValue placeholder="Select compounding frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="semiannually">Semi-Annually</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time-horizon">Time Horizon (Years)</Label>
                          <Select value={String(timeHorizon)} onValueChange={(value) => setTimeHorizon(Number(value))}>
                            <SelectTrigger id="time-horizon">
                              <SelectValue placeholder="Select time horizon" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 Years</SelectItem>
                              <SelectItem value="10">10 Years</SelectItem>
                              <SelectItem value="15">15 Years</SelectItem>
                              <SelectItem value="20">20 Years</SelectItem>
                              <SelectItem value="25">25 Years</SelectItem>
                              <SelectItem value="30">30 Years</SelectItem>
                              <SelectItem value="35">35 Years</SelectItem>
                              <SelectItem value="40">40 Years</SelectItem>
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
                            <Label htmlFor="include-inflation">Account for Inflation</Label>
                            <Switch
                              id="include-inflation"
                              checked={includeInflation}
                              onCheckedChange={setIncludeInflation}
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
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="include-taxes">Include Tax Impact</Label>
                            <Switch
                              id="include-taxes"
                              checked={includeTaxes}
                              onCheckedChange={setIncludeTaxes}
                            />
                          </div>
                          {includeTaxes && (
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
                      <p className="text-sm text-muted-foreground">Future Value</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(futureValue)}</p>
                      {includeInflation && (
                        <p className="text-sm text-muted-foreground">
                          Real Value (Adjusted for Inflation): {formatCurrency(realFutureValue)}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="growth">Growth</TabsTrigger>
                        <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Savings Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Initial Amount</span>
                              <span className="font-medium">{formatCurrency(initialAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Contributions</span>
                              <span className="font-medium">{formatCurrency(totalContributions - initialAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Interest Earned</span>
                              <span className="font-medium">{formatCurrency(totalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Future Value</span>
                              <span>{formatCurrency(futureValue)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="growth" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateGrowthChart()} options={lineChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Savings growth over {timeHorizon} years
                        </div>
                      </TabsContent>

                      <TabsContent value="scenarios" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={generateScenarioChart()} options={barChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Comparison of different return scenarios
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Savings Analysis</p>
                            <p className="text-sm text-muted-foreground">
                              {monthlyContribution > 0 
                                ? `By saving ${formatCurrency(monthlyContribution)} monthly${
                                    enableContributionGrowth 
                                      ? ` with a ${contributionGrowth}% annual increase` 
                                      : ''
                                  }, you could accumulate ${formatCurrency(futureValue)} in ${timeHorizon} years.`
                                : `Starting with ${formatCurrency(initialAmount)}, you could accumulate ${formatCurrency(futureValue)} in ${timeHorizon} years at a ${interestRate}% annual return.`
                              }
                              {includeInflation && 
                                ` Adjusted for inflation, this would be worth ${formatCurrency(realFutureValue)} in today's dollars.`
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                  
                  <SaveCalculationButton
                    calculatorType="savings"
                    inputs={{
                      initialAmount,
                      monthlyContribution,
                      contributionGrowth,
                      enableContributionGrowth,
                      interestRate,
                      compoundingFrequency,
                      timeHorizon,
                      includeInflation,
                      inflationRate,
                      taxRate,
                      includeTaxes
                    }}
                    results={{
                      futureValue,
                      realFutureValue,
                      totalContributions,
                      totalInterest,
                      yearlyBreakdown
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
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Financial Resource</span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Master the Art of Saving: Your Complete Guide</h2>
                <p className="mt-3 text-muted-foreground text-lg">Everything you need to know about maximizing your savings potential</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding Savings Calculators
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 id="what-is-calculator" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is a Savings Calculator?</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                      <p>
                        A <strong>Savings Calculator</strong> is a sophisticated financial planning tool that projects how your money grows over time through the power of compound interest and regular contributions. It transforms complex financial formulas into intuitive visualizations, making financial planning accessible to everyone.
                      </p>
                      <p className="mt-2">
                        By accounting for variables such as:
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Initial deposit amounts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Recurring contribution schedule</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Interest rates and compounding frequency</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>Time horizon for your savings goals</span>
                        </li>
                      </ul>
                      <p>
                        These tools provide detailed projections of future account balances, helping you set realistic financial goals and develop effective savings strategies without requiring advanced financial expertise.
                      </p>
                    </div>
                    <div className="md:w-[300px] h-[260px] flex-shrink-0">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                          <CardTitle className="text-sm font-medium text-center">Compound Growth Comparison</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full">
                            <Line 
                              data={{
                                labels: ['Year 0', 'Year 5', 'Year 10', 'Year 15', 'Year 20'],
                                datasets: [
                                  {
                                    label: 'Simple Interest',
                                    data: [10000, 15000, 20000, 25000, 30000],
                                    borderColor: 'rgba(99, 102, 241, 0.8)',
                                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                  },
                                  {
                                    label: 'Compound Interest',
                                    data: [10000, 16386, 26851, 44002, 72052],
                                    borderColor: 'rgba(20, 184, 166, 0.8)',
                                    backgroundColor: 'rgba(20, 184, 166, 0.2)',
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
                                  }
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    ticks: { maxTicksLimit: 5 }
                                  }
                                }
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <h4 id="why-important" className="font-semibold text-xl mt-6">Why Financial Planning is Critical in Today's Economy</h4>
                  <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Inflation Erosion</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">At 3% annual inflation, your money loses half its purchasing power every 24 years</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Retirement Gap</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">More than 40% of Americans risk running out of money in retirement</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Self-Directed Planning</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Traditional pensions continue to decline, shifting responsibility to individuals</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p>
                    Financial planning with savings calculators empowers you to visualize your financial future, adjust your strategy based on concrete projections, and maintain motivation by seeing how consistent small contributions compound dramatically over time. This approach helps you prepare for major life events, build resilience against economic uncertainties, and achieve peace of mind knowing your financial path is well-planned and monitored.
                  </p>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Mastering the Savings Calculator</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="step-by-step" className="font-bold text-xl mb-4">Interactive Step-by-Step Guide</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">1</span>
                          Initial Setup
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Enter your starting amount (even $0 works)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Set regular contribution amount and frequency</span>
                          </li>
                        </ul>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>Start with whatever you have now, even if it's nothing. The power of savings comes from consistency over time.</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">2</span>
                          Growth Parameters
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Percent className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Enter expected interest rate</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Select compounding frequency (daily to annually)</span>
                          </li>
                        </ul>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>Higher compounding frequency typically results in better growth over time.</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">3</span>
                          Advanced Options
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Enable inflation adjustment</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Add tax considerations for more accuracy</span>
                          </li>
                        </ul>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>More realistic projections help you prepare for real-world conditions affecting your savings.</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">4</span>
                          Analyze Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Review visual breakdown charts</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <LineChart className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Explore different growth scenarios</span>
                          </li>
                        </ul>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>Compare different saving strategies to optimize your approach.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <h3 id="results" className="font-bold text-xl mt-8 mb-4">Understanding Your Calculation Results</h3>
                
                <div className="mb-6">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Result Component</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Why It Matters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Future Value</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Total account balance at the end of your time horizon</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Shows your total savings growth potential</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Total Contributions</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Sum of all deposits made (initial + periodic)</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Highlights how much you actually save vs. interest earned</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Interest Earned</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Money generated through compound interest</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Demonstrates the power of letting your money work for you</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Real (Inflation-Adjusted) Value</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Future balance expressed in today's purchasing power</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Provides a more realistic picture of your future wealth</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Growth Visualization</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Charts showing yearly balance progression</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Helps you visualize when compound interest acceleration occurs</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Pro Tip:</strong> Pay special attention to the difference between nominal and real (inflation-adjusted) returns. While your nominal balance might look impressive, the real value provides a more accurate picture of your future purchasing power.
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
                        <span className="text-2xl">Key Factors in Savings Growth</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Understanding these elements will help you optimize your savings strategy
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
                            <strong>Compound interest</strong> is often called the "eighth wonder of the world" because it generates returns on both your principal and accumulated interest, creating an accelerating growth curve over time.
                          </p>
                          <ul className="mt-4 space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>Simple interest</strong> only earns on the principal amount</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>Compound interest</strong> earns on principal plus previously earned interest</span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                              <strong>Example:</strong> $10,000 at 5% for 30 years
                            </p>
                            <ul className="text-sm mt-1 text-purple-700 dark:text-purple-400">
                              <li>Simple interest: $25,000 ($15,000 interest)</li>
                              <li>Compound interest: $43,219 ($33,219 interest)</li>
                            </ul>
                            <p className="text-xs mt-2 text-purple-600 dark:text-purple-500">That's over <strong>2.2x more interest</strong> through compounding!</p>
                          </div>
                        </div>
                        
                        <div className="h-[220px]">
                          <h4 className="text-center text-sm font-medium mb-2">Simple vs. Compound Interest Growth</h4>
                          <Line 
                            data={{
                              labels: ['Year 0', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
                              datasets: [
                                {
                                  label: 'Simple Interest',
                                  data: [10000, 12500, 15000, 17500, 20000, 22500, 25000],
                                  borderColor: 'rgba(124, 58, 237, 0.8)',
                                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                                },
                                {
                                  label: 'Compound Interest',
                                  data: [10000, 12763, 16289, 20789, 26533, 33864, 43219],
                                  borderColor: 'rgba(79, 70, 229, 0.8)',
                                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                  borderWidth: 2
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
                        <h3 id="contribution-frequency" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                          <RefreshCw className="h-5 w-5" />
                          Contribution Frequency Impact
                        </h3>
                        <p>More frequent contributions accelerate your savings growth by allowing your money to begin earning interest sooner.</p>
                        
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Frequency</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Annual Amount</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">After 20 Years*</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Advantage</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Annual</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$6,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$208,977</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Baseline</td>
                              </tr>
                              <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Quarterly</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$6,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$212,653</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">+$3,676</td>
                              </tr>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Monthly</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$6,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$213,610</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">+$4,633</td>
                              </tr>
                              <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Bi-weekly</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$6,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$214,149</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">+$5,172</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">*Assuming 6% annual return, compounded at the same frequency as contributions</p>
                      </div>
                      
                      <div>
                        <h3 id="time-horizon" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Time Horizon Effects
                        </h3>
                        <p>
                          The exponential nature of compound growth means that the final years of long-term savings generate the most dramatic growth. Starting early—even with small amounts—is one of the most powerful wealth-building strategies.
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">The Early Bird Advantage</h4>
                          <div className="mt-3">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div className="font-medium text-blue-700 dark:text-blue-400">Scenario A:</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Scenario B:</div>
                              <div className="text-blue-600 dark:text-blue-500">$5,000/year from age 25-35</div>
                              <div className="text-blue-600 dark:text-blue-500">$5,000/year from age 35-65</div>
                              <div className="text-blue-600 dark:text-blue-500">$50,000 total invested</div>
                              <div className="text-blue-600 dark:text-blue-500">$150,000 total invested</div>
                              <div className="font-bold text-blue-800 dark:text-blue-300">$602,070 at age 65</div>
                              <div className="font-bold text-blue-800 dark:text-blue-300">$540,741 at age 65</div>
                            </div>
                            <p className="mt-3 text-xs text-blue-700 dark:text-blue-400">*Assuming 8% average annual returns</p>
                          </div>
                        </div>
                        
                        <h3 id="interest-rates" className="text-xl font-bold text-green-700 dark:text-green-400 mt-6 mb-4 flex items-center gap-2">
                          <Percent className="h-5 w-5" />
                          Interest Rate Variations
                        </h3>
                        <p className="mb-4">
                          Small differences in interest rates create dramatic differences in long-term outcomes. This underscores the importance of finding the highest possible rates for your savings.
                        </p>
                        <div className="h-[170px]">
                          <Bar 
                            data={{
                              labels: ['3%', '4%', '5%', '6%', '7%'],
                              datasets: [{
                                label: '$10K After 30 Years',
                                data: [24273, 32620, 43219, 57435, 76123],
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
                                  ticks: { maxTicksLimit: 5, callback: value => '$' + Number(value).toLocaleString() }
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

              {/* Savings Trends Section with Statistics */}
              <div className="mb-12" id="savings-statistics">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Savings Trends and Statistics
                </h2>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Average Savings Rate</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">5.4%</p>
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">of disposable income (2025)</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                          <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">High-Yield Savings APY</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">4.35%</p>
                        <p className="mt-1 text-sm text-green-600 dark:text-green-500">National average (2025)</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                          <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Retirement Gap</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">$7T</p>
                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">Projected national shortfall</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                          <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Emergency Fund Access</h3>
                        <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">39%</p>
                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">Americans lacking adequate funds</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="savings-challenges" className="text-xl font-bold mb-4">Common Savings Challenges</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40">
                          <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </span>
                        <CardTitle className="text-base">Income Constraints</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Stagnant wages coupled with rising living costs make consistent saving increasingly difficult for many households, forcing difficult budget decisions.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40">
                          <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </span>
                        <CardTitle className="text-base">Delayed Gratification</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        The psychological challenge of choosing future financial security over immediate rewards remains one of the biggest obstacles to consistent saving behavior.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </span>
                        <CardTitle className="text-base">Unexpected Expenses</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Medical emergencies, home repairs, and car problems frequently derail savings plans, highlighting the critical importance of emergency funds.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="inflation-impact" className="text-xl font-bold mb-4">Inflation Impact on Savings</h3>
                <Card className="bg-white dark:bg-gray-900 mb-4">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p>
                          <strong>Inflation</strong> silently erodes your purchasing power over time. At 3% annual inflation, the value of money halves approximately every 24 years.
                        </p>
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Purchasing Power Erosion</h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">$100,000 today</span>
                              <span className="font-medium text-red-700 dark:text-red-400">$100,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">After 10 years (3% inflation)</span>
                              <span className="font-medium text-red-700 dark:text-red-400">$74,409</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">After 20 years (3% inflation)</span>
                              <span className="font-medium text-red-700 dark:text-red-400">$55,368</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-sm text-red-800 dark:text-red-300">After 30 years (3% inflation)</span>
                              <span className="text-red-800 dark:text-red-300">$41,199</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-[280px]">
                        <h4 className="text-center text-sm font-medium mb-3">Inflation Impact on $100,000 Over Time</h4>
                        <Line 
                          data={{
                            labels: ['Today', '5 Years', '10 Years', '15 Years', '20 Years', '25 Years', '30 Years'],
                            datasets: [
                              {
                                label: 'Nominal Value',
                                data: [10000, 10000, 10000, 10000, 10000, 10000, 10000],
                                borderColor: 'rgba(99, 102, 241, 0.8)',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                borderDash: [5, 5]
                              },
                              {
                                label: 'Real Value (3% Inflation)',
                                data: [10000, 86261, 74409, 64186, 55368, 47761, 41199],
                                borderColor: 'rgba(220, 38, 38, 0.8)',
                                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                borderWidth: 2
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
                        To protect against inflation, seek investments with returns that exceed the inflation rate. For long-term goals, consider assets like stocks, TIPS (Treasury Inflation-Protected Securities), and I-Bonds that have historically outpaced inflation.
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
                      Your Path to Financial Success
                    </CardTitle>
                    <CardDescription>
                      Taking your savings journey to the next level
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      <strong>Savings calculators</strong> transform abstract financial concepts into concrete, personalized projections that can guide your financial journey. By understanding the fundamental principles of saving—compound interest, contribution frequency, time horizons, and interest rate variations—you gain the knowledge to make strategic decisions that significantly impact your long-term financial well-being.
                    </p>
                    
                    <p className="mt-4" id="next-steps">
                      Take control of your financial future today:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Immediate Actions</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                            <span className="text-blue-800 dark:text-blue-300">Set a specific savings goal using our calculator</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                            <span className="text-blue-800 dark:text-blue-300">Automate your savings contributions immediately</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                            <span className="text-blue-800 dark:text-blue-300">Build or strengthen your emergency fund</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Long-Term Strategy</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                            <span className="text-green-800 dark:text-green-300">Diversify your savings across account types</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                            <span className="text-green-800 dark:text-green-300">Regularly review and adjust your strategy</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                            <span className="text-green-800 dark:text-green-300">Increase contributions as your income grows</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to visualize your savings potential?</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use our <strong>Savings Calculator</strong> above to create your personalized savings projection! For more financial planning tools, explore our related calculators:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/401k">
                                <Clock className="h-4 w-4 mr-1" />
                                Retirement Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/compound-interest">
                                <Percent className="h-4 w-4 mr-1" />
                                Compound Interest
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
      </main>
      <SiteFooter />
    </div>
  )
}