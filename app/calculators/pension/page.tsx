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
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Briefcase, Clock, Calendar, Percent } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import PensionSchema from './schema';

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

export default function PensionCalculator() {
  // Personal & Employment Details
  const [yearsOfService, setYearsOfService] = useState(30)
  const [currentAge, setCurrentAge] = useState(45)
  const [retirementAge, setRetirementAge] = useState(65)
  const [currentSalary, setCurrentSalary] = useState(60000)
  const [salaryGrowthRate, setSalaryGrowthRate] = useState(2)
  const [isFullyVested, setIsFullyVested] = useState(true)
  
  // Pension Plan Specifics
  const [benefitMultiplier, setBenefitMultiplier] = useState(1.5)
  const [includeCOLA, setIncludeCOLA] = useState(true)
  const [colaRate, setColaRate] = useState(2)
  const [finalAverageYears, setFinalAverageYears] = useState(3)
  const [survivorBenefit, setSurvivorBenefit] = useState(100)
  
  // Additional Inputs
  const [lifeExpectancy, setLifeExpectancy] = useState(85)
  const [employeeContribution, setEmployeeContribution] = useState(5)
  const [employerContribution, setEmployerContribution] = useState(8)
  
  // Results State
  const [monthlyPension, setMonthlyPension] = useState(0)
  const [annualPension, setAnnualPension] = useState(0)
  const [totalLifetimeBenefit, setTotalLifetimeBenefit] = useState(0)
  const [lumpSumValue, setLumpSumValue] = useState(0)
  const [projectedFinalSalary, setProjectedFinalSalary] = useState(0)
  const [benefitProjections, setBenefitProjections] = useState<{
    age: number;
    pension: number;
    cumulative: number;
  }[]>([])

  // Calculate pension benefits
  useEffect(() => {
    // Calculate projected final salary with growth
    const yearsUntilRetirement = retirementAge - currentAge
    const finalSalary = currentSalary * Math.pow(1 + salaryGrowthRate / 100, yearsUntilRetirement)
    setProjectedFinalSalary(finalSalary)
    
    // Calculate final average salary (assuming steady growth)
    const finalAverageSalary = finalSalary * (1 - (finalAverageYears - 1) * (salaryGrowthRate / 100) / 2)
    
    // Calculate annual pension benefit
    const baseAnnualPension = yearsOfService * (benefitMultiplier / 100) * finalAverageSalary
    setAnnualPension(baseAnnualPension)
    setMonthlyPension(baseAnnualPension / 12)
    
    // Calculate lifetime benefit with COLA
    let totalBenefit = 0
    const projections = []
    const retirementYears = lifeExpectancy - retirementAge
    
    for (let year = 0; year < retirementYears; year++) {
      const yearlyBenefit = baseAnnualPension * Math.pow(1 + (includeCOLA ? colaRate : 0) / 100, year)
      totalBenefit += yearlyBenefit
      
      projections.push({
        age: retirementAge + year,
        pension: yearlyBenefit,
        cumulative: totalBenefit
      })
    }
    
    setTotalLifetimeBenefit(totalBenefit)
    setBenefitProjections(projections)
    
    // Calculate lump sum value (simplified)
    const discountRate = 0.04 // 4% discount rate
    const presentValue = totalBenefit / Math.pow(1 + discountRate, retirementYears / 2)
    setLumpSumValue(presentValue)
    
  }, [
    yearsOfService,
    currentAge,
    retirementAge,
    currentSalary,
    salaryGrowthRate,
    benefitMultiplier,
    includeCOLA,
    colaRate,
    finalAverageYears,
    lifeExpectancy
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

  // Benefit breakdown chart
  const pieChartData = {
    labels: ['Base Pension', 'COLA Increases', 'Survivor Benefits'],
    datasets: [{
      data: [
        annualPension,
        includeCOLA ? totalLifetimeBenefit - (annualPension * (lifeExpectancy - retirementAge)) : 0,
        (survivorBenefit / 100) * annualPension
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
          return ((value / totalLifetimeBenefit) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Benefit projection chart
  const generateProjectionChart = () => {
    return {
      labels: benefitProjections.map(p => `Age ${p.age}`),
      datasets: [
        {
          label: 'Annual Pension',
          data: benefitProjections.map(p => p.pension),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Cumulative Benefits',
          data: benefitProjections.map(p => p.cumulative),
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

  // Contribution comparison chart
  const contributionData = {
    labels: ['Employee', 'Employer'],
    datasets: [
      {
        label: 'Annual Contributions',
        data: [
          (currentSalary * employeeContribution) / 100,
          (currentSalary * employerContribution) / 100
        ],
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
    pdf.save('pension-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PensionSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Pension <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Estimate your retirement income from your pension plan based on your years of service, salary history, and plan benefits.
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
                    <CardTitle>Enter Pension Details</CardTitle>
                    <CardDescription>
                      Provide information about your employment history and pension plan to calculate your retirement benefits.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Personal & Employment Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Personal & Employment Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="current-salary">Current Annual Salary</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="current-salary"
                              type="number"
                              className="pl-9"
                              value={currentSalary}
                              onChange={(e) => setCurrentSalary(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="years-service">Years of Service</Label>
                          <Input
                            id="years-service"
                            type="number"
                            value={yearsOfService}
                            onChange={(e) => setYearsOfService(Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="current-age">Current Age</Label>
                          <Input
                            id="current-age"
                            type="number"
                            value={currentAge}
                            onChange={(e) => setCurrentAge(Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retirement-age">Planned Retirement Age</Label>
                          <Input
                            id="retirement-age"
                            type="number"
                            value={retirementAge}
                            onChange={(e) => setRetirementAge(Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="salary-growth">Annual Salary Growth</Label>
                            <span className="text-sm text-muted-foreground">{salaryGrowthRate}%</span>
                          </div>
                          <Slider
                            id="salary-growth"
                            min={0}
                            max={5}
                            step={0.1}
                            value={[salaryGrowthRate]}
                            onValueChange={(value) => setSalaryGrowthRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="vested-status">Fully Vested</Label>
                            <Switch
                              id="vested-status"
                              checked={isFullyVested}
                              onCheckedChange={setIsFullyVested}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pension Plan Specifics */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Pension Plan Specifics</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="benefit-multiplier">Benefit Multiplier</Label>
                            <span className="text-sm text-muted-foreground">{benefitMultiplier}%</span>
                          </div>
                          <Slider
                            id="benefit-multiplier"
                            min={0.5}
                            max={3}
                            step={0.1}
                            value={[benefitMultiplier]}
                            onValueChange={(value) => setBenefitMultiplier(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="final-average-years">Final Average Salary Years</Label>
                          <Select 
                            value={String(finalAverageYears)} 
                            onValueChange={(value) => setFinalAverageYears(Number(value))}
                          >
                            <SelectTrigger id="final-average-years">
                              <SelectValue placeholder="Select years" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Year</SelectItem>
                              <SelectItem value="3">3 Years</SelectItem>
                              <SelectItem value="5">5 Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="cola-toggle">Include COLA</Label>
                            <Switch
                              id="cola-toggle"
                              checked={includeCOLA}
                              onCheckedChange={setIncludeCOLA}
                            />
                          </div>
                          {includeCOLA && (
                            <div className="flex items-center justify-between">
                              <Label htmlFor="cola-rate">COLA Rate</Label>
                              <span className="text-sm text-muted-foreground">{colaRate}%</span>
                            </div>
                          )}
                          {includeCOLA && (
                            <Slider
                              id="cola-rate"
                              min={0}
                              max={4}
                              step={0.1}
                              value={[colaRate]}
                              onValueChange={(value) => setColaRate(value[0])}
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="survivor-benefit">Survivor Benefit</Label>
                            <span className="text-sm text-muted-foreground">{survivorBenefit}%</span>
                          </div>
                          <Slider
                            id="survivor-benefit"
                            min={0}
                            max={100}
                            step={25}
                            value={[survivorBenefit]}
                            onValueChange={(value) => setSurvivorBenefit(value[0])}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="life-expectancy">Life Expectancy</Label>
                          <Input
                            id="life-expectancy"
                            type="number"
                            value={lifeExpectancy}
                            onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="employee-contribution">Employee Contribution</Label>
                            <span className="text-sm text-muted-foreground">{employeeContribution}%</span>
                          </div>
                          <Slider
                            id="employee-contribution"
                            min={0}
                            max={15}
                            step={0.5}
                            value={[employeeContribution]}
                            onValueChange={(value) => setEmployeeContribution(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="employer-contribution">Employer Contribution</Label>
                            <span className="text-sm text-muted-foreground">{employerContribution}%</span>
                          </div>
                          <Slider
                            id="employer-contribution"
                            min={0}
                            max={15}
                            step={0.5}
                            value={[employerContribution]}
                            onValueChange={(value) => setEmployerContribution(value[0])}
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
                      <p className="text-sm text-muted-foreground">Monthly Pension</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(monthlyPension)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(annualPension)} annually
                      </p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="projections">Projections</TabsTrigger>
                        <TabsTrigger value="contributions">Contributions</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Benefit Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Final Average Salary</span>
                              <span className="font-medium">{formatCurrency(projectedFinalSalary)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Annual Pension</span>
                              <span className="font-medium">{formatCurrency(annualPension)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Monthly Pension</span>
                              <span className="font-medium">{formatCurrency(monthlyPension)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Lump Sum Value</span>
                              <span className="font-medium">{formatCurrency(lumpSumValue)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Lifetime Benefit</span>
                              <span>{formatCurrency(totalLifetimeBenefit)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="projections" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateProjectionChart()} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Projection Details</h4>
                          <p className="text-sm text-muted-foreground">
                            Showing projected pension benefits from retirement age {retirementAge} to {lifeExpectancy}, 
                            {includeCOLA ? ` including ${colaRate}% annual COLA adjustments.` : ' without COLA adjustments.'}
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="contributions" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={contributionData} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Annual Contributions</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Employee ({employeeContribution}%)</span>
                              <span className="font-medium">
                                {formatCurrency((currentSalary * employeeContribution) / 100)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Employer ({employerContribution}%)</span>
                              <span className="font-medium">
                                {formatCurrency((currentSalary * employerContribution) / 100)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Annual Contributions</span>
                              <span>
                                {formatCurrency((currentSalary * (employeeContribution + employerContribution)) / 100)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Key Assumptions */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Key Assumptions</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• {salaryGrowthRate}% annual salary growth</li>
                              <li>• {finalAverageYears}-year final average salary</li>
                              <li>• {benefitMultiplier}% benefit multiplier</li>
                              {includeCOLA && <li>• {colaRate}% annual COLA increase</li>}
                              <li>• Life expectancy to age {lifeExpectancy}</li>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Retirement Planning</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Your Pension: A Comprehensive Guide</h2>
        <p className="mt-3 text-muted-foreground text-lg">Everything you need to know about maximizing your retirement benefits</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Pension Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-pension" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is a Pension Plan?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                A <strong>Pension Plan</strong> is a retirement arrangement where your employer promises to pay you a defined benefit for life after you retire. Unlike defined contribution plans like 401(k)s, traditional pensions guarantee a specific monthly income based on a formula that typically considers:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Years of service with your employer</span>
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Your salary history (often final average salary)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>A benefit multiplier (percentage per year of service)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Your age at retirement</span>
                </li>
              </ul>
              <p>
                Pension plans offer predictable retirement income and shift investment risk to employers, providing retirement security that many other retirement vehicles cannot match.
              </p>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                  <CardTitle className="text-sm font-medium text-center">Pension vs. 401(k) Growth</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Line 
                      data={{
                        labels: ['Year 0', 'Year 10', 'Year 20', 'Year 30'],
                        datasets: [
                          {
                            label: 'Defined Benefit Pension',
                            data: [0, 250000, 500000, 750000],
                            borderColor: 'rgba(99, 102, 241, 0.8)',
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                          },
                          {
                            label: '401(k) (Market Dependent)',
                            data: [0, 180000, 450000, 820000],
                            borderColor: 'rgba(20, 184, 166, 0.8)',
                            backgroundColor: 'rgba(20, 184, 166, 0.2)',
                            borderDash: [5, 5]
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
          
          <h4 id="types-of-pensions" className="font-semibold text-xl mt-6">Types of Pension Plans</h4>
          <div className="mt-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Defined Benefit Plans</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Traditional pension that guarantees a specific monthly benefit upon retirement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Cash Balance Plans</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Hybrid plan with defined benefit features but expressed as an account balance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Government Pensions</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Plans for federal, state, or local government employees with unique features</p>
                </div>
              </div>
            </div>
          </div>
          
          <p>
            Understanding your pension plan is crucial for effective retirement planning. While employers handle most investment decisions, you still need to make informed choices about when to retire, whether to take lump-sum options, and how to coordinate pension benefits with other retirement income sources.
          </p>
        </CardContent>
      </Card>

      {/* How to Use Section */}
      <div className="mb-12" id="how-to-use">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Understanding Your Pension Benefits</h2>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="pension-formula" className="font-bold text-xl mb-4">The Pension Calculation Formula</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">The Basic Formula</h4>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-center font-bold text-lg text-blue-800 dark:text-blue-300">
                  Annual Pension = Years of Service × Benefit Multiplier × Final Average Salary
                </p>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Example Calculation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm">Years of Service</span>
                    <span className="font-medium">30 years</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm">Benefit Multiplier</span>
                    <span className="font-medium">1.5% per year</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm">Final Average Salary (3 years)</span>
                    <span className="font-medium">$75,000</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 font-semibold">
                    <span>Annual Pension Benefit</span>
                    <span>$33,750</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 font-semibold">
                    <span>Monthly Pension Benefit</span>
                    <span>$2,812.50</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Key Components Explained</h4>
              
              <div className="space-y-4">
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      Years of Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>
                      Total time employed under the pension plan. More years means higher benefits. Some plans have maximum service year caps (typically 30-40 years).
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Percent className="h-4 w-4 text-blue-600" />
                      Benefit Multiplier
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>
                      The percentage of your salary earned as pension per year of service. Typically ranges from 1% to 2.5% depending on the generosity of the plan.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      Final Average Salary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>
                      Average of your highest-earning consecutive years (typically 3-5 years). Strategic career planning can significantly impact this number.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <h3 id="factors-affecting" className="font-bold text-xl mt-8 mb-4">Factors Affecting Your Pension Value</h3>
        
        <div className="mb-6">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Factor</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Impact on Benefits</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Strategy Considerations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Retirement Age</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Early retirement typically reduces benefits by 3-6% per year</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Consider working until normal retirement age if financially possible</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Vesting Schedule</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">No benefits until vested; partial vesting in some plans</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Avoid job changes just before vesting milestones</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">COLA Provisions</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">With COLA: maintains purchasing power; Without: benefits erode over time</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Plans with COLA are significantly more valuable in the long run</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Survivor Benefits</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Higher survivor benefits reduce initial payments</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Consider spouse's life expectancy and other income sources</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Payment Options</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Lump sum vs. annuity affects lifetime value</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Analyze interest rates and investment capabilities before choosing</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Pro Tip:</strong> Request a pension benefit estimate from your plan administrator 5-10 years before your planned retirement. This gives you time to adjust your strategy if the projected benefit falls short of your retirement income needs.
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
                <span className="text-2xl">Maximizing Your Pension Benefits</span>
              </div>
            </CardTitle>
            <CardDescription>
              Strategic approaches to increase your lifetime pension value
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="final-salary" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Optimizing Your Final Average Salary
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    Since most pension formulas are based on your final average salary (FAS), strategic career and compensation planning in your final years can significantly increase your lifetime benefits.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span>Time promotions and raises to fall within your FAS period</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span>Maximize allowable overtime during FAS years if included in calculations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span>Defer compensated leave payouts to FAS period if permitted</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      <strong>Example Impact:</strong> Increasing your final average salary by just $5,000
                    </p>
                    <ul className="text-sm mt-1 text-purple-700 dark:text-purple-400">
                      <li>30 years of service with 1.5% multiplier</li>
                      <li>Additional annual pension: $2,250 ($5,000 × 30 × 1.5%)</li>
                      <li>Over 20 years of retirement: $45,000 more in benefits</li>
                    </ul>
                  </div>
                </div>
                
                <div className="h-[250px]">
                  <h4 className="text-center text-sm font-medium mb-2">Final Salary Impact on Pension Value</h4>
                  <Bar 
                    data={{
                      labels: ['$70,000', '$75,000', '$80,000', '$85,000', '$90,000'],
                      datasets: [
                        {
                          label: 'Annual Pension (30 years service, 1.5%)',
                          data: [31500, 33750, 36000, 38250, 40500],
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
                <h3 id="retirement-timing" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Strategic Retirement Timing
                </h3>
                <p>Choosing when to retire can dramatically affect your lifetime pension benefits. Many pension plans offer incentives for retiring at specific milestones.</p>
                
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Retirement Age</th>
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Adjustment Factor</th>
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Example Benefit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">62 (Early)</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">-15%</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$28,687</td>
                      </tr>
                      <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">65 (Normal)</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">0%</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$33,750</td>
                      </tr>
                      <tr>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">67 (Delayed)</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">+8%</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$36,450</td>
                      </tr>
                      <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">70 (Maximum)</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">+24%</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$41,850</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">*Based on $75,000 FAS, 30 years service, 1.5% multiplier</p>
              </div>
              
              <div>
                <h3 id="cola-benefits" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  The COLA Advantage
                </h3>
                <p>
                  Cost of Living Adjustments (COLAs) protect your pension against inflation, maintaining purchasing power throughout retirement. Even a modest COLA significantly increases lifetime value.
                </p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">Long-term COLA Impact</h4>
                  <div className="mt-3">
                    <p className="text-sm text-blue-600 dark:text-blue-500">Starting annual pension: $35,000</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
                      <div className="font-medium text-blue-700 dark:text-blue-400">Without COLA:</div>
                      <div className="font-medium text-blue-700 dark:text-blue-400">With 2% COLA:</div>
                      <div className="text-blue-600 dark:text-blue-500">After 10 years: $35,000</div>
                      <div className="text-blue-600 dark:text-blue-500">After 10 years: $42,657</div>
                      <div className="text-blue-600 dark:text-blue-500">After 20 years: $35,000</div>
                      <div className="text-blue-600 dark:text-blue-500">After 20 years: $52,030</div>
                      <div className="font-bold text-blue-800 dark:text-blue-300">20-year total: $700,000</div>
                      <div className="font-bold text-blue-800 dark:text-blue-300">20-year total: $873,165</div>
                    </div>
                    <p className="mt-3 text-xs text-blue-700 dark:text-blue-400">Additional lifetime value with COLA: $173,165</p>
                  </div>
                </div>
                
                <h3 id="survivor-options" className="text-xl font-bold text-green-700 dark:text-green-400 mt-6 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Survivor Benefit Considerations
                </h3>
                <p className="mb-4">
                  Choosing the right survivor benefit option balances higher current income against financial protection for your spouse after your death.
                </p>
                <div className="h-[170px]">
                  <Bar 
                    data={{
                      labels: ['Single Life', '50% Survivor', '75% Survivor', '100% Survivor'],
                      datasets: [{
                        label: 'Monthly Pension Amount',
                        data: [3375, 3072, 2934, 2802],
                        backgroundColor: [
                          'rgba(16, 185, 129, 0.7)',
                          'rgba(16, 185, 129, 0.75)',
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(16, 185, 129, 0.85)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pension Trends Section with Statistics */}
      <div className="mb-12" id="pension-statistics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Pension Trends and Statistics
        </h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Pension Coverage</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">21%</p>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">of workers have defined benefit plans</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                  <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">Average COLA Rate</h3>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">1.7%</p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">Annual adjustment (2025)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Average Retirement Age</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">64.6</p>
                <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">For pension plan participants</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                  <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Average Monthly Benefit</h3>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">$1,895</p>
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">Private sector defined benefit plans</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 id="pension-challenges" className="text-xl font-bold mb-4">Common Pension Challenges</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </span>
                <CardTitle className="text-base">Underfunded Plans</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Many pension plans face funding shortfalls, with the 100 largest corporate plans averaging only 87% funding status, creating risk of reduced benefits.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </span>
                <CardTitle className="text-base">Vesting Requirements</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Long vesting periods (often 5 years) conflict with modern job mobility, causing many workers to leave before qualifying for pension benefits.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <Percent className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </span>
                <CardTitle className="text-base">Inadequate COLAs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Many plans offer limited or no inflation protection, leading to significant loss of purchasing power over a 20-30 year retirement period.
              </p>
            </CardContent>
          </Card>
        </div>

        <h3 id="inflation-impact" className="text-xl font-bold mb-4">Inflation Impact on Pension Benefits</h3>
        <Card className="bg-white dark:bg-gray-900 mb-4">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p>
                  <strong>Inflation</strong> is particularly concerning for pensioners on fixed incomes. Without adequate COLAs, the purchasing power of pension benefits can deteriorate significantly over time.
                </p>
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Purchasing Power Erosion</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-700 dark:text-red-400">$3,000 monthly pension today</span>
                      <span className="font-medium text-red-700 dark:text-red-400">$3,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-700 dark:text-red-400">After 10 years (3% inflation)</span>
                      <span className="font-medium text-red-700 dark:text-red-400">$2,232</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-700 dark:text-red-400">After 20 years (3% inflation)</span>
                      <span className="font-medium text-red-700 dark:text-red-400">$1,661</span>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-sm text-red-800 dark:text-red-300">After 30 years (3% inflation)</span>
                      <span className="text-red-800 dark:text-red-300">$1,236</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="h-[280px]">
                <h4 className="text-center text-sm font-medium mb-3">Pension Value With vs. Without COLA</h4>
                <Line 
                  data={{
                    labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
                    datasets: [
                      {
                        label: 'With 2% COLA',
                        data: [35000, 37800, 42657, 47080, 52030, 57444, 63450],
                        borderColor: 'rgba(99, 102, 241, 0.8)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      },
                      {
                        label: 'No COLA (Real Value)',
                        data: [35000, 30188, 26031, 22444, 19346, 16683, 14384],
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
              <p className="font-medium text-amber-800 dark:text-amber-300">Supplementing Pensions for Inflation Protection</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                If your pension lacks adequate COLA provisions, consider building a diversified retirement income strategy that includes growth-oriented investments like stock index funds, Treasury Inflation-Protected Securities (TIPS), and Real Estate Investment Trusts (REITs) to help maintain purchasing power throughout retirement.
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
              Making the Most of Your Pension
            </CardTitle>
            <CardDescription>
              Key strategies for optimizing your retirement security
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Pension benefits</strong> can provide invaluable retirement security through guaranteed lifetime income. By understanding how your specific pension plan works, you can make informed decisions that significantly enhance your financial security throughout retirement. Remember that your pension is just one component of a comprehensive retirement strategy that should include Social Security, personal savings, and potentially part-time work.
            </p>
            
            <p className="mt-4" id="next-steps">
              Take these important steps to maximize your pension benefits:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Near-Term Actions</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                    <span className="text-blue-800 dark:text-blue-300">Request current and projected benefit statements</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                    <span className="text-blue-800 dark:text-blue-300">Attend pre-retirement workshops offered by your plan</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                    <span className="text-blue-800 dark:text-blue-300">Consult with a financial advisor about pension options</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Long-Term Strategy</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                    <span className="text-green-800 dark:text-green-300">Develop a retirement income plan that integrates all sources</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                    <span className="text-green-800 dark:text-green-300">Build additional savings to supplement pension income</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                    <span className="text-green-800 dark:text-green-300">Consider part-time work to bridge any income gaps</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to estimate your pension benefits?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Pension Calculator</strong> above to create your personalized retirement projection! For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <Briefcase className="h-4 w-4 mr-1" />
                        401(k) Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <Clock className="h-4 w-4 mr-1" />
                        Retirement Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/social-security">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Social Security Calculator
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