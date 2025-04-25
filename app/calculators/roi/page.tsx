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
import { Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Plus, Minus, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { ChartOptions } from 'chart.js'
import Link from "next/link"
import RoiSchema from './schema';

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
  LineElement
)

interface CashFlow {
  id: number
  inflow: number
  outflow: number
  year: number
}

export default function ROICalculator() {
  // Basic Inputs
  const [projectName, setProjectName] = useState("")
  const [initialInvestment, setInitialInvestment] = useState(100000)
  const [finalValue, setFinalValue] = useState(150000)
  const [investmentPeriod, setInvestmentPeriod] = useState(5)
  const [periodType, setPeriodType] = useState("annual")
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([
    { id: 1, inflow: 30000, outflow: 10000, year: 1 },
    { id: 2, inflow: 35000, outflow: 12000, year: 2 },
    { id: 3, inflow: 40000, outflow: 15000, year: 3 },
    { id: 4, inflow: 45000, outflow: 18000, year: 4 },
    { id: 5, inflow: 50000, outflow: 20000, year: 5 }
  ])

  // Advanced Inputs
  const [discountRate, setDiscountRate] = useState(10)
  const [reinvestmentRate, setReinvestmentRate] = useState(8)
  const [inflationRate, setInflationRate] = useState(2.5)
  const [includeInflation, setIncludeInflation] = useState(false)
  const [taxRate, setTaxRate] = useState(25)
  const [includeTax, setIncludeTax] = useState(false)
  const [depreciationAmount, setDepreciationAmount] = useState(5000)
  const [includeDepreciation, setIncludeDepreciation] = useState(false)

  // Results
  const [results, setResults] = useState({
    simpleROI: 0,
    annualizedROI: 0,
    npv: 0,
    irr: 0,
    mirr: 0,
    realROI: 0,
    afterTaxROI: 0,
    totalProfit: 0,
    breakEvenPeriod: 0,
    cagr: 0
  })

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Validate inputs
  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {}
    if (initialInvestment <= 0) newErrors.initialInvestment = "Initial investment must be positive"
    if (finalValue < 0) newErrors.finalValue = "Final value cannot be negative"
    if (investmentPeriod <= 0) newErrors.investmentPeriod = "Investment period must be positive"
    if (discountRate < 0) newErrors.discountRate = "Discount rate cannot be negative"
    if (reinvestmentRate < 0) newErrors.reinvestmentRate = "Reinvestment rate cannot be negative"
    if (inflationRate < 0) newErrors.inflationRate = "Inflation rate cannot be negative"
    if (taxRate < 0 || taxRate > 100) newErrors.taxRate = "Tax rate must be between 0 and 100"
    if (depreciationAmount < 0) newErrors.depreciationAmount = "Depreciation cannot be negative"
    cashFlows.forEach(cf => {
      if (cf.inflow < 0) newErrors[`inflow-${cf.id}`] = "Cash inflow cannot be negative"
      if (cf.outflow < 0) newErrors[`outflow-${cf.id}`] = "Cash outflow cannot be negative"
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Calculate Simple ROI
  const calculateSimpleROI = () => {
    const totalInflows = cashFlows.reduce((sum, cf) => sum + cf.inflow, 0)
    const totalOutflows = cashFlows.reduce((sum, cf) => sum + cf.outflow, 0)
    const netProfit = totalInflows - totalOutflows + (finalValue - initialInvestment)
    return (netProfit / initialInvestment) * 100
  }

  // Calculate Annualized ROI
  const calculateAnnualizedROI = () => {
    const totalReturn = finalValue / initialInvestment
    const periodInYears = periodType === "monthly" ? investmentPeriod / 12 : investmentPeriod
    return (Math.pow(totalReturn, 1 / periodInYears) - 1) * 100
  }

  // Calculate NPV
  const calculateNPV = () => {
    let npv = -initialInvestment
    const adjustedDiscountRate = discountRate / 100
    cashFlows.forEach((cf, index) => {
      const netCashFlow = cf.inflow - cf.outflow - (includeDepreciation ? depreciationAmount : 0)
      npv += netCashFlow / Math.pow(1 + adjustedDiscountRate, index + 1)
    })
    npv += finalValue / Math.pow(1 + adjustedDiscountRate, investmentPeriod)
    return npv
  }

  // Calculate IRR using Newton-Raphson method
  const calculateIRR = () => {
    const cashFlowValues = [-initialInvestment]
    cashFlows.forEach(cf => cashFlowValues.push(cf.inflow - cf.outflow - (includeDepreciation ? depreciationAmount : 0)))
    cashFlowValues.push(finalValue)

    let guess = 0.1
    const maxIterations = 1000
    const tolerance = 0.0000001

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0
      let derivativeNpv = 0

      cashFlowValues.forEach((cf, t) => {
        const factor = Math.pow(1 + guess, t)
        npv += cf / factor
        derivativeNpv -= t * cf / (factor * (1 + guess))
      })

      const nextGuess = guess - npv / derivativeNpv
      if (Math.abs(nextGuess - guess) < tolerance) {
        return nextGuess * 100
      }
      guess = nextGuess
    }

    return NaN
  }

  // Calculate MIRR
  const calculateMIRR = () => {
    const positiveCFs = cashFlows.map(cf => Math.max(cf.inflow - cf.outflow - (includeDepreciation ? depreciationAmount : 0), 0))
    const negativeCFs = cashFlows.map(cf => Math.min(cf.inflow - cf.outflow - (includeDepreciation ? depreciationAmount : 0), 0))

    const fvPositive = positiveCFs.reduce((acc, cf, i) => 
      acc + cf * Math.pow(1 + reinvestmentRate / 100, cashFlows.length - i - 1), 0)
    
    const pvNegative = negativeCFs.reduce((acc, cf, i) => 
      acc + cf / Math.pow(1 + discountRate / 100, i), -initialInvestment)

    return (Math.pow(Math.abs(fvPositive / -pvNegative), 1 / cashFlows.length) - 1) * 100
  }

  // Calculate Real (Inflation-Adjusted) ROI
  const calculateRealROI = (nominalROI: number) => {
    return ((1 + nominalROI / 100) / (1 + inflationRate / 100) - 1) * 100
  }

  // Calculate After-Tax ROI
  const calculateAfterTaxROI = (roi: number) => {
    return roi * (1 - taxRate / 100)
  }

  // Calculate Break-Even Period
  const calculateBreakEvenPeriod = () => {
    let cumulativeReturn = -initialInvestment
    let years = 0

    for (let i = 0; i < cashFlows.length; i++) {
      cumulativeReturn += cashFlows[i].inflow - cashFlows[i].outflow - (includeDepreciation ? depreciationAmount : 0)
      if (cumulativeReturn >= 0) {
        const previousCumulative = cumulativeReturn - (cashFlows[i].inflow - cashFlows[i].outflow - (includeDepreciation ? depreciationAmount : 0))
        years = i + (Math.abs(previousCumulative) / (cashFlows[i].inflow - cashFlows[i].outflow - (includeDepreciation ? depreciationAmount : 0)))
        break
      }
    }

    return years || investmentPeriod
  }

  // Calculate CAGR
  const calculateCAGR = () => {
    const endValue = finalValue + cashFlows.reduce((sum, cf) => sum + cf.inflow - cf.outflow - (includeDepreciation ? depreciationAmount : 0), 0)
    const periodInYears = periodType === "monthly" ? investmentPeriod / 12 : investmentPeriod
    return (Math.pow(endValue / initialInvestment, 1 / periodInYears) - 1) * 100
  }

  // Update calculations
  useEffect(() => {
    if (!validateInputs()) return

    const simpleROI = calculateSimpleROI()
    const annualizedROI = calculateAnnualizedROI()
    const npv = calculateNPV()
    const irr = calculateIRR()
    const mirr = calculateMIRR()
    const realROI = includeInflation ? calculateRealROI(simpleROI) : simpleROI
    const afterTaxROI = includeTax ? calculateAfterTaxROI(realROI) : realROI
    const totalProfit = cashFlows.reduce((sum, cf) => sum + cf.inflow - cf.outflow - (includeDepreciation ? depreciationAmount : 0), 0) + 
      (finalValue - initialInvestment)
    const breakEvenPeriod = calculateBreakEvenPeriod()
    const cagr = calculateCAGR()

    setResults({
      simpleROI: isFinite(simpleROI) ? simpleROI : 0,
      annualizedROI: isFinite(annualizedROI) ? annualizedROI : 0,
      npv: isFinite(npv) ? npv : 0,
      irr: isFinite(irr) ? irr : 0,
      mirr: isFinite(mirr) ? mirr : 0,
      realROI: isFinite(realROI) ? realROI : 0,
      afterTaxROI: isFinite(afterTaxROI) ? afterTaxROI : 0,
      totalProfit: isFinite(totalProfit) ? totalProfit : 0,
      breakEvenPeriod: isFinite(breakEvenPeriod) ? breakEvenPeriod : 0,
      cagr: isFinite(cagr) ? cagr : 0
    })
  }, [
    initialInvestment,
    finalValue,
    investmentPeriod,
    periodType,
    cashFlows,
    discountRate,
    reinvestmentRate,
    inflationRate,
    includeInflation,
    taxRate,
    includeTax,
    depreciationAmount,
    includeDepreciation
  ])

  // Add new cash flow period
  const addCashFlow = () => {
    const newId = cashFlows.length > 0 ? Math.max(...cashFlows.map(cf => cf.id)) + 1 : 1
    const newYear = cashFlows.length > 0 ? Math.max(...cashFlows.map(cf => cf.year)) + 1 : 1
    setCashFlows([...cashFlows, { id: newId, inflow: 0, outflow: 0, year: newYear }])
  }

  // Remove cash flow period
  const removeCashFlow = (id: number) => {
    if (cashFlows.length > 1) {
      setCashFlows(cashFlows.filter(cf => cf.id !== id))
    }
  }

  // Update cash flow values
  const updateCashFlow = (id: number, field: 'inflow' | 'outflow', value: number) => {
    setCashFlows(cashFlows.map(cf => 
      cf.id === id ? { ...cf, [field]: Math.max(0, value) } : cf
    ))
  }

  // Chart data
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

  const cashFlowChartData = {
    labels: ['Initial', ...cashFlows.map(cf => `Year ${cf.year}`), 'Final'],
    datasets: [
      {
        label: 'Cash Inflows',
        data: [-initialInvestment, ...cashFlows.map(cf => cf.inflow), finalValue],
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Cash Outflows',
        data: [0, ...cashFlows.map(cf => -cf.outflow), 0],
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

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

  const roiComparisonData = {
    labels: ['Simple ROI', 'Annualized ROI', 'IRR', 'MIRR', 'CAGR'],
    datasets: [
      {
        label: 'Return Rates (%)',
        data: [
          results.simpleROI,
          results.annualizedROI,
          results.irr,
          results.mirr,
          results.cagr
        ],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const roiComparisonOptions: ChartOptions<'bar'> = {
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

  const cumulativeReturnData = {
    labels: ['Initial', ...cashFlows.map(cf => `Year ${cf.year}`)],
    datasets: [
      {
        label: 'Cumulative Return',
        data: (() => {
          let cumulative = -initialInvestment
          return [-initialInvestment, ...cashFlows.map(cf => {
            cumulative += cf.inflow - cf.outflow - (includeDepreciation ? depreciationAmount : 0)
            return cumulative
          })]
        })(),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4,
        fill: true
      }
    ]
  }

  const cumulativeReturnOptions: ChartOptions<'line'> = {
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
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `$${Number(context.raw).toLocaleString()}`
        }
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + '%'
  }

  const formatYears = (years: number) => {
    const wholeYears = Math.floor(years)
    const months = Math.round((years - wholeYears) * 12)
    return `${wholeYears} years${months > 0 ? ` ${months} months` : ''}`
  }

  const exportPDF = async () => {
    const element = document.getElementById('results-section')
    if (!element) return
    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`${projectName || 'roi'}-calculator-results.pdf`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <RoiSchema /> 
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        ROI <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Analyze your investments with advanced ROI metrics including NPV, IRR, and MIRR.
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
                      Enter your investment information and cash flows to calculate ROI and other metrics.
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
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="initial-investment">Initial Investment ($)</Label>
                          <Input
                            id="initial-investment"
                            type="number"
                            value={initialInvestment}
                            onChange={(e) => setInitialInvestment(Math.max(0, Number(e.target.value)))}
                            className={errors.initialInvestment ? "border-red-500" : ""}
                          />
                          {errors.initialInvestment && (
                            <p className="text-red-500 text-sm">{errors.initialInvestment}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="final-value">Final Value / Sale Price ($)</Label>
                          <Input
                            id="final-value"
                            type="number"
                            value={finalValue}
                            onChange={(e) => setFinalValue(Math.max(0, Number(e.target.value)))}
                            className={errors.finalValue ? "border-red-500" : ""}
                          />
                          {errors.finalValue && (
                            <p className="text-red-500 text-sm">{errors.finalValue}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="investment-period">Investment Period</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              id="investment-period"
                              type="number"
                              value={investmentPeriod}
                              onChange={(e) => setInvestmentPeriod(Math.max(0, Number(e.target.value)))}
                              className={errors.investmentPeriod ? "border-red-500" : ""}
                            />
                            <Select value={periodType} onValueChange={setPeriodType}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select period" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="annual">Years</SelectItem>
                                <SelectItem value="monthly">Months</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {errors.investmentPeriod && (
                            <p className="text-red-500 text-sm">{errors.investmentPeriod}</p>
                          )}
                        </div>
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
                        >
                          <Plus className="h-4 w-4" />
                          Add Period
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {cashFlows.map((cf) => (
                          <div key={cf.id} className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`inflow-${cf.id}`}>
                                Year {cf.year} Cash Inflow ($)
                              </Label>
                              <Input
                                id={`inflow-${cf.id}`}
                                type="number"
                                value={cf.inflow}
                                onChange={(e) => updateCashFlow(cf.id, 'inflow', Number(e.target.value))}
                                className={errors[`inflow-${cf.id}`] ? "border-red-500" : ""}
                              />
                              {errors[`inflow-${cf.id}`] && (
                                <p className="text-red-500 text-sm">{errors[`inflow-${cf.id}`]}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`outflow-${cf.id}`}>
                                Year {cf.year} Cash Outflow ($)
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  id={`outflow-${cf.id}`}
                                  type="number"
                                  value={cf.outflow}
                                  onChange={(e) => updateCashFlow(cf.id, 'outflow', Number(e.target.value))}
                                  className={errors[`outflow-${cf.id}`] ? "border-red-500" : ""}
                                />
                                {cashFlows.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeCashFlow(cf.id)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              {errors[`outflow-${cf.id}`] && (
                                <p className="text-red-500 text-sm">{errors[`outflow-${cf.id}`]}</p>
                              )}
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
                            className={errors.discountRate ? "border-red-500" : ""}
                          />
                          {errors.discountRate && (
                            <p className="text-red-500 text-sm">{errors.discountRate}</p>
                          )}
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
                            className={errors.reinvestmentRate ? "border-red-500" : ""}
                          />
                          {errors.reinvestmentRate && (
                            <p className="text-red-500 text-sm">{errors.reinvestmentRate}</p>
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
                                    Adjust returns for inflation to see real returns
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
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
                                className={errors.inflationRate ? "border-red-500" : ""}
                              />
                              {errors.inflationRate && (
                                <p className="text-red-500 text-sm">{errors.inflationRate}</p>
                              )}
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
                                className={errors.taxRate ? "border-red-500" : ""}
                              />
                              {errors.taxRate && (
                                <p className="text-red-500 text-sm">{errors.taxRate}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="include-depreciation">Include Depreciation</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Account for asset depreciation in calculations
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Switch
                              id="include-depreciation"
                              checked={includeDepreciation}
                              onCheckedChange={setIncludeDepreciation}
                            />
                          </div>
                          {includeDepreciation && (
                            <div className="space-y-2">
                              <Label htmlFor="depreciation-amount">Annual Depreciation ($)</Label>
                              <Input
                                id="depreciation-amount"
                                type="number"
                                value={depreciationAmount}
                                onChange={(e) => setDepreciationAmount(Math.max(0, Number(e.target.value)))}
                                className={errors.depreciationAmount ? "border-red-500" : ""}
                              />
                              {errors.depreciationAmount && (
                                <p className="text-red-500 text-sm">{errors.depreciationAmount}</p>
                              )}
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
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Initial Investment</p>
                        <p className="text-2xl font-bold">{formatCurrency(initialInvestment)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
                        <p className={`text-2xl font-bold ${results.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(results.totalProfit)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="metrics" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="metrics">Metrics</TabsTrigger>
                        <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                      </TabsList>
                      <TabsContent value="metrics" className="space-y-4">
                        <div className="grid gap-4">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Simple ROI</p>
                              <p className="text-xs text-muted-foreground">Total return on investment</p>
                            </div>
                            <p className="font-bold">{formatPercent(results.simpleROI)}</p>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Annualized ROI</p>
                              <p className="text-xs text-muted-foreground">Average yearly return</p>
                            </div>
                            <p className="font-bold">{formatPercent(results.annualizedROI)}</p>
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
                              <p className="text-sm font-medium">IRR</p>
                              <p className="text-xs text-muted-foreground">Internal Rate of Return</p>
                            </div>
                            <p className="font-bold">{formatPercent(results.irr)}</p>
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
                              <p className="text-sm font-medium">Break-Even Period</p>
                              <p className="text-xs text-muted-foreground">Time to recover investment</p>
                            </div>
                            <p className="font-bold">{formatYears(results.breakEvenPeriod)}</p>
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
                                <p className="text-sm font-medium">Adjusted ROI</p>
                                <p className="text-xs text-muted-foreground">
                                  After {includeInflation ? 'inflation' : ''} 
                                  {includeInflation && includeTax ? ' and ' : ''}
                                  {includeTax ? 'tax' : ''}
                                </p>
                              </div>
                              <p className="font-bold">{formatPercent(results.afterTaxROI)}</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="cashflow" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={cashFlowChartData} options={cashFlowChartOptions} />
                        </div>
                        <Separator />
                        <div className="h-[200px]">
                          <Line data={cumulativeReturnData} options={cumulativeReturnOptions} />
                        </div>
                      </TabsContent>
                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={roiComparisonData} options={roiComparisonOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Comparison of different return metrics
                        </div>
                      </TabsContent>
                    </Tabs>
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
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">
                  Financial Resource
                </span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                  Master Your Investments with the ROI Calculator
                </h2>
                <p className="mt-3 text-muted-foreground text-lg">
                  A comprehensive guide to understanding and using ROI metrics
                </p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    What is the ROI Calculator?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p>
                    The <strong>ROI Calculator</strong> is a powerful tool designed to help investors evaluate the profitability of their investments. It goes beyond basic ROI calculations by incorporating advanced metrics like Net Present Value (NPV), Internal Rate of Return (IRR), and Modified Internal Rate of Return (MIRR). These metrics provide a nuanced understanding of an investment’s performance, accounting for factors such as the time value of money, cash flow timing, and reinvestment rates.
                  </p>
                  <p className="mt-4">
                    Understanding return on investment is crucial for making informed financial decisions. Whether you’re evaluating a real estate project, a business venture, or a stock portfolio, the ROI Calculator equips you with the data needed to assess potential gains and risks accurately.
                  </p>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <h2 className="text-2xl font-bold mb-4">How to Use the ROI Calculator</h2>
                <div className="space-y-4">
                  <p>Follow these steps to analyze your investment:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      <strong>Enter Investment Details:</strong> Input the initial investment amount, final value, and investment period (in years or months).
                    </li>
                    <li>
                      <strong>Add Cash Flows:</strong> Specify annual inflows and outflows using the "Add Period" button for additional years.
                    </li>
                    <li>
                      <strong>Customize Advanced Options:</strong> Adjust discount rate, reinvestment rate, and toggle inflation, tax, or depreciation adjustments.
                    </li>
                    <li>
                      <strong>Analyze Results:</strong> Review key metrics and explore interactive charts for deeper insights.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Understanding Metrics Section */}
              <div className="mb-12" id="metrics">
                <h2 className="text-2xl font-bold mb-4">Understanding ROI Metrics</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Simple ROI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Measures total return as a percentage of the initial investment. It’s a quick metric but doesn’t account for time or cash flow timing.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Annualized ROI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Calculates the average yearly return, ideal for comparing investments of different durations.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>NPV</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Discounts future cash flows to their present value, indicating whether an investment adds value.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>IRR</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>The rate at which NPV equals zero, representing the investment’s effective annual return.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>MIRR</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>An enhanced IRR that assumes reinvestment at a specified rate, offering a more realistic return measure.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Break-Even Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Shows how long it takes to recover the initial investment through cash flows.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>CAGR</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Compound Annual Growth Rate reflects the annual growth rate over the investment period.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Adjusted ROI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Includes adjustments for inflation and taxes, providing a real-world return perspective.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Visualizing Performance Section */}
              <div className="mb-12" id="visuals">
                <h2 className="text-2xl font-bold mb-4">Visualizing Investment Performance</h2>
                <p>Interactive charts help you understand your investment dynamics:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Cash Flow Chart:</strong> Displays inflows and outflows over time.</li>
                  <li><strong>Cumulative Return Chart:</strong> Tracks the growth or decline of your investment.</li>
                  <li><strong>ROI Comparison Chart:</strong> Compares various return metrics side by side.</li>
                </ul>
              </div>

              {/* Insights and Trends Section */}
              <div className="mb-12" id="insights">
                <h2 className="text-2xl font-bold mb-4">Investment Insights and Trends</h2>
                <div className="space-y-4">
                  <p><strong>Global Trends:</strong> In 2023, global venture capital investments reached $300 billion, with a focus on tech and renewable energy.</p>
                  <p><strong>Challenges:</strong> Investors often face difficulties with cash flow forecasting and market volatility.</p>
                  <p><strong>Inflation Impact:</strong> With an average inflation rate of 3%, unadjusted returns can overstate real gains.</p>
                </div>
              </div>

              {/* Conclusion Section */}
              <div className="mb-12" id="conclusion">
                <h2 className="text-2xl font-bold mb-4">Conclusion and Next Steps</h2>
                <p>
                  The ROI Calculator is an essential tool for maximizing returns and minimizing risks. By providing detailed insights into your investment’s performance, it empowers you to make data-driven decisions aligned with your financial goals.
                </p>
                <p className="mt-4">
                  Explore related tools like the <Link href="/calculators/npv" className="text-blue-600 hover:underline">NPV Calculator</Link>, <Link href="/calculators/irr" className="text-blue-600 hover:underline">IRR Calculator</Link>, or <Link href="/calculators/payback-period" className="text-blue-600 hover:underline">Payback Period Calculator</Link> to further enhance your investment analysis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Calculators Section */}
        <section className="py-12">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Related Calculators</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-xl">NPV Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Calculate the Net Present Value of your investments using custom discount rates.</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/calculators/npv">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-xl">IRR Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Calculate the Internal Rate of Return for your investment projects.</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/calculators/irr">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-xl">Payback Period Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Determine how long it will take to recover the cost of an investment.</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/calculators/payback-period">Try Calculator</Link>
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