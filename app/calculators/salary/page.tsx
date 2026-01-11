"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { SaveCalculationButton } from "@/components/save-calculation-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Briefcase, Building, CreditCard, Wallet, GraduationCap, Heart, Home, Gift, FileText, Percent, Minus, Users, ArrowUpDown, ArrowLeftRight, Clock, Calendar, MapPin, Package, Laptop } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import SalarySchema from './schema';

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

// Tax brackets for 2024 (example data)
const federalTaxBrackets = [
  { rate: 0.10, threshold: 0 },
  { rate: 0.12, threshold: 11600 },
  { rate: 0.22, threshold: 47150 },
  { rate: 0.24, threshold: 100525 },
  { rate: 0.32, threshold: 191950 },
  { rate: 0.35, threshold: 243725 },
  { rate: 0.37, threshold: 609350 }
]

interface PayPeriod {
  id: string
  name: string
  periodsPerYear: number
}

const payPeriods: PayPeriod[] = [
  { id: "annually", name: "Annually", periodsPerYear: 1 },
  { id: "monthly", name: "Monthly", periodsPerYear: 12 },
  { id: "semi-monthly", name: "Semi-Monthly", periodsPerYear: 24 },
  { id: "bi-weekly", name: "Bi-Weekly", periodsPerYear: 26 },
  { id: "weekly", name: "Weekly", periodsPerYear: 52 }
]

