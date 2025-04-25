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
  DollarSign, Calculator, Download, Share2, PieChart, BarChart3, 
  RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Building,
  Home, Landmark, Wallet, ArrowRight, Percent, Clock, Tag, CircleDollarSign, ArrowLeftRight, CheckCircle, AlertTriangle, LightbulbIcon, MapPin, Receipt, Hammer, SearchIcon, X, XCircle, BarChart4, ChevronRight
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import { cn } from "@/lib/utils"
import RealEstateSchema from './schema';

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

export default function RealEstateCalculator() {
  // Property Details
  const [propertyValue, setPropertyValue] = useState(300000)
  const [propertyType, setPropertyType] = useState("residential")
  const [downPayment, setDownPayment] = useState(60000)
  const [interestRate, setInterestRate] = useState(6.5)
  const [loanTerm, setLoanTerm] = useState(30)
  
  // Income & Expenses
  const [monthlyRent, setMonthlyRent] = useState(2500)
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2)
  const [insuranceRate, setInsuranceRate] = useState(0.5)
  const [maintenanceRate, setMaintenanceRate] = useState(1)
  const [vacancyRate, setVacancyRate] = useState(5)
  const [managementFee, setManagementFee] = useState(10)
  const [hoaFees, setHoaFees] = useState(250)
  const [utilities, setUtilities] = useState(200)
  
  // Purchase Costs
  const [closingCosts, setClosingCosts] = useState(3)
  const [repairCosts, setRepairCosts] = useState(5000)
  const [furnishingCosts, setFurnishingCosts] = useState(0)
  
  // Appreciation & Growth
  const [appreciationRate, setAppreciationRate] = useState(3)
  const [rentGrowthRate, setRentGrowthRate] = useState(2)
  const [expenseGrowthRate, setExpenseGrowthRate] = useState(2)
  
  // Results State
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [cashFlow, setCashFlow] = useState(0)
  const [capRate, setCapRate] = useState(0)
  const [cashOnCashReturn, setCashOnCashReturn] = useState(0)
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [roi, setRoi] = useState(0)
  const [breakEvenMonths, setBreakEvenMonths] = useState(0)
  const [projections, setProjections] = useState<{
    propertyValue: number[];
    netIncome: number[];
    expenses: number[];
    equity: number[];
  }>({
    propertyValue: [],
    netIncome: [],
    expenses: [],
    equity: []
  })

  // Calculate all metrics when inputs change
  useEffect(() => {
    // Calculate loan amount and monthly payment
    const loanAmount = propertyValue - downPayment
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12
    
    const monthlyMortgage = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    
    // Calculate monthly expenses
    const monthlyPropertyTax = (propertyValue * (propertyTaxRate / 100)) / 12
    const monthlyInsurance = (propertyValue * (insuranceRate / 100)) / 12
    const monthlyMaintenance = (propertyValue * (maintenanceRate / 100)) / 12
    const monthlyVacancy = (monthlyRent * (vacancyRate / 100))
    const monthlyManagement = (monthlyRent * (managementFee / 100))
    
    const totalMonthlyExpenses = monthlyMortgage + 
      monthlyPropertyTax + 
      monthlyInsurance + 
      monthlyMaintenance + 
      monthlyVacancy + 
      monthlyManagement + 
      hoaFees + 
      utilities
    
    // Calculate monthly cash flow
    const monthlyCashFlow = monthlyRent - totalMonthlyExpenses
    
    // Calculate total investment
    const totalClosingCosts = (propertyValue * (closingCosts / 100))
    const totalInvestmentAmount = downPayment + totalClosingCosts + repairCosts + furnishingCosts
    
    // Calculate ROI metrics
    const annualCashFlow = monthlyCashFlow * 12
    const annualROI = (annualCashFlow / totalInvestmentAmount) * 100
    
    // Calculate Cap Rate
    const netOperatingIncome = (monthlyRent * 12) - 
      ((monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + 
        monthlyVacancy + monthlyManagement + hoaFees + utilities) * 12)
    const capRateValue = (netOperatingIncome / propertyValue) * 100
    
    // Calculate Cash on Cash Return
    const cashOnCashReturnValue = (annualCashFlow / totalInvestmentAmount) * 100
    
    // Calculate break-even point
    const monthlyEquityGain = monthlyMortgage - (loanAmount * monthlyRate)
    const totalMonthlyBenefit = monthlyCashFlow + monthlyEquityGain + 
      (propertyValue * (appreciationRate / 100 / 12))
    const breakEvenPeriod = Math.ceil(totalInvestmentAmount / totalMonthlyBenefit)
    
    // Generate 30-year projections
    const propertyValueProjection = []
    const netIncomeProjection = []
    const expensesProjection = []
    const equityProjection = []
    
    let currentPropertyValue = propertyValue
    let currentRent = monthlyRent
    let currentExpenses = totalMonthlyExpenses
    let remainingLoanBalance = loanAmount
    
    for (let year = 0; year <= 30; year++) {
      propertyValueProjection.push(currentPropertyValue)
      netIncomeProjection.push(currentRent * 12)
      expensesProjection.push(currentExpenses * 12)
      equityProjection.push(currentPropertyValue - remainingLoanBalance)
      
      currentPropertyValue *= (1 + appreciationRate / 100)
      currentRent *= (1 + rentGrowthRate / 100)
      currentExpenses *= (1 + expenseGrowthRate / 100)
      remainingLoanBalance *= (1 - monthlyEquityGain / remainingLoanBalance)
    }
    
    // Update state with calculations
    setMonthlyPayment(monthlyMortgage)
    setCashFlow(monthlyCashFlow)
    setCapRate(capRateValue)
    setCashOnCashReturn(cashOnCashReturnValue)
    setTotalInvestment(totalInvestmentAmount)
    setRoi(annualROI)
    setBreakEvenMonths(breakEvenPeriod)
    setProjections({
      propertyValue: propertyValueProjection,
      netIncome: netIncomeProjection,
      expenses: expensesProjection,
      equity: equityProjection
    })
    
  }, [
    propertyValue,
    propertyType,
    downPayment,
    interestRate,
    loanTerm,
    monthlyRent,
    propertyTaxRate,
    insuranceRate,
    maintenanceRate,
    vacancyRate,
    managementFee,
    hoaFees,
    utilities,
    closingCosts,
    repairCosts,
    furnishingCosts,
    appreciationRate,
    rentGrowthRate,
    expenseGrowthRate
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

  // Monthly cash flow breakdown chart
  const cashFlowChartData = {
    labels: ['Income', 'Mortgage', 'Taxes & Insurance', 'Maintenance', 'Management', 'Other'],
    datasets: [{
      data: [
        monthlyRent,
        monthlyPayment,
        (propertyValue * (propertyTaxRate + insuranceRate) / 100 / 12),
        (propertyValue * maintenanceRate / 100 / 12),
        (monthlyRent * managementFee / 100),
        hoaFees + utilities
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
          return formatCurrency(value)
        }
      }
    }
  }

  // Investment metrics chart
  const metricsChartData = {
    labels: ['Cap Rate', 'Cash on Cash Return', 'ROI'],
    datasets: [
      {
        label: 'Current',
        data: [capRate, cashOnCashReturn, roi],
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
        formatter: (value: number) => value.toFixed(1) + '%'
      }
    }
  }

  // 30-year projection chart
  const projectionChartData = {
    labels: Array.from({ length: 31 }, (_, i) => `Year ${i}`),
    datasets: [
      {
        label: 'Property Value',
        data: projections.propertyValue,
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      },
      {
        label: 'Net Income',
        data: projections.netIncome,
        borderColor: chartColors.primary[1],
        backgroundColor: chartColors.secondary[1],
        tension: 0.4
      },
      {
        label: 'Equity',
        data: projections.equity,
        borderColor: chartColors.primary[2],
        backgroundColor: chartColors.secondary[2],
        tension: 0.4
      }
    ]
  }

  const lineChartOptions: ChartOptions<'line'> = {
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
    pdf.save('real-estate-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <RealEstateSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Real Estate <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Analyze real estate investments with comprehensive metrics including cash flow, ROI, and long-term projections.
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
                    <CardTitle>Enter Property Details</CardTitle>
                    <CardDescription>
                      Provide information about the property and investment details to analyze potential returns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Property Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Property Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="property-value">Property Value</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="property-value"
                              type="number"
                              className="pl-9"
                              value={propertyValue}
                              onChange={(e) => setPropertyValue(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="property-type">Property Type</Label>
                          <Select value={propertyType} onValueChange={setPropertyType}>
                            <SelectTrigger id="property-type">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="residential">Single Family</SelectItem>
                              <SelectItem value="multi">Multi-Family</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="condo">Condominium</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="down-payment">Down Payment</Label>
                            <span className="text-sm text-muted-foreground">
                              {((downPayment / propertyValue) * 100).toFixed(1)}%
                            </span>
                          </div>
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

                    {/* Income & Expenses */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Income & Expenses</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="monthly-rent">Monthly Rent</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="monthly-rent"
                              type="number"
                              className="pl-9"
                              value={monthlyRent}
                              onChange={(e) => setMonthlyRent(Number(e.target.value))}
                            />
                          </div>
                        </div>
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
                          <div className="flex items-center justify-between">
                            <Label htmlFor="vacancy-rate">Vacancy Rate</Label>
                            <span className="text-sm text-muted-foreground">{vacancyRate}%</span>
                          </div>
                          <Slider
                            id="vacancy-rate"
                            min={0}
                            max={15}
                            step={1}
                            value={[vacancyRate]}
                            onValueChange={(value) => setVacancyRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="management-fee">Management Fee</Label>
                            <span className="text-sm text-muted-foreground">{managementFee}%</span>
                          </div>
                          <Slider
                            id="management-fee"
                            min={0}
                            max={15}
                            step={1}
                            value={[managementFee]}
                            onValueChange={(value) => setManagementFee(value[0])}
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
                              value={hoaFees}
                              onChange={(e) => setHoaFees(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="utilities">Monthly Utilities</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="utilities"
                              type="number"
                              className="pl-9"
                              value={utilities}
                              onChange={(e) => setUtilities(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Costs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Purchase Costs</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="closing-costs">Closing Costs</Label>
                            <span className="text-sm text-muted-foreground">{closingCosts}%</span>
                          </div>
                          <Slider
                            id="closing-costs"
                            min={2}
                            max={6}
                            step={0.5}
                            value={[closingCosts]}
                            onValueChange={(value) => setClosingCosts(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="repair-costs">Repair/Renovation Costs</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="repair-costs"
                              type="number"
                              className="pl-9"
                              value={repairCosts}
                              onChange={(e) => setRepairCosts(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="furnishing-costs">Furnishing Costs</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="furnishing-costs"
                              type="number"
                              className="pl-9"
                              value={furnishingCosts}
                              onChange={(e) => setFurnishingCosts(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Appreciation & Growth */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Appreciation & Growth</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="appreciation-rate">Property Appreciation Rate</Label>
                            <span className="text-sm text-muted-foreground">{appreciationRate}%</span>
                          </div>
                          <Slider
                            id="appreciation-rate"
                            min={0}
                            max={10}
                            step={0.5}
                            value={[appreciationRate]}
                            onValueChange={(value) => setAppreciationRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="rent-growth">Annual Rent Growth</Label>
                            <span className="text-sm text-muted-foreground">{rentGrowthRate}%</span>
                          </div>
                          <Slider
                            id="rent-growth"
                            min={0}
                            max={10}
                            step={0.5}
                            value={[rentGrowthRate]}
                            onValueChange={(value) => setRentGrowthRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="expense-growth">Annual Expense Growth</Label>
                            <span className="text-sm text-muted-foreground">{expenseGrowthRate}%</span>
                          </div>
                          <Slider
                            id="expense-growth"
                            min={0}
                            max={10}
                            step={0.5}
                            value={[expenseGrowthRate]}
                            onValueChange={(value) => setExpenseGrowthRate(value[0])}
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
                      <CardTitle>Investment Analysis</CardTitle>
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
                        <p className="text-sm text-muted-foreground">Monthly Cash Flow</p>
                        <p className={cn(
                          "text-2xl font-bold",
                          cashFlow >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {formatCurrency(cashFlow)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Investment</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalInvestment)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="cashflow" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                        <TabsTrigger value="metrics">Metrics</TabsTrigger>
                        <TabsTrigger value="projection">Projection</TabsTrigger>
                      </TabsList>

                      <TabsContent value="cashflow" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={cashFlowChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Monthly Cash Flow Details</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Rental Income</span>
                              <span className="font-medium text-green-500">{formatCurrency(monthlyRent)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Mortgage Payment</span>
                              <span className="font-medium text-red-500">-{formatCurrency(monthlyPayment)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Property Tax & Insurance</span>
                              <span className="font-medium text-red-500">
                                -{formatCurrency((propertyValue * (propertyTaxRate + insuranceRate) / 100 / 12))}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Maintenance</span>
                              <span className="font-medium text-red-500">
                                -{formatCurrency((propertyValue * maintenanceRate / 100 / 12))}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Property Management</span>
                              <span className="font-medium text-red-500">
                                -{formatCurrency((monthlyRent * managementFee / 100))}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">HOA & Utilities</span>
                              <span className="font-medium text-red-500">
                                -{formatCurrency(hoaFees + utilities)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Net Cash Flow</span>
                              <span className={cashFlow >= 0 ? "text-green-500" : "text-red-500"}>
                                {formatCurrency(cashFlow)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="metrics" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={metricsChartData} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Investment Metrics</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Cap Rate</span>
                              <span className="font-medium">{formatPercent(capRate)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Cash on Cash Return</span>
                              <span className="font-medium">{formatPercent(cashOnCashReturn)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Return on Investment (ROI)</span>
                              <span className="font-medium">{formatPercent(roi)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Break-even Period</span>
                              <span className="font-medium">
                                {Math.floor(breakEvenMonths / 12)} years, {breakEvenMonths % 12} months
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="projection" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={projectionChartData} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">30-Year Projection</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Property Value in 30 Years</span>
                              <span className="font-medium">{formatCurrency(projections.propertyValue[30])}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Annual Income in 30 Years</span>
                              <span className="font-medium">{formatCurrency(projections.netIncome[30])}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Equity in 30 Years</span>
                              <span className="font-medium">{formatCurrency(projections.equity[30])}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Investment Summary */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Investment Summary</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Monthly cash flow: {formatCurrency(cashFlow)}</li>
                              <li>• Cap rate: {formatPercent(capRate)}</li>
                              <li>• Cash on cash return: {formatPercent(cashOnCashReturn)}</li>
                              <li>• Break-even in {Math.floor(breakEvenMonths / 12)} years, {breakEvenMonths % 12} months</li>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Real Estate Analysis</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Smart Real Estate Decisions: The Numbers Behind Property Investment</h2>
        <p className="mt-3 text-muted-foreground text-lg">Unlock the financial aspects of buying, selling, and investing in real estate</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Real Estate Calculations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                Real estate represents one of the largest financial commitments most people will make in their lifetime. Whether you're purchasing a primary residence, investing in rental properties, or considering commercial real estate, <strong>numbers-driven decisions</strong> are essential for success.
              </p>
              <p className="mt-3">
                In 2025, with the average U.S. home price exceeding <strong>$425,000</strong> and mortgage rates fluctuating between <strong>5.5-7%</strong>, understanding how to accurately calculate costs, returns, and financial scenarios has never been more important.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Why Use a Real Estate Calculator?</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>• Avoid costly financial miscalculations</li>
                  <li>• Compare properties on a true financial basis</li>
                  <li>• Understand the full cost of ownership</li>
                  <li>• Project realistic investment returns</li>
                  <li>• Make data-driven negotiation decisions</li>
                </ul>
              </div>
            </div>
            
            <div className="h-[250px]">
              <h4 className="text-center text-sm font-medium mb-2">Median Home Price Trends (2020-2025)</h4>
              <Line 
                data={{
                  labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
                  datasets: [{
                    label: 'Median Home Price',
                    data: [320000, 350000, 385000, 395000, 410000, 425000],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    tension: 0.4,
                    fill: true
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      ticks: { callback: (value) => '$' + value.toLocaleString() }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <CircleDollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Purchase Decisions</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Calculate true affordability, monthly payments, and ownership costs
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Building className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Investment Analysis</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Project ROI, rental yields, and long-term value appreciation
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <ArrowLeftRight className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Buy vs. Rent Analysis</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Compare the true costs and benefits of renting versus buying
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Core Real Estate Calculations */}
      <div className="mb-10" id="core-calculations">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Essential Real Estate Calculations
        </h2>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              Mortgage Calculations
            </CardTitle>
            <CardDescription>Understanding the true cost of financing your property</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Monthly Payment Formula</h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="mb-2 font-mono text-sm">
                    P = L[c(1 + c)<sup>n</sup>]/[(1 + c)<sup>n</sup> - 1]
                  </p>
                  <ul className="text-sm space-y-1">
                    <li><strong>P</strong> = Monthly payment</li>
                    <li><strong>L</strong> = Loan amount</li>
                    <li><strong>c</strong> = Monthly interest rate (annual rate ÷ 12)</li>
                    <li><strong>n</strong> = Total number of payments (years × 12)</li>
                  </ul>
                </div>
                
                <div className="mt-4 space-y-2">
                  <p>The mortgage payment calculation includes several components:</p>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span><strong>Principal:</strong> Repayment of the loan balance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span><strong>Interest:</strong> Cost of borrowing the money</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span><strong>Property taxes:</strong> Often included in monthly payment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span><strong>Insurance:</strong> Homeowner's and possibly mortgage insurance</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="h-[220px]">
                  <h4 className="text-center text-sm font-medium mb-2">Monthly Payment Comparison by Interest Rate</h4>
                  <Bar 
                    data={{
                      labels: ['4%', '5%', '6%', '7%', '8%'],
                      datasets: [{
                        label: '$350,000 Loan (30yr)',
                        data: [1670, 1879, 2098, 2329, 2568],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(79, 70, 229, 0.7)',
                          'rgba(139, 92, 246, 0.7)',
                          'rgba(236, 72, 153, 0.7)',
                          'rgba(239, 68, 68, 0.7)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => '$' + value }
                        }
                      }
                    }}
                  />
                </div>
                
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Key Insight:</strong> A 1% increase in your mortgage rate can increase your monthly payment by approximately 10-12% and add tens of thousands in interest over the life of your loan.
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Interest Over Time:</strong> On a $350,000 30-year mortgage at 6%, you'll pay approximately $405,000 in interest—more than the original loan amount.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              Investment Property Analysis
            </CardTitle>
            <CardDescription>Evaluating the financial potential of income properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Cash Flow Analysis</h3>
                  <p className="mb-2">
                    Understanding monthly cash flow is essential for evaluating rental properties. The calculation factors in all income and expenses:
                  </p>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      Monthly Cash Flow = Total Income − Total Expenses
                    </p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="py-2 px-3 text-left font-medium text-gray-500 dark:text-gray-300">Income/Expense Category</th>
                        <th className="py-2 px-3 text-left font-medium text-gray-500 dark:text-gray-300">Example Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr className="bg-green-50 dark:bg-green-900/20">
                        <td className="py-2 px-3 font-medium text-green-700 dark:text-green-400">Monthly Rent Income</td>
                        <td className="py-2 px-3">$2,500</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Mortgage Payment</td>
                        <td className="py-2 px-3">$1,450</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Property Taxes</td>
                        <td className="py-2 px-3">$250</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Insurance</td>
                        <td className="py-2 px-3">$120</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Property Management (8%)</td>
                        <td className="py-2 px-3">$200</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Maintenance Reserve (5%)</td>
                        <td className="py-2 px-3">$125</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Vacancy Reserve (5%)</td>
                        <td className="py-2 px-3">$125</td>
                      </tr>
                      <tr className="bg-blue-50 dark:bg-blue-900/20">
                        <td className="py-2 px-3 font-medium text-blue-700 dark:text-blue-400">Monthly Cash Flow</td>
                        <td className="py-2 px-3 font-medium text-blue-700 dark:text-blue-400">$230</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Many beginning investors underestimate expenses like maintenance, vacancies, and capital expenditures, leading to negative cash flow situations.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-medium mb-3">Return on Investment Metrics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm">Cap Rate</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Net Operating Income ÷ Property Value × 100%
                        </p>
                        <p className="mt-2 font-medium">Target: 5-10%</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm">Cash-on-Cash Return</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Annual Cash Flow ÷ Total Cash Invested × 100%
                        </p>
                        <p className="mt-2 font-medium">Target: 8-12%</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm">Gross Rent Multiplier</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Property Price ÷ Annual Gross Rental Income
                        </p>
                        <p className="mt-2 font-medium">Target: 6-10</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-amber-500">
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm">1% Rule</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Monthly Rent ≥ 1% of Purchase Price
                        </p>
                        <p className="mt-2 font-medium">Quick screening tool</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="h-[180px]">
                  <h4 className="text-center text-sm font-medium mb-2">Components of Total Return</h4>
                  <Pie 
                    data={{
                      labels: ['Cash Flow', 'Loan Paydown', 'Appreciation', 'Tax Benefits'],
                      datasets: [{
                        data: [25, 20, 45, 10],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(139, 92, 246, 0.8)',
                          'rgba(245, 158, 11, 0.8)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8 } },
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
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-purple-600" />
                Buy vs. Rent Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                The buy vs. rent decision involves complex trade-offs between financial and lifestyle factors. Our calculator considers:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm font-medium">Upfront Costs</span>
                  <span className="text-sm">Down payment vs. security deposit</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm font-medium">Monthly Payments</span>
                  <span className="text-sm">Mortgage vs. rent + potential increases</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm font-medium">Tax Implications</span>
                  <span className="text-sm">Mortgage interest & property tax deductions</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm font-medium">Equity Building</span>
                  <span className="text-sm">Principal payments + appreciation</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm font-medium">Maintenance Costs</span>
                  <span className="text-sm">Owner-paid vs. landlord-covered</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Breakeven Timeline:</strong> The time required for buying to become financially advantageous over renting, typically 3-7 years in most markets.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Affordability Calculations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Lenders use several key ratios to determine how much mortgage you qualify for:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Front-End Ratio (Housing Ratio)</h4>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">
                      Monthly Housing Costs ÷ Monthly Gross Income
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-500">
                      Traditional target: No more than 28% of gross monthly income
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Back-End Ratio (Debt-to-Income)</h4>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">
                      (Housing Costs + Other Debt Payments) ÷ Monthly Gross Income
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-500">
                      Traditional target: No more than 36% of gross monthly income
                    </p>
                  </div>
                </div>
                
                <div className="h-[140px]">
                  <Bar 
                    data={{
                      labels: ['$75K Income', '$100K Income', '$150K Income', '$200K Income'],
                      datasets: [{
                        label: 'Maximum Affordable Home Price',
                        data: [325000, 435000, 650000, 870000],
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => `$${context.parsed.y.toLocaleString()}`
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { 
                            callback: (value) => '$' + (value as number / 1000) + 'K'
                          }
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  *Based on 20% down payment, 6% interest rate, and 28% front-end ratio
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Considerations */}
      <div className="mb-10" id="advanced-considerations">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <LightbulbIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Advanced Real Estate Considerations</span>
              </div>
            </CardTitle>
            <CardDescription>
              Beyond the basic calculations: factors that impact long-term outcomes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="appreciation-projections" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Property Appreciation and Market Trends
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    <strong>Property appreciation</strong> represents a substantial portion of real estate returns, but it varies significantly based on location, economic conditions, and property characteristics.
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Factors Affecting Appreciation Rates:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Location:</strong> Neighborhood desirability, school quality, employment opportunities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Economic conditions:</strong> Job growth, income trends, population dynamics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Home className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Property characteristics:</strong> Size, condition, amenities, energy efficiency</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Building className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Supply constraints:</strong> Zoning laws, available land, construction costs</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 border border-green-200 dark:border-green-900 rounded-md bg-green-50 dark:bg-green-900/20">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      <strong>Historical Context:</strong> The average annual home price appreciation in the U.S. has been approximately 3.5-4% over the long term (above inflation), though with significant variation by market and time period.
                    </p>
                  </div>
                </div>
                
                <div className="h-[260px]">
                  <h4 className="text-center text-sm font-medium mb-2">Appreciation Rate Impact on $400,000 Property</h4>
                  <Line 
                    data={{
                      labels: ['Year 0', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
                      datasets: [
                        {
                          label: '2% Annual Appreciation',
                          data: [400000, 441624, 487689, 538450, 594414, 656153, 724460],
                          borderColor: 'rgba(16, 185, 129, 0.8)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          tension: 0.4
                        },
                        {
                          label: '3% Annual Appreciation',
                          data: [400000, 463698, 537566, 623368, 722784, 838020, 971227],
                          borderColor: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4
                        },
                        {
                          label: '4% Annual Appreciation',
                          data: [400000, 486755, 592296, 720950, 877090, 1066646, 1297555],
                          borderColor: 'rgba(139, 92, 246, 0.8)',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } }
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                          ticks: { callback: (value) => '$' + (value as number / 1000) + 'K' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Caution:</strong> While real estate has historically appreciated over long time horizons, short-term market corrections do occur. Conservative projections (2-3% annually) are recommended for investment analysis.
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="tax-implications" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Tax Implications of Real Estate
                </h3>
                <p>
                  Tax considerations play a major role in the overall financial picture of real estate ownership and can significantly impact investment returns.
                </p>
                
                <div className="mt-4 space-y-3">
                  <h4 className="font-medium">Key Tax Benefits:</h4>
                  
                  <div className="space-y-3">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-3">
                        <h5 className="font-medium text-sm">Mortgage Interest Deduction</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          Homeowners can deduct mortgage interest on up to $750,000 of qualified residence loans (for homes purchased after Dec. 15, 2017).
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-3">
                        <h5 className="font-medium text-sm">Property Tax Deduction</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          State and local property taxes are deductible up to $10,000 combined with other state and local taxes.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="p-3">
                        <h5 className="font-medium text-sm">Capital Gains Exclusion</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          Up to $250,000 ($500,000 for married couples) of capital gains on your primary residence can be excluded if you've lived there for 2+ years.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-amber-500">
                      <CardContent className="p-3">
                        <h5 className="font-medium text-sm">Rental Property Deductions</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          Investors can deduct operating expenses, depreciation, and potentially qualify for pass-through income deductions.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mt-1">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      <strong>Tax Strategy Tip:</strong> Always consult with a tax professional for personalized advice, as tax laws change and benefits phase out at certain income levels.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="renovation-roi" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <Hammer className="h-5 w-5" />
                  Renovation ROI Analysis
                </h3>
                <p>
                  Not all home improvements are created equal when it comes to return on investment. Understanding which renovations deliver the best financial returns is crucial.
                </p>
                
                <div className="mt-4 h-[260px]">
                  <h4 className="text-center text-sm font-medium mb-2">Average ROI by Renovation Type (2025)</h4>
                  <Bar 
                    data={{
                      labels: ['Kitchen Remodel', 'Bathroom Remodel', 'Deck Addition', 'Siding Replacement', 'Attic Insulation', 'Window Replacement'],
                      datasets: [{
                        label: 'Return on Investment (%)',
                        data: [70, 65, 72, 77, 108, 68],
                        backgroundColor: [
                          'rgba(139, 92, 246, 0.7)',
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(16, 185, 129, 0.7)',
                          'rgba(245, 158, 11, 0.7)',
                          'rgba(239, 68, 68, 0.7)',
                          'rgba(6, 182, 212, 0.7)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => value + '%' }
                        }
                      }
                    }}
                  />
                </div>
                
                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    <strong>ROI Calculation:</strong> (Increase in Property Value ÷ Cost of Improvement) × 100%
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                    Note: ROI varies significantly by region, property type, and quality of workmanship.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Using the Calculator */}
      <div className="mb-10" id="calculator-guide">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Getting the Most from Your Real Estate Calculator
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Guidance</CardTitle>
              <CardDescription>
                Tips for accurate real estate projections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <SearchIcon className="h-4 w-4 text-blue-600" />
                  Research Accurate Property Data
                </h4>
                <p className="text-sm text-muted-foreground">
                  Use current market comps, property tax records, and recent sales data to inform your inputs rather than relying on estimates.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-600" />
                  Include All Costs
                </h4>
                <p className="text-sm text-muted-foreground">
                  Account for closing costs (3-6%), ongoing maintenance (1-3% annually), property taxes, insurance, and potential HOA fees.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <X className="h-4 w-4 text-blue-600" />
                  Avoid Common Errors
                </h4>
                <p className="text-sm text-muted-foreground">
                  Don't overestimate appreciation, underestimate expenses, or forget to include vacancy rates for investment properties.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-blue-600" />
                  Model Different Scenarios
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create best-case, likely-case, and worst-case scenarios to understand the range of possible outcomes.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Decision Framework</CardTitle>
              <CardDescription>
                How to apply calculator insights to your decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Home className="h-4 w-4 text-blue-600" />
                  Primary Residence Decisions
                </h4>
                <p className="text-sm text-muted-foreground">
                  Focus on affordability, monthly payment comfort, and long-term staying power rather than pure investment metrics.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  Investment Property Analysis
                </h4>
                <p className="text-sm text-muted-foreground">
                  Compare projected returns against alternative investments and ensure cash flow provides adequate buffer for vacancies and repairs.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  Financing Optimization
                </h4>
                <p className="text-sm text-muted-foreground">
                  Use the calculator to compare different loan terms, down payment amounts, and interest rates to optimize your financing strategy.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mt-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Pro Tip:</strong> Remember that even the best calculators can't capture all subjective benefits like pride of ownership, customization freedom, and housing stability. Factor these non-financial aspects into your final decision.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Common Mistakes */}
      <div className="mb-10" id="common-mistakes">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Common Real Estate Calculation Mistakes
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader className="bg-amber-50 dark:bg-amber-900/30">
              <CardTitle className="text-lg">Financial Oversights</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Focusing only on the monthly mortgage payment</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The true cost of homeownership includes property taxes, insurance, maintenance, repairs, and utilities. These can add 30-50% to your monthly housing costs.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Underestimating closing costs</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Between loan origination fees, title insurance, appraisal, inspection, and other costs, closing costs typically run 3-6% of the loan amount.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Ignoring opportunity costs</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The money used for a down payment could be invested elsewhere. A complete analysis should compare potential returns from all investment options.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader className="bg-amber-50 dark:bg-amber-900/30">
              <CardTitle className="text-lg">Investment Property Mistakes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Forgetting about vacancies</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Even in strong rental markets, properties don't stay 100% occupied. Budget for 5-8% vacancy rate in your calculations.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Neglecting capital expenditures</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Major systems (roof, HVAC, appliances) will need replacement eventually. Reserve at least 5% of rental income for these large future expenses.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Overestimating appreciation</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Counting on aggressive appreciation rates to justify a poor cash-flowing property is speculation, not investment. Ensure properties make financial sense even with conservative appreciation.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-100 dark:border-amber-900">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            <div>
              <h4 className="font-medium text-lg text-amber-800 dark:text-amber-300">Beware of Analysis Paralysis</h4>
              <p className="mt-2 text-amber-700 dark:text-amber-400">
                While thorough analysis is important, perfect information is impossible. At some point, you need to make decisions with the best information available. Remember that real estate is typically a long-term investment, and minor calculation errors tend to be smoothed out over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <BarChart4 className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Making Data-Driven Real Estate Decisions
            </CardTitle>
            <CardDescription>
              The power of analysis in real estate success
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Real estate calculators</strong> provide the analytical foundation for sound property decisions. By quantifying costs, returns, and risks, these tools transform complex financial considerations into clear insights that support confident action. Whether you're a first-time homebuyer, a seasoned investor, or somewhere in between, the ability to run accurate projections gives you a significant advantage in a market where mistakes can be costly.
            </p>
            
            <p className="mt-4" id="next-steps">
              As you move forward with your real estate journey, remember these key principles:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">For Homebuyers</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Look beyond the purchase price to understand total ownership costs</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Run affordability calculations before beginning your home search</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Compare the long-term financial impact of different properties</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">For Investors</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Focus on cash flow first, with appreciation as a secondary benefit</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Apply multiple valuation methods to cross-verify investment potential</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Stress-test investments against various market scenarios</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to analyze your real estate opportunities?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Real Estate Calculator</strong> above to run comprehensive property analyses! For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/mortgage">
                        <Home className="h-4 w-4 mr-1" />
                        Mortgage Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/refinance">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refinance Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/affordability">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Home Affordability
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
                    Calculate monthly mortgage payments and see amortization schedules.
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
                  <CardTitle className="text-lg">Rent vs. Buy Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compare the financial implications of renting versus buying a property.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/rent-vs-buy">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Investment ROI Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate return on investment for various investment scenarios.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/roi">Try Calculator</Link>
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