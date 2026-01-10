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
  Download,
  PieChart,
  BarChart3,
  LineChart,
  Info,
  AlertCircle,
  Home,
  Calculator,
  Clock,
  TrendingUp,
  Check,
  Calendar,
  Percent,
  ArrowRightLeft,
  X
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import FHALoanSchema from './schema';

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

export default function FHALoanCalculator() {
  // Loan Details State
  const [homePrice, setHomePrice] = useState<number>(300000)
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(3.5)
  const [interestRate, setInterestRate] = useState<number>(6.5)
  const [loanTerm, setLoanTerm] = useState<number>(30)
  const [creditScore, setCreditScore] = useState<string>("good")
  
  // FHA-Specific State
  const [upfrontMIPFinanced, setUpfrontMIPFinanced] = useState<boolean>(true)
  const [propertyType, setPropertyType] = useState<string>("single")
  const [monthlyIncome, setMonthlyIncome] = useState<number>(8000)
  const [monthlyDebts, setMonthlyDebts] = useState<number>(1000)
  
  // Additional Costs State
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(1.2)
  const [insuranceRate, setInsuranceRate] = useState<number>(0.5)
  const [includeHOA, setIncludeHOA] = useState<boolean>(false)
  const [hoaFees, setHoaFees] = useState<number>(250)
  
  // Results State
  const [loanAmount, setLoanAmount] = useState<number>(0)
  const [upfrontMIP, setUpfrontMIP] = useState<number>(0)
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0)
  const [monthlyMIP, setMonthlyMIP] = useState<number>(0)
  const [paymentBreakdown, setPaymentBreakdown] = useState<{
    principalAndInterest: number;
    propertyTax: number;
    insurance: number;
    mip: number;
    hoa: number;
  }>({
    principalAndInterest: 0,
    propertyTax: 0,
    insurance: 0,
    mip: 0,
    hoa: 0
  })
  const [dtiRatios, setDtiRatios] = useState<{
    frontEnd: number;
    backEnd: number;
  }>({
    frontEnd: 0,
    backEnd: 0
  })
  const [amortizationSchedule, setAmortizationSchedule] = useState<{
    balance: number[];
    principal: number[];
    interest: number[];
    mip: number[];
  }>({
    balance: [],
    principal: [],
    interest: [],
    mip: []
  })

  // Calculate loan details and payments
  useEffect(() => {
    // Calculate base loan amount
    const downPayment = homePrice * (downPaymentPercent / 100)
    const baseLoanAmount = homePrice - downPayment
    
    // Calculate Upfront MIP (1.75% of base loan amount)
    const upfrontMIPAmount = baseLoanAmount * 0.0175
    
    // Add upfront MIP to loan amount if financed
    const totalLoanAmount = upfrontMIPFinanced 
      ? baseLoanAmount + upfrontMIPAmount 
      : baseLoanAmount
    
    // Calculate monthly MIP rate (varies by loan term and LTV)
    const ltv = (totalLoanAmount / homePrice) * 100
    let annualMIPRate = 0.0085 // Default rate
    if (loanTerm <= 15 && ltv <= 90) {
      annualMIPRate = 0.0045
    } else if (loanTerm <= 15 && ltv > 90) {
      annualMIPRate = 0.007
    }
    
    // Calculate monthly payments
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12
    
    const monthlyPrincipalAndInterest = totalLoanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1) || 0 // Handle NaN
    
    const monthlyMIPPayment = (totalLoanAmount * annualMIPRate) / 12
    const monthlyPropertyTax = (homePrice * (propertyTaxRate / 100)) / 12
    const monthlyInsurance = (homePrice * (insuranceRate / 100)) / 12
    const monthlyHOA = includeHOA ? hoaFees : 0
    
    const totalMonthlyPayment = monthlyPrincipalAndInterest + 
      monthlyMIPPayment + monthlyPropertyTax + monthlyInsurance + monthlyHOA
    
    // Calculate DTI ratios
    const frontEndRatio = (totalMonthlyPayment / monthlyIncome) * 100 || 0
    const backEndRatio = ((totalMonthlyPayment + monthlyDebts) / monthlyIncome) * 100 || 0
    
    // Generate amortization schedule
    const schedule = {
      balance: [] as number[],
      principal: [] as number[],
      interest: [] as number[],
      mip: [] as number[]
    }
    
    let remainingBalance = totalLoanAmount
    for (let i = 0; i < numberOfPayments; i++) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPrincipalAndInterest - interestPayment
      remainingBalance -= principalPayment
      
      schedule.balance.push(Math.max(0, remainingBalance))
      schedule.principal.push(principalPayment)
      schedule.interest.push(interestPayment)
      schedule.mip.push(monthlyMIPPayment)
    }
    
    // Update state with calculations
    setLoanAmount(totalLoanAmount)
    setUpfrontMIP(upfrontMIPAmount)
    setMonthlyPayment(totalMonthlyPayment)
    setMonthlyMIP(monthlyMIPPayment)
    setPaymentBreakdown({
      principalAndInterest: monthlyPrincipalAndInterest,
      propertyTax: monthlyPropertyTax,
      insurance: monthlyInsurance,
      mip: monthlyMIPPayment,
      hoa: monthlyHOA
    })
    setDtiRatios({
      frontEnd: frontEndRatio,
      backEnd: backEndRatio
    })
    setAmortizationSchedule(schedule)
    
  }, [
    homePrice,
    downPaymentPercent,
    interestRate,
    loanTerm,
    upfrontMIPFinanced,
    propertyTaxRate,
    insuranceRate,
    includeHOA,
    hoaFees,
    monthlyIncome,
    monthlyDebts
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

  // Payment breakdown chart data
  const pieChartData = {
    labels: ['Principal & Interest', 'Property Tax', 'Insurance', 'MIP', 'HOA'],
    datasets: [{
      data: [
        paymentBreakdown.principalAndInterest,
        paymentBreakdown.propertyTax,
        paymentBreakdown.insurance,
        paymentBreakdown.mip,
        paymentBreakdown.hoa
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
        font: { weight: 'bold' } as const,
        formatter: (value: number) => {
          const total = Object.values(paymentBreakdown).reduce((a, b) => a + b, 0)
          return total ? ((value / total) * 100).toFixed(1) + '%' : '0%'
        }
      }
    }
  }

  // DTI ratio chart data
  const barChartData = {
    labels: ['Front-End DTI', 'Back-End DTI'],
    datasets: [
      {
        label: 'Your DTI Ratios',
        data: [dtiRatios.frontEnd, dtiRatios.backEnd],
        backgroundColor: chartColors.primary.slice(0, 2),
        borderColor: chartColors.secondary.slice(0, 2).map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'FHA Limits',
        data: [31, 43],
        backgroundColor: chartColors.secondary.slice(0, 2),
        borderColor: chartColors.primary.slice(0, 2),
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
        max: 50,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value: number | string) => {
            return value + '%'
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
        font: { weight: 'bold' } as const,
        formatter: (value: number) => value.toFixed(1) + '%'
      }
    }
  }

  // Amortization chart data
  const generateAmortizationChart = () => {
    const years = Array.from(
      { length: Math.ceil(amortizationSchedule.balance.length / 12) }, 
      (_, i) => `Year ${i + 1}`
    )
    
    return {
      labels: years,
      datasets: [
        {
          label: 'Loan Balance',
          data: amortizationSchedule.balance.filter((_, i) => i % 12 === 0),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Principal Paid',
          data: amortizationSchedule.principal.filter((_, i) => i % 12 === 0),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4
        },
        {
          label: 'Interest Paid',
          data: amortizationSchedule.interest.filter((_, i) => i % 12 === 0),
          borderColor: chartColors.primary[2],
          backgroundColor: chartColors.secondary[2],
          tension: 0.4
        },
        {
          label: 'MIP',
          data: amortizationSchedule.mip.filter((_, i) => i % 12 === 0),
          borderColor: chartColors.primary[3],
          backgroundColor: chartColors.secondary[3],
          tension: 0.4
        }
      ]
    }
  }

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value: number | string) => {
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

  const formatCurrency = (amount: number): string => {
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
    pdf.save('fha-loan-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <FHALoanSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        FHA Loan <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your FHA loan payments and understand the costs of FHA mortgage insurance premiums (MIP).
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
                    <CardTitle>Enter Loan Details</CardTitle>
                    <CardDescription>
                      Provide information about your FHA loan and property to calculate payments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Loan Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Loan Details</h3>
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
                            min={3.5}
                            max={20}
                            step={0.5}
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

                    {/* FHA-Specific Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">FHA-Specific Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="credit-score">Credit Score Range</Label>
                          <Select value={creditScore} onValueChange={setCreditScore}>
                            <SelectTrigger id="credit-score">
                              <SelectValue placeholder="Select credit score range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent (720+)</SelectItem>
                              <SelectItem value="good">Good (680-719)</SelectItem>
                              <SelectItem value="fair">Fair (620-679)</SelectItem>
                              <SelectItem value="poor">Poor (580-619)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="property-type">Property Type</Label>
                          <Select value={propertyType} onValueChange={setPropertyType}>
                            <SelectTrigger id="property-type">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single Family</SelectItem>
                              <SelectItem value="duplex">Duplex</SelectItem>
                              <SelectItem value="triplex">Triplex</SelectItem>
                              <SelectItem value="fourplex">Fourplex</SelectItem>
                              <SelectItem value="condo">Condominium</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="upfront-mip">Finance Upfront MIP</Label>
                            <Switch
                              id="upfront-mip"
                              checked={upfrontMIPFinanced}
                              onCheckedChange={setUpfrontMIPFinanced}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Upfront MIP: {formatCurrency(upfrontMIP)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Income & Debt */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Income & Debt</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="monthly-income">Monthly Income</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="monthly-income"
                              type="number"
                              className="pl-9"
                              value={monthlyIncome || ''} onChange={(e) => setMonthlyIncome(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="monthly-debts">Monthly Debts</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="monthly-debts"
                              type="number"
                              className="pl-9"
                              value={monthlyDebts || ''} onChange={(e) => setMonthlyDebts(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Costs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Costs</h3>
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
                            <span className="text-sm text-muted-foreground">{insuranceRate}%</span>
                          </div>
                          <Slider
                            id="insurance-rate"
                            min={0.2}
                            max={1}
                            step={0.1}
                            value={[insuranceRate]}
                            onValueChange={(value) => setInsuranceRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="hoa-toggle">Include HOA Fees</Label>
                            <Switch
                              id="hoa-toggle"
                              checked={includeHOA}
                              onCheckedChange={setIncludeHOA}
                            />
                          </div>
                          {includeHOA && (
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="hoa-fees"
                                type="number"
                                className="pl-9"
                                placeholder="Monthly HOA fees"
                                value={hoaFees || ''} onChange={(e) => setHoaFees(e.target.value === '' ? 0 : Number(e.target.value))}
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
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(monthlyPayment)}</p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Payment</TabsTrigger>
                        <TabsTrigger value="dti">DTI Ratios</TabsTrigger>
                        <TabsTrigger value="amortization">Amortization</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Monthly Payment Details</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Principal & Interest</span>
                              <span className="font-medium">{formatCurrency(paymentBreakdown.principalAndInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Monthly MIP</span>
                              <span className="font-medium">{formatCurrency(paymentBreakdown.mip)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Property Tax</span>
                              <span className="font-medium">{formatCurrency(paymentBreakdown.propertyTax)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Insurance</span>
                              <span className="font-medium">{formatCurrency(paymentBreakdown.insurance)}</span>
                            </div>
                            {paymentBreakdown.hoa > 0 && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">HOA Fees</span>
                                <span className="font-medium">{formatCurrency(paymentBreakdown.hoa)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Monthly Payment</span>
                              <span>{formatCurrency(monthlyPayment)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="dti" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={barChartData} options={barChartOptions} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">Front-End DTI</p>
                            <p className="text-2xl font-semibold">{dtiRatios.frontEnd.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground mt-1">Housing costs vs. income</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">Back-End DTI</p>
                            <p className="text-2xl font-semibold">{dtiRatios.backEnd.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground mt-1">All debts vs. income</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="amortization" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateAmortizationChart()} options={lineChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Loan balance and payments over time
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* FHA Loan Summary */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">FHA Loan Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base Loan Amount</span>
                            <span>{formatCurrency(loanAmount - upfrontMIP)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Upfront MIP</span>
                            <span>{formatCurrency(upfrontMIP)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Loan Amount</span>
                            <span>{formatCurrency(loanAmount)}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-medium">
                            <span>Monthly MIP</span>
                            <span>{formatCurrency(monthlyMIP)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Eligibility Check */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          {dtiRatios.backEnd <= 43 && dtiRatios.frontEnd <= 31 ? (
                            <>
                              <Info className="h-4 w-4 mt-1 text-primary" />
                              <div className="space-y-1">
                                <p className="font-medium">FHA Loan Eligible</p>
                                <p className="text-sm text-muted-foreground">
                                  Your debt-to-income ratios are within FHA guidelines. Continue with your loan application process.
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 mt-1 text-destructive" />
                              <div className="space-y-1">
                                <p className="font-medium">DTI Ratios Exceed Guidelines</p>
                                <p className="text-sm text-muted-foreground">
                                  Consider reducing your monthly debts or increasing your down payment to improve eligibility.
                                </p>
                              </div>
                            </>
                          )}
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
        <section className="py-12">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-6">Everything You Need to Know About FHA Loans</h2>
            <div className="mb-8 rounded-lg border bg-muted/50 p-6">
              <h3 className="mb-4 text-xl font-bold">Table of Contents</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="introduction">
                  <AccordionTrigger className="text-primary hover:text-primary hover:underline">Introduction</AccordionTrigger>
                  <AccordionContent>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground">
                      <li><a href="#what-is-fha-calculator" className="hover:text-primary hover:underline">What is an FHA Loan Calculator?</a></li>
                      <li><a href="#why-use-fha-calculator" className="hover:text-primary hover:underline">Why Use an FHA Loan Calculator?</a></li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="how-to-use">
                  <AccordionTrigger className="text-primary hover:text-primary hover:underline">How to Use the FHA Loan Calculator</AccordionTrigger>
                  <AccordionContent>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground">
                      <li><a href="#step-by-step" className="hover:text-primary hover:underline">Step-by-Step Guide</a></li>
                      <li><a href="#results" className="hover:text-primary hover:underline">Understanding Your Results</a></li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="key-features">
                  <AccordionTrigger className="text-primary hover:text-primary hover:underline">Key Features of FHA Loans</AccordionTrigger>
                  <AccordionContent>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground">
                      <li><a href="#low-down-payment" className="hover:text-primary hover:underline">Low Down Payment</a></li>
                      <li><a href="#flexible-credit" className="hover:text-primary hover:underline">Flexible Credit Requirements</a></li>
                      <li><a href="#mip" className="hover:text-primary hover:underline">Mortgage Insurance Premiums (MIP)</a></li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="eligibility">
                  <AccordionTrigger className="text-primary hover:text-primary hover:underline">FHA Loan Eligibility</AccordionTrigger>
                  <AccordionContent>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground">
                      <li><a href="#credit-score" className="hover:text-primary hover:underline">Credit Score Requirements</a></li>
                      <li><a href="#dti" className="hover:text-primary hover:underline">Debt-to-Income Ratios</a></li>
                      <li><a href="#property" className="hover:text-primary hover:underline">Property Requirements</a></li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="statistics">
                  <AccordionTrigger className="text-primary hover:text-primary hover:underline">FHA Loan Statistics and Trends</AccordionTrigger>
                  <AccordionContent>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground">
                      <li><a href="#current-trends" className="hover:text-primary hover:underline">Current FHA Loan Rates</a></li>
                      <li><a href="#fha-limits" className="hover:text-primary hover:underline">FHA Loan Limits</a></li>
                      <li><a href="#market-share" className="hover:text-primary hover:underline">Market Share</a></li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tips">
                  <AccordionTrigger className="text-primary hover:text-primary hover:underline">Tips for Getting an FHA Loan</AccordionTrigger>
                  <AccordionContent>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground">
                      <li><a href="#improve-credit" className="hover:text-primary hover:underline">Improve Your Credit Score</a></li>
                      <li><a href="#reduce-debt" className="hover:text-primary hover:underline">Reduce Debt</a></li>
                      <li><a href="#save-down-payment" className="hover:text-primary hover:underline">Save for Down Payment</a></li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="conclusion">
                  <AccordionTrigger className="text-primary hover:text-primary hover:underline">Conclusion</AccordionTrigger>
                  <AccordionContent>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground">
                      <li><a href="#summary" className="hover:text-primary hover:underline">Summary of Key Points</a></li>
                      <li><a href="#cta" className="hover:text-primary hover:underline">Call to Action</a></li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="mb-12" id="introduction">
                <h2>Introduction</h2>
                <h3 id="what-is-fha-calculator">What is an FHA Loan Calculator?</h3>
                <p>
                  An <strong>FHA loan calculator</strong> is a tool that helps you estimate your monthly mortgage payments for an FHA-insured loan. It factors in unique FHA requirements like upfront and monthly mortgage insurance premiums (MIP), making it easier to budget for your home purchase.
                </p>
                <h3 id="why-use-fha-calculator">Why Use an FHA Loan Calculator?</h3>
                <p>
                  Using an <strong>FHA loan calculator</strong> is crucial for understanding the true cost of an FHA mortgage, including MIP, which can significantly impact your monthly payments. Our calculator provides a detailed breakdown, helping you make informed decisions.
                </p>
              </div>

              <div className="mb-12" id="how-to-use">
                <h2>How to Use the FHA Loan Calculator</h2>
                <h3 id="step-by-step">Step-by-Step Guide</h3>
                <p>
                  Our <strong>FHA loan calculator</strong> is simple to use. Follow these steps:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mt-4">
                  <li><strong>Enter Loan Details:</strong> Input the home price, down payment, interest rate, and loan term.</li>
                  <li><strong>Add FHA-Specific Information:</strong> Select your credit score range and property type, and choose whether to finance the upfront MIP.</li>
                  <li><strong>Include Income and Debt:</strong> Enter your monthly income and debts to calculate debt-to-income (DTI) ratios.</li>
                  <li><strong>Factor in Additional Costs:</strong> Add property taxes, insurance, and HOA fees for a complete payment estimate.</li>
                  <li><strong>Review Results:</strong> See your monthly payment, MIP costs, DTI ratios, and amortization schedule.</li>
                </ol>
                <h3 id="results">Understanding Your Results</h3>
                <p>
                  The results give you a clear picture of your <strong>FHA loan affordability</strong>, helping you determine if an FHA loan is the right choice for your financial situation.
                </p>
              </div>

              <div className="mb-12" id="key-features">
                <h2>Key Features of FHA Loans</h2>
                <h3 id="low-down-payment">Low Down Payment</h3>
                <p>
                  As little as 3.5% down, making homeownership more accessible.
                </p>
                <h3 id="flexible-credit">Flexible Credit Requirements</h3>
                <p>
                  Borrowers with credit scores as low as 580 can qualify for the minimum down payment.
                </p>
                <h3 id="mip">Mortgage Insurance Premiums (MIP)</h3>
                <p>
                  Required for all FHA loans, MIP protects lenders but adds to your monthly costs.
                </p>
              </div>

              <div className="mb-12" id="eligibility">
                <h2>FHA Loan Eligibility</h2>
                <h3 id="credit-score">Credit Score Requirements</h3>
                <p>
                  Minimum 580 for 3.5% down, or 500-579 for 10% down.
                </p>
                <h3 id="dti">Debt-to-Income Ratios</h3>
                <p>
                  Front-end DTI ≤ 31%, back-end DTI ≤ 43% (exceptions possible).
                </p>
                <h3 id="property">Property Requirements</h3>
                <p>
                  Must be your primary residence and meet FHA appraisal standards.
                </p>
              </div>

              <div className="mb-12" id="statistics">
                <h2>FHA Loan Statistics and Trends</h2>
                <h3 id="current-trends">Current FHA Loan Rates</h3>
                <p>
                  In 2025, the average FHA rate for a 30-year fixed mortgage is around 6.5%.
                </p>
                <h3 id="fha-limits">FHA Loan Limits</h3>
                <p>
                  The 2025 FHA loan limit for a single-family home is $472,000 in most areas.
                </p>
                <h3 id="market-share">Market Share</h3>
                <p>
                  FHA loans account for approximately 12% of new mortgages in 2025.
                </p>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 mt-6">
                  <div className="rounded-lg bg-blue-100 p-6 dark:bg-blue-900">
                    <h5 className="text-center text-xl font-bold text-blue-700 dark:text-blue-300">Average FHA Rate</h5>
                    <p className="text-center text-3xl font-bold text-blue-600 dark:text-blue-400">6.5%</p>
                    <p className="text-center text-sm text-blue-600 dark:text-blue-400">30-Year Fixed, 2025</p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-6 dark:bg-green-900">
                    <h5 className="text-center text-xl font-bold text-green-700 dark:text-green-300">FHA Loan Limit</h5>
                    <p className="text-center text-3xl font-bold text-green-600 dark:text-green-400">$472,000</p>
                    <p className="text-center text-sm text-green-600 dark:text-green-400">Single-Family, 2025</p>
                  </div>
                  <div className="rounded-lg bg-purple-100 p-6 dark:bg-purple-900">
                    <h5 className="text-center text-xl font-bold text-purple-700 dark:text-purple-300">Market Share</h5>
                    <p className="text-center text-3xl font-bold text-purple-600 dark:text-purple-400">12%</p>
                    <p className="text-center text-sm text-purple-600 dark:text-purple-400">Of New Mortgages</p>
                  </div>
                </div>
              </div>

              <div className="mb-12" id="tips">
                <h2>Tips for Getting an FHA Loan</h2>
                <h3 id="improve-credit">Improve Your Credit Score</h3>
                <p>
                  Pay bills on time and reduce credit card balances to boost your score.
                </p>
                <h3 id="reduce-debt">Reduce Debt</h3>
                <p>
                  Lower your monthly obligations to improve your DTI ratios.
                </p>
                <h3 id="save-down-payment">Save for Down Payment</h3>
                <p>
                  Aim for at least 3.5% of the home price, plus closing costs.
                </p>
                <div className="my-8 rounded-lg bg-yellow-100 p-6 dark:bg-yellow-900">
                  <h5 className="mb-4 text-lg font-semibold text-yellow-700 dark:text-yellow-300">Pro Tip</h5>
                  <p className="text-yellow-600 dark:text-yellow-400">
                    Consider a larger down payment to reduce your loan-to-value ratio and potentially lower your MIP costs.
                  </p>
                </div>
              </div>

              <div className="mb-12" id="conclusion">
                <h2>Conclusion</h2>
                <h3 id="summary">Summary of Key Points</h3>
                <p>
                  An <strong>FHA loan calculator</strong> is invaluable for understanding the costs and requirements of FHA-insured mortgages. By using our tool, you can assess your eligibility, estimate payments, and plan your home purchase with confidence. Whether you're a first-time buyer or looking to refinance, our calculator provides the insights you need.
                </p>
                <h3 id="cta">Call to Action</h3>
                <p>
                  Ready to explore FHA loans? Use our <strong>FHA loan calculator</strong> above to get started! For more tools, check out our <Link href="/calculators/mortgage" className="text-primary hover:underline">mortgage calculator</Link> or <Link href="/calculators/down-payment" className="text-primary hover:underline">down payment calculator</Link>.
                </p>
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
                    Compare FHA loan payments with conventional mortgage options.
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
                    Determine how much house you can afford with different loan types.
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
                    Calculate how much you need to save for a down payment on different loan types.
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