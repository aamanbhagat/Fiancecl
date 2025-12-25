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
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Car, Tag, Clock, Wallet, Check, AlertTriangle, Percent, Calendar, TrendingDown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import LeaseSchema from './schema';
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

export default function LeaseCalculator() {
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
    pdf.save('lease-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <LeaseSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Lease <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Leasing Guide</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Understanding Lease Calculations</h2>
        <p className="mt-3 text-muted-foreground text-lg">Make informed decisions about vehicle and equipment leasing</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Lease Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                A <strong>Lease Calculator</strong> is a valuable financial tool that helps you understand the true cost of leasing vehicles, equipment, or property. Unlike purchasing, where you eventually own the asset, leasing involves paying for the use of an asset for a specific period, with different financial considerations.
              </p>
              <p className="mt-3">
                Lease calculators provide critical insights that help you:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Understand monthly payment obligations</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Compare leasing vs. buying options effectively</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Analyze total lease costs over the contract term</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Identify potential fees and end-of-lease obligations</span>
                </li>
              </ul>
              <p>
                Whether you're considering leasing a vehicle, equipment for your business, or commercial property, understanding how lease calculations work empowers you to negotiate better terms and make financially sound decisions.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Sample Lease Cost Structure</h3>
                <div className="h-[200px]">
                  <Pie 
                    data={{
                      labels: ['Depreciation', 'Interest/Rent Charge', 'Taxes & Fees'],
                      datasets: [{
                        data: [9000, 3500, 1500],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(14, 165, 233, 0.8)',
                          'rgba(6, 182, 212, 0.8)'
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
                          formatter: (value) => ((value / 14000) * 100).toFixed(1) + '%'
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">$35,000 vehicle, 36-month lease at 4.5% interest</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> According to industry data, nearly 30% of new vehicles are leased rather than purchased, with even higher rates in luxury vehicle segments.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Payment Clarity</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Understand exact monthly obligations before signing a lease agreement
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <LineChart className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Cost Comparison</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Compare leasing vs. buying to determine the most cost-effective approach
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <PieChart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Term Optimization</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Find the ideal lease term and mileage allocation for your usage patterns
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* How Leases Work Section */}
      <div className="mb-10" id="lease-basics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-blue-600" />
          How Lease Calculations Work
        </h2>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Key Lease Components
            </CardTitle>
            <CardDescription>Understanding these elements is essential for accurate lease calculations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Leases have unique financial components that differ from traditional loans. Understanding these components helps you accurately calculate lease costs and evaluate lease offers effectively.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="mb-2 font-medium text-blue-700 dark:text-blue-400">Core Lease Elements:</p>
                  <ul className="space-y-2 text-blue-600 dark:text-blue-500">
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[130px]">Capitalized Cost:</span>
                      <span>The negotiated price/value of the leased asset</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[130px]">Residual Value:</span>
                      <span>The projected value of the asset at lease end</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[130px]">Money Factor:</span>
                      <span>Interest rate expressed as a decimal (monthly interest rate ÷ 24)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[130px]">Lease Term:</span>
                      <span>Duration of the lease agreement (typically 24-60 months)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[130px]">Mileage Allowance:</span>
                      <span>Annual mileage limit before excess charges apply</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Money Factor vs. Interest Rate:</strong> To convert a money factor to an interest rate, multiply it by 2400. For example, a money factor of 0.00125 equals a 3% interest rate (0.00125 × 2400 = 3%).
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-3">Basic Lease Payment Formula</h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
                    <p className="whitespace-normal break-words">
                      Monthly Payment = (Capitalized Cost - Residual Value) ÷ Term + (Capitalized Cost + Residual Value) × Money Factor
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Where:</p>
                      <p>Capitalized Cost = Negotiated vehicle price + fees - cap cost reductions</p>
                      <p>Residual Value = Estimated end-of-lease value</p>
                      <p>Term = Number of months in lease</p>
                      <p>Money Factor = Interest rate ÷ 2400</p>
                    </div>
                  </div>
                </div>
                
                <Card className="overflow-hidden">
                  <CardHeader className="py-3 bg-blue-50 dark:bg-blue-900/30">
                    <CardTitle className="text-sm text-blue-700 dark:text-blue-300">Lease Payment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[180px]">
                      <Bar 
                        data={{
                          labels: ['Depreciation', 'Rent Charge', 'Taxes & Fees'],
                          datasets: [
                            {
                              label: 'Payment Components',
                              data: [250, 97, 42],
                              backgroundColor: [
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(14, 165, 233, 0.8)',
                                'rgba(6, 182, 212, 0.8)'
                              ],
                              borderColor: [
                                'rgba(59, 130, 246, 1)',
                                'rgba(14, 165, 233, 1)',
                                'rgba(6, 182, 212, 1)'
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
                              title: { display: true, text: 'Monthly Amount ($)' }
                            }
                          },
                          plugins: {
                            legend: { display: false }
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      Sample $389 monthly payment breakdown for a $35,000 vehicle
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Depreciation and Residual Value
            </CardTitle>
            <CardDescription>The core financial components of lease calculations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  <strong>Depreciation</strong> is the primary component of your lease payment, representing the value the asset loses during your lease term. It's calculated as the difference between the capitalized cost and the residual value, spread over the lease term.
                </p>
                
                <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Residual Value Factors</h4>
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Asset type and manufacturer (some retain value better)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Lease term length (longer terms = lower residual values)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Mileage allowance (higher mileage = lower residual)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Residual Value Impact:</strong> A higher residual value means lower monthly payments but also means the asset retains more value that you don't benefit from as a lessee. This is why high-residual vehicles are popular to lease but may be better financial deals to purchase long-term.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-[240px]">
                  <h4 className="text-center text-sm font-medium mb-2">Vehicle Value During Lease Term</h4>
                  <Line 
                    data={{
                      labels: ['Start', '12 Months', '24 Months', '36 Months'],
                      datasets: [{
                        label: 'Vehicle Value',
                        data: [35000, 28000, 24500, 21000],
                        borderColor: 'rgba(16, 185, 129, 0.8)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: false,
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
                        }
                      },
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-2 text-sm">Depreciation Calculation Example</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">Capitalized Cost</p>
                      <p className="font-medium">$35,000</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">Residual Value (60%)</p>
                      <p className="font-medium">$21,000</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">Total Depreciation</p>
                      <p className="font-medium">$14,000</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">Monthly (36 months)</p>
                      <p className="font-medium">$389/month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Decision Factors Section */}
      <div className="mb-10" id="decision-factors">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl">Critical Lease Decision Factors</span>
              </div>
            </CardTitle>
            <CardDescription>
              Key considerations when evaluating lease options
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="lease-term" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Choosing the Optimal Lease Term
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    The length of your lease term significantly affects your monthly payments, total cost, and flexibility. Shorter leases typically come with higher monthly payments but allow you to upgrade or change assets more frequently.
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Term Length Considerations:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Shorter Term Benefits</h5>
                        <ul className="space-y-1 text-blue-600 dark:text-blue-500">
                          <li>• Stay current with technology</li>
                          <li>• Less risk of maintenance issues</li>
                          <li>• More frequent upgrade options</li>
                          <li>• Avoid end-of-warranty periods</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <h5 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Longer Term Benefits</h5>
                        <ul className="space-y-1 text-amber-600 dark:text-amber-500">
                          <li>• Lower monthly payments</li>
                          <li>• Lower acquisition costs</li>
                          <li>• Less frequent transition hassle</li>
                          <li>• More time to decide next steps</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-[260px]">
                  <h4 className="text-center text-sm font-medium mb-2">Term Length Comparison ($35,000 Asset)</h4>
                  <Bar 
                    data={{
                      labels: ['24-Month Term', '36-Month Term', '48-Month Term', '60-Month Term'],
                      datasets: [
                        {
                          label: 'Monthly Payment',
                          data: [491, 389, 316, 270],
                          backgroundColor: 'rgba(59, 130, 246, 0.7)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 1,
                          yAxisID: 'y'
                        },
                        {
                          label: 'Total Lease Cost',
                          data: [11784, 14004, 15168, 16200],
                          backgroundColor: 'rgba(14, 165, 233, 0.7)',
                          borderColor: 'rgba(14, 165, 233, 1)',
                          borderWidth: 1,
                          yAxisID: 'y1'
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
                          title: { display: true, text: 'Monthly Payment ($)' },
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          grid: { drawOnChartArea: false },
                          title: { display: true, text: 'Total Lease Cost ($)' },
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
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
                <h3 id="mileage-allowance" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Mileage Allowance Impact
                </h3>
                <p>
                  Mileage allowance is a critical factor in lease agreements that directly affects your monthly payment and potential end-of-lease charges. Accurately estimating your driving needs is essential.
                </p>
                
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-700 dark:text-green-400">Mileage Impact on Lease Cost</h4>
                    <table className="w-full mt-2 text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="pb-1">Annual Allowance</th>
                          <th className="pb-1">Monthly Impact</th>
                          <th className="pb-1">Excess Charge</th>
                        </tr>
                      </thead>
                      <tbody className="text-green-600 dark:text-green-500">
                        <tr>
                          <td>10,000 miles</td>
                          <td>Baseline</td>
                          <td>$0.15-0.25/mile</td>
                        </tr>
                        <tr>
                          <td>12,000 miles</td>
                          <td>+$15-25/month</td>
                          <td>$0.15-0.25/mile</td>
                        </tr>
                        <tr>
                          <td>15,000 miles</td>
                          <td>+$30-50/month</td>
                          <td>$0.15-0.25/mile</td>
                        </tr>
                        <tr>
                          <td>20,000 miles</td>
                          <td>+$60-90/month</td>
                          <td>$0.15-0.25/mile</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-700 dark:text-green-400">Mileage Calculation Tips</h4>
                    <ul className="mt-2 space-y-1 text-sm text-green-600 dark:text-green-500">
                      <li>• Calculate your daily commute and multiply by working days</li>
                      <li>• Add regular trips (family visits, recurring activities)</li>
                      <li>• Consider vacation travel and special events</li>
                      <li>• Add a 10-15% buffer for unexpected travel</li>
                      <li>• Review past vehicle mileage for realistic estimates</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Excess Mileage Warning:</strong> Driving 5,000 miles over your limit on a 36-month lease could result in $750-$1,250 in excess mileage charges at lease-end. If you consistently exceed your mileage, consider purchasing additional miles upfront (typically cheaper) or negotiating a higher mileage allowance.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="money-factor" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Money Factor and Interest Costs
                </h3>
                <p>
                  The money factor (lease interest rate) has a significant impact on your monthly payment. While not as visible as the capitalized cost or residual value, it's equally important to negotiate.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Money Factor to Interest Rate</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>To convert money factor to APR, multiply by 2400:</p>
                      <table className="w-full mt-1">
                        <tbody>
                          <tr>
                            <td className="font-medium">Money Factor: 0.00125</td>
                            <td className="text-right">3.0% APR</td>
                          </tr>
                          <tr>
                            <td className="font-medium">Money Factor: 0.00167</td>
                            <td className="text-right">4.0% APR</td>
                          </tr>
                          <tr>
                            <td className="font-medium">Money Factor: 0.00208</td>
                            <td className="text-right">5.0% APR</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-medium text-purple-700 dark:text-purple-400">Money Factor Impact</h4>
                    <p className="mt-1 text-sm">
                      The money factor affects the "rent charge" portion of your lease payment. Lower money factors mean lower monthly payments.
                    </p>
                    <div className="h-[170px] mt-3">
                      <Bar 
                        data={{
                          labels: ['0.00125 (3%)', '0.00167 (4%)', '0.00208 (5%)', '0.00250 (6%)'],
                          datasets: [{
                            label: 'Monthly Interest Cost',
                            data: [70, 93, 116, 140],
                            backgroundColor: [
                              'rgba(124, 58, 237, 0.7)',
                              'rgba(124, 58, 237, 0.75)',
                              'rgba(124, 58, 237, 0.8)',
                              'rgba(124, 58, 237, 0.85)'
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
                              title: { display: true, text: 'Monthly Interest ($)' }
                            }
                          },
                          plugins: {
                            legend: { display: false }
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      Monthly rent charge on $35,000 vehicle with 60% residual (36-month lease)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Lease Types Section */}
      <div className="mb-10" id="lease-types">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-blue-600" />
          Common Lease Types and Calculations
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Major Lease Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Closed-End Leases</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    The most common consumer lease type where you return the asset at the end of the term. The lessor bears the residual value risk, but you pay for excess wear or mileage.
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <p><strong>Calculation Focus:</strong> Monthly payment, mileage allowance, wear & tear provisions</p>
                    <p><strong>Key Benefit:</strong> Predictable costs and limited end-of-lease obligations</p>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Open-End Leases</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Common in commercial contexts, where the lessee bears the residual value risk. If the asset is worth less than the predetermined residual value at lease-end, you pay the difference.
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <p><strong>Calculation Focus:</strong> Total cost comparison, residual value risk, potential end-of-term liability</p>
                    <p><strong>Key Benefit:</strong> Often more flexible terms and potentially lower payments</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">TRAC Leases</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Terminal Rental Adjustment Clause leases are specialized commercial vehicle leases with adjustable end-of-term values based on actual resale.
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <p><strong>Calculation Focus:</strong> Terminal value adjustments, potential refunds or additional payments</p>
                    <p><strong>Key Benefit:</strong> Tax advantages for businesses and potential upside if vehicle retains value</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Note:</strong> For personal use, closed-end leases typically offer the most predictability and lowest risk, though often at slightly higher monthly payments compared to open-end leases.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-600" />
                Specialized Lease Calculators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Residual Value Calculator
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Helps determine the projected value of an asset at the end of the lease term based on depreciation rates and term length. Critical for comparing lease offers and buyout options.
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium flex items-center gap-2">
                    <Percent className="h-4 w-4 text-green-600" />
                    Lease vs. Buy Calculator
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Provides comprehensive cost comparison between leasing and buying options, factoring in opportunity costs, tax implications, and long-term ownership benefits.
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    Lease Buyout Calculator
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Evaluates whether purchasing your leased asset at the end of the term makes financial sense compared to market value and your continued needs.
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    Early Termination Calculator
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Estimates potential costs and penalties associated with ending a lease before the contracted term expires, helping you make informed decisions about early exit options.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="text-blue-800 dark:text-blue-300">Lease Analysis Strategy</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="font-medium mb-2">Step 1: Calculate Total Cost</h4>
                  <p className="text-sm text-muted-foreground">
                    Beyond monthly payments, calculate acquisition fees, down payments, disposition fees, and potential excess mileage charges for a complete cost picture.
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="font-medium mb-2">Step 2: Compare Lease vs. Buy</h4>
                  <p className="text-sm text-muted-foreground">
                    Use calculators to compare the total cost of leasing against buying and selling after the same period, considering the opportunity cost of your money.
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="font-medium mb-2">Step 3: Assess Long-Term Plans</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider how long you typically keep assets and whether your usage patterns (mileage, wear and tear) align better with leasing or ownership.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Lease Calculator Best Practices</p>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                      Always calculate your own lease payments to verify dealer figures, obtain and compare money factors from multiple sources, use scenarios that reflect your actual usage patterns, and remember that the lowest monthly payment doesn't always represent the best financial decision.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden Costs Section */}
      <div className="mb-10" id="hidden-costs">
        <Card className="overflow-hidden border-green-200 dark:border-green-900">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Hidden Costs and Fees</span>
              </div>
            </CardTitle>
            <CardDescription>
              Understanding the full cost of leasing beyond the monthly payment
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">Upfront Costs</h3>
                <p className="mb-4">
                  Many lease agreements include significant costs due at signing that should be factored into your total lease cost calculation.
                </p>
                
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium mb-3">Common Upfront Lease Costs</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Acquisition Fee</span>
                      <span className="text-green-600">$395 - $995</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Security Deposit</span>
                      <span className="text-green-600">$0 - One monthly payment</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">First Month's Payment</span>
                      <span className="text-green-600">One monthly payment</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Down Payment/Cap Reduction</span>
                      <span className="text-green-600">Varies (optional)</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Documentation Fee</span>
                      <span className="text-green-600">$75 - $400</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Registration/Title Fees</span>
                      <span className="text-green-600">Varies by location</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Down Payment Warning:</strong> While putting money down reduces your monthly payment, this amount is at risk if the vehicle is totaled or stolen early in the lease. GAP insurance helps protect this investment.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">End-of-Lease Costs</h3>
                <p className="mb-4">
                  Lease-end costs can significantly impact the total cost of leasing and should be anticipated in your financial planning.
                </p>
                
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium mb-3">Potential Lease-End Charges</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Disposition Fee</span>
                      <span className="text-green-600">$350 - $500</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Excess Mileage Charge</span>
                      <span className="text-green-600">$0.15 - $0.25 per mile</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Excess Wear and Tear</span>
                      <span className="text-green-600">Varies by damage</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Early Termination Fee</span>
                      <span className="text-green-600">Remaining payments + penalty</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Lease Extension Costs</span>
                      <span className="text-green-600">Monthly payment + potential fees</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Minimizing End-of-Lease Costs</h4>
                  <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                    <li>• Schedule a pre-inspection 60-90 days before lease end</li>
                    <li>• Repair minor damage through third parties (often cheaper)</li>
                    <li>• Consider purchasing excess miles in advance if needed</li>
                    <li>• Maintain service records to prove proper maintenance</li>
                    <li>• Compare buyout price to market value before returning</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Card className="bg-white dark:bg-gray-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Lease Cost Example</CardTitle>
                <CardDescription>36-month lease on $35,000 vehicle with $389 monthly payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left pb-2">Cost Category</th>
                        <th className="text-right pb-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b dark:border-gray-700">
                        <td className="py-2">Monthly Payments (36 × $389)</td>
                        <td className="text-right">$14,004</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700">
                        <td className="py-2">Down Payment</td>
                        <td className="text-right">$1,500</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700">
                        <td className="py-2">Acquisition Fee</td>
                        <td className="text-right">$695</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700">
                        <td className="py-2">Documentation Fee</td>
                        <td className="text-right">$150</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700">
                        <td className="py-2">Registration/Taxes</td>
                        <td className="text-right">$850</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700">
                        <td className="py-2">Disposition Fee</td>
                        <td className="text-right">$395</td>
                      </tr>
                      <tr className="border-b dark:border-gray-700">
                        <td className="py-2">Estimated Excess Mileage (2,000 miles × $0.20)</td>
                        <td className="text-right">$400</td>
                      </tr>
                      <tr className="font-medium text-green-700 dark:text-green-400 border-b dark:border-gray-700">
                        <td className="py-2">Total Lease Cost</td>
                        <td className="text-right">$17,994</td>
                      </tr>
                      <tr className="text-muted-foreground">
                        <td className="py-2">Cost Per Mile (at 36,000 miles)</td>
                        <td className="text-right">$0.50/mile</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Making Informed Leasing Decisions
            </CardTitle>
            <CardDescription>
              Putting your lease calculations to work
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Lease calculators</strong> empower you to make informed decisions by revealing the true cost of leasing arrangements. By understanding the fundamental components of lease calculations—including capitalized cost, residual value, money factor, and mileage allowances—you can evaluate lease offers more effectively and negotiate better terms.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Remember these key principles when evaluating lease options:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Financial Discipline</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Calculate total lease cost, not just monthly payments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Understand the money factor and convert it to APR</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Accurately estimate your mileage needs before committing</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Strategic Approach</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Compare lease vs. buy scenarios for your specific situation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Negotiate the capitalized cost before discussing monthly payments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Consider residual value when selecting lease term and asset</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to analyze your lease options?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Lease Calculator</strong> above to evaluate different scenarios and find the optimal leasing solution for your needs. For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/auto-loan">
                        <Car className="h-4 w-4 mr-1" />
                        Auto Loan Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/depreciation">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Depreciation Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/budget">
                        <Wallet className="h-4 w-4 mr-1" />
                        Budget Calculator
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