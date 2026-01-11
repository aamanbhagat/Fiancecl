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
// Add Accordion imports
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  DollarSign,
  Calculator,
  Download,
  Share2,
  PieChart,
  BarChart3,
  RefreshCw,
  TrendingUp,
  LineChart,
  Info,
  AlertCircle,
  Percent,
  Plus,
  Minus,
  Receipt,
  Tag,
  ShoppingCart,
  ShoppingBag,
  Building,
  GlobeIcon,
  BookOpen,
  AlertTriangle,
  ListFilter,
  Check,
  X,
  Building2,
  LightbulbIcon,
  UserIcon,
  CreditCard,
  Scale,
  Globe,
  MapPin,
  ArrowLeftRight,
  ListOrdered,
  CheckCircle,
  ArrowRight,
  Wallet,
  Map
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import SalesTaxSchema from './schema';

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
  id: string
  name: string
  price: number
  quantity: number
  taxExempt: boolean
  specialRate?: number
}

interface TaxBreakdown {
  stateTax: number
  localTax: number
  specialTax: number
  totalTax: number
}

export default function SalesTaxCalculator() {
  // Location and Tax Rates
  const [state, setState] = useState("NY")
  const [stateTaxRate, setStateTaxRate] = useState(4)
  const [localTaxRate, setLocalTaxRate] = useState(4.5)
  const [specialDistrictRate, setSpecialDistrictRate] = useState(0)
  const [customRate, setCustomRate] = useState(false)
  
  // Items and Calculations
  const [items, setItems] = useState<Item[]>([{
    id: '1',
    name: '',
    price: 0,
    quantity: 1,
    taxExempt: false
  }])
  
  // Results
  const [subtotal, setSubtotal] = useState(0)
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown>({
    stateTax: 0,
    localTax: 0,
    specialTax: 0,
    totalTax: 0
  })
  const [total, setTotal] = useState(0)
  
  // Settings
  const [currency, setCurrency] = useState("USD")
  const [calculationType, setCalculationType] = useState<"forward" | "reverse">("forward")
  
  // Sample tax rates by state
  const stateTaxRates: Record<string, { state: number, local: number }> = {
    "NY": { state: 4.0, local: 4.5 },
    "CA": { state: 7.25, local: 1.0 },
    "TX": { state: 6.25, local: 2.0 },
    "FL": { state: 6.0, local: 1.0 },
    "IL": { state: 6.25, local: 2.75 }
  }

  // Update tax rates when state changes
  useEffect(() => {
    if (!customRate && stateTaxRates[state]) {
      setStateTaxRate(stateTaxRates[state].state)
      setLocalTaxRate(stateTaxRates[state].local)
    }
  }, [state, customRate])

  // Calculate totals when inputs change
  useEffect(() => {
    if (calculationType === "forward") {
      // Calculate subtotal
      const newSubtotal = items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0)
      
      // Calculate tax components
      const taxableAmount = items.reduce((sum, item) => 
        sum + (item.taxExempt ? 0 : item.price * item.quantity), 0)
      
      const stateTaxAmount = (taxableAmount * stateTaxRate) / 100
      const localTaxAmount = (taxableAmount * localTaxRate) / 100
      const specialTaxAmount = (taxableAmount * specialDistrictRate) / 100
      
      const totalTaxAmount = stateTaxAmount + localTaxAmount + specialTaxAmount
      
      setSubtotal(newSubtotal)
      setTaxBreakdown({
        stateTax: stateTaxAmount,
        localTax: localTaxAmount,
        specialTax: specialTaxAmount,
        totalTax: totalTaxAmount
      })
      setTotal(newSubtotal + totalTaxAmount)
    } else {
      // Reverse calculation (from total to pre-tax amount)
      const totalTaxRate = stateTaxRate + localTaxRate + specialDistrictRate
      const newSubtotal = total / (1 + (totalTaxRate / 100))
      const totalTaxAmount = total - newSubtotal
      
      const stateTaxAmount = (newSubtotal * stateTaxRate) / 100
      const localTaxAmount = (newSubtotal * localTaxRate) / 100
      const specialTaxAmount = (newSubtotal * specialDistrictRate) / 100
      
      setSubtotal(newSubtotal)
      setTaxBreakdown({
        stateTax: stateTaxAmount,
        localTax: localTaxAmount,
        specialTax: specialTaxAmount,
        totalTax: totalTaxAmount
      })
    }
  }, [
    items,
    stateTaxRate,
    localTaxRate,
    specialDistrictRate,
    calculationType,
    total
  ])

  // Add new item
  const addItem = () => {
    setItems([
      ...items,
      {
        id: String(items.length + 1),
        name: '',
        price: 0,
        quantity: 1,
        taxExempt: false
      }
    ])
  }

  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  // Update item
  const updateItem = (id: string, field: keyof Item, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

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

  // Tax breakdown chart
  const pieChartData = {
    labels: ['Subtotal', 'State Tax', 'Local Tax', 'Special District Tax'],
    datasets: [{
      data: [
        subtotal,
        taxBreakdown.stateTax,
        taxBreakdown.localTax,
        taxBreakdown.specialTax
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
          return ((value / total) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Tax rate comparison chart
  const barChartData = {
    labels: ['State Tax', 'Local Tax', 'Special District Tax', 'Total Tax Rate'],
    datasets: [
      {
        label: 'Tax Rates',
        data: [stateTaxRate, localTaxRate, specialDistrictRate, stateTaxRate + localTaxRate + specialDistrictRate],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
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
            return value + '%'
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
        formatter: (value: number) => value.toFixed(2) + '%'
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
    pdf.save('sales-tax-calculation.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <SalesTaxSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Sales Tax <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate sales tax for any purchase with our easy-to-use calculator. Get accurate tax calculations based on location and tax rates.
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
                    <CardTitle>Calculate Sales Tax</CardTitle>
                    <CardDescription>
                      Enter purchase details and location to calculate applicable sales tax.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Location and Tax Rates */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Location & Tax Rates</h3>
                        <Switch
                          checked={customRate}
                          onCheckedChange={setCustomRate}
                          aria-label="Use custom tax rates"
                        />
                        <span className="text-sm text-muted-foreground">Custom Rates</span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Select 
                            value={state} 
                            onValueChange={setState}
                            disabled={customRate}
                          >
                            <SelectTrigger id="state">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NY">New York</SelectItem>
                              <SelectItem value="CA">California</SelectItem>
                              <SelectItem value="TX">Texas</SelectItem>
                              <SelectItem value="FL">Florida</SelectItem>
                              <SelectItem value="IL">Illinois</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger id="currency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="CAD">CAD ($)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="state-tax">State Tax Rate</Label>
                            <span className="text-sm text-muted-foreground">{stateTaxRate}%</span>
                          </div>
                          <Slider
                            id="state-tax"
                            min={0}
                            max={15}
                            step={0.25}
                            value={[stateTaxRate]}
                            onValueChange={(value) => setStateTaxRate(value[0])}
                            disabled={!customRate}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="local-tax">Local Tax Rate</Label>
                            <span className="text-sm text-muted-foreground">{localTaxRate}%</span>
                          </div>
                          <Slider
                            id="local-tax"
                            min={0}
                            max={10}
                            step={0.25}
                            value={[localTaxRate]}
                            onValueChange={(value) => setLocalTaxRate(value[0])}
                            disabled={!customRate}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="special-tax">Special District Tax</Label>
                            <span className="text-sm text-muted-foreground">{specialDistrictRate}%</span>
                          </div>
                          <Slider
                            id="special-tax"
                            min={0}
                            max={5}
                            step={0.25}
                            value={[specialDistrictRate]}
                            onValueChange={(value) => setSpecialDistrictRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="calculation-type">Calculation Type</Label>
                          <Select 
                            value={calculationType} 
                            onValueChange={(value) => setCalculationType(value as "forward" | "reverse")}
                          >
                            <SelectTrigger id="calculation-type">
                              <SelectValue placeholder="Select calculation type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="forward">Pre-tax to Total</SelectItem>
                              <SelectItem value="reverse">Total to Pre-tax</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {calculationType === "forward" ? (
                      /* Items List */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Items</h3>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={addItem}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add Item
                          </Button>
                        </div>
                        <div className="space-y-4">
                          {items.map((item) => (
                            <div key={item.id} className="grid gap-4 sm:grid-cols-5 items-end">
                              <div className="space-y-2">
                                <Label htmlFor={`item-name-${item.id}`}>Item Name</Label>
                                <Input
                                  id={`item-name-${item.id}`}
                                  value={item.name}
                                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                  placeholder="Item description"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`item-price-${item.id}`}>Price</Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    id={`item-price-${item.id}`}
                                    type="number"
                                    className="pl-9"
                                    value={item.price}
                                    onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`item-quantity-${item.id}`}>Quantity</Label>
                                <Input
                                  id={`item-quantity-${item.id}`}
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Switch
                                    checked={item.taxExempt}
                                    onCheckedChange={(checked) => updateItem(item.id, 'taxExempt', checked)}
                                  />
                                  Tax Exempt
                                </Label>
                              </div>
                              <div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(item.id)}
                                  disabled={items.length === 1}
                                  className="text-destructive"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Reverse Calculation */
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Total Amount (Including Tax)</h3>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="number"
                            className="pl-9"
                            value={total || ''} onChange={(e) => setTotal(e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="Enter total amount including tax"
                          />
                        </div>
                      </div>
                    )}
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
                        <p className="text-sm text-muted-foreground">Subtotal</p>
                        <p className="text-2xl font-bold">{formatCurrency(subtotal)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Tax</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(taxBreakdown.totalTax)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="rates">Tax Rates</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Tax Breakdown</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">State Tax</span>
                              <span className="font-medium">{formatCurrency(taxBreakdown.stateTax)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Local Tax</span>
                              <span className="font-medium">{formatCurrency(taxBreakdown.localTax)}</span>
                            </div>
                            {taxBreakdown.specialTax > 0 && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Special District Tax</span>
                                <span className="font-medium">{formatCurrency(taxBreakdown.specialTax)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Amount</span>
                              <span>{formatCurrency(total)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="rates" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={barChartData} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Applied Tax Rates</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">State Tax Rate</span>
                              <span className="font-medium">{stateTaxRate}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Local Tax Rate</span>
                              <span className="font-medium">{localTaxRate}%</span>
                            </div>
                            {specialDistrictRate > 0 && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Special District Rate</span>
                                <span className="font-medium">{specialDistrictRate}%</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Combined Tax Rate</span>
                              <span>{(stateTaxRate + localTaxRate + specialDistrictRate).toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Tax Information */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Tax Information</p>
                            <p className="text-sm text-muted-foreground">
                              {customRate 
                                ? "Using custom tax rates for calculation."
                                : `Based on tax rates for ${state}. Rates may vary by locality and are subject to change.`
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                  
                  <SaveCalculationButton
                    calculatorType="sales-tax"
                    inputs={{ purchasePrice: 0, taxRate: 0 }}
                    results={{ salesTax: 0, totalPrice: 0 }}
                  />
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Shopping Guide</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Sales Tax: The Complete Guide</h2>
        <p className="mt-3 text-muted-foreground text-lg">Navigate the complex world of sales taxes with confidence</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            The Essentials of Sales Tax
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                <strong>Sales tax</strong> is a consumption tax imposed by governments on the sale of goods and services. In the United States, sales tax is collected at the point of purchase and is calculated as a percentage of the price of the taxable good or service.
              </p>
              <p className="mt-3">
                While seemingly straightforward, sales tax can quickly become complex due to varying rates across states, counties, and cities, as well as different rules about what items are taxable. A sales tax calculator helps navigate this complexity, ensuring accurate calculations whether you're a consumer budgeting for a purchase or a business ensuring compliance.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Why Sales Tax Matters</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>• Affects the final price of almost everything you purchase</li>
                  <li>• Varies significantly by location (0% to over 10%)</li>
                  <li>• Different rules apply to different types of products</li>
                  <li>• Critical for business compliance and accounting</li>
                  <li>• Can impact purchasing decisions and budget planning</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">U.S. Sales Tax at a Glance</h3>
                <div className="h-[200px]">
                  <Pie 
                    data={{
                      labels: ['State Base Rate', 'County Add-on', 'City/Local Add-on', 'Special Districts'],
                      datasets: [{
                        data: [60, 20, 15, 5],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(14, 165, 233, 0.8)',
                          'rgba(6, 182, 212, 0.8)',
                          'rgba(20, 184, 166, 0.8)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Typical composition of sales tax in the United States</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did you know?</strong> Five states in the U.S. have no state sales tax: Alaska, Delaware, Montana, New Hampshire, and Oregon. However, some local jurisdictions in Alaska can still impose local sales taxes.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Consumer Budgeting</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Calculate the true cost of purchases with accurate sales tax estimates
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Building className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Business Compliance</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Ensure accurate collection and remittance of sales taxes for your business
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <GlobeIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Interstate Shopping</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Compare costs across state lines to find potential savings
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Sales Tax Fundamentals */}
      <div className="mb-10" id="sales-tax-fundamentals">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          How Sales Tax Works
        </h2>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-600" />
              The Geography of Sales Tax
            </CardTitle>
            <CardDescription>Understanding the variations across different jurisdictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Sales tax in the United States is not a uniform federal tax but rather a complex system where each state sets its own rules. Further complexity arises as counties, cities, and special districts can add their own rates on top of state rates.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="mb-2 font-medium text-blue-700 dark:text-blue-400">Multi-layered Sales Tax Structure</p>
                  <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-500">
                    <li><strong>State Base Rate:</strong> Set by state governments, ranges from 0% to 7.25%</li>
                    <li><strong>County Add-ons:</strong> Additional percentage imposed by county governments</li>
                    <li><strong>City/Local Add-ons:</strong> Further taxes added by municipalities</li>
                    <li><strong>Special District Taxes:</strong> Targeted taxes for transportation, education, etc.</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Combined state and local sales tax rates can exceed 10% in some jurisdictions. For example, parts of Chicago have combined rates of 10.25%, while portions of Alabama can reach 13.5%.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="h-[280px]">
                  <h4 className="text-center text-sm font-medium mb-2">Highest Combined State & Local Sales Tax Rates (2025)</h4>
                  <Bar 
                    data={{
                      labels: ['Tennessee', 'Louisiana', 'Arkansas', 'Washington', 'Alabama'],
                      datasets: [{
                        label: 'Average Combined Rate (%)',
                        data: [9.55, 9.52, 9.48, 9.29, 9.24],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(59, 130, 246, 0.7)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: false,
                          min: 8.5,
                          ticks: { callback: (value) => value + '%' }
                        }
                      },
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Online Purchases and Sales Tax</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Following the 2018 <em>South Dakota v. Wayfair</em> Supreme Court decision, states can now require online retailers to collect sales tax even without a physical presence in the state. Most major online retailers now collect sales tax based on the shipping destination.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-green-600" />
              Taxable vs. Exempt Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Not all products and services are treated equally when it comes to sales tax. Each state has its own rules about what is taxable and what is exempt, with some common patterns across states but many unique exceptions.
                </p>
                
                <div className="space-y-4">
                  <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Commonly Taxable Items</h4>
                    <ul className="text-sm space-y-1 text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Tangible goods:</strong> Clothing, furniture, electronics, vehicles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Prepared food:</strong> Restaurant meals, deli items, catering</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Software:</strong> Physical and increasingly digital downloads</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-3 border border-red-200 dark:border-red-900 rounded-lg bg-red-50/50 dark:bg-red-900/20">
                    <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">Commonly Exempt Items</h4>
                    <ul className="text-sm space-y-1 text-red-700 dark:text-red-400">
                      <li className="flex items-start gap-2">
                        <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Groceries:</strong> Unprepared food in many states</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Prescription medications:</strong> Medical necessity items</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Services:</strong> Professional, personal, and business services in many states</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                  <h4 className="font-medium text-lg mb-3">State Approaches to Grocery Taxation</h4>
                  <div className="h-[200px]">
                    <Pie 
                      data={{
                        labels: [
                          'States with full grocery exemption (32)',
                          'States with reduced grocery rate (6)',
                          'States with full sales tax on groceries (7)',
                          'No state sales tax (5)'
                        ],
                        datasets: [{
                          data: [32, 6, 7, 5],
                          backgroundColor: [
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
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
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Special Cases & Exceptions</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Many states have unique exemptions or special rates. For example, clothing under $175 is exempt in New York, while Massachusetts has an annual sales tax holiday weekend where most items under $2,500 are exempt from sales tax.
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
                <Building2 className="h-5 w-5 text-purple-600" />
                Business Sales Tax Responsibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Businesses have significant responsibilities when it comes to sales tax, acting as the government's collection agent. Understanding these obligations is critical to avoid penalties and legal issues.
              </p>

              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Collection Requirements</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Businesses must collect the appropriate sales tax at the point of sale based on the location where the product is delivered or where the service is performed. For brick-and-mortar stores, this is typically straightforward, but for e-commerce, it becomes more complex.
                </p>
              </div>
              
              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Filing & Remittance</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Businesses must file regular sales tax returns (monthly, quarterly, or annually depending on volume) and remit collected taxes to the appropriate tax authorities. Failure to do so can result in penalties, interest charges, and even criminal prosecution.
                </p>
              </div>
              
              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Nexus Considerations</h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  A business must collect sales tax in states where it has "nexus" (significant connection). This can be established through physical presence, meeting economic thresholds (e.g., $100,000 in sales or 200 transactions), or having employees or affiliates in a state.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Sales Tax Calculation Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                There are several ways to calculate sales tax, depending on the situation and information available.
              </p>

              <div className="space-y-4">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Forward Calculation (Most Common)</h4>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-blue-700 dark:text-blue-400"><strong>Formula:</strong> Sales Tax = Purchase Price × Tax Rate</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400"><strong>Example:</strong> $100 purchase with 8% tax rate</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">$100 × 0.08 = $8 tax</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">Total price: $108</p>
                  </div>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Reverse Calculation (Tax-Inclusive Price)</h4>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-blue-700 dark:text-blue-400"><strong>Formula:</strong> Original Price = Total Price ÷ (1 + Tax Rate)</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400"><strong>Example:</strong> $108 tax-inclusive price with 8% tax</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">$108 ÷ 1.08 = $100 original price</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">Tax amount: $8</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Rounding Rules:</strong> Sales tax calculations typically follow specific rounding rules. In most jurisdictions, tax is calculated to the third decimal place and then rounded to the nearest cent.
                  </p>
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
                <span className="text-2xl">Practical Applications of Sales Tax Calculators</span>
              </div>
            </CardTitle>
            <CardDescription>
              How to leverage sales tax tools in everyday situations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="consumer-uses" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                For Consumers
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    <strong>Sales tax calculators</strong> help consumers budget more accurately and avoid surprises at checkout. By including sales tax in your cost estimates, you can make more informed purchasing decisions.
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Key Consumer Applications:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <ShoppingCart className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Pre-purchase planning:</strong> Calculate the final cost including tax before shopping</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CreditCard className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Budget adherence:</strong> Ensure large purchases stay within budget when tax is included</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Scale className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Price comparisons:</strong> Factor in sales tax differences when comparing prices across jurisdictions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <GlobeIcon className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Travel planning:</strong> Estimate expenses more accurately when visiting areas with different tax rates</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 border border-green-200 dark:border-green-900 rounded-md bg-green-50 dark:bg-green-900/20">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      <strong>Practical Example:</strong> When planning a $1,500 furniture purchase, knowing the local 8.25% sales tax adds $123.75 helps you budget $1,623.75 instead of just $1,500.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Cross-Border Shopping Comparison</h4>
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <h4 className="text-base font-medium mb-3">Laptop Purchase: $1,200 Base Price</h4>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-blue-800 dark:text-blue-300">Portland, Oregon</p>
                            <p className="text-sm text-blue-600 dark:text-blue-500">0% state sales tax</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-800 dark:text-blue-300">$0.00 tax</p>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-500">$1,200.00 total</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-blue-800 dark:text-blue-300">Seattle, Washington</p>
                            <p className="text-sm text-blue-600 dark:text-blue-500">10.25% combined tax rate</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-800 dark:text-blue-300">$123.00 tax</p>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-500">$1,323.00 total</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-blue-800 dark:text-blue-300">New York City</p>
                            <p className="text-sm text-blue-600 dark:text-blue-500">8.875% combined tax rate</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-800 dark:text-blue-300">$106.50 tax</p>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-500">$1,306.50 total</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <strong>Important note:</strong> When shopping in another state, be aware that your home state may charge use tax on items brought back if they would have been taxable in your state.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="business-applications" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  For Businesses
                </h3>
                <p>
                  For businesses, accurate sales tax calculation is not just convenient—it's a legal requirement. Sales tax calculators help businesses ensure compliance while streamlining operations.
                </p>
                
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Pricing Strategy</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      Set prices that make sense after tax is added. For example, pricing an item at $9.26 might result in a clean $10.00 after tax in your jurisdiction.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Multi-jurisdiction Compliance</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      E-commerce businesses that ship to multiple states can integrate sales tax calculators with their checkout systems to automatically apply the correct tax rates based on shipping addresses.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Audit Preparation</h4>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-500">
                      Maintain accurate records of sales tax collected using calculator data, making potential audits much smoother and reducing the risk of penalties.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="e-commerce" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  E-commerce Considerations
                </h3>
                <p>
                  E-commerce businesses face unique challenges with sales tax due to selling across multiple tax jurisdictions. Modern sales tax calculators are essential tools for these businesses.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Economic Nexus Thresholds</h4>
                    <p className="text-sm mt-1">
                      Most states have established economic nexus thresholds (typically $100,000 in sales or 200 transactions). Once these are exceeded, online sellers must collect sales tax in that state.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Product Taxability by Location</h4>
                    <p className="text-sm mt-1">
                      The same product can be taxable in one state but exempt in another. For example, clothing is exempt in Minnesota but taxable in most other states.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Automation Solutions</h4>
                    <p className="text-sm mt-1">
                      Many e-commerce platforms integrate with sales tax API services that automatically update rates and rules, calculate appropriate taxes at checkout, and even assist with filing returns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Using Sales Tax Calculators */}
      <div className="mb-10" id="using-calculators">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Making the Most of Sales Tax Calculators
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Features to Look For</CardTitle>
              <CardDescription>
                What makes a good sales tax calculator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Location Precision
                </h4>
                <p className="text-sm text-muted-foreground">
                  Look for calculators that can determine rates based on specific addresses, not just zip codes, as rates can vary within a single zip code area.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                  Regular Updates
                </h4>
                <p className="text-sm text-muted-foreground">
                  Sales tax rates and rules change frequently. Choose a calculator that receives regular updates to maintain accuracy.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                  Product Category Awareness
                </h4>
                <p className="text-sm text-muted-foreground">
                  Advanced calculators can apply different rates based on product categories, accounting for exemptions and special rates.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                  Reverse Calculation
                </h4>
                <p className="text-sm text-muted-foreground">
                  The ability to calculate pre-tax price from a tax-inclusive total, which is useful for budgeting and accounting purposes.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Common Calculation Scenarios</CardTitle>
              <CardDescription>
                Everyday situations where sales tax calculators prove valuable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ListOrdered className="h-4 w-4 text-green-600" />
                  Multi-item Purchases
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate tax on shopping carts with mixed items, some of which may be taxable and others exempt.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4 text-green-600" />
                  Discounted Items
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine tax on items after applying coupons or discounts, which can be calculated differently depending on the jurisdiction.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Building className="h-4 w-4 text-green-600" />
                  Business Purchases
                </h4>
                <p className="text-sm text-muted-foreground">
                  Account for resale certificates or exemptions that may apply to business purchases intended for resale.
                </p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mt-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Pro Tip:</strong> When making a large purchase where sales tax represents a significant amount, check if neighboring jurisdictions have lower rates. The savings could be worth a short drive.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="text-blue-800 dark:text-blue-300">Step-by-Step Guide to Sales Tax Calculation</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <ol className="space-y-4 list-decimal list-inside">
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Determine the correct tax rate</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Enter the precise location where the sale takes place or where the item will be delivered. For most accurate results, use a complete address rather than just a zip code.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Enter item information</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Input the pre-tax price of your item. For multiple items, either enter them individually or sum their total, depending on the calculator's capabilities.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Check for exemptions</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Determine if the item falls into any exempt categories in the relevant jurisdiction. Advanced calculators allow you to select product types to apply appropriate exemptions.
                      </p>
                    </li>
                  </ol>
                </div>
                
                <div>
                  <ol className="space-y-4 list-decimal list-inside" start={4}>
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Apply any special conditions</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Account for factors like trade-in value, manufacturer rebates, or coupons that might affect the taxable amount according to local rules.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Review the calculation</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Check the calculated tax amount and total price. Confirm the tax rate applied matches what you expect for the jurisdiction.
                      </p>
                    </li>
                    
                    <li className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <span className="font-medium">Save or document as needed</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        For business purposes, save your calculation for record-keeping, invoice preparation, or tax filing requirements.
                      </p>
                    </li>
                  </ol>
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
              Navigating the Sales Tax Landscape
            </CardTitle>
            <CardDescription>
              Key takeaways for consumers and businesses alike
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Sales tax</strong> may seem like a small percentage, but its impact on budgets and business operations is significant. With rates and rules varying widely across jurisdictions and regularly changing, sales tax calculators have become essential tools for both consumers and businesses navigating this complex landscape.
            </p>
            
            <p className="mt-4" id="key-lessons">
              As you manage your finances in a world of varying tax requirements, remember these key principles:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">For Consumers</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Always budget with after-tax prices in mind</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Be aware of tax-exempt items that could save you money</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Consider tax implications when comparing prices across retailers in different locations</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">For Businesses</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Stay current with changing tax rates and nexus requirements</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Use accurate tax calculators to ensure compliance and avoid penalties</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Consider tax efficiency in your pricing and business location strategies</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to calculate with confidence?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Sales Tax Calculator</strong> above to quickly determine accurate tax amounts for any purchase! For more financial tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/discount">
                        <Percent className="h-4 w-4 mr-1" />
                        Discount Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/tip">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Tip Calculator
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
                  <CardTitle className="text-lg">VAT Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate Value Added Tax for international transactions and business purchases.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/vat">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Margin Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate profit margins and markup prices for your business.
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
                    Calculate sale prices and discounts with tax considerations.
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