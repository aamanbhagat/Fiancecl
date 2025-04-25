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
  Car,
  Tag,
  Clock,
  Percent,
  Wallet,
  Calendar,
  Check,
  ArrowRight
} from "lucide-react"; // Removed 'Chart' from this import
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import AutoLeaseSchema from './schema';

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

export default function AutoLeaseCalculator() {
  // Vehicle & Lease Details
  const [vehiclePrice, setVehiclePrice] = useState<number>(35000)
  const [residualPercent, setResidualPercent] = useState<number>(55)
  const [leaseTerm, setLeaseTerm] = useState<number>(36)
  const [moneyFactor, setMoneyFactor] = useState<number>(0.00125)
  const [downPayment, setDownPayment] = useState<number>(3000)
  const [mileageAllowance, setMileageAllowance] = useState<number>(12000)
  const [excessMileageRate, setExcessMileageRate] = useState<number>(0.25)
  
  // Taxes & Fees
  const [salesTaxRate, setSalesTaxRate] = useState<number>(6)
  const [acquisitionFee, setAcquisitionFee] = useState<number>(895)
  const [dispositionFee, setDispositionFee] = useState<number>(350)
  const [documentationFee, setDocumentationFee] = useState<number>(100)
  const [registrationFee, setRegistrationFee] = useState<number>(300)
  const [includeAcquisitionInPayment, setIncludeAcquisitionInPayment] = useState<boolean>(true)
  
  // Results State
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0)
  const [paymentBreakdown, setPaymentBreakdown] = useState<{
    depreciation: number;
    finance: number;
    tax: number;
    total: number;
  }>({
    depreciation: 0,
    finance: 0,
    tax: 0,
    total: 0
  })
  const [totalCost, setTotalCost] = useState<{
    upfront: number;
    monthly: number;
    endOfLease: number;
    total: number;
  }>({
    upfront: 0,
    monthly: 0,
    endOfLease: 0,
    total: 0
  })
  const [comparisonScenarios, setComparisonScenarios] = useState<{
    term: number;
    payment: number;
    totalCost: number;
  }[]>([])

  // Calculate lease payments and costs
  useEffect(() => {
    // Calculate residual value
    const residualValue = (vehiclePrice * residualPercent) / 100
    
    // Calculate adjusted capitalized cost
    const adjustedCapCost = vehiclePrice - downPayment + 
      (includeAcquisitionInPayment ? acquisitionFee : 0)
    
    // Calculate monthly depreciation
    const monthlyDepreciation = (adjustedCapCost - residualValue) / leaseTerm
    
    // Calculate monthly finance charge
    const monthlyFinance = (adjustedCapCost + residualValue) * moneyFactor
    
    // Calculate base monthly payment
    const baseMonthly = monthlyDepreciation + monthlyFinance
    
    // Calculate monthly tax
    const monthlyTax = baseMonthly * (salesTaxRate / 100)
    
    // Calculate total monthly payment
    const totalMonthly = baseMonthly + monthlyTax
    
    // Update payment breakdown
    setPaymentBreakdown({
      depreciation: monthlyDepreciation,
      finance: monthlyFinance,
      tax: monthlyTax,
      total: totalMonthly
    })
    
    // Calculate total upfront costs
    const upfrontCosts = downPayment + 
      (includeAcquisitionInPayment ? 0 : acquisitionFee) + 
      documentationFee + 
      registrationFee
    
    // Calculate total monthly costs
    const totalMonthlyCosts = totalMonthly * leaseTerm
    
    // Calculate end of lease costs
    const endOfLeaseCosts = dispositionFee
    
    // Calculate total lease cost
    const totalLeaseCost = upfrontCosts + totalMonthlyCosts + endOfLeaseCosts
    
    // Update total cost breakdown
    setTotalCost({
      upfront: upfrontCosts,
      monthly: totalMonthlyCosts,
      endOfLease: endOfLeaseCosts,
      total: totalLeaseCost
    })
    
    // Set monthly payment
    setMonthlyPayment(totalMonthly)
    
    // Generate comparison scenarios for different lease terms
    const terms = [24, 36, 48]
    const scenarios = terms.map(term => {
      const monthlyDep = (adjustedCapCost - residualValue) / term
      const monthlyFin = (adjustedCapCost + residualValue) * moneyFactor
      const basePayment = monthlyDep + monthlyFin
      const totalPayment = basePayment * (1 + salesTaxRate / 100)
      const totalCost = upfrontCosts + (totalPayment * term) + endOfLeaseCosts
      
      return {
        term,
        payment: totalPayment,
        totalCost
      }
    })
    
    setComparisonScenarios(scenarios)
    
  }, [
    vehiclePrice,
    residualPercent,
    leaseTerm,
    moneyFactor,
    downPayment,
    salesTaxRate,
    acquisitionFee,
    dispositionFee,
    documentationFee,
    registrationFee,
    includeAcquisitionInPayment
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

  // Payment breakdown chart
  const pieChartData = {
    labels: ['Depreciation', 'Finance Charge', 'Sales Tax'],
    datasets: [{
      data: [
        paymentBreakdown.depreciation,
        paymentBreakdown.finance,
        paymentBreakdown.tax
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
          return ((value / paymentBreakdown.total) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Term comparison chart
  const barChartData = {
    labels: comparisonScenarios.map(s => `${s.term} Months`),
    datasets: [
      {
        label: 'Monthly Payment',
        data: comparisonScenarios.map(s => s.payment),
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
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

  // Total cost breakdown chart
  const costBreakdownData = {
    labels: ['Upfront Costs', 'Monthly Payments', 'End of Lease'],
    datasets: [
      {
        label: 'Cost Breakdown',
        data: [totalCost.upfront, totalCost.monthly, totalCost.endOfLease],
        backgroundColor: chartColors.primary.slice(0, 3),
        borderColor: chartColors.secondary.slice(0, 3).map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const costBreakdownOptions: ChartOptions<'bar'> = {
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
        display: false
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
    pdf.save('auto-lease-analysis.pdf')
  }

  const exportBlogPDF = async () => {
    const element = document.getElementById('blog-section')
    if (!element) return
    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    })
    const imgWidth = 595
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= 842

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 842
    }

    pdf.save('auto-lease-guide.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <AutoLeaseSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Auto Lease <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your monthly lease payments and understand the total cost of leasing a vehicle.
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
                    <CardTitle>Enter Lease Details</CardTitle>
                    <CardDescription>
                      Provide information about the vehicle and lease terms to calculate payments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Vehicle & Lease Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Vehicle & Lease Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="vehicle-price">Vehicle Price (MSRP)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="vehicle-price"
                              type="number"
                              className="pl-9"
                              value={vehiclePrice}
                              onChange={(e) => setVehiclePrice(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="residual-percent">Residual Value</Label>
                            <span className="text-sm text-muted-foreground">{residualPercent}%</span>
                          </div>
                          <Slider
                            id="residual-percent"
                            min={30}
                            max={70}
                            step={1}
                            value={[residualPercent]}
                            onValueChange={(value) => setResidualPercent(value[0])}
                          />
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency((vehiclePrice * residualPercent) / 100)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lease-term">Lease Term</Label>
                          <Select value={String(leaseTerm)} onValueChange={(value) => setLeaseTerm(Number(value))}>
                            <SelectTrigger id="lease-term">
                              <SelectValue placeholder="Select lease term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="24">24 Months</SelectItem>
                              <SelectItem value="36">36 Months</SelectItem>
                              <SelectItem value="39">39 Months</SelectItem>
                              <SelectItem value="48">48 Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="money-factor">Money Factor</Label>
                            <span className="text-sm text-muted-foreground">
                              {(moneyFactor * 2400).toFixed(2)}% APR
                            </span>
                          </div>
                          <Slider
                            id="money-factor"
                            min={0.0008}
                            max={0.005}
                            step={0.0001}
                            value={[moneyFactor]}
                            onValueChange={(value) => setMoneyFactor(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="down-payment">Down Payment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="down-payment"
                              type="number"
                              className="pl-9"
                              value={downPayment}
                              onChange={(e) => setDownPayment(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mileage-allowance">Annual Mileage Allowance</Label>
                          <Select 
                            value={String(mileageAllowance)} 
                            onValueChange={(value) => setMileageAllowance(Number(value))}
                          >
                            <SelectTrigger id="mileage-allowance">
                              <SelectValue placeholder="Select mileage allowance" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10000">10,000 miles/year</SelectItem>
                              <SelectItem value="12000">12,000 miles/year</SelectItem>
                              <SelectItem value="15000">15,000 miles/year</SelectItem>
                              <SelectItem value="18000">18,000 miles/year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Taxes & Fees */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Taxes & Fees</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="sales-tax">Sales Tax Rate</Label>
                            <span className="text-sm text-muted-foreground">{salesTaxRate}%</span>
                          </div>
                          <Slider
                            id="sales-tax"
                            min={0}
                            max={12}
                            step={0.1}
                            value={[salesTaxRate]}
                            onValueChange={(value) => setSalesTaxRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="acquisition-fee">Acquisition Fee</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="acquisition-fee"
                              type="number"
                              className="pl-9"
                              value={acquisitionFee}
                              onChange={(e) => setAcquisitionFee(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="include-acquisition">Include Acquisition Fee in Payment</Label>
                            <Switch
                              id="include-acquisition"
                              checked={includeAcquisitionInPayment}
                              onCheckedChange={setIncludeAcquisitionInPayment}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="disposition-fee">Disposition Fee</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="disposition-fee"
                              type="number"
                              className="pl-9"
                              value={dispositionFee}
                              onChange={(e) => setDispositionFee(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="documentation-fee">Documentation Fee</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="documentation-fee"
                              type="number"
                              className="pl-9"
                              value={documentationFee}
                              onChange={(e) => setDocumentationFee(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="registration-fee">Registration Fee</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="registration-fee"
                              type="number"
                              className="pl-9"
                              value={registrationFee}
                              onChange={(e) => setRegistrationFee(Number(e.target.value))}
                            />
                          </div>
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
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(monthlyPayment)}</p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Payment</TabsTrigger>
                        <TabsTrigger value="comparison">Terms</TabsTrigger>
                        <TabsTrigger value="total">Total Cost</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Monthly Payment Details</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Depreciation</span>
                              <span className="font-medium">{formatCurrency(paymentBreakdown.depreciation)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Finance Charge</span>
                              <span className="font-medium">{formatCurrency(paymentBreakdown.finance)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Sales Tax</span>
                              <span className="font-medium">{formatCurrency(paymentBreakdown.tax)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Monthly Payment</span>
                              <span>{formatCurrency(paymentBreakdown.total)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={barChartData} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Lease Term Comparison</h4>
                          <div className="grid gap-2">
                            {comparisonScenarios.map((scenario) => (
                              <div key={scenario.term} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">{scenario.term} Months</span>
                                <div className="text-right">
                                  <div className="font-medium">{formatCurrency(scenario.payment)}/mo</div>
                                  <div className="text-xs text-muted-foreground">
                                    Total: {formatCurrency(scenario.totalCost)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="total" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={costBreakdownData} options={costBreakdownOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Total Cost Breakdown</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Due at Signing</span>
                              <span className="font-medium">{formatCurrency(totalCost.upfront)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total of Payments</span>
                              <span className="font-medium">{formatCurrency(totalCost.monthly)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">End of Lease</span>
                              <span className="font-medium">{formatCurrency(totalCost.endOfLease)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Lease Cost</span>
                              <span>{formatCurrency(totalCost.total)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Lease Summary */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Lease Summary</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• {formatCurrency(monthlyPayment)} per month for {leaseTerm} months</li>
                              <li>• {formatCurrency(totalCost.upfront)} due at signing</li>
                              <li>• {mileageAllowance.toLocaleString()} miles per year allowance</li>
                              <li>• {formatCurrency((vehiclePrice * residualPercent) / 100)} residual value</li>
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
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Auto Finance Tool</span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Auto Lease Calculator: Find Your Best Car Deal</h2>
                <p className="mt-3 text-muted-foreground text-lg">Understand the true cost of leasing and compare options to make informed decisions</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding Auto Leasing
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p>
                        An <strong>Auto Lease Calculator</strong> is a specialized tool designed to help you understand the financial implications of leasing a vehicle rather than buying one outright. Unlike traditional auto loans where you ultimately own the vehicle, leasing is essentially a long-term rental agreement with specific financial parameters.
                      </p>
                      <p className="mt-3">
                        Leasing a vehicle involves paying for its <strong>depreciation</strong> during your lease term, plus fees and interest (called the "money factor"). Since you're only financing a portion of the vehicle's value, monthly payments are typically lower than purchase loans, but understanding the full cost structure is essential.
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Vehicle price, residual value, and capitalized cost</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Money factor (interest equivalent) and term length</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Down payment, fees, and tax considerations</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>Mileage allowance and excess mileage fees</span>
                        </li>
                      </ul>
                      <p>
                        Our lease calculator combines these variables to provide a comprehensive view of your lease costs, allowing you to make a well-informed decision when comparing different vehicles or financing options.
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Lease vs. Buy Comparison (2025)</h3>
                        <div className="h-[200px]">
                          <Bar 
                            data={{
                              labels: ['Monthly Payment', '3-Year Total', 'Ownership After'],
                              datasets: [
                                {
                                  label: 'Lease (36-month)',
                                  data: [450, 16200, 0],
                                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                  borderColor: 'rgba(59, 130, 246, 1)',
                                  borderWidth: 1
                                },
                                {
                                  label: '60-Month Loan',
                                  data: [620, 22320, 18500],
                                  backgroundColor: 'rgba(16, 185, 129, 0.8)',
                                  borderColor: 'rgba(16, 185, 129, 1)',
                                  borderWidth: 1
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: { callback: (value) => '$' + value.toLocaleString() }
                                }
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Based on $35,000 vehicle with average depreciation and interest rates</p>
                      </div>
                      
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          <strong>Did You Know?</strong> Approximately 30% of new vehicles are leased rather than purchased. Leasing is particularly popular for luxury vehicles, where over 50% of new cars are acquired through lease agreements.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lease Fundamentals Section */}
              <div className="mb-10" id="lease-fundamentals">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  Key Lease Calculation Factors
                </h2>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="lease-structure" className="font-bold text-xl mb-4">Understanding Lease Structure</h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-4">
                        Auto leases are structured around the concept of vehicle depreciation. When you lease, you're essentially paying for the vehicle's <strong>decrease in value</strong> during your lease term, plus interest and fees.
                      </p>
                      
                      <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                        <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">The Core Lease Formula:</p>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">1</span>
                            <div>
                              <p className="font-medium text-blue-800 dark:text-blue-300"><strong>Capitalized Cost</strong></p>
                              <p className="text-blue-700 dark:text-blue-400">
                                The negotiated price of the vehicle plus any add-ons and fees
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">2</span>
                            <div>
                              <p className="font-medium text-blue-800 dark:text-blue-300"><strong>Residual Value</strong></p>
                              <p className="text-blue-700 dark:text-blue-400">
                                The projected value of the vehicle at lease end (set by the leasing company)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">3</span>
                            <div>
                              <p className="font-medium text-blue-800 dark:text-blue-300"><strong>Depreciation Amount</strong></p>
                              <p className="text-blue-700 dark:text-blue-400">
                                Capitalized Cost − Residual Value
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">4</span>
                            <div>
                              <p className="font-medium text-blue-800 dark:text-blue-300"><strong>Money Factor</strong></p>
                              <p className="text-blue-700 dark:text-blue-400">
                                The interest rate on the lease (typically expressed as a small decimal)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <h4 className="font-medium mb-3">Lease Payment Components</h4>
                        <div className="h-[180px]">
                          <Pie
                            data={{
                              labels: ['Depreciation', 'Interest/Rent Charge', 'Taxes', 'Fees'],
                              datasets: [{
                                data: [70, 20, 7, 3],
                                backgroundColor: [
                                  'rgba(14, 165, 233, 0.7)',
                                  'rgba(99, 102, 241, 0.7)',
                                  'rgba(139, 92, 246, 0.7)',
                                  'rgba(236, 72, 153, 0.7)'
                                ],
                                borderColor: 'white',
                                borderWidth: 2
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { 
                                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } },
                                datalabels: {
                                  formatter: (value) => {
                                    return value + '%';
                                  },
                                  color: 'white',
                                  font: {
                                    weight: 'bold'
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">Approximate breakdown of typical lease payment components</p>
                      </div>
                      
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                          <p className="text-sm text-green-700 dark:text-green-400">
                            <strong>Money Factor Conversion:</strong> To convert a money factor to an equivalent APR (interest rate), multiply it by 2400. For example, a money factor of 0.00125 equals an interest rate of approximately 3% (0.00125 × 2400 = 3%).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 id="residual-value" className="font-bold text-xl mt-8 mb-4">Residual Value: The Lease's Foundation</h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-3">
                        The <strong>residual value</strong> is perhaps the most important number in your lease calculation. It represents the projected value of the vehicle at the end of the lease term and is typically expressed as a percentage of the original MSRP (Manufacturer's Suggested Retail Price).
                      </p>
                      
                      <div className="space-y-4 mt-4">
                        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300">Factors Affecting Residual Value:</h4>
                          
                          <ul className="mt-3 space-y-3">
                            <li className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">Lease Term Length</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                  Longer lease terms result in lower residual values due to increased depreciation
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">Vehicle Make and Model</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                  Some brands and models maintain value better than others
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Wallet className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">Mileage Allowance</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                  Higher mileage allowances decrease residual values
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="h-[220px]">
                        <Line
                          data={{
                            labels: ['New', '1 Year', '2 Years', '3 Years', '4 Years', '5 Years'],
                            datasets: [
                              {
                                label: 'Premium Brand (higher residual)',
                                data: [100, 85, 75, 67, 60, 54],
                                borderColor: 'rgba(59, 130, 246, 0.8)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                tension: 0.4
                              },
                              {
                                label: 'Average Vehicle',
                                data: [100, 80, 68, 58, 50, 43],
                                borderColor: 'rgba(16, 185, 129, 0.8)',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                tension: 0.4
                              },
                              {
                                label: 'Rapid Depreciation Model',
                                data: [100, 70, 58, 49, 41, 35],
                                borderColor: 'rgba(236, 72, 153, 0.8)',
                                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                                tension: 0.4
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              title: {
                                display: true,
                                text: 'Vehicle Value Retention (% of MSRP)'
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: false,
                                min: 30,
                                max: 100,
                                ticks: { callback: (value) => value + '%' }
                              }
                            }
                          }}
                        />
                      </div>
                      
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <p className="text-sm text-amber-700 dark:text-amber-400">
                            <strong>Higher Residuals = Lower Payments:</strong> A higher residual value percentage means the vehicle is expected to retain more of its value. This reduces the depreciation amount you pay during the lease, resulting in lower monthly payments.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      <strong>Capitalized Cost Reduction:</strong> Any down payment, trade-in credit, or rebates directly reduce your capitalized cost (the amount being financed). While this lowers monthly payments, most financial experts caution against large down payments on leases since you don't build equity and the money can't be recovered if the vehicle is totaled or stolen early in the lease term.
                    </p>
                  </div>
                </div>
              </div>

              {/* Using the Calculator Section */}
              <div className="mb-10" id="calculator-guide">
                <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <span className="text-2xl">Using the Auto Lease Calculator</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      How to analyze and compare lease offers to find the best deal
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 id="calculator-inputs" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Required Calculator Inputs
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="font-medium text-green-800 dark:text-green-300">Vehicle & Lease Details</h4>
                            <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5" />
                                <span><strong>Vehicle MSRP:</strong> Manufacturer's suggested retail price</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5" />
                                <span><strong>Negotiated selling price:</strong> The agreed-upon price before incentives</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Percent className="h-4 w-4 mt-0.5" />
                                <span><strong>Residual value percentage:</strong> Expected value at lease end (% of MSRP)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 mt-0.5" />
                                <span><strong>Lease term:</strong> Duration in months (typically 24, 36, or 39)</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="font-medium text-green-800 dark:text-green-300">Financial Parameters</h4>
                            <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                              <li className="flex items-start gap-2">
                                <Percent className="h-4 w-4 mt-0.5" />
                                <span><strong>Money factor:</strong> Interest rate equivalent (or APR if known)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5" />
                                <span><strong>Down payment/cap cost reduction:</strong> Upfront payment amount</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5" />
                                <span><strong>Fees:</strong> Acquisition fee, documentation fee, etc.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Percent className="h-4 w-4 mt-0.5" />
                                <span><strong>Sales tax rate:</strong> Local tax percentage on lease payments</span>
                              </li>
                            </ul>
                          </div>

                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="font-medium text-green-800 dark:text-green-300">Mileage Information</h4>
                            <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                              <li className="flex items-start gap-2">
                                <Clock className="h-4 w-4 mt-0.5" />
                                <span><strong>Annual mileage allowance:</strong> Miles permitted per year</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5" />
                                <span><strong>Excess mileage fee:</strong> Cost per mile over the allowance</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 id="calculator-results" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Understanding Your Results
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300">Key Calculation Outputs</h4>
                            
                            <div className="mt-4 space-y-3">
                              <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">Monthly Lease Payment</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    Your recurring payment amount including taxes
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">Total Lease Cost</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    All payments and fees over the entire lease term
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">Effective Cost Per Mile</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    Total cost divided by allowed mileage (excluding excess miles)
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">Purchase Option at Lease End</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    The amount you'll need to pay to keep the vehicle after the lease
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <p className="text-sm text-blue-700 dark:text-blue-400">
                                <strong>Pro Tip:</strong> Use the "Total Lease Cost" figure when comparing different lease offers, not just the monthly payment. This gives you the true cost of the lease over its entire term, including upfront payments and fees that aren't reflected in the monthly payment.
                              </p>
                            </div>
                          </div>

                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <h4 className="font-medium text-purple-800 dark:text-purple-300">Cost Analysis Visualizations</h4>
                            <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                              The calculator provides helpful visualizations to understand:
                            </p>
                            <ul className="mt-3 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                              <li className="flex items-start gap-2">
                                <PieChart className="h-4 w-4 mt-0.5" /> {/* Replaced Chart with PieChart */}
                                <span><strong>Payment breakdown</strong> showing depreciation vs. interest components</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <BarChart3 className="h-4 w-4 mt-0.5" />
                                <span><strong>Comparative analysis</strong> with buying options over the same period</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 mt-0.5" />
                                <span><strong>Total cost visualization</strong> including all components of the lease</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-8" />
                    
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      Example Lease Scenarios
                    </h3>
                    
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="border-orange-200 dark:border-orange-800">
                        <CardHeader className="bg-orange-50 dark:bg-orange-900/30 py-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-orange-600" />
                            Economy Sedan: 36 Months
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">MSRP:</span>
                              <span className="font-medium">$25,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Negotiated price:</span>
                              <span className="font-medium">$23,500</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Residual value:</span>
                              <span className="font-medium">60% ($15,000)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Money factor:</span>
                              <span className="font-medium">0.00125 (3%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Mileage allowance:</span>
                              <span className="font-medium">12,000/year</span>
                            </div>
                            <div className="flex justify-between bg-orange-50 dark:bg-orange-900/20 p-1 rounded">
                              <span className="text-sm font-medium">Monthly payment:</span>
                              <span className="font-bold">$278</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total lease cost:</span>
                              <span className="font-medium">$12,008</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-blue-600" />
                            SUV: 36 Months
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">MSRP:</span>
                              <span className="font-medium">$35,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Negotiated price:</span>
                              <span className="font-medium">$32,900</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Residual value:</span>
                              <span className="font-medium">55% ($19,250)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Money factor:</span>
                              <span className="font-medium">0.00138 (3.3%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Mileage allowance:</span>
                              <span className="font-medium">10,000/year</span>
                            </div>
                            <div className="flex justify-between bg-blue-50 dark:bg-blue-900/20 p-1 rounded">
                              <span className="text-sm font-medium">Monthly payment:</span>
                              <span className="font-bold">$415</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total lease cost:</span>
                              <span className="font-medium">$16,890</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-green-600" />
                            Luxury Sedan: 24 Months
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">MSRP:</span>
                              <span className="font-medium">$50,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Negotiated price:</span>
                              <span className="font-medium">$47,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Residual value:</span>
                              <span className="font-medium">65% ($32,500)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Money factor:</span>
                              <span className="font-medium">0.00096 (2.3%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Mileage allowance:</span>
                              <span className="font-medium">15,000/year</span>
                            </div>
                            <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-1 rounded">
                              <span className="text-sm font-medium">Monthly payment:</span>
                              <span className="font-bold">$629</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total lease cost:</span>
                              <span className="font-medium">$17,096</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 dark:text-amber-300">Key Observations from Examples</p>
                          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                            Notice how luxury vehicles often have higher residual values as a percentage of MSRP, which helps keep their lease payments relatively affordable compared to their purchase price. Also note that shorter lease terms generally have higher residual values, but this doesn't always translate to lower monthly payments due to the depreciation being spread over fewer months.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Strategic Considerations Section */}
              <div className="mb-10" id="strategy-section">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Wallet className="h-6 w-6 text-blue-600" />
                  Strategic Lease Considerations
                </h2>
                
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-bold mb-4">When Leasing Makes Sense</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <Check className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-800 dark:text-blue-300">You Want Newer Vehicles</h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                If you enjoy driving new cars with the latest technology and safety features every 2-3 years, leasing can be more economical than repeatedly buying and selling.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <Check className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-800 dark:text-blue-300">Business Usage</h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                If you use the vehicle for business, lease payments may be fully tax-deductible (consult your tax professional), compared to limited depreciation deductions when purchasing.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <Check className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-800 dark:text-blue-300">Predictable Costs</h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                Leases typically cover most of the warranty period, meaning less worry about unexpected repair costs. You'll also avoid the uncertainty of resale value.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold mb-4">When Buying Might Be Better</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                              <AlertCircle className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-800 dark:text-purple-300">High Mileage Drivers</h4>
                              <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                                If you drive more than 15,000 miles annually, buying typically makes more economic sense than paying for excess mileage on a lease.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                              <AlertCircle className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-800 dark:text-purple-300">Vehicle Customization</h4>
                              <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                                If you like to modify your vehicles or tend to be hard on their interiors, purchasing avoids wear-and-tear charges that can be costly at lease end.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                              <AlertCircle className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-800 dark:text-purple-300">Long-Term Ownership</h4>
                              <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                                If you typically keep vehicles for more than 5 years, buying becomes more economical as you'll have years without car payments after the loan is paid off.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          <strong>Negotiation Tip:</strong> When leasing, focus on negotiating the selling price (capitalized cost) just as you would when buying. A lower selling price directly translates to lower lease payments. Don't be distracted by offers focused only on monthly payment amounts without revealing the underlying price and terms.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h3 id="lease-pitfalls" className="text-xl font-bold mb-4">Common Lease Pitfalls to Avoid</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-red-200 dark:border-red-900">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        Hidden Costs and Fees
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                        <p className="text-sm"><strong>Acquisition Fee:</strong> Can range from $395-$995, often buried in contract details</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                        <p className="text-sm"><strong>Disposition Fee:</strong> $300-$400 charged at lease end even if you purchase the vehicle</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                        <p className="text-sm"><strong>Documentation Fee:</strong> Varies by dealer, often negotiable</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                        <p className="text-sm"><strong>Excess Wear-and-Tear:</strong> Subjective charges that can add up quickly at lease end</p>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Always request a complete breakdown of all fees before signing a lease agreement
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-amber-200 dark:border-amber-900">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        Mileage and Early Termination
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-1" />
                        <p className="text-sm"><strong>Mileage Penalties:</strong> Typically $0.15-$0.30 per excess mile, which can quickly add thousands</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-1" />
                        <p className="text-sm"><strong>Early Termination:</strong> Can cost thousands in penalties, often requiring payment of all remaining lease payments</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-1" />
                        <p className="text-sm"><strong>Gap Insurance:</strong> Essential protection if leased vehicle is totaled (often included but verify)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-1" />
                        <p className="text-sm"><strong>Lease Transfer:</strong> Research if your lease allows transfers if your needs change</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      <strong>Money Factor Transparency:</strong> Dealers often quote money factors in decimal format (like 0.00125) which obscures the effective interest rate. Always convert this to an APR by multiplying by 2400 (0.00125 × 2400 = 3%) to ensure you're getting a competitive rate. Top-tier lessees with excellent credit can often qualify for money factors equivalent to 1-3% APR.
                    </p>
                  </div>
                </div>
              </div>

              {/* Conclusion Section */}
              <div id="conclusion">
                <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
                    <CardTitle id="summary" className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                      Making an Informed Leasing Decision
                    </CardTitle>
                    <CardDescription>
                      Balancing monthly affordability with total cost analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      The <strong>Auto Lease Calculator</strong> empowers you to look beyond advertised monthly payments and understand the complete financial picture of your lease agreement. By analyzing all components of lease costs—from capitalized cost and residual value to money factor and fees—you can make truly informed decisions about whether leasing makes sense for your situation.
                    </p>
                    
                    <p className="mt-4" id="key-takeaways">
                      Remember these key principles when considering a vehicle lease:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Financial Considerations</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Negotiate the capitalized cost, not just the monthly payment</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Understand the money factor and convert it to an APR equivalent</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Calculate your total cost of leasing, including all fees</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Lifestyle Alignment</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Choose mileage allowance that realistically fits your driving habits</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Consider lease terms that match how long you typically keep vehicles</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Evaluate lease vs. buy based on your long-term financial goals</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to explore your auto leasing options?</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use our <strong>Auto Lease Calculator</strong> above to analyze different leasing scenarios. For more car financing tools, explore our related calculators:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/auto-loan">
                                <Car className="h-4 w-4 mr-1" />
                                Auto Loan Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/cash-back-vs-apr">
                                <Percent className="h-4 w-4 mr-1" />
                                Cash Back vs. Low APR
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/affordability">
                                <Wallet className="h-4 w-4 mr-1" />
                                Auto Affordability
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
                  <CardTitle className="text-lg">Auto Loan Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compare buying versus leasing by calculating auto loan payments and total costs.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/auto-loan">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Cash Back vs. Low Interest</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compare dealer incentives to find the best financing option for your vehicle purchase.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/cash-back-interest">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate monthly payments for any type of loan with different terms and rates.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/payment">Try Calculator</Link>
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