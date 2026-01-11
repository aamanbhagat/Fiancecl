"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Plus, Minus, Info, DollarSign, Percent, AlertCircle, Wallet } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from "next/link"
import type { ChartOptions } from 'chart.js'
import AverageReturnSchema from './schema';

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

interface ReturnPeriod {
  id: number
  value: number
}

interface Results {
  arithmeticMean: number
  geometricMean: number
  cagr: number
  totalGrowth: number
  finalValue: number
  adjustedReturn: number
}

export default function AverageReturnCalculator() {
  // Basic Inputs
  const [investmentName, setInvestmentName] = useState<string>("")
  const [initialInvestment, setInitialInvestment] = useState<number>(10000)
  const [periodType, setPeriodType] = useState<string>("annual")
  const [returnPeriods, setReturnPeriods] = useState<ReturnPeriod[]>([
    { id: 1, value: 10 },
    { id: 2, value: 15 },
    { id: 3, value: 8 },
    { id: 4, value: 12 },
    { id: 5, value: 9 }
  ])

  // Advanced Inputs
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("annual")
  const [inflationRate, setInflationRate] = useState<number>(2.5)
  const [includeInflation, setIncludeInflation] = useState<boolean>(false)
  const [taxRate, setTaxRate] = useState<number>(25)
  const [includeTax, setIncludeTax] = useState<boolean>(false)

  // Results
  const [results, setResults] = useState<Results>({
    arithmeticMean: 0,
    geometricMean: 0,
    cagr: 0,
    totalGrowth: 0,
    finalValue: 0,
    adjustedReturn: 0
  })

  // Input Validation Errors
  const [errors, setErrors] = useState<{ initialInvestment?: string; returnPeriods?: string }>({})

  // Calculate arithmetic mean return
  const calculateArithmeticMean = (returns: number[]): number => {
    if (returns.length === 0) return 0
    const sum = returns.reduce((acc, val) => acc + val, 0)
    return sum / returns.length
  }

  // Calculate geometric mean return
  const calculateGeometricMean = (returns: number[]): number => {
    if (returns.length === 0) return 0
    const product = returns.reduce((acc, val) => acc * (1 + val / 100), 1)
    return (Math.pow(product, 1 / returns.length) - 1) * 100
  }

  // Calculate CAGR
  const calculateCAGR = (initialValue: number, finalValue: number, periods: number): number => {
    if (initialValue <= 0 || periods <= 0) return 0
    return (Math.pow(finalValue / initialValue, 1 / periods) - 1) * 100
  }

  // Calculate final value
  const calculateFinalValue = (initial: number, returns: number[]): number => {
    return returns.reduce((acc, val) => acc * (1 + val / 100), initial)
  }

  // Validate inputs
  const validateInputs = (): boolean => {
    const newErrors: { initialInvestment?: string; returnPeriods?: string } = {}
    if (initialInvestment <= 0) {
      newErrors.initialInvestment = "Initial investment must be greater than 0"
    }
    if (returnPeriods.length === 0) {
      newErrors.returnPeriods = "At least one return period is required"
    }
    if (returnPeriods.some(period => isNaN(period.value))) {
      newErrors.returnPeriods = "All return periods must have valid numbers"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update calculations
  useEffect(() => {
    if (!validateInputs()) return

    const returnValues = returnPeriods.map(period => period.value)
    const arithmeticMean = calculateArithmeticMean(returnValues)
    const geometricMean = calculateGeometricMean(returnValues)
    const finalValue = calculateFinalValue(initialInvestment, returnValues)
    const cagr = calculateCAGR(initialInvestment, finalValue, returnValues.length)
    const totalGrowth = finalValue - initialInvestment

    let adjustedReturn = geometricMean
    if (includeInflation) {
      adjustedReturn = ((1 + geometricMean / 100) / (1 + inflationRate / 100) - 1) * 100
    }
    if (includeTax) {
      adjustedReturn = adjustedReturn * (1 - taxRate / 100)
    }

    setResults({
      arithmeticMean,
      geometricMean,
      cagr,
      totalGrowth,
      finalValue,
      adjustedReturn
    })
  }, [returnPeriods, initialInvestment, inflationRate, includeInflation, taxRate, includeTax])

  // Add new return period
  const addReturnPeriod = () => {
    const newId = returnPeriods.length > 0 ? Math.max(...returnPeriods.map(p => p.id)) + 1 : 1
    setReturnPeriods([...returnPeriods, { id: newId, value: 0 }])
  }

  // Remove return period
  const removeReturnPeriod = (id: number) => {
    if (returnPeriods.length > 1) {
      setReturnPeriods(returnPeriods.filter(period => period.id !== id))
    }
  }

  // Update return period value
  const updateReturnPeriod = (id: number, value: number) => {
    setReturnPeriods(returnPeriods.map(period =>
      period.id === id ? { ...period, value: isNaN(value) ? 0 : value } : period
    ))
  }

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

  const barChartData = useMemo(() => ({
    labels: ['Arithmetic Mean', 'Geometric Mean', 'CAGR'],
    datasets: [
      {
        label: 'Return Rate (%)',
        data: [results.arithmeticMean, results.geometricMean, results.cagr],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }), [results])

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => `${value}%`
        }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.formattedValue}%`
        }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => `${value.toFixed(1)}%`
      }
    }
  }

  const lineChartData = useMemo(() => ({
    labels: returnPeriods.map((_, index) => `Period ${index + 1}`),
    datasets: [
      {
        label: 'Period Returns',
        data: returnPeriods.map(period => period.value),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4,
        fill: false
      }
    ]
  }), [returnPeriods])

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => `${value}%`
        }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.formattedValue}%`
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
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height / 2)
    pdf.save(`${investmentName || 'average-return'}-results.pdf`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <AverageReturnSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-6 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Average Return <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
        Measure and compare investment performance with arithmetic mean, geometric mean, and CAGR metrics.
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
                      Enter your investment details and periodic returns to analyze performance metrics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Basic Inputs */}
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="investment-name">Investment Name (Optional)</Label>
                          <Input
                            id="investment-name"
                            placeholder="e.g., Stock Portfolio"
                            value={investmentName}
                            onChange={(e) => setInvestmentName(e.target.value)}
                            aria-describedby="investment-name-desc"
                          />
                          <p id="investment-name-desc" className="text-xs text-muted-foreground">
                            Name your investment for easy reference
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="initial-investment">Initial Investment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="initial-investment"
                              type="number"
                              className="pl-9"
                              value={initialInvestment}
                              min={1}
                              onChange={(e) => {
                                const value = Number(e.target.value)
                                setInitialInvestment(value > 0 ? value : 1)
                              }}
                              aria-describedby="initial-investment-error"
                            />
                          </div>
                          {errors.initialInvestment && (
                            <p id="initial-investment-error" className="text-xs text-red-500">
                              {errors.initialInvestment}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="period-type">Return Period Type</Label>
                        <Select value={periodType} onValueChange={setPeriodType}>
                          <SelectTrigger id="period-type" aria-label="Select return period type">
                            <SelectValue placeholder="Select period type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="annual">Annual</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Return Periods */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Return Periods</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addReturnPeriod}
                          className="flex items-center gap-2"
                          aria-label="Add new return period"
                        >
                          <Plus className="h-4 w-4" />
                          Add Period
                        </Button>
                      </div>
                      {errors.returnPeriods && (
                        <p className="text-xs text-red-500">{errors.returnPeriods}</p>
                      )}
                      <div className="space-y-4">
                        {returnPeriods.map((period, index) => (
                          <div key={period.id} className="flex items-center gap-4">
                            <div className="flex-1">
                              <Label htmlFor={`period-${period.id}`}>
                                Period {index + 1} Return (%)
                              </Label>
                              <div className="flex items-center gap-4 mt-2">
                                <Input
                                  id={`period-${period.id}`}
                                  type="number"
                                  value={period.value}
                                  onChange={(e) => updateReturnPeriod(period.id, Number(e.target.value))}
                                  aria-label={`Return for period ${index + 1}`}
                                />
                                {returnPeriods.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeReturnPeriod(period.id)}
                                    aria-label={`Remove period ${index + 1}`}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Advanced Options</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="compounding-frequency">Compounding Frequency</Label>
                          <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                            <SelectTrigger id="compounding-frequency" aria-label="Select compounding frequency">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="annual">Annual</SelectItem>
                              <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                                    Adjust returns for inflation to calculate real returns
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
                                    Calculate after-tax returns
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
                        <p className="text-sm text-muted-foreground">Final Value</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(results.finalValue)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="returns" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="returns">Returns</TabsTrigger>
                        <TabsTrigger value="chart">Analysis</TabsTrigger>
                      </TabsList>
                      <TabsContent value="returns" className="space-y-4">
                        <div className="grid gap-4">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Arithmetic Mean Return</p>
                              <p className="text-xs text-muted-foreground">Simple average of periodic returns</p>
                            </div>
                            <p className="font-bold">{formatPercent(results.arithmeticMean)}</p>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Geometric Mean Return</p>
                              <p className="text-xs text-muted-foreground">Accounts for compounding effects</p>
                            </div>
                            <p className="font-bold">{formatPercent(results.geometricMean)}</p>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">CAGR</p>
                              <p className="text-xs text-muted-foreground">Compound Annual Growth Rate</p>
                            </div>
                            <p className="font-bold">{formatPercent(results.cagr)}</p>
                          </div>
                          {(includeInflation || includeTax) && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10">
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium">Adjusted Return</p>
                                <p className="text-xs text-muted-foreground">
                                  After {includeInflation ? 'inflation' : ''}
                                  {includeInflation && includeTax ? ' and ' : ''}
                                  {includeTax ? 'tax' : ''}
                                </p>
                              </div>
                              <p className="font-bold">{formatPercent(results.adjustedReturn)}</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="chart" className="space-y-4">
                        <div className="h-[200px]">
                          <Bar data={barChartData} options={barChartOptions} />
                        </div>
                        <Separator />
                        <div className="h-[200px]">
                          <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Visualize return metrics and period-by-period performance
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Performance Insight</p>
                            <p className="text-sm text-muted-foreground">
                              {results.geometricMean > results.arithmeticMean
                                ? "High volatility in returns suggests the geometric mean is a more accurate measure of performance."
                                : "Consistent returns indicate similar arithmetic and geometric means, reflecting stable growth."}
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
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Master Your Investment Returns: A Complete Guide</h2>
                <p className="mt-3 text-muted-foreground text-lg">Unlock the power of investment performance analysis</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding the Average Return Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 id="what-is-calculator" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is the Average Return Calculator?</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                      <p>
                        The <strong>Average Return Calculator</strong> is an essential tool for investors seeking to evaluate the performance of their investments across multiple periods. By inputting periodic returns, initial investment amounts, and optional adjustments for inflation and taxes, it calculates critical metrics like the arithmetic mean, geometric mean, and Compound Annual Growth Rate (CAGR).
                      </p>
                      <p className="mt-2">
                        Key features include:
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Flexible input for initial investment and returns</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Adjustments for inflation and tax impacts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Interactive charts for visualizing performance</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>Export results as PDF for reporting</span>
                        </li>
                      </ul>
                      <p>
                        This calculator empowers investors to make informed decisions by providing a clear, data-driven view of investment growth and real returns.
                      </p>
                    </div>
                    <div className="md:w-[300px] h-[260px] flex-shrink-0">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                          <CardTitle className="text-sm font-medium text-center">Return Metrics Comparison</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full">
                            <Bar
                              data={{
                                labels: ['Arithmetic', 'Geometric', 'CAGR'],
                                datasets: [
                                  {
                                    label: 'Return (%)',
                                    data: [10.8, 10.72, 10.72], // Example based on default inputs
                                    backgroundColor: chartColors.primary,
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
                                    ticks: { callback: (value) => `${value}%` }
                                  }
                                }
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <h4 id="why-important" className="font-semibold text-xl mt-6">Why Measuring Returns Matters</h4>
                  <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Performance Clarity</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Understand how your investments grow over time.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Real-World Adjustments</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Factor in inflation and taxes for accurate net returns.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Investment Comparison</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Compare different assets to optimize your portfolio.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p>
                    In today’s dynamic markets, understanding your investment returns is crucial for achieving financial goals. This calculator provides the insights needed to navigate volatility and plan effectively.
                  </p>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Mastering the Average Return Calculator</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="step-by-step" className="font-bold text-xl mb-4">Step-by-Step Guide</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">1</span>
                          Input Investment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Enter initial investment (e.g., $10,000)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Select period type (e.g., annual)</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">2</span>
                          Add Return Periods
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Plus className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Input returns for each period (e.g., 10%)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Minus className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Adjust or remove periods as needed</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">3</span>
                          Customize Adjustments
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Percent className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Toggle inflation (e.g., 2.5%) and tax (e.g., 25%)</span>
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
                          Analyze Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Review return metrics</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <LineChart className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Explore performance charts</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <h3 id="results" className="font-bold text-xl mt-8 mb-4">Interpreting Your Results</h3>
                
                <div className="mb-6">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Metric</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Use Case</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Arithmetic Mean</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Simple average of returns</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Quick performance overview</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Geometric Mean</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Compounded return over time</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Volatile investments</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">CAGR</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Annualized growth rate</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Long-term comparisons</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Adjusted Return</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Net of inflation/taxes</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Real-world purchasing power</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Pro Tip:</strong> Focus on CAGR for long-term investments and adjusted returns to understand your real gains after inflation and taxes.
                  </p>
                </div>
              </div>

              {/* Key Factors Section */}
              <div className="mb-12" id="key-factors">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        <span className="text-2xl">Key Factors in Return Analysis</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Understanding the drivers of investment performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h3 id="arithmetic-vs-geometric" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        Arithmetic vs. Geometric Mean
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p>
                            The <strong>arithmetic mean</strong> is a simple average, useful for stable returns, but it can overstate performance in volatile markets. The <strong>geometric mean</strong> accounts for compounding, providing a more accurate measure for investments with fluctuating returns.
                          </p>
                          <ul className="mt-4 space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>Arithmetic:</strong> Best for short-term, stable returns</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>Geometric:</strong> Ideal for long-term, volatile investments</span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                              <strong>Example:</strong> Returns of 50% and -50% yield an arithmetic mean of 0% but a geometric mean of -6.07%, reflecting the true loss.
                            </p>
                          </div>
                        </div>
                        
                        <div className="h-[220px]">
                          <h4 className="text-center text-sm font-medium mb-2">Arithmetic vs. Geometric</h4>
                          <Bar
                            data={{
                              labels: ['Arithmetic', 'Geometric'],
                              datasets: [
                                {
                                  label: 'Return (%)',
                                  data: [0, -6.07],
                                  backgroundColor: ['rgba(124, 58, 237, 0.8)', 'rgba(20, 184, 166, 0.8)'],
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { legend: { display: false } },
                              scales: { y: { ticks: { callback: (value) => `${value}%` } } }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-8" />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 id="cagr" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                          <Percent className="h-5 w-5" />
                          Compound Annual Growth Rate (CAGR)
                        </h3>
                        <p>
                          <strong>CAGR</strong> smooths out periodic fluctuations to provide a consistent annual growth rate, making it ideal for comparing investments over different time frames.
                        </p>
                        
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Initial Value</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Final Value</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Years</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">CAGR</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$10,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$16,105</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">5</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">10%</td>
                              </tr>
                              <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$10,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$25,937</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">10</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">10%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div>
                        <h3 id="inflation-tax" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <Percent className="h-5 w-5" />
                          Inflation and Tax Impact
                        </h3>
                        <p>
                          <strong>Inflation</strong> erodes purchasing power, while <strong>taxes</strong> reduce net returns. Adjusting for these factors provides a clearer picture of real investment growth.
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">Real Return Calculation</h4>
                          <div className="mt-3">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div className="font-medium text-blue-700 dark:text-blue-400">Nominal Return</div>
                              <div className="text-blue-600 dark:text-blue-500">10%</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Inflation</div>
                              <div className="text-blue-600 dark:text-blue-500">2.5%</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Tax (25%)</div>
                              <div className="text-blue-600 dark:text-blue-500">2.5%</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Real Return</div>
                              <div className="text-blue-600 dark:text-blue-500">5%</div>
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
                  Investment Market Insights
                </h2>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">S&P 500 CAGR</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">9.8%</p>
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">1926-2023</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                          <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">Bond CAGR</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">5.3%</p>
                        <p className="mt-1 text-sm text-green-600 dark:text-green-500">1926-2023</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                          <RefreshCw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Market Volatility</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">15.2%</p>
                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">S&P 500 Std Dev</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                          <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Avg. Inflation</h3>
                        <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">3.1%</p>
                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">1913-2023</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="volatility-impact" className="text-xl font-bold mb-4">Impact of Volatility</h3>
                <Card className="bg-white dark:bg-gray-900 mb-4">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p>
                          <strong>Volatility</strong> significantly affects investment returns, particularly when measured over multiple periods. High volatility can lead to a lower geometric mean compared to the arithmetic mean, highlighting the importance of considering compounding effects.
                        </p>
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Volatility Example</h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">Year 1 Return</span>
                              <span className="font-medium text-red-700 dark:text-red-400">50%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">Year 2 Return</span>
                              <span className="font-medium text-red-700 dark:text-red-400">-50%</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-sm text-red-800 dark:text-red-300">Geometric Mean</span>
                              <span className="text-red-800 dark:text-red-300">-6.07%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-[280px]">
                        <h4 className="text-center text-sm font-medium mb-3">Return Volatility Trend</h4>
                        <Line
                          data={{
                            labels: ['Year 1', 'Year 2'],
                            datasets: [
                              {
                                label: 'Returns',
                                data: [50, -50],
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
                                ticks: { callback: (value) => `${value}%` }
                              }
                            },
                            plugins: { legend: { display: false } }
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
                      <p className="font-medium text-amber-800 dark:text-amber-300">Managing Volatility</p>
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                        Diversify your portfolio across asset classes to reduce volatility and stabilize returns over time.
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
                      Path to Investment Success
                    </CardTitle>
                    <CardDescription>
                      Leverage data-driven insights for smarter investing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      The <strong>Average Return Calculator</strong> transforms complex performance metrics into actionable insights. By understanding arithmetic mean, geometric mean, CAGR, and adjusted returns, you can optimize your investment strategy and achieve your financial goals.
                    </p>
                    
                    <p className="mt-4" id="next-steps">
                      Take action today:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Immediate Steps</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                            <span className="text-blue-800 dark:text-blue-300">Input your investment data</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                            <span className="text-blue-800 dark:text-blue-300">Adjust for inflation and taxes</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                            <span className="text-blue-800 dark:text-blue-300">Compare metrics</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Long-Term Strategy</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                            <span className="text-green-800 dark:text-green-300">Monitor performance regularly</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                            <span className="text-green-800 dark:text-green-300">Diversify investments</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                            <span className="text-green-800 dark:text-green-300">Rebalance portfolio</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Start Analyzing Today</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use the <strong>Average Return Calculator</strong> to evaluate your investments. Explore related tools:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/investment">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Investment Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/compound-interest">
                                <Percent className="h-4 w-4 mr-1" />
                                Compound Interest
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/roi">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                ROI Calculator
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
      <SaveCalculationButton calculatorType="average-return" inputs={{}} results={{}} />
      </main>
      <SiteFooter />
    </div>
  )
}