export default function SalaryCalculator() {
  // Income Details
  const [grossSalary, setGrossSalary] = useState(75000)
  const [payFrequency, setPayFrequency] = useState<string>("bi-weekly")
  const [filingStatus, setFilingStatus] = useState("single")
  const [state, setState] = useState("NY")
  
  // Pre-tax Deductions
  const [retirement401k, setRetirement401k] = useState(5)
  const [healthInsurance, setHealthInsurance] = useState(200)
  const [fsa, setFsa] = useState(0)
  
  // Post-tax Deductions
  const [roth401k, setRoth401k] = useState(0)
  const [unionDues, setUnionDues] = useState(0)
  const [otherDeductions, setOtherDeductions] = useState(0)
  
  // Additional Income
  const [bonus, setBonus] = useState(0)
  const [overtime, setOvertime] = useState(0)
  const [commission, setCommission] = useState(0)
  
  // Results
  const [results, setResults] = useState({
    grossAnnual: 0,
    grossPerPeriod: 0,
    federalTax: 0,
    stateTax: 0,
    socialSecurity: 0,
    medicare: 0,
    preTaxDeductions: 0,
    postTaxDeductions: 0,
    netAnnual: 0,
    netPerPeriod: 0,
    effectiveTaxRate: 0
  })

  // Calculate all tax and deduction amounts
  useEffect(() => {
    // Calculate annual gross including additional income
    const totalGrossAnnual = grossSalary + bonus + overtime + commission
    
    // Calculate pre-tax deductions
    const annual401k = (retirement401k / 100) * grossSalary
    const annualHealthInsurance = healthInsurance * 12
    const annualFsa = fsa
    const totalPreTaxDeductions = annual401k + annualHealthInsurance + annualFsa
    
    // Calculate taxable income
    const taxableIncome = totalGrossAnnual - totalPreTaxDeductions
    
    // Calculate federal tax using brackets
    let federalTax = 0
    let previousThreshold = 0
    for (let i = 0; i < federalTaxBrackets.length; i++) {
      const { rate, threshold } = federalTaxBrackets[i]
      const nextThreshold = federalTaxBrackets[i + 1]?.threshold || Infinity
      
      if (taxableIncome > threshold) {
        const taxableAmount = Math.min(taxableIncome - threshold, nextThreshold - threshold)
        federalTax += taxableAmount * rate
      }
    }
    
    // Calculate other taxes (simplified examples)
    const stateTax = taxableIncome * 0.05 // Example state tax rate
    const socialSecurity = Math.min(totalGrossAnnual * 0.062, 9932.40) // 2024 cap: $160,200
    const medicare = totalGrossAnnual * 0.0145
    
    // Calculate post-tax deductions
    const annualRoth401k = (roth401k / 100) * grossSalary
    const annualUnionDues = unionDues * 12
    const totalPostTaxDeductions = annualRoth401k + annualUnionDues + otherDeductions
    
    // Calculate net income
    const totalTaxes = federalTax + stateTax + socialSecurity + medicare
    const netAnnual = totalGrossAnnual - totalTaxes - totalPreTaxDeductions - totalPostTaxDeductions
    
    // Calculate per-period amounts
    const periodsPerYear = payPeriods.find(p => p.id === payFrequency)?.periodsPerYear || 26
    const grossPerPeriod = totalGrossAnnual / periodsPerYear
    const netPerPeriod = netAnnual / periodsPerYear
    
    // Calculate effective tax rate
    const effectiveTaxRate = (totalTaxes / totalGrossAnnual) * 100
    
    setResults({
      grossAnnual: totalGrossAnnual,
      grossPerPeriod,
      federalTax,
      stateTax,
      socialSecurity,
      medicare,
      preTaxDeductions: totalPreTaxDeductions,
      postTaxDeductions: totalPostTaxDeductions,
      netAnnual,
      netPerPeriod,
      effectiveTaxRate
    })
    
  }, [
    grossSalary,
    payFrequency,
    filingStatus,
    state,
    retirement401k,
    healthInsurance,
    fsa,
    roth401k,
    unionDues,
    otherDeductions,
    bonus,
    overtime,
    commission
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

  // Salary breakdown chart
  const pieChartData = {
    labels: ['Net Income', 'Federal Tax', 'State Tax', 'FICA', 'Pre-tax Deductions', 'Post-tax Deductions'],
    datasets: [{
      data: [
        results.netAnnual,
        results.federalTax,
        results.stateTax,
        results.socialSecurity + results.medicare,
        results.preTaxDeductions,
        results.postTaxDeductions
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
          return ((value / results.grossAnnual) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Pay period comparison chart
  const payPeriodData = {
    labels: payPeriods.map(p => p.name),
    datasets: [
      {
        label: 'Gross Pay',
        data: payPeriods.map(p => results.grossAnnual / p.periodsPerYear),
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Net Pay',
        data: payPeriods.map(p => results.netAnnual / p.periodsPerYear),
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
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

  // Tax rate analysis chart
  const taxRateData = {
    labels: ['Federal', 'State', 'Social Security', 'Medicare', 'Effective Rate'],
    datasets: [
      {
        label: 'Tax Rates',
        data: [
          (results.federalTax / results.grossAnnual) * 100,
          (results.stateTax / results.grossAnnual) * 100,
          (results.socialSecurity / results.grossAnnual) * 100,
          (results.medicare / results.grossAnnual) * 100,
          results.effectiveTaxRate
        ],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const taxRateOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 40,
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
        formatter: (value: number) => value.toFixed(1) + '%'
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
    pdf.save('salary-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <SalarySchema /> 
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Salary <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your take-home pay and understand your tax deductions with our comprehensive salary calculator.
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
                    <CardTitle>Enter Salary Details</CardTitle>
                    <CardDescription>
                      Provide your salary information and deductions to calculate your take-home pay.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Income Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Income Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="gross-salary">Gross Annual Salary</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="gross-salary"
                              type="number"
                              className="pl-9"
                              value={grossSalary || ''} onChange={(e) => setGrossSalary(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pay-frequency">Pay Frequency</Label>
                          <Select value={payFrequency} onValueChange={setPayFrequency}>
                            <SelectTrigger id="pay-frequency">
                              <SelectValue placeholder="Select pay frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              {payPeriods.map((period) => (
                                <SelectItem key={period.id} value={period.id}>
                                  {period.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="filing-status">Filing Status</Label>
                          <Select value={filingStatus} onValueChange={setFilingStatus}>
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
                          <Label htmlFor="state">State</Label>
                          <Select value={state} onValueChange={setState}>
                            <SelectTrigger id="state">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NY">New York</SelectItem>
                              <SelectItem value="CA">California</SelectItem>
                              <SelectItem value="TX">Texas</SelectItem>
                              {/* Add more states */}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Pre-tax Deductions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Pre-tax Deductions</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="401k">401(k) Contribution (%)</Label>
                          <div className="relative">
                            <Input
                              id="401k"
                              type="number"
                              value={retirement401k}
                              onChange={(e) => setRetirement401k(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="health-insurance">Health Insurance (Monthly)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="health-insurance"
                              type="number"
                              className="pl-9"
                              value={healthInsurance || ''} onChange={(e) => setHealthInsurance(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fsa">FSA Contribution (Annual)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="fsa"
                              type="number"
                              className="pl-9"
                              value={fsa || ''} onChange={(e) => setFsa(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Post-tax Deductions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Post-tax Deductions</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="roth-401k">Roth 401(k) Contribution (%)</Label>
                          <Input
                            id="roth-401k"
                            type="number"
                            value={roth401k}
                            onChange={(e) => setRoth401k(Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="union-dues">Union Dues (Monthly)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="union-dues"
                              type="number"
                              className="pl-9"
                              value={unionDues || ''} onChange={(e) => setUnionDues(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="other-deductions">Other Deductions (Annual)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="other-deductions"
                              type="number"
                              className="pl-9"
                              value={otherDeductions || ''} onChange={(e) => setOtherDeductions(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Income */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Income</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="bonus">Annual Bonus</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="bonus"
                              type="number"
                              className="pl-9"
                              value={bonus || ''} onChange={(e) => setBonus(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="overtime">Annual Overtime</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="overtime"
                              type="number"
                              className="pl-9"
                              value={overtime || ''} onChange={(e) => setOvertime(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="commission">Annual Commission</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="commission"
                              type="number"
                              className="pl-9"
                              value={commission || ''} onChange={(e) => setCommission(e.target.value === '' ? 0 : Number(e.target.value))}
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Net Per Period</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(results.netPerPeriod)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Net Annual</p>
                        <p className="text-2xl font-bold">{formatCurrency(results.netAnnual)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="periods">Pay Periods</TabsTrigger>
                        <TabsTrigger value="taxes">Tax Rates</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Salary Breakdown</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Federal Tax</span>
                              <span className="font-medium">{formatCurrency(results.federalTax)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">State Tax</span>
                              <span className="font-medium">{formatCurrency(results.stateTax)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Social Security</span>
                              <span className="font-medium">{formatCurrency(results.socialSecurity)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Medicare</span>
                              <span className="font-medium">{formatCurrency(results.medicare)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Pre-tax Deductions</span>
                              <span className="font-medium">{formatCurrency(results.preTaxDeductions)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Post-tax Deductions</span>
                              <span className="font-medium">{formatCurrency(results.postTaxDeductions)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Net Income</span>
                              <span>{formatCurrency(results.netAnnual)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="periods" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={payPeriodData} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Pay Period Comparison</h4>
                          <div className="grid gap-2">
                            {payPeriods.map((period) => (
                              <div key={period.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">{period.name}</span>
                                <div className="text-right">
                                  <div className="font-medium">
                                    {formatCurrency(results.netAnnual / period.periodsPerYear)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {period.periodsPerYear}x per year
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="taxes" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={taxRateData} options={taxRateOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Tax Rate Analysis</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Effective Tax Rate</span>
                              <span className="font-medium">{results.effectiveTaxRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Tax Amount</span>
                              <span className="font-medium">
                                {formatCurrency(results.federalTax + results.stateTax + results.socialSecurity + results.medicare)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Summary Card */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Salary Summary</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Gross Annual: {formatCurrency(results.grossAnnual)}</li>
                              <li>• Total Deductions: {formatCurrency(results.preTaxDeductions + results.postTaxDeductions)}</li>
                              <li>• Total Taxes: {formatCurrency(results.federalTax + results.stateTax + results.socialSecurity + results.medicare)}</li>
                              <li>• Net Annual: {formatCurrency(results.netAnnual)}</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                  
                  <SaveCalculationButton
                    calculatorType="salary"
                    inputs={{
                      grossSalary,
                      payFrequency,
                      filingStatus,
                      retirement401k,
                      healthInsurance
                    }}
                    results={{
                      netPay: 0,
                      federalTax: 0,
                      stateTax: 0,
                      takeHomePay: 0
                    }}
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
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Career Resource</span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Salary Calculator: Maximize Your Earning Potential</h2>
                <p className="mt-3 text-muted-foreground text-lg">Everything you need to know about understanding and optimizing your compensation</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding Salary Calculators
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 id="what-is-calculator" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is a Salary Calculator?</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                      <p>
                        A <strong>Salary Calculator</strong> is a comprehensive tool that helps you understand your true earnings by factoring in taxes, benefits, and other compensation components. It transforms complex payroll calculations into clear insights about your actual take-home pay and total compensation package.
                      </p>
                      <p className="mt-2">
                        These calculators typically account for variables such as:
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Base salary or hourly wage</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Federal, state, and local tax rates</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Retirement contributions and healthcare deductions</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>Benefits valuation and bonus structures</span>
                        </li>
                      </ul>
                      <p>
                        Modern salary calculators provide detailed breakdowns of your compensation, helping you make informed career decisions, negotiate effectively, and plan your finances with confidence.
                      </p>
                    </div>
                    <div className="md:w-[300px] h-[260px] flex-shrink-0">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                          <CardTitle className="text-sm font-medium text-center">Salary vs. Take-Home Pay</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full">
                            <Bar 
                              data={{
                                labels: ['$50K', '$75K', '$100K', '$125K', '$150K'],
                                datasets: [
                                  {
                                    label: 'Gross Salary',
                                    data: [50000, 75000, 100000, 125000, 150000],
                                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                                  },
                                  {
                                    label: 'Take-Home Pay',
                                    data: [38750, 55125, 70500, 85875, 100500],
                                    backgroundColor: 'rgba(20, 184, 166, 0.7)',
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'bottom',
                                    labels: { boxWidth: 10, padding: 10 }
                                  }
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    ticks: { 
                                      callback: value => '$' + value.toLocaleString()
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <h4 id="why-important" className="font-semibold text-xl mt-6">Why Salary Understanding Matters in Today's Job Market</h4>
                  <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Salary Transparency</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Over 70% of workers feel empowered by increased salary transparency in job listings</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Total Compensation</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Benefits typically add 30-40% value beyond base salary but are often overlooked</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Geographic Differentials</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">The same job can have up to 50% salary variation based on location and cost of living</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p>
                    Using salary calculators empowers you to negotiate confidently, make informed career moves, and build realistic financial plans. By understanding the true value of job offers and compensation packages, you can maximize your earnings potential while maintaining work-life balance and personal financial goals.
                  </p>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Getting the Most from Your Salary Calculator</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="step-by-step" className="font-bold text-xl mb-4">Interactive Calculation Guide</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">1</span>
                          Basic Income Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Enter your base salary or hourly wage</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Specify work hours (for hourly calculations)</span>
                          </li>
                        </ul>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>Remember to include overtime or variable hours if your schedule fluctuates.</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">2</span>
                          Location & Tax Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Select your work location and residence</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Choose your tax filing status</span>
                          </li>
                        </ul>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>Tax rates vary significantly by location, greatly impacting your take-home pay.</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">3</span>
                          Deductions & Benefits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Wallet className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Add retirement contributions (401k, IRA)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Heart className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Include healthcare and insurance premiums</span>
                          </li>
                        </ul>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>Pre-tax deductions can significantly lower your taxable income and improve your net pay.</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">4</span>
                          Additional Compensation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Factor in bonuses and commissions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Add stock options and equity compensation</span>
                          </li>
                        </ul>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>Variable compensation can drastically change your total earnings picture.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <h3 id="results" className="font-bold text-xl mt-8 mb-4">Understanding Your Salary Breakdown</h3>
                
                <div className="mb-6">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Component</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Why It Matters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Gross Pay</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Your total earnings before any deductions</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Baseline for comparing job offers</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Net Pay</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Actual take-home amount after all deductions</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">What you'll actually receive in your bank account</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Tax Burden</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Total taxes paid across all jurisdictions</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Helps identify tax optimization opportunities</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Effective Tax Rate</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Percentage of income paid in taxes</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">More accurate than marginal rates for financial planning</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Total Compensation Value</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Salary plus monetary value of all benefits</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">True cost of employment to your employer</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Pro Tip:</strong> When comparing job offers, don't just look at the base salary. Calculate the total compensation including benefits, retirement matching, equity, and after-tax income based on location to make a truly informed decision.
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
                        <span className="text-2xl">Key Factors in Salary Optimization</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Understanding these elements will help you maximize your earning potential
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h3 id="location-impact" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Geographic Location Impact
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p>
                            <strong>Location</strong> is one of the most significant factors affecting salary. The same job title can command vastly different compensation depending on the local cost of living, talent market demand, and regional industry strength.
                          </p>
                          <ul className="mt-4 space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>High-cost cities</strong> typically offer higher nominal salaries</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>Remote work</strong> has created new salary considerations</span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                              <strong>Example:</strong> Software Developer Salary by Location
                            </p>
                            <ul className="text-sm mt-1 text-purple-700 dark:text-purple-400">
                              <li>San Francisco: $150,000</li>
                              <li>New York City: $140,000</li>
                              <li>Austin: $120,000</li>
                              <li>Chicago: $110,000</li>
                              <li>Raleigh: $100,000</li>
                            </ul>
                            <p className="text-xs mt-2 text-purple-600 dark:text-purple-500">Up to <strong>50% variation</strong> for the same role and experience level!</p>
                          </div>
                        </div>
                        
                        <div className="h-[220px]">
                          <h4 className="text-center text-sm font-medium mb-2">Cost of Living vs. Salary Adjustment</h4>
                          <Bar 
                            data={{
                              labels: ['San Francisco', 'New York', 'Seattle', 'Boston', 'Chicago', 'Austin'],
                              datasets: [
                                {
                                  label: 'Cost of Living Index',
                                  data: [193, 187, 172, 162, 116, 119],
                                  backgroundColor: 'rgba(124, 58, 237, 0.7)',
                                },
                                {
                                  label: 'Salary Index',
                                  data: [150, 145, 135, 130, 100, 105],
                                  backgroundColor: 'rgba(79, 70, 229, 0.7)',
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
                                  beginAtZero: true,
                                  title: {
                                    display: true,
                                    text: 'Index (100 = National Average)'
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
                        <h3 id="experience-education" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                          <GraduationCap className="h-5 w-5" />
                          Experience & Education Premium
                        </h3>
                        <p>Understanding how education and experience affect your market value is essential for salary negotiations and career planning.</p>
                        
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Experience Level</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Average Salary Premium</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Negotiation Leverage</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Entry Level (0-2 yrs)</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Baseline</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Limited</td>
                              </tr>
                              <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Mid-Level (3-5 yrs)</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">+30-50%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Moderate</td>
                              </tr>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Senior (6-10 yrs)</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">+70-100%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Strong</td>
                              </tr>
                              <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Expert (10+ yrs)</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">+120-200%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">Very Strong</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">*Percentages vary by industry and role type</p>
                      </div>
                      
                      <div>
                        <h3 id="benefits-value" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Benefits Package Value
                        </h3>
                        <p>
                          Benefits often represent 30-40% of your total compensation package but are frequently undervalued during job evaluations and negotiations.
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">Monetary Value of Common Benefits</h4>
                          <div className="mt-3">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div className="font-medium text-blue-700 dark:text-blue-400">Health Insurance:</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">$5,000-$20,000/year</div>
                              <div className="text-blue-600 dark:text-blue-500">401(k) Matching:</div>
                              <div className="text-blue-600 dark:text-blue-500">$3,000-$6,000/year</div>
                              <div className="text-blue-600 dark:text-blue-500">Paid Time Off:</div>
                              <div className="text-blue-600 dark:text-blue-500">$3,000-$15,000/year</div>
                              <div className="text-blue-600 dark:text-blue-500">Remote Work:</div>
                              <div className="text-blue-600 dark:text-blue-500">$2,500-$7,500/year</div>
                            </div>
                            <p className="mt-3 text-xs text-blue-700 dark:text-blue-400">*Based on average salary of $80,000</p>
                          </div>
                        </div>
                        
                        <h3 id="industry-differentials" className="text-xl font-bold text-green-700 dark:text-green-400 mt-6 mb-4 flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Industry Differentials
                        </h3>
                        <p className="mb-4">
                          Industry choice can have a dramatic impact on your earning potential, even for similar roles with comparable skills.
                        </p>
                        <div className="h-[170px]">
                          <Pie 
                            data={{
                              labels: ['Tech', 'Finance', 'Healthcare', 'Education', 'Retail'],
                              datasets: [{
                                data: [135, 128, 110, 85, 78],
                                backgroundColor: [
                                  'rgba(16, 185, 129, 0.9)',
                                  'rgba(14, 165, 233, 0.9)',
                                  'rgba(99, 102, 241, 0.9)',
                                  'rgba(139, 92, 246, 0.9)',
                                  'rgba(236, 72, 153, 0.9)'
                                ],
                                borderWidth: 1
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { position: 'bottom', labels: { padding: 10 } },
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      return context.label + ': ' + context.raw + '% of average salary';
                                    }
                                  }
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

              {/* Salary Trends Section with Statistics */}
              <div className="mb-12" id="salary-statistics">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Salary Trends and Insights
                </h2>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                          <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Average Salary Growth</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">4.2%</p>
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">Annual increase (2025)</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                          <ArrowLeftRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">Job Change Salary Boost</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">14.8%</p>
                        <p className="mt-1 text-sm text-green-600 dark:text-green-500">Average increase when switching employers</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                          <Laptop className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Remote Work Premium</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">7.5%</p>
                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">Higher pay for remote-first roles</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                          <GraduationCap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Education ROI</h3>
                        <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">$860K</p>
                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">Lifetime earnings increase with bachelor's degree</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="negotiation-strategies" className="text-xl font-bold mb-4">Salary Negotiation Strategies</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40">
                          <LineChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                        <CardTitle className="text-base">Research Market Rates</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Before any negotiation, arm yourself with data on industry standards, company pay scales, and regional benchmarks for your role. Knowledge is the foundation of negotiation leverage.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40">
                          <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </span>
                        <CardTitle className="text-base">Consider Total Package</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Look beyond base salary to negotiate on flexible work arrangements, additional PTO, professional development budgets, and other benefits that improve your work-life balance.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40">
                          <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </span>
                        <CardTitle className="text-base">Performance Reviews</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Don't wait for annual reviews to discuss compensation. Document your achievements, quantify your impact, and proactively schedule salary discussions when you've delivered significant value.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="remote-work" className="text-xl font-bold mb-4">Remote Work and Geographic Compensation</h3>
                <Card className="bg-white dark:bg-gray-900 mb-4">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p>
                          <strong>Remote work</strong> has dramatically changed the salary landscape, creating both opportunities and challenges for employees and employers in determining fair compensation.
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Common Remote Compensation Models</h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700 dark:text-blue-400">Location-based pay</span>
                              <span className="font-medium text-blue-700 dark:text-blue-400">57% of companies</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700 dark:text-blue-400">National average salary</span>
                              <span className="font-medium text-blue-700 dark:text-blue-400">24% of companies</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700 dark:text-blue-400">Tiered by region</span>
                              <span className="font-medium text-blue-700 dark:text-blue-400">18% of companies</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-sm text-blue-800 dark:text-blue-300">Global standard rate</span>
                              <span className="text-blue-800 dark:text-blue-300">7% of companies</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-[280px]">
                        <h4 className="text-center text-sm font-medium mb-3">Salary Adjustment by Location Type</h4>
                        <Bar 
                          data={{
                            labels: ['Major Tech Hub', 'Large Metro', 'Mid-sized City', 'Small City', 'Rural'],
                            datasets: [
                              {
                                label: 'Location Coefficient',
                                data: [1.45, 1.25, 1.05, 0.9, 0.8],
                                backgroundColor: [
                                  'rgba(99, 102, 241, 0.9)',
                                  'rgba(79, 70, 229, 0.9)',
                                  'rgba(67, 56, 202, 0.9)',
                                  'rgba(55, 48, 163, 0.9)',
                                  'rgba(49, 46, 129, 0.9)'
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
                                beginAtZero: false,
                                min: 0.7,
                                max: 1.5,
                                title: {
                                  display: true,
                                  text: 'Salary Multiplier Factor'
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-300">Tax Considerations for Remote Workers</p>
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                        Remote workers may face complex tax situations if they work in different states or countries than their employer. Multistate taxation can lead to filing requirements in multiple jurisdictions. Consider consulting a tax professional to optimize your situation and ensure compliance with all applicable regulations.
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
                      Maximizing Your Earning Potential
                    </CardTitle>
                    <CardDescription>
                      Taking control of your career compensation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      A <strong>Salary Calculator</strong> empowers you with the knowledge to make informed career decisions, negotiate effectively, and build a solid financial foundation. By understanding the nuances of compensation—from regional variations and industry differentials to benefits valuation and tax implications—you can strategically position yourself for optimal earnings.
                    </p>
                    
                    <p className="mt-4" id="next-steps">
                      Take these actions to enhance your compensation strategy:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Short-Term Actions</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                            <span className="text-blue-800 dark:text-blue-300">Calculate your true take-home pay and total compensation</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                            <span className="text-blue-800 dark:text-blue-300">Research market rates for your role, experience, and location</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                            <span className="text-blue-800 dark:text-blue-300">Adjust your tax withholdings to optimize cash flow</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Long-Term Strategy</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                            <span className="text-green-800 dark:text-green-300">Develop high-demand skills that command premium compensation</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                            <span className="text-green-800 dark:text-green-300">Consider geographic arbitrage opportunities with remote work</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                            <span className="text-green-800 dark:text-green-300">Build a negotiation strategy for each performance cycle</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to analyze your compensation?</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use our <strong>Salary Calculator</strong> above to understand your true earnings potential! For more financial planning tools, explore our related calculators:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/tax">
                                <Percent className="h-4 w-4 mr-1" />
                                Tax Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/cost-of-living">
                                <MapPin className="h-4 w-4 mr-1" />
                                Cost of Living
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/benefits-value">
                                <Package className="h-4 w-4 mr-1" />
                                Benefits Valuation
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