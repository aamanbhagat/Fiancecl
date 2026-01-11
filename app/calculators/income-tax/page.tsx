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
// Updated import with ArrowLeftRight
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Briefcase, Building, CreditCard, Wallet, GraduationCap, Heart, Home, Gift, FileText, Percent, Minus, Users, ArrowUpDown, ArrowLeftRight, Clock, Calendar } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import IncomeTaxSchema from './schema';

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

// Define tax brackets for 2024
const TAX_BRACKETS_2024 = {
  single: [
    { rate: 0.10, limit: 11600 },
    { rate: 0.12, limit: 47150 },
    { rate: 0.22, limit: 100525 },
    { rate: 0.24, limit: 191950 },
    { rate: 0.32, limit: 243725 },
    { rate: 0.35, limit: 609350 },
    { rate: 0.37, limit: Infinity }
  ],
  married: [
    { rate: 0.10, limit: 23200 },
    { rate: 0.12, limit: 94300 },
    { rate: 0.22, limit: 201050 },
    { rate: 0.24, limit: 383900 },
    { rate: 0.32, limit: 487450 },
    { rate: 0.35, limit: 731200 },
    { rate: 0.37, limit: Infinity }
  ],
  head: [
    { rate: 0.10, limit: 16550 },
    { rate: 0.12, limit: 63100 },
    { rate: 0.22, limit: 100500 },
    { rate: 0.24, limit: 191950 },
    { rate: 0.32, limit: 243700 },
    { rate: 0.35, limit: 609350 },
    { rate: 0.37, limit: Infinity }
  ]
}

// Standard deductions for 2024
const STANDARD_DEDUCTIONS = {
  single: 14600,
  married: 29200,
  head: 21900
}

