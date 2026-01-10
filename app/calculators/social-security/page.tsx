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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import SocialSecuritySchema from './schema';

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

// Constants for Social Security calculations
const BEND_POINTS_2024 = {
  first: 1174,
  second: 7078
}

const REDUCTION_FACTORS = {
  early: 0.00555556, // 5/9 of 1% per month for first 36 months
  veryEarly: 0.00416667, // 5/12 of 1% per month beyond 36 months
  delayed: 0.00666667 // 2/3 of 1% per month (8% per year)
}

const COLA_ESTIMATE = 0.027 // 2.7% estimated annual cost of living adjustment

export default function SocialSecurityCalculator() {
  // Personal Information
  const [birthYear, setBirthYear] = useState(1980)
  const [currentAge, setCurrentAge] = useState(43)
  const [retirementAge, setRetirementAge] = useState(67)
  const [fullRetirementAge, setFullRetirementAge] = useState(67)
  
  // Earnings History
  const [averageEarnings, setAverageEarnings] = useState(60000)
  const [futureEarnings, setFutureEarnings] = useState(65000)
  const [workYears, setWorkYears] = useState(35)
  
  // Spousal Benefits
  const [includeSpouse, setIncludeSpouse] = useState(false)
  const [spouseEarnings, setSpouseEarnings] = useState(45000)
  const [spouseAge, setSpouseAge] = useState(43)
  const [spouseRetirementAge, setSpouseRetirementAge] = useState(67)
  
  // Results State
  const [monthlyBenefit, setMonthlyBenefit] = useState(0)
  const [spouseBenefit, setSpouseBenefit] = useState(0)
  const [totalBenefit, setTotalBenefit] = useState(0)
  const [benefitProjections, setBenefitProjections] = useState<{
    age: number;
    benefit: number;
    cumulative: number;
  }[]>([])
  const [breakEvenAnalysis, setBreakEvenAnalysis] = useState<{
    early: number[];
    normal: number[];
    delayed: number[];
  }>({
    early: [],
    normal: [],
    delayed: []
  })

  // Calculate full retirement age based on birth year
  useEffect(() => {
    let fra = 67
    if (birthYear <= 1937) fra = 65
    else if (birthYear <= 1943) fra = 65 + ((birthYear - 1937) * 2) / 12
    else if (birthYear <= 1954) fra = 66
    else if (birthYear <= 1960) fra = 66 + ((birthYear - 1954) * 2) / 12
    setFullRetirementAge(fra)
  }, [birthYear])

  // Calculate benefits
  useEffect(() => {
    // Calculate AIME (Average Indexed Monthly Earnings)
    const monthlyEarnings = averageEarnings / 12
    
    // Calculate PIA (Primary Insurance Amount)
    let pia = 0
    if (monthlyEarnings <= BEND_POINTS_2024.first) {
      pia = monthlyEarnings * 0.9
    } else if (monthlyEarnings <= BEND_POINTS_2024.second) {
      pia = (BEND_POINTS_2024.first * 0.9) + 
            ((monthlyEarnings - BEND_POINTS_2024.first) * 0.32)
    } else {
      pia = (BEND_POINTS_2024.first * 0.9) + 
            ((BEND_POINTS_2024.second - BEND_POINTS_2024.first) * 0.32) + 
            ((monthlyEarnings - BEND_POINTS_2024.second) * 0.15)
    }
    
    // Apply early/delayed retirement adjustments
    const monthsDiff = (retirementAge - fullRetirementAge) * 12
    let adjustedBenefit = pia
    
    if (monthsDiff < 0) {
      // Early retirement reduction
      const earlyMonths = Math.min(-monthsDiff, 36)
      const veryEarlyMonths = Math.max(-monthsDiff - 36, 0)
      adjustedBenefit *= (1 - (earlyMonths * REDUCTION_FACTORS.early) - 
                         (veryEarlyMonths * REDUCTION_FACTORS.veryEarly))
    } else if (monthsDiff > 0) {
      // Delayed retirement credits
      adjustedBenefit *= (1 + (monthsDiff * REDUCTION_FACTORS.delayed))
    }
    
    setMonthlyBenefit(adjustedBenefit)
    
    // Calculate spousal benefit if applicable
    if (includeSpouse) {
      const spousePia = (spouseEarnings / 12) * 0.9 // Simplified calculation
      const spouseAdjustedBenefit = spousePia * 
        (1 - Math.max(0, (67 - spouseRetirementAge) * 12 * REDUCTION_FACTORS.early))
      setSpouseBenefit(spouseAdjustedBenefit)
      setTotalBenefit(adjustedBenefit + spouseAdjustedBenefit)
    } else {
      setSpouseBenefit(0)
      setTotalBenefit(adjustedBenefit)
    }
    
    // Generate benefit projections
    const projections = []
    let cumulativeBenefit = 0
    for (let age = retirementAge; age <= 95; age++) {
      const yearsSinceRetirement = age - retirementAge
      const inflationFactor = Math.pow(1 + COLA_ESTIMATE, yearsSinceRetirement)
      const annualBenefit = adjustedBenefit * 12 * inflationFactor
      cumulativeBenefit += annualBenefit
      projections.push({
        age,
        benefit: annualBenefit,
        cumulative: cumulativeBenefit
      })
    }
    setBenefitProjections(projections)
    
    // Generate break-even analysis
    const earlyBenefits = []
    const normalBenefits = []
    const delayedBenefits = []
    
    for (let month = 0; month < 360; month++) { // 30 years
      const earlyBenefit = pia * 0.7 * Math.pow(1 + COLA_ESTIMATE/12, month)
      const normalBenefit = pia * Math.pow(1 + COLA_ESTIMATE/12, month)
      const delayedBenefit = pia * 1.24 * Math.pow(1 + COLA_ESTIMATE/12, month)
      
      earlyBenefits.push(earlyBenefit * month)
      normalBenefits.push(normalBenefit * Math.max(0, month - 60))
      delayedBenefits.push(delayedBenefit * Math.max(0, month - 96))
    }
    
    setBreakEvenAnalysis({
      early: earlyBenefits,
      normal: normalBenefits,
      delayed: delayedBenefits
    })
    
  }, [
    averageEarnings,
    birthYear,
    retirementAge,
    fullRetirementAge,
    includeSpouse,
    spouseEarnings,
    spouseRetirementAge
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

  // Benefit projection chart
  const generateBenefitProjectionChart = () => {
    return {
      labels: benefitProjections.map(p => `Age ${p.age}`),
      datasets: [
        {
          label: 'Annual Benefit',
          data: benefitProjections.map(p => p.benefit),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Cumulative Benefits',
          data: benefitProjections.map(p => p.cumulative),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4,
          yAxisID: 'cumulative'
        }
      ]
    }
  }

  const benefitProjectionOptions: ChartOptions<'line'> = {
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
      cumulative: {
        position: 'right',
        beginAtZero: true,
        grid: { display: false },
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

  // Break-even analysis chart
  const breakEvenChartData = {
    labels: Array.from({ length: 30 }, (_, i) => `Year ${i + 1}`),
    datasets: [
      {
        label: 'Early Retirement (62)',
        data: breakEvenAnalysis.early.filter((_, i) => i % 12 === 0),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      },
      {
        label: 'Full Retirement Age',
        data: breakEvenAnalysis.normal.filter((_, i) => i % 12 === 0),
        borderColor: chartColors.primary[1],
        backgroundColor: chartColors.secondary[1],
        tension: 0.4
      },
      {
        label: 'Delayed Retirement (70)',
        data: breakEvenAnalysis.delayed.filter((_, i) => i % 12 === 0),
        borderColor: chartColors.primary[2],
        backgroundColor: chartColors.secondary[2],
        tension: 0.4
      }
    ]
  }

  const breakEvenChartOptions: ChartOptions<'line'> = {
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
    pdf.save('social-security-benefits-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <SocialSecuritySchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Social Security <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Estimate your future Social Security benefits and optimize your retirement timing.
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
                      Provide your personal and earnings information to calculate your estimated Social Security benefits.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Personal Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="birth-year">Birth Year</Label>
                          <Input
                            id="birth-year"
                            type="number"
                            value={birthYear || ''} onChange={(e) => setBirthYear(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="current-age">Current Age</Label>
                          <Input
                            id="current-age"
                            type="number"
                            value={currentAge || ''} onChange={(e) => setCurrentAge(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="retirement-age">Planned Retirement Age</Label>
                            <span className="text-sm text-muted-foreground">{retirementAge}</span>
                          </div>
                          <Slider
                            id="retirement-age"
                            min={62}
                            max={70}
                            step={1}
                            value={[retirementAge]}
                            onValueChange={(value) => setRetirementAge(value[0])}
                          />
                          <p className="text-xs text-muted-foreground">
                            Your full retirement age is {fullRetirementAge}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Earnings History */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Earnings History</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="average-earnings">Average Annual Earnings</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="average-earnings"
                              type="number"
                              className="pl-9"
                              value={averageEarnings || ''} onChange={(e) => setAverageEarnings(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="future-earnings">Expected Future Annual Earnings</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="future-earnings"
                              type="number"
                              className="pl-9"
                              value={futureEarnings || ''} onChange={(e) => setFutureEarnings(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="work-years">Years of Work History</Label>
                          <Input
                            id="work-years"
                            type="number"
                            value={workYears || ''} onChange={(e) => setWorkYears(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Spousal Benefits */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Spousal Benefits</h3>
                        <Switch
                          checked={includeSpouse}
                          onCheckedChange={setIncludeSpouse}
                        />
                      </div>
                      {includeSpouse && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="spouse-earnings">Spouse's Annual Earnings</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="spouse-earnings"
                                type="number"
                                className="pl-9"
                                value={spouseEarnings || ''} onChange={(e) => setSpouseEarnings(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="spouse-age">Spouse's Current Age</Label>
                            <Input
                              id="spouse-age"
                              type="number"
                              value={spouseAge || ''} onChange={(e) => setSpouseAge(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="spouse-retirement-age">Spouse's Retirement Age</Label>
                              <span className="text-sm text-muted-foreground">{spouseRetirementAge}</span>
                            </div>
                            <Slider
                              id="spouse-retirement-age"
                              min={62}
                              max={70}
                              step={1}
                              value={[spouseRetirementAge]}
                              onValueChange={(value) => setSpouseRetirementAge(value[0])}
                            />
                          </div>
                        </div>
                      )}
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
                      <p className="text-sm text-muted-foreground">Estimated Monthly Benefit</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(monthlyBenefit)}</p>
                      {includeSpouse && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Including spousal benefit of {formatCurrency(spouseBenefit)}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <Tabs defaultValue="projections" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="projections">Projections</TabsTrigger>
                        <TabsTrigger value="breakeven">Break-Even</TabsTrigger>
                      </TabsList>

                      <TabsContent value="projections" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateBenefitProjectionChart()} options={benefitProjectionOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Benefit Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Monthly Benefit at {retirementAge}</span>
                              <span className="font-medium">{formatCurrency(monthlyBenefit)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Annual Benefit</span>
                              <span className="font-medium">{formatCurrency(monthlyBenefit * 12)}</span>
                            </div>
                            {includeSpouse && (
                              <>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                  <span className="text-sm">Spousal Benefit</span>
                                  <span className="font-medium">{formatCurrency(spouseBenefit)}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                  <span className="text-sm">Combined Monthly Benefit</span>
                                  <span className="font-medium">{formatCurrency(totalBenefit)}</span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Lifetime Benefits by Age 85</span>
                              <span>{formatCurrency(totalBenefit * 12 * (85 - retirementAge))}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="breakeven" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={breakEvenChartData} options={breakEvenChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Break-Even Analysis</h4>
                          <p className="text-sm text-muted-foreground">
                            This chart shows how total benefits compare between different retirement ages over time.
                            The break-even point is where delayed benefits overtake early benefits.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Retirement Age Impact */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Retirement Age Impact</p>
                            <p className="text-sm text-muted-foreground">
                              {retirementAge < fullRetirementAge
                                ? `Retiring ${fullRetirementAge - retirementAge} years early reduces your benefit by ${((1 - monthlyBenefit / (averageEarnings * 0.4)) * 100).toFixed(1)}%.`
                                : retirementAge > fullRetirementAge
                                ? `Delaying retirement ${retirementAge - fullRetirementAge} years increases your benefit by ${((monthlyBenefit / (averageEarnings * 0.4) - 1) * 100).toFixed(1)}%.`
                                : "You are planning to retire at your full retirement age."}
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
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Social Security: Your Complete Guide</h2>
        <p className="mt-3 text-muted-foreground text-lg">Maximize your benefits and plan a secure retirement</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Social Security Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-ss" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is Social Security?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                <strong>Social Security</strong> is a federal insurance program that provides financial benefits to retirees, disabled individuals, and families of retired, disabled, or deceased workers. Established in 1935 during the Great Depression, it serves as a cornerstone of retirement income for millions of Americans.
              </p>
              <p className="mt-2">
                The program operates through payroll taxes collected from workers and employers, creating a financial safety net designed to replace a portion of your pre-retirement income based on your lifetime earnings.
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Primary source of income for many retirees</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Benefits available as early as age 62</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Payments adjusted annually for inflation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Replaces about 40% of pre-retirement income for average earners</span>
                </li>
              </ul>
              <p>
                Understanding how Social Security works is crucial for effective retirement planning. While it provides an important foundation, most financial experts recommend supplementing it with personal savings and other retirement accounts.
              </p>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                  <CardTitle className="text-sm font-medium text-center">Income Sources in Retirement</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Pie 
                      data={{
                        labels: ['Social Security', 'Personal Savings', 'Pension', 'Part-time Work'],
                        datasets: [
                          {
                            data: [40, 30, 20, 10],
                            backgroundColor: [
                              'rgba(99, 102, 241, 0.8)',
                              'rgba(20, 184, 166, 0.8)',
                              'rgba(79, 70, 229, 0.8)',
                              'rgba(245, 158, 11, 0.8)'
                            ],
                            borderColor: 'rgba(255, 255, 255, 0.8)'
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
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <h4 id="eligibility" className="font-semibold text-xl mt-6">Eligibility for Social Security Benefits</h4>
          <div className="mt-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Work Credits</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">You need 40 credits (typically 10 years of work) to qualify for retirement benefits</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Age Requirements</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Earliest eligibility at 62, full benefits at full retirement age (66-67 depending on birth year)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Spousal Benefits</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Current, divorced, or widowed spouses may qualify based on their partner's work record</p>
                </div>
              </div>
            </div>
          </div>
          
          <p>
            A Social Security calculator helps you understand your projected benefits based on your unique work history, planned retirement age, and other personal factors. This knowledge is essential for making informed decisions about when to claim benefits and how to integrate Social Security into your broader retirement strategy.
          </p>
        </CardContent>
      </Card>

      {/* How to Use Section */}
      <div className="mb-12" id="how-to-use">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Maximizing Your Social Security Benefits</h2>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="benefit-calculation" className="font-bold text-xl mb-4">How Social Security Benefits Are Calculated</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">The Basic Formula</h4>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-center font-medium text-blue-800 dark:text-blue-300">
                  Based on your highest 35 years of earnings, adjusted for inflation
                </p>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Calculation Steps</h4>
                <ol className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                    <span>Your earnings are indexed for inflation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                    <span>The highest 35 years are averaged and divided by 12 to get Average Indexed Monthly Earnings (AIME)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                    <span>A progressive formula is applied to your AIME to determine your Primary Insurance Amount (PIA)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">4</span>
                    <span>Your PIA is adjusted based on the age you claim benefits</span>
                  </li>
                </ol>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Benefit Adjustment Factors</h4>
              
              <div className="space-y-4">
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Claiming Age
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <ul className="space-y-1">
                      <li>• Age 62: Reduced benefits (up to 30% less)</li>
                      <li>• Full Retirement Age (FRA): 100% of benefit</li>
                      <li>• Age 70: Enhanced benefits (up to 32% more)</li>
                      <li>• After 70: No additional benefit for waiting</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      Work History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <ul className="space-y-1">
                      <li>• Missing years in your 35-year history lower benefits</li>
                      <li>• Higher earnings in recent years can replace lower-earning years</li>
                      <li>• Working while receiving benefits may temporarily reduce payments</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      COLA Adjustments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>Benefits increase with annual Cost of Living Adjustments (COLAs), which have averaged around 2.6% historically but vary based on inflation.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <h3 id="claiming-strategies" className="font-bold text-xl mt-8 mb-4">Strategic Claiming Decisions</h3>
        
        <div className="mb-6">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Claiming Age</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Effect on Benefits</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Early (Age 62)</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">25-30% reduction from full benefit amount</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Those in poor health or financially unable to wait</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Full Retirement Age (66-67)</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">100% of calculated benefit amount</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Those with average life expectancy or needing balanced approach</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Delayed (Up to Age 70)</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">8% annual increase for each year delayed</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Those in good health, with family longevity, or seeking maximum lifetime benefit</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Break-Even Analysis:</strong> If you start collecting at age 62 vs. waiting until age 70, the break-even point typically occurs around age 80-82. If you expect to live beyond this age, delaying benefits often results in higher lifetime payments.
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
                <span className="text-2xl">Key Factors Affecting Your Benefits</span>
              </div>
            </CardTitle>
            <CardDescription>
              Understanding these elements will help maximize your Social Security payments
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="work-history" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work History and Earnings
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    Your benefit amount is directly tied to your earnings history. Social Security uses your highest 35 years of earnings (indexed for inflation) to calculate your benefit. Years with no earnings are counted as zeros, which can significantly lower your average.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span>Working at least 35 years eliminates zeros in your calculation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span>Higher-earning years later in your career replace lower-earning early years</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span>There's a cap on how much of your income is subject to Social Security taxes and counted toward benefits</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      <strong>2025 Earnings Cap:</strong> $168,600
                    </p>
                    <p className="text-sm mt-1 text-purple-700 dark:text-purple-400">
                      Earnings above this amount are not subject to Social Security tax and don't increase your benefit.
                    </p>
                  </div>
                </div>
                
                <div className="h-[250px]">
                  <h4 className="text-center text-sm font-medium mb-2">Impact of Additional Working Years</h4>
                  <Bar 
                    data={{
                      labels: ['30 Years', '33 Years', '35 Years', '38 Years', '40 Years'],
                      datasets: [
                        {
                          label: 'Monthly Benefit at Full Retirement Age',
                          data: [1850, 2000, 2100, 2175, 2225],
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
                <h3 id="marital-status" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Marital Status Benefits
                </h3>
                <p>Marriage provides additional Social Security options through spousal and survivor benefits, potentially increasing your household's total retirement income.</p>
                
                <div className="mt-4 space-y-4">
                  <Card className="border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="bg-indigo-50 dark:bg-indigo-900/30 py-3">
                      <CardTitle className="text-base">Spousal Benefits</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 text-sm">
                      <ul className="space-y-1">
                        <li>• Up to 50% of your spouse's benefit at their full retirement age</li>
                        <li>• Available even if you have no work history</li>
                        <li>• Your spouse must have filed for their own benefits</li>
                        <li>• Reduced if claimed before your own full retirement age</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="bg-indigo-50 dark:bg-indigo-900/30 py-3">
                      <CardTitle className="text-base">Survivor Benefits</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 text-sm">
                      <ul className="space-y-1">
                        <li>• Up to 100% of deceased spouse's benefit amount</li>
                        <li>• Available as early as age 60 (age 50 if disabled)</li>
                        <li>• Reduced if claimed before your full retirement age</li>
                        <li>• Can switch between your own benefit and survivor benefit to maximize lifetime income</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="bg-indigo-50 dark:bg-indigo-900/30 py-3">
                      <CardTitle className="text-base">Divorced Spouse Benefits</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 text-sm">
                      <ul className="space-y-1">
                        <li>• Marriage must have lasted at least 10 years</li>
                        <li>• Must be currently unmarried</li>
                        <li>• Same benefit amounts as married couples</li>
                        <li>• Ex-spouse doesn't need to have filed for benefits</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div>
                <h3 id="taxation" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Taxation of Benefits
                </h3>
                <p>
                  Many retirees are surprised to learn that Social Security benefits may be taxable at the federal level, depending on your combined income. Understanding these tax implications is crucial for accurate retirement planning.
                </p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">2025 Income Thresholds for Benefit Taxation</h4>
                  <div className="mt-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-blue-100/50 dark:bg-blue-900/50">
                          <tr>
                            <th className="p-2 text-left">Filing Status</th>
                            <th className="p-2 text-left">Combined Income</th>
                            <th className="p-2 text-left">Taxable Portion</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-blue-100 dark:border-blue-800">
                            <td className="p-2 align-top" rowSpan={2}>Individual</td>
                            <td className="p-2">$25,000 - $34,000</td>
                            <td className="p-2">Up to 50%</td>
                          </tr>
                          <tr className="border-b border-blue-100 dark:border-blue-800">
                            <td className="p-2">Over $34,000</td>
                            <td className="p-2">Up to 85%</td>
                          </tr>
                          <tr className="border-b border-blue-100 dark:border-blue-800">
                            <td className="p-2 align-top" rowSpan={2}>Married Filing Jointly</td>
                            <td className="p-2">$32,000 - $44,000</td>
                            <td className="p-2">Up to 50%</td>
                          </tr>
                          <tr>
                            <td className="p-2">Over $44,000</td>
                            <td className="p-2">Up to 85%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-xs text-blue-700 dark:text-blue-400">*Combined income = Adjusted Gross Income + Non-taxable Interest + ½ of Social Security Benefits</p>
                  </div>
                </div>
                
                <h3 id="working-while-receiving" className="text-xl font-bold text-green-700 dark:text-green-400 mt-6 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Working While Receiving Benefits
                </h3>
                <p className="mb-4">
                  If you claim benefits before full retirement age and continue working, your benefits may be temporarily reduced if your earnings exceed certain thresholds.
                </p>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-300 text-sm">2025 Earnings Limits</h4>
                  <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-400">
                    <li>• Under full retirement age: $21,240/year ($1 deduction per $2 earned above limit)</li>
                    <li>• Year reaching full retirement age: $56,520/year ($1 deduction per $3 earned above limit)</li>
                    <li>• Month of and after reaching full retirement age: No limit</li>
                  </ul>
                  <p className="mt-3 text-xs text-green-700 dark:text-green-400">Benefits are recalculated at full retirement age to account for months when benefits were withheld.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Security Trends Section with Statistics */}
      <div className="mb-12" id="ss-statistics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Social Security Trends and Statistics
        </h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Average Benefit</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">$1,905</p>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">Monthly retirement benefit (2025)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                  <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">2025 COLA</h3>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">2.6%</p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">Cost-of-living adjustment</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Average Claiming Age</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">64.5</p>
                <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">Years (trending upward)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                  <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Dependency Ratio</h3>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">2.7:1</p>
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">Workers per beneficiary</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 id="ss-challenges" className="text-xl font-bold mb-4">Social Security Planning Challenges</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </span>
                <CardTitle className="text-base">Trust Fund Concerns</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Projections show Social Security trust funds may be depleted by 2034, potentially reducing benefits to 78% of promised levels unless Congress takes action.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </span>
                <CardTitle className="text-base">Changing Demographics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Decreasing birth rates and increasing longevity create an imbalance between workers and retirees, straining the pay-as-you-go system.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <Percent className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </span>
                <CardTitle className="text-base">Inadequate Replacement</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Social Security typically replaces only about 40% of pre-retirement income, while most financial experts recommend 70-80% replacement for comfortable retirement.
              </p>
            </CardContent>
          </Card>
        </div>

        <h3 id="future-outlook" className="text-xl font-bold mb-4">Future Outlook and Possible Changes</h3>
        <Card className="bg-white dark:bg-gray-900 mb-4">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p>
                  <strong>Social Security's future</strong> is a topic of ongoing political debate. To address funding challenges, various proposals have been suggested over the years:
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">→</span>
                    <span>Increasing the full retirement age</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">→</span>
                    <span>Raising or eliminating the wage base cap</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">→</span>
                    <span>Adjusting the benefit formula</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">→</span>
                    <span>Modifying the COLA calculation method</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">→</span>
                    <span>Increasing payroll tax rates</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 border border-blue-200 dark:border-blue-900 rounded-md bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Important Note:</strong> Historical precedent suggests that changes to Social Security usually:
                  </p>
                  <ul className="text-sm mt-1 text-blue-700 dark:text-blue-400">
                    <li>• Are phased in gradually over many years</li>
                    <li>• Protect those at or near retirement age</li>
                    <li>• Provide time for younger workers to adjust their plans</li>
                  </ul>
                </div>
              </div>
              
              <div className="h-[280px]">
                <h4 className="text-center text-sm font-medium mb-3">Social Security Trust Fund Projections</h4>
                <Line 
                  data={{
                    labels: ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'],
                    datasets: [
                      {
                        label: 'Trust Fund Balance (Billions)',
                        data: [2800, 2725, 2630, 2500, 2350, 2150, 1900, 1600, 1200, 650, 0],
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
                          callback: value => '$' + Number(value).toLocaleString() + 'B'
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
              <p className="font-medium text-amber-800 dark:text-amber-300">Planning for Uncertainty</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                While Social Security will almost certainly continue to exist, it's prudent to prepare for potential changes. Consider building additional retirement savings through 401(k)s, IRAs, and other investment vehicles to supplement your Social Security benefits and provide greater financial security.
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
              Maximizing Your Social Security Benefits
            </CardTitle>
            <CardDescription>
              Smart strategies for optimizing your retirement security
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Social Security benefits</strong> represent a significant portion of most Americans' retirement income. By understanding how benefits are calculated, the impact of claiming age, and special provisions for married couples, you can make informed decisions that potentially increase your lifetime benefits by tens of thousands of dollars.
            </p>
            
            <p className="mt-4" id="next-steps">
              Take these important steps to maximize your Social Security benefits:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Near-Term Actions</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                    <span className="text-blue-800 dark:text-blue-300">Create a my Social Security account to verify your earnings history</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                    <span className="text-blue-800 dark:text-blue-300">Correct any errors in your work record promptly</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                    <span className="text-blue-800 dark:text-blue-300">Use our calculator to compare claiming strategies</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Strategic Planning</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                    <span className="text-green-800 dark:text-green-300">Consider your health, longevity, and financial needs</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                    <span className="text-green-800 dark:text-green-300">Coordinate claiming strategies with your spouse</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                    <span className="text-green-800 dark:text-green-300">Build additional savings to supplement benefits</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to estimate your Social Security benefits?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Social Security Calculator</strong> above to create your personalized benefit projection! For more retirement planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <Clock className="h-4 w-4 mr-1" />
                        Retirement Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/pension">
                        <Briefcase className="h-4 w-4 mr-1" />
                        Pension Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <DollarSign className="h-4 w-4 mr-1" />
                        401(k) Calculator
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