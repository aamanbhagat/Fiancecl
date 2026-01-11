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
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Tag, Percent, ArrowRight, ArrowDown, ShoppingCart, TrendingDown, AlertTriangle, Wallet, Clock, Calendar, Tv, Shirt, Sofa, Car, Tags, ScanSearch, Check, ShoppingBasket, Store, Receipt } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import DiscountSchema from './schema';

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

export default function DiscountCalculator() {
  // Basic Inputs
  const [originalPrice, setOriginalPrice] = useState<number>(100)
  const [discountPercent, setDiscountPercent] = useState<number>(20)
  const [flatDiscount, setFlatDiscount] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(1)
  const [taxRate, setTaxRate] = useState<number>(0)
  const [additionalDiscount, setAdditionalDiscount] = useState<number>(0)
  const [useFlatDiscount, setUseFlatDiscount] = useState<boolean>(false)
  const [roundToNearestCent, setRoundToNearestCent] = useState<boolean>(true)
  const [currency, setCurrency] = useState<string>("USD")
  
  // Comparison Mode
  const [showComparison, setShowComparison] = useState<boolean>(false)
  const [comparisonDiscount, setComparisonDiscount] = useState<number>(25)
  const [comparisonFlatDiscount, setComparisonFlatDiscount] = useState<number>(0)
  const [useFlatDiscountComparison, setUseFlatDiscountComparison] = useState<boolean>(false)
  
  // Reverse Mode
  const [reverseMode, setReverseMode] = useState<boolean>(false)
  const [finalPrice, setFinalPrice] = useState<number>(80)
  const [calculatedOriginalPrice, setCalculatedOriginalPrice] = useState<number>(0)

  // Results State
  const [results, setResults] = useState({
    discountedPrice: 0,
    amountSaved: 0,
    finalPriceAfterTax: 0,
    effectiveDiscount: 0,
    totalSavings: 0,
    pricePerUnit: 0,
    comparisonSavings: 0,
    comparisonPrice: 0
  })

  // Calculate all discount values
  useEffect(() => {
    if (reverseMode) {
      // Reverse calculation
      let originalPriceCalc = 0
      if (useFlatDiscount) {
        originalPriceCalc = finalPrice + flatDiscount
      } else {
        originalPriceCalc = finalPrice / (1 - (discountPercent / 100))
      }
      setCalculatedOriginalPrice(originalPriceCalc)
      return
    }

    // Regular calculation
    let basePrice = originalPrice * quantity
    let discountAmount = useFlatDiscount 
      ? flatDiscount 
      : (basePrice * (discountPercent / 100))
    
    let priceAfterFirstDiscount = basePrice - discountAmount
    
    // Apply additional discount if any
    let additionalDiscountAmount = priceAfterFirstDiscount * (additionalDiscount / 100)
    let priceAfterAllDiscounts = priceAfterFirstDiscount - additionalDiscountAmount
    
    // Calculate effective discount percentage
    let totalDiscountAmount = basePrice - priceAfterAllDiscounts
    let effectiveDiscountPercent = (totalDiscountAmount / basePrice) * 100
    
    // Apply tax if any
    let taxAmount = priceAfterAllDiscounts * (taxRate / 100)
    let finalPriceWithTax = priceAfterAllDiscounts + taxAmount
    
    // Round values if needed
    if (roundToNearestCent) {
      priceAfterAllDiscounts = Math.round(priceAfterAllDiscounts * 100) / 100
      finalPriceWithTax = Math.round(finalPriceWithTax * 100) / 100
      totalDiscountAmount = Math.round(totalDiscountAmount * 100) / 100
    }
    
    // Calculate comparison price if needed
    let comparisonPriceCalc = basePrice
    if (showComparison) {
      comparisonPriceCalc = useFlatDiscountComparison
        ? basePrice - comparisonFlatDiscount
        : basePrice * (1 - (comparisonDiscount / 100))
    }
    
    setResults({
      discountedPrice: priceAfterAllDiscounts,
      amountSaved: totalDiscountAmount,
      finalPriceAfterTax: finalPriceWithTax,
      effectiveDiscount: effectiveDiscountPercent,
      totalSavings: totalDiscountAmount,
      pricePerUnit: priceAfterAllDiscounts / quantity,
      comparisonSavings: basePrice - comparisonPriceCalc,
      comparisonPrice: comparisonPriceCalc
    })
    
  }, [
    originalPrice,
    discountPercent,
    flatDiscount,
    quantity,
    taxRate,
    additionalDiscount,
    useFlatDiscount,
    roundToNearestCent,
    showComparison,
    comparisonDiscount,
    comparisonFlatDiscount,
    useFlatDiscountComparison,
    reverseMode,
    finalPrice
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

  // Price breakdown chart
  const pieChartData = {
    labels: ['Discounted Amount', 'Final Price', 'Tax'],
    datasets: [{
      data: [
        results.amountSaved,
        results.discountedPrice,
        results.finalPriceAfterTax - results.discountedPrice
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
          return ((value / (originalPrice * quantity)) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Comparison chart data
  const comparisonChartData = {
    labels: ['Original Price', 'Discounted Price', showComparison ? 'Comparison Price' : ''],
    datasets: [
      {
        label: 'Price Comparison',
        data: [
          originalPrice * quantity,
          results.discountedPrice,
          showComparison ? results.comparisonPrice : 0
        ],
        backgroundColor: chartColors.primary.slice(0, 3),
        borderColor: chartColors.secondary.slice(0, 3).map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const comparisonChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => {
            return formatCurrency(value as number)
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
        formatter: (value: number) => formatCurrency(value)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: roundToNearestCent ? 2 : 0
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
    pdf.save('discount-calculation.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <DiscountSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Discount <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate discounts, compare savings, and make informed purchasing decisions with our comprehensive discount calculator.
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
                    <CardTitle>Calculate Discount</CardTitle>
                    <CardDescription>
                      Enter price and discount details to calculate savings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Mode Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="reverse-mode">Reverse Calculation Mode</Label>
                        <Switch
                          id="reverse-mode"
                          checked={reverseMode}
                          onCheckedChange={setReverseMode}
                        />
                      </div>
                      {reverseMode ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="final-price">Final Price</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="final-price"
                                type="number"
                                className="pl-9"
                                value={finalPrice || ''} onChange={(e) => setFinalPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="reverse-discount">Discount</Label>
                              <span className="text-sm text-muted-foreground">
                                {useFlatDiscount ? formatCurrency(flatDiscount) : formatPercent(discountPercent)}
                              </span>
                            </div>
                            {useFlatDiscount ? (
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="reverse-discount"
                                  type="number"
                                  className="pl-9"
                                  value={flatDiscount || ''} onChange={(e) => setFlatDiscount(e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </div>
                            ) : (
                              <Slider
                                id="reverse-discount"
                                min={0}
                                max={100}
                                step={1}
                                value={[discountPercent]}
                                onValueChange={(value) => setDiscountPercent(value[0])}
                              />
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Basic Inputs */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Basic Details</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="original-price">Original Price</Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    id="original-price"
                                    type="number"
                                    className="pl-9"
                                    value={originalPrice || ''} onChange={(e) => setOriginalPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                  id="quantity"
                                  type="number"
                                  min="1"
                                  value={quantity || ''} onChange={(e) => setQuantity(e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Discount Details */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Discount Details</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="use-flat">Use Flat Discount</Label>
                                  <Switch
                                    id="use-flat"
                                    checked={useFlatDiscount}
                                    onCheckedChange={setUseFlatDiscount}
                                  />
                                </div>
                                {useFlatDiscount ? (
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                      id="flat-discount"
                                      type="number"
                                      className="pl-9"
                                      value={flatDiscount || ''} onChange={(e) => setFlatDiscount(e.target.value === '' ? 0 : Number(e.target.value))}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <Label htmlFor="discount-percent">Discount Percentage</Label>
                                      <span className="text-sm text-muted-foreground">{discountPercent}%</span>
                                    </div>
                                    <Slider
                                      id="discount-percent"
                                      min={0}
                                      max={100}
                                      step={1}
                                      value={[discountPercent]}
                                      onValueChange={(value) => setDiscountPercent(value[0])}
                                    />
                                  </>
                                )}
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="additional-discount">Additional Discount</Label>
                                  <span className="text-sm text-muted-foreground">{additionalDiscount}%</span>
                                </div>
                                <Slider
                                  id="additional-discount"
                                  min={0}
                                  max={50}
                                  step={1}
                                  value={[additionalDiscount]}
                                  onValueChange={(value) => setAdditionalDiscount(value[0])}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Additional Options */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Additional Options</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="tax-rate">Tax Rate</Label>
                                  <span className="text-sm text-muted-foreground">{taxRate}%</span>
                                </div>
                                <Slider
                                  id="tax-rate"
                                  min={0}
                                  max={30}
                                  step={0.1}
                                  value={[taxRate]}
                                  onValueChange={(value) => setTaxRate(value[0])}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                  <SelectTrigger id="currency">
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                    <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                                    <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                                    <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="round-cents">Round to Nearest Cent</Label>
                                  <Switch
                                    id="round-cents"
                                    checked={roundToNearestCent}
                                    onCheckedChange={setRoundToNearestCent}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="show-comparison">Compare Discounts</Label>
                                  <Switch
                                    id="show-comparison"
                                    checked={showComparison}
                                    onCheckedChange={setShowComparison}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Comparison Options */}
                          {showComparison && (
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Comparison Discount</h3>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="use-flat-comparison">Use Flat Discount</Label>
                                    <Switch
                                      id="use-flat-comparison"
                                      checked={useFlatDiscountComparison}
                                      onCheckedChange={setUseFlatDiscountComparison}
                                    />
                                  </div>
                                  {useFlatDiscountComparison ? (
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                      <Input
                                        id="comparison-flat"
                                        type="number"
                                        className="pl-9"
                                        value={comparisonFlatDiscount || ''} onChange={(e) => setComparisonFlatDiscount(e.target.value === '' ? 0 : Number(e.target.value))}
                                      />
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center justify-between">
                                        <Label htmlFor="comparison-percent">Comparison Percentage</Label>
                                        <span className="text-sm text-muted-foreground">{comparisonDiscount}%</span>
                                      </div>
                                      <Slider
                                        id="comparison-percent"
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={[comparisonDiscount]}
                                        onValueChange={(value) => setComparisonDiscount(value[0])}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
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
                    {reverseMode ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Original Price</p>
                          <p className="text-4xl font-bold text-primary">{formatCurrency(calculatedOriginalPrice)}</p>
                        </div>
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">Discount Applied</span>
                            <span className="font-medium">
                              {useFlatDiscount ? formatCurrency(flatDiscount) : formatPercent(discountPercent)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">Final Price</span>
                            <span className="font-medium">{formatCurrency(finalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2 text-center">
                          <p className="text-sm text-muted-foreground">Final Price</p>
                          <p className="text-4xl font-bold text-primary">{formatCurrency(results.finalPriceAfterTax)}</p>
                          {quantity > 1 && (
                            <p className="text-sm text-muted-foreground">
                              ({formatCurrency(results.pricePerUnit)} per unit)
                            </p>
                          )}
                        </div>

                        <Separator />

                        <Tabs defaultValue="breakdown" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                            <TabsTrigger value="comparison">Comparison</TabsTrigger>
                          </TabsList>

                          <TabsContent value="breakdown" className="space-y-4">
                            <div className="h-[300px]">
                              <Pie data={pieChartData} options={pieChartOptions} />
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium">Price Breakdown</h4>
                              <div className="grid gap-2">
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                  <span className="text-sm">Original Price</span>
                                  <span className="font-medium">{formatCurrency(originalPrice * quantity)}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                  <span className="text-sm">Discount Amount</span>
                                  <span className="font-medium">{formatCurrency(results.amountSaved)}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                  <span className="text-sm">Price After Discount</span>
                                  <span className="font-medium">{formatCurrency(results.discountedPrice)}</span>
                                </div>
                                {taxRate > 0 && (
                                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                    <span className="text-sm">Tax Amount</span>
                                    <span className="font-medium">
                                      {formatCurrency(results.finalPriceAfterTax - results.discountedPrice)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                                  <span>Total Savings</span>
                                  <span>{formatCurrency(results.totalSavings)}</span>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="comparison" className="space-y-4">
                            <div className="h-[300px]">
                              <Bar data={comparisonChartData} options={comparisonChartOptions} />
                            </div>
                            {showComparison && (
                              <div className="space-y-2">
                                <h4 className="font-medium">Discount Comparison</h4>
                                <div className="grid gap-2">
                                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                    <span className="text-sm">Current Discount</span>
                                    <span className="font-medium">{formatCurrency(results.amountSaved)}</span>
                                  </div>
                                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                    <span className="text-sm">Comparison Discount</span>
                                    <span className="font-medium">{formatCurrency(results.comparisonSavings)}</span>
                                  </div>
                                  <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                                    <span>Difference</span>
                                    <span>
                                      {formatCurrency(Math.abs(results.amountSaved - results.comparisonSavings))}
                                      {results.amountSaved > results.comparisonSavings ? ' more' : ' less'}
                                    </span>
                                  </div>
                
                                </div>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>

                        {/* Summary Card */}
                        <Card className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 mt-1 text-primary" />
                              <div className="space-y-1">
                                <p className="font-medium">Discount Summary</p>
                                <p className="text-sm text-muted-foreground">
                                  You save {formatCurrency(results.totalSavings)} ({formatPercent(results.effectiveDiscount)}) 
                                  on your purchase{quantity > 1 ? ` of ${quantity} items` : ''}.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Shopping Smart</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">The Complete Guide to Discount Calculations</h2>
        <p className="mt-3 text-muted-foreground text-lg">Learn how to calculate discounts accurately and make informed purchasing decisions</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Percent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Discount Calculations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                <strong>Discounts</strong> reduce the original price of a product or service, resulting in savings for consumers. Whether you're shopping for everyday items, making major purchases, or running a business, understanding how to calculate discounts accurately is essential for making informed financial decisions.
              </p>
              <p className="mt-3">
                A discount calculator is a helpful tool that instantly determines the sale price and amount saved when a discount is applied to the original price. It eliminates mental math errors and ensures you know exactly how much you're saving on purchases.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Common Discount Types</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>• <strong>Percentage discounts</strong>: 10%, 20%, 50% off the original price</li>
                  <li>• <strong>Fixed amount off</strong>: $10 off, $25 off any purchase</li>
                  <li>• <strong>Buy one get one</strong> (BOGO): Buy one item, get another at a discount</li>
                  <li>• <strong>Volume discounts</strong>: Save more when buying in larger quantities</li>
                  <li>• <strong>Seasonal sales</strong>: Holiday discounts, end-of-season clearance</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Discount Impact on Price</h3>
                <div className="h-[200px]">
                  <Bar 
                    data={{
                      labels: ['10% Off', '25% Off', '50% Off', '75% Off'],
                      datasets: [{
                        label: 'Original Price ($100)',
                        data: [100, 100, 100, 100],
                        backgroundColor: 'rgba(99, 102, 241, 0.4)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 1
                      },
                      {
                        label: 'Sale Price',
                        data: [90, 75, 50, 25],
                        backgroundColor: 'rgba(14, 165, 233, 0.8)',
                        borderColor: 'rgba(14, 165, 233, 1)',
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: { callback: (value) => '$' + value }
                        }
                      },
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Impact of different discount percentages on a $100 item</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> Retailers often price items at $9.99 instead of $10.00 because consumers tend to focus on the first digit, perceiving these prices as significantly lower than their rounded-up counterparts.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Accurate Savings</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Know exactly how much you're saving on every purchase
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <ShoppingCart className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Budget Planning</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Stay within your budget by calculating final costs before purchase
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <TrendingDown className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Price Comparison</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Compare discounted offers to find the best deal
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Discount Calculations Section */}
      <div className="mb-10" id="discount-calculations">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Essential Discount Calculations
        </h2>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-blue-600" />
              Percentage Discount Calculation
            </CardTitle>
            <CardDescription>The most common type of discount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Percentage discounts are the most common form of price reduction. Calculating them involves finding what percentage of the original price is being deducted, and then subtracting that amount from the original price.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="mb-2 font-medium text-blue-700 dark:text-blue-400">Basic Formula:</p>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                    <div>Discount Amount = Original Price × (Discount Percentage ÷ 100)</div>
                    <div className="mt-2">Sale Price = Original Price - Discount Amount</div>
                  </div>
                  
                  <p className="mt-4 mb-2 font-medium text-blue-700 dark:text-blue-400">Example:</p>
                  <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-500">
                    <li><strong>Original Price:</strong> $80</li>
                    <li><strong>Discount Percentage:</strong> 25%</li>
                    <li><strong>Discount Amount:</strong> $80 × (25 ÷ 100) = $20</li>
                    <li><strong>Sale Price:</strong> $80 - $20 = $60</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Pro Tip: To quickly calculate a discount in your head, find 10% (move decimal point one place left) and multiply or divide as needed. For example, 30% off is 3 × 10%.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-3">Common Percentage Conversions</h4>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="px-3 py-2 text-left">Percentage</th>
                          <th className="px-3 py-2 text-left">Decimal</th>
                          <th className="px-3 py-2 text-left">Fraction</th>
                          <th className="px-3 py-2 text-left">$100 Item</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b dark:border-gray-700">
                          <td className="px-3 py-2">10%</td>
                          <td className="px-3 py-2">0.10</td>
                          <td className="px-3 py-2">1/10</td>
                          <td className="px-3 py-2">$90</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <td className="px-3 py-2">20%</td>
                          <td className="px-3 py-2">0.20</td>
                          <td className="px-3 py-2">1/5</td>
                          <td className="px-3 py-2">$80</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700">
                          <td className="px-3 py-2">25%</td>
                          <td className="px-3 py-2">0.25</td>
                          <td className="px-3 py-2">1/4</td>
                          <td className="px-3 py-2">$75</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <td className="px-3 py-2">33.33%</td>
                          <td className="px-3 py-2">0.33</td>
                          <td className="px-3 py-2">1/3</td>
                          <td className="px-3 py-2">$66.67</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700">
                          <td className="px-3 py-2">50%</td>
                          <td className="px-3 py-2">0.50</td>
                          <td className="px-3 py-2">1/2</td>
                          <td className="px-3 py-2">$50</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">75%</td>
                          <td className="px-3 py-2">0.75</td>
                          <td className="px-3 py-2">3/4</td>
                          <td className="px-3 py-2">$25</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="h-[180px]">
                  <p className="text-center text-sm font-medium mb-2">Discount Comparison</p>
                  <Pie 
                    data={{
                      labels: ['Savings (25% off)', 'Sale Price'],
                      datasets: [{
                        data: [25, 75],
                        backgroundColor: [
                          'rgba(14, 165, 233, 0.8)',
                          'rgba(99, 102, 241, 0.8)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' },
                        datalabels: {
                          color: '#fff',
                          font: { weight: 'bold' },
                          formatter: (value) => value + '%'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-600" />
              Multiple Discounts & Stacking
            </CardTitle>
            <CardDescription>Understanding how multiple discounts combine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  When multiple discounts are applied to a product, they aren't simply added together. Each successive discount is applied to the already-reduced price, not the original price. Understanding how discounts stack is crucial for accurate calculations.
                </p>
                
                <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">How Multiple Discounts Work</h4>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                    <div>First Discount: Original Price × (1 - Discount₁%)</div>
                    <div>Second Discount: Result × (1 - Discount₂%)</div>
                    <div>And so on...</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Example Calculation</h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Original Price:</strong> $100<br />
                    <strong>First Discount:</strong> 20% off<br />
                    <strong>Price After First Discount:</strong> $100 × 0.8 = $80<br />
                    <strong>Second Discount:</strong> 10% off<br />
                    <strong>Final Price:</strong> $80 × 0.9 = $72
                  </p>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                    <strong>Note:</strong> This is equivalent to a single discount of 28%, not 30%
                    <br />(1 - 0.8 × 0.9 = 0.28 or 28%)
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Common Misconception:</strong> Many consumers incorrectly add discount percentages together. A 20% discount followed by a 10% discount is not the same as a 30% discount—it's actually less!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="h-[200px]">
                  <p className="text-center text-sm font-medium mb-2">Multiple Discounts Comparison</p>
                  <Bar 
                    data={{
                      labels: ['Single 30% Discount', '20% + 10% Sequential Discounts'],
                      datasets: [{
                        label: 'Final Price on $100 Item',
                        data: [70, 72],
                        backgroundColor: [
                          'rgba(16, 185, 129, 0.7)',
                          'rgba(59, 130, 246, 0.7)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      scales: {
                        x: {
                          beginAtZero: true,
                          max: 100,
                          ticks: { callback: (value) => '$' + value }
                        }
                      },
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
                
                <Card>
                  <CardHeader className="py-3 bg-blue-50 dark:bg-blue-900/30">
                    <CardTitle className="text-sm">Calculating Combined Discount Percentage</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="p-3 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                      <div>Combined % = [1 - (1 - Discount₁%) × (1 - Discount₂%)] × 100</div>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div><strong>10% + 10%</strong> = 19%</div>
                        <div><strong>20% + 20%</strong> = 36%</div>
                        <div><strong>25% + 25%</strong> = 43.75%</div>
                        <div><strong>50% + 50%</strong> = 75%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
                Special Discount Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                  <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">BOGO (Buy One Get One)</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    BOGO offers can be calculated as an effective percentage discount:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                    <li>• <strong>BOGO Free</strong> = 50% off each item (when buying 2)</li>
                    <li>• <strong>BOGO 50% Off</strong> = 25% off each item (when buying 2)</li>
                    <li>• <strong>BOGO 70% Off</strong> = 35% off each item (when buying 2)</li>
                  </ul>
                </div>
                
                <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                  <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Fixed Amount Discounts</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    To calculate the percentage equivalent of a fixed amount discount:
                  </p>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded font-mono text-sm mt-2">
                    <div>Discount % = (Discount Amount ÷ Original Price) × 100</div>
                  </div>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Example: $15 off a $75 purchase = (15 ÷ 75) × 100 = 20% discount
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Shopping Tip:</strong> When comparing a fixed amount discount to a percentage discount, calculate which gives you the better deal based on your specific purchase amount. Fixed discounts are more valuable on lower-priced items.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                Discount Thresholds & Bulk Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Many retailers offer tiered discounts based on purchase volume or order total. Understanding how to calculate these thresholds helps you maximize your savings.
              </p>

              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Volume Discount Example</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-blue-100 dark:bg-blue-800">
                      <tr>
                        <th className="px-3 py-2 text-left">Quantity</th>
                        <th className="px-3 py-2 text-left">Price Per Unit</th>
                        <th className="px-3 py-2 text-left">Discount %</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b dark:border-blue-900/50">
                        <td className="px-3 py-2">1-9</td>
                        <td className="px-3 py-2">$10.00</td>
                        <td className="px-3 py-2">0%</td>
                      </tr>
                      <tr className="border-b dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20">
                        <td className="px-3 py-2">10-24</td>
                        <td className="px-3 py-2">$9.00</td>
                        <td className="px-3 py-2">10%</td>
                      </tr>
                      <tr className="border-b dark:border-blue-900/50">
                        <td className="px-3 py-2">25-49</td>
                        <td className="px-3 py-2">$8.50</td>
                        <td className="px-3 py-2">15%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">50+</td>
                        <td className="px-3 py-2">$7.50</td>
                        <td className="px-3 py-2">25%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Finding Optimal Purchase Quantity</h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Sometimes buying more items can cost less due to threshold discounts:
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-400">
                    <p><strong>Example:</strong> If you need 9 units:</p>
                    <p>• 9 units at $10 each = $90</p>
                    <p>• 10 units at $9 each = $90</p>
                    <p><strong>Decision:</strong> Buy 10 units for the same price and get an extra unit</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Smart Shopping Section */}
      <div className="mb-10" id="smart-shopping">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Smart Shopping Strategies</span>
              </div>
            </CardTitle>
            <CardDescription>
              Getting the most value from discounts and promotions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="timing-matters" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                The Importance of Timing
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    Retailers typically follow predictable discount cycles throughout the year. Understanding these patterns can help you time your purchases for maximum savings.
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Seasonal Discount Patterns:</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>January:</strong> Post-holiday clearance, fitness equipment, winter apparel</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>July:</strong> Independence Day sales, furniture, home decor</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>November:</strong> Black Friday, Cyber Monday, electronics, appliances</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>December:</strong> Holiday sales, toys, gift items</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      <strong>Wait for the Right Time:</strong> For non-urgent purchases, waiting for predictable sale events like Black Friday, end-of-season clearance, or holiday sales can save you significantly.
                    </p>
                  </div>
                </div>
                
                <div>
                  <Card className="border border-green-200 dark:border-green-800">
                    <CardHeader className="py-3 bg-green-50 dark:bg-green-900/30">
                      <CardTitle className="text-base">Best Time to Buy</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                            <Tv className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-green-700 dark:text-green-300">Electronics</h3>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              Black Friday, Cyber Monday, January, back-to-school season
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                            <Shirt className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-green-700 dark:text-green-300">Clothing</h3>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              End of season (winter items in Feb, summer items in Aug/Sept)
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                            <Sofa className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-green-700 dark:text-green-300">Furniture</h3>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              Memorial Day, Labor Day, Presidents Day
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                            <Car className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-green-700 dark:text-green-300">Cars</h3>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              End of month, end of quarter, December, when new models arrive
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="coupon-stacking" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  Coupon Stacking Strategies
                </h3>
                <p>
                  Coupon stacking refers to using multiple discounts on a single purchase. Understanding retailer policies and how different discounts interact can lead to significant savings.
                </p>
                
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Common Stacking Combinations</h4>
                    <ul className="mt-2 space-y-1 text-sm text-blue-600 dark:text-blue-500">
                      <li>• Store sale + manufacturer coupon</li>
                      <li>• Store coupon + cashback app</li>
                      <li>• Credit card reward + store discount</li>
                      <li>• Loyalty program discount + seasonal sale</li>
                      <li>• Mail-in rebate + instant discount</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Stacking Example</h4>
                    <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">
                      <strong>Original price:</strong> $100<br />
                      <strong>Store sale:</strong> 20% off = $80<br />
                      <strong>Coupon:</strong> $10 off = $70<br />
                      <strong>Cashback app:</strong> 5% back = $3.50 return<br />
                      <strong>Credit card rewards:</strong> 2% cash back = $1.40 return<br />
                      <strong>Final effective price:</strong> $65.10 (34.9% total savings)
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="price-matching" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <ScanSearch className="h-5 w-5" />
                  Price Matching & Adjustments
                </h3>
                <p>
                  Many retailers offer price matching and adjustment policies that can help you get the best deal without shopping at multiple stores.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Price Matching Tips</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Show proof of competitor's current price (screenshot or ad)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Ensure the item is identical (model number, color, size)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Be familiar with the store's specific policy limitations</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Price Adjustment Policies</h4>
                    <p className="mt-1 text-sm">
                      Many stores will refund the difference if an item goes on sale shortly after your purchase. Typically:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Policy windows range from 7-30 days after purchase</li>
                      <li>• You usually need proof of purchase</li>
                      <li>• Some exclude clearance or Black Friday deals</li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <strong>Pro Tip:</strong> Use price tracking tools like Camelcamelcamel, Honey, or Keepa to monitor price histories and get alerts when prices drop on items you're watching.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Using the Discount Calculator */}
      <div className="mb-10" id="using-calculator">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Making the Most of Your Discount Calculator
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Calculator Features</CardTitle>
              <CardDescription>
                Essential tools at your fingertips
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-600" />
                  Discount Percentage Calculation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate sale prices based on discount percentages, or determine what percentage discount was applied.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  Fixed Amount Discounts
                </h4>
                <p className="text-sm text-muted-foreground">
                  Apply dollar-amount discounts and see the equivalent percentage savings.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Tags className="h-4 w-4 text-blue-600" />
                  Multiple Discount Analysis
                </h4>
                <p className="text-sm text-muted-foreground">
                  See how sequential discounts combine for your total savings percentage.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  Bulk Purchase Calculations
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate optimal purchase quantities when volume discounts apply.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Practical Applications</CardTitle>
              <CardDescription>
                How to use the calculator in everyday scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ShoppingBasket className="h-4 w-4 text-green-600" />
                  Shopping Comparison
                </h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-sm">
                    <p><strong>Scenario:</strong> Comparing two TVs with different discounts</p>
                    <div>
                      <p>• TV A: $800 with 15% off = $680</p>
                      <p>• TV B: $900 with $150 off = $750</p>
                      <p className="font-medium mt-1">Decision based on features and $70 price difference</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Store className="h-4 w-4 text-green-600" />
                  Retail Business Pricing
                </h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-sm">
                    <p><strong>Scenario:</strong> Setting promotional discounts</p>
                    <div>
                      <p>• Cost: $40, Regular price: $80 (50% margin)</p>
                      <p>• Sale at 25% off: $60 (33% margin)</p>
                      <p className="font-medium mt-1">Still profitable while appearing attractive to customers</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-green-600" />
                  Budget Planning
                </h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-sm">
                    <p><strong>Scenario:</strong> Planning holiday shopping</p>
                    <div>
                      <p>• Budget: $1,000</p>
                      <p>• Expected discounts: 30% average</p>
                      <p className="font-medium mt-1">Pre-discount shopping capacity: ~$1,430</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mt-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Shopping Tip:</strong> When making large purchases, always calculate the actual savings amount, not just the percentage. A smaller percentage on a higher-priced item may save you more money overall.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="text-blue-800 dark:text-blue-300">Quick Reference Guide</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="font-medium mb-2">Percentage Discount</h4>
                  <div className="text-sm space-y-1">
                    <p className="font-mono bg-gray-100 dark:bg-gray-900 p-1 rounded">Sale Price = Original × (1 - Discount%)</p>
                    <p className="mt-2">
                      <strong>Example:</strong> 25% off $80<br />
                      $80 × (1 - 0.25) = $60
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="font-medium mb-2">Find Discount Percentage</h4>
                  <div className="text-sm space-y-1">
                    <p className="font-mono bg-gray-100 dark:bg-gray-900 p-1 rounded">Discount% = (Original - Sale) ÷ Original</p>
                    <p className="mt-2">
                      <strong>Example:</strong> $80 item selling for $60<br />
                      ($80 - $60) ÷ $80 = 25%
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="font-medium mb-2">Multiple Discounts</h4>
                  <div className="text-sm space-y-1">
                    <p className="font-mono bg-gray-100 dark:bg-gray-900 p-1 rounded">Final% = 1 - (1-D₁)(1-D₂)...(1-Dₙ)</p>
                    <p className="mt-2">
                      <strong>Example:</strong> 20% off, then 10% off<br />
                      1 - (0.8 × 0.9) = 28%
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Discount Calculator Best Practices</p>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                      Always verify your calculations, especially for important purchases. Be aware that some retailers may exclude certain items from discounts, and always check the fine print for limitations on promotions. For online shopping, add items to your cart to confirm the final price including any shipping or taxes.
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
              <Check className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Becoming a Savvy Discount Shopper
            </CardTitle>
            <CardDescription>
              Put your discount calculation skills to work
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Understanding discount calculations</strong> is more than just a mathematical exercise—it's an essential financial skill that can help you make better purchasing decisions, stay within budget, and maximize your savings. By mastering the concepts of percentage discounts, discount stacking, and strategic shopping timing, you'll be equipped to evaluate deals critically and avoid the marketing tactics that sometimes make discounts appear better than they are.
            </p>
            
            <p className="mt-4" id="key-lessons">
              Remember these key principles when evaluating discounts:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">For Smart Consumers</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Always calculate the actual amount saved, not just the percentage</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Know the original price to evaluate if a "sale" is truly a good deal</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Compare the final price across retailers, not just the discount percentage</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">For Business Owners</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Calculate how discounts affect your margins before offering promotions</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Consider the psychological impact of different discount presentations</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Test different discount strategies to find what resonates with your customers</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to calculate your savings?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Discount Calculator</strong> above to analyze any deal or promotion! For more shopping and financial tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/tax">
                        <Receipt className="h-4 w-4 mr-1" />
                        Sales Tax Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/coupon-value">
                        <Tags className="h-4 w-4 mr-1" />
                        Coupon Value Analyzer
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/budget">
                        <Wallet className="h-4 w-4 mr-1" />
                        Budget Planning
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
                  <CardTitle className="text-lg">Sales Tax Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate sales tax and final price for purchases in different locations.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/sales-tax">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Margin Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate profit margins and markups for pricing strategies.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/margin">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Percentage Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate percentages, increases, decreases, and differences.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/percentage">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      <SaveCalculationButton calculatorType="discount" inputs={{}} results={{}} />
      </main>
      <SiteFooter />
    </div>
  )
}