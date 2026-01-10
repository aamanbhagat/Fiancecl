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
  Percent,
  Clock,
  Wallet,
  Building,
  Check,
  Calendar
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
import InvestmentSchema from './schema';

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

export default function InvestmentCalculator() {
  // Initial Investment & Contributions
  const [initialInvestment, setInitialInvestment] = useState<number>(10000)
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500)
  const [contributionGrowth, setContributionGrowth] = useState<number>(2)
  const [enableContributionGrowth, setEnableContributionGrowth] = useState<boolean>(false)
  
  // Returns & Time Horizon
  const [annualReturn, setAnnualReturn] = useState<number>(7)
  const [timeHorizon, setTimeHorizon] = useState<number>(20)
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("monthly")
  
  // Risk & Inflation
  const [riskLevel, setRiskLevel] = useState<string>("moderate")
  const [inflationRate, setInflationRate] = useState<number>(2.5)
  const [includeInflation, setIncludeInflation] = useState<boolean>(true)
  
  // Fees & Taxes
  const [managementFee, setManagementFee] = useState<number>(0.25)
  const [taxRate, setTaxRate] = useState<number>(25)
  const [accountType, setAccountType] = useState<string>("taxable")
  
  // Results State
  const [futureValue, setFutureValue] = useState<number>(0)
  const [totalContributions, setTotalContributions] = useState<number>(0)
  const [totalGrowth, setTotalGrowth] = useState<number>(0)
  const [realFutureValue, setRealFutureValue] = useState<number>(0)
  const [yearlyBreakdown, setYearlyBreakdown] = useState<{
    year: number;
    balance: number;
    contributions: number;
    earnings: number;
    realBalance: number;
  }[]>([])

  // Calculate investment growth
  useEffect(() => {
    const compoundingPeriodsPerYear = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  biweekly: 26,
  weekly: 52,
  daily: 365
}[compoundingFrequency] || 12; // Default to monthly if frequency is invalid

    const effectiveRate = (annualReturn - managementFee) / 100
    const periodicRate = effectiveRate / compoundingPeriodsPerYear
    const totalPeriods = timeHorizon * compoundingPeriodsPerYear

    let balance = initialInvestment
    let totalContributed = initialInvestment
    let currentMonthlyContribution = monthlyContribution
    let breakdown = []

    for (let year = 1; year <= timeHorizon; year++) {
      let yearlyContributions = 0
      let yearlyEarnings = 0
      const startingBalance = balance

      // Calculate for each compounding period within the year
      for (let period = 1; period <= compoundingPeriodsPerYear; period++) {
        // Calculate periodic contribution
        const periodicContribution = (currentMonthlyContribution * 12) / compoundingPeriodsPerYear
        yearlyContributions += periodicContribution
        
        // Add contribution and calculate interest
        balance += periodicContribution
        const interestEarned = balance * periodicRate
        balance += interestEarned
        yearlyEarnings += interestEarned
      }

      // Increase contribution if growth is enabled
      if (enableContributionGrowth) {
        currentMonthlyContribution *= (1 + contributionGrowth / 100)
      }

      totalContributed += yearlyContributions

      // Calculate real (inflation-adjusted) value
      const realBalance = includeInflation
        ? balance / Math.pow(1 + inflationRate / 100, year)
        : balance

      breakdown.push({
        year,
        balance,
        contributions: totalContributed,
        earnings: balance - totalContributed,
        realBalance
      })
    }

    setFutureValue(balance)
    setTotalContributions(totalContributed)
    setTotalGrowth(balance - totalContributed)
    setRealFutureValue(
      includeInflation
        ? balance / Math.pow(1 + inflationRate / 100, timeHorizon)
        : balance
    )
    setYearlyBreakdown(breakdown)

  }, [
    initialInvestment,
    monthlyContribution,
    contributionGrowth,
    enableContributionGrowth,
    annualReturn,
    timeHorizon,
    compoundingFrequency,
    inflationRate,
    includeInflation,
    managementFee
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

  // Investment breakdown chart
  const pieChartData = {
    labels: ['Total Contributions', 'Investment Growth'],
    datasets: [{
      data: [totalContributions, totalGrowth],
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
          return ((value / futureValue) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Growth over time chart
  const generateGrowthChart = () => {
    return {
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

  // Scenario comparison chart
  const generateScenarioChart = () => {
    const scenarios = [
      { return: annualReturn - 2, label: 'Conservative' },
      { return: annualReturn, label: 'Expected' },
      { return: annualReturn + 2, label: 'Optimistic' }
    ]

    const calculateScenario = (returnRate: number) => {
      const effectiveRate = (returnRate - managementFee) / 100 / 12
      let balance = initialInvestment
      let contribution = monthlyContribution

      for (let month = 1; month <= timeHorizon * 12; month++) {
        balance += contribution
        balance *= (1 + effectiveRate)
        
        if (enableContributionGrowth && month % 12 === 0) {
          contribution *= (1 + contributionGrowth / 100)
        }
      }

      return balance
    }

    return {
      labels: scenarios.map(s => s.label),
      datasets: [{
        label: 'Future Value',
        data: scenarios.map(s => calculateScenario(s.return)),
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
        formatter: (value: number) => '$' + value.toLocaleString()
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
    pdf.save('investment-analysis.pdf')
  }

  const exportBlogPDF = async () => {
    const element = document.getElementById('blog-section')
    if (!element) return
    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    })
    const imgWidth = 595
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= 842

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 842
    }

    pdf.save('investment-guide.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <InvestmentSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Investment <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Plan your investment strategy and see how your money can grow over time with different scenarios and contribution strategies.
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
                    <CardTitle>Enter Investment Details</CardTitle>
                    <CardDescription>
                      Provide information about your investment strategy and goals to calculate potential returns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Initial Investment & Contributions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Initial Investment & Contributions</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="initial-investment">Initial Investment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="initial-investment"
                              type="number"
                              className="pl-9"
                              value={initialInvestment || ''} onChange={(e) => setInitialInvestment(e.target.value === '' ? 0 : Number(e.target.value))}
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

                    {/* Returns & Time Horizon */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Returns & Time Horizon</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="annual-return">Expected Annual Return</Label>
                            <span className="text-sm text-muted-foreground">{annualReturn}%</span>
                          </div>
                          <Slider
                            id="annual-return"
                            min={1}
                            max={15}
                            step={0.1}
                            value={[annualReturn]}
                            onValueChange={(value) => setAnnualReturn(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time-horizon">Investment Time Horizon</Label>
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
                        <div className="space-y-2">
                          <Label htmlFor="compounding-frequency">Compounding Frequency</Label>
                          <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                            <SelectTrigger id="compounding-frequency">
                              <SelectValue placeholder="Select compounding frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="semiannually">Semi-Annually</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="risk-level">Risk Level</Label>
                          <Select value={riskLevel} onValueChange={setRiskLevel}>
                            <SelectTrigger id="risk-level">
                              <SelectValue placeholder="Select risk level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conservative">Conservative</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="aggressive">Aggressive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Risk & Inflation */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Risk & Inflation</h3>
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
                      </div>
                    </div>

                    {/* Fees & Taxes */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Fees & Taxes</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="management-fee">Management Fee</Label>
                            <span className="text-sm text-muted-foreground">{managementFee}%</span>
                          </div>
                          <Slider
                            id="management-fee"
                            min={0}
                            max={2}
                            step={0.05}
                            value={[managementFee]}
                            onValueChange={(value) => setManagementFee(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account-type">Account Type</Label>
                          <Select value={accountType} onValueChange={setAccountType}>
                            <SelectTrigger id="account-type">
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="taxable">Taxable Account</SelectItem>
                              <SelectItem value="traditional">Traditional IRA/401(k)</SelectItem>
                              <SelectItem value="roth">Roth IRA/401(k)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {accountType === 'taxable' && (
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
                          <h4 className="font-medium">Investment Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Contributions</span>
                              <span className="font-medium">{formatCurrency(totalContributions)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Investment Growth</span>
                              <span className="font-medium">{formatCurrency(totalGrowth)}</span>
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
                          Investment growth over {timeHorizon} years
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

                    {/* Investment Strategy Tips */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Investment Strategy Analysis</p>
                            <p className="text-sm text-muted-foreground">
                              {riskLevel === 'conservative' && (
                                "Your conservative approach prioritizes capital preservation. Consider increasing equity exposure if your time horizon is long."
                              )}
                              {riskLevel === 'moderate' && (
                                "Your balanced approach provides good growth potential while managing risk. Regular rebalancing is recommended."
                              )}
                              {riskLevel === 'aggressive' && (
                                "Your growth-focused strategy has higher return potential but also increased volatility. Ensure this aligns with your risk tolerance."
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Investment Tool</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Investment Calculator: Grow Your Wealth Strategically</h2>
        <p className="mt-3 text-muted-foreground text-lg">Project different investment scenarios and build a personalized strategy for your financial goals</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Investment Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-calculator" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is an Investment Calculator?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                An <strong>Investment Calculator</strong> is a powerful financial modeling tool that simulates how your investments might perform over time based on different variables, helping you make informed decisions about your investment strategy. Unlike basic savings calculators, investment calculators account for more complex factors that affect real-world investment performance.
              </p>
              <p className="mt-2">
                These calculators help you analyze key investment components:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Initial investment amounts and ongoing contributions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Expected returns across different asset classes</span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Investment volatility and market fluctuations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Investment fees, taxes, and inflation impact</span>
                </li>
              </ul>
              <p>
                By modeling these variables, investment calculators provide a realistic picture of potential outcomes, helping you adjust your investment approach to better align with your financial goals and risk tolerance.
              </p>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                  <CardTitle className="text-sm font-medium text-center">Risk vs. Return Comparison</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Line 
                      data={{
                        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                        datasets: [
                          {
                            label: 'Potential Return',
                            data: [4, 8, 12],
                            borderColor: 'rgba(59, 130, 246, 0.8)',
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          },
                          {
                            label: 'Volatility',
                            data: [2, 10, 20],
                            borderColor: 'rgba(239, 68, 68, 0.8)',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
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
                            title: {
                              display: true,
                              text: 'Percentage (%)'
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
          
          <h4 id="why-important" className="font-semibold text-xl mt-6">Why Strategic Investment Planning Matters</h4>
          <div className="mt-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Market Unpredictability</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Investment markets experience significant short-term volatility, making strategic long-term planning crucial for success</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Compound Growth Acceleration</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">A 2% difference in annual returns can lead to more than 50% difference in wealth over 30 years</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Inflation Protection</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Strategic investments are essential for maintaining purchasing power in the face of persistent inflation</p>
                </div>
              </div>
            </div>
          </div>
          
          <p>
            An investment calculator helps bridge the gap between today's financial decisions and tomorrow's outcomes, allowing you to visualize how different strategies might unfold over time. This foresight is invaluable for making adjustments early, optimizing your approach, and maintaining confidence in your investment plan even during market turbulence.
          </p>
        </CardContent>
      </Card>

      {/* Investment Fundamentals Section */}
      <div className="mb-12" id="investment-fundamentals">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Investment Fundamentals</h2>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="asset-classes" className="font-bold text-xl mb-4">Core Asset Classes & Their Characteristics</h3>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-blue-600" />
                  Stocks (Equities)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div>
                  <p className="text-sm mb-3">Ownership shares in public companies that offer growth potential and income through dividends.</p>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Historical Return:</span>
                      <span className="font-medium">8-10% annually</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Risk Level:</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">Medium to High</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Horizon:</span>
                      <span className="font-medium">5+ years</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  Bonds (Fixed Income)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div>
                  <p className="text-sm mb-3">Debt instruments that provide steady income through interest payments with principal returned at maturity.</p>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Historical Return:</span>
                      <span className="font-medium">3-5% annually</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Risk Level:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">Low to Medium</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Horizon:</span>
                      <span className="font-medium">1-10 years</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-purple-50 dark:bg-purple-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-5 w-5 text-purple-600" />
                  Alternative Investments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div>
                  <p className="text-sm mb-3">Assets beyond traditional stocks and bonds including real estate, commodities, and private equity.</p>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Historical Return:</span>
                      <span className="font-medium">Varies widely</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Risk Level:</span>
                      <span className="font-medium text-purple-600 dark:text-purple-400">Varies by asset</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Horizon:</span>
                      <span className="font-medium">Typically 5+ years</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3 id="investment-strategies" className="font-bold text-xl mt-8 mb-4">Common Investment Strategies</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                <div className="flex items-start gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Dollar-Cost Averaging</p>
                    <p className="text-blue-700 dark:text-blue-400">
                      Investing a fixed amount at regular intervals regardless of market conditions, reducing the impact of volatility and avoiding the pitfalls of market timing.
                    </p>
                    <p className="mt-2 text-blue-700 dark:text-blue-400">
                      <strong>Best for:</strong> Long-term investors who want to minimize risk and maintain consistent investment discipline.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg text-sm">
                <div className="flex items-start gap-3">
                  <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-300">Asset Allocation</p>
                    <p className="text-purple-700 dark:text-purple-400">
                      Dividing investments across different asset classes based on goals, time horizon, and risk tolerance to optimize returns while managing risk.
                    </p>
                    <p className="mt-2 text-purple-700 dark:text-purple-400">
                      <strong>Best for:</strong> Investors seeking a balanced approach that can be adjusted based on life stage and changing financial goals.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50/50 dark:bg-green-900/20 rounded-lg text-sm">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">Growth Investing</p>
                    <p className="text-green-700 dark:text-green-400">
                      Focusing on companies with above-average growth potential, often accepting higher valuations and volatility in pursuit of capital appreciation.
                    </p>
                    <p className="mt-2 text-green-700 dark:text-green-400">
                      <strong>Best for:</strong> Investors with longer time horizons who can tolerate market fluctuations for potentially higher returns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg text-sm">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">Value Investing</p>
                    <p className="text-amber-700 dark:text-amber-400">
                      Seeking companies trading below their intrinsic value, providing a "margin of safety" and potential for higher returns as the market recognizes true worth.
                    </p>
                    <p className="mt-2 text-amber-700 dark:text-amber-400">
                      <strong>Best for:</strong> Patient investors willing to research and hold investments through market cycles.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-cyan-50/50 dark:bg-cyan-900/20 rounded-lg text-sm">
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-cyan-800 dark:text-cyan-300">Index Investing</p>
                    <p className="text-cyan-700 dark:text-cyan-400">
                      Investing in funds that track market indices rather than trying to beat the market, typically offering lower costs and broad diversification.
                    </p>
                    <p className="mt-2 text-cyan-700 dark:text-cyan-400">
                      <strong>Best for:</strong> Investors seeking market returns with minimal costs and portfolio management complexity.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-red-50/50 dark:bg-red-900/20 rounded-lg text-sm">
                <div className="flex items-start gap-3">
                  <Percent className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-300">Dividend Investing</p>
                    <p className="text-red-700 dark:text-red-400">
                      Focusing on stocks that pay regular dividends, offering income and potential for total return through dividend growth and price appreciation.
                    </p>
                    <p className="mt-2 text-red-700 dark:text-red-400">
                      <strong>Best for:</strong> Income-oriented investors or those nearing retirement seeking cash flow from investments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>The Power of Diversification:</strong> Research consistently shows that a diversified portfolio—one that includes a mix of stocks, bonds, and other assets—can significantly reduce risk without dramatically sacrificing returns. Modern portfolio theory suggests that combining assets with different correlation patterns creates more efficient portfolios with better risk-adjusted returns.
            </p>
          </div>
        </div>
      </div>

      {/* Using the Calculator Section */}
      <div className="mb-12" id="calculator-guide">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Using the Investment Calculator</span>
              </div>
            </CardTitle>
            <CardDescription>
              How to model investment scenarios and build your strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="calculator-inputs" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Core Calculator Inputs
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Initial Investment & Contributions</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5" />
                        <span><strong>Starting amount:</strong> Your initial investment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <RefreshCw className="h-4 w-4 mt-0.5" />
                        <span><strong>Additional contributions:</strong> Periodic investments (monthly, quarterly, etc.)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 mt-0.5" />
                        <span><strong>Contribution growth rate:</strong> Optional annual increase in contribution amount</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Return & Time Parameters</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 mt-0.5" />
                        <span><strong>Expected annual return:</strong> Projected investment performance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart3 className="h-4 w-4 mt-0.5" />
                        <span><strong>Volatility/standard deviation:</strong> Expected fluctuation in returns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-0.5" />
                        <span><strong>Investment time horizon:</strong> Number of years for your investment</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Additional Factors</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Wallet className="h-4 w-4 mt-0.5" />
                        <span><strong>Investment fees:</strong> Annual management and expense ratios</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <span><strong>Inflation rate:</strong> For calculating real returns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5" />
                        <span><strong>Tax considerations:</strong> Income, dividend, and capital gains taxes</span>
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
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Key Projection Metrics</h4>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Final Investment Value</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            The projected total value of your investment at the end of your time horizon
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Total Return</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Percentage gain on your investment and total growth in dollar terms
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Real (Inflation-Adjusted) Value</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Your investment value expressed in today's purchasing power
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Investment Breakdown</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Proportion of final value from initial investment, contributions, and investment returns
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>Pro Tip:</strong> Focus on the range of potential outcomes, not just the average projected return. Investment returns are never linear, and understanding the potential volatility helps set realistic expectations and prepare for market fluctuations.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <h4 className="font-medium text-purple-800 dark:text-purple-300">Performance Visualizations</h4>
                    <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                      The calculator provides several visual representations of your investment:
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                      <li className="flex items-start gap-2">
                        <LineChart className="h-4 w-4 mt-0.5" />
                        <span><strong>Growth trajectory</strong> over your investment timeline</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <PieChart className="h-4 w-4 mt-0.5" />
                        <span><strong>Investment composition</strong> showing principal, contributions, and returns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart3 className="h-4 w-4 mt-0.5" />
                        <span><strong>Potential outcome ranges</strong> based on historical volatility</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Investment Scenarios: Compare and Analyze
            </h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="bg-orange-50 dark:bg-orange-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-orange-600" />
                    Conservative Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Asset Mix:</span>
                      <span className="font-medium">30% Stocks, 60% Bonds, 10% Cash</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Expected Return:</span>
                      <span className="font-medium">4-5% annually</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Volatility:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">Low</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Initial $100,000:</span>
                      <span className="font-medium">$148,000 after 10 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Best For:</span>
                      <span className="font-medium">Near-term goals, retirees</span>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Lower risk but may not keep pace with inflation long-term
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    Balanced Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Asset Mix:</span>
                      <span className="font-medium">60% Stocks, 35% Bonds, 5% Cash</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Expected Return:</span>
                      <span className="font-medium">6-7% annually</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Volatility:</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">Medium</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Initial $100,000:</span>
                      <span className="font-medium">$184,000 after 10 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Best For:</span>
                      <span className="font-medium">Mid-term goals, most investors</span>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Classic approach balancing growth potential with stability
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-green-600" />
                    Growth Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Asset Mix:</span>
                      <span className="font-medium">85% Stocks, 15% Bonds</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Expected Return:</span>
                      <span className="font-medium">8-10% annually</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Volatility:</span>
                      <span className="font-medium text-red-600 dark:text-red-400">High</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Initial $100,000:</span>
                      <span className="font-medium">$232,000 after 10 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Best For:</span>
                      <span className="font-medium">Long-term goals, younger investors</span>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Higher potential returns with significant short-term fluctuations
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Portfolio Diversification Impact</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    The scenarios above demonstrate how different asset allocations affect both potential returns and risk levels. While the growth portfolio offers the highest potential return, it comes with significantly greater volatility that may test your commitment during market downturns. The calculator helps you quantify these trade-offs to find the right balance for your situation.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Investment Concepts Section */}
      <div className="mb-12" id="advanced-concepts">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-blue-600" />
          Advanced Investment Concepts
        </h2>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">The Impact of Fees</h3>
                
                <div className="space-y-4">
                  <p>
                    Investment fees might seem small, but they compound just like returns, creating a significant drag on long-term performance. Even a 1% difference in annual fees can reduce your final portfolio value by 20% or more over 30 years.
                  </p>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <DollarSign className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Common Investment Fees</h4>
                      <ul className="mt-1 text-sm space-y-1 text-blue-700 dark:text-blue-400">
                        <li>Expense ratios (0.03% - 1.5%): Annual cost of fund management</li>
                        <li>Advisory fees (0.5% - 1.5%): For professional management</li>
                        <li>Transaction costs: For buying and selling securities</li>
                        <li>Load fees: Sales charges on some mutual funds</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="h-[200px]">
                    <Bar 
                      data={{
                        labels: ['0.1% Fee', '0.5% Fee', '1.0% Fee', '1.5% Fee', '2.0% Fee'],
                        datasets: [{
                          label: '$100K Investment After 30 Years (7% Return)',
                          data: [743857, 644884, 561722, 489073, 424947],
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(59, 130, 246, 0.65)',
                            'rgba(59, 130, 246, 0.6)',
                            'rgba(59, 130, 246, 0.55)',
                            'rgba(59, 130, 246, 0.5)'
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
                            beginAtZero: false,
                            ticks: { callback: value => '$' + Number(value).toLocaleString() }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Risk-Adjusted Returns</h3>
                
                <div className="space-y-4">
                  <p>
                    When evaluating investments, looking at returns alone isn't sufficient. Risk-adjusted metrics help determine if higher returns truly compensate for added risk, or if you could achieve better results with less volatility.
                  </p>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                      <BarChart3 className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-800 dark:text-purple-300">Key Risk Metrics</h4>
                      <ul className="mt-1 text-sm space-y-1 text-purple-700 dark:text-purple-400">
                        <li><strong>Sharpe Ratio:</strong> Return earned above risk-free rate per unit of risk</li>
                        <li><strong>Standard Deviation:</strong> Measure of investment volatility</li>
                        <li><strong>Beta:</strong> Investment's sensitivity to market movements</li>
                        <li><strong>Maximum Drawdown:</strong> Largest peak-to-trough decline</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">The Volatility Penalty</h4>
                    <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                      A little-understood aspect of investing is that volatility directly reduces compound returns. Two investments with identical average returns but different volatility levels will have different compound returns—with the more volatile investment underperforming.
                    </p>
                    <div className="mt-2 text-xs text-green-600 dark:text-green-500">
                      <strong>Example:</strong> An investment alternating between +30% and -10% years has an arithmetic average of 10%, but compounds at just 8.2% due to volatility drag.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Tax-Efficient Investing</h3>
                
                <p>
                  Strategic tax planning can significantly boost your after-tax returns. Different investment accounts and asset types have varying tax implications that can be optimized based on your situation.
                </p>
                
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-50 dark:bg-blue-900/30">
                        <th className="border border-blue-200 dark:border-blue-800 px-3 py-2 text-left">Account Type</th>
                        <th className="border border-blue-200 dark:border-blue-800 px-3 py-2 text-left">Tax Treatment</th>
                        <th className="border border-blue-200 dark:border-blue-800 px-3 py-2 text-left">Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">Traditional IRA/401(k)</td>
                        <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">Tax-deferred growth, taxable withdrawals</td>
                        <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">High-yield investments, bonds</td>
                      </tr>
                      <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                        <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">Roth IRA/401(k)</td>
                        <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">After-tax contributions, tax-free growth and withdrawals</td>
                        <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">High-growth assets, dividend stocks</td>
                      </tr>
                      <tr>
                        <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">Taxable Brokerage</td>
                        <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">Taxable dividends and capital gains</td>
                        <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">Tax-efficient ETFs, municipal bonds</td>
                      </tr>
                      <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                        <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">HSA</td>
                        <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">Triple tax advantage: tax-deductible, tax-free growth, tax-free withdrawals for healthcare</td>
                        <td className="border border-blue-200 dark:border-blue-800 px-3 py-2">Long-term growth investments</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Rebalancing Strategy</h3>
                
                <p>
                  Regular portfolio rebalancing maintains your target asset allocation, manages risk, and can potentially enhance returns by systematically selling high and buying low.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-100 dark:border-cyan-800">
                    <div className="flex items-start gap-2">
                      <RefreshCw className="h-4 w-4 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-cyan-800 dark:text-cyan-300">Time-Based Rebalancing</p>
                        <p className="text-sm text-cyan-700 dark:text-cyan-400">
                          Adjusting your portfolio at set intervals (quarterly, annually) regardless of market movements. Provides discipline but might miss opportunities during volatile periods.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-100 dark:border-cyan-800">
                    <div className="flex items-start gap-2">
                      <Percent className="h-4 w-4 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-cyan-800 dark:text-cyan-300">Threshold Rebalancing</p>
                        <p className="text-sm text-cyan-700 dark:text-cyan-400">
                          Rebalancing when asset allocation drifts beyond predetermined thresholds (e.g., ±5% from targets). More responsive to market changes but requires closer monitoring.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-100 dark:border-cyan-800">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-cyan-800 dark:text-cyan-300">Tax-Aware Rebalancing</p>
                        <p className="text-sm text-cyan-700 dark:text-cyan-400">
                          Using new contributions, withdrawals, and tax-advantaged accounts strategically for rebalancing to minimize tax consequences.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Monte Carlo Simulations:</strong> Advanced investment calculators use Monte Carlo analysis to run thousands of potential market scenarios rather than relying on average returns. This provides a probability range of outcomes, helping you understand the likelihood of reaching your financial goals under different conditions. When available, these simulations offer a more realistic view of potential investment outcomes than linear projections.
                </p>
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
              <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Building Your Investment Strategy
            </CardTitle>
            <CardDescription>
              Applying calculator insights to make informed investment decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              An <strong>Investment Calculator</strong> is more than just a forecasting tool—it's a decision-making framework that helps you understand the relationship between risk, return, time horizon, and contribution strategies. By experimenting with different scenarios, you can develop a deeper understanding of which variables have the greatest impact on your financial outcomes.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              As you develop your investment approach, keep these principles in mind:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Strategic Foundations</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Match your investment strategy to your specific time horizon and goals</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Diversification across and within asset classes reduces risk while maintaining returns</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Time in the market consistently outperforms timing the market</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Practical Application</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Control what you can: contribution amounts, fees, tax efficiency, and asset allocation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Regularly review and adjust your strategy as your financial situation evolves</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Consider working with a financial professional for complex situations</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to build your investment roadmap?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Investment Calculator</strong> above to model different scenarios and develop your strategy. For more financial planning tools, explore our related calculators:
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

        {/* Related Calculators */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Related Calculators</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Compound Interest Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    See how your money grows through the power of compound interest over time.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/compound-interest">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">401(k) Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Plan your retirement savings with employer matching contributions.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/401k">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">ROI Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate the return on investment for various financial decisions.
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