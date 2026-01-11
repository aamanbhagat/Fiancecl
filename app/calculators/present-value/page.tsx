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
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import PresentValueSchema from './schema';

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

interface CashFlow {
  id: number
  value: number
  year: number
}

interface Results {
  presentValue: number
  discountAmount: number
  effectiveRate: number
  realPresentValue: number
  afterTaxPresentValue: number
  periodValues: number[]
  comparisonRates: number[]
}

export default function PresentValueCalculator() {
  // Basic Inputs
  const [futureValue, setFutureValue] = useState<number>(100000)
  const [discountRate, setDiscountRate] = useState<number>(8)
  const [timePeriod, setTimePeriod] = useState<number>(5)
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("annual")
  
  // Additional Cash Flows
  const [includeCashFlows, setIncludeCashFlows] = useState<boolean>(false)
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([
    { id: 1, value: 20000, year: 1 },
    { id: 2, value: 25000, year: 2 },
    { id: 3, value: 30000, year: 3 },
    { id: 4, value: 35000, year: 4 },
    { id: 5, value: 40000, year: 5 }
  ])

  // Advanced Options
  const [inflationRate, setInflationRate] = useState<number>(2.5)
  const [includeInflation, setIncludeInflation] = useState<boolean>(false)
  const [taxRate, setTaxRate] = useState<number>(25)
  const [includeTax, setIncludeTax] = useState<boolean>(false)

  // Results
  const [results, setResults] = useState<Results>({
    presentValue: 0,
    discountAmount: 0,
    effectiveRate: 0,
    realPresentValue: 0,
    afterTaxPresentValue: 0,
    periodValues: [],
    comparisonRates: []
  })

  // Input Validation Errors
  const [errors, setErrors] = useState<{ futureValue?: string; timePeriod?: string; cashFlows?: string }>({})

  // Calculate number of compounding periods per year
  const getCompoundingPeriods = (frequency: string): number => {
    switch (frequency) {
      case "annual": return 1
      case "semi-annual": return 2
      case "quarterly": return 4
      case "monthly": return 12
      case "daily": return 365
      default: return 1
    }
  }

  // Calculate Present Value for a single future value
  const calculatePresentValue = (fv: number, rate: number, time: number, n: number): number => {
    if (fv <= 0 || time <= 0 || rate < 0) return 0
    return fv / Math.pow(1 + rate / (100 * n), n * time)
  }

  // Calculate Present Value of multiple cash flows
  const calculateMultipleCashFlows = (flows: CashFlow[], rate: number, n: number): number => {
    return flows.reduce((acc, flow) => {
      if (flow.value <= 0 || flow.year <= 0) return acc
      return acc + calculatePresentValue(flow.value, rate, flow.year, n)
    }, 0)
  }

  // Validate inputs
  const validateInputs = (): boolean => {
    const newErrors: { futureValue?: string; timePeriod?: string; cashFlows?: string } = {}
    if (futureValue <= 0) {
      newErrors.futureValue = "Future value must be greater than 0"
    }
    if (timePeriod <= 0) {
      newErrors.timePeriod = "Time period must be greater than 0"
    }
    if (includeCashFlows && cashFlows.some(cf => cf.value <= 0 || cf.year <= 0)) {
      newErrors.cashFlows = "All cash flows must have positive values and years"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update calculations
  useEffect(() => {
    if (!validateInputs()) return

    const n = getCompoundingPeriods(compoundingFrequency)
    let baseRate = discountRate

    // Adjust for inflation if enabled
    if (includeInflation) {
      baseRate = ((1 + discountRate / 100) / (1 + inflationRate / 100) - 1) * 100
    }

    // Calculate present value
    let pv = calculatePresentValue(futureValue, baseRate, timePeriod, n)
    if (includeCashFlows) {
      pv += calculateMultipleCashFlows(cashFlows, baseRate, n)
    }

    // Calculate after-tax present value if enabled
    const afterTaxPV = includeTax ? pv * (1 - taxRate / 100) : pv

    // Calculate period values for chart
    const periodValues = Array.from({ length: timePeriod + 1 }, (_, i) => {
      return calculatePresentValue(futureValue, baseRate, i, n)
    })

    // Calculate comparison rates for sensitivity analysis
    const comparisonRates = Array.from({ length: 5 }, (_, i) => {
      const rate = baseRate + (i - 2) * 2 // -4%, -2%, 0%, +2%, +4% from base rate
      return calculatePresentValue(futureValue, rate, timePeriod, n)
    })

    setResults({
      presentValue: pv,
      discountAmount: futureValue - pv,
      effectiveRate: (Math.pow(1 + baseRate / (100 * n), n) - 1) * 100,
      realPresentValue: includeInflation ? pv : 0,
      afterTaxPresentValue: afterTaxPV,
      periodValues,
      comparisonRates
    })
  }, [
    futureValue,
    discountRate,
    timePeriod,
    compoundingFrequency,
    includeCashFlows,
    cashFlows,
    inflationRate,
    includeInflation,
    taxRate,
    includeTax
  ])

  // Add new cash flow
  const addCashFlow = () => {
    const newId = cashFlows.length > 0 ? Math.max(...cashFlows.map(cf => cf.id)) + 1 : 1
    const newYear = cashFlows.length > 0 ? Math.max(...cashFlows.map(cf => cf.year)) + 1 : 1
    setCashFlows([...cashFlows, { id: newId, value: 0, year: newYear }])
  }

  // Remove cash flow
  const removeCashFlow = (id: number) => {
    if (cashFlows.length > 1) {
      setCashFlows(cashFlows.filter(cf => cf.id !== id))
    }
  }

  // Update cash flow value
  const updateCashFlow = (id: number, value: number) => {
    setCashFlows(cashFlows.map(cf =>
      cf.id === id ? { ...cf, value: value > 0 ? value : 0 } : cf
    ))
  }

  // Update cash flow year
  const updateCashFlowYear = (id: number, year: number) => {
    setCashFlows(cashFlows.map(cf =>
      cf.id === id ? { ...cf, year: year > 0 ? year : 1 } : cf
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

  const timeValueChartData = useMemo(() => ({
    labels: Array.from({ length: timePeriod + 1 }, (_, i) => `Year ${i}`),
    datasets: [
      {
        label: 'Present Value',
        data: results.periodValues,
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4,
        fill: false
      }
    ]
  }), [results.periodValues, timePeriod])

  const timeValueChartOptions: ChartOptions<'line'> = {
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
          label: (context) => `$${context.parsed.y.toLocaleString()}`
        }
      }
    }
  }

  const sensitivityChartData = useMemo(() => ({
    labels: Array.from({ length: 5 }, (_, i) => `${discountRate + (i - 2) * 2}%`),
    datasets: [
      {
        label: 'Present Value at Different Rates',
        data: results.comparisonRates,
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }), [results.comparisonRates, discountRate])

  const sensitivityChartOptions: ChartOptions<'bar'> = {
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
          label: (context) => `$${context.parsed.y.toLocaleString()}`
        }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => `$${value.toLocaleString()}`
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
    pdf.save('present-value-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PresentValueSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Present Value <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Determine the current worth of future money with precision, factoring in discount rates, inflation, and taxes.
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
                    <CardTitle>Present Value Calculator</CardTitle>
                    <CardDescription>
                      Input future values and parameters to calculate present value accurately.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Basic Inputs */}
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="future-value">Future Value</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="future-value"
                              type="number"
                              className="pl-9"
                              value={futureValue}
                              min={1}
                              onChange={(e) => setFutureValue(Number(e.target.value))}
                              aria-describedby="future-value-error"
                            />
                          </div>
                          {errors.futureValue && (
                            <p id="future-value-error" className="text-xs text-red-500">
                              {errors.futureValue}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time-period">Time Period (Years)</Label>
                          <Input
                            id="time-period"
                            type="number"
                            value={timePeriod}
                            min={1}
                            onChange={(e) => setTimePeriod(Number(e.target.value))}
                            aria-describedby="time-period-error"
                          />
                          {errors.timePeriod && (
                            <p id="time-period-error" className="text-xs text-red-500">
                              {errors.timePeriod}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="discount-rate">Discount Rate</Label>
                          <span className="text-sm text-muted-foreground">{discountRate}%</span>
                        </div>
                        <Slider
                          id="discount-rate"
                          min={0}
                          max={30}
                          step={0.5}
                          value={[discountRate]}
                          onValueChange={(value) => setDiscountRate(value[0])}
                          aria-label="Adjust discount rate"
                        />
                      </div>
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
                            <SelectItem value="daily">Daily</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Additional Cash Flows */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="include-cash-flows">Include Additional Cash Flows</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Add multiple future cash flows for a comprehensive calculation
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Switch
                          id="include-cash-flows"
                          checked={includeCashFlows}
                          onCheckedChange={setIncludeCashFlows}
                          aria-label="Toggle additional cash flows"
                        />
                      </div>
                      
                      {includeCashFlows && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Cash Flows</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addCashFlow}
                              className="flex items-center gap-2"
                              aria-label="Add new cash flow"
                            >
                              <Plus className="h-4 w-4" />
                              Add Cash Flow
                            </Button>
                          </div>
                          {errors.cashFlows && (
                            <p className="text-xs text-red-500">{errors.cashFlows}</p>
                          )}
                          <div className="space-y-4">
                            {cashFlows.map((cf) => (
                              <div key={cf.id} className="flex items-center gap-4">
                                <div className="flex-1">
                                  <Label htmlFor={`cf-year-${cf.id}`}>
                                    Year
                                  </Label>
                                  <Input
                                    id={`cf-year-${cf.id}`}
                                    type="number"
                                    value={cf.year}
                                    min={1}
                                    onChange={(e) => updateCashFlowYear(cf.id, Number(e.target.value))}
                                    aria-label={`Year for cash flow ${cf.id}`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label htmlFor={`cf-value-${cf.id}`}>
                                    Cash Flow ($)
                                  </Label>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                      id={`cf-value-${cf.id}`}
                                      type="number"
                                      className="pl-9"
                                      value={cf.value}
                                      min={1}
                                      onChange={(e) => updateCashFlow(cf.id, Number(e.target.value))}
                                      aria-label={`Value for cash flow ${cf.id}`}
                                    />
                                  </div>
                                </div>
                                {cashFlows.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeCashFlow(cf.id)}
                                    aria-label={`Remove cash flow ${cf.id}`}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                                    Adjust for inflation to calculate real present value
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
                                    Calculate after-tax present value
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
                        <p className="text-sm text-muted-foreground">Future Value</p>
                        <p className="text-2xl font-bold">{formatCurrency(futureValue)}</p>
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-sm text-muted-foreground">Present Value</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(results.presentValue)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="details" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="time-value">Time Value</TabsTrigger>
                        <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
                      </TabsList>
                      <TabsContent value="details" className="space-y-4">
                        <div className="grid gap-4">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Discount Amount</p>
                              <p className="text-xs text-muted-foreground">Total reduction in value</p>
                            </div>
                            <p className="font-bold">{formatCurrency(results.discountAmount)}</p>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Effective Rate</p>
                              <p className="text-xs text-muted-foreground">Annual equivalent rate</p>
                            </div>
                            <p className="font-bold">{formatPercent(results.effectiveRate)}</p>
                          </div>
                          {includeInflation && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium">Real Present Value</p>
                                <p className="text-xs text-muted-foreground">Adjusted for inflation</p>
                              </div>
                              <p className="font-bold">{formatCurrency(results.realPresentValue)}</p>
                            </div>
                          )}
                          {includeTax && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium">After-Tax Present Value</p>
                                <p className="text-xs text-muted-foreground">Tax-adjusted value</p>
                              </div>
                              <p className="font-bold">{formatCurrency(results.afterTaxPresentValue)}</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="time-value" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={timeValueChartData} options={timeValueChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Present value over time
                        </div>
                      </TabsContent>
                      <TabsContent value="sensitivity" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={sensitivityChartData} options={sensitivityChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Present value at different discount rates
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Insight</p>
                            <p className="text-sm text-muted-foreground">
                              {results.discountAmount > 0
                                ? `The present value is ${formatCurrency(results.discountAmount)} less than the future value due to the time value of money.`
                                : "The present value calculation suggests no discount, indicating a zero or negative rate scenario."}
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
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Master the Time Value of Money: Your Guide to Present Value</h2>
                <p className="mt-3 text-muted-foreground text-lg">Learn how to calculate and apply present value for smarter financial decisions</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    What is Present Value?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 id="what-is-pv" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">Understanding Present Value</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                      <p>
                        <strong>Present Value (PV)</strong> is the current worth of a future sum of money or a series of cash flows, discounted at a specific rate. It’s a fundamental concept in finance that reflects the time value of money—the principle that money available today is worth more than the same amount in the future due to its earning potential.
                      </p>
                      <p className="mt-2">
                        The <strong>Present Value Calculator</strong> allows you to:
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Calculate the present value of future lump sums or cash flows</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Adjust for inflation and taxes for real-world accuracy</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Visualize how discount rates and time affect value</span>
                        </li>
                      </ul>
                      <p>
                        Whether you’re evaluating an investment, planning for retirement, or assessing a loan, present value helps you make informed decisions by revealing what future money is truly worth today.
                      </p>
                    </div>
                    <div className="md:w-[300px] h-[260px] flex-shrink-0">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                          <CardTitle className="text-sm font-medium text-center">Present Value Over Time</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full">
                            <Line
                              data={{
                                labels: ['Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                                datasets: [
                                  {
                                    label: 'Present Value',
                                    data: [100000, 92593, 85734, 79383, 73502, 68058], // Example data
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
                                    beginAtZero: false,
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
                  
                  <h4 id="why-important" className="font-semibold text-xl mt-6">Why Present Value Matters</h4>
                  <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Informed Investing</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Determine if future returns justify today’s costs.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Loan Assessment</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Understand the true cost of borrowing.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Retirement Planning</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Calculate how much to save today for future needs.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p>
                    In an era of economic uncertainty, present value calculations provide clarity, helping you navigate financial decisions with confidence.
                  </p>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Using the Present Value Calculator</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="step-by-step" className="font-bold text-xl mb-4">Step-by-Step Guide</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">1</span>
                          Input Basic Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Future Value (e.g., $100,000)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Time Period (e.g., 5 years)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Percent className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Discount Rate (e.g., 8%)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Compounding Frequency</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">2</span>
                          Add Cash Flows (Optional)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Switch className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Toggle additional cash flows</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Plus className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Input multiple future payments</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">3</span>
                          Customize Options
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Percent className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Include inflation (e.g., 2.5%)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Percent className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Include taxes (e.g., 25%)</span>
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
                            <span>View present value and metrics</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <LineChart className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Explore charts for insights</span>
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
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Significance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Present Value</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Current worth of future money</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Basis for investment decisions</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Discount Amount</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Difference from future value</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Impact of time and rate</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Effective Rate</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Annual equivalent rate</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Standardized comparison</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Real Present Value</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Inflation-adjusted value</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">True purchasing power</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Tip:</strong> Focus on real present value for a realistic view of future money’s worth in today’s dollars.
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
                        <span className="text-2xl">Core Concepts in Present Value</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Essential principles for mastering financial calculations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h3 id="time-value" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        Time Value of Money
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p>
                            The <strong>time value of money</strong> posits that a dollar today is worth more than a dollar tomorrow because it can earn interest. Present value discounts future cash flows to reflect this.
                          </p>
                          <ul className="mt-4 space-y-2">
                            <li className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">
              →
            </span>
            <span>
              <strong>Formula:</strong>{' '}
              <InlineMath math="PV = \frac{FV}{(1 + \frac{r}{n})^{n \cdot t}}" />
            </span>
          </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span>Where \( FV \) = Future Value, \( r \) = Discount Rate, \( n \) = Time Periods</span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                              <strong>Example:</strong> $100 in 5 years at 5% discount rate is worth \( \frac{100}{(1.05)^5} = \$78.35 \) today.
                            </p>
                          </div>
                        </div>
                        
                        <div className="h-[220px]">
                          <h4 className="text-center text-sm font-medium mb-2">Present Value Decay</h4>
                          <Line
                            data={{
                              labels: ['Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                              datasets: [
                                {
                                  label: 'Present Value',
                                  data: [100, 95.24, 90.70, 86.38, 82.27, 78.35], // Example data
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
                        <h3 id="discount-rate" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                          <Percent className="h-5 w-5" />
                          Discount Rate Impact
                        </h3>
                        <p>
                          The <strong>discount rate</strong> reflects the opportunity cost of money. Higher rates lead to lower present values, as future money is worth less today.
                        </p>
                        
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Discount Rate</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Present Value*</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">5%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$78,352</td>
                              </tr>
                              <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">8%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$68,058</td>
                              </tr>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">10%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$62,092</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">*For $100,000 in 5 years</p>
                      </div>
                      
                      <div>
                        <h3 id="inflation-tax" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <Percent className="h-5 w-5" />
                          Inflation and Tax Effects
                        </h3>
                        <p>
                          <strong>Inflation</strong> erodes purchasing power, while <strong>taxes</strong> reduce net returns. Adjusting for these provides a realistic view of value.
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">Adjusted Present Value</h4>
                          <div className="mt-3">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div className="font-medium text-blue-700 dark:text-blue-400">Nominal PV</div>
                              <div className="text-blue-600 dark:text-blue-500">$68,058</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Inflation (2.5%)</div>
                              <div className="text-blue-600 dark:text-blue-500">$60,000</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Tax (25%)</div>
                              <div className="text-blue-600 dark:text-blue-500">$45,000</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Trends Section */}
              <div className="mb-12" id="financial-trends">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Financial Insights
                </h2>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Global Inflation</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">2.8%</p>
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">2023 Average</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                          <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">US 10-Year Yield</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">4.2%</p>
                        <p className="mt-1 text-sm text-green-600 dark:text-green-500">2023 Average</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                          <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Discount Rate</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">8.0%</p>
                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">Typical for Stocks</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                          <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Global GDP Growth</h3>
                        <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">3.1%</p>
                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">2023 Estimate</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="inflation-impact" className="text-xl font-bold mb-4">Inflation’s Effect on Value</h3>
                <Card className="bg-white dark:bg-gray-900 mb-4">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p>
                          <strong>Inflation</strong> reduces the real value of future money. At 3% annual inflation, $100,000 in 10 years is worth significantly less in today’s dollars.
                        </p>
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Inflation Erosion</h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">Future Value</span>
                              <span className="font-medium text-red-700 dark:text-red-400">$100,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">Inflation Rate</span>
                              <span className="font-medium text-red-700 dark:text-red-400">3%</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-sm text-red-800 dark:text-red-300">Real Value Today</span>
                              <span className="text-red-800 dark:text-red-300">$74,409</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-[280px]">
                        <h4 className="text-center text-sm font-medium mb-3">Inflation Impact Over Time</h4>
                        <Line
                          data={{
                            labels: ['Year 0', 'Year 2', 'Year 4', 'Year 6', 'Year 8', 'Year 10'],
                            datasets: [
                              {
                                label: 'Real Value',
                                data: [100000, 94176, 88699, 83562, 78715, 74409],
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
                                ticks: { callback: (value) => `$${value}` }
                              }
                            },
                            plugins: { legend: { display: false } }
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
                      Master Present Value for Financial Success
                    </CardTitle>
                    <CardDescription>
                      Apply these insights to make strategic decisions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      The <strong>Present Value Calculator</strong> empowers you to understand the true worth of future money, factoring in critical elements like discount rates, inflation, and taxes. This knowledge is essential for optimizing investments, loans, and savings plans.
                    </p>
                    
                    <p className="mt-4" id="next-steps">
                      Take control of your financial future:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Immediate Actions</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                            <span className="text-blue-800 dark:text-blue-300">Calculate PV for your investments</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                            <span className="text-blue-800 dark:text-blue-300">Adjust for inflation and taxes</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                            <span className="text-blue-800 dark:text-blue-300">Compare different scenarios</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Long-Term Strategy</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                            <span className="text-green-800 dark:text-green-300">Use PV in investment evaluations</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                            <span className="text-green-800 dark:text-green-300">Factor in economic changes</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                            <span className="text-green-800 dark:text-green-300">Optimize savings and loans</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Start Calculating Now</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use the <strong>Present Value Calculator</strong> to evaluate your financial decisions. Explore related tools:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/future-value">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Future Value Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/npv">
                                <Percent className="h-4 w-4 mr-1" />
                                NPV Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/compound-interest">
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Compound Interest
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