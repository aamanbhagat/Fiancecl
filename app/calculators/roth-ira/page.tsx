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
import RothIraSchema from './schema';

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

export default function RothIRACalculator() {
  // Personal Details
  const [currentAge, setCurrentAge] = useState<number>(30)
  const [retirementAge, setRetirementAge] = useState<number>(65)
  const [currentBalance, setCurrentBalance] = useState<number>(10000)
  const [annualContribution, setAnnualContribution] = useState<number>(6000)
  const [catchUpContributions, setCatchUpContributions] = useState<boolean>(true)
  
  // Investment Assumptions
  const [returnRate, setReturnRate] = useState<number>(7)
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("annually")
  const [contributionIncrease, setContributionIncrease] = useState<number>(2)
  const [inflationRate, setInflationRate] = useState<number>(2.5)
  const [managementFees, setManagementFees] = useState<number>(0.25)
  
  // Results State
  const [futureBalance, setFutureBalance] = useState<number>(0)
  const [totalContributions, setTotalContributions] = useState<number>(0)
  const [investmentGrowth, setInvestmentGrowth] = useState<number>(0)
  const [inflationAdjustedBalance, setInflationAdjustedBalance] = useState<number>(0)
  const [yearlyProjections, setYearlyProjections] = useState<{
    year: number;
    age: number;
    contributions: number;
    balance: number;
    growth: number;
  }[]>([])

  // Calculate Roth IRA projections
  useEffect(() => {
    const years = retirementAge - currentAge
    const compoundingPeriods = {
      annually: 1,
      semiannually: 2,
      quarterly: 4,
      monthly: 12
    }
    const periodsPerYear = compoundingPeriods[compoundingFrequency as keyof typeof compoundingPeriods]
    const effectiveRate = (returnRate - managementFees) / 100
    const periodRate = effectiveRate / periodsPerYear
    
    let projections = []
    let balance = currentBalance
    let totalContrib = 0
    let yearlyContribution = annualContribution
    
    for (let year = 0; year <= years; year++) {
      const age = currentAge + year
      const isCatchUpEligible = catchUpContributions && age >= 50
      const catchUpAmount = isCatchUpEligible ? 1000 : 0
      const yearContribution = Math.min(yearlyContribution + catchUpAmount, 7000)
      
      // Compound interest calculation
      for (let period = 0; period < periodsPerYear; period++) {
        balance = balance * (1 + periodRate) + (yearContribution / periodsPerYear)
      }
      
      totalContrib += yearContribution
      const growth = balance - totalContrib - currentBalance
      
      projections.push({
        year,
        age,
        contributions: totalContrib,
        balance,
        growth
      })
      
      // Increase contribution for next year
      yearlyContribution *= (1 + contributionIncrease / 100)
    }
    
    // Calculate inflation-adjusted balance
    const inflationFactor = Math.pow(1 + inflationRate / 100, -years)
    const realBalance = balance * inflationFactor
    
    setYearlyProjections(projections)
    setFutureBalance(balance)
    setTotalContributions(totalContrib)
    setInvestmentGrowth(balance - totalContrib - currentBalance)
    setInflationAdjustedBalance(realBalance)
    
  }, [
    currentAge,
    retirementAge,
    currentBalance,
    annualContribution,
    catchUpContributions,
    returnRate,
    compoundingFrequency,
    contributionIncrease,
    inflationRate,
    managementFees
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

  // Balance composition chart
  const pieChartData = {
    labels: ['Initial Balance', 'Total Contributions', 'Investment Growth'],
    datasets: [{
      data: [currentBalance, totalContributions, investmentGrowth],
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
          return ((value / futureBalance) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Growth over time chart
  const generateGrowthChart = () => {
    return {
      labels: yearlyProjections.map(p => `Age ${p.age}`),
      datasets: [
        {
          label: 'Account Balance',
          data: yearlyProjections.map(p => p.balance),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Total Contributions',
          data: yearlyProjections.map(p => p.contributions + currentBalance),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4
        },
        {
          label: 'Investment Growth',
          data: yearlyProjections.map(p => p.growth),
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

  // Annual contributions chart
  const contributionsChartData = {
    labels: yearlyProjections.map(p => `Age ${p.age}`),
    datasets: [
      {
        label: 'Annual Contribution',
        data: yearlyProjections.map((_, i) => {
          const age = currentAge + i
          const baseContribution = annualContribution * Math.pow(1 + contributionIncrease / 100, i)
          const catchUpAmount = catchUpContributions && age >= 50 ? 1000 : 0
          return Math.min(baseContribution + catchUpAmount, 7000)
        }),
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
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
    pdf.save('roth-ira-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <RothIraSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Roth IRA <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Plan your tax-free retirement savings with our Roth IRA calculator. Estimate your future account balance and see the power of compound growth.
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
                    <CardTitle>Enter Your Information</CardTitle>
                    <CardDescription>
                      Provide your current situation and investment preferences to calculate your potential Roth IRA growth.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Personal Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Personal Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="current-age">Current Age</Label>
                          <Input
                            id="current-age"
                            type="number"
                            value={currentAge || ''} onChange={(e) => setCurrentAge(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retirement-age">Retirement Age</Label>
                          <Input
                            id="retirement-age"
                            type="number"
                            value={retirementAge || ''} onChange={(e) => setRetirementAge(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="current-balance">Current Roth IRA Balance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="current-balance"
                              type="number"
                              className="pl-9"
                              value={currentBalance || ''} onChange={(e) => setCurrentBalance(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="annual-contribution">Annual Contribution</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="annual-contribution"
                              type="number"
                              className="pl-9"
                              value={annualContribution || ''} onChange={(e) => setAnnualContribution(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="catch-up">Include Catch-Up Contributions (Age 50+)</Label>
                            <Switch
                              id="catch-up"
                              checked={catchUpContributions}
                              onCheckedChange={setCatchUpContributions}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Investment Assumptions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Investment Assumptions</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="return-rate">Expected Annual Return</Label>
                            <span className="text-sm text-muted-foreground">{returnRate}%</span>
                          </div>
                          <Slider
                            id="return-rate"
                            min={1}
                            max={12}
                            step={0.1}
                            value={[returnRate]}
                            onValueChange={(value) => setReturnRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compounding-frequency">Compounding Frequency</Label>
                          <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                            <SelectTrigger id="compounding-frequency">
                              <SelectValue placeholder="Select compounding frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="annually">Annually</SelectItem>
                              <SelectItem value="semiannually">Semi-Annually</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="contribution-increase">Annual Contribution Increase</Label>
                            <span className="text-sm text-muted-foreground">{contributionIncrease}%</span>
                          </div>
                          <Slider
                            id="contribution-increase"
                            min={0}
                            max={10}
                            step={0.5}
                            value={[contributionIncrease]}
                            onValueChange={(value) => setContributionIncrease(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="inflation-rate">Inflation Rate</Label>
                            <span className="text-sm text-muted-foreground">{inflationRate}%</span>
                          </div>
                          <Slider
                            id="inflation-rate"
                            min={0}
                            max={8}
                            step={0.1}
                            value={[inflationRate]}
                            onValueChange={(value) => setInflationRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="management-fees">Management Fees</Label>
                            <span className="text-sm text-muted-foreground">{managementFees}%</span>
                          </div>
                          <Slider
                            id="management-fees"
                            min={0}
                            max={2}
                            step={0.05}
                            value={[managementFees]}
                            onValueChange={(value) => setManagementFees(value[0])}
                          />
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
                      <p className="text-sm text-muted-foreground">Projected Balance at Retirement</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(futureBalance)}</p>
                      <p className="text-sm text-muted-foreground">
                        In today's dollars: {formatCurrency(inflationAdjustedBalance)}
                      </p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="growth">Growth</TabsTrigger>
                        <TabsTrigger value="contributions">Contributions</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Account Composition</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Initial Balance</span>
                              <span className="font-medium">{formatCurrency(currentBalance)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Contributions</span>
                              <span className="font-medium">{formatCurrency(totalContributions)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Investment Growth</span>
                              <span className="font-medium">{formatCurrency(investmentGrowth)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Balance</span>
                              <span>{formatCurrency(futureBalance)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="growth" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateGrowthChart()} options={lineChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Account balance growth over time
                        </div>
                      </TabsContent>

                      <TabsContent value="contributions" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={contributionsChartData} options={barChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Annual contribution amounts including catch-up contributions
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Key Insights */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Key Insights</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Investment period: {retirementAge - currentAge} years</li>
                              <li>• Tax-free growth: {formatCurrency(investmentGrowth)}</li>
                              <li>• Effective annual return: {(returnRate - managementFees).toFixed(2)}%</li>
                              {catchUpContributions && currentAge < 50 && (
                                <li>• Catch-up contributions will begin at age 50</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                  
                  <SaveCalculationButton
                    calculatorType="roth-ira"
                    inputs={{
                      currentAge,
                      retirementAge,
                      currentBalance,
                      annualContribution,
                      returnRate,
                      inflationRate
                    }}
                    results={{
                      futureBalance,
                      totalContributions,
                      investmentGrowth,
                      inflationAdjustedBalance
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Retirement Planning</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Roth IRA Calculator: Plan Your Tax-Free Future</h2>
        <p className="mt-3 text-muted-foreground text-lg">Maximize your retirement with strategic tax-advantaged investing</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Roth IRAs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-roth-ira" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is a Roth IRA?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                A <strong>Roth IRA</strong> (Individual Retirement Account) offers a powerful tax advantage that sets it apart from most retirement accounts: contributions are made with after-tax dollars, but qualified withdrawals in retirement are completely <em>tax-free</em>, including all your investment gains.
              </p>
              <p className="mt-2">
                This distinctive structure makes Roth IRAs particularly valuable for those who expect to be in the same or higher tax bracket in retirement, or who want tax diversification among their retirement assets.
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Tax-free growth on all investment earnings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Completely tax-free withdrawals in retirement</span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>No required minimum distributions (RMDs) during the owner's lifetime</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Access to contributions at any time without penalties</span>
                </li>
              </ul>
              <p>
                Unlike traditional retirement accounts that offer tax breaks today but tax your withdrawals later, Roth IRAs reverse this formula—creating a powerful tool for building long-term wealth that remains completely free from future tax liability.
              </p>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                  <CardTitle className="text-sm font-medium text-center">Roth vs. Traditional IRA: $500 Monthly Investment</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Bar 
                      data={{
                        labels: ['After 30 Years', 'After Taxes'],
                        datasets: [
                          {
                            label: 'Roth IRA',
                            data: [591374, 591374],
                            backgroundColor: 'rgba(16, 185, 129, 0.8)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 1,
                            barPercentage: 0.6,
                            categoryPercentage: 0.8,
                          },
                          {
                            label: 'Traditional IRA',
                            data: [591374, 443531],
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 1,
                            barPercentage: 0.6,
                            categoryPercentage: 0.8,
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
                              callback: value => '$' + Number(value).toLocaleString(undefined, {maximumFractionDigits: 0})
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, padding: 10 }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
                <div className="px-4 pb-3 text-xs text-center text-muted-foreground">
                  Assuming 7% annual returns and 25% tax rate on Traditional IRA withdrawals
                </div>
              </Card>
            </div>
          </div>
          
          <h4 id="key-differences" className="font-semibold text-xl mt-6">Key Differences Between Roth and Traditional IRAs</h4>
          <div className="mt-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-200 dark:border-blue-800">
                    <th className="text-left py-2 px-4">Feature</th>
                    <th className="text-left py-2 px-4">Roth IRA</th>
                    <th className="text-left py-2 px-4">Traditional IRA</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-blue-100 dark:border-blue-800">
                    <td className="py-2 px-4 font-medium">Tax Benefits</td>
                    <td className="py-2 px-4">Tax-free withdrawals in retirement</td>
                    <td className="py-2 px-4">Tax-deductible contributions now</td>
                  </tr>
                  <tr className="border-b border-blue-100 dark:border-blue-800">
                    <td className="py-2 px-4 font-medium">Contributions</td>
                    <td className="py-2 px-4">After-tax dollars</td>
                    <td className="py-2 px-4">Pre-tax dollars</td>
                  </tr>
                  <tr className="border-b border-blue-100 dark:border-blue-800">
                    <td className="py-2 px-4 font-medium">RMDs</td>
                    <td className="py-2 px-4">None during owner's lifetime</td>
                    <td className="py-2 px-4">Required at age 73</td>
                  </tr>
                  <tr className="border-b border-blue-100 dark:border-blue-800">
                    <td className="py-2 px-4 font-medium">Early Access</td>
                    <td className="py-2 px-4">Contributions accessible anytime</td>
                    <td className="py-2 px-4">10% penalty plus taxes on early withdrawals</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Income Limits</td>
                    <td className="py-2 px-4">Yes, phases out at higher incomes</td>
                    <td className="py-2 px-4">No income limits for contributions</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <p>
            A <strong>Roth IRA calculator</strong> helps you project the long-term growth of your contributions while accounting for the unique tax advantages. By inputting your current age, planned retirement age, contribution amounts, and expected return rates, you can visualize how your tax-free nest egg could grow over time.
          </p>
        </CardContent>
      </Card>

      {/* How to Use Section */}
      <div className="mb-12" id="how-to-use">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Using the Roth IRA Calculator</h2>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="calculator-guide" className="font-bold text-xl mb-4">Step-by-Step Calculator Guide</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Input Parameters</h4>
              <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Current Age & Retirement Age</p>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Your investment horizon determines how long your contributions can benefit from compound growth
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Current Roth IRA Balance</p>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Include any existing Roth IRA savings that will continue growing alongside new contributions
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Annual Contributions</p>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Enter your planned yearly contribution amount (up to the annual limit, adjusted for future inflation)
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Expected Annual Return</p>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Project your potential investment performance based on your asset allocation
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Additional Options</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm">Adjust for inflation</span>
                    <span className="font-medium">Shows future value in today's dollars</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm">Include catch-up contributions</span>
                    <span className="font-medium">Extra $1,000 annually after age 50</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm">Compare with Traditional IRA</span>
                    <span className="font-medium">Side-by-side tax impact comparison</span>
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
                      Total Roth IRA Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>
                      The projected value of your Roth IRA at retirement, reflecting all contributions and compound growth over time. This entire amount will be available tax-free.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Percent className="h-4 w-4 text-blue-600" />
                      Tax Savings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>
                      The estimated taxes you'll avoid paying in retirement compared to a similar taxable investment account or a Traditional IRA with fully taxable withdrawals.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      Contribution Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>
                      A visualization showing your total contributions versus investment earnings, highlighting how much of your retirement wealth comes from compound growth.
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
                      <li>• Check current contribution limits, as they adjust periodically for inflation</li>
                      <li>• Verify your eligibility based on income thresholds (MAGI limits)</li>
                      <li>• Remember that investment returns will fluctuate year to year</li>
                      <li>• Consider your future tax bracket when comparing Roth vs. Traditional</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 id="example-calculation" className="font-bold text-xl mt-8 mb-4">Sample Roth IRA Growth Calculation</h3>
        
        <div className="mb-6">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Parameter</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Current Age</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">30 years</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Retirement Age</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">65 years</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Current Roth Balance</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">$15,000</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Annual Contribution</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">$6,000 (with annual increases)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Expected Annual Return</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">7% (before inflation)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Inflation Rate</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">2.5%</td>
              </tr>
              <tr className="bg-blue-50 dark:bg-blue-900/20">
                <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">Projected Roth IRA Balance at Retirement</td>
                <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">$1,025,417</td>
              </tr>
              <tr className="bg-blue-50 dark:bg-blue-900/20">
                <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">Total Contributions</td>
                <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">$287,000</td>
              </tr>
              <tr className="bg-blue-50 dark:bg-blue-900/20">
                <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">Total Investment Growth</td>
                <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">$738,417</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Pro Tip:</strong> Run scenarios with different contribution amounts to see the impact over time. Even modest increases can dramatically affect your final balance. For example, increasing your annual contribution by just $1,200 ($100/month) in the scenario above would add over $205,000 to your retirement balance.
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
                <span className="text-2xl">Roth IRA Growth Factors</span>
              </div>
            </CardTitle>
            <CardDescription>
              Understanding these elements will help you maximize your tax-free retirement savings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="time-effect" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                The Advantage of Starting Early
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    <strong>Time is the most powerful factor</strong> in building wealth through a Roth IRA. The longer your money compounds tax-free, the more dramatic the growth becomes in the later years of your investment horizon.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span>Early contributions have more time to compound and grow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span>Growth typically accelerates exponentially in later years</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span>Delaying contributions significantly reduces final balance</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      <strong>Example:</strong> $6,000 annual contribution, 7% return
                    </p>
                    <ul className="text-sm mt-1 text-purple-700 dark:text-purple-400">
                      <li>Starting at age 25: $1,200,000 by age 65</li>
                      <li>Starting at age 35: $566,000 by age 65</li>
                      <li>Starting at age 45: $246,000 by age 65</li>
                    </ul>
                    <p className="text-xs mt-2 text-purple-600 dark:text-purple-500">Waiting just 10 years cuts your final balance by more than <strong>half!</strong></p>
                  </div>
                </div>
                
                <div className="h-[220px]">
                  <h4 className="text-center text-sm font-medium mb-2">Growth by Starting Age</h4>
                  <Line 
                    data={{
                      labels: ['Age 25', 'Age 35', 'Age 45', 'Age 55', 'Age 65'],
                      datasets: [
                        {
                          label: 'Start at 25',
                          data: [6000, 89828, 296378, 708438, 1197811],
                          borderColor: 'rgba(124, 58, 237, 0.8)',
                          backgroundColor: 'rgba(124, 58, 237, 0.1)',
                          tension: 0.3
                        },
                        {
                          label: 'Start at 35',
                          data: [0, 6000, 89828, 296378, 566416],
                          borderColor: 'rgba(79, 70, 229, 0.8)',
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                          tension: 0.3
                        },
                        {
                          label: 'Start at 45',
                          data: [0, 0, 6000, 89828, 246075],
                          borderColor: 'rgba(59, 130, 246, 0.8)', 
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.3
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          ticks: { callback: value => '$' + Number(value).toLocaleString() }
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
                <h3 id="contribution-consistency" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Contribution Consistency
                </h3>
                <p>
                  Regular contributions, maximized whenever possible, significantly improve your long-term outcomes. The Roth IRA calculator helps you see the value of systematic saving and contribution increases over time.
                </p>
                
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Contribution Strategy</th>
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Final Balance</th>
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Advantage</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Consistent Maximum</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$566,416</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Baseline</td>
                      </tr>
                      <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Skip 5 Years</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$441,650</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">-$124,766</td>
                      </tr>
                      <tr>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Half Maximum</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$283,208</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">-$283,208</td>
                      </tr>
                      <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">With Catch-Up (50+)</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$604,835</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">+$38,419</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Based on $6,000 annual contributions for 30 years with 7% returns</p>
              </div>
              
              <div>
                <h3 id="investment-returns" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Investment Returns Impact
                </h3>
                <p>
                  Your asset allocation and investment choices significantly influence your long-term results. The tax-free nature of Roth IRAs makes them particularly valuable for higher-growth investments.
                </p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">Returns Make a Massive Difference</h4>
                  <div className="mt-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="font-medium text-blue-700 dark:text-blue-400">4% Annual Return:</div>
                      <div className="font-medium text-blue-700 dark:text-blue-400">$336,510</div>
                      <div className="text-blue-600 dark:text-blue-500">6% Annual Return:</div>
                      <div className="text-blue-600 dark:text-blue-500">$503,387</div>
                      <div className="text-blue-600 dark:text-blue-500">8% Annual Return:</div>
                      <div className="text-blue-600 dark:text-blue-500">$764,685</div>
                      <div className="text-blue-600 dark:text-blue-500">10% Annual Return:</div>
                      <div className="text-blue-600 dark:text-blue-500">$1,181,121</div>
                    </div>
                    <p className="mt-3 text-xs text-blue-700 dark:text-blue-400">*Based on $6,000 annual contributions for 30 years</p>
                  </div>
                </div>
                
                <h3 id="tax-benefits" className="text-xl font-bold text-green-700 dark:text-green-400 mt-6 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Tax Savings Comparison
                </h3>
                <p className="mb-4">
                  The unique tax advantages of Roth IRAs become more apparent as your investments grow. The calculator helps quantify these tax savings compared to taxable accounts or Traditional IRAs.
                </p>
                <div className="h-[170px]">
                  <Bar 
                    data={{
                      labels: ['10 Years', '20 Years', '30 Years', '40 Years'],
                      datasets: [{
                        label: 'Tax Savings',
                        data: [11624, 53265, 141601, 344628],
                        backgroundColor: [
                          'rgba(16, 185, 129, 0.7)',
                          'rgba(16, 185, 129, 0.75)',
                          'rgba(16, 185, 129, 0.85)',
                          'rgba(16, 185, 129, 0.95)'
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
                              return 'Tax Savings: $' + context.parsed.y.toLocaleString();
                            }
                          }
                        }
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
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Based on $6,000 annual contribution, 7% returns, and 25% tax rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roth IRA Insights Section with Statistics */}
      <div className="mb-12" id="roth-statistics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Roth IRA Trends and Insights
        </h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Contribution Limit</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">$7,000</p>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">Per year (2025); $8,000 age 50+</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                  <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">Average Annual Return</h3>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">10.2%</p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">Historical S&P 500 (1926-2025)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                  <RefreshCw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Roth IRA Ownership</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">27%</p>
                <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">Of U.S. households (2025)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Average Balance</h3>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">$43,275</p>
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">Median balance: $28,440</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 id="roth-strategies" className="text-xl font-bold mb-4">Advanced Roth IRA Strategies</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </span>
                <CardTitle className="text-base">Backdoor Roth IRA</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                For high-income earners above the contribution limits, this strategy involves making non-deductible Traditional IRA contributions and then converting them to a Roth IRA, effectively circumventing income restrictions.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </span>
                <CardTitle className="text-base">Mega Backdoor Roth</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                This advanced technique allows for contributing up to $46,500 (2025) annually to a Roth IRA through after-tax 401(k) contributions followed by in-plan conversions or rollovers to a Roth IRA.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40">
                  <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </span>
                <CardTitle className="text-base">Roth Conversion Ladder</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Early retirees can access retirement funds penalty-free by systematically converting Traditional IRA funds to Roth IRAs annually, then withdrawing contributions after the required five-year waiting period.
              </p>
            </CardContent>
          </Card>
        </div>

        <h3 id="eligibility-limits" className="text-xl font-bold mb-4">2025 Roth IRA Income Eligibility Limits</h3>
        <Card className="bg-white dark:bg-gray-900 mb-4">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p>
                  <strong>Roth IRA contributions</strong> are subject to income limitations. As your income approaches these thresholds, your maximum allowable contribution begins to phase out until it reaches zero.
                </p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">2025 Income Phase-Out Ranges</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-400">Single Filers</span>
                      <span className="font-medium text-blue-700 dark:text-blue-400">$146,000 - $161,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-400">Married Filing Jointly</span>
                      <span className="font-medium text-blue-700 dark:text-blue-400">$230,000 - $240,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-400">Married Filing Separately</span>
                      <span className="font-medium text-blue-700 dark:text-blue-400">$0 - $10,000</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="h-[280px]">
                <h4 className="text-center text-sm font-medium mb-3">Roth IRA Contribution Phaseout</h4>
                <Line 
                  data={{
                    labels: ['$140k', '$145k', '$150k', '$155k', '$160k', '$165k'],
                    datasets: [
                      {
                        label: 'Maximum Contribution (Single Filer)',
                        data: [7000, 7000, 5250, 3500, 1750, 0],
                        borderColor: 'rgba(59, 130, 246, 0.8)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                        max: 8000,
                        ticks: { 
                          callback: value => '$' + Number(value).toLocaleString()
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Modified Adjusted Gross Income (MAGI)'
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
              <p className="font-medium text-amber-800 dark:text-amber-300">Roth vs. Traditional: When to Choose</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                Generally, choose a Roth IRA if you expect to be in the same or higher tax bracket in retirement, or if you're early in your career with significant growth potential. Traditional IRAs may be more advantageous if you're currently in a high tax bracket but expect lower income in retirement, or need the immediate tax deduction to enable higher contributions.
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
              Maximizing Your Roth IRA Strategy
            </CardTitle>
            <CardDescription>
              Building a tax-free retirement with strategic planning
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              The <strong>Roth IRA calculator</strong> demonstrates the remarkable potential of tax-free growth over time. By understanding the power of compound returns in a tax-sheltered environment, you can make informed decisions about how to structure your retirement savings for maximum long-term benefit.
            </p>
            
            <p className="mt-4" id="next-steps">
              Take these steps to optimize your Roth IRA strategy:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Getting Started</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                    <span className="text-blue-800 dark:text-blue-300">Start contributing as early as possible, even small amounts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                    <span className="text-blue-800 dark:text-blue-300">Automate monthly contributions to ensure consistency</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                    <span className="text-blue-800 dark:text-blue-300">Aim to maximize contributions whenever your budget allows</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Long-Term Optimization</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                    <span className="text-green-800 dark:text-green-300">Consider growth-oriented investments for your tax-free account</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                    <span className="text-green-800 dark:text-green-300">Explore backdoor Roth options if your income exceeds limits</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                    <span className="text-green-800 dark:text-green-300">Regularly reassess your retirement strategy as circumstances change</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to plan your tax-free future?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Roth IRA Calculator</strong> above to visualize your potential tax-free growth! For more retirement planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <Clock className="h-4 w-4 mr-1" />
                        Retirement Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <DollarSign className="h-4 w-4 mr-1" />
                        401(k) Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/traditional-ira">
                        <Percent className="h-4 w-4 mr-1" />
                        Traditional IRA Calculator
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