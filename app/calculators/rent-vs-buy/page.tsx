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
  Home,
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
  Building,
  Landmark,
  Clock,
  Check,
  Calendar,
  Wallet,
  Percent
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
import RentVsBuySchema from './schema';

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

export default function RentVsBuyCalculator() {
  // Purchase Details
  const [homePrice, setHomePrice] = useState(400000)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [interestRate, setInterestRate] = useState(6.5)
  const [loanTerm, setLoanTerm] = useState(30)
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2)
  const [homeInsuranceRate, setHomeInsuranceRate] = useState(0.5)
  const [maintenanceRate, setMaintenanceRate] = useState(1)
  const [hoaFees, setHoaFees] = useState(250)
  const [closingCostRate, setClosingCostRate] = useState(3)
  const [homeAppreciationRate, setHomeAppreciationRate] = useState(3)

  // Rental Details
  const [monthlyRent, setMonthlyRent] = useState(2000)
  const [rentIncreaseRate, setRentIncreaseRate] = useState(3)
  const [rentersInsurance, setRentersInsurance] = useState(20)
  const [securityDeposit, setSecurityDeposit] = useState(2000)

  // Investment & Time Horizon
  const [investmentReturnRate, setInvestmentReturnRate] = useState(7)
  const [timeHorizon, setTimeHorizon] = useState(10)
  const [marginalTaxRate, setMarginalTaxRate] = useState(25)

  // Results State
  const [monthlyBuyingCosts, setMonthlyBuyingCosts] = useState({
    mortgage: 0,
    propertyTax: 0,
    insurance: 0,
    maintenance: 0,
    hoa: hoaFees,
    total: 0
  })
  const [monthlyRentingCosts, setMonthlyRentingCosts] = useState({
    rent: monthlyRent,
    insurance: rentersInsurance,
    total: monthlyRent + rentersInsurance
  })
  const [cumulativeCosts, setCumulativeCosts] = useState({
    buying: [] as number[],
    renting: [] as number[],
    buyingEquity: [] as number[],
    investmentEquity: [] as number[]
  })
  const [breakEvenMonth, setBreakEvenMonth] = useState(0)

  // Calculate all costs and projections
  useEffect(() => {
    // Calculate down payment and loan amount
    const downPayment = homePrice * (downPaymentPercent / 100)
    const loanAmount = homePrice - downPayment
    const closingCosts = homePrice * (closingCostRate / 100)

    // Calculate monthly mortgage payment
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12
    const monthlyMortgage = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    // Calculate other monthly buying costs
    const monthlyPropertyTax = (homePrice * (propertyTaxRate / 100)) / 12
    const monthlyHomeInsurance = (homePrice * (homeInsuranceRate / 100)) / 12
    const monthlyMaintenance = (homePrice * (maintenanceRate / 100)) / 12

    // Update monthly buying costs
    const totalMonthlyBuying = monthlyMortgage + monthlyPropertyTax + 
      monthlyHomeInsurance + monthlyMaintenance + hoaFees

    setMonthlyBuyingCosts({
      mortgage: monthlyMortgage,
      propertyTax: monthlyPropertyTax,
      insurance: monthlyHomeInsurance,
      maintenance: monthlyMaintenance,
      hoa: hoaFees,
      total: totalMonthlyBuying
    })

    // Calculate cumulative costs over time
    let buyingCosts: number[] = []
    let rentingCosts: number[] = []
    let buyingEquity: number[] = []
    let investmentEquity: number[] = []
    
    let currentRent = monthlyRent
    let currentHomeValue = homePrice
    let remainingLoanBalance = loanAmount
    let investmentBalance = downPayment + closingCosts // Initial investment if renting
    let breakEvenFound = false
    let breakEvenMonth = 0

    for (let month = 0; month <= timeHorizon * 12; month++) {
      // Calculate monthly interest and principal
      const monthlyInterest = remainingLoanBalance * monthlyRate
      const monthlyPrincipal = monthlyMortgage - monthlyInterest
      remainingLoanBalance -= monthlyPrincipal

      // Update home value with appreciation
      currentHomeValue *= (1 + homeAppreciationRate / 100 / 12)

      // Calculate cumulative buying costs
      const buyingCost = month === 0 
        ? downPayment + closingCosts 
        : buyingCosts[month - 1] + totalMonthlyBuying
      buyingCosts.push(buyingCost)

      // Calculate buying equity (home value - remaining loan)
      const equity = currentHomeValue - remainingLoanBalance
      buyingEquity.push(equity)

      // Calculate renting costs with annual increases
      if (month > 0 && month % 12 === 0) {
        currentRent *= (1 + rentIncreaseRate / 100)
      }
      const rentingCost = month === 0
        ? securityDeposit
        : rentingCosts[month - 1] + currentRent + rentersInsurance
      rentingCosts.push(rentingCost)

      // Calculate investment returns on down payment if renting
      investmentBalance *= (1 + investmentReturnRate / 100 / 12)
      investmentEquity.push(investmentBalance)

      // Find break-even point
      if (!breakEvenFound && buyingEquity[month] - buyingCosts[month] > investmentEquity[month] - rentingCosts[month]) {
        breakEvenFound = true
        breakEvenMonth = month
      }
    }

    setCumulativeCosts({
      buying: buyingCosts,
      renting: rentingCosts,
      buyingEquity,
      investmentEquity
    })
    setBreakEvenMonth(breakEvenMonth)

  }, [
    homePrice,
    downPaymentPercent,
    interestRate,
    loanTerm,
    propertyTaxRate,
    homeInsuranceRate,
    maintenanceRate,
    hoaFees,
    closingCostRate,
    homeAppreciationRate,
    monthlyRent,
    rentIncreaseRate,
    rentersInsurance,
    securityDeposit,
    investmentReturnRate,
    timeHorizon,
    marginalTaxRate
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

  // Monthly cost comparison chart
  const monthlyComparisonData = {
    labels: ['Monthly Costs'],
    datasets: [
      {
        label: 'Buying',
        data: [monthlyBuyingCosts.total],
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Renting',
        data: [monthlyRentingCosts.total],
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const monthlyComparisonOptions: ChartOptions<'bar'> = {
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

  // Net worth comparison chart
  const generateNetWorthChart = () => {
    const years = Array.from({ length: timeHorizon + 1 }, (_, i) => `Year ${i}`)
    const yearlyData = years.map((_, i) => ({
      buyingNetWorth: cumulativeCosts.buyingEquity[i * 12] - cumulativeCosts.buying[i * 12],
      rentingNetWorth: cumulativeCosts.investmentEquity[i * 12] - cumulativeCosts.renting[i * 12]
    }))

    return {
      labels: years,
      datasets: [
        {
          label: 'Buying Net Worth',
          data: yearlyData.map(d => d.buyingNetWorth),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Renting Net Worth',
          data: yearlyData.map(d => d.rentingNetWorth),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4
        }
      ]
    }
  }

  const netWorthChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
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
    pdf.save('rent-vs-buy-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <RentVsBuySchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Rent vs. Buy <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Compare the financial implications of renting versus buying a home to make an informed decision about your housing situation.
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
                    <CardTitle>Enter Details</CardTitle>
                    <CardDescription>
                      Provide information about potential home purchase and rental scenarios.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Purchase Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Purchase Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="home-price">Home Price</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="home-price"
                              type="number"
                              className="pl-9"
                              value={homePrice || ''} onChange={(e) => setHomePrice(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="down-payment">Down Payment</Label>
                            <span className="text-sm text-muted-foreground">{downPaymentPercent}%</span>
                          </div>
                          <Slider
                            id="down-payment"
                            min={3}
                            max={50}
                            step={1}
                            value={[downPaymentPercent]}
                            onValueChange={(value) => setDownPaymentPercent(value[0])}
                          />
                          <p className="text-xs text-muted-foreground">
                            Amount: {formatCurrency(homePrice * (downPaymentPercent / 100))}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interest-rate">Interest Rate</Label>
                            <span className="text-sm text-muted-foreground">{interestRate}%</span>
                          </div>
                          <Slider
                            id="interest-rate"
                            min={2}
                            max={10}
                            step={0.125}
                            value={[interestRate]}
                            onValueChange={(value) => setInterestRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loan-term">Loan Term</Label>
                          <Select value={String(loanTerm)} onValueChange={(value) => setLoanTerm(Number(value))}>
                            <SelectTrigger id="loan-term">
                              <SelectValue placeholder="Select loan term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 Years</SelectItem>
                              <SelectItem value="20">20 Years</SelectItem>
                              <SelectItem value="15">15 Years</SelectItem>
                              <SelectItem value="10">10 Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Additional Costs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Costs & Assumptions</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="property-tax">Property Tax Rate</Label>
                            <span className="text-sm text-muted-foreground">{propertyTaxRate}%</span>
                          </div>
                          <Slider
                            id="property-tax"
                            min={0.5}
                            max={3}
                            step={0.1}
                            value={[propertyTaxRate]}
                            onValueChange={(value) => setPropertyTaxRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="insurance-rate">Insurance Rate</Label>
                            <span className="text-sm text-muted-foreground">{homeInsuranceRate}%</span>
                          </div>
                          <Slider
                            id="insurance-rate"
                            min={0.2}
                            max={1}
                            step={0.1}
                            value={[homeInsuranceRate]}
                            onValueChange={(value) => setHomeInsuranceRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="maintenance-rate">Maintenance Rate</Label>
                            <span className="text-sm text-muted-foreground">{maintenanceRate}%</span>
                          </div>
                          <Slider
                            id="maintenance-rate"
                            min={0.5}
                            max={2}
                            step={0.1}
                            value={[maintenanceRate]}
                            onValueChange={(value) => setMaintenanceRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hoa-fees">Monthly HOA Fees</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="hoa-fees"
                              type="number"
                              className="pl-9"
                              value={hoaFees || ''} onChange={(e) => setHoaFees(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="closing-cost-rate">Closing Cost Rate</Label>
                            <span className="text-sm text-muted-foreground">{closingCostRate}%</span>
                          </div>
                          <Slider
                            id="closing-cost-rate"
                            min={2}
                            max={6}
                            step={0.5}
                            value={[closingCostRate]}
                            onValueChange={(value) => setClosingCostRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="appreciation-rate">Home Appreciation Rate</Label>
                            <span className="text-sm text-muted-foreground">{homeAppreciationRate}%</span>
                          </div>
                          <Slider
                            id="appreciation-rate"
                            min={1}
                            max={6}
                            step={0.5}
                            value={[homeAppreciationRate]}
                            onValueChange={(value) => setHomeAppreciationRate(value[0])}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rental Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Rental Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="monthly-rent">Monthly Rent</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="monthly-rent"
                              type="number"
                              className="pl-9"
                              value={monthlyRent || ''} onChange={(e) => setMonthlyRent(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="rent-increase">Annual Rent Increase</Label>
                            <span className="text-sm text-muted-foreground">{rentIncreaseRate}%</span>
                          </div>
                          <Slider
                            id="rent-increase"
                            min={0}
                            max={10}
                            step={0.5}
                            value={[rentIncreaseRate]}
                            onValueChange={(value) => setRentIncreaseRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="renters-insurance">Monthly Renter's Insurance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="renters-insurance"
                              type="number"
                              className="pl-9"
                              value={rentersInsurance || ''} onChange={(e) => setRentersInsurance(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="security-deposit">Security Deposit</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="security-deposit"
                              type="number"
                              className="pl-9"
                              value={securityDeposit || ''} onChange={(e) => setSecurityDeposit(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Investment & Time Horizon */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Investment & Time Horizon</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="investment-return">Investment Return Rate</Label>
                            <span className="text-sm text-muted-foreground">{investmentReturnRate}%</span>
                          </div>
                          <Slider
                            id="investment-return"
                            min={2}
                            max={12}
                            step={0.5}
                            value={[investmentReturnRate]}
                            onValueChange={(value) => setInvestmentReturnRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time-horizon">Time Horizon (Years)</Label>
                          <Select value={String(timeHorizon)} onValueChange={(value) => setTimeHorizon(Number(value))}>
                            <SelectTrigger id="time-horizon">
                              <SelectValue placeholder="Select time horizon" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 Years</SelectItem>
                              <SelectItem value="10">10 Years</SelectItem>
                              <SelectItem value="15">15 Years</SelectItem>
                              <SelectItem value="20">20 Years</SelectItem>
                              <SelectItem value="30">30 Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="tax-rate">Marginal Tax Rate</Label>
                            <span className="text-sm text-muted-foreground">{marginalTaxRate}%</span>
                          </div>
                          <Slider
                            id="tax-rate"
                            min={10}
                            max={40}
                            step={1}
                            value={[marginalTaxRate]}
                            onValueChange={(value) => setMarginalTaxRate(value[0])}
                          />
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
                        <p className="text-sm text-muted-foreground">Monthly Cost - Buying</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(monthlyBuyingCosts.total)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Monthly Cost - Renting</p>
                        <p className="text-2xl font-bold">{formatCurrency(monthlyRentingCosts.total)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="monthly" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="monthly">Monthly Costs</TabsTrigger>
                        <TabsTrigger value="networth">Net Worth</TabsTrigger>
                      </TabsList>

                      <TabsContent value="monthly" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={monthlyComparisonData} options={monthlyComparisonOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Monthly Cost Breakdown - Buying</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Mortgage (P&I)</span>
                              <span className="font-medium">{formatCurrency(monthlyBuyingCosts.mortgage)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Property Tax</span>
                              <span className="font-medium">{formatCurrency(monthlyBuyingCosts.propertyTax)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Insurance</span>
                              <span className="font-medium">{formatCurrency(monthlyBuyingCosts.insurance)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Maintenance</span>
                              <span className="font-medium">{formatCurrency(monthlyBuyingCosts.maintenance)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">HOA Fees</span>
                              <span className="font-medium">{formatCurrency(monthlyBuyingCosts.hoa)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="networth" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateNetWorthChart()} options={netWorthChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Break-Even Analysis</h4>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm">
                              {breakEvenMonth > 0 
                                ? `Break-even point: ${Math.floor(breakEvenMonth / 12)} years and ${breakEvenMonth % 12} months`
                                : "No break-even point within the selected time horizon"}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Recommendation */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Analysis Summary</p>
                            <p className="text-sm text-muted-foreground">
                              {monthlyBuyingCosts.total < monthlyRentingCosts.total
                                ? "Monthly costs favor buying, but consider the upfront costs and commitment."
                                : "Monthly costs favor renting, but consider long-term equity building through homeownership."}
                              {breakEvenMonth > 0 && breakEvenMonth / 12 < timeHorizon
                                ? ` If you plan to stay ${Math.ceil(breakEvenMonth / 12)} years or longer, buying may be more financially advantageous.`
                                : ""}
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Housing Decision Tool</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Rent vs. Buy Calculator: Making Your Housing Decision</h2>
        <p className="mt-3 text-muted-foreground text-lg">Compare the financial implications of renting versus buying to make an informed housing choice</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding the Rent vs. Buy Decision
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                A <strong>Rent vs. Buy Calculator</strong> helps you make one of life's most significant financial decisions by comparing the long-term costs and benefits of renting a home versus purchasing one. This powerful tool goes beyond simple monthly payment comparisons to analyze the complete financial picture.
              </p>
              <p className="mt-3">
                The rent versus buy decision involves several key factors:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Upfront costs (down payment, closing costs)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Ongoing expenses (mortgage, maintenance, property taxes)</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Opportunity costs of invested capital</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Time horizon (how long you plan to stay)</span>
                </li>
              </ul>
              <p>
                Our calculator accounts for all these variables to provide a comprehensive analysis tailored to your unique circumstances and financial goals.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Homeownership Rates by Age</h3>
                <div className="h-[200px]">
                  <Bar 
                    data={{
                      labels: ['Under 35', '35-44', '45-54', '55-64', '65+'],
                      datasets: [
                        {
                          label: 'Homeownership Rate',
                          data: [39, 61, 70, 76, 81],
                          backgroundColor: 'rgba(59, 130, 246, 0.8)',
                          borderColor: 'rgba(59, 130, 246, 1)',
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
                          ticks: { callback: (value) => value + '%' },
                          max: 100
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Data based on recent U.S. Census Bureau statistics</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> The average homeowner stays in their home for approximately 13 years before selling, while the average renter moves every 2-3 years. Your expected time horizon significantly impacts whether renting or buying makes more financial sense.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Factors Section */}
      <div className="mb-10" id="financial-factors">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Key Financial Factors in the Rent vs. Buy Decision
        </h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="upfront-costs" className="font-bold text-xl mb-4">Upfront Costs Comparison</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-4">
                One of the most significant differences between renting and buying is the initial investment required. Purchasing a home typically demands substantial upfront capital, while renting usually requires much less to get started.
              </p>
              
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Typical Upfront Costs:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">1</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300"><strong>Buying a Home</strong></p>
                      <p className="text-blue-700 dark:text-blue-400">• Down payment (3-20% of home price)<br />• Closing costs (2-5% of loan amount)<br />• Moving expenses<br />• Initial repairs and furnishing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">2</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300"><strong>Renting a Home</strong></p>
                      <p className="text-blue-700 dark:text-blue-400">• Security deposit (typically 1-2 months' rent)<br />• First/last month's rent<br />• Moving expenses<br />• Possible furnishing costs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h4 className="font-medium mb-3">Upfront Costs on $300,000 Home vs. $1,500/month Rental</h4>
                <div className="h-[180px]">
                  <Bar
                    data={{
                      labels: ['Buy (20% Down)', 'Buy (5% Down)', 'Buy (3.5% FHA)', 'Rent'],
                      datasets: [{
                        label: 'Initial Investment',
                        data: [69500, 24500, 19500, 4500],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(99, 102, 241, 0.8)',
                          'rgba(139, 92, 246, 0.8)',
                          'rgba(236, 72, 153, 0.8)'
                        ]
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => `$${(context.raw as number).toLocaleString()}`
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => `$${value.toLocaleString()}` }
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">Buying includes down payment plus estimated closing costs; renting includes security deposit plus first/last month's rent</p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Opportunity Cost:</strong> When you put a large sum into a down payment, you lose the potential returns that money could have earned if invested elsewhere. Our calculator factors in this "opportunity cost" when comparing renting vs. buying.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h3 id="monthly-costs" className="font-bold text-xl mt-8 mb-4">Monthly Cost Comparison</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3">
                Beyond the initial investment, both renting and buying involve ongoing monthly expenses. For homeowners, many costs fluctuate over time or occur unexpectedly, while renters typically have more predictable monthly expenses.
              </p>
              
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">Monthly Homeownership Costs:</h4>
                  
                  <ul className="mt-3 space-y-3">
                    <li className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Mortgage Payment (Principal & Interest)</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Remains fixed with a fixed-rate mortgage, building equity with each payment
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Home className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Property Taxes & Insurance</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Property taxes typically increase over time and vary by location
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Percent className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Maintenance & Repairs</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Budget 1-3% of home value annually for maintenance costs
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Wallet className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">HOA Fees (if applicable)</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Can increase over time and vary significantly by community
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300">Monthly Rental Costs:</h4>
                
                <ul className="mt-3 space-y-3">
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Rent Payment</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Typically increases annually with market rates
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Wallet className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Renter's Insurance</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Significantly less expensive than homeowner's insurance
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Home className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Utilities (sometimes included)</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        May be partially covered by landlord depending on the property
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Percent className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Maintenance & Repairs</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Typically the landlord's responsibility (major savings advantage)
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="h-[180px]">
                <Line
                  data={{
                    labels: ['Year 1', 'Year 3', 'Year 5', 'Year 7', 'Year 9', 'Year 11', 'Year 13', 'Year 15'],
                    datasets: [
                      {
                        label: 'Monthly Mortgage Payment',
                        data: [1798, 1798, 1798, 1798, 1798, 1798, 1798, 1798],
                        borderColor: 'rgba(14, 165, 233, 0.8)',
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        borderWidth: 2
                      },
                      {
                        label: 'Monthly Rent Payment',
                        data: [1500, 1597, 1701, 1812, 1931, 2057, 2192, 2335],
                        borderColor: 'rgba(236, 72, 153, 0.8)',
                        backgroundColor: 'rgba(236, 72, 153, 0.1)',
                        borderWidth: 2
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Rent vs. Mortgage Payment Over Time'
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => `$${context.raw}/month`
                        }
                      }
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-center">Assumes fixed-rate mortgage and 3% annual rent increase</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Equity Building & Appreciation:</strong> When comparing renting and buying, it's important to account for equity building through mortgage payments and potential home price appreciation. While these factors can significantly benefit homeowners over time, they're also subject to market conditions and are not guaranteed. Our calculator incorporates both conservative and optimistic appreciation scenarios.
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Guide Section */}
      <div className="mb-10" id="calculator-guide">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Using the Rent vs. Buy Calculator</span>
              </div>
            </CardTitle>
            <CardDescription>
              Get accurate personalized insights into your housing decision
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="calculator-inputs" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Essential Calculator Inputs
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Rental Information</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5" />
                        <span><strong>Monthly rent:</strong> Your current rent or expected rental costs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 mt-0.5" />
                        <span><strong>Annual rent increase:</strong> Expected yearly percentage increase</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Wallet className="h-4 w-4 mt-0.5" />
                        <span><strong>Renters insurance:</strong> Annual premium amount</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Home Purchase Information</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Home className="h-4 w-4 mt-0.5" />
                        <span><strong>Home price:</strong> Purchase price of property you're considering</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5" />
                        <span><strong>Down payment:</strong> Amount and percentage of purchase price</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 mt-0.5" />
                        <span><strong>Mortgage details:</strong> Interest rate, loan term, and type</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calculator className="h-4 w-4 mt-0.5" />
                        <span><strong>Closing costs:</strong> Typically 2-5% of loan amount</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Ongoing Homeownership Costs</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Calculator className="h-4 w-4 mt-0.5" />
                        <span><strong>Property taxes:</strong> Annual amount or percentage of home value</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Wallet className="h-4 w-4 mt-0.5" />
                        <span><strong>Homeowners insurance:</strong> Annual premium</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Home className="h-4 w-4 mt-0.5" />
                        <span><strong>Maintenance costs:</strong> Estimated percentage of home value</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Home className="h-4 w-4 mt-0.5" />
                        <span><strong>HOA fees:</strong> Monthly dues, if applicable</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="financial-assumptions" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Important Financial Assumptions
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Market Conditions</h4>
                    <ul className="mt-2 space-y-2 text-sm text-blue-700 dark:text-blue-400">
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 mt-0.5" />
                        <span><strong>Home appreciation rate:</strong> Expected annual percentage increase in property value</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 mt-0.5" />
                        <span><strong>Investment return rate:</strong> Expected return if down payment money were invested instead</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 mt-0.5" />
                        <span><strong>Inflation rate:</strong> Estimated annual inflation rate</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Personal Factors</h4>
                    <ul className="mt-2 space-y-2 text-sm text-blue-700 dark:text-blue-400">
                      <li className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-0.5" />
                        <span><strong>Time horizon:</strong> How long you plan to stay in the home</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 mt-0.5" />
                        <span><strong>Tax information:</strong> Your marginal income tax rate for deduction calculations</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>Pro Tip:</strong> Try multiple scenarios with different assumption values to see how sensitive your rent vs. buy decision is to changes in home appreciation, investment returns, and your expected length of stay.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <h4 className="font-medium text-purple-800 dark:text-purple-300">Understanding Results</h4>
                    <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                      The calculator will provide several key outputs to help you make your decision:
                    </p>
                    <div className="mt-3 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Breakeven point:</strong> The year when buying becomes financially advantageous over renting</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Net cost comparison:</strong> Total costs of renting vs. buying over your specified time period</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Monthly payment comparison:</strong> Initial and future monthly payments for both options</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Equity building:</strong> How much home equity you would build through principal payments and appreciation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Sample Rent vs. Buy Scenario
            </h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="bg-orange-50 dark:bg-orange-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Home className="h-5 w-5 text-orange-600" />
                    Housing Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Home price:</span>
                      <span className="font-medium">$350,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly rent alternative:</span>
                      <span className="font-medium">$1,800</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Down payment (10%):</span>
                      <span className="font-medium">$35,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Mortgage rate (30yr):</span>
                      <span className="font-medium">5.25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Annual home appreciation:</span>
                      <span className="font-medium">3.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Annual rent increase:</span>
                      <span className="font-medium">3.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time horizon:</span>
                      <span className="font-medium">7 years</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    Cost Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly mortgage (P&I):</span>
                      <span className="font-medium">$1,739</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Property tax & insurance:</span>
                      <span className="font-medium">$525/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Maintenance & HOA:</span>
                      <span className="font-medium">$350/mo</span>
                    </div>
                    <div className="flex justify-between font-medium bg-blue-50 dark:bg-blue-900/20 p-1 rounded">
                      <span className="text-sm">Total monthly (buying):</span>
                      <span>$2,614</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total monthly (renting):</span>
                      <span className="font-medium">$1,825</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly difference:</span>
                      <span className="font-medium">$789 more to buy</span>
                    </div>
                    <div className="flex justify-between font-medium bg-orange-50 dark:bg-orange-900/20 p-1 rounded mt-1">
                      <span className="text-sm">Breakeven point:</span>
                      <span>5.4 years</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-green-600" />
                    Long-term Outcome (7 Years)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total housing cost (buy):</span>
                      <span className="font-medium">$264,576</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total housing cost (rent):</span>
                      <span className="font-medium">$162,553</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Home value after 7 years:</span>
                      <span className="font-medium">$428,524</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Mortgage balance:</span>
                      <span className="font-medium">$280,620</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Home equity:</span>
                      <span className="font-medium">$147,904</span>
                    </div>
                    <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-1 rounded font-bold">
                      <span className="text-sm">Net financial benefit:</span>
                      <span>$45,881 (Buying)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Key Insight from This Example</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    In this scenario, buying becomes financially advantageous after about 5.4 years. Initially, renting is less expensive on a monthly basis, but the combination of equity building, home appreciation, and fixed mortgage payments (versus rising rent) creates a long-term advantage for buying. If you plan to stay less than 5 years, renting would likely be the better financial option in this scenario.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Beyond the Numbers Section */}
      <div className="mb-10" id="beyond-numbers">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Home className="h-6 w-6 text-blue-600" />
          Beyond the Numbers: Other Considerations
        </h2>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="mb-4">
              While financial calculations are essential, your housing decision should also factor in important non-financial considerations that impact your quality of life and peace of mind.
            </p>
          
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <div>
                <h3 className="text-xl font-bold mb-4">Homeownership Advantages</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <Home className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Control and Personalization</h4>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        Freedom to renovate, decorate, and modify your living space to match your preferences without landlord approval.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <Wallet className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Stability and Predictability</h4>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        Fixed-rate mortgages provide payment stability, and you can't be forced to move by a landlord selling the property.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <TrendingUp className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Potential Tax Benefits</h4>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        Mortgage interest and property tax deductions can provide tax advantages, though benefits vary based on individual tax situations.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <Home className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Community Attachment</h4>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        Homeowners often develop stronger ties to their neighborhoods and engage more deeply in local community activities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Renting Advantages</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                      <Home className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-800 dark:text-purple-300">Flexibility and Mobility</h4>
                      <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                        Easier to relocate for job opportunities or lifestyle changes without the commitment of selling a home.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                      <Wallet className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-800 dark:text-purple-300">Fewer Maintenance Responsibilities</h4>
                      <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                        No need to worry about costly repairs or maintenance tasks—these responsibilities fall to the landlord.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                      <TrendingUp className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-800 dark:text-purple-300">Investment Diversification</h4>
                      <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                        Capital not tied up in a down payment can be invested in more diversified assets, potentially yielding higher returns.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                      <DollarSign className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-800 dark:text-purple-300">Lower Initial Costs</h4>
                      <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
                        Significantly smaller upfront investment allows you to retain cash reserves for emergencies or other financial goals.
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
                  <strong>Key Decision Factor - Time Horizon:</strong> Your expected length of stay in a home is often the most critical factor in the rent vs. buy decision. Generally, the longer you plan to stay, the more buying makes financial sense. This is because the high transaction costs of buying and selling (typically 8-10% of the home's value in total) are spread over more years, and you have more time to build equity and benefit from potential appreciation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <h3 id="best-for" className="text-xl font-bold mb-4">Who Should Rent vs. Who Should Buy?</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Buying Might Be Better If You...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <p className="text-sm">Plan to stay in the same location for at least 5+ years</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <p className="text-sm">Want to build equity and wealth through your housing expense</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <p className="text-sm">Value customizing and personalizing your living space</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <p className="text-sm">Have stable income and can handle occasional unexpected expenses</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-1" />
                <p className="text-sm">Live in an area with a favorable price-to-rent ratio</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 dark:border-purple-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Renting Might Be Better If You...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-purple-600 mt-1" />
                <p className="text-sm">Anticipate moving within the next 2-4 years</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-purple-600 mt-1" />
                <p className="text-sm">Value flexibility and minimal maintenance responsibilities</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-purple-600 mt-1" />
                <p className="text-sm">Live in an expensive housing market with high price-to-rent ratios</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-purple-600 mt-1" />
                <p className="text-sm">Want to invest your savings in non-real estate opportunities</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-purple-600 mt-1" />
                <p className="text-sm">Prefer predictable monthly housing costs without surprise expenses</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Market Considerations:</strong> Local housing markets vary tremendously. In some regions, home prices have far outpaced rents, making renting financially advantageous even over longer periods. In others, the opposite is true. Research your specific market's price-to-rent ratio (home price divided by annual rent) for additional context. Generally, ratios above 20 favor renting, while ratios below 15 favor buying.
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
              Making Your Housing Decision
            </CardTitle>
            <CardDescription>
              Finding the right balance between financial and lifestyle factors
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              The <strong>Rent vs. Buy Calculator</strong> provides personalized financial insights to inform what may be one of your most significant life decisions. While the calculator offers concrete numbers to guide your thinking, remember that the best housing choice balances both financial considerations and personal preferences.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              As you evaluate your options, keep these key principles in mind:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Financial Perspective</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Time horizon is the most critical factor in the financial equation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Transaction costs make frequent buying and selling expensive</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Home maintenance costs are often underestimated by new buyers</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Lifestyle Considerations</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Your career path and mobility needs should influence your choice</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Consider your tolerance for maintenance and repair responsibilities</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Weigh the emotional value of homeownership versus financial considerations</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to analyze your housing options?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Rent vs. Buy Calculator</strong> above to get personalized insights for your situation! For more homebuying tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/mortgage">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Mortgage Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/affordability">
                        <Home className="h-4 w-4 mr-1" />
                        Affordability Calculator
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
                  <CardTitle className="text-lg">Mortgage Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate your monthly mortgage payments and see the amortization schedule.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/mortgage">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">House Affordability Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Find out how much house you can afford based on your income and expenses.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/house-affordability">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Down Payment Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate how much you need to save for a down payment on a home purchase.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/down-payment">Try Calculator</Link>
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