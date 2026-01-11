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
  Home,
  Landmark,
  Building,
  Check,
  Percent,
  TrendingDown
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
import HouseAffordabilitySchema from './schema';

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

export default function HouseAffordabilityCalculator() {
  // Income & Expenses State
  const [monthlyIncome, setMonthlyIncome] = useState(5000)
  const [monthlyDebts, setMonthlyDebts] = useState(1000)
  const [monthlyExpenses, setMonthlyExpenses] = useState({
    groceries: 400,
    transportation: 200,
    utilities: 150,
    insurance: 100,
    entertainment: 200,
    other: 200
  })
  const [location, setLocation] = useState("average")
  const [creditScore, setCreditScore] = useState("good")
  
  // Down Payment & Loan Details
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [interestRate, setInterestRate] = useState(6.5)
  const [loanTerm, setLoanTerm] = useState(30)
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2)
  const [insuranceRate, setInsuranceRate] = useState(0.5)
  const [includeHOA, setIncludeHOA] = useState(false)
  const [hoaFees, setHoaFees] = useState(250)
  const [includePMI, setIncludePMI] = useState(false)
  const [pmiRate, setPmiRate] = useState(0.5)

  // Results State
  const [maxHomePrice, setMaxHomePrice] = useState(0)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [paymentBreakdown, setPaymentBreakdown] = useState({
    principalAndInterest: 0,
    propertyTax: 0,
    insurance: 0,
    pmi: 0,
    hoa: 0
  })
  const [dtiRatios, setDtiRatios] = useState({
    frontEnd: 0,
    backEnd: 0
  })

  // Calculate maximum affordable home price and monthly payments
  useEffect(() => {
    // Calculate total monthly expenses
    const totalExpenses = Object.values(monthlyExpenses).reduce((a, b) => a + b, 0)
    
    // Calculate available income for housing
    const availableIncome = monthlyIncome - monthlyDebts - totalExpenses
    
    // Apply location adjustment factor
    const locationFactors = {
      low: 0.8,
      average: 1,
      high: 1.2,
      veryHigh: 1.4
    }
    const locationAdjustment = locationFactors[location as keyof typeof locationFactors]
    
    // Calculate maximum monthly payment (28% of monthly income)
    const maxMonthlyPayment = (monthlyIncome * 0.28) * locationAdjustment
    
    // Calculate maximum home price based on monthly payment
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12
    
    // Calculate base loan amount using mortgage payment formula
    const maxLoanAmount = maxMonthlyPayment / 
      ((monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1) +
      (propertyTaxRate / 100 / 12) +
      (insuranceRate / 100 / 12) +
      (includePMI && downPaymentPercent < 20 ? pmiRate / 100 / 12 : 0))
    
    // Calculate maximum home price based on down payment
    const maxHomePrice = maxLoanAmount / (1 - (downPaymentPercent / 100))
    
    // Calculate monthly payment components
    const loanAmount = maxHomePrice * (1 - (downPaymentPercent / 100))
    const principalAndInterest = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    
    const monthlyPropertyTax = (maxHomePrice * (propertyTaxRate / 100)) / 12
    const monthlyInsurance = (maxHomePrice * (insuranceRate / 100)) / 12
    const monthlyPMI = includePMI && downPaymentPercent < 20 ? 
      (loanAmount * (pmiRate / 100)) / 12 : 0
    const monthlyHOA = includeHOA ? hoaFees : 0
    
    const totalMonthlyPayment = principalAndInterest + monthlyPropertyTax + 
      monthlyInsurance + monthlyPMI + monthlyHOA
    
    // Calculate DTI ratios
    const frontEndDTI = (totalMonthlyPayment / monthlyIncome) * 100
    const backEndDTI = ((totalMonthlyPayment + monthlyDebts) / monthlyIncome) * 100
    
    // Update state
    setMaxHomePrice(maxHomePrice)
    setMonthlyPayment(totalMonthlyPayment)
    setPaymentBreakdown({
      principalAndInterest,
      propertyTax: monthlyPropertyTax,
      insurance: monthlyInsurance,
      pmi: monthlyPMI,
      hoa: monthlyHOA
    })
    setDtiRatios({
      frontEnd: frontEndDTI,
      backEnd: backEndDTI
    })
    
  }, [
    monthlyIncome,
    monthlyDebts,
    monthlyExpenses,
    location,
    downPaymentPercent,
    interestRate,
    loanTerm,
    propertyTaxRate,
    insuranceRate,
    includeHOA,
    hoaFees,
    includePMI,
    pmiRate
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
    labels: ['Principal & Interest', 'Property Tax', 'Insurance', 'PMI', 'HOA'],
    datasets: [{
      data: [
        paymentBreakdown.principalAndInterest,
        paymentBreakdown.propertyTax,
        paymentBreakdown.insurance,
        paymentBreakdown.pmi,
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
        font: { weight: 'bold' },
        formatter: (value: number) => {
          const total = Object.values(paymentBreakdown).reduce((a, b) => a + b, 0)
          return ((value / total) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // DTI ratio chart
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
        label: 'Maximum Recommended',
        data: [28, 36],
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
          callback: (value) => {
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
        font: { weight: 'bold' },
        formatter: (value: number) => value.toFixed(1) + '%'
      }
    }
  }

  // Home price scenarios chart
  const generatePriceScenarios = () => {
    const scenarios = [
      { label: 'Conservative', factor: 0.9 },
      { label: 'Recommended', factor: 1.0 },
      { label: 'Aggressive', factor: 1.1 }
    ]

    return {
      labels: scenarios.map(s => s.label),
      datasets: [
        {
          label: 'Home Price',
          data: scenarios.map(s => maxHomePrice * s.factor),
          backgroundColor: chartColors.primary[0],
          borderColor: chartColors.secondary[0].replace('0.2', '1'),
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    }
  }

  const scenarioChartOptions: ChartOptions<'bar'> = {
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
        formatter: (value: number) => '$' + value.toLocaleString()
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
    pdf.save('house-affordability-results.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <HouseAffordabilitySchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        House Affordability <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Find out how much house you can afford based on your income, expenses, and other financial factors.
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
                    <CardTitle>Enter Your Financial Information</CardTitle>
                    <CardDescription>
                      Provide your income, expenses, and preferences to calculate your affordable home price range.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Income & Expenses */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Income & Expenses</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="monthly-income">Monthly Gross Income</Label>
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
                          <Label htmlFor="monthly-debts">Monthly Debt Payments</Label>
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
                    
                    {/* Monthly Living Expenses */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Monthly Living Expenses</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="groceries">Groceries</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="groceries"
                              type="number"
                              className="pl-9"
                              value={monthlyExpenses.groceries}
                              onChange={(e) => setMonthlyExpenses(prev => ({
                                ...prev,
                                groceries: Number(e.target.value)
                              }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transportation">Transportation</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="transportation"
                              type="number"
                              className="pl-9"
                              value={monthlyExpenses.transportation}
                              onChange={(e) => setMonthlyExpenses(prev => ({
                                ...prev,
                                transportation: Number(e.target.value)
                              }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="utilities">Utilities</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="utilities"
                              type="number"
                              className="pl-9"
                              value={monthlyExpenses.utilities}
                              onChange={(e) => setMonthlyExpenses(prev => ({
                                ...prev,
                                utilities: Number(e.target.value)
                              }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="insurance">Insurance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="insurance"
                              type="number"
                              className="pl-9"
                              value={monthlyExpenses.insurance}
                              onChange={(e) => setMonthlyExpenses(prev => ({
                                ...prev,
                                insurance: Number(e.target.value)
                              }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="entertainment">Entertainment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="entertainment"
                              type="number"
                              className="pl-9"
                              value={monthlyExpenses.entertainment}
                              onChange={(e) => setMonthlyExpenses(prev => ({
                                ...prev,
                                entertainment: Number(e.target.value)
                              }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="other">Other Expenses</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="other"
                              type="number"
                              className="pl-9"
                              value={monthlyExpenses.other}
                              onChange={(e) => setMonthlyExpenses(prev => ({
                                ...prev,
                                other: Number(e.target.value)
                              }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location & Credit */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Location & Credit</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location Cost</Label>
                          <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger id="location">
                              <SelectValue placeholder="Select location cost" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low Cost Area</SelectItem>
                              <SelectItem value="average">Average Cost Area</SelectItem>
                              <SelectItem value="high">High Cost Area</SelectItem>
                              <SelectItem value="veryHigh">Very High Cost Area</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                      </div>
                    </div>

                    {/* Loan Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Loan Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
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
                        {downPaymentPercent < 20 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="pmi-toggle">Include PMI</Label>
                              <Switch
                                id="pmi-toggle"
                                checked={includePMI}
                                onCheckedChange={setIncludePMI}
                              />
                            </div>
                            {includePMI && (
                              <div className="flex items-center justify-between">
                                <Label htmlFor="pmi-rate">PMI Rate</Label>
                                <span className="text-sm text-muted-foreground">{pmiRate}%</span>
                              </div>
                            )}
                            {includePMI && (
                              <Slider
                                id="pmi-rate"
                                min={0.3}
                                max={1.5}
                                step={0.1}
                                value={[pmiRate]}
                                onValueChange={(value) => setPmiRate(value[0])}
                              />
                            )}
                          </div>
                        )}
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
                      <p className="text-sm text-muted-foreground">Maximum Home Price</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(maxHomePrice)}</p>
                      <p className="text-sm text-muted-foreground">
                        Monthly Payment: {formatCurrency(monthlyPayment)}
                      </p>
                    
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Payment</TabsTrigger>
                        <TabsTrigger value="dti">DTI Ratios</TabsTrigger>
                        <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
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
                              <span className="text-sm">Property Tax</span>
                              <span className="font-medium">{formatCurrency(paymentBreakdown.propertyTax)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Insurance</span>
                              <span className="font-medium">{formatCurrency(paymentBreakdown.insurance)}</span>
                            </div>
                            {paymentBreakdown.pmi > 0 && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">PMI</span>
                                <span className="font-medium">{formatCurrency(paymentBreakdown.pmi)}</span>
                              </div>
                            )}
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

                      <TabsContent value="scenarios" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={generatePriceScenarios()} options={scenarioChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Different home price scenarios based on your financial profile
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Recommendations */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Affordability Analysis</p>
                            {dtiRatios.backEnd > 36 ? (
                              <p className="text-sm text-muted-foreground">
                                Your debt-to-income ratio is high. Consider reducing monthly debts or increasing your down payment to improve affordability.
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Based on your income and expenses, you can comfortably afford a home up to {formatCurrency(maxHomePrice)}. Your debt-to-income ratios are within recommended limits.
                              </p>
                            )}
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
            <h2 className="text-3xl font-bold text-center mb-8">Understanding House Affordability</h2>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="factors">
                <AccordionTrigger>Key Factors in Home Affordability</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Income and Debt</h4>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Monthly gross income</li>
                        <li>Monthly debt payments</li>
                        <li>Credit score and history</li>
                        <li>Employment stability</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Housing Costs</h4>
                      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Principal and interest payments</li>
                        <li>Property taxes</li>
                        <li>Homeowners insurance</li>
                        <li>Private Mortgage Insurance (PMI)</li>
                        <li>HOA fees (if applicable)</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ratios">
                <AccordionTrigger>Understanding DTI Ratios</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Front-End DTI Ratio</h4>
                      <p className="text-muted-foreground">
                        The percentage of your monthly income that goes toward housing costs. Lenders typically prefer this to be 28% or less.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Back-End DTI Ratio</h4>
                      <p className="text-muted-foreground">
                        The percentage of your monthly income that goes toward all debt payments, including housing. Should generally be 36% or less.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="down-payment">
                <AccordionTrigger>Down Payment Considerations</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>20% down payment avoids PMI</li>
                    <li>Lower down payments increase monthly costs</li>
                    <li>Consider down payment assistance programs</li>
                    <li>Factor in closing costs (2-5% of purchase price)</li>
                    <li>Keep emergency savings separate from down payment</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="location">
                <AccordionTrigger>Location Impact</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Property tax rates vary by location</li>
                    <li>Insurance costs differ by region</li>
                    <li>Consider commuting costs</li>
                    <li>Research neighborhood appreciation rates</li>
                    <li>Factor in local cost of living</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tips">
                <AccordionTrigger>Tips for Improving Affordability</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Pay down existing debt</li>
                    <li>Improve your credit score</li>
                    <li>Save for a larger down payment</li>
                    <li>Consider a longer loan term</li>
                    <li>Look for homes below your maximum budget</li>
                    <li>Research first-time homebuyer programs</li>
                    <li>Compare multiple lenders</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
                    Calculate your monthly mortgage payments based on loan amount, interest rate, and term.
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
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Rent vs. Buy Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compare the financial implications of renting versus buying a home.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/rent-vs-buy">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      <SaveCalculationButton calculatorType="house-affordability" inputs={{}} results={{}} />
      </main>
      <SiteFooter />
    </div>
  )
}