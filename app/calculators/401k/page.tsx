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
import { DollarSign, Calculator, Download, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Percent, Clock, Wallet } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import FourZeroOneKSchema from './schema';

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

// Starting at line 32
interface YearlyProjection {
  year: number
  balance: number
  contributions: number
  employerMatch: number
  returns: number
  
  // You could add these optional fields from my schema
  salary?: number
  cumulativeContributions?: number
  cumulativeReturns?: number
}

interface TotalContributions {
  personal: number
  employer: number
  returns: number
}

// Add any additional interfaces here before line 44
interface User401kInputs {
  currentAge: number
  retirementAge: number
  currentBalance: number
  annualSalary: number
  contributionRate: number
  employerMatchRate: number
  employerMatchLimit: number
  annualSalaryIncrease: number
  expectedReturn: number
  inflationRate: number
  managementFees: number
  compoundingFrequency: string
  additionalContributions: number
  catchUpContributions: boolean
}

interface User401kResults {
  projectedBalance: number
  inflationAdjustedBalance: number
  yearsToRetirement: number
  totalContributions: TotalContributions
  yearlyProjections: YearlyProjection[]
  recommendations: Recommendation[]
}

interface Recommendation {
  type: string
  message: string
  potentialImpact?: number
}

export default function FourZeroOneKCalculator() {
  // Personal Details
  const [currentAge, setCurrentAge] = useState<number>(30)
  const [retirementAge, setRetirementAge] = useState<number>(65)
  const [currentBalance, setCurrentBalance] = useState<number>(50000)
  const [annualSalary, setAnnualSalary] = useState<number>(75000)
  const [contributionRate, setContributionRate] = useState<number>(6)
  const [employerMatchRate, setEmployerMatchRate] = useState<number>(50)
  const [employerMatchLimit, setEmployerMatchLimit] = useState<number>(6)
  const [annualSalaryIncrease, setAnnualSalaryIncrease] = useState<number>(2)

  // Investment Details
  const [expectedReturn, setExpectedReturn] = useState<number>(7)
  const [inflationRate, setInflationRate] = useState<number>(2.5)
  const [managementFees, setManagementFees] = useState<number>(0.5)
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("12")

  // Additional Contributions
  const [additionalContributions, setAdditionalContributions] = useState<number>(0)
  const [catchUpContributions, setCatchUpContributions] = useState<boolean>(false)

  // Results State
  const [projectedBalance, setProjectedBalance] = useState<number>(0)
  const [totalContributions, setTotalContributions] = useState<TotalContributions>({
    personal: 0,
    employer: 0,
    returns: 0
  })
  const [yearlyProjections, setYearlyProjections] = useState<YearlyProjection[]>([])

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Calculate projections
  useEffect(() => {
    // Validation
    const newErrors: { [key: string]: string } = {}
    if (retirementAge <= currentAge) {
      newErrors.retirementAge = "Retirement age must be greater than current age"
    }
    if (annualSalary <= 0) {
      newErrors.annualSalary = "Annual salary must be greater than 0"
    }
    if (contributionRate < 0 || contributionRate > 100) {
      newErrors.contributionRate = "Contribution rate must be between 0% and 100%"
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const yearsToRetirement = retirementAge - currentAge
    const n = Number(compoundingFrequency)
    const effectiveReturn = (expectedReturn - managementFees) / 100
    const effectiveSalaryIncrease = annualSalaryIncrease / 100

    let projections: YearlyProjection[] = []
    let currentSalary = annualSalary
    let balance = currentBalance
    let totalPersonal = 0
    let totalEmployer = 0
    let totalReturns = 0

    for (let year = 1; year <= yearsToRetirement; year++) {
      const annualContribution = (currentSalary * (contributionRate / 100))
      const employerMatch = Math.min(
        annualContribution * (employerMatchRate / 100),
        currentSalary * (employerMatchLimit / 100)
      )
      const catchUpAmount = (catchUpContributions && currentAge + year >= 50) ? 6500 : 0

      const startBalance = balance
      const totalContributionsForYear = annualContribution + employerMatch + additionalContributions + catchUpAmount

      balance = startBalance * Math.pow(1 + effectiveReturn / n, n)
      balance += totalContributionsForYear * ((Math.pow(1 + effectiveReturn / n, n) - 1) / (effectiveReturn / n))

      const yearReturns = balance - startBalance - totalContributionsForYear

      totalPersonal += annualContribution + additionalContributions + catchUpAmount
      totalEmployer += employerMatch
      totalReturns += yearReturns

      projections.push({
        year: currentAge + year,
        balance,
        contributions: annualContribution + additionalContributions + catchUpAmount,
        employerMatch,
        returns: yearReturns
      })

      currentSalary *= (1 + effectiveSalaryIncrease)
    }

    setProjectedBalance(balance)
    setTotalContributions({
      personal: totalPersonal,
      employer: totalEmployer,
      returns: totalReturns
    })
    setYearlyProjections(projections)
  }, [
    currentAge,
    retirementAge,
    currentBalance,
    annualSalary,
    contributionRate,
    employerMatchRate,
    employerMatchLimit,
    annualSalaryIncrease,
    expectedReturn,
    managementFees,
    compoundingFrequency,
    additionalContributions,
    catchUpContributions
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

  // Contribution breakdown chart
  const pieChartData = useMemo(() => ({
    labels: ['Your Contributions', 'Employer Match', 'Investment Returns'],
    datasets: [{
      data: [
        totalContributions.personal,
        totalContributions.employer,
        totalContributions.returns
      ],
      backgroundColor: chartColors.primary.slice(0, 3),
      borderColor: chartColors.secondary.slice(0, 3).map(color => color.replace('0.2', '1')),
      borderWidth: 2
    }]
  }), [totalContributions])

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
          const total = totalContributions.personal + totalContributions.employer + totalContributions.returns
          return ((value / total) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Balance growth chart
  const balanceChartData = useMemo(() => ({
    labels: yearlyProjections.map(p => `Age ${p.year}`),
    datasets: [
      {
        label: 'Account Balance',
        data: yearlyProjections.map(p => p.balance),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      }
    ]
  }), [yearlyProjections])

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => '$' + (typeof value === 'number' ? value.toLocaleString() : value)
        }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' } }
    }
  }

  // Yearly contributions chart
  const contributionsChartData = useMemo(() => ({
    labels: yearlyProjections.map(p => `Age ${p.year}`),
    datasets: [
      {
        label: 'Your Contributions',
        data: yearlyProjections.map(p => p.contributions),
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Employer Match',
        data: yearlyProjections.map(p => p.employerMatch),
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Investment Returns',
        data: yearlyProjections.map(p => p.returns),
        backgroundColor: chartColors.primary[2],
        borderColor: chartColors.secondary[2].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }), [yearlyProjections])

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { callback: (value) => '$' + (typeof value === 'number' ? value.toLocaleString() : value) }
      },
      x: { stacked: true, grid: { display: false } }
    },
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' } },
      datalabels: { display: false }
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
  }

  const exportPDF = async () => {
    const element = document.getElementById('results-section')
    if (!element) return
    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
    pdf.save('401k-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <FourZeroOneKSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        401(k) <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Project your retirement savings growth with our comprehensive 401(k) calculator, including employer matching and investment returns.
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
                    <CardTitle>Enter Your Details</CardTitle>
                    <CardDescription>
                      Provide information about your 401(k) plan and investment preferences to project your retirement savings.
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
                            value={currentAge}
                            onChange={(e) => setCurrentAge(Number(e.target.value))}
                            min={18}
                            max={100}
                            aria-describedby="current-age-desc"
                          />
                          <p id="current-age-desc" className="text-xs text-muted-foreground">Your current age in years</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retirement-age">Retirement Age</Label>
                          <Input
                            id="retirement-age"
                            type="number"
                            value={retirementAge}
                            onChange={(e) => setRetirementAge(Number(e.target.value))}
                            min={currentAge + 1}
                            max={100}
                            aria-describedby="retirement-age-error"
                          />
                          {errors.retirementAge && <p id="retirement-age-error" className="text-xs text-red-500">{errors.retirementAge}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="current-balance">Current 401(k) Balance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="current-balance"
                              type="number"
                              className="pl-9"
                              value={currentBalance}
                              onChange={(e) => setCurrentBalance(Math.max(0, Number(e.target.value)))}
                              min={0}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="annual-salary">Annual Salary</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="annual-salary"
                              type="number"
                              className="pl-9"
                              value={annualSalary}
                              onChange={(e) => setAnnualSalary(Math.max(0, Number(e.target.value)))}
                              min={0}
                              aria-describedby="annual-salary-error"
                            />
                          </div>
                          {errors.annualSalary && <p id="annual-salary-error" className="text-xs text-red-500">{errors.annualSalary}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Contribution Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Contribution Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="contribution-rate">Your Contribution Rate</Label>
                            <span className="text-sm text-muted-foreground">{contributionRate}%</span>
                          </div>
                          <Slider
                            id="contribution-rate"
                            min={0}
                            max={100}
                            step={0.5}
                            value={[contributionRate]}
                            onValueChange={(value) => setContributionRate(value[0])}
                            aria-describedby="contribution-rate-error"
                          />
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency((annualSalary * contributionRate) / 100)} per year
                          </p>
                          {errors.contributionRate && <p id="contribution-rate-error" className="text-xs text-red-500">{errors.contributionRate}</p>}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="employer-match-rate">Employer Match Rate</Label>
                            <span className="text-sm text-muted-foreground">{employerMatchRate}%</span>
                          </div>
                          <Slider
                            id="employer-match-rate"
                            min={0}
                            max={100}
                            step={1}
                            value={[employerMatchRate]}
                            onValueChange={(value) => setEmployerMatchRate(value[0])}
                          />
                          <p className="text-xs text-muted-foreground">Up to {employerMatchLimit}% of your salary</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="employer-match-limit">Employer Match Limit</Label>
                            <span className="text-sm text-muted-foreground">{employerMatchLimit}%</span>
                          </div>
                          <Slider
                            id="employer-match-limit"
                            min={0}
                            max={20}
                            step={0.5}
                            value={[employerMatchLimit]}
                            onValueChange={(value) => setEmployerMatchLimit(value[0])}
                          />
                          <p className="text-xs text-muted-foreground">Up to {formatCurrency((annualSalary * employerMatchLimit) / 100)} per year</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="salary-increase">Annual Salary Increase</Label>
                            <span className="text-sm text-muted-foreground">{annualSalaryIncrease}%</span>
                          </div>
                          <Slider
                            id="salary-increase"
                            min={0}
                            max={10}
                            step={0.1}
                            value={[annualSalaryIncrease]}
                            onValueChange={(value) => setAnnualSalaryIncrease(value[0])}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Investment Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Investment Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="expected-return">Expected Annual Return</Label>
                            <span className="text-sm text-muted-foreground">{expectedReturn}%</span>
                          </div>
                          <Slider
                            id="expected-return"
                            min={1}
                            max={12}
                            step={0.1}
                            value={[expectedReturn]}
                            onValueChange={(value) => setExpectedReturn(value[0])}
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
                            max={10}
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
                            step={0.01}
                            value={[managementFees]}
                            onValueChange={(value) => setManagementFees(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compounding-frequency">Compounding Frequency</Label>
                          <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                            <SelectTrigger id="compounding-frequency">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Annually</SelectItem>
                              <SelectItem value="4">Quarterly</SelectItem>
                              <SelectItem value="12">Monthly</SelectItem>
                              <SelectItem value="26">Bi-weekly</SelectItem>
                              <SelectItem value="52">Weekly</SelectItem>
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
                          <Label htmlFor="additional-contributions">Annual Additional Contributions</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="additional-contributions"
                              type="number"
                              className="pl-9"
                              value={additionalContributions}
                              onChange={(e) => setAdditionalContributions(Math.max(0, Number(e.target.value)))}
                              min={0}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="catch-up-contributions">Include Catch-Up Contributions (Age 50+)</Label>
                            <Switch
                              id="catch-up-contributions"
                              checked={catchUpContributions}
                              onCheckedChange={setCatchUpContributions}
                            />
                          </div>
                          {catchUpContributions && (
                            <p className="text-xs text-muted-foreground">Additional $6,500 per year when eligible</p>
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
                      <p className="text-sm text-muted-foreground">Projected Balance at Retirement</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(projectedBalance)}</p>
                      <p className="text-sm text-muted-foreground">
                        In today's dollars: {formatCurrency(projectedBalance / Math.pow(1 + inflationRate / 100, retirementAge - currentAge))}
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
                          <h4 className="font-medium">Account Breakdown</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Your Contributions</span>
                              <span className="font-medium">{formatCurrency(totalContributions.personal)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Employer Match</span>
                              <span className="font-medium">{formatCurrency(totalContributions.employer)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Investment Returns</span>
                              <span className="font-medium">{formatCurrency(totalContributions.returns)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Balance</span>
                              <span>{formatCurrency(projectedBalance)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="growth" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={balanceChartData} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Growth Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Years to Retirement</span>
                              <span className="font-medium">{retirementAge - currentAge}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Growth</span>
                              <span className="font-medium">
                                {((projectedBalance / (currentBalance + totalContributions.personal + totalContributions.employer) - 1) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="contributions" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={contributionsChartData} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Contribution Details</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Monthly Contribution</span>
                              <span className="font-medium">{formatCurrency((annualSalary * contributionRate) / 100 / 12)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Monthly Employer Match</span>
                              <span className="font-medium">{formatCurrency(Math.min(
                                (annualSalary * contributionRate / 100 * employerMatchRate / 100) / 12,
                                (annualSalary * employerMatchLimit / 100) / 12
                              ))}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Recommendations */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Recommendations</p>
                            {contributionRate < employerMatchLimit ? (
                              <p className="text-sm text-muted-foreground">
                                Consider increasing your contribution to {employerMatchLimit}% to maximize your employer match.
                                You're currently leaving {formatCurrency(
                                  (annualSalary * employerMatchLimit / 100 * employerMatchRate / 100) -
                                  (annualSalary * contributionRate / 100 * employerMatchRate / 100)
                                )} per year in matching funds on the table.
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                You're maximizing your employer match! Consider increasing your contribution rate further if you can afford to save more for retirement.
                              </p>
                            )}
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
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Master Your 401(k): A Complete Guide to Retirement Savings</h2>
                <p className="mt-3 text-muted-foreground text-lg">Learn how to maximize your retirement savings with our interactive 401(k) calculator and expert tips.</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    What is a 401(k) Plan?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p>
                    A <strong>401(k) plan</strong> is a powerful retirement savings tool offered by employers, allowing you to save a portion of your salary before taxes are deducted. Contributions grow tax-deferred until withdrawal, and many employers match a percentage of your contributions, boosting your savings.
                  </p>
                  <p className="mt-2">
                    Key benefits include:
                  </p>
                  <ul className="my-3 space-y-1">
                    <li className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Tax-advantaged growth</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span>Employer matching contributions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span>Automatic payroll deductions</span>
                    </li>
                  </ul>
                  <p>
                    Our <strong>401(k) Calculator</strong> helps you project how your savings can grow over time, factoring in contributions, employer matching, and investment returns.
                  </p>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">How to Use the 401(k) Calculator</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="step-by-step" className="font-bold text-xl mb-4">Step-by-Step Guide</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">1</span>
                          Enter Personal Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Input your current age and planned retirement age</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Provide your current 401(k) balance and annual salary</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">2</span>
                          Set Contribution Rates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Percent className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Specify your contribution rate as a percentage of salary</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Percent className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Enter employer match rate and limit</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">3</span>
                          Adjust Investment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Set expected annual return and management fees</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Choose compounding frequency</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">4</span>
                          Add Additional Contributions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Input any extra annual contributions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Switch className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Enable catch-up contributions if eligible</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <h3 id="results" className="font-bold text-xl mt-8 mb-4">Understanding Your Results</h3>
                
                <div className="mb-6">
                  <p className="text-muted-foreground mb-4">
                    The calculator provides several key insights to help you plan for retirement:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Projected Balance:</strong> Your estimated 401(k) balance at retirement, in both future and inflation-adjusted dollars.</li>
                    <li><strong>Contribution Breakdown:</strong> A pie chart showing the sources of your savings: personal contributions, employer match, and investment returns.</li>
                    <li><strong>Growth Over Time:</strong> A line chart illustrating how your balance grows year by year.</li>
                    <li><strong>Recommendations:</strong> Personalized tips to optimize your savings strategy.</li>
                  </ul>
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Tip:</strong> Pay attention to the inflation-adjusted balance to understand your future purchasing power.
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
                        <span className="text-2xl">Key Concepts for 401(k) Success</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Essential principles to maximize your retirement savings
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
                            <strong>Compound interest</strong> is the cornerstone of long-term savings growth. By earning returns on both your contributions and previous earnings, your 401(k) can grow exponentially over time.
                          </p>
                          <ul className="mt-4 space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span>Start early to maximize compounding benefits</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span>Consistent contributions amplify growth</span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                              <strong>Example:</strong> A $10,000 investment at 7% annual return becomes $19,672 in 10 years, $38,697 in 20 years, and $76,123 in 30 years.
                            </p>
                          </div>
                        </div>
                        
                        <div className="h-[220px]">
                          <h4 className="text-center text-sm font-medium mb-2">Compound Growth Over Time</h4>
                          <Line
                            data={{
                              labels: ['0', '10', '20', '30'],
                              datasets: [
                                {
                                  label: 'Balance',
                                  data: [10000, 19672, 38697, 76123],
                                  borderColor: 'rgba(124, 58, 237, 0.8)',
                                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { legend: { display: false } },
                              scales: {
                                y: { ticks: { callback: (value) => '$' + value } }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-8" />
                    
                    <div className="mb-8">
                      <h3 id="employer-matching" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Employer Matching
                      </h3>
                      <p>
                        <strong>Employer matching</strong> is a key benefit of 401(k) plans, where your employer contributes additional funds based on your contributions. This is essentially free money that can significantly boost your retirement savings.
                      </p>
                      <div className="mt-4 p-3 border border-indigo-200 dark:border-indigo-800 rounded-md bg-indigo-50 dark:bg-indigo-900/20">
                        <p className="text-sm text-indigo-800 dark:text-indigo-300">
                          <strong>Tip:</strong> Always contribute enough to get the full employer match. It's an instant return on your investment.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tips for Maximizing Your 401(k) */}
              <div className="mb-12" id="tips">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  Tips to Maximize Your 401(k)
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Start contributing as early as possible to take advantage of compound growth.</li>
                  <li>Contribute at least enough to get the full employer match—it's free money!</li>
                  <li>Increase your contribution rate with each raise or bonus.</li>
                  <li>Consider catch-up contributions if you're 50 or older.</li>
                  <li>Review your investment choices and adjust based on your risk tolerance and time horizon.</li>
                  <li>Minimize fees by choosing low-cost funds, as fees can erode returns over time.</li>
                </ul>
              </div>

              {/* Related Calculators */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Explore More Tools</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Retirement Calculator</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Plan your retirement with Social Security and other income sources.</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild>
                        <Link href="/calculators/retirement">Try Now</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>IRA Calculator</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Compare Traditional and Roth IRA options.</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild>
                        <Link href="/calculators/ira">Try Now</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Compound Interest Calculator</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">See how investments grow with compound interest.</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild>
                        <Link href="/calculators/compound-interest">Try Now</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}