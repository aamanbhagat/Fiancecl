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
import IRRSchema from './schema';

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
}

interface Results {
  irr: number
  mirr: number
  npv: number
  totalProfit: number
  paybackPeriod: number
  adjustedIrr: number
}

export default function IRRCalculator() {
  // Basic Inputs
  const [projectName, setProjectName] = useState<string>("")
  const [initialInvestment, setInitialInvestment] = useState<number>(100000)
  const [periodType, setPeriodType] = useState<string>("annual")
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([
    { id: 1, value: 20000 },
    { id: 2, value: 25000 },
    { id: 3, value: 30000 },
    { id: 4, value: 35000 },
    { id: 5, value: 40000 }
  ])
  const [finalValue, setFinalValue] = useState<number>(0)

  // Advanced Inputs
  const [discountRate, setDiscountRate] = useState<number>(10)
  const [reinvestmentRate, setReinvestmentRate] = useState<number>(8)
  const [inflationRate, setInflationRate] = useState<number>(2.5)
  const [includeInflation, setIncludeInflation] = useState<boolean>(false)
  const [taxRate, setTaxRate] = useState<number>(25)
  const [includeTax, setIncludeTax] = useState<boolean>(false)

  // Results
  const [results, setResults] = useState<Results>({
    irr: 0,
    mirr: 0,
    npv: 0,
    totalProfit: 0,
    paybackPeriod: 0,
    adjustedIrr: 0
  })

  // Input Validation Errors
  const [errors, setErrors] = useState<{ initialInvestment?: string; cashFlows?: string }>({})

  // Calculate IRR using Newton-Raphson method
  const calculateIRR = (cashFlows: number[], initialGuess = 0.1): number => {
    const maxIterations = 1000
    const tolerance = 0.0000001
    let guess = initialGuess

    for (let i = 0; i < maxIterations; i++) {
      let npv = -initialInvestment
      let derivativeNpv = 0

      cashFlows.forEach((cf, t) => {
        const factor = Math.pow(1 + guess, t + 1)
        npv += cf / factor
        derivativeNpv -= (t + 1) * cf / (factor * (1 + guess))
      })

      if (Math.abs(derivativeNpv) < tolerance) return NaN // Avoid division by near-zero
      const nextGuess = guess - npv / derivativeNpv
      if (Math.abs(nextGuess - guess) < tolerance) {
        return nextGuess * 100
      }
      guess = nextGuess
    }

    return NaN // Return NaN if no convergence
  }

  // Calculate MIRR
  const calculateMIRR = (cashFlows: number[]): number => {
    const positiveCFs = cashFlows.map(cf => cf > 0 ? cf : 0)
    const negativeCFs = cashFlows.map(cf => cf < 0 ? cf : 0)

    const fvPositive = positiveCFs.reduce((acc, cf, i) => 
      acc + cf * Math.pow(1 + reinvestmentRate / 100, cashFlows.length - i - 1), 0)
    
    const pvNegative = negativeCFs.reduce((acc, cf, i) => 
      acc + cf / Math.pow(1 + discountRate / 100, i), -initialInvestment)

    if (pvNegative === 0) return 0 // Avoid division by zero
    return (Math.pow(Math.abs(fvPositive / pvNegative), 1 / cashFlows.length) - 1) * 100
  }

  // Calculate NPV
  const calculateNPV = (cashFlows: number[]): number => {
    return cashFlows.reduce((acc, cf, i) => 
      acc + cf / Math.pow(1 + discountRate / 100, i + 1), -initialInvestment)
  }

  // Calculate Payback Period
  const calculatePaybackPeriod = (cashFlows: number[]): number => {
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

    return years || cashFlows.length // Return max periods if not paid back
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
    if (cashFlows.some(cf => isNaN(cf.value))) {
      newErrors.cashFlows = "All cash flows must have valid numbers"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update calculations
  useEffect(() => {
    if (!validateInputs()) return

    const cashFlowValues = cashFlows.map(cf => cf.value)
    const totalCashFlows = [...cashFlowValues]
    if (finalValue > 0) {
      totalCashFlows.push(finalValue)
    }

    const irr = calculateIRR(totalCashFlows) || 0
    const mirr = calculateMIRR(totalCashFlows)
    const npv = calculateNPV(totalCashFlows)
    const totalProfit = totalCashFlows.reduce((acc, val) => acc + val, 0) - initialInvestment
    const paybackPeriod = calculatePaybackPeriod(totalCashFlows)

    let adjustedIrr = irr
    if (includeInflation) {
      adjustedIrr = ((1 + irr / 100) / (1 + inflationRate / 100) - 1) * 100
    }
    if (includeTax) {
      adjustedIrr = adjustedIrr * (1 - taxRate / 100)
    }

    setResults({
      irr,
      mirr,
      npv,
      totalProfit,
      paybackPeriod,
      adjustedIrr
    })
  }, [cashFlows, initialInvestment, finalValue, discountRate, reinvestmentRate, 
      inflationRate, includeInflation, taxRate, includeTax])

  // Add new cash flow
  const addCashFlow = () => {
    const newId = cashFlows.length > 0 ? Math.max(...cashFlows.map(cf => cf.id)) + 1 : 1
    setCashFlows([...cashFlows, { id: newId, value: 0 }])
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
      cf.id === id ? { ...cf, value: isNaN(value) ? 0 : value } : cf
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
    labels: ['Initial', ...cashFlows.map((_, i) => `Period ${i + 1}`), finalValue > 0 ? 'Final' : ''].filter(Boolean),
    datasets: [
      {
        label: 'Cash Flows',
        data: [-initialInvestment, ...cashFlows.map(cf => cf.value), finalValue > 0 ? finalValue : null].filter(cf => cf !== null),
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }), [cashFlows, initialInvestment, finalValue])

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
        formatter: (value: number) => `$${Math.abs(value).toLocaleString()}`
      }
    }
  }

  const npvChartData = useMemo(() => ({
    labels: Array.from({ length: 21 }, (_, i) => i * 5),
    datasets: [
      {
        label: 'NPV',
        data: Array.from({ length: 21 }, (_, i) => {
          const rate = i * 5
          return cashFlows.reduce((acc, cf, j) => 
            acc + cf.value / Math.pow(1 + rate / 100, j + 1), -initialInvestment
          )
        }),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4,
        fill: false
      }
    ]
  }), [cashFlows, initialInvestment])

  const npvChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`
        }
      },
      x: {
        grid: { display: false },
        title: {
          display: true,
          text: 'Discount Rate (%)'
        }
      }
    },
    plugins: {
      legend: { display: false },
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
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + '%'
  }

  const formatYears = (years: number): string => {
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
    pdf.save(`${projectName || 'irr'}-results.pdf`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <IRRSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        IRR <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Evaluate project profitability with Internal Rate of Return (IRR), MIRR, NPV, and Payback Period metrics.
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
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>
                      Enter your investment details and cash flows to analyze profitability metrics.
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
                            placeholder="e.g., Real Estate Investment"
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
                            <SelectItem value="quarterly">Quarterly</SelectItem>
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
                                Period {index + 1} Cash Flow ($)
                              </Label>
                              <div className="flex items-center gap-4 mt-2">
                                <Input
                                  id={`cf-${cf.id}`}
                                  type="number"
                                  value={cf.value}
                                  onChange={(e) => updateCashFlow(cf.id, Number(e.target.value))}
                                  aria-label={`Cash flow for period ${index + 1}`}
                                />
                                {cashFlows.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeCashFlow(cf.id)}
                                    aria-label={`Remove cash flow period ${index + 1}`}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="final-value">Final Value / Exit Price ($)</Label>
                        <Input
                          id="final-value"
                          type="number"
                          value={finalValue}
                          min={0}
                          onChange={(e) => setFinalValue(Number(e.target.value))}
                          placeholder="Optional"
                          aria-describedby="final-value-desc"
                        />
                        <p id="final-value-desc" className="text-xs text-muted-foreground">
                          Enter the final value or exit price if applicable
                        </p>
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
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="reinvestment-rate">Reinvestment Rate</Label>
                            <span className="text-sm text-muted-foreground">{reinvestmentRate}%</span>
                          </div>
                          <Slider
                            id="reinvestment-rate"
                            min={0}
                            max={30}
                            step={0.5}
                            value={[reinvestmentRate]}
                            onValueChange={(value) => setReinvestmentRate(value[0])}
                            aria-label="Adjust reinvestment rate"
                          />
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
                                    Adjust IRR for inflation to calculate real returns
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
                                    Calculate after-tax IRR
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
                        <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(results.totalProfit)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="metrics" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="metrics">Metrics</TabsTrigger>
                        <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      </TabsList>
                      <TabsContent value="metrics" className="space-y-4">
                        <div className="grid gap-4">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">IRR</p>
                              <p className="text-xs text-muted-foreground">Internal Rate of Return</p>
                            </div>
                            <p className="font-bold">{isNaN(results.irr) ? 'N/A' : formatPercent(results.irr)}</p>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">MIRR</p>
                              <p className="text-xs text-muted-foreground">Modified Internal Rate of Return</p>
                            </div>
                            <p className="font-bold">{formatPercent(results.mirr)}</p>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">NPV</p>
                              <p className="text-xs text-muted-foreground">Net Present Value</p>
                            </div>
                            <p className="font-bold">{formatCurrency(results.npv)}</p>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Payback Period</p>
                              <p className="text-xs text-muted-foreground">Time to recover investment</p>
                            </div>
                            <p className="font-bold">{formatYears(results.paybackPeriod)}</p>
                          </div>
                          {(includeInflation || includeTax) && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10">
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium">Adjusted IRR</p>
                                <p className="text-xs text-muted-foreground">
                                  After {includeInflation ? 'inflation' : ''} 
                                  {includeInflation && includeTax ? ' and ' : ''}
                                  {includeTax ? 'tax' : ''}
                                </p>
                              </div>
                              <p className="font-bold">{isNaN(results.adjustedIrr) ? 'N/A' : formatPercent(results.adjustedIrr)}</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="analysis" className="space-y-4">
                        <div className="h-[200px]">
                          <Bar data={cashFlowChartData} options={cashFlowChartOptions} />
                        </div>
                        <Separator />
                        <div className="h-[200px]">
                          <Line data={npvChartData} options={npvChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Visualize cash flows and NPV sensitivity to discount rates
                        </div>
                      </TabsContent>
                    </Tabs>

                    {isNaN(results.irr) && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 mt-1 text-red-500" />
                            <div className="space-y-1">
                              <p className="font-medium">Calculation Warning</p>
                              <p className="text-sm text-muted-foreground">
                                IRR could not be calculated. Ensure cash flows include both positive and negative values.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Master Your Investments: IRR Calculator Guide</h2>
                <p className="mt-3 text-muted-foreground text-lg">Analyze investment returns with IRR, MIRR, NPV, and more</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding the IRR Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 id="what-is-calculator" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is the IRR Calculator?</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                      <p>
                        The <strong>IRR Calculator</strong> is a powerful tool designed to evaluate the profitability of investments or projects. By inputting an initial investment, periodic cash flows, and optional adjustments for inflation and taxes, it calculates key metrics such as Internal Rate of Return (IRR), Modified Internal Rate of Return (MIRR), Net Present Value (NPV), and Payback Period.
                      </p>
                      <p className="mt-2">Key features include:</p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Flexible input for cash flows and initial investment</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Adjustments for inflation and tax impacts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Interactive charts for cash flow and NPV analysis</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>Export results as PDF for reporting</span>
                        </li>
                      </ul>
                      <p>
                        This calculator is ideal for assessing real estate investments, business ventures, or portfolio performance, empowering users with data-driven insights.
                      </p>
                    </div>
                    <div className="md:w-[300px] h-[260px] flex-shrink-0">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                          <CardTitle className="text-sm font-medium text-center">NPV vs. Discount Rate</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full">
                            <Line
                              data={{
                                labels: ['0%', '5%', '10%', '15%', '20%'],
                                datasets: [
                                  {
                                    label: 'NPV',
                                    data: [75000, 45000, 15000, -15000, -45000], // Example data
                                    borderColor: chartColors.primary[0],
                                    backgroundColor: chartColors.secondary[0],
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                  y: { ticks: { callback: (value) => `$${value}` } },
                                  x: { title: { display: true, text: 'Discount Rate (%)' } }
                                }
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <h4 id="why-important" className="font-semibold text-xl mt-6">Why Measuring IRR Matters</h4>
                  <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Profitability Assessment</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Ensures returns meet your financial goals.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Investment Comparison</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Ranks projects by efficiency.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Risk Evaluation</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Highlights cash flow uncertainties.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p>
                    In dynamic financial markets, the IRR Calculator provides clarity to optimize investment decisions and maximize returns.
                  </p>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Mastering the IRR Calculator</h2>
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
                            <span>Enter initial investment (e.g., $100,000)</span>
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
                          Add Cash Flows
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Plus className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Input cash flows for each period (e.g., $20,000)</span>
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
                            <span>Set discount and reinvestment rates</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Switch className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Toggle inflation and tax adjustments</span>
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
                            <span>Review IRR, MIRR, NPV, and Payback Period</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <LineChart className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Explore cash flow and NPV charts</span>
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
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Decision Rule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">IRR</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Rate where NPV equals zero</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Exceeds hurdle rate</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">MIRR</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Adjusted IRR with reinvestment</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Realistic return measure</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">NPV</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Present value of cash flows</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Positive for value creation</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Payback Period</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Time to recover investment</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Shorter is better</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Pro Tip:</strong> Focus on NPV for project selection and IRR for quick profitability checks. Use MIRR for realistic reinvestment scenarios.
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
                        <span className="text-2xl">Key Factors in Investment Analysis</span>
                      </div>
                    </CardTitle>
                    <CardDescription>Understanding the drivers of profitability</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h3 id="irr-mirr" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        IRR vs. MIRR
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p>
                            The <strong>Internal Rate of Return (IRR)</strong> assumes reinvestment at the IRR itself, which can be unrealistic. The <strong>Modified Internal Rate of Return (MIRR)</strong> uses a more practical reinvestment rate, providing a better measure for real-world scenarios.
                          </p>
                          <ul className="mt-4 space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>IRR:</strong> Best for quick profitability checks</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>MIRR:</strong> More realistic for reinvestment scenarios</span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                              <strong>Example:</strong> An IRR of 15% might assume reinvestment at 15%, while MIRR uses a safer 8%, yielding a lower but more achievable rate.
                            </p>
                          </div>
                        </div>
                        
                        <div className="h-[220px]">
                          <h4 className="text-center text-sm font-medium mb-2">IRR vs. MIRR</h4>
                          <Bar
                            data={{
                              labels: ['IRR', 'MIRR'],
                              datasets: [
                                {
                                  label: 'Return (%)',
                                  data: [15, 12], // Example data
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
                        <h3 id="npv" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Net Present Value (NPV)
                        </h3>
                        <p>
                          <strong>NPV</strong> measures the present value of future cash flows, discounted at a specific rate, to determine an investment's worth. A positive NPV indicates value creation.
                        </p>
                        
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Year</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Cash Flow</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Discounted (10%)</th>
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
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$50,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$45,455</td>
                              </tr>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">2</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$60,000</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$49,587</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div>
                        <h3 id="payback" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <RefreshCw className="h-5 w-5" />
                          Payback Period
                        </h3>
                        <p>
                          The <strong>Payback Period</strong> indicates how long it takes to recover the initial investment. While simple, it ignores cash flows beyond recovery and the time value of money.
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">Payback Example</h4>
                          <div className="mt-3">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div className="font-medium text-blue-700 dark:text-blue-400">Initial Investment</div>
                              <div className="text-blue-600 dark:text-blue-500">$100,000</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Year 1 Cash Flow</div>
                              <div className="text-blue-600 dark:text-blue-500">$50,000</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Year 2 Cash Flow</div>
                              <div className="text-blue-600 dark:text-blue-500">$60,000</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">Payback Period</div>
                              <div className="text-blue-600 dark:text-blue-500">1.83 years</div>
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
                        <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Private Equity IRR</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">14%</p>
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">2020-2023 Avg</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                          <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">Hurdle Rate</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">11.8%</p>
                        <p className="mt-1 text-sm text-green-600 dark:text-green-500">Corporate Avg</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                          <RefreshCw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Venture Capital IRR</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">18%</p>
                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">2020-2023 Avg</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                          <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Real Estate IRR</h3>
                        <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">10%</p>
                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">2020-2023 Avg</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="cash-flow-impact" className="text-xl font-bold mb-4">Impact of Cash Flow Timing</h3>
                <Card className="bg-white dark:bg-gray-900 mb-4">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p>
                          The <strong>timing of cash flows</strong> significantly affects IRR and NPV. Early positive cash flows increase IRR, while delayed inflows lower it due to the time value of money.
                        </p>
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Cash Flow Timing Example</h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">Year 1: $50,000</span>
                              <span className="font-medium text-red-700 dark:text-red-400">IRR: 15%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">Year 5: $50,000</span>
                              <span className="font-medium text-red-700 dark:text-red-400">IRR: 8%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-[280px]">
                        <h4 className="text-center text-sm font-medium mb-3">Cash Flow Timing Impact</h4>
                        <Line
                          data={{
                            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                            datasets: [
                              {
                                label: 'Early Cash Flow',
                                data: [50000, 0, 0, 0, 0],
                                borderColor: 'rgba(99, 102, 241, 0.8)',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              },
                              {
                                label: 'Late Cash Flow',
                                data: [0, 0, 0, 0, 50000],
                                borderColor: 'rgba(220, 38, 38, 0.8)',
                                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: { ticks: { callback: (value) => `$${value}` } }
                            },
                            plugins: { legend: { display: true } }
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
                      <p className="font-medium text-amber-800 dark:text-amber-300">Optimizing Cash Flows</p>
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                        Structure projects to generate early positive cash flows to maximize IRR and NPV.
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
                    <CardDescription>Leverage data-driven insights for smarter investing</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      The <strong>IRR Calculator</strong> transforms complex financial metrics into actionable insights. By understanding IRR, MIRR, NPV, and Payback Period, you can optimize your investment strategy and achieve your financial goals.
                    </p>
                    
                    <p className="mt-4" id="next-steps">Take action today:</p>
                    
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
                            <span className="text-green-800 dark:text-green-300">Monitor project performance</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                            <span className="text-green-800 dark:text-green-300">Optimize cash flow timing</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                            <span className="text-green-800 dark:text-green-300">Diversify investments</span>
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
                            Use the <strong>IRR Calculator</strong> to evaluate your investments. Explore related tools:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/npv">
                                <DollarSign className="h-4 w-4 mr-1" />
                                NPV Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/roi">
                                <Percent className="h-4 w-4 mr-1" />
                                ROI Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/payback-period">
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Payback Period
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
      <SaveCalculationButton calculatorType="irr" inputs={{}} results={{}} />
      </main>
      <SiteFooter />
    </div>
  )
}