export default function IncomeTaxCalculator() {
  // Personal Information
  const [filingStatus, setFilingStatus] = useState<'single' | 'married' | 'head'>('single')
  const [age, setAge] = useState<number>(30)
  const [isBlind, setIsBlind] = useState<boolean>(false)
  
  // Income Details
  const [wagesIncome, setWagesIncome] = useState<number>(75000)
  const [businessIncome, setBusinessIncome] = useState<number>(0)
  const [investmentIncome, setInvestmentIncome] = useState<number>(0)
  const [otherIncome, setOtherIncome] = useState<number>(0)
  
  // Adjustments
  const [retirement401k, setRetirement401k] = useState<number>(0)
  const [ira, setIra] = useState<number>(0)
  const [studentLoanInterest, setStudentLoanInterest] = useState<number>(0)
  const [hsa, setHsa] = useState<number>(0)
  
  // Deductions
  const [useItemized, setUseItemized] = useState<boolean>(false)
  const [mortgageInterest, setMortgageInterest] = useState<number>(0)
  const [propertyTax, setPropertyTax] = useState<number>(0)
  const [charitableDonations, setCharitableDonations] = useState<number>(0)
  const [medicalExpenses, setMedicalExpenses] = useState<number>(0)
  
  // Tax Credits
  const [childTaxCredit, setChildTaxCredit] = useState<number>(0)
  const [childCareCredit, setChildCareCredit] = useState<number>(0)
  const [educationCredit, setEducationCredit] = useState<number>(0)
  const [otherCredits, setOtherCredits] = useState<number>(0)
  
  // Results State
  const [grossIncome, setGrossIncome] = useState<number>(0)
  const [adjustedGrossIncome, setAdjustedGrossIncome] = useState<number>(0)
  const [taxableIncome, setTaxableIncome] = useState<number>(0)
  const [totalTax, setTotalTax] = useState<number>(0)
  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(0)
  const [marginalTaxRate, setMarginalTaxRate] = useState<number>(0)
  const [taxByBracket, setTaxByBracket] = useState<{
    bracket: number;
    tax: number;
    income: number;
  }[]>([])

  // Calculate all tax details
  useEffect(() => {
    // Calculate total income
    const totalIncome = wagesIncome + businessIncome + investmentIncome + otherIncome
    setGrossIncome(totalIncome)
    
    // Calculate adjustments
    const totalAdjustments = retirement401k + ira + studentLoanInterest + hsa
    const agi = totalIncome - totalAdjustments
    setAdjustedGrossIncome(agi)
    
    // Calculate deductions
    const standardDeduction = STANDARD_DEDUCTIONS[filingStatus]
    const itemizedDeduction = mortgageInterest + propertyTax + charitableDonations + medicalExpenses
    const totalDeductions = useItemized ? itemizedDeduction : standardDeduction
    
    // Calculate taxable income
    const calculatedTaxableIncome = Math.max(0, agi - totalDeductions)
    setTaxableIncome(calculatedTaxableIncome)
    
    // Calculate tax by bracket
    const brackets = TAX_BRACKETS_2024[filingStatus]
    let remainingIncome = calculatedTaxableIncome
    let previousLimit = 0
    let totalTaxAmount = 0
    let lastRate = 0
    
    const taxBreakdown = brackets.map(bracket => {
      const incomeInBracket = Math.min(
        Math.max(0, remainingIncome),
        bracket.limit - previousLimit
      )
      const taxInBracket = incomeInBracket * bracket.rate
      
      if (remainingIncome > 0) {
        lastRate = bracket.rate
      }
      
      remainingIncome -= incomeInBracket
      totalTaxAmount += taxInBracket
      previousLimit = bracket.limit
      
      return {
        bracket: bracket.rate * 100,
        tax: taxInBracket,
        income: incomeInBracket
      }
    })
    
    // Apply tax credits
    const totalCredits = childTaxCredit + childCareCredit + educationCredit + otherCredits
    const finalTax = Math.max(0, totalTaxAmount - totalCredits)
    
    // Update state
    setTotalTax(finalTax)
    setTaxByBracket(taxBreakdown)
    setEffectiveTaxRate((finalTax / calculatedTaxableIncome) * 100 || 0)
    setMarginalTaxRate(lastRate * 100)
    
  }, [
    filingStatus,
    wagesIncome,
    businessIncome,
    investmentIncome,
    otherIncome,
    retirement401k,
    ira,
    studentLoanInterest,
    hsa,
    useItemized,
    mortgageInterest,
    propertyTax,
    charitableDonations,
    medicalExpenses,
    childTaxCredit,
    childCareCredit,
    educationCredit,
    otherCredits
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

  // Tax breakdown chart
  const taxBreakdownData = {
    labels: ['Income Tax', 'Tax Credits', 'Net Tax'],
    datasets: [
      {
        data: [
          taxByBracket.reduce((sum, bracket) => sum + bracket.tax, 0),
          childTaxCredit + childCareCredit + educationCredit + otherCredits,
          totalTax
        ],
        backgroundColor: chartColors.primary.slice(0, 3),
        borderColor: chartColors.secondary.slice(0, 3).map(color => color.replace('0.2', '1')),
        borderWidth: 2
      }
    ]
  }

  const taxBreakdownOptions: ChartOptions<'pie'> = {
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
        formatter: (value: number) => formatCurrency(value)
      }
    }
  }

  // Tax brackets chart
  const taxBracketsData = {
    labels: taxByBracket.map(b => `${b.bracket}% Bracket`),
    datasets: [
      {
        label: 'Tax Paid',
        data: taxByBracket.map(b => b.tax),
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Income in Bracket',
        data: taxByBracket.map(b => b.income),
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const taxBracketsOptions: ChartOptions<'bar'> = {
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
        formatter: (value: number) => '$' + value.toLocaleString()
      }
    }
  }

  // Income breakdown chart
  const incomeBreakdownData = {
    labels: ['Wages', 'Business', 'Investment', 'Other'],
    datasets: [{
      data: [wagesIncome, businessIncome, investmentIncome, otherIncome],
      backgroundColor: chartColors.primary,
      borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
      borderWidth: 2
    }]
  }

  const incomeBreakdownOptions: ChartOptions<'pie'> = {
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
          return value > 0 ? formatCurrency(value) : ''
        }
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
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
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
    pdf.save('income-tax-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <IncomeTaxSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Income Tax <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Estimate your federal income tax liability based on your income, deductions, and credits.
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
                    <CardTitle>Enter Tax Information</CardTitle>
                    <CardDescription>
                      Provide your income, deductions, and credits to calculate your estimated tax liability.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Filing Status */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Filing Status</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="filing-status">Filing Status</Label>
                          <Select value={filingStatus} onValueChange={(value: 'single' | 'married' | 'head') => setFilingStatus(value)}>
                            <SelectTrigger id="filing-status">
                              <SelectValue placeholder="Select filing status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married Filing Jointly</SelectItem>
                              <SelectItem value="head">Head of Household</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            value={age || ''} onChange={(e) => setAge(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Income */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Income</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="wages">Wages & Salary</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="wages"
                              type="number"
                              className="pl-9"
                              value={wagesIncome || ''} onChange={(e) => setWagesIncome(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="business">Business Income</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="business"
                              type="number"
                              className="pl-9"
                              value={businessIncome || ''} onChange={(e) => setBusinessIncome(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="investment">Investment Income</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="investment"
                              type="number"
                              className="pl-9"
                              value={investmentIncome || ''} onChange={(e) => setInvestmentIncome(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="other">Other Income</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="other"
                              type="number"
                              className="pl-9"
                              value={otherIncome || ''} onChange={(e) => setOtherIncome(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Adjustments */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Adjustments to Income</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="401k">401(k) Contributions</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="401k"
                              type="number"
                              className="pl-9"
                              value={retirement401k}
                              onChange={(e) => setRetirement401k(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ira">IRA Contributions</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="ira"
                              type="number"
                              className="pl-9"
                              value={ira || ''} onChange={(e) => setIra(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-loan">Student Loan Interest</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="student-loan"
                              type="number"
                              className="pl-9"
                              value={studentLoanInterest || ''} onChange={(e) => setStudentLoanInterest(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hsa">HSA Contributions</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="hsa"
                              type="number"
                              className="pl-9"
                              value={hsa || ''} onChange={(e) => setHsa(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Deductions</h3>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="itemize">Itemize Deductions</Label>
                          <Switch
                            id="itemize"
                            checked={useItemized}
                            onCheckedChange={setUseItemized}
                          />
                        </div>
                      </div>
                      {useItemized && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="mortgage">Mortgage Interest</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="mortgage"
                                type="number"
                                className="pl-9"
                                value={mortgageInterest || ''} onChange={(e) => setMortgageInterest(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="property-tax">Property Tax</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="property-tax"
                                type="number"
                                className="pl-9"
                                value={propertyTax || ''} onChange={(e) => setPropertyTax(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="charitable">Charitable Donations</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="charitable"
                                type="number"
                                className="pl-9"
                                value={charitableDonations || ''} onChange={(e) => setCharitableDonations(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="medical">Medical Expenses</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="medical"
                                type="number"
                                className="pl-9"
                                value={medicalExpenses || ''} onChange={(e) => setMedicalExpenses(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tax Credits */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Tax Credits</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="child-tax">Child Tax Credit</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="child-tax"
                              type="number"
                              className="pl-9"
                              value={childTaxCredit || ''} onChange={(e) => setChildTaxCredit(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="child-care">Child Care Credit</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="child-care"
                              type="number"
                              className="pl-9"
                              value={childCareCredit || ''} onChange={(e) => setChildCareCredit(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="education">Education Credit</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="education"
                              type="number"
                              className="pl-9"
                              value={educationCredit || ''} onChange={(e) => setEducationCredit(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="other-credits">Other Credits</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="other-credits"
                              type="number"
                              className="pl-9"
                              value={otherCredits || ''} onChange={(e) => setOtherCredits(e.target.value === '' ? 0 : Number(e.target.value))}
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
                      <CardTitle>Tax Summary</CardTitle>
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
                      <p className="text-sm text-muted-foreground">Total Tax</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(totalTax)}</p>
                      <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                        <p>Effective Rate: {formatPercent(effectiveTaxRate)}</p>
                        <p>Marginal Rate: {formatPercent(marginalTaxRate)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="brackets">Brackets</TabsTrigger>
                        <TabsTrigger value="income">Income</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={taxBreakdownData} options={taxBreakdownOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Tax Calculation Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Gross Income</span>
                              <span className="font-medium">{formatCurrency(grossIncome)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Adjusted Gross Income</span>
                              <span className="font-medium">{formatCurrency(adjustedGrossIncome)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Taxable Income</span>
                              <span className="font-medium">{formatCurrency(taxableIncome)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Tax Credits</span>
                              <span className="font-medium">{formatCurrency(childTaxCredit + childCareCredit + educationCredit + otherCredits)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Final Tax Amount</span>
                              <span>{formatCurrency(totalTax)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="brackets" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={taxBracketsData} options={taxBracketsOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Tax Brackets Breakdown</h4>
                          <div className="grid gap-2">
                            {taxByBracket.map((bracket, index) => (
                              bracket.income > 0 && (
                                <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                  <span className="text-sm">{bracket.bracket}% Bracket</span>
                                  <div className="text-right">
                                    <div className="font-medium">{formatCurrency(bracket.tax)}</div>
                                    <div className="text-xs text-muted-foreground">
                                      on {formatCurrency(bracket.income)}
                                    </div>
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="income" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={incomeBreakdownData} options={incomeBreakdownOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Income Sources</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Wages & Salary</span>
                              <span className="font-medium">{formatCurrency(wagesIncome)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Business Income</span>
                              <span className="font-medium">{formatCurrency(businessIncome)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Investment Income</span>
                              <span className="font-medium">{formatCurrency(investmentIncome)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Other Income</span>
                              <span className="font-medium">{formatCurrency(otherIncome)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Income</span>
                              <span>{formatCurrency(grossIncome)}</span>
                            </div>


                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Tax Insights */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Tax Insights</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Your marginal tax rate is {formatPercent(marginalTaxRate)}</li>
                              <li>• Effective tax rate is {formatPercent(effectiveTaxRate)}</li>
                              {useItemized ? (
                                <li>• Itemized deductions exceed standard deduction by {formatCurrency(Math.max(0, (mortgageInterest + propertyTax + charitableDonations + medicalExpenses) - STANDARD_DEDUCTIONS[filingStatus]))}</li>
                              ) : (
                                <li>• Standard deduction of {formatCurrency(STANDARD_DEDUCTIONS[filingStatus])} applied</li>
                              )}
                              {retirement401k + ira > 0 && (
                                <li>• Retirement contributions reduce your taxable income by {formatCurrency(retirement401k + ira)}</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                  
                  <SaveCalculationButton
                    calculatorType="income-tax"
                    inputs={{}}
                    results={{}}
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Tax Planning</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Income Tax Calculator: Plan Your Tax Liability</h2>
        <p className="mt-3 text-muted-foreground text-lg">Understand your taxes and maximize your deductions with precision</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Income Tax Calculations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-income-tax" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is an Income Tax Calculator?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                An <strong>Income Tax Calculator</strong> is a digital tool that estimates your tax liability based on your income, filing status, deductions, and credits. It translates complex tax laws into a simple interface that helps you understand how much tax you'll owe or how much refund you can expect.
              </p>
              <p className="mt-2">
                These calculators account for various components that determine your final tax bill:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Income from all sources (wages, self-employment, investments)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Federal, state, and local tax rates and brackets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Deductions that reduce your taxable income</span>
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Credits that directly reduce your tax bill</span>
                </li>
              </ul>
              <p>
                By inputting your specific financial information, an income tax calculator provides a clearer picture of your tax situation, helping you make informed decisions about withholding, deductions, and tax planning strategies.
              </p>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                  <CardTitle className="text-sm font-medium text-center">2025 Federal Tax Brackets (Single Filer)</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Bar 
                      data={{
                        labels: ['10%', '12%', '22%', '24%', '32%', '35%', '37%'],
                        datasets: [
                          {
                            label: 'Income Threshold',
                            data: [11000, 44725, 95375, 182100, 231250, 578125, 600000],
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.6)',
                              'rgba(79, 70, 229, 0.6)',
                              'rgba(124, 58, 237, 0.6)',
                              'rgba(159, 18, 254, 0.6)',
                              'rgba(217, 70, 239, 0.6)',
                              'rgba(236, 72, 153, 0.6)',
                              'rgba(244, 114, 182, 0.6)'
                            ],
                            borderWidth: 1,
                            barPercentage: 0.8,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: value => '$' + value.toLocaleString()
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return 'Income up to: $' + context.parsed.y.toLocaleString();
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
                <div className="px-4 pb-3 text-xs text-center text-muted-foreground">
                  Marginal tax rates increase as income rises across brackets
                </div>
              </Card>
            </div>
          </div>
          
          <h4 id="why-important" className="font-semibold text-xl mt-6">Why Accurate Tax Calculation Matters</h4>
          <div className="mt-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-200 dark:border-blue-800">
                    <th className="text-left py-2 px-4">Consequence</th>
                    <th className="text-left py-2 px-4">Underpaying Taxes</th>
                    <th className="text-left py-2 px-4">Overpaying Taxes</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-blue-100 dark:border-blue-800">
                    <td className="py-2 px-4 font-medium">Financial Impact</td>
                    <td className="py-2 px-4">Penalties and interest charges</td>
                    <td className="py-2 px-4">Interest-free loan to the government</td>
                  </tr>
                  <tr className="border-b border-blue-100 dark:border-blue-800">
                    <td className="py-2 px-4 font-medium">Cash Flow</td>
                    <td className="py-2 px-4">Unexpected large tax bills</td>
                    <td className="py-2 px-4">Reduced monthly income</td>
                  </tr>
                  <tr className="border-b border-blue-100 dark:border-blue-800">
                    <td className="py-2 px-4 font-medium">Planning</td>
                    <td className="py-2 px-4">Emergency savings depletion</td>
                    <td className="py-2 px-4">Missed investment opportunities</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">Long-term</td>
                    <td className="py-2 px-4">Potential audit risk</td>
                    <td className="py-2 px-4">Delayed access to your money</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <p>
            An <strong>Income Tax Calculator</strong> helps you find the balance between paying the right amount of tax—no more, no less—and allows you to make strategic decisions about your finances throughout the year, not just at tax time. Using this tool regularly empowers you to adjust withholdings, maximize deductions, and avoid surprises when filing your tax return.
          </p>
        </CardContent>
      </Card>

      {/* How to Use Section */}
      <div className="mb-12" id="how-to-use">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Using the Income Tax Calculator</h2>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="calculator-guide" className="font-bold text-xl mb-4">Step-by-Step Calculator Guide</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Input Parameters</h4>
              <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Filing Status</p>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Select your filing status (single, married filing jointly, head of household, etc.)
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Income Details</p>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Enter wages, self-employment, investments, and other income sources
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Deductions & Credits</p>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Add standard or itemized deductions, plus any tax credits you qualify for
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Withholding & Payments</p>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Include taxes already withheld from paychecks and any estimated tax payments
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Advanced Options</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm">State tax calculations</span>
                    <span className="font-medium">Includes state-specific rates and rules</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm">Self-employment taxes</span>
                    <span className="font-medium">Calculates Social Security and Medicare taxes</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm">Alternative Minimum Tax (AMT)</span>
                    <span className="font-medium">Checks for AMT liability</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">Understanding Your Results</h4>
              
              <div className="space-y-4">
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      Total Tax Liability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>
                      The total amount of tax you owe for the year, calculated by applying the appropriate tax rates to your taxable income after adjustments and deductions.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-blue-600" />
                      Refund or Amount Due
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>
                      The difference between your total tax liability and the amount you've already paid through withholding or estimated payments. This tells you whether you'll receive a refund or need to pay additional taxes.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <LineChart className="h-4 w-4 text-blue-600" />
                      Marginal and Effective Tax Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 text-sm">
                    <p>
                      Your marginal tax rate is the rate applied to your last dollar of income, while your effective tax rate represents the average percentage of your income paid in taxes. Understanding both helps with tax planning.
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-300">Important Considerations</p>
                    <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                      <li>• Tax calculator results are estimates based on the information you provide</li>
                      <li>• State and local taxes vary significantly by location</li>
                      <li>• Tax laws change frequently; ensure calculator uses current rules</li>
                      <li>• Complex situations may require professional tax advice</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 id="example-calculation" className="font-bold text-xl mt-8 mb-4">Sample Tax Calculation</h3>
        
        <div className="mb-6">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Parameter</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Filing Status</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Single</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Gross Income</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">$75,000</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Standard Deduction</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">$14,600 (2025 amount)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Taxable Income</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">$60,400</td>
              </tr>
              <tr className="bg-blue-50 dark:bg-blue-900/20">
                <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">Federal Tax Liability</td>
                <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">$10,294</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Withholding to Date</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">$11,250</td>
              </tr>
              <tr className="bg-green-50 dark:bg-green-900/20">
                <td className="py-3 px-4 text-sm font-semibold text-green-700 dark:text-green-400">Potential Refund</td>
                <td className="py-3 px-4 text-sm font-semibold text-green-700 dark:text-green-400">$956</td>
              </tr>
              <tr className="bg-blue-50 dark:bg-blue-900/20">
                <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">Marginal Tax Rate</td>
                <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">22%</td>
              </tr>
              <tr className="bg-blue-50 dark:bg-blue-900/20">
                <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">Effective Tax Rate</td>
                <td className="py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-400">13.7%</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Pro Tip:</strong> Notice the difference between marginal (22%) and effective (13.7%) tax rates. Many people mistakenly believe all their income is taxed at their marginal rate, when in reality the effective rate is much lower due to progressive taxation and deductions.
          </p>
        </div>
      </div>

      {/* Key Factors Section with Advanced Components */}
      <div className="mb-12" id="key-factors">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
            <CardTitle>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl">Key Concepts in Income Taxation</span>
              </div>
            </CardTitle>
            <CardDescription>
              Understanding these elements will help you make informed tax decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="marginal-rates" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Marginal vs. Effective Tax Rates
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    One of the most misunderstood aspects of income tax is how tax brackets work. The <strong>United States uses a progressive tax system</strong>, meaning different portions of your income are taxed at different rates.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span><strong>Marginal tax rate</strong> is the rate you pay on your last dollar of income</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                      <span><strong>Effective tax rate</strong> is your total tax divided by your total income</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      <strong>Example:</strong> Income of $95,000 (Single filer, 2025)
                    </p>
                    <ul className="text-sm mt-1 text-purple-700 dark:text-purple-400">
                      <li>10% on first $11,000: $1,100</li>
                      <li>12% on $11,001-$44,725: $4,047</li>
                      <li>22% on $44,726-$95,000: $11,060</li>
                      <li>Total tax: $16,207</li>
                    </ul>
                    <p className="text-xs mt-2 text-purple-600 dark:text-purple-500">
                      Marginal rate: 22%, but effective rate: only 17.1%
                    </p>
                  </div>
                </div>
                
                <div className="h-[220px]">
                  <h4 className="text-center text-sm font-medium mb-2">How Progressive Taxation Works</h4>
                  <Bar 
                    data={{
                      labels: ['First $11,000', '$11,001-$44,725', '$44,726-$95,000', '$95,001-$182,100', '$182,101+'],
                      datasets: [
                        {
                          label: 'Tax Rate',
                          data: [10, 12, 22, 24, 32],
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(99, 102, 241, 0.7)',
                            'rgba(139, 92, 246, 0.7)',
                            'rgba(168, 85, 247, 0.7)',
                            'rgba(217, 70, 239, 0.7)'
                          ],
                          borderWidth: 1
                        }
                      ]
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
                          max: 35,
                          title: {
                            display: true,
                            text: 'Tax Rate (%)'
                          }
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
                <h3 id="deductions" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                  <Minus className="h-5 w-5" />
                  Deductions vs. Credits
                </h3>
                <p>
                  Understanding the difference between tax deductions and tax credits is crucial for maximizing your tax savings.
                </p>
                
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Feature</th>
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Tax Deductions</th>
                        <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Tax Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">How they work</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Reduce taxable income</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Reduce tax liability directly</td>
                      </tr>
                      <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Value depends on</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Your tax bracket</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Fixed dollar amount</td>
                      </tr>
                      <tr>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Example</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$1,000 deduction in 22% bracket = $220 savings</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$1,000 credit = $1,000 savings</td>
                      </tr>
                      <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Common examples</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Mortgage interest, charity donations</td>
                        <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Child Tax Credit, Earned Income Credit</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Credits are generally more valuable than deductions of the same amount</p>
              </div>
              
              <div>
                <h3 id="filing-status" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Filing Status Impact
                </h3>
                <p>
                  Your filing status significantly affects your tax brackets, standard deduction, and eligibility for certain credits and deductions.
                </p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">2025 Standard Deductions by Filing Status</h4>
                  <div className="mt-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="font-medium text-blue-700 dark:text-blue-400">Single:</div>
                      <div className="font-medium text-blue-700 dark:text-blue-400">$14,600</div>
                      <div className="text-blue-600 dark:text-blue-500">Married Filing Jointly:</div>
                      <div className="text-blue-600 dark:text-blue-500">$29,200</div>
                      <div className="text-blue-600 dark:text-blue-500">Head of Household:</div>
                      <div className="text-blue-600 dark:text-blue-500">$21,900</div>
                      <div className="text-blue-600 dark:text-blue-500">Married Filing Separately:</div>
                      <div className="text-blue-600 dark:text-blue-500">$14,600</div>
                    </div>
                  </div>
                </div>
                
                <h3 id="withholding" className="text-xl font-bold text-green-700 dark:text-green-400 mt-6 mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Tax Withholding Strategy
                </h3>
                <p className="mb-4">
                  Properly setting your tax withholding throughout the year helps avoid both large tax bills and giving interest-free loans to Ended here due to character limit. Please request the continuation if needed.the government.
                </p>
                <div className="h-[170px]">
                  <Line 
                    data={{
                      labels: ['Under-withheld', 'Slightly Under', 'Balanced', 'Slightly Over', 'Over-withheld'],
                      datasets: [
                        {
                          label: 'Financial Optimization',
                          data: [40, 70, 100, 70, 50],
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          borderColor: 'rgba(16, 185, 129, 0.8)',
                          fill: true,
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: 'Optimal Balance'
                          },
                          ticks: { display: false }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Trends Section with Statistics */}
      <div className="mb-12" id="tax-statistics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Tax Trends and Insights
        </h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                  <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Average Tax Refund</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">$3,170</p>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">For 2024 tax year (2025 filing)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                  <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">Average Effective Tax Rate</h3>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">13.6%</p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">For middle-income households</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                  {/* Corrected from ArrowRightLeft to ArrowLeftRight */}
                  <ArrowLeftRight className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Percent Filing Electronically</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">91%</p>
                <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">Of all tax returns (2025)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Average Time Spent</h3>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">13 hrs</p>
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">Preparing individual tax returns</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 id="tax-planning-strategies" className="text-xl font-bold mb-4">Tax Planning Strategies</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </span>
                <CardTitle className="text-base">Timing Income & Expenses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Strategically timing when you receive income or pay deductible expenses can help manage your tax bracket and minimize liability, especially when your income varies from year to year.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40">
                  {/* Corrected from ArrowRightLeft to ArrowLeftRight */}
                  <ArrowLeftRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                </span>
                <CardTitle className="text-base">Retirement Contributions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Maximizing contributions to tax-advantaged retirement accounts like 401(k)s and IRAs can significantly reduce your taxable income while simultaneously building your retirement nest egg.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40">
                  <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </span>
                <CardTitle className="text-base">Charitable Giving</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Charitable donations can provide significant tax savings when itemizing deductions. Consider bunching contributions in alternate years to exceed the standard deduction threshold.
              </p>
            </CardContent>
          </Card>
        </div>

        <h3 id="tax-reform" className="text-xl font-bold mb-4">Recent Tax Law Changes</h3>
        <Card className="bg-white dark:bg-gray-900 mb-4">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p>
                  <strong>Tax laws change frequently</strong>, making it essential to stay informed about recent updates that might affect your tax situation.
                </p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Key Tax Law Changes for 2025</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-400">Standard Deduction Adjustment</span>
                      <span className="font-medium text-blue-700 dark:text-blue-400">Increased for inflation</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-400">Tax Bracket Thresholds</span>
                      <span className="font-medium text-blue-700 dark:text-blue-400">Adjusted upward</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-400">Retirement Contribution Limits</span>
                      <span className="font-medium text-blue-700 dark:text-blue-400">Increased</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-400">1099-K Reporting Threshold</span>
                      <span className="font-medium text-blue-700 dark:text-blue-400">$600 (decreased)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-lg mb-3">Sunset Provisions: Tax Cuts and Jobs Act</h4>
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <p className="font-medium text-amber-800 dark:text-amber-300">Upcoming Changes</p>
                    </div>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                      Many provisions of the Tax Cuts and Jobs Act are scheduled to expire after 2025, potentially resulting in significant tax changes for many taxpayers.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-muted-foreground">
                      <strong>Potential post-2025 changes:</strong>
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                      <li>• Higher tax rates for many brackets</li>
                      <li>• Lower standard deductions</li>
                      <li>• Changes to child tax credit amounts</li>
                      <li>• Return of certain itemized deductions</li>
                      <li>• Modified estate tax exemptions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">State and Local Taxes</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                In addition to federal income taxes, most states and some cities impose their own income taxes, with rates ranging from 0% to over 13%. An income tax calculator that includes state and local taxes provides a more complete picture of your total tax liability. Remember that state taxes paid may be deductible on your federal return (within limits).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <div className="mb-6" id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Optimize Your Tax Situation
            </CardTitle>
            <CardDescription>
              Take control of your tax planning for better financial outcomes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              An <strong>Income Tax Calculator</strong> is an essential tool for financial planning, providing you with insights that can help minimize your tax liability while ensuring compliance with tax laws. By understanding how different income sources, deductions, credits, and tax rates interact, you can make strategic decisions throughout the year—not just during tax season.
            </p>
            
            <p className="mt-4" id="next-steps">
              Take these steps to optimize your tax situation:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Immediate Actions</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                    <span className="text-blue-800 dark:text-blue-300">Review your current withholding to avoid surprises</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                    <span className="text-blue-800 dark:text-blue-300">Identify potential deductions and credits you qualify for</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                    <span className="text-blue-800 dark:text-blue-300">Maximize contributions to tax-advantaged accounts</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Long-Term Strategy</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                    <span className="text-green-800 dark:text-green-300">Create a multi-year tax strategy, especially with TCJA sunset in mind</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                    <span className="text-green-800 dark:text-green-300">Coordinate investment decisions with tax implications</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                    <span className="text-green-800 dark:text-green-300">Consider consulting with a tax professional for complex situations</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to estimate your tax liability?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Income Tax Calculator</strong> above to get a personalized tax projection! For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/tax-refund">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Tax Refund Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/self-employment">
                        <Briefcase className="h-4 w-4 mr-1" />
                        Self-Employment Tax
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/capital-gains">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Capital Gains Tax
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
      </main>
      <SiteFooter />
    </div>
  )
}