"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Plus, Minus, Trash2, Receipt, Building, GlobeIcon, ShoppingCart, BookOpen, Layers, AlertTriangle, Percent, Building2, Check, LightbulbIcon, ArrowLeftRight, FileText, UserIcon, Globe, CheckCircle, ArrowRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import VatSchema from './schema';

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

interface Item {
  id: string;
  description: string;
  price: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

interface CountryVatRate {
  country: string;
  standardRate: number;
  reducedRates: number[];
  currency: string;
  currencySymbol: string;
}

const countryVatRates: CountryVatRate[] = [
  { country: "United Kingdom", standardRate: 20, reducedRates: [5, 0], currency: "GBP", currencySymbol: "£" },
  { country: "Germany", standardRate: 19, reducedRates: [7], currency: "EUR", currencySymbol: "€" },
  { country: "France", standardRate: 20, reducedRates: [10, 5.5], currency: "EUR", currencySymbol: "€" },
  { country: "Italy", standardRate: 22, reducedRates: [10, 4], currency: "EUR", currencySymbol: "€" },
  { country: "Spain", standardRate: 21, reducedRates: [10, 4], currency: "EUR", currencySymbol: "€" },
  { country: "Netherlands", standardRate: 21, reducedRates: [9], currency: "EUR", currencySymbol: "€" },
  { country: "Sweden", standardRate: 25, reducedRates: [12, 6], currency: "SEK", currencySymbol: "kr" },
  { country: "Denmark", standardRate: 25, reducedRates: [0], currency: "DKK", currencySymbol: "kr" },
  { country: "Norway", standardRate: 25, reducedRates: [15, 10], currency: "NOK", currencySymbol: "kr" },
  { country: "United States", standardRate: 0, reducedRates: [0], currency: "USD", currencySymbol: "$" },
]

export default function VATCalculator() {
  // Calculator Mode
  const [calculationMode, setCalculationMode] = useState<'add' | 'remove'>('add')
  
  // Country and Currency Settings
  const [selectedCountry, setSelectedCountry] = useState<string>("United Kingdom")
  const [customVatRate, setCustomVatRate] = useState<boolean>(false)
  const [vatRate, setVatRate] = useState<number>(20)
  
  // Multi-item calculation
  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      description: '',
      price: 0,
      vatRate: 20, // This will be updated by useEffect on mount
      vatAmount: 0,
      total: 0
    }
  ])
  
  // Totals
  const [subtotal, setSubtotal] = useState<number>(0)
  const [totalVat, setTotalVat] = useState<number>(0)
  const [grandTotal, setGrandTotal] = useState<number>(0)

  // Get current country settings
  const getCurrentCountry = () => {
    return countryVatRates.find(c => c.country === selectedCountry) || countryVatRates[0]
  }

  // Calculate VAT for a single amount
  const calculateVAT = (amount: number, rate: number, mode: 'add' | 'remove' = 'add') => {
    if (mode === 'add') {
      const vatAmount = (amount * rate) / 100
      return {
        vatAmount,
        total: amount + vatAmount
      }
    } else {
      const vatAmount = amount - (amount / (1 + rate / 100))
      return {
        vatAmount,
        total: amount,
        netAmount: amount - vatAmount
      }
    }
  }

  // Update calculations when country or VAT rate changes
  useEffect(() => {
    const country = getCurrentCountry()
    const newVatRate = customVatRate ? vatRate : country.standardRate
    setVatRate(newVatRate)

    // Update all items' VAT rates to the new country's standard rate (unless custom rate is used)
    setItems(prevItems => prevItems.map(item => {
      const updatedVatRate = customVatRate ? vatRate : country.standardRate
      const { vatAmount, total } = calculateVAT(item.price, updatedVatRate, calculationMode)
      return {
        ...item,
        vatRate: updatedVatRate,
        vatAmount,
        total
      }
    }))
  }, [selectedCountry, customVatRate])

  // Update calculations when inputs change
  useEffect(() => {
    const newItems = items.map(item => {
      const { vatAmount, total } = calculateVAT(item.price, item.vatRate, calculationMode)
      return {
        ...item,
        vatAmount,
        total
      }
    })

    // Calculate totals
    const newSubtotal = calculationMode === 'add' 
      ? newItems.reduce((sum, item) => sum + item.price, 0)
      : newItems.reduce((sum, item) => sum + (item.total - item.vatAmount), 0)
    
    const newTotalVat = newItems.reduce((sum, item) => sum + item.vatAmount, 0)
    const newGrandTotal = newItems.reduce((sum, item) => sum + item.total, 0)

    setSubtotal(newSubtotal)
    setTotalVat(newTotalVat)
    setGrandTotal(newGrandTotal)

  }, [items, calculationMode])

  // Add new item
  const addItem = () => {
    const newItem: Item = {
      id: String(items.length + 1),
      description: '',
      price: 0,
      vatRate: customVatRate ? vatRate : getCurrentCountry().standardRate,
      vatAmount: 0,
      total: 0
    }
    setItems(prevItems => [...prevItems, newItem])
  }

  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prevItems => prevItems.filter(item => item.id !== id))
    }
  }

  // Update item
  const updateItem = (id: string, field: keyof Item, value: any) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id && item[field] !== value) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'price') {
          const { vatAmount, total } = calculateVAT(value, item.vatRate, calculationMode)
          updatedItem.vatAmount = vatAmount
          updatedItem.total = total
        }
        return updatedItem
      }
      return item
    }))
  }

  // Chart colors
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

  // Breakdown chart data
  const breakdownChartData = {
    labels: ['Net Amount', 'VAT'],
    datasets: [{
      data: [subtotal, totalVat],
      backgroundColor: chartColors.primary.slice(0, 2),
      borderColor: chartColors.secondary.slice(0, 2).map(color => color.replace('0.2', '1')),
      borderWidth: 2
    }]
  }

  const breakdownChartOptions: ChartOptions<'pie'> = {
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
          return ((value / grandTotal) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Rate comparison chart
  const rateComparisonData = {
    labels: countryVatRates.slice(0, 5).map(c => c.country),
    datasets: [
      {
        label: 'Standard VAT Rate',
        data: countryVatRates.slice(0, 5).map(c => c.standardRate),
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const rateComparisonOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => value + '%'
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
        formatter: (value: number) => value + '%'
      }
    }
  }

  const formatCurrency = (amount: number) => {
    const country = getCurrentCountry()
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: country.currency,
      currencyDisplay: 'symbol',
      maximumFractionDigits: 2
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
    pdf.save('vat-calculation.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <VatSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10">
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        VAT <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Calculator</span>
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Calculate Value Added Tax (VAT) for your goods and services with our easy-to-use calculator.
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
                    <CardTitle>VAT Calculator</CardTitle>
                    <CardDescription>
                      Calculate VAT by adding items and selecting the appropriate tax rates.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Country and Mode Selection */}
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                            <SelectTrigger id="country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countryVatRates.map((country) => (
                                <SelectItem key={country.country} value={country.country}>
                                  {country.country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="calculation-mode">Calculation Mode</Label>
                          <Select 
                            value={calculationMode} 
                            onValueChange={(value: 'add' | 'remove') => setCalculationMode(value)}
                          >
                            <SelectTrigger id="calculation-mode">
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="add">Add VAT to price</SelectItem>
                              <SelectItem value="remove">Remove VAT from price</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="custom-rate"
                          checked={customVatRate}
                          onCheckedChange={setCustomVatRate}
                        />
                        <Label htmlFor="custom-rate">Use custom VAT rate</Label>
                      </div>
                      {customVatRate && (
                        <div className="space-y-2">
                          <Label htmlFor="vat-rate">Custom VAT Rate (%)</Label>
                          <Input
                            id="vat-rate"
                            type="number"
                            value={vatRate || ''} onChange={(e) => setVatRate(e.target.value === '' ? 0 : Number(e.target.value))}
                            min={0}
                            max={100}
                            step={0.1}
                          />
                        </div>
                      )}
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Items</h3>
                        <Button onClick={addItem} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="grid gap-4 sm:grid-cols-12 items-end">
                            <div className="sm:col-span-4">
                              <Label htmlFor={`description-${item.id}`}>Description</Label>
                              <Input
                                id={`description-${item.id}`}
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                placeholder="Item description"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <Label htmlFor={`price-${item.id}`}>Price</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id={`price-${item.id}`}
                                  type="number"
                                  className="pl-9"
                                  value={item.price}
                                  onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                                  min={0}
                                  step={0.01}
                                />
                              </div>
                            </div>
                            <div className="sm:col-span-3">
                              <Label htmlFor={`vat-rate-${item.id}`}>VAT Rate</Label>
                              <Select
                                value={String(item.vatRate)}
                                onValueChange={(value) => updateItem(item.id, 'vatRate', Number(value))}
                              >
                                <SelectTrigger id={`vat-rate-${item.id}`}>
                                  <SelectValue placeholder="Select VAT rate" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={String(getCurrentCountry().standardRate)}>
                                    Standard ({getCurrentCountry().standardRate}%)
                                  </SelectItem>
                                  {getCurrentCountry().reducedRates.map((rate) => (
                                    <SelectItem key={rate} value={String(rate)}>
                                      Reduced ({rate}%)
                                    </SelectItem>
                                  ))}
                                  {customVatRate && (
                                    <SelectItem value={String(vatRate)}>
                                      Custom ({vatRate}%)
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="sm:col-span-2">
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                disabled={items.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
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
                    <Tabs defaultValue="summary" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                      </TabsList>

                      <TabsContent value="summary" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={breakdownChartData} options={breakdownChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Calculation Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Net Amount</span>
                              <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">VAT Amount</span>
                              <span className="font-medium">{formatCurrency(totalVat)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Amount</span>
                              <span>{formatCurrency(grandTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={rateComparisonData} options={rateComparisonOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Standard VAT rates comparison across countries
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* VAT Information */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">VAT Information for {selectedCountry}</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Standard rate: {getCurrentCountry().standardRate}%</li>
                              {getCurrentCountry().reducedRates.length > 0 && (
                                <li>• Reduced rates: {getCurrentCountry().reducedRates.join('%, ')}%</li>
                              )}
                              <li>• Currency: {getCurrentCountry().currency}</li>
                              <li>• Rates current as of March 27, 2025</li>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Business Essentials</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Value Added Tax (VAT): A Complete Guide</h2>
        <p className="mt-3 text-muted-foreground text-lg">Navigate the complexities of VAT with confidence</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            The Fundamentals of VAT
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                <strong>Value Added Tax (VAT)</strong> is a consumption tax placed on products and services whenever value is added at each stage of the supply chain, from production to the point of sale. Unlike a simple sales tax that's only charged to the end consumer, VAT is collected by all businesses involved in the supply chain.
              </p>
              <p className="mt-3">
                This multi-staged collection system makes VAT one of the most important revenue sources for governments worldwide, particularly in Europe where it typically accounts for 15-25% of total tax revenue. A VAT calculator helps businesses and consumers understand how this tax affects prices and financial obligations.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Why VAT Matters</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>• Affects pricing decisions for businesses</li>
                  <li>• Impacts profit margins and cash flow</li>
                  <li>• Creates compliance and reporting obligations</li>
                  <li>• Influences consumer purchasing decisions</li>
                  <li>• Critical for international trade and cross-border transactions</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">VAT Around the World</h3>
                <div className="h-[200px]">
                  <Bar 
                    data={{
                      labels: ['UK', 'Germany', 'France', 'Italy', 'Spain', 'Japan', 'Australia'],
                      datasets: [{
                        label: 'Standard VAT Rate (%)',
                        data: [20, 19, 20, 22, 21, 10, 10],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(59, 130, 246, 0.8)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => value + '%' }
                        }
                      },
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Standard VAT/GST rates in major economies (2025)</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did you know?</strong> The United States is the only major developed economy without a national VAT or GST system, instead relying on state and local sales taxes.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Business Compliance</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Calculate VAT for reporting, invoicing, and reclaiming purposes
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <GlobeIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">International Trade</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Understand cross-border VAT implications and requirements
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <ShoppingCart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Consumer Awareness</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Determine the true pre-tax cost of goods and services
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* VAT Fundamentals */}
      <div className="mb-10" id="vat-fundamentals">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          How VAT Works
        </h2>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              The Multi-Stage Collection System
            </CardTitle>
            <CardDescription>Understanding the value chain approach to taxation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  VAT is often described as a tax on value added at each stage of production and distribution. Each business in the supply chain collects VAT on their sales and can reclaim VAT paid on their purchases, ultimately passing the tax burden to the final consumer.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="mb-2 font-medium text-blue-700 dark:text-blue-400">The VAT Collection Process</p>
                  <ol className="space-y-1 text-sm text-blue-600 dark:text-blue-500 list-decimal list-inside">
                    <li><strong>Collection:</strong> Businesses charge VAT on taxable sales</li>
                    <li><strong>Deduction:</strong> They deduct VAT paid on business purchases</li>
                    <li><strong>Remittance:</strong> They pay the difference to tax authorities</li>
                    <li><strong>Reclaims:</strong> If input VAT exceeds output VAT, they can claim a refund</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Although the VAT is collected throughout the supply chain, the economic burden ultimately falls on the final consumer who cannot reclaim the tax.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                  <h4 className="font-medium text-lg mb-3">VAT Along the Supply Chain</h4>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2">Supply Chain Stage</th>
                          <th className="px-3 py-2">Sale Price</th>
                          <th className="px-3 py-2">VAT Collected</th>
                          <th className="px-3 py-2">VAT Paid</th>
                          <th className="px-3 py-2">VAT Remitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                          <td className="px-3 py-2">Raw Materials</td>
                          <td className="px-3 py-2">€100</td>
                          <td className="px-3 py-2">€20</td>
                          <td className="px-3 py-2">€0</td>
                          <td className="px-3 py-2">€20</td>
                        </tr>
                        <tr className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                          <td className="px-3 py-2">Manufacturer</td>
                          <td className="px-3 py-2">€200</td>
                          <td className="px-3 py-2">€40</td>
                          <td className="px-3 py-2">€20</td>
                          <td className="px-3 py-2">€20</td>
                        </tr>
                        <tr className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                          <td className="px-3 py-2">Wholesaler</td>
                          <td className="px-3 py-2">€300</td>
                          <td className="px-3 py-2">€60</td>
                          <td className="px-3 py-2">€40</td>
                          <td className="px-3 py-2">€20</td>
                        </tr>
                        <tr className="bg-white dark:bg-gray-900">
                          <td className="px-3 py-2">Retailer</td>
                          <td className="px-3 py-2">€400</td>
                          <td className="px-3 py-2">€80</td>
                          <td className="px-3 py-2">€60</td>
                          <td className="px-3 py-2">€20</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800">
                          <td className="px-3 py-2">Total</td>
                          <td className="px-3 py-2"></td>
                          <td className="px-3 py-2"></td>
                          <td className="px-3 py-2"></td>
                          <td className="px-3 py-2">€80</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Example assuming 20% VAT rate</p>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">VAT vs. Sales Tax</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Unlike sales tax, which is collected only at the final point of sale, VAT is collected incrementally throughout the supply chain. This design makes VAT harder to evade and provides governments with a steady revenue stream at each production stage.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-green-600" />
              VAT Rates and Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Most VAT systems employ multiple rates depending on the type of goods or services. Understanding these different rates is crucial for both compliance and financial planning.
                </p>
                
                <div className="space-y-4">
                  <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Standard Rate</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Applied to most goods and services. Typically ranges from 15-27% in European countries, 5-10% in Asia-Pacific regions using GST systems.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Reduced Rates</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Lower rates applied to necessities or items with social importance. Common examples include food, books, children's clothing, and public transportation.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Zero Rate</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      0% VAT charged on output, but businesses can still reclaim input VAT. Often applies to exports, allowing goods to be competitive in international markets.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Exempt</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      No VAT charged on output and no ability to reclaim input VAT. Common for healthcare, education, insurance, and financial services.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                  <h4 className="font-medium text-lg mb-3">VAT Rate Examples: UK (2025)</h4>
                  <div className="h-[220px]">
                    <Pie 
                      data={{
                        labels: [
                          'Standard Rate (20%)',
                          'Reduced Rate (5%)',
                          'Zero Rate (0%)',
                          'Exempt'
                        ],
                        datasets: [{
                          data: [65, 10, 15, 10],
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(107, 114, 128, 0.8)'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { 
                            position: 'bottom',
                            labels: { boxWidth: 12, padding: 10 }
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-center mt-2 text-muted-foreground">
                    Approximate distribution of goods and services by VAT category
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Product Classification Challenges</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    VAT classification can be complex and sometimes controversial. For example, in the UK, a chocolate-covered biscuit is subject to standard rate VAT, while a chocolate-covered cake is zero-rated, leading to famous legal cases determining whether products like Jaffa Cakes are cakes or biscuits.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-purple-600" />
                VAT Calculation Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                There are several methods for calculating VAT, depending on whether you're starting with a VAT-inclusive or VAT-exclusive amount.
              </p>

              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Forward Calculation (Adding VAT)</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  When you have a net price and need to calculate the VAT amount and gross price.
                </p>
                <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                  <div>VAT Amount = Net Price × VAT Rate</div>
                  <div>Gross Price = Net Price + VAT Amount</div>
                  <div className="text-xs mt-1 text-muted-foreground">Example: €100 × 20% = €20 VAT, Gross: €120</div>
                </div>
              </div>
              
              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Reverse Calculation (Extracting VAT)</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  When you have a VAT-inclusive price and need to calculate the VAT amount and net price.
                </p>
                <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                  <div>VAT Amount = Gross Price × [VAT Rate ÷ (100% + VAT Rate)]</div>
                  <div>Net Price = Gross Price - VAT Amount</div>
                  <div className="text-xs mt-1 text-muted-foreground">Example: €120 × (20 ÷ 120) = €20 VAT, Net: €100</div>
                </div>
              </div>
              
              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">VAT Fraction</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  A simplified formula for extracting VAT from a gross amount, particularly useful in countries with standard VAT fractions.
                </p>
                <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                  <div>VAT Fraction = VAT Rate ÷ (100% + VAT Rate)</div>
                  <div>VAT Amount = Gross Price × VAT Fraction</div>
                  <div className="text-xs mt-1 text-muted-foreground">Example: For 20% VAT, Fraction = 1/6, so €120 × (1/6) = €20 VAT</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Business VAT Processes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                VAT-registered businesses have specific obligations and processes to manage their VAT responsibilities effectively.
              </p>

              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Registration Requirements</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Businesses must register for VAT when their taxable turnover exceeds the threshold set by their local tax authority. In the UK, this threshold is £85,000 per annum (as of 2025), while many EU countries have lower thresholds.
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Invoice Requirements</h4>
                  <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-400">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>VAT registration number</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Net amount per item and total</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>VAT rate applied and VAT amount</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Total amount including VAT</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Filing Periods and Returns</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    VAT returns are typically submitted quarterly, though monthly or annual options may be available depending on business size and country. Modern systems increasingly require digital submission of returns and supporting data.
                  </p>
                </div>

                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Important:</strong> Penalties for non-compliance with VAT regulations can be severe, including financial penalties, interest on late payments, and even criminal prosecution for fraudulent reporting.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Practical Applications */}
      <div className="mb-10" id="practical-applications">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <LightbulbIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">VAT Calculators in Action</span>
              </div>
            </CardTitle>
            <CardDescription>
              Practical applications for businesses and consumers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="business-applications" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5" />
                For Businesses
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    <strong>VAT calculators</strong> are essential tools for businesses to manage their VAT obligations accurately and efficiently. They help with everything from invoice preparation to return filing.
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Key Business Applications:</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Receipt className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Invoice Preparation:</strong> Automatically calculate the correct VAT amount to charge customers based on applicable rates and product categories</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowLeftRight className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Input/Output Analysis:</strong> Track VAT paid on purchases versus VAT collected on sales to determine payment or refund position</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Return Preparation:</strong> Compile data for periodic VAT returns, ensuring accurate reporting to tax authorities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Cash Flow Forecasting:</strong> Project VAT payments and refunds to better manage business cash flow</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Common Business Scenarios</h4>
                  <div className="space-y-4">
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <h5 className="font-medium">Partial Exemption</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          When businesses make both taxable and exempt supplies, they must apportion input VAT recovery. VAT calculators can help apply complex partial exemption methods to determine recoverable amounts.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <h5 className="font-medium">Margin Scheme Calculations</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Special VAT schemes like the Second-hand Margin Scheme allow certain businesses to pay VAT only on their profit margin rather than the full selling price. Calculators help determine the correct VAT amount.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <h5 className="font-medium">Reverse Charge Mechanism</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          In specific B2B transactions, especially cross-border services, the customer becomes responsible for accounting for VAT through the reverse charge procedure. Calculators help ensure correct application.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      <strong>Pro Tip:</strong> Consider using VAT calculators that integrate with your accounting system to automatically track VAT transactions and support digital filing requirements like Making Tax Digital in the UK.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="consumer-uses" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  For Consumers
                </h3>
                <p>
                  While VAT is primarily a business concern, consumers can also benefit from understanding and calculating VAT on their purchases.
                </p>
                
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Price Transparency</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      In countries where displayed prices include VAT, consumers can use calculators to determine the pre-tax cost. This is particularly useful when comparing prices across different tax jurisdictions.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Tax Refund Claims</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      Tourists visiting VAT-implementing countries can often claim VAT refunds on goods purchased. VAT calculators help determine potential refund amounts when shopping abroad.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Budgeting for International Purchases</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      When making purchases from overseas, VAT calculators help estimate potential import VAT and customs charges that may apply.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Consumer Example: UK Tourist Tax-Free Shopping</h4>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Purchase Amount (inc. VAT)</span>
                        <span className="font-medium">£1,200</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT Rate</span>
                        <span className="font-medium">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT Amount</span>
                        <span className="font-medium">£200</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Admin Fee (typical)</span>
                        <span className="font-medium">-£20</span>
                      </div>
                      <div className="flex justify-between text-green-600 dark:text-green-400 font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                        <span>Potential Refund</span>
                        <span>£180</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="international-trade" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  International Trade Considerations
                </h3>
                <p>
                  Cross-border transactions introduce additional complexities to VAT calculations and requirements.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Import VAT Calculation</h4>
                    <p className="text-sm mt-1">
                      When goods are imported from outside a VAT territory, import VAT is typically calculated on the customs value plus any import duty. VAT calculators that handle these additional factors are essential for businesses involved in international trade.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Place of Supply Rules</h4>
                    <p className="text-sm mt-1">
                      Services can have complex "place of supply" rules that determine which country's VAT rules apply. Digital service providers, for example, must often charge VAT based on the customer's location rather than their own.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">VAT MOSS (Mini One Stop Shop)</h4>
                    <p className="text-sm mt-1">
                      Systems like VAT MOSS allow businesses selling digital services to consumers in multiple EU countries to report and pay VAT through a single return in their home country, rather than registering in each country separately.
                    </p>
                  </div>
                  
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <strong>Cross-Border Complexity:</strong> International VAT rules are constantly evolving, particularly for e-commerce and digital services. Specialized VAT calculators for international trade should be regularly updated to reflect current regulations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Using VAT Calculators */}
      <div className="mb-10" id="using-calculators">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Making the Most of VAT Calculators
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Essential Calculator Features</CardTitle>
              <CardDescription>
                What to look for in an effective VAT calculator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  Multiple Rate Support
                </h4>
                <p className="text-sm text-muted-foreground">
                  The ability to handle different VAT rates (standard, reduced, zero) and automatically apply them based on product categories.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                  Bidirectional Calculations
                </h4>
                <p className="text-sm text-muted-foreground">
                  Support for both adding VAT to net amounts and extracting VAT from gross amounts, with clear distinction between inclusive and exclusive pricing.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  International Functionality
                </h4>
                <p className="text-sm text-muted-foreground">
                  Up-to-date rates for multiple countries and handling of special cross-border scenarios like distance selling, reverse charge, and import VAT.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Reporting Integration
                </h4>
                <p className="text-sm text-muted-foreground">
                  The ability to generate reports for VAT returns, track input and output VAT over reporting periods, and potentially integrate with accounting systems.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Common Calculation Scenarios</CardTitle>
              <CardDescription>
                Everyday VAT calculations you might encounter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-600" />
                  Adding VAT to Net Prices
                </h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">Net Price: €100</div>
                    <div className="text-sm">VAT Rate: 20%</div>
                    <div className="text-sm">VAT Amount: €20</div>
                    <div className="text-sm font-medium">Gross Price: €120</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Minus className="h-4 w-4 text-green-600" />
                  Extracting VAT from Gross Prices
                </h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">Gross Price: €120</div>
                    <div className="text-sm">VAT Rate: 20%</div>
                    <div className="text-sm">VAT Amount: €20</div>
                    <div className="text-sm font-medium">Net Price: €100</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  VAT Return Calculation
                </h4>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Output VAT (collected):</span>
                      <span className="text-sm">€5,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Input VAT (paid):</span>
                      <span className="text-sm">€3,500</span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                      <span className="text-sm">VAT Payable to Authorities:</span>
                      <span className="text-sm">€1,500</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mt-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Pro Tip:</strong> For regular business transactions, consider using VAT calculators that can handle batch calculations and track transactions over time, rather than single-use calculators that only handle one calculation at a time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="text-blue-800 dark:text-blue-300">Step-by-Step VAT Calculator Guide</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <ol className="space-y-4 list-decimal list-inside">
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Select your calculation type</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Choose whether you're adding VAT to a net amount or extracting VAT from a gross amount. Some calculators refer to this as "VAT exclusive" or "VAT inclusive" calculation.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Enter the appropriate amount</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Input either the net (pre-VAT) or gross (VAT-inclusive) amount depending on your calculation type.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Select the VAT rate</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Choose the applicable VAT rate. Advanced calculators might offer presets for different countries or product categories.
                      </p>
                    </li>
                  </ol>
                </div>
                
                <div>
                 <ol className="space-y-4 list-decimal list-inside" start={4}>
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Review the calculation</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Verify that the calculator has determined the correct VAT amount, net amount, and gross amount based on your inputs.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Apply to your specific needs</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Use the results for invoice preparation, VAT return calculations, financial planning, or whatever purpose you need.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Save or export if needed</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Many business-oriented VAT calculators allow you to save calculations for future reference or export them to accounting systems.
                      </p>
                    </li>
                  </ol>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Rounding Considerations</p>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                      Different countries have different VAT rounding rules. For example, the UK typically rounds to the nearest penny, while some EU countries use specific rounding rules for fractions of cents. Professional VAT calculators should apply the appropriate rounding rules for the jurisdiction in question.
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
              Mastering VAT Management
            </CardTitle>
            <CardDescription>
              Key takeaways for effective VAT handling
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Value Added Tax</strong> is a sophisticated consumption tax system with far-reaching implications for businesses and consumers alike. Understanding how VAT works and utilizing appropriate calculation tools can help businesses ensure compliance, optimize cash flow, and make informed financial decisions.
            </p>
            
            <p className="mt-4" id="key-lessons">
              As you navigate the complexities of VAT, keep these key principles in mind:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">For Businesses</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Use specialized VAT calculators to ensure accurate invoicing and reporting</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Stay updated with changing VAT rates and regulations in your jurisdictions</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Consider VAT implications when setting prices and planning cash flow</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">For International Operations</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Use calculators that account for place of supply rules and cross-border considerations</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Be aware of registration thresholds in different countries</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Leverage special schemes like MOSS when available for simplification</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to simplify your VAT calculations?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>VAT Calculator</strong> above to quickly perform accurate VAT calculations for any scenario! For more financial tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/sales-tax">
                        <Receipt className="h-4 w-4 mr-1" />
                        Sales Tax Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/invoice">
                        <FileText className="h-4 w-4 mr-1" />
                        Invoice Generator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/profit-margin">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Profit Margin
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
                    Calculate sales tax for different regions and jurisdictions.
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
                    Calculate profit margins and markup percentages for your business.
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
                  <CardTitle className="text-lg">Discount Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate discounts and final prices after applying percentage reductions.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/discount">Try Calculator</Link>
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