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
  Wallet,
  Percent,
  Calendar,
  Clock,
  Check,
  ArrowRight,
  PiggyBank,
  Search
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import CashBackInterestSchema from './schema';

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

export default function CashBackInterestCalculator() {
  // Vehicle & Purchase Details
  const [vehiclePrice, setVehiclePrice] = useState(30000)
  const [cashRebate, setCashRebate] = useState(2000)
  const [standardAPR, setStandardAPR] = useState(6.9)
  const [reducedAPR, setReducedAPR] = useState(0.9)
  const [loanTerm, setLoanTerm] = useState(60)
  const [downPayment, setDownPayment] = useState(3000)
  const [tradeInValue, setTradeInValue] = useState(0)
  const [includeTradeIn, setIncludeTradeIn] = useState(false)
  
  // Additional Costs
  const [includeTaxes, setIncludeTaxes] = useState(true)
  const [salesTaxRate, setSalesTaxRate] = useState(6)
  const [includeFees, setIncludeFees] = useState(true)
  const [dealerFees, setDealerFees] = useState(500)
  const [titleFees, setTitleFees] = useState(300)
  const [registrationFees, setRegistrationFees] = useState(200)
  
  // Results State
  const [cashBackScenario, setCashBackScenario] = useState({
    monthlyPayment: 0,
    totalInterest: 0,
    totalCost: 0,
    netPrice: 0,
    amortization: [] as { balance: number; principal: number; interest: number }[]
  })
  
  const [lowAPRScenario, setLowAPRScenario] = useState({
    monthlyPayment: 0,
    totalInterest: 0,
    totalCost: 0,
    netPrice: 0,
    amortization: [] as { balance: number; principal: number; interest: number }[]
  })
  
  const [breakEvenMonth, setBreakEvenMonth] = useState(0)
  const [recommendation, setRecommendation] = useState("")

  // Calculate monthly payment and amortization schedule
  const calculateLoanDetails = (principal: number, apr: number, term: number) => {
    const monthlyRate = apr / 100 / 12
    const numberOfPayments = term
    
    // Calculate monthly payment
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    
    // Generate amortization schedule
    const schedule = []
    let balance = principal
    let totalInterest = 0
    
    for (let i = 0; i < numberOfPayments; i++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      balance -= principalPayment
      totalInterest += interestPayment
      
      schedule.push({
        balance: Math.max(0, balance),
        principal: principalPayment,
        interest: interestPayment
      })
    }
    
    return {
      monthlyPayment,
      totalInterest,
      totalCost: principal + totalInterest,
      amortization: schedule
    }
  }

  // Update calculations when inputs change
  useEffect(() => {
    // Calculate additional costs
    const taxAmount = includeTaxes ? (vehiclePrice * salesTaxRate) / 100 : 0
    const totalFees = includeFees ? dealerFees + titleFees + registrationFees : 0
    const tradeInAmount = includeTradeIn ? tradeInValue : 0
    
    // Cash Back Scenario
    const cashBackPrice = vehiclePrice - cashRebate
    const cashBackPrincipal = cashBackPrice + taxAmount + totalFees - downPayment - tradeInAmount
    const cashBackResults = calculateLoanDetails(cashBackPrincipal, standardAPR, loanTerm)
    
    setCashBackScenario({
      ...cashBackResults,
      netPrice: cashBackPrice
    })
    
    // Low APR Scenario
    const lowAPRPrincipal = vehiclePrice + taxAmount + totalFees - downPayment - tradeInAmount
    const lowAPRResults = calculateLoanDetails(lowAPRPrincipal, reducedAPR, loanTerm)
    
    setLowAPRScenario({
      ...lowAPRResults,
      netPrice: vehiclePrice
    })
    
    // Find break-even point
    let breakEven = 0
    const cashBackMonthly = cashBackResults.monthlyPayment
    const lowAPRMonthly = lowAPRResults.monthlyPayment
    const monthlySavings = cashBackMonthly - lowAPRMonthly
    
    if (monthlySavings > 0) {
      breakEven = Math.ceil(cashRebate / monthlySavings)
    }
    setBreakEvenMonth(breakEven)
    
    // Generate recommendation
    const totalSavings = cashBackResults.totalCost - lowAPRResults.totalCost
    setRecommendation(
      totalSavings > 0 
        ? `The low APR option saves you ${formatCurrency(Math.abs(totalSavings))} over the life of the loan.`
        : `Taking the cash rebate saves you ${formatCurrency(Math.abs(totalSavings))} over the life of the loan.`
    )
    
  }, [
    vehiclePrice,
    cashRebate,
    standardAPR,
    reducedAPR,
    loanTerm,
    downPayment,
    tradeInValue,
    includeTradeIn,
    includeTaxes,
    salesTaxRate,
    includeFees,
    dealerFees,
    titleFees,
    registrationFees
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

  // Monthly payment comparison chart
  const paymentComparisonData = {
    labels: ['Monthly Payment', 'Total Interest', 'Total Cost'],
    datasets: [
      {
        label: 'Cash Back',
        data: [
          cashBackScenario.monthlyPayment,
          cashBackScenario.totalInterest,
          cashBackScenario.totalCost
        ],
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Low APR',
        data: [
          lowAPRScenario.monthlyPayment,
          lowAPRScenario.totalInterest,
          lowAPRScenario.totalCost
        ],
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const paymentComparisonOptions: ChartOptions<'bar'> = {
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

  // Cumulative cost comparison chart
  const generateCumulativeCostChart = () => {
    const months = Array.from({ length: loanTerm }, (_, i) => i + 1)
    
    let cashBackCumulative = cashRebate // Start with rebate amount
    let lowAPRCumulative = 0
    
    const cashBackData = months.map((_, i) => {
      cashBackCumulative += cashBackScenario.monthlyPayment
      return cashBackCumulative
    })
    
    const lowAPRData = months.map((_, i) => {
      lowAPRCumulative += lowAPRScenario.monthlyPayment
      return lowAPRCumulative
    })
    
    return {
      labels: months.map(m => `Month ${m}`),
      datasets: [
        {
          label: 'Cash Back Total Cost',
          data: cashBackData,
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Low APR Total Cost',
          data: lowAPRData,
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4
        }
      ]
    }
  }

  const cumulativeCostOptions: ChartOptions<'line'> = {
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
    pdf.save('cash-back-vs-low-apr-analysis.pdf')
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

    pdf.save('cash-back-vs-low-apr-guide.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <CashBackInterestSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Cash Back vs. Low Interest <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Compare dealer incentives to find out whether taking a cash rebate or opting for low APR financing will save you more money.
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
                    <CardTitle>Enter Vehicle & Loan Details</CardTitle>
                    <CardDescription>
                      Provide information about the vehicle purchase and available incentives to compare options.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Vehicle & Purchase Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Vehicle & Purchase Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="vehicle-price">Vehicle Price (MSRP)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="vehicle-price"
                              type="number"
                              className="pl-9"
                              value={vehiclePrice || ''} onChange={(e) => setVehiclePrice(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cash-rebate">Cash Rebate Amount</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="cash-rebate"
                              type="number"
                              className="pl-9"
                              value={cashRebate || ''} onChange={(e) => setCashRebate(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="standard-apr">Standard APR</Label>
                            <span className="text-sm text-muted-foreground">{standardAPR}%</span>
                          </div>
                          <Slider
                            id="standard-apr"
                            min={0}
                            max={15}
                            step={0.1}
                            value={[standardAPR]}
                            onValueChange={(value) => setStandardAPR(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="reduced-apr">Reduced APR</Label>
                            <span className="text-sm text-muted-foreground">{reducedAPR}%</span>
                          </div>
                          <Slider
                            id="reduced-apr"
                            min={0}
                            max={5}
                            step={0.1}
                            value={[reducedAPR]}
                            onValueChange={(value) => setReducedAPR(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loan-term">Loan Term</Label>
                          <Select value={String(loanTerm)} onValueChange={(value) => setLoanTerm(Number(value))}>
                            <SelectTrigger id="loan-term">
                              <SelectValue placeholder="Select loan term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="36">36 Months (3 Years)</SelectItem>
                              <SelectItem value="48">48 Months (4 Years)</SelectItem>
                              <SelectItem value="60">60 Months (5 Years)</SelectItem>
                              <SelectItem value="72">72 Months (6 Years)</SelectItem>
                              <SelectItem value="84">84 Months (7 Years)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="down-payment">Down Payment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="down-payment"
                              type="number"
                              className="pl-9"
                              value={downPayment || ''} onChange={(e) => setDownPayment(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trade-In Details */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Trade-In Details</h3>
                        <Switch
                          checked={includeTradeIn}
                          onCheckedChange={setIncludeTradeIn}
                        />
                      </div>
                      {includeTradeIn && (
                        <div className="space-y-2">
                          <Label htmlFor="trade-in-value">Trade-In Value</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="trade-in-value"
                              type="number"
                              className="pl-9"
                              value={tradeInValue || ''} onChange={(e) => setTradeInValue(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Costs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Costs</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="taxes-toggle">Include Sales Tax</Label>
                            <Switch
                              id="taxes-toggle"
                              checked={includeTaxes}
                              onCheckedChange={setIncludeTaxes}
                            />
                          </div>
                          {includeTaxes && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="sales-tax">Sales Tax Rate</Label>
                                <span className="text-sm text-muted-foreground">{salesTaxRate}%</span>
                              </div>
                              <Slider
                                id="sales-tax"
                                min={0}
                                max={15}
                                step={0.1}
                                value={[salesTaxRate]}
                                onValueChange={(value) => setSalesTaxRate(value[0])}
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="fees-toggle">Include Fees</Label>
                            <Switch
                              id="fees-toggle"
                              checked={includeFees}
                              onCheckedChange={setIncludeFees}
                            />
                          </div>
                          {includeFees && (
                            <div className="space-y-2">
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="dealer-fees"
                                  type="number"
                                  className="pl-9"
                                  placeholder="Dealer Fees"
                                  value={dealerFees || ''} onChange={(e) => setDealerFees(e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </div>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="title-fees"
                                  type="number"
                                  className="pl-9"
                                  placeholder="Title Fees"
                                  value={titleFees || ''} onChange={(e) => setTitleFees(e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </div>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="registration-fees"
                                  type="number"
                                  className="pl-9"
                                  placeholder="Registration Fees"
                                  value={registrationFees || ''} onChange={(e) => setRegistrationFees(e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </div>
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
                        <p className="text-sm text-muted-foreground">Cash Back Monthly</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(cashBackScenario.monthlyPayment)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Low APR Monthly</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(lowAPRScenario.monthlyPayment)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="comparison" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                        <TabsTrigger value="cumulative">Over Time</TabsTrigger>
                      </TabsList>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={paymentComparisonData} options={paymentComparisonOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Scenario Comparison</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Cash Back Amount</span>
                              <span className="font-medium">{formatCurrency(cashRebate)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Net Price (After Rebate)</span>
                              <span className="font-medium">{formatCurrency(cashBackScenario.netPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Interest (Cash Back)</span>
                              <span className="font-medium">{formatCurrency(cashBackScenario.totalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Interest (Low APR)</span>
                              <span className="font-medium">{formatCurrency(lowAPRScenario.totalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Interest Savings</span>
                              <span>
                                {formatCurrency(Math.abs(cashBackScenario.totalInterest - lowAPRScenario.totalInterest))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="cumulative" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateCumulativeCostChart()} options={cumulativeCostOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Break-Even Analysis</h4>
                          {breakEvenMonth > 0 ? (
                            <p className="text-sm text-muted-foreground">
                              The break-even point occurs at month {breakEvenMonth}. After this point, 
                              the {cashBackScenario.totalCost > lowAPRScenario.totalCost ? 'low APR' : 'cash back'} option 
                              becomes more cost-effective.
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              One option is consistently better throughout the loan term.
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Recommendation */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Recommendation</p>
                            <p className="text-sm text-muted-foreground">{recommendation}</p>
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

        {/* Educational Content */}
        <section className="py-12">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-8">Understanding Cash Back vs. Low APR Options</h2>
            
            <div className="grid gap-8 md:grid-cols-2 mb-12">
              <Card className="bg-muted/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-primary" />
                    <CardTitle>Cash Back Rebates</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Immediate reduction in purchase price</li>
                    <li>• Can be used as part of down payment</li>
                    <li>• Higher interest rate on loan</li>
                    <li>• Good for shorter loan terms</li>
                    <li>• Beneficial if you plan to pay off early</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-primary" />
                    <CardTitle>Low APR Financing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Lower interest rate over loan term</li>
                    <li>• Reduced monthly payments</li>
                    <li>• No upfront price reduction</li>
                    <li>• Better for longer loan terms</li>
                    <li>• Usually requires excellent credit</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Factors to Consider</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Credit Score Impact</h4>
                      <p className="text-sm text-muted-foreground">
                        Low APR financing typically requires a higher credit score. If your credit score isn't excellent,
                        the cash back option might be your only choice.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Loan Term Length</h4>
                      <p className="text-sm text-muted-foreground">
                        Longer loan terms tend to favor low APR financing because interest savings compound over time.
                        Shorter terms might benefit more from cash back.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Down Payment Considerations</h4>
                      <p className="text-sm text-muted-foreground">
                        Cash rebates can be applied to your down payment, potentially helping you avoid PMI or
                        secure better loan terms.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Early Payoff Plans</h4>
                      <p className="text-sm text-muted-foreground">
                        If you plan to pay off the loan early, taking the cash rebate might be more beneficial
                        since you won't realize the full interest savings of the low APR option.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog-section" className="py-12 bg-white dark:bg-black">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex-1 text-center">
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Auto Financing Tool</span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Cash Back vs. Low Interest Calculator</h2>
                <p className="mt-3 text-muted-foreground text-lg">Find the best car financing deal between dealer rebates and low interest offers</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding the Cash Back vs. Low APR Decision
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p>
                        When buying a new vehicle, you're often presented with two enticing but mutually exclusive options: accept a <strong>cash rebate</strong> (cash back) or choose <strong>special low-interest financing</strong>. This common dilemma raises a crucial question: which option will save you more money over the life of your auto loan?
                      </p>
                      <p className="mt-3">
                        The <strong>Cash Back vs. Low Interest Calculator</strong> helps you make this decision by comparing the total cost of both options based on your specific situation. The mathematically optimal choice depends on several factors:
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Vehicle price and rebate amount</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Special APR offer vs. standard interest rate</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Loan term length</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>Down payment amount</span>
                        </li>
                      </ul>
                      <p>
                        What seems like a simple choice can have thousands of dollars of impact on your finances. This calculator performs the complex math so you can make an informed decision tailored to your circumstances.
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Common Dealer Incentives (2025)</h3>
                        <div className="h-[200px]">
                          <Bar 
                            data={{
                              labels: ['Compact', 'Midsize', 'SUV', 'Truck', 'Luxury'],
                              datasets: [
                                {
                                  label: 'Average Cash Rebate',
                                  data: [1500, 2250, 3000, 3500, 4000],
                                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                  borderColor: 'rgba(59, 130, 246, 1)',
                                  borderWidth: 1
                                },
                                {
                                  label: 'APR Offer Savings*',
                                  data: [1200, 2400, 3200, 3800, 5200],
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
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">*Estimated savings from 0% APR vs. standard 6.5% rate on 60-month loan</p>
                      </div>
                      
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          <strong>Did You Know?</strong> Car manufacturers spend over $20 billion annually on incentives. The average new vehicle has about $2,500 in incentives - either as cash back or subsidized financing - but many buyers choose the wrong option, potentially leaving thousands of dollars on the table.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Decision Factors Section */}
              <div className="mb-10" id="decision-factors">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  Key Factors in the Cash Back vs. Low APR Decision
                </h2>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="offer-mechanics" className="font-bold text-xl mb-4">How These Offers Work</h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-3">Cash Back (Rebate) Offers</h4>
                      <p className="mb-4">
                        A cash rebate is a direct reduction in the purchase price of the vehicle. This incentive reduces the amount you finance, which lowers your loan amount and monthly payment.
                      </p>
                      
                      <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                        <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Example Cash Back Scenario:</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Vehicle price:</span>
                            <span>$30,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cash rebate:</span>
                            <span>$3,000</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Amount financed:</span>
                            <span>$27,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Standard APR:</span>
                            <span>6.5%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Term:</span>
                            <span>60 months</span>
                          </div>
                          <div className="border-t border-blue-200 dark:border-blue-800 mt-2 pt-2 font-medium">
                            <div className="flex justify-between">
                              <span>Monthly payment:</span>
                              <span>$528.93</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total cost:</span>
                              <span>$31,735.80</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-3">Low Interest (APR) Offers</h4>
                      <p className="mb-4">
                        A low-interest offer (sometimes as low as 0%) reduces your financing costs over the loan term. While you don't get an upfront price reduction, you pay less interest over time.
                      </p>
                      
                      <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                        <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Example Low APR Scenario:</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Vehicle price:</span>
                            <span>$30,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cash rebate:</span>
                            <span>$0</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Amount financed:</span>
                            <span>$30,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Special APR:</span>
                            <span>0.9%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Term:</span>
                            <span>60 months</span>
                          </div>
                          <div className="border-t border-blue-200 dark:border-blue-800 mt-2 pt-2 font-medium">
                            <div className="flex justify-between">
                              <span>Monthly payment:</span>
                              <span>$509.87</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total cost:</span>
                              <span>$30,592.20</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 id="financial-impact" className="font-bold text-xl mt-8 mb-4">Comparing Financial Impact</h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-3">
                        In our example above, the low-interest option saves $1,143.60 over the loan term compared to taking the cash rebate. However, this outcome varies dramatically based on several factors:
                      </p>
                      
                      <div className="space-y-4 mt-4">
                        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300">Critical Decision Factors:</h4>
                          
                          <ul className="mt-3 space-y-3">
                            <li className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">Loan Term Length</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                  Longer terms typically make low APR offers more valuable as the interest savings accumulate over more months
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Percent className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">Interest Rate Differential</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                  The bigger the gap between the special APR and standard rate, the more valuable the low APR offer becomes
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Wallet className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">Cash Rebate Amount</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                  Larger cash rebates make this option more attractive, especially for shorter loan terms
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="h-[250px]">
                        <Line
                          data={{
                            labels: ['36 mo', '48 mo', '60 mo', '72 mo', '84 mo'],
                            datasets: [
                              {
                                label: 'Cost with $3,000 Rebate (6.5% APR)',
                                data: [29911, 30810, 31736, 32688, 33666],
                                borderColor: 'rgba(59, 130, 246, 0.8)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                tension: 0.4
                              },
                              {
                                label: 'Cost with 0.9% APR Special',
                                data: [30459, 30526, 30592, 30659, 30726],
                                borderColor: 'rgba(16, 185, 129, 0.8)',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
                                text: 'Total Cost Comparison by Loan Term'
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: false,
                                min: 29500,
                                ticks: { callback: (value) => '$' + value.toLocaleString() }
                              }
                            }
                          }}
                        />
                      </div>
                      
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <p className="text-sm text-amber-700 dark:text-amber-400">
                            <strong>Break-Even Point:</strong> The chart above shows that for this example, the cash rebate is better for shorter loans (36-48 months), while the low APR offer becomes advantageous for longer terms. Our calculator helps identify this break-even point for your specific situation.
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
                      <strong>Other Considerations:</strong> When choosing between cash back and low APR, consider your complete financial picture. If you're planning to pay off the loan early, the cash rebate is often the better choice since you won't realize the full interest savings from a low APR. Similarly, if you have the option to refinance later at better rates, the immediate savings from the cash rebate might be more valuable.
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
                        <span className="text-2xl">Using the Cash Back vs. Low APR Calculator</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      How to compare dealer incentives and find the best option for your situation
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
                            <h4 className="font-medium text-green-800 dark:text-green-300">Vehicle & Purchase Details</h4>
                            <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5" />
                                <span><strong>Vehicle price:</strong> Total cost before any rebates or incentives</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5" />
                                <span><strong>Down payment:</strong> Amount you'll pay upfront</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Wallet className="h-4 w-4 mt-0.5" />
                                <span><strong>Trade-in value:</strong> Credit for your existing vehicle (if any)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5" />
                                <span><strong>Taxes & fees:</strong> All additional costs</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="font-medium text-green-800 dark:text-green-300">Cash Back Option Details</h4>
                            <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                              <li className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 mt-0.5" />
                                <span><strong>Cash rebate amount:</strong> The manufacturer or dealer discount offered</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Percent className="h-4 w-4 mt-0.5" />
                                <span><strong>Standard interest rate:</strong> APR available when taking the rebate</span>
                              </li>
                            </ul>
                          </div>

                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="font-medium text-green-800 dark:text-green-300">Low APR Option Details</h4>
                            <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                              <li className="flex items-start gap-2">
                                <Percent className="h-4 w-4 mt-0.5" />
                                <span><strong>Special interest rate:</strong> The promotional low APR offered</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 mt-0.5" />
                                <span><strong>Loan term:</strong> Length of loan in months (36, 48, 60, etc.)</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 id="calculator-results" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Interpreting Your Results
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300">Key Comparison Metrics</h4>
                            
                            <div className="mt-4 space-y-3">
                              <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">Monthly Payments</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    See the difference in your monthly obligation under each option
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">Total Cost</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    The full amount paid over the loan term, including principal and interest
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">Total Interest</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    The cost of borrowing under each scenario
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">Total Savings</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    The dollar amount saved by choosing the better option
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <p className="text-sm text-blue-700 dark:text-blue-400">
                                <strong>Pro Tip:</strong> The calculator will clearly indicate which option saves you more money, but also pay attention to the monthly payment differences. If cash flow is tight, a slightly lower monthly payment might be worth more to you than a small difference in total cost.
                              </p>
                            </div>
                          </div>

                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <h4 className="font-medium text-purple-800 dark:text-purple-300">Visual Comparisons</h4>
                            <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                              The calculator provides helpful visualizations:
                            </p>
                            <ul className="mt-3 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                              <li className="flex items-start gap-2">
                                <PieChart className="h-4 w-4 mt-0.5" />
                                <span><strong>Cost breakdown charts</strong> showing the principal vs. interest for each option</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <BarChart3 className="h-4 w-4 mt-0.5" />
                                <span><strong>Amortization comparison</strong> revealing how quickly you build equity under each scenario</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 mt-0.5" />
                                <span><strong>Break-even timeline</strong> showing at what point one option becomes better than the other</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-8" />
                    
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      Example Scenarios: Cash Back vs. Low APR
                    </h3>
                    
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="border-orange-200 dark:border-orange-800">
                        <CardHeader className="bg-orange-50 dark:bg-orange-900/30 py-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-orange-600" />
                            Scenario 1: Short-Term Loan
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Vehicle price:</span>
                              <span className="font-medium">$25,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Cash rebate offer:</span>
                              <span className="font-medium">$2,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Standard APR:</span>
                              <span className="font-medium">6.9%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Special APR offer:</span>
                              <span className="font-medium">1.9%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Loan term:</span>
                              <span className="font-medium">36 months</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium">
                              <span className="text-sm">Cash rebate total cost:</span>
                              <span>$24,941</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-sm">Low APR total cost:</span>
                              <span>$25,737</span>
                            </div>
                            <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-1 rounded">
                              <span className="text-sm font-medium">Better option:</span>
                              <span className="font-bold text-green-700 dark:text-green-400">Cash Rebate</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total savings:</span>
                              <span className="font-medium">$796</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-blue-600" />
                            Scenario 2: Mid-Term Loan
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Vehicle price:</span>
                              <span className="font-medium">$32,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Cash rebate offer:</span>
                              <span className="font-medium">$2,500</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Standard APR:</span>
                              <span className="font-medium">7.2%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Special APR offer:</span>
                              <span className="font-medium">0.9%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Loan term:</span>
                              <span className="font-medium">60 months</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium">
                              <span className="text-sm">Cash rebate total cost:</span>
                              <span>$33,582</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-sm">Low APR total cost:</span>
                              <span>$32,460</span>
                            </div>
                            <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-1 rounded">
                              <span className="text-sm font-medium">Better option:</span>
                              <span className="font-bold text-green-700 dark:text-green-400">Low APR</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total savings:</span>
                              <span className="font-medium">$1,122</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-green-600" />
                            Scenario 3: Long-Term Loan
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Vehicle price:</span>
                              <span className="font-medium">$42,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Cash rebate offer:</span>
                              <span className="font-medium">$3,500</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Standard APR:</span>
                              <span className="font-medium">7.5%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Special APR offer:</span>
                              <span className="font-medium">1.9%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Loan term:</span>
                              <span className="font-medium">72 months</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium">
                              <span className="text-sm">Cash rebate total cost:</span>
                              <span>$45,473</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-sm">Low APR total cost:</span>
                              <span>$43,565</span>
                            </div>
                            <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-1 rounded">
                              <span className="text-sm font-medium">Better option:</span>
                              <span className="font-bold text-green-700 dark:text-green-400">Low APR</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total savings:</span>
                              <span className="font-medium">$1,908</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 dark:text-amber-300">Key Pattern Across Scenarios</p>
                          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                            Notice how the advantage shifts from cash rebate to low APR as the loan term increases. For short-term loans (36 months), the immediate cash discount often provides better overall savings. For longer loans (60+ months), the interest savings from a low APR usually outweigh the rebate benefit. The calculator helps identify exactly where this "break-even point" occurs for your specific situation.
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
                  Strategic Considerations for Your Decision
                </h2>
                
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-bold mb-4">Financial Context Matters</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <Wallet className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-800 dark:text-blue-300">Credit Score Implications</h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                Your credit score may determine which offers you qualify for. Special low APR offers often require excellent credit (720+ FICO), while cash rebates are typically available regardless of credit score.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <Clock className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-800 dark:text-blue-300">Early Payoff Plans</h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                If you plan to pay off your loan early, the cash rebate is almost always the better choice, as you won't realize the full interest savings of the low APR offer.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <PiggyBank className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-800 dark:text-blue-300">Opportunity Cost of Cash</h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                Consider what else you might do with the cash rebate. If you can invest it at a higher return than the interest rate differential, taking the rebate might be better even when the calculator says otherwise.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold mb-4">Dealership Tactics to Watch For</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                              <AlertCircle className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-800 dark:text-purple-300">Rebate Stacking Limitations</h4>
                              <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                                Dealers may advertise multiple rebates, but read the fine print - some cannot be combined with special APR offers or may have eligibility requirements (military, college grad, loyalty programs).
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                              <Search className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-800 dark:text-purple-300">Hidden Price Inflation</h4>
                              <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                                Some dealerships raise the vehicle price when customers choose the low APR option or add mandatory extras. Always negotiate the vehicle price before discussing financing options.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                              <Calendar className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-800 dark:text-purple-300">Term Limitations</h4>
                              <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                                The most attractive APR offers (like 0% or 0.9%) are often limited to shorter loan terms (36-48 months), which means higher monthly payments. Be clear about the term that applies to any advertised rate.
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
                          <strong>Negotiation Strategy:</strong> Dealers often ask early in the process if you'll be financing through them. It's generally best to say "I'm not sure yet" and negotiate the vehicle price first. Once you've agreed on price, then compare their financing offers with your pre-approved financing or consider the cash back vs. low APR decision. This approach gives you maximum leverage.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h3 id="personal-factors" className="text-xl font-bold mb-4">Personal Factors to Consider</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-blue-200 dark:border-blue-900">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">When Cash Back Might Be Better</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-1" />
                        <p className="text-sm">You plan to pay off the loan early or trade in the vehicle before the loan term ends</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-1" />
                        <p className="text-sm">The loan term is relatively short (36-48 months)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-1" />
                        <p className="text-sm">You already have excellent financing arranged through your bank or credit union</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-1" />
                        <p className="text-sm">You need to reduce your loan-to-value ratio for financing approval</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-1" />
                        <p className="text-sm">You have immediate uses for the cash that could provide greater returns</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-200 dark:border-purple-900">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">When Low APR Might Be Better</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-purple-600 mt-1" />
                        <p className="text-sm">You plan to keep the loan for its full term</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-purple-600 mt-1" />
                        <p className="text-sm">The loan term is longer (60+ months)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-purple-600 mt-1" />
                        <p className="text-sm">The APR offer is significantly lower than standard rates (especially 0-0.9%)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-purple-600 mt-1" />
                        <p className="text-sm">Interest rates are generally high in the current market</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-purple-600 mt-1" />
                        <p className="text-sm">Cash flow is important, and the low APR provides lower monthly payments</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      <strong>Look for Hidden Benefits:</strong> Some manufacturers offer additional perks with certain financing options. For example, some low APR offers might come with complimentary maintenance packages or extended warranties that add significant value. Similarly, some cash back offers might have hidden restrictions or reduce your eligibility for other incentives. Always ask what other benefits or limitations come with each option.
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
                      Making the Right Financing Decision
                    </CardTitle>
                    <CardDescription>
                      The smart approach to evaluating dealer incentives
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      The <strong>Cash Back vs. Low APR Calculator</strong> empowers you to make data-driven decisions when faced with competing dealer incentives. While the mathematical answer is important, remember that your personal financial situation and plans for the vehicle should influence your final choice.
                    </p>
                    
                    <p className="mt-4" id="key-takeaways">
                      Keep these key principles in mind when evaluating dealer incentives:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Practical Guidelines</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Calculate the total cost, not just the monthly payment</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Shorter loans tend to favor cash rebates</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-blue-800 dark:text-blue-300">Longer loans typically benefit from low APR offers</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Smart Negotiation Tactics</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Negotiate the vehicle price before discussing financing</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Get pre-approved financing as leverage before visiting dealers</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-green-800 dark:text-green-300">Ask for all available incentives you might qualify for</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to analyze your auto financing options?</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use our <strong>Cash Back vs. Low APR Calculator</strong> above to determine your best option! For more car buying tools, explore our related calculators:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/auto-loan">
                                <Car className="h-4 w-4 mr-1" />
                                Auto Loan Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/affordability">
                                <Wallet className="h-4 w-4 mr-1" />
                                Auto Affordability
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/refinance">
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Auto Refinance
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
                    Calculate your monthly car payments and understand the total cost of your auto loan.
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
                  <CardTitle className="text-lg">Auto Lease Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compare leasing versus buying a vehicle to make an informed decision.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/auto-lease">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Loan Comparison Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compare different loan options side by side to find the best financing choice.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/loan-comparison">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      <SaveCalculationButton calculatorType="cash-back-interest" inputs={{}} results={{}} />
      </main>
      <SiteFooter />
    </div>
  )
}