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
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Percent, Tag, Store, ShoppingCart, InfoIcon, CheckCircle, ArrowUp, AlertTriangle, ArrowBigDown, Target, Users, Eye, LayoutGrid, ArrowLeftRight, BarChart4, FileText, PercentIcon, Landmark, ArrowRight, ArrowDownUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import MarginSchema from './schema';

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

export default function MarginCalculator() {
  // Basic Inputs
  const [costPrice, setCostPrice] = useState<number>(100)
  const [sellingPrice, setSellingPrice] = useState<number>(150)
  const [markupPercentage, setMarkupPercentage] = useState<number>(50)
  const [desiredMargin, setDesiredMargin] = useState<number>(33)
  
  // Additional Costs
  const [includeAdditionalCosts, setIncludeAdditionalCosts] = useState<boolean>(false)
  const [fixedCosts, setFixedCosts] = useState<number>(1000)
  const [variableCosts, setVariableCosts] = useState<number>(10)
  const [unitsPerMonth, setUnitsPerMonth] = useState<number>(100)
  
  // Tax and Discount
  const [includeTax, setIncludeTax] = useState<boolean>(false)
  const [taxRate, setTaxRate] = useState<number>(10)
  const [includeDiscount, setIncludeDiscount] = useState<boolean>(false)
  const [discountRate, setDiscountRate] = useState<number>(5)
  
  // Currency
  const [currency, setCurrency] = useState<string>("USD")
  const [calculationMode, setCalculationMode] = useState<"forward" | "reverse">("forward")
  
  // Results
  const [results, setResults] = useState({
    profitMargin: 0,
    markup: 0,
    grossProfit: 0,
    breakEvenPrice: 0,
    netProfit: 0,
    revenueBreakdown: {
      cost: 0,
      profit: 0,
      tax: 0,
      discount: 0
    },
    monthlyProjection: {
      revenue: 0,
      costs: 0,
      profit: 0
    }
  })

  // Calculate all results
  useEffect(() => {
    let effectiveCostPrice = costPrice
    let effectiveSellingPrice = sellingPrice
    
    // Add variable costs to cost price if included
    if (includeAdditionalCosts) {
      effectiveCostPrice += variableCosts
    }
    
    // Apply discount if included
    if (includeDiscount) {
      effectiveSellingPrice *= (1 - discountRate / 100)
    }
    
    // Calculate base metrics
    const grossProfit = effectiveSellingPrice - effectiveCostPrice
    const profitMargin = (grossProfit / effectiveSellingPrice) * 100
    const markup = ((effectiveSellingPrice - effectiveCostPrice) / effectiveCostPrice) * 100
    
    // Calculate break-even price including fixed costs
    let breakEvenPrice = effectiveCostPrice
    if (includeAdditionalCosts) {
      breakEvenPrice += (fixedCosts / unitsPerMonth)
    }
    
    // Calculate net profit after tax
    let netProfit = grossProfit
    if (includeTax) {
      netProfit *= (1 - taxRate / 100)
    }
    
    // Calculate monthly projections
    const monthlyRevenue = effectiveSellingPrice * unitsPerMonth
    const monthlyCosts = effectiveCostPrice * unitsPerMonth + (includeAdditionalCosts ? fixedCosts : 0)
    const monthlyProfit = monthlyRevenue - monthlyCosts
    
    // Revenue breakdown
    const revenueBreakdown = {
      cost: effectiveCostPrice,
      profit: grossProfit,
      tax: includeTax ? effectiveSellingPrice * (taxRate / 100) : 0,
      discount: includeDiscount ? sellingPrice * (discountRate / 100) : 0
    }
    
    setResults({
      profitMargin,
      markup,
      grossProfit,
      breakEvenPrice,
      netProfit,
      revenueBreakdown,
      monthlyProjection: {
        revenue: monthlyRevenue,
        costs: monthlyCosts,
        profit: monthlyProfit
      }
    })
    
  }, [
    costPrice,
    sellingPrice,
    markupPercentage,
    desiredMargin,
    includeAdditionalCosts,
    fixedCosts,
    variableCosts,
    unitsPerMonth,
    includeTax,
    taxRate,
    includeDiscount,
    discountRate
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

  // Revenue breakdown chart
  const revenueBreakdownData = {
    labels: ['Cost', 'Profit', 'Tax', 'Discount'],
    datasets: [{
      data: [
        results.revenueBreakdown.cost,
        results.revenueBreakdown.profit,
        results.revenueBreakdown.tax,
        results.revenueBreakdown.discount
      ],
      backgroundColor: chartColors.primary,
      borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
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
          const total = Object.values(results.revenueBreakdown).reduce((a, b) => a + b, 0)
          return ((value / total) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Monthly projection chart
  const monthlyProjectionData = {
    labels: ['Revenue', 'Costs', 'Profit'],
    datasets: [
      {
        label: 'Monthly Projection',
        data: [
          results.monthlyProjection.revenue,
          results.monthlyProjection.costs,
          results.monthlyProjection.profit
        ],
        backgroundColor: chartColors.primary.slice(0, 3),
        borderColor: chartColors.secondary.slice(0, 3).map(color => color.replace('0.2', '1')),
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
            return currency + ' ' + (typeof value === 'number' ? value.toLocaleString() : value)
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
        formatter: (value: number) => currency + ' ' + value.toLocaleString()
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
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
    pdf.save('margin-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <MarginSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Margin <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate profit margins, markups, and analyze pricing strategies for your business.
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
                    <CardTitle>Enter Product Details</CardTitle>
                    <CardDescription>
                      Provide pricing information and additional costs to calculate margins.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Basic Pricing */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Basic Pricing</h3>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="JPY">JPY (¥)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="cost-price">Cost Price</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="cost-price"
                              type="number"
                              className="pl-9"
                              value={costPrice || ''} onChange={(e) => setCostPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="selling-price">Selling Price</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="selling-price"
                              type="number"
                              className="pl-9"
                              value={sellingPrice || ''} onChange={(e) => setSellingPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="markup">Markup Percentage</Label>
                            <span className="text-sm text-muted-foreground">{markupPercentage}%</span>
                          </div>
                          <Slider
                            id="markup"
                            min={0}
                            max={200}
                            step={1}
                            value={[markupPercentage]}
                            onValueChange={(value) => setMarkupPercentage(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="desired-margin">Desired Margin</Label>
                            <span className="text-sm text-muted-foreground">{desiredMargin}%</span>
                          </div>
                          <Slider
                            id="desired-margin"
                            min={0}
                            max={100}
                            step={1}
                            value={[desiredMargin]}
                            onValueChange={(value) => setDesiredMargin(value[0])}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Costs */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Additional Costs</h3>
                        <Switch
                          checked={includeAdditionalCosts}
                          onCheckedChange={setIncludeAdditionalCosts}
                        />
                      </div>
                      {includeAdditionalCosts && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="fixed-costs">Monthly Fixed Costs</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="fixed-costs"
                                type="number"
                                className="pl-9"
                                value={fixedCosts || ''} onChange={(e) => setFixedCosts(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="variable-costs">Variable Costs (per unit)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="variable-costs"
                                type="number"
                                className="pl-9"
                                value={variableCosts || ''} onChange={(e) => setVariableCosts(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="units">Units Sold per Month</Label>
                            <Input
                              id="units"
                              type="number"
                              value={unitsPerMonth || ''} onChange={(e) => setUnitsPerMonth(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tax and Discount */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Tax & Discount</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="tax-toggle">Include Tax</Label>
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
                                max={30}
                                step={0.5}
                                value={[taxRate]}
                                onValueChange={(value) => setTaxRate(value[0])}
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="discount-toggle">Include Discount</Label>
                            <Switch
                              id="discount-toggle"
                              checked={includeDiscount}
                              onCheckedChange={setIncludeDiscount}
                            />
                          </div>
                          {includeDiscount && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="discount-rate">Discount Rate</Label>
                                <span className="text-sm text-muted-foreground">{discountRate}%</span>
                              </div>
                              <Slider
                                id="discount-rate"
                                min={0}
                                max={50}
                                step={1}
                                value={[discountRate]}
                                onValueChange={(value) => setDiscountRate(value[0])}
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
                        <p className="text-sm text-muted-foreground">Profit Margin</p>
                        <p className="text-2xl font-bold text-primary">{formatPercent(results.profitMargin)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Markup</p>
                        <p className="text-2xl font-bold">{formatPercent(results.markup)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={revenueBreakdownData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Price Breakdown</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Cost Price</span>
                              <span className="font-medium">{formatCurrency(results.revenueBreakdown.cost)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Gross Profit</span>
                              <span className="font-medium">{formatCurrency(results.revenueBreakdown.profit)}</span>
                            </div>
                            {includeTax && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Tax</span>
                                <span className="font-medium">{formatCurrency(results.revenueBreakdown.tax)}</span>
                              </div>
                            )}
                            {includeDiscount && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Discount</span>
                                <span className="font-medium">{formatCurrency(results.revenueBreakdown.discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Net Profit</span>
                              <span>{formatCurrency(results.netProfit)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="monthly" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={monthlyProjectionData} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Monthly Projections</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Revenue</span>
                              <span className="font-medium">{formatCurrency(results.monthlyProjection.revenue)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Costs</span>
                              <span className="font-medium">{formatCurrency(results.monthlyProjection.costs)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Monthly Profit</span>
                              <span>{formatCurrency(results.monthlyProjection.profit)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Break-even Analysis */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Break-even Analysis</p>
                            <p className="text-sm text-muted-foreground">
                              Break-even price: {formatCurrency(results.breakEvenPrice)}
                              {includeAdditionalCosts && (
                                <span> (including fixed and variable costs)</span>
                              )}
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Business Essentials</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Margin: The Key to Business Profitability</h2>
        <p className="mt-3 text-muted-foreground text-lg">Master the concepts of margin, markup, and pricing strategies for business success</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            The Fundamentals of Margin Calculations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                <strong>Margin</strong> refers to the difference between your selling price and the cost of goods sold, expressed as a percentage of the selling price. It's a critical metric for businesses as it directly impacts profitability, pricing strategies, and long-term financial sustainability.
              </p>
              <p className="mt-3">
                Unlike markup (which is calculated based on cost), margin is calculated based on revenue. This distinction is crucial for accurately analyzing business performance and making informed pricing decisions. A margin calculator helps businesses determine optimal pricing strategies and evaluate profitability at various price points.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Key Margin Types</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>• <strong>Gross Margin</strong>: Revenue minus the cost of goods sold (COGS)</li>
                  <li>• <strong>Operating Margin</strong>: Profit after operating expenses</li>
                  <li>• <strong>Net Profit Margin</strong>: Final profit after all expenses</li>
                  <li>• <strong>Contribution Margin</strong>: Revenue minus variable costs</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Margin vs. Markup</h3>
                <div className="h-[200px]">
                  <Pie 
                    data={{
                      labels: ['Cost', 'Profit (Margin)'],
                      datasets: [{
                        data: [80, 20],
                        backgroundColor: [
                          'rgba(99, 102, 241, 0.8)',
                          'rgba(14, 165, 233, 0.8)',
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } },
                        datalabels: {
                          color: '#fff',
                          font: { weight: 'bold' },
                          formatter: (value) => `${value}%`
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">For a product with 20% margin, the markup would be 25%</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Why Margins Matter:</strong> A 1% increase in price can lead to an 11% increase in operating profit, according to McKinsey research. Understanding margins is critical for making effective pricing decisions.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Pricing Strategy</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Set optimal prices to balance competitiveness with profitability
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Performance Analysis</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Track and improve business profitability metrics
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Calculator className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Financial Planning</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Project future revenue and profit potential
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Margin Calculations Section */}
      <div className="mb-10" id="margin-calculations">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Essential Margin Calculations
        </h2>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-blue-600" />
              Gross Margin Calculation
            </CardTitle>
            <CardDescription>The foundation of profitability analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Gross margin represents the percentage of revenue that exceeds the cost of goods sold (COGS). It shows how efficiently a company converts sales into profit before considering operating expenses.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="mb-2 font-medium text-blue-700 dark:text-blue-400">Gross Margin Formula:</p>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                    <div>Gross Margin (%) = [(Revenue - COGS) ÷ Revenue] × 100</div>
                  </div>
                  
                  <p className="mt-4 mb-2 font-medium text-blue-700 dark:text-blue-400">Example:</p>
                  <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-500">
                    <li><strong>Revenue:</strong> $1,000</li>
                    <li><strong>Cost of Goods:</strong> $600</li>
                    <li><strong>Gross Margin:</strong> [($1,000 - $600) ÷ $1,000] × 100 = 40%</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <InfoIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Industry benchmark: Retail typically aims for 30-50% gross margins, while software companies often achieve 70-90% gross margins.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="h-[240px]">
                  <Bar 
                    data={{
                      labels: ['Retail', 'Food Service', 'Manufacturing', 'Software', 'Professional Services'],
                      datasets: [
                        {
                          label: 'Typical Gross Margin Ranges',
                          data: [40, 60, 35, 80, 65],
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(139, 92, 246, 0.7)',
                            'rgba(236, 72, 153, 0.7)'
                          ],
                          borderWidth: 1
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: { callback: (value) => value + '%' }
                        }
                      },
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <p className="font-medium">A healthy gross margin:</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Provides buffer for operating expenses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Indicates pricing power in the market</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Allows for investment in growth and innovation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-green-600" />
              Markup Calculation
            </CardTitle>
            <CardDescription>Converting costs to selling price</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Markup represents the percentage increase over cost to determine selling price. While margin looks at profit as a percentage of selling price, markup views profit as a percentage of cost.
                </p>
                
                <div className="space-y-4">
                  <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Markup Formula</h4>
                    <div className="p-3 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                      <div>Markup (%) = [(Selling Price - Cost) ÷ Cost] × 100</div>
                    </div>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Example: If cost is $80 and selling price is $100,<br />
                      Markup = [($100 - $80) ÷ $80] × 100 = 25%
                    </p>
                  </div>
                  
                  <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Converting Markup to Margin</h4>
                    <div className="p-3 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                      <div>Margin = [Markup ÷ (100 + Markup)] × 100</div>
                    </div>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Example: A 25% markup equals:<br />
                      [25 ÷ (100 + 25)] × 100 = 20% margin
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Common Mistake:</strong> Many businesses confuse margin and markup. This can lead to significant pricing errors and reduced profitability.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-3">Markup to Margin Conversion Chart</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="px-3 py-2 text-left">Markup</th>
                          <th className="px-3 py-2 text-left">Margin</th>
                          <th className="px-3 py-2 text-left">Example (Cost: $100)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b dark:border-gray-700">
                          <td className="px-3 py-2">20%</td>
                          <td className="px-3 py-2">16.7%</td>
                          <td className="px-3 py-2">Selling Price: $120</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <td className="px-3 py-2">25%</td>
                          <td className="px-3 py-2">20%</td>
                          <td className="px-3 py-2">Selling Price: $125</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700">
                          <td className="px-3 py-2">50%</td>
                          <td className="px-3 py-2">33.3%</td>
                          <td className="px-3 py-2">Selling Price: $150</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <td className="px-3 py-2">100%</td>
                          <td className="px-3 py-2">50%</td>
                          <td className="px-3 py-2">Selling Price: $200</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">200%</td>
                          <td className="px-3 py-2">66.7%</td>
                          <td className="px-3 py-2">Selling Price: $300</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="h-[180px]">
                  <p className="text-center text-sm font-medium mb-2">Markup vs. Margin Comparison</p>
                  <Line 
                    data={{
                      labels: ['10%', '20%', '30%', '40%', '50%', '100%', '200%'],
                      datasets: [
                        {
                          label: 'Equivalent Margin',
                          data: [9.1, 16.7, 23.1, 28.6, 33.3, 50, 66.7],
                          borderColor: 'rgba(16, 185, 129, 0.8)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: { 
                          title: { display: true, text: 'Markup %' } 
                        },
                        y: {
                          beginAtZero: true,
                          title: { display: true, text: 'Margin %' },
                          ticks: { callback: (value) => value + '%' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowBigDown className="h-5 w-5 text-purple-600" />
                Working Backwards: Price from Margin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Often, businesses need to determine a selling price that will achieve a target profit margin, given their known costs.
              </p>

              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Target Price Formula</h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                  <div>Selling Price = Cost ÷ (1 - Target Margin)</div>
                </div>
                <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                  Example: For a product costing $75 with a target margin of 40%:
                </p>
                <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                  <div>Selling Price = $75 ÷ (1 - 0.4) = $75 ÷ 0.6 = $125</div>
                </div>
              </div>
              
              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Verification</h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                  <div>Margin = ($125 - $75) ÷ $125 = $50 ÷ $125 = 0.4 or 40%</div>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Strategic Pricing:</strong> This formula is essential for businesses that have fixed margin requirements or need to meet specific profitability targets.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Contribution Margin Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Contribution margin represents the portion of revenue available to cover fixed costs and generate profit after variable costs are accounted for.
              </p>

              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Contribution Margin Formula</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                      <div>CM = Revenue - Variable Costs</div>
                      <div>CM Ratio = (Revenue - Variable Costs) ÷ Revenue</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-3">Example: Product Contribution Analysis</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left">Item</th>
                        <th className="px-3 py-2 text-right">Product A</th>
                        <th className="px-3 py-2 text-right">Product B</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700">
                        <td className="px-3 py-2">Selling Price</td>
                        <td className="px-3 py-2 text-right">$100</td>
                        <td className="px-3 py-2 text-right">$80</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <td className="px-3 py-2">Variable Cost</td>
                        <td className="px-3 py-2 text-right">$60</td>
                        <td className="px-3 py-2 text-right">$40</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700">
                        <td className="px-3 py-2">Contribution Margin</td>
                        <td className="px-3 py-2 text-right">$40</td>
                        <td className="px-3 py-2 text-right">$40</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">CM Ratio</td>
                        <td className="px-3 py-2 text-right font-medium">40%</td>
                        <td className="px-3 py-2 text-right font-medium">50%</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-2 text-xs text-muted-foreground">Note: While both products generate the same contribution margin dollar amount, Product B has a higher CM ratio, making it more efficient at generating profit.</p>
                </div>
                
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Break-even Point:</strong> With a contribution margin ratio of 40%, a business needs $250,000 in revenue to cover $100,000 in fixed costs ($100,000 ÷ 0.4 = $250,000).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Margin Applications Section */}
      <div className="mb-10" id="practical-applications">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <LineChart className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Practical Applications of Margin Analysis</span>
              </div>
            </CardTitle>
            <CardDescription>
              How businesses use margin calculations for strategic decision-making
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="pricing-strategy" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Pricing Strategy Development
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    Effective pricing is a delicate balance between market competitiveness and profitability. Margin calculations provide crucial data for informed pricing decisions.
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Key Pricing Approaches:</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Cost-Plus Pricing:</strong> Adding a standard markup to costs (e.g., cost + 25%). Simple but may not reflect market realities.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Value-Based Pricing:</strong> Setting prices based on perceived customer value. Can achieve higher margins but requires market research.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Eye className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Competitive Pricing:</strong> Setting prices relative to competitors. Maintains market share but may compress margins.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      <strong>Strategic Insight:</strong> Different products within your line may require different margin targets based on market positioning, competition, and product lifecycle stage.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Price Sensitivity Analysis</h4>
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-medium mb-3">How Price Changes Affect Margin & Sales</h5>
                    <div className="h-[240px]">
                      <Line 
                        data={{
                          labels: ['-15%', '-10%', '-5%', 'Base Price', '+5%', '+10%', '+15%'],
                          datasets: [
                            {
                              label: 'Margin %',
                              data: [26, 31, 36, 40, 43, 46, 48],
                              borderColor: 'rgba(16, 185, 129, 0.8)',
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              yAxisID: 'y',
                            },
                            {
                              label: 'Sales Volume',
                              data: [130, 120, 110, 100, 90, 80, 70],
                              borderColor: 'rgba(59, 130, 246, 0.8)',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              yAxisID: 'y1',
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              type: 'linear',
                              display: true,
                              position: 'left',
                              title: { display: true, text: 'Margin %' },
                              ticks: { callback: (value) => value + '%' }
                            },
                            y1: {
                              type: 'linear',
                              display: true,
                              position: 'right',
                              grid: { drawOnChartArea: false },
                              title: { display: true, text: 'Sales Volume' },
                              ticks: { callback: (value) => value + '%' }
                            }
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">Price elasticity varies by product and market</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="product-mix" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5" />
                  Product Mix Optimization
                </h3>
                <p>
                  Not all products are equally profitable. Margin analysis helps businesses identify which products deserve more focus, investment, and promotional resources.
                </p>
                
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Margin-Volume Analysis</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      Plot products on a matrix of margin percentage vs. sales volume to identify stars (high margin, high volume), cash cows (low margin, high volume), and underperformers.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Channel Profitability</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      Analyze margins across different sales channels (retail, online, wholesale) to determine the most profitable distribution strategies.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Customer Segmentation</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      Calculate margins by customer segment to identify the most valuable customer groups and tailor your offerings accordingly.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Example: Portfolio Analysis</h4>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-blue-50 dark:bg-blue-900/30">
                        <tr>
                          <th className="px-2 py-2 text-left">Product</th>
                          <th className="px-2 py-2 text-right">Revenue</th>
                          <th className="px-2 py-2 text-right">Margin %</th>
                          <th className="px-2 py-2 text-right">Contribution</th>
                          <th className="px-2 py-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b dark:border-gray-700">
                          <td className="px-2 py-2">Product A</td>
                          <td className="px-2 py-2 text-right">$240K</td>
                          <td className="px-2 py-2 text-right">45%</td>
                          <td className="px-2 py-2 text-right">$108K</td>
                          <td className="px-2 py-2 text-green-600">Grow</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <td className="px-2 py-2">Product B</td>
                          <td className="px-2 py-2 text-right">$310K</td>
                          <td className="px-2 py-2 text-right">28%</td>
                          <td className="px-2 py-2 text-right">$86.8K</td>
                          <td className="px-2 py-2 text-blue-600">Maintain</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700">
                          <td className="px-2 py-2">Product C</td>
                          <td className="px-2 py-2 text-right">$90K</td>
                          <td className="px-2 py-2 text-right">52%</td>
                          <td className="px-2 py-2 text-right">$46.8K</td>
                          <td className="px-2 py-2 text-green-600">Invest</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2">Product D</td>
                          <td className="px-2 py-2 text-right">$70K</td>
                          <td className="px-2 py-2 text-right">15%</td>
                          <td className="px-2 py-2 text-right">$10.5K</td>
                          <td className="px-2 py-2 text-red-600">Review</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="financial-forecasting" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Financial Forecasting & Planning
                </h3>
                <p>
                  Margin analysis is crucial for accurate financial forecasting and business planning, allowing companies to project future financial performance.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Sensitivity Analysis</h4>
                    <p className="text-sm mt-1">
                      Model how changes in cost, price, or sales volume affect overall profitability to prepare for various scenarios.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Break-Even Analysis</h4>
                    <p className="text-sm mt-1">
                      Calculate the sales volume needed to cover fixed costs using the contribution margin ratio.
                    </p>
                    <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                      <div>Break-Even Point = Fixed Costs ÷ CM Ratio</div>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Margin Improvement Planning</h4>
                    <p className="text-sm mt-1">
                      Project financial impact of initiatives like:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Negotiating better supplier terms</li>
                      <li>• Reducing operational waste</li>
                      <li>• Implementing strategic price increases</li>
                      <li>• Shifting product mix to higher-margin items</li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <strong>Margin Impact:</strong> A 1% margin improvement often has a greater impact on profitability than a 1% increase in sales revenue, especially for businesses with existing slim margins.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Using Margin Calculators */}
      <div className="mb-10" id="using-calculators">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Using Margin Calculators Effectively
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Essential Calculator Features</CardTitle>
              <CardDescription>
                What to look for in an effective margin calculator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                  Bidirectional Calculations
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ability to calculate in both directions: finding selling price from cost and target margin, or determining margin from cost and price.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                  Margin-Markup Conversion
                </h4>
                <p className="text-sm text-muted-foreground">
                  Automatic conversion between margin and markup percentages to avoid confusion and calculation errors.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <BarChart4 className="h-4 w-4 text-blue-600" />
                  Bulk Analysis
                </h4>
                <p className="text-sm text-muted-foreground">
                  Capability to analyze multiple products simultaneously for portfolio evaluation and comparison.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Reporting Tools
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ability to generate and export detailed margin reports for presentation and analysis.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Common Calculation Scenarios</CardTitle>
              <CardDescription>
                Everyday margin calculations for business decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <PercentIcon className="h-4 w-4 text-green-600" />
                  Basic Margin Calculation
                </h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">Cost: $80</div>
                    <div className="text-sm">Selling Price: $100</div>
                    <div className="text-sm">Profit: $20</div>
                    <div className="text-sm font-medium">Margin: 20%</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  Price Setting
                </h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">Cost: $75</div>
                    <div className="text-sm">Target Margin: 40%</div>
                    <div className="text-sm">Calculation: $75 ÷ 0.6</div>
                    <div className="text-sm font-medium">Required Price: $125</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-green-600" />
                  Discount Analysis
                </h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Original Price: $100 (40% margin)</span>
                      <span className="text-sm">Profit: $40</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">20% Discount: $80</span>
                      <span className="text-sm">Profit: $20</span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                      <span className="text-sm">New Margin:</span>
                      <span className="text-sm">25%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mt-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Pro Tip:</strong> When considering discounts, always calculate the percentage increase in sales volume needed to maintain the same profit level. A 10% price reduction might require a 25% increase in sales just to break even.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="text-blue-800 dark:text-blue-300">Step-by-Step Guide to Margin Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <ol className="space-y-4 list-decimal list-inside">
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Identify all relevant costs</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ensure you include all direct costs (materials, labor) and applicable indirect costs for accurate margin calculations.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Calculate gross margin</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Divide gross profit (revenue minus COGS) by revenue to determine the gross margin percentage.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Compare to industry benchmarks</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Research typical margins in your industry to determine if your margins are competitive and sustainable.
                      </p>
                    </li>
                  </ol>
                </div>
                
                <div>
                  <ol className="space-y-4 list-decimal list-inside" start={4}>
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Segment your analysis</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Calculate margins by product, service, customer, or sales channel to identify strengths and weaknesses.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Identify improvement opportunities</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Look for low-margin areas where either costs can be reduced or prices can be strategically increased.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Create action plans</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Develop specific strategies to improve margins, with measurable goals and implementation timelines.
                      </p>
                    </li>
                  </ol>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Margin Analysis Best Practices</p>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                      Conduct regular margin reviews (monthly or quarterly) to catch negative trends early. Track margin changes over time, not just absolute values. Consider both percentage and dollar values—a high percentage margin on low revenue may be less valuable than a lower percentage margin on high revenue.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Mastering Margin Management
            </CardTitle>
            <CardDescription>
              Key takeaways for effective pricing and profitability
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Understanding and managing margins</strong> is one of the most powerful levers for business profitability. By distinguishing between margins and markups, calculating accurate values, and strategically applying this knowledge to pricing and product decisions, businesses can significantly improve their financial performance.
            </p>
            
            <p className="mt-4" id="key-lessons">
              As you implement margin analysis in your business, remember these core principles:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">For Pricing Strategies</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Focus on value-based pricing where possible, not just cost-plus formulas</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Consider price elasticity—how sales volume responds to price changes</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Remember that different products may require different margin targets</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">For Business Optimization</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Regularly analyze margins across products, customers, and channels</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Be willing to prune low-margin products or customers when appropriate</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Focus improvement efforts where small changes create big impacts</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to optimize your pricing and profits?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Margin Calculator</strong> above to analyze your product pricing and profitability! For more financial tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/pricing">
                        <Tag className="h-4 w-4 mr-1" />
                        Pricing Strategy
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/break-even">
                        <ArrowDownUp className="h-4 w-4 mr-1" />
                        Break-Even Analysis
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/profit-loss">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Profit & Loss
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
                  <CardTitle className="text-lg">Discount Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate sale prices and savings with different discount rates.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/discount">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">ROI Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Measure return on investment for your business decisions.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/roi">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Break-Even Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Find out how many units you need to sell to break even.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/break-even">Try Calculator</Link>
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