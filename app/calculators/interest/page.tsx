"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { SaveCalculationButton } from '@/components/save-calculation-button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Calculator, Download, PieChart, LineChart, Info, AlertCircle, Percent, Calendar, ArrowRight, RefreshCw, TrendingUp, TrendingDown, Clock, BarChart3, Wallet } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import InterestSchema from './schema';

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

type CompoundingFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually'

interface InterestResults {
  totalInterest: number
  totalAmount: number
  effectiveRate: number
  simpleInterest: number
  compoundInterest: number
  timelineData: {
    dates: string[]
    balances: number[]
    interest: number[]
    principal: number[]
  }
}

export default function InterestCalculator() {
  // Basic Inputs
  const [principal, setPrincipal] = useState<number>(10000)
  const [interestRate, setInterestRate] = useState<number>(5)
  const [timePeriod, setTimePeriod] = useState<number>(5)
  const [timeUnit, setTimeUnit] = useState<'years' | 'months'>('years')
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>('annually')
  
  // Additional Features
  const [additionalContribution, setAdditionalContribution] = useState<number>(100)
  const [contributionFrequency, setContributionFrequency] = useState<'monthly' | 'quarterly' | 'annually'>('monthly')
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0)
  const [withdrawalFrequency, setWithdrawalFrequency] = useState<'monthly' | 'quarterly' | 'annually'>('monthly')
  const [includeInflation, setIncludeInflation] = useState<boolean>(false)
  const [inflationRate, setInflationRate] = useState<number>(2)
  const [includeTax, setIncludeTax] = useState<boolean>(false)
  const [taxRate, setTaxRate] = useState<number>(25)
  
  // Results
  const [results, setResults] = useState<InterestResults>({
    totalInterest: 0,
    totalAmount: 0,
    effectiveRate: 0,
    simpleInterest: 0,
    compoundInterest: 0,
    timelineData: {
      dates: [],
      balances: [],
      interest: [],
      principal: []
    }
  })

  // Compounding frequency mapping
  const compoundingFrequencyMap: Record<CompoundingFrequency, number> = {
    daily: 365,
    weekly: 52,
    monthly: 12,
    quarterly: 4,
    'semi-annually': 2,
    annually: 1
  }

  // Calculate interest and update results
  useEffect(() => {
    // Convert time period to years for calculations
    const yearsTotal = timeUnit === 'years' ? timePeriod : timePeriod / 12
    
    // Get number of compounding periods per year
    const periodsPerYear = compoundingFrequencyMap[compoundingFrequency]
    
    // Calculate total periods
    const totalPeriods = Math.floor(yearsTotal * periodsPerYear)
    
    // Initialize timeline data
    const dates: string[] = []
    const balances: number[] = []
    const interest: number[] = []
    const principalAmounts: number[] = []  // Renamed to avoid conflict with state variable
    
    let balance = principal
    let totalInterest = 0
    let currentPrincipal = principal
    
    // Calculate simple interest for comparison
    const simpleInterest = principal * (interestRate / 100) * yearsTotal
    
    // Generate timeline data
    for (let i = 0; i <= totalPeriods; i++) {
      const currentDate = new Date()
      currentDate.setDate(currentDate.getDate() + (i * (365 / periodsPerYear)))
      dates.push(currentDate.toLocaleDateString())
      
      // Add initial values for period 0
      if (i === 0) {
        balances.push(balance)
        interest.push(totalInterest)
        principalAmounts.push(currentPrincipal)
        continue
      }
      
      // Calculate periodic interest
      const periodicRate = interestRate / 100 / periodsPerYear
      const periodicInterest = balance * periodicRate
      
      // Add contributions
      if (contributionFrequency === 'monthly' && i % (periodsPerYear / 12) === 0) {
        balance += additionalContribution
        currentPrincipal += additionalContribution
      } else if (contributionFrequency === 'quarterly' && i % (periodsPerYear / 4) === 0) {
        balance += additionalContribution
        currentPrincipal += additionalContribution
      } else if (contributionFrequency === 'annually' && i % periodsPerYear === 0) {
        balance += additionalContribution
        currentPrincipal += additionalContribution
      }
      
      // Subtract withdrawals
      if (withdrawalFrequency === 'monthly' && i % (periodsPerYear / 12) === 0) {
        balance -= withdrawalAmount
      } else if (withdrawalFrequency === 'quarterly' && i % (periodsPerYear / 4) === 0) {
        balance -= withdrawalAmount
      } else if (withdrawalFrequency === 'annually' && i % periodsPerYear === 0) {
        balance -= withdrawalAmount
      }
      
      // Add interest to balance
      balance += periodicInterest
      totalInterest += periodicInterest
      
      // Adjust for inflation if enabled
      if (includeInflation) {
        const inflationAdjustment = balance * (inflationRate / 100 / periodsPerYear)
        balance -= inflationAdjustment
      }
      
      balances.push(balance)
      interest.push(totalInterest)
      principalAmounts.push(currentPrincipal)
    }
    
    // Calculate effective annual rate
    const effectiveRate = (Math.pow(1 + interestRate / 100 / periodsPerYear, periodsPerYear) - 1) * 100
    
    // Adjust for tax if enabled
    if (includeTax) {
      totalInterest *= (1 - taxRate / 100)
    }
    
    setResults({
      totalInterest,
      totalAmount: balance,
      effectiveRate,
      simpleInterest,
      compoundInterest: totalInterest,
      timelineData: {
        dates,
        balances,
        interest,
        principal: principalAmounts  // Use renamed array
      }
    })
    
  }, [
    principal,
    interestRate,
    timePeriod,
    timeUnit,
    compoundingFrequency,
    additionalContribution,
    contributionFrequency,
    withdrawalAmount,
    withdrawalFrequency,
    includeInflation,
    inflationRate,
    includeTax,
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

  // Growth projection chart
  const growthChartData = {
    labels: results.timelineData.dates.filter((_, i) => i % Math.floor(results.timelineData.dates.length / 12) === 0),
    datasets: [
      {
        label: 'Total Balance',
        data: results.timelineData.balances.filter((_, i) => i % Math.floor(results.timelineData.balances.length / 12) === 0),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      },
      {
        label: 'Principal',
        data: results.timelineData.principal.filter((_, i) => i % Math.floor(results.timelineData.principal.length / 12) === 0),
        borderColor: chartColors.primary[1],
        backgroundColor: chartColors.secondary[1],
        tension: 0.4
      },
      {
        label: 'Interest Earned',
        data: results.timelineData.interest.filter((_, i) => i % Math.floor(results.timelineData.interest.length / 12) === 0),
        borderColor: chartColors.primary[2],
        backgroundColor: chartColors.secondary[2],
        tension: 0.4
      }
    ]
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
      x: { 
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
      }
    }
  }

  // Interest comparison chart
  const comparisonChartData = {
    labels: ['Simple Interest', 'Compound Interest'],
    datasets: [
      {
        data: [results.simpleInterest, results.compoundInterest],
        backgroundColor: chartColors.primary.slice(0, 2),
        borderColor: chartColors.secondary.slice(0, 2).map(color => color.replace('0.2', '1')),
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

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100)
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
    pdf.save('interest-calculation-results.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <InterestSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Interest <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate interest earnings or payments with our comprehensive calculator. Compare simple and compound interest, account for inflation, and plan your financial future.
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
                    <CardTitle>Enter Interest Details</CardTitle>
                    <CardDescription>
                      Provide information about your investment or loan to calculate interest.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Basic Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="principal">Principal Amount</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="principal"
                              type="number"
                              className="pl-9"
                              value={principal || ''} onChange={(e) => setPrincipal(e.target.value === '' ? 0 : Number(e.target.value))}
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
                            min={0}
                            max={20}
                            step={0.1}
                            value={[interestRate]}
                            onValueChange={(value) => setInterestRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time-period">Time Period</Label>
                          <div className="flex gap-2">
                            <Input
                              id="time-period"
                              type="number"
                              value={timePeriod || ''} onChange={(e) => setTimePeriod(e.target.value === '' ? 0 : Number(e.target.value))}
                              className="flex-1"
                            />
                            <Select value={timeUnit} onValueChange={(value) => setTimeUnit(value as 'years' | 'months')}>
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="years">Years</SelectItem>
                                <SelectItem value="months">Months</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compounding-frequency">Compounding Frequency</Label>
                          <Select 
                            value={compoundingFrequency} 
                            onValueChange={(value) => setCompoundingFrequency(value as CompoundingFrequency)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Additional Contributions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Contributions</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="contribution-amount">Regular Contribution</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="contribution-amount"
                              type="number"
                              className="pl-9"
                              value={additionalContribution || ''} onChange={(e) => setAdditionalContribution(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contribution-frequency">Contribution Frequency</Label>
                          <Select 
                            value={contributionFrequency} 
                            onValueChange={(value) => setContributionFrequency(value as 'monthly' | 'quarterly' | 'annually')}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="withdrawal-amount">Regular Withdrawal</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="withdrawal-amount"
                              type="number"
                              className="pl-9"
                              value={withdrawalAmount || ''} onChange={(e) => setWithdrawalAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="withdrawal-frequency">Withdrawal Frequency</Label>
                          <Select 
                            value={withdrawalFrequency} 
                            onValueChange={(value) => setWithdrawalFrequency(value as 'monthly' | 'quarterly' | 'annually')}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
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
                          <div className="flex items-center justify-between">
                            <Label htmlFor="inflation-toggle">Account for Inflation</Label>
                            <Switch
                              id="inflation-toggle"
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
                            <Label htmlFor="tax-toggle">Include Tax Impact</Label>
                            <Switch
                              id="tax-toggle"
                              checked={includeTax}
                              onCheckedChange={setIncludeTax}
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(results.totalInterest)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Final Balance</p>
                        <p className="text-2xl font-bold">{formatCurrency(results.totalAmount)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="growth" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="growth">Growth</TabsTrigger>
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>

                      <TabsContent value="growth" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={growthChartData} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Growth Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Initial Principal</span>
                              <span className="font-medium">{formatCurrency(principal)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Contributions</span>
                              <span className="font-medium">{formatCurrency(results.timelineData.principal[results.timelineData.principal.length - 1] - principal)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Interest Earned</span>
                              <span className="font-medium">{formatCurrency(results.totalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Final Balance</span>
                              <span>{formatCurrency(results.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={comparisonChartData} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Interest Comparison</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Simple Interest</span>
                              <span className="font-medium">{formatCurrency(results.simpleInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Compound Interest</span>
                              <span className="font-medium">{formatCurrency(results.compoundInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Difference</span>
                              <span className="font-medium">{formatCurrency(results.compoundInterest - results.simpleInterest)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="details" className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Detailed Analysis</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Effective Annual Rate</span>
                              <span className="font-medium">{formatPercent(results.effectiveRate)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Compounding Periods</span>
                              <span className="font-medium">{compoundingFrequencyMap[compoundingFrequency]} per year</span>
                            </div>
                            {includeInflation && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Inflation-Adjusted Return</span>
                                <span className="font-medium">{formatPercent(results.effectiveRate - inflationRate)}</span>
                              </div>
                            )}
                            {includeTax && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">After-Tax Interest</span>
                                <span className="font-medium">{formatCurrency(results.totalInterest)}</span>
                              </div>
                            )}
                          </div>
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
                              <li>• {formatPercent(results.effectiveRate)} effective annual return</li>
                              <li>• {formatCurrency(results.compoundInterest - results.simpleInterest)} benefit from compounding</li>
                              {includeInflation && (
                                <li>• {formatPercent(results.effectiveRate - inflationRate)} real return after inflation</li>
                              )}
                              {includeTax && (
                                <li>• {formatCurrency(results.totalInterest)} net interest after tax</li>
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
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Interest: Your Complete Guide</h2>
        <p className="mt-3 text-muted-foreground text-lg">The power of interest in savings, loans, and investment calculations</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Interest Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                An <strong>Interest Calculator</strong> is a fundamental financial tool that helps you compute how money grows or compounds over time, or how debt accumulates with interest charges. Whether you're exploring savings opportunities, investment returns, or loan costs, understanding interest calculations is essential for informed financial decisions.
              </p>
              <p className="mt-3">
                Interest calculators enable you to:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Project future value of savings and investments</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>Calculate the total cost of loans and credit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Compare different interest rates and compounding frequencies</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Understand how time affects wealth accumulation</span>
                </li>
              </ul>
              <p>
                Whether you're planning for retirement, saving for a major purchase, or evaluating debt repayment strategies, mastering interest calculations gives you a critical advantage in achieving your financial goals.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Simple vs. Compound Interest</h3>
                <div className="h-[200px]">
                  <Line 
                    data={{
                      labels: ['Year 0', 'Year 5', 'Year 10', 'Year 15', 'Year 20'],
                      datasets: [
                        {
                          label: 'Simple Interest',
                          data: [10000, 15000, 20000, 25000, 30000],
                          borderColor: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4
                        },
                        {
                          label: 'Compound Interest',
                          data: [10000, 16289, 26533, 43219, 70400],
                          borderColor: 'rgba(14, 165, 233, 0.8)',
                          backgroundColor: 'rgba(14, 165, 233, 0.1)',
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">$10,000 at 8% interest: Simple vs. Compound growth over 20 years</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> Albert Einstein reportedly called compound interest the "eighth wonder of the world," noting that "he who understands it, earns it; he who doesn't, pays it."
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Growth Projections</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Visualize how your money will grow with different interest scenarios
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Cost Analysis</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Understand the true cost of loans and debt over time
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <RefreshCw className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Compounding Effects</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    See how compounding frequency impacts your financial outcomes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Interest Basics Section */}
      <div className="mb-10" id="interest-basics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Percent className="h-6 w-6 text-blue-600" />
          Interest Fundamentals: What You Need to Know
        </h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="interest-types" className="font-bold text-xl mb-4">Types of Interest Calculations</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-blue-600" />
                  Simple Interest
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3">
                  Simple interest is calculated only on the initial principal amount, without accounting for accumulated interest.
                </p>
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Formula:</p>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded font-mono text-xs">
                    Interest = Principal × Rate × Time
                  </div>
                  <p className="mt-2">Example: $1,000 at 5% for 3 years = $1,000 × 0.05 × 3 = $150 interest</p>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p><strong>Common uses:</strong> Short-term loans, some bonds, and basic investment calculations</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Compound Interest
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3">
                  Compound interest calculates interest on both the initial principal and the accumulated interest over time.
                </p>
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Formula:</p>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded font-mono text-xs">
                    A = P(1 + r/n)^(nt)
                  </div>
                  <p className="mt-2">Where: A = Final amount, P = Principal, r = Rate, n = Compounding frequency, t = Time</p>
                  <p className="mt-2">Example: $1,000 at 5% compounded annually for 3 years = $1,157.63</p>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p><strong>Common uses:</strong> Savings accounts, investments, mortgages, and most consumer loans</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                  Compounding Frequency
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-4">
                  The frequency at which interest is calculated and added to your principal substantially impacts your long-term returns or costs.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-50 dark:bg-blue-900/30">
                      <tr>
                        <th className="px-3 py-2 text-left border border-blue-100 dark:border-blue-800">Compounding Frequency</th>
                        <th className="px-3 py-2 text-left border border-blue-100 dark:border-blue-800">Description</th>
                        <th className="px-3 py-2 text-left border border-blue-100 dark:border-blue-800">Example: $10,000 at 5% for 10 years</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">Annually</td>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">Interest calculated once per year</td>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">$16,289</td>
                      </tr>
                      <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">Semi-annually</td>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">Interest calculated twice per year</td>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">$16,436</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">Quarterly</td>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">Interest calculated four times per year</td>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">$16,512</td>
                      </tr>
                      <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">Monthly</td>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">Interest calculated each month</td>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">$16,568</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">Daily</td>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">Interest calculated every day</td>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">$16,583</td>
                      </tr>
                      <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">Continuously</td>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">Interest calculated at every instant</td>
                        <td className="px-3 py-2 border border-blue-100 dark:border-blue-800">$16,487</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Important Note:</strong> In savings and investments, more frequent compounding is generally better for you as it results in higher returns. For loans and credit, the opposite is true—more frequent compounding means higher costs for borrowers.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4" id="rule-of-72">The Rule of 72: Quick Estimation</h3>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg mb-3">What is the Rule of 72?</h4>
                <p className="mb-3">
                  The Rule of 72 is a simple mathematical shortcut to estimate how long it will take for an investment to double in value at a fixed annual rate of return.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h5 className="font-medium text-blue-800 dark:text-blue-300">Formula:</h5>
                  <div className="bg-white dark:bg-gray-800 p-2 mt-2 rounded font-mono text-lg text-center">
                    Years to Double = 72 ÷ Interest Rate
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm"><strong>Example 1:</strong> At 6% interest, money doubles in approximately 72 ÷ 6 = 12 years</p>
                  <p className="text-sm"><strong>Example 2:</strong> At 9% interest, money doubles in approximately 72 ÷ 9 = 8 years</p>
                  <p className="text-sm"><strong>Example 3:</strong> At 3% interest, money doubles in approximately 72 ÷ 3 = 24 years</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-3">Years to Double Your Money</h4>
                <div className="h-[250px]">
                  <Bar 
                    data={{
                      labels: ['2%', '4%', '6%', '8%', '10%', '12%'],
                      datasets: [{
                        label: 'Years to Double',
                        data: [36, 18, 12, 9, 7.2, 6],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(59, 130, 246, 0.75)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(59, 130, 246, 0.85)',
                          'rgba(59, 130, 246, 0.9)',
                          'rgba(59, 130, 246, 0.95)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      indexAxis: 'y',
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  The Rule of 72 highlights how higher interest rates dramatically reduce the time needed to double your money
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calculator Usage Section */}
      <div className="mb-10" id="using-calculator">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Using the Interest Calculator Effectively
        </h2>
        
        <Card className="overflow-hidden border-green-200 dark:border-green-900 mb-6">
          <CardHeader className="bg-green-50 dark:bg-green-900/40">
            <CardTitle>Step-by-Step Guide</CardTitle>
            <CardDescription>How to get the most from your interest calculations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-4">Basic Interest Calculation</h3>
                
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">1</span>
                    <div>
                      <p className="font-medium">Enter principal amount</p>
                      <p className="text-sm text-muted-foreground mt-1">The initial amount you're investing or borrowing</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">2</span>
                    <div>
                      <p className="font-medium">Select interest type</p>
                      <p className="text-sm text-muted-foreground mt-1">Choose between simple or compound interest</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">3</span>
                    <div>
                      <p className="font-medium">Enter interest rate</p>
                      <p className="text-sm text-muted-foreground mt-1">Input the annual interest rate percentage</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">4</span>
                    <div>
                      <p className="font-medium">Set time period</p>
                      <p className="text-sm text-muted-foreground mt-1">Specify the investment or loan duration in years</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">5</span>
                    <div>
                      <p className="font-medium">Choose compounding frequency</p>
                      <p className="text-sm text-muted-foreground mt-1">For compound interest, select how often interest is calculated</p>
                    </div>
                  </li>
                </ol>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-3">Sample Interest Calculation</h4>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-xs text-muted-foreground">Principal Amount</p>
                        <p className="font-medium">$10,000</p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                        <p className="font-medium">6% annually</p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-xs text-muted-foreground">Time Period</p>
                        <p className="font-medium">5 years</p>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-xs text-muted-foreground">Compounding</p>
                        <p className="font-medium">Monthly</p>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded font-medium">
                      <div className="flex justify-between">
                        <span>Final Amount:</span>
                        <span>$13,488.50</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Total Interest Earned:</span>
                        <span>$3,488.50</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      With monthly compounding, you earn $139.16 more than with annual compounding ($13,349.34).
                    </p>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-green-700 dark:text-green-400">Advanced Features</h3>
                
                <div className="grid gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Regular Contributions
                    </h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Add monthly or annual deposits to your calculation to see how regular contributions accelerate growth.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Comparative Analysis
                    </h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Compare different interest rates, compounding frequencies, and time horizons side-by-side.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Inflation Adjustment
                    </h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Calculate real returns by factoring in inflation to understand purchasing power over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4">Understanding Your Results</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                  <CardTitle className="text-base">Future Value</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <p>The total amount you'll have after the specified time period.</p>
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p><strong>For Savings:</strong> The growth of your investment</p>
                    <p><strong>For Loans:</strong> The total amount you'll pay back</p>
                  </div>
                  <p className="mt-3">This figure includes both your principal and accumulated interest.</p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                  <CardTitle className="text-base">Total Interest</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <p>The amount of interest earned or paid over the entire period.</p>
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p><strong>For Savings:</strong> Your profit from interest</p>
                    <p><strong>For Loans:</strong> The cost of borrowing</p>
                  </div>
                  <p className="mt-3">This figure represents the difference between the future value and the principal amount.</p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                  <CardTitle className="text-base">Growth Charts</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <p>Visual representations of how your money grows or debt accumulates over time.</p>
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p><strong>Pay attention to:</strong></p>
                    <ul className="list-disc list-inside">
                      <li>Acceleration of growth over time</li>
                      <li>Impact of different compounding frequencies</li>
                      <li>Comparison between scenarios</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Interest Rate Variability</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    Remember that our calculator assumes a fixed interest rate for the entire period. In reality, interest rates often fluctuate, especially for savings accounts and variable-rate loans. Consider running multiple calculations with different interest scenarios to understand potential variations in outcomes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interest Optimization Section */}
      <div className="mb-10" id="interest-optimization">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl">Optimizing Interest Outcomes</span>
              </div>
            </CardTitle>
            <CardDescription>
              Strategies to maximize earnings and minimize costs
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="maximize-earnings" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Maximizing Interest Earnings
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Start Early</h4>
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      Time is your greatest ally with compound interest. Starting just 5-10 years earlier can double or triple your final results due to the exponential growth curve.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Increase Compounding Frequency</h4>
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      Choose accounts that compound interest monthly or daily rather than annually. The more frequent the compounding, the better your returns over time.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Make Regular Contributions</h4>
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      Adding regular contributions dramatically accelerates growth. Even small monthly additions compound over time to significantly larger sums.
                    </p>
                    <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                      <p><strong>Example:</strong> $10,000 at 7% for 30 years</p>
                      <p>• Without additional contributions: $76,123</p>
                      <p>• With $200/month additional: $284,939</p>
                      <p className="text-blue-700 dark:text-blue-400 font-medium">That's 3.7× more money!</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="minimize-costs" className="text-xl font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Minimizing Interest Costs
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50/50 dark:bg-red-900/20">
                    <h4 className="font-medium text-red-800 dark:text-red-300 flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Secure Lower Interest Rates
                    </h4>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                      For loans, negotiating even a 0.5% lower rate can save thousands over the life of the loan. Maintain excellent credit and shop around for the best rates.
                    </p>
                  </div>
                  
                  <div className="p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50/50 dark:bg-red-900/20">
                    <h4 className="font-medium text-red-800 dark:text-red-300 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Make Extra Principal Payments
                    </h4>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                      Paying extra on your principal, especially early in the loan term, can dramatically reduce the total interest paid and shorten the loan term.
                    </p>
                  </div>
                  
                  <div className="p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50/50 dark:bg-red-900/20">
                    <h4 className="font-medium text-red-800 dark:text-red-300 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Choose Shorter Loan Terms
                    </h4>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                      Shorter loan terms usually come with lower interest rates and always result in less total interest paid, even though monthly payments are higher.
                    </p>
                    <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                      <p><strong>Example:</strong> $300,000 mortgage at 6%</p>
                      <p>• 30-year: $1,799/month, $347,515 total interest</p>
                      <p>• 15-year: $2,532/month, $155,665 total interest</p>
                      <p className="text-red-700 dark:text-red-400 font-medium">Savings: $191,850 in interest!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div>
              <h3 className="text-xl font-bold mb-4">The Impact of Interest Rates</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <Bar 
                    data={{
                      labels: ['1%', '3%', '5%', '7%', '9%'],
                      datasets: [{
                        label: '$10,000 After 20 Years',
                        data: [12202, 18061, 26533, 38697, 56044],
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text: 'Effect of Different Interest Rates (Compounded Annually)'
                        },
                        legend: { display: false }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: { display: true, text: 'Future Value ($)' },
                          ticks: { callback: value => '$' + Number(value).toLocaleString() }
                        }
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="py-3 bg-blue-50 dark:bg-blue-900/30">
                      <CardTitle className="text-base">Interest Rate Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="mb-3 text-sm">
                        Even small differences in interest rates produce dramatically different results over time due to the exponential nature of compound growth.
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-blue-50/50 dark:bg-blue-900/20">
                            <tr>
                              <th className="px-3 py-2 text-left border">Rate Increase</th>
                              <th className="px-3 py-2 text-left border">Additional Return (20 years)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-3 py-2 border">1% → 3%</td>
                              <td className="px-3 py-2 border">+48%</td>
                            </tr>
                            <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                              <td className="px-3 py-2 border">3% → 5%</td>
                              <td className="px-3 py-2 border">+47%</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 border">5% → 7%</td>
                              <td className="px-3 py-2 border">+46%</td>
                            </tr>
                            <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                              <td className="px-3 py-2 border">7% → 9%</td>
                              <td className="px-3 py-2 border">+45%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Each 2% increase in interest rate leads to approximately 45-50% more money after 20 years
                      </p>
                    </CardContent>
                  </Card>
                  
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">The Two-Sided Nature of Interest</p>
                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                          Remember that interest works both ways. The same principles that help grow your investments also work against you with debt. A high-interest credit card at 18-24% can accumulate debt at an alarming rate if only minimum payments are made.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interest Statistics Section */}
      <div className="mb-10" id="interest-statistics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Interest Rates and Economic Trends
        </h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Average Savings Rate</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">4.35%</p>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">High-yield accounts (2025)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">30-Year Mortgage Rate</h3>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">6.85%</p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">National average (April 2025)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                  <Percent className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Federal Funds Rate</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">4.75%</p>
                <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">Current target range midpoint</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Average Credit Card APR</h3>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">22.8%</p>
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">For new offers (2025)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-600" />
              Historical Interest Rate Trends
            </CardTitle>
            <CardDescription>U.S. interest rates over the past decade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line 
                data={{
                  labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
                  datasets: [
                    {
                      label: 'Fed Funds Rate',
                      data: [0.25, 0.75, 1.5, 2.5, 1.75, 0.25, 0.25, 4.25, 5.25, 5.0, 4.75],
                      borderColor: 'rgba(124, 58, 237, 0.8)',
                      backgroundColor: 'rgba(124, 58, 237, 0.1)',
                      tension: 0.4
                    },
                    {
                      label: '30-Year Mortgage',
                      data: [3.85, 3.65, 3.99, 4.54, 3.74, 2.67, 2.96, 5.34, 6.92, 7.22, 6.85],
                      borderColor: 'rgba(59, 130, 246, 0.8)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4
                    },
                    {
                      label: 'High-Yield Savings',
                      data: [1.05, 1.1, 1.3, 2.0, 2.2, 0.5, 0.5, 3.0, 4.5, 4.7, 4.35],
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
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return context.dataset.label + ': ' + context.parsed.y + '%';
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      title: { display: true, text: 'Interest Rate (%)' }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Interest Rate Outlook</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                After the significant rate increases of 2022-2023 to combat inflation, central banks have begun a gradual easing cycle. Market projections suggest interest rates will continue to moderate through 2025-2026, potentially creating improved conditions for borrowers. However, rates remain significantly higher than the ultra-low environment of 2020-2021, emphasizing the importance of careful interest calculations in financial planning.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Harnessing the Power of Interest
            </CardTitle>
            <CardDescription>
              Making interest work for you, not against you
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Interest calculators</strong> provide the clarity and insights needed to make sound financial decisions. By understanding the fundamental principles of interest—both simple and compound—you can develop strategies that maximize your earnings on savings and investments while minimizing the cost of debt.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Remember these key principles for financial success:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">For Savers & Investors</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Start early to harness the full power of compounding</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <RefreshCw className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Choose accounts with frequent compounding periods</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Percent className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Even small increases in interest rates make huge differences over time</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">For Borrowers</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <TrendingDown className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Shop aggressively for the lowest possible interest rates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Choose shorter loan terms when feasible to reduce total interest costs</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Make extra principal payments early in the loan term</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to calculate your interest?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Interest Calculator</strong> above to plan your financial future! For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/compound-interest">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Compound Interest
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/loan">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Loan Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/savings">
                        <Wallet className="h-4 w-4 mr-1" />
                        Savings Calculator
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
                    See how your money can grow through the power of compound interest over time.
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
                  <CardTitle className="text-lg">Savings Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Plan your savings strategy and see how regular deposits can help you reach your goals.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/savings">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Investment Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Project the growth of your investments with different contribution scenarios.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/investment">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      <SaveCalculationButton calculatorType="interest" inputs={{}} results={{}} />
      </main>
      <SiteFooter />
    </div>
  )
}