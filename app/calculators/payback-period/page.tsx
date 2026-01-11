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
import { Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Plus, Minus, Info, DollarSign, Percent, AlertCircle, Wallet, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from "next/link"
import type { ChartOptions } from 'chart.js'
import PaybackPeriodSchema from './schema';

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
  simplePaybackPeriod: number
  discountedPaybackPeriod: number
  npv: number
  irr: number
  adjustedPaybackPeriod: number
  cumulativeCashFlows: number[]
  discountedCumulativeCashFlows: number[]
}

export default function PaybackPeriodCalculator() {
  // Basic Inputs
  const [projectName, setProjectName] = useState<string>("")
  const [initialInvestment, setInitialInvestment] = useState<number>(100000)
  const [periodType, setPeriodType] = useState<string>("annual")
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([
    { id: 1, value: 25000, year: 1 },
    { id: 2, value: 30000, year: 2 },
    { id: 3, value: 35000, year: 3 },
    { id: 4, value: 40000, year: 4 },
    { id: 5, value: 45000, year: 5 }
  ])

  // Advanced Inputs
  const [discountRate, setDiscountRate] = useState<number>(10)
  const [operatingCosts, setOperatingCosts] = useState<number>(5000)
  const [includeOperatingCosts, setIncludeOperatingCosts] = useState<boolean>(false)
  const [inflationRate, setInflationRate] = useState<number>(2.5)
  const [includeInflation, setIncludeInflation] = useState<boolean>(false)
  const [taxRate, setTaxRate] = useState<number>(25)
  const [includeTax, setIncludeTax] = useState<boolean>(false)

  // Results
  const [results, setResults] = useState<Results>({
    simplePaybackPeriod: 0,
    discountedPaybackPeriod: 0,
    npv: 0,
    irr: 0,
    adjustedPaybackPeriod: 0,
    cumulativeCashFlows: [],
    discountedCumulativeCashFlows: []
  })

  // Input Validation Errors
  const [errors, setErrors] = useState<{ initialInvestment?: string; cashFlows?: string }>({})

  // Calculate Simple Payback Period
  const calculateSimplePaybackPeriod = (cashFlows: number[], initialInvestment: number): number => {
    let remainingInvestment = initialInvestment
    let years = 0

    for (let i = 0; i < cashFlows.length; i++) {
      if (cashFlows[i] <= 0) continue // Skip negative or zero cash flows
      remainingInvestment -= cashFlows[i]
      if (remainingInvestment <= 0) {
        years = i + 1 + (remainingInvestment / cashFlows[i])
        break
      }
    }

    return years > 0 && years <= cashFlows.length ? years : NaN
  }

  // Calculate Discounted Payback Period
  const calculateDiscountedPaybackPeriod = (
    cashFlows: number[],
    initialInvestment: number,
    discountRate: number
  ): number => {
    let remainingInvestment = initialInvestment
    let years = 0

    for (let i = 0; i < cashFlows.length; i++) {
      const discountedCashFlow = cashFlows[i] / Math.pow(1 + discountRate / 100, i + 1)
      if (discountedCashFlow <= 0) continue
      remainingInvestment -= discountedCashFlow
      if (remainingInvestment <= 0) {
        years = i + 1 + (remainingInvestment / discountedCashFlow)
        break
      }
    }

    return years > 0 && years <= cashFlows.length ? years : NaN
  }

  // Calculate NPV
  const calculateNPV = (cashFlows: number[], initialInvestment: number, discountRate: number): number => {
    return cashFlows.reduce((acc, cf, i) =>
      acc + cf / Math.pow(1 + discountRate / 100, i + 1), -initialInvestment)
  }

  // Calculate IRR using Newton-Raphson method
  const calculateIRR = (cashFlows: number[], initialInvestment: number): number => {
    const totalCashFlows = [-initialInvestment, ...cashFlows]
    let guess = 0.1
    const maxIterations = 1000
    const tolerance = 0.0000001

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0
      let derivativeNpv = 0

      totalCashFlows.forEach((cf, t) => {
        const factor = Math.pow(1 + guess, t)
        npv += cf / factor
        derivativeNpv -= t * cf / (factor * (1 + guess))
      })

      if (Math.abs(npv) < tolerance) {
        return guess * 100
      }

      const nextGuess = guess - npv / derivativeNpv
      guess = nextGuess
    }

    return NaN
  }

  // Calculate cumulative cash flows
  const calculateCumulativeCashFlows = (cashFlows: number[], initialInvestment: number): number[] => {
    let cumulative = -initialInvestment
    return [-initialInvestment, ...cashFlows.map(cf => {
      cumulative += cf
      return cumulative
    })]
  }

  // Calculate discounted cumulative cash flows
  const calculateDiscountedCumulativeCashFlows = (
    cashFlows: number[],
    initialInvestment: number,
    discountRate: number
  ): number[] => {
    let cumulative = -initialInvestment
    return [-initialInvestment, ...cashFlows.map((cf, i) => {
      const discountedCF = cf / Math.pow(1 + discountRate / 100, i + 1)
      cumulative += discountedCF
      return cumulative
    })]
  }

  // Validate inputs
  const validateInputs = (): boolean => {
    const newErrors: { initialInvestment?: string; cashFlows?: string } = {}
    if (initialInvestment <= 0) {
      newErrors.initialInvestment = "Initial investment must be greater than 0"
    }
    if (cashFlows.length === 0) {
      newErrors.cashFlows = "At least one cash flow period is required"
    }
    if (cashFlows.some(cf => isNaN(cf.value) || cf.value < 0)) {
      newErrors.cashFlows = "All cash flow periods must have valid non-negative numbers"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update calculations
  useEffect(() => {
    if (!validateInputs()) return

    const adjustedCashFlows = cashFlows.map(cf => {
      let value = cf.value

      if (includeOperatingCosts) {
        value -= operatingCosts
      }

      if (includeInflation) {
        value = value / Math.pow(1 + inflationRate / 100, cf.year)
      }

      if (includeTax) {
        value = value * (1 - taxRate / 100)
      }

      return value
    })

    const simplePaybackPeriod = calculateSimplePaybackPeriod(adjustedCashFlows, initialInvestment)
    const discountedPaybackPeriod = calculateDiscountedPaybackPeriod(
      adjustedCashFlows,
      initialInvestment,
      discountRate
    )
    const npv = calculateNPV(adjustedCashFlows, initialInvestment, discountRate)
    const irr = calculateIRR(adjustedCashFlows, initialInvestment)
    const cumulativeCashFlows = calculateCumulativeCashFlows(adjustedCashFlows, initialInvestment)
    const discountedCumulativeCashFlows = calculateDiscountedCumulativeCashFlows(
      adjustedCashFlows,
      initialInvestment,
      discountRate
    )

    setResults({
      simplePaybackPeriod,
      discountedPaybackPeriod,
      npv,
      irr,
      adjustedPaybackPeriod: discountedPaybackPeriod,
      cumulativeCashFlows,
      discountedCumulativeCashFlows
    })
  }, [
    cashFlows,
    initialInvestment,
    discountRate,
    operatingCosts,
    includeOperatingCosts,
    inflationRate,
    includeInflation,
    taxRate,
    includeTax
  ])

  // Add new cash flow period
  const addCashFlow = () => {
    const newId = cashFlows.length > 0 ? Math.max(...cashFlows.map(cf => cf.id)) + 1 : 1
    const newYear = cashFlows.length > 0 ? Math.max(...cashFlows.map(cf => cf.year)) + 1 : 1
    setCashFlows([...cashFlows, { id: newId, value: 0, year: newYear }])
  }

  // Remove cash flow period
  const removeCashFlow = (id: number) => {
    if (cashFlows.length > 1) {
      setCashFlows(cashFlows.filter(cf => cf.id !== id))
    }
  }

  // Update cash flow value
  const updateCashFlow = (id: number, value: number) => {
    setCashFlows(cashFlows.map(cf =>
      cf.id === id ? { ...cf, value: isNaN(value) || value < 0 ? 0 : value } : cf
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

  const cashFlowChartData = useMemo(() => ({
    labels: ['Initial', ...cashFlows.map(cf => `Year ${cf.year}`)],
    datasets: [
      {
        label: 'Cash Flows',
        data: [-initialInvestment, ...cashFlows.map(cf => cf.value)],
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }), [cashFlows, initialInvestment])

  const cashFlowChartOptions: ChartOptions<'bar'> = {
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
          label: (context) => `$${Number(context.raw).toLocaleString()}`
        }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => `$${value.toLocaleString()}`
      }
    }
  }

  const cumulativeChartData = useMemo(() => ({
    labels: ['Initial', ...cashFlows.map(cf => `Year ${cf.year}`)],
    datasets: [
      {
        label: 'Cumulative Cash Flow',
        data: results.cumulativeCashFlows,
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4,
        fill: false
      },
      {
        label: 'Discounted Cumulative Cash Flow',
        data: results.discountedCumulativeCashFlows,
        borderColor: chartColors.primary[1],
        backgroundColor: chartColors.secondary[1],
        tension: 0.4,
        fill: false
      }
    ]
  }), [results.cumulativeCashFlows, results.discountedCumulativeCashFlows])

  const cumulativeChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`
        }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${Number(context.raw).toLocaleString()}`
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
    return isNaN(value) ? 'N/A' : new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + '%'
  }

  const formatYears = (years: number): string => {
    if (isNaN(years)) return 'N/A'
    const wholeYears = Math.floor(years)
    const months = Math.round((years - wholeYears) * 12)
    return `${wholeYears} years${months > 0 ? ` ${months} months` : ''}`
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
    pdf.save(`${projectName || 'payback-period'}-results.pdf`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PaybackPeriodSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Payback Period <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Determine how long it takes to recover your initial investment through cash inflows, with advanced metrics like NPV and IRR.
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
                      Input your investment information and cash flows to calculate the payback period and related metrics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Basic Inputs */}
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="project-name">Project Name (Optional)</Label>
                          <Input
                            id="project-name"
                            placeholder="e.g., Factory Expansion"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            aria-describedby="project-name-desc"
                          />
                          <p id="project-name-desc" className="text-xs text-muted-foreground">
                            Name your project for easy reference
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
                        <Label htmlFor="period-type">Cash Flow Period</Label>
                        <Select value={periodType} onValueChange={setPeriodType}>
                          <SelectTrigger id="period-type" aria-label="Select cash flow period type">
                            <SelectValue placeholder="Select period type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="annual">Annual</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Cash Flows */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Cash Flows</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addCashFlow}
                          className="flex items-center gap-2"
                          aria-label="Add new cash flow period"
                        >
                          <Plus className="h-4 w-4" />
                          Add Period
                        </Button>
                      </div>
                      {errors.cashFlows && (
                        <p className="text-xs text-red-500">{errors.cashFlows}</p>
                      )}
                      <div className="space-y-4">
                        {cashFlows.map((cf, index) => (
                          <div key={cf.id} className="flex items-center gap-4">
                            <div className="flex-1">
                              <Label htmlFor={`cf-${cf.id}`}>
                                Year {cf.year} Cash Flow
                              </Label>
                              <div className="flex items-center gap-4 mt-2">
                                <Input
                                  id={`cf-${cf.id}`}
                                  type="number"
                                  value={cf.value}
                                  onChange={(e) => updateCashFlow(cf.id, Number(e.target.value))}
                                  aria-label={`Cash flow for year ${cf.year}`}
                                />
                                {cashFlows.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeCashFlow(cf.id)}
                                    aria-label={`Remove cash flow for year ${cf.year}`}
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
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="include-operating-costs">Include Operating Costs</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Deduct annual operating and maintenance costs from cash flows
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Switch
                              id="include-operating-costs"
                              checked={includeOperatingCosts}
                              onCheckedChange={setIncludeOperatingCosts}
                              aria-label="Toggle operating costs inclusion"
                            />
                          </div>
                          {includeOperatingCosts && (
                            <div className="space-y-2">
                              <Label htmlFor="operating-costs">Annual Operating Costs</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="operating-costs"
                                  type="number"
                                  className="pl-9"
                                  value={operatingCosts || ''} onChange={(e) => setOperatingCosts(e.target.value === '' ? 0 : Number(e.target.value))}
                                  aria-label="Set annual operating costs"
                                />
                              </div>
                            </div>
                          )}
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
                                    Adjust cash flows for inflation to reflect real values
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
                                    Calculate after-tax cash flows
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
                        <p className="text-sm text-muted-foreground">Simple Payback Period</p>
                        <p className="text-2xl font-bold text-primary">{formatYears(results.simplePaybackPeriod)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="metrics" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="metrics">Metrics</TabsTrigger>
                        <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                        <TabsTrigger value="cumulative">Cumulative</TabsTrigger>
                      </TabsList>
                      <TabsContent value="metrics" className="space-y-4">
                        <div className="grid gap-4">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Simple Payback Period</p>
                              <p className="text-xs text-muted-foreground">Without discounting</p>
                            </div>
                            <p className="font-bold">{formatYears(results.simplePaybackPeriod)}</p>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Discounted Payback Period</p>
                              <p className="text-xs text-muted-foreground">Including time value of money</p>
                            </div>
                            <p className="font-bold">{formatYears(results.discountedPaybackPeriod)}</p>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Net Present Value (NPV)</p>
                              <p className="text-xs text-muted-foreground">Present value of all cash flows</p>
                            </div>
                            <p className="font-bold">{formatCurrency(results.npv)}</p>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Internal Rate of Return (IRR)</p>
                              <p className="text-xs text-muted-foreground">Return rate that makes NPV zero</p>
                            </div>
                            <p className="font-bold">{formatPercent(results.irr)}</p>
                          </div>
                          {(includeInflation || includeTax || includeOperatingCosts) && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10">
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium">Adjusted Payback Period</p>
                                <p className="text-xs text-muted-foreground">
                                  Including {[
                                    includeOperatingCosts && 'operating costs',
                                    includeInflation && 'inflation',
                                    includeTax && 'tax'
                                  ].filter(Boolean).join(', ')}
                                </p>
                              </div>
                              <p className="font-bold">{formatYears(results.adjustedPaybackPeriod)}</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="cashflow" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={cashFlowChartData} options={cashFlowChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Cash flows by period
                        </div>
                      </TabsContent>
                      <TabsContent value="cumulative" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={cumulativeChartData} options={cumulativeChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Cumulative cash flows over time
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
                              {results.npv > 0
                                ? "The investment has a positive NPV, indicating it adds value."
                                : "The investment has a negative NPV, suggesting it may not be profitable."}
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
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Master the Payback Period: Your Complete Guide</h2>
                <p className="mt-3 text-muted-foreground text-lg">Everything you need to know about evaluating investment recovery time</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding the Payback Period Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 id="what-is-calculator" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is the Payback Period Calculator?</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                      <p>
                        The <strong>Payback Period Calculator</strong> is a comprehensive tool that helps investors and business owners determine how long it will take to recover their initial investment through cash inflows. It offers both simple and discounted payback period calculations, along with advanced metrics like Net Present Value (NPV) and Internal Rate of Return (IRR).
                      </p>
                      <p className="mt-2">
                        Key features include:
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Input for initial investment and periodic cash flows</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Adjustments for operating costs, inflation, and taxes</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Interactive charts for cash flow visualization</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>Export results as PDF for reporting</span>
                        </li>
                      </ul>
                      <p>
                        This calculator is essential for evaluating the viability of projects, from business expansions to real estate investments, by providing a clear timeline for cost recovery.
                      </p>
                    </div>
                    <div className="md:w-[300px] h-[260px] flex-shrink-0">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                          <CardTitle className="text-sm font-medium text-center">Cumulative Cash Flow</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full">
                            <Line
                              data={{
                                labels: ['Initial', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                                datasets: [
                                  {
                                    label: 'Cumulative CF',
                                    data: [-100000, -75000, -45000, -10000, 30000, 75000],
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
                  
                  <h4 id="why-important" className="font-semibold text-xl mt-6">Why Payback Period Matters</h4>
                  <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Risk Assessment</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Shorter payback periods indicate lower risk investments.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Liquidity Planning</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Helps businesses plan for cash flow recovery.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Decision-Making</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Compare projects to choose the most efficient use of capital.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p>
                    In an environment of economic uncertainty, understanding the payback period helps investors and businesses make informed decisions about capital allocation and risk management.
                  </p>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Mastering the Payback Period Calculator</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="step-by-step" className="font-bold text-xl mb-4">Step-by-Step Guide</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">1</span>
                          Enter Investment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Input initial investment (e.g., $100,000)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Choose period type (annual or monthly)</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">2</span>
                          Add Cash Flows
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Plus className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Enter cash inflows for each period</span>
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
                            <span>Set discount rate (e.g., 10%)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Switch className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Toggle operating costs, inflation, and taxes</span>
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
                            <span>Review payback periods and metrics</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <LineChart className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Visualize cash flow trends</span>
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
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Insight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Simple Payback Period</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Time to recover investment without discounting</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Quick liquidity measure</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Discounted Payback Period</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Time to recover investment with discounting</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Considers time value of money</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Net Present Value (NPV)</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Present value of cash flows minus investment</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Profitability indicator</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Internal Rate of Return (IRR)</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Rate where NPV equals zero</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Project's expected return rate</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Pro Tip:</strong> Use the discounted payback period for a more accurate assessment, as it accounts for the time value of money and future cash flow risks.
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
                        <span className="text-2xl">Key Concepts in Payback Analysis</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Understanding the metrics behind investment recovery
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h3 id="simple-vs-discounted" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        Simple vs. Discounted Payback
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p>
                            The <strong>simple payback period</strong> calculates the time to recover the investment based on nominal cash flows, ignoring the time value of money. The <strong>discounted payback period</strong> adjusts cash flows for their present value, providing a more realistic timeline.
                          </p>
                          <ul className="mt-4 space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>Simple:</strong> Quick to calculate, but may overestimate viability</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>Discounted:</strong> More accurate, especially for long-term projects</span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                              <strong>Example:</strong> A project with a simple payback of 3 years might have a discounted payback of 4 years, reflecting the true cost of time.
                            </p>
                          </div>
                        </div>
                        
                        <div className="h-[220px]">
                          <h4 className="text-center text-sm font-medium mb-2">Payback Comparison</h4>
                          <Bar
                            data={{
                              labels: ['Simple', 'Discounted'],
                              datasets: [
                                {
                                  label: 'Years',
                                  data: [3, 4],
                                  backgroundColor: ['rgba(124, 58, 237, 0.8)', 'rgba(20, 184, 166, 0.8)'],
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { legend: { display: false } },
                              scales: { y: { beginAtZero: true } }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-8" />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 id="npv" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Net Present Value (NPV)
                        </h3>
                        <p>
                          <strong>NPV</strong> measures the profitability of an investment by calculating the present value of all future cash flows minus the initial investment. A positive NPV indicates a potentially profitable project.
                        </p>
                        
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Year</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Cash Flow</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Present Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">0</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">-$100,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">-$100,000</td>
                              </tr>
                              <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">1</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$25,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$22,727</td>
                              </tr>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">2</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$30,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$24,793</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div>
                        <h3 id="irr" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <Percent className="h-5 w-5" />
                          Internal Rate of Return (IRR)
                        </h3>
                        <p>
                          <strong>IRR</strong> is the discount rate that makes the NPV of an investment zero. It represents the expected annual return of the project.
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">IRR Calculation</h4>
                          <div className="mt-3">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div className="font-medium text-blue-700 dark:text-blue-400">Project A</div>
                              <div className="text-blue-600 dark:text-blue-500">IRR: 12%</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Project B</div>
                              <div className="text-blue-600 dark:text-blue-500">IRR: 15%</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Decision</div>
                              <div className="text-blue-600 dark:text-blue-500">Choose Project B</div>
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
                  Capital Investment Insights
                </h2>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Global CapEx</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">$2.7T</p>
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">2023 Estimate</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                          <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">Avg. Payback</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">3.5 yrs</p>
                        <p className="mt-1 text-sm text-green-600 dark:text-green-500">Manufacturing</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                          <RefreshCw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Discount Rate</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">8.2%</p>
                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">WACC Avg</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                          <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">NPV Focus</h3>
                        <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">75%</p>
                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">CFOs Prefer</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="inflation-impact" className="text-xl font-bold mb-4">Impact of Inflation</h3>
                <Card className="bg-white dark:bg-gray-900 mb-4">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p>
                          <strong>Inflation</strong> reduces the real value of future cash flows, making it crucial to adjust for accurate payback calculations.
                        </p>
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Inflation Adjustment</h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">Nominal Cash Flow</span>
                              <span className="font-medium text-red-700 dark:text-red-400">$10,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">Inflation (3%)</span>
                              <span className="font-medium text-red-700 dark:text-red-400">$9,709</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-sm text-red-800 dark:text-red-300">Real Cash Flow</span>
                              <span className="text-red-800 dark:text-red-300">$9,709</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-[280px]">
                        <h4 className="text-center text-sm font-medium mb-3">Nominal vs. Real Cash Flows</h4>
                        <Line
                          data={{
                            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                            datasets: [
                              {
                                label: 'Nominal',
                                data: [10000, 10000, 10000, 10000, 10000],
                                borderColor: 'rgba(99, 102, 241, 0.8)',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              },
                              {
                                label: 'Real (3% Inflation)',
                                data: [9709, 9417, 9136, 8864, 8602],
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
                      Path to Investment Recovery
                    </CardTitle>
                    <CardDescription>
                      Make informed decisions with payback analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      The <strong>Payback Period Calculator</strong> provides a comprehensive view of investment recovery timelines and profitability metrics. By understanding simple and discounted payback periods, NPV, and IRR, you can make data-driven decisions to optimize capital allocation.
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
                            <span className="text-blue-800 dark:text-blue-300">Input your project data</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                            <span className="text-blue-800 dark:text-blue-300">Adjust for real-world factors</span>
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
                            <span className="text-green-800 dark:text-green-300">Prioritize projects with shorter payback periods</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                            <span className="text-green-800 dark:text-green-300">Balance risk with profitability metrics</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                            <span className="text-green-800 dark:text-green-300">Reassess projects regularly</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Start Analyzing Now</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use the <strong>Payback Period Calculator</strong> to evaluate your investments. Explore related tools:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/roi">
                                <Percent className="h-4 w-4 mr-1" />
                                ROI Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/irr">
                                <RefreshCw className="h-4 w-4 mr-1" />
                                IRR Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/npv">
                                <DollarSign className="h-4 w-4 mr-1" />
                                NPV Calculator
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