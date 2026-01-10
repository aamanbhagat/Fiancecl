"use client"

import React from "react"
import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Building, DollarSign, Car, Briefcase, PiggyBank, CreditCard, 
  Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, 
  TrendingUp, LineChart, Home, Landmark, Gem, Scale, Info, Wallet, Minus, Percent, FileText, AlertCircle, Gift, Heart, Users, GraduationCap, LandPlot, Lightbulb, FileEdit, FilePlus, CheckCircle, Clock, Banknote, History, MapPin, Receipt, BadgeDollarSign, Link
} from "lucide-react"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import TakeHomePaycheckSchema from './schema';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Tax brackets for 2024 (example data)
const federalTaxBrackets2024 = {
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
  ]
}

export default function TakeHomePaycheckPage() {
  // Income State
  const [payType, setPayType] = useState("salary")
  const [annualSalary, setAnnualSalary] = useState(50000)
  const [hourlyRate, setHourlyRate] = useState(24.04)
  const [hoursPerWeek, setHoursPerWeek] = useState(40)
  const [payFrequency, setPayFrequency] = useState("bi-weekly")
  const [includeOvertime, setIncludeOvertime] = useState(false)
  const [overtimeHours, setOvertimeHours] = useState(0)
  const [overtimeRate, setOvertimeRate] = useState(36.06)

  // Tax Filing Status
  const [filingStatus, setFilingStatus] = useState("single")
  const [state, setState] = useState("NY")
  
  // Pre-tax Deductions
  const [retirement401k, setRetirement401k] = useState(0)
  const [healthInsurance, setHealthInsurance] = useState(0)
  const [dentalInsurance, setDentalInsurance] = useState(0)
  const [visionInsurance, setVisionInsurance] = useState(0)
  const [fsa, setFsa] = useState(0)
  const [hsa, setHsa] = useState(0)
  
  // Post-tax Deductions
  const [lifeInsurance, setLifeInsurance] = useState(0)
  const [disabilityInsurance, setDisabilityInsurance] = useState(0)
  const [garnishments, setGarnishments] = useState(0)
  const [unionDues, setUnionDues] = useState(0)
  const [otherDeductions, setOtherDeductions] = useState(0)

  // Results State
  const [grossPay, setGrossPay] = useState({
    annual: 0,
    perPeriod: 0
  })
  
  const [taxes, setTaxes] = useState({
    federal: 0,
    state: 0,
    socialSecurity: 0,
    medicare: 0,
    total: 0
  })
  
  const [deductions, setDeductions] = useState({
    preTax: 0,
    postTax: 0,
    total: 0
  })
  
  const [netPay, setNetPay] = useState({
    annual: 0,
    perPeriod: 0
  })

  // Calculate number of pay periods per year
  const getPayPeriodsPerYear = (frequency: string) => {
    switch (frequency) {
      case "weekly": return 52
      case "bi-weekly": return 26
      case "semi-monthly": return 24
      case "monthly": return 12
      default: return 26
    }
  }

  // Calculate gross pay
  useEffect(() => {
    let annual = 0
    const periodsPerYear = getPayPeriodsPerYear(payFrequency)
    
    if (payType === "salary") {
      annual = annualSalary
    } else {
      const weeklyPay = (hoursPerWeek * hourlyRate)
      const overtimePay = includeOvertime ? (overtimeHours * overtimeRate) : 0
      annual = (weeklyPay + overtimePay) * 52
    }
    
    setGrossPay({
      annual,
      perPeriod: annual / periodsPerYear
    })
  }, [
    payType, annualSalary, hourlyRate, hoursPerWeek, 
    payFrequency, includeOvertime, overtimeHours, overtimeRate
  ])

  // Calculate federal tax
  const calculateFederalTax = (taxableIncome: number, status: "single" | "married") => {
    const brackets = federalTaxBrackets2024[status]
    let tax = 0
    let remainingIncome = taxableIncome
    
    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i]
      const prevLimit = i === 0 ? 0 : brackets[i - 1].limit
      const taxableAmount = Math.min(remainingIncome, bracket.limit - prevLimit)
      
      if (taxableAmount <= 0) break
      
      tax += taxableAmount * bracket.rate
      remainingIncome -= taxableAmount
    }
    
    return tax
  }

  // Calculate all deductions and taxes
  useEffect(() => {
    const periodsPerYear = getPayPeriodsPerYear(payFrequency)
    
    // Calculate pre-tax deductions
    const totalPreTax = retirement401k + healthInsurance + dentalInsurance + 
                       visionInsurance + fsa + hsa
    
    // Calculate taxable income
    const taxableIncome = grossPay.annual - totalPreTax
    
    // Calculate taxes
    const federalTax = calculateFederalTax(taxableIncome, filingStatus as "single" | "married")
    const stateTax = taxableIncome * 0.05 // Simplified state tax calculation
    const socialSecurityTax = Math.min(taxableIncome, 160200) * 0.062
    const medicareTax = taxableIncome * 0.0145
    
    const totalTaxes = federalTax + stateTax + socialSecurityTax + medicareTax
    
    // Calculate post-tax deductions
    const totalPostTax = lifeInsurance + disabilityInsurance + garnishments + 
                        unionDues + otherDeductions
    
    // Calculate net pay
    const annualNetPay = grossPay.annual - totalPreTax - totalTaxes - totalPostTax
    
    setTaxes({
      federal: federalTax / periodsPerYear,
      state: stateTax / periodsPerYear,
      socialSecurity: socialSecurityTax / periodsPerYear,
      medicare: medicareTax / periodsPerYear,
      total: totalTaxes / periodsPerYear
    })
    
    setDeductions({
      preTax: totalPreTax / periodsPerYear,
      postTax: totalPostTax / periodsPerYear,
      total: (totalPreTax + totalPostTax) / periodsPerYear
    })
    
    setNetPay({
      annual: annualNetPay,
      perPeriod: annualNetPay / periodsPerYear
    })
  }, [
    grossPay, filingStatus, state, retirement401k, healthInsurance,
    dentalInsurance, visionInsurance, fsa, hsa, lifeInsurance,
    disabilityInsurance, garnishments, unionDues, otherDeductions,
    payFrequency
  ])

  // Chart data for payment breakdown
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

  const pieChartData = {
    labels: ['Net Pay', 'Federal Tax', 'State Tax', 'FICA', 'Deductions'],
    datasets: [{
      data: [
        netPay.perPeriod,
        taxes.federal,
        taxes.state,
        taxes.socialSecurity + taxes.medicare,
        deductions.total
      ],
      backgroundColor: chartColors.primary,
      borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
      borderWidth: 2
    }]
  }

  const barChartData = {
    labels: ['Gross Pay', 'Net Pay'],
    datasets: [
      {
        label: 'Amount per Pay Period',
        data: [grossPay.perPeriod, netPay.perPeriod],
        backgroundColor: chartColors.primary.slice(0, 2),
        borderColor: chartColors.secondary.slice(0, 2).map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
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
    pdf.save('paycheck-calculation.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <TakeHomePaycheckSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Take-Home <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Paycheck</span> Calculator
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your net pay by factoring in taxes, deductions, and benefits to understand exactly how much you'll take home each paycheck.
      </p>
    </div>
  </div>
</section>


        {/* Calculator Section */}
        <section className="py-12">
          <div className="container max-w-[1200px]">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Your Pay Information</CardTitle>
                    <CardDescription>
                      Provide your income details and deductions to calculate your take-home pay.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Income Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Income Details
                      </h3>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Pay Type</Label>
                          <Select value={payType} onValueChange={setPayType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pay type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="salary">Salary</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {payType === "salary" ? (
                          <div className="space-y-2">
                            <Label htmlFor="annual-salary">Annual Salary</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="annual-salary"
                                type="number"
                                className="pl-9"
                                value={annualSalary || ''} onChange={(e) => setAnnualSalary(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="hourly-rate">Hourly Rate</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="hourly-rate"
                                  type="number"
                                  className="pl-9"
                                  value={hourlyRate || ''} onChange={(e) => setHourlyRate(e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="hours-per-week">Hours per Week</Label>
                              <Input
                                id="hours-per-week"
                                type="number"
                                value={hoursPerWeek || ''} onChange={(e) => setHoursPerWeek(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Pay Frequency</Label>
                          <Select value={payFrequency} onValueChange={setPayFrequency}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pay frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                              <SelectItem value="semi-monthly">Semi-monthly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {payType === "hourly" && (
                          <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="include-overtime">Include Overtime</Label>
                              <Switch
                                id="include-overtime"
                                checked={includeOvertime}
                                onCheckedChange={setIncludeOvertime}
                              />
                            </div>
                            
                            {includeOvertime && (
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="overtime-hours">Overtime Hours</Label>
                                  <Input
                                    id="overtime-hours"
                                    type="number"
                                    value={overtimeHours || ''} onChange={(e) => setOvertimeHours(e.target.value === '' ? 0 : Number(e.target.value))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="overtime-rate">Overtime Rate</Label>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                      id="overtime-rate"
                                      type="number"
                                      className="pl-9"
                                      value={overtimeRate || ''} onChange={(e) => setOvertimeRate(e.target.value === '' ? 0 : Number(e.target.value))}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tax Filing Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        Tax Filing Details
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Filing Status</Label>
                          <Select value={filingStatus} onValueChange={setFilingStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select filing status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married Filing Jointly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Select value={state} onValueChange={setState}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NY">New York</SelectItem>
                              <SelectItem value="CA">California</SelectItem>
                              <SelectItem value="TX">Texas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Pre-tax Deductions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BadgeDollarSign className="h-5 w-5 text-primary" />
                        Pre-tax Deductions
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="401k">401(k) Contribution</Label>
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
                          <Label htmlFor="health-insurance">Health Insurance</Label>
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
                          <Label htmlFor="dental-insurance">Dental Insurance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="dental-insurance"
                              type="number"
                              className="pl-9"
                              value={dentalInsurance || ''} onChange={(e) => setDentalInsurance(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vision-insurance">Vision Insurance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="vision-insurance"
                              type="number"
                              className="pl-9"
                              value={visionInsurance || ''} onChange={(e) => setVisionInsurance(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fsa">FSA Contribution</Label>
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
                        <div className="space-y-2">
                          <Label htmlFor="hsa">HSA Contribution</Label>
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

                    {/* Post-tax Deductions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Post-tax Deductions
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="life-insurance">Life Insurance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="life-insurance"
                              type="number"
                              className="pl-9"
                              value={lifeInsurance || ''} onChange={(e) => setLifeInsurance(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="disability-insurance">Disability Insurance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="disability-insurance"
                              type="number"
                              className="pl-9"
                              value={disabilityInsurance || ''} onChange={(e) => setDisabilityInsurance(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="garnishments">Garnishments</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="garnishments"
                              type="number"
                              className="pl-9"
                              value={garnishments || ''} onChange={(e) => setGarnishments(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="union-dues">Union Dues</Label>
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
                          <Label htmlFor="other-deductions">Other Deductions</Label>
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
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              <div id="results-section" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Paycheck Summary</CardTitle>
                      <Button variant="outline" size="icon" onClick={exportPDF}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-muted-foreground">Take-Home Pay</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(netPay.perPeriod)}</p>
                      <p className="text-sm text-muted-foreground">per {payFrequency} paycheck</p>
                    </div>
                    
                    <Separator />
                    
                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="chart">Chart</TabsTrigger>
                        <TabsTrigger value="annual">Annual</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Paycheck Details</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Gross Pay</span>
                              <span className="font-medium">{formatCurrency(grossPay.perPeriod)}</span>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Taxes:</p>
                              <div className="pl-4 space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                  <span>Federal Tax</span>
                                  <span>-{formatCurrency(taxes.federal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span>State Tax</span>
                                  <span>-{formatCurrency(taxes.state)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span>Social Security</span>
                                  <span>-{formatCurrency(taxes.socialSecurity)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span>Medicare</span>
                                  <span>-{formatCurrency(taxes.medicare)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Deductions:</p>
                              <div className="pl-4 space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                  <span>Pre-tax</span>
                                  <span>-{formatCurrency(deductions.preTax)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span>Post-tax</span>
                                  <span>-{formatCurrency(deductions.postTax)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Net Pay</span>
                              <span>{formatCurrency(netPay.perPeriod)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="chart" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie 
                            data={pieChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                  labels: {
                                    padding: 20,
                                    usePointStyle: true,
                                    pointStyle: 'circle'
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                        <div className="h-[200px]">
                          <Bar
                            data={barChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  grid: {
                                    color: 'rgba(156, 163, 175, 0.1)'
                                  }
                                },
                                x: {
                                  grid: {
                                    display: false
                                  }
                                }
                              },
                              plugins: {
                                legend: {
                                  display: false
                                }
                              }
                            }}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="annual" className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Annual Summary</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Annual Gross Pay</span>
                              <span className="font-medium">{formatCurrency(grossPay.annual)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Annual Net Pay</span>
                              <span className="font-medium">{formatCurrency(netPay.annual)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Annual Taxes</span>
                              <span className="font-medium">{formatCurrency(taxes.total * getPayPeriodsPerYear(payFrequency))}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Annual Deductions</span>
                              <span className="font-medium">{formatCurrency(deductions.total * getPayPeriodsPerYear(payFrequency))}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Quick Facts Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pay Periods per Year</span>
                      <span className="font-medium">{getPayPeriodsPerYear(payFrequency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Effective Tax Rate</span>
                      <span className="font-medium">
                        {((taxes.total * getPayPeriodsPerYear(payFrequency)) / grossPay.annual * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Deduction Rate</span>
                      <span className="font-medium">
                        {((deductions.total * getPayPeriodsPerYear(payFrequency)) / grossPay.annual * 100).toFixed(1)}%
                      </span>
                    </div>
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
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mb-2">Payroll Resource</span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 bg-clip-text text-transparent">Understanding Your Paycheck: Beyond the Numbers</h2>
                <p className="mt-3 text-muted-foreground text-lg">A comprehensive guide to understanding how your salary translates to take-home pay</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-green-200 dark:border-green-900">
                <CardHeader className="bg-green-50 dark:bg-green-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-green-600 dark:text-green-400" />
                    Decoding Your Paycheck
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                      <p>
                        The <strong>Take-Home Paycheck Calculator</strong> bridges the gap between your stated salary and what actually lands in your bank account. Understanding this distinction is crucial for effective budgeting and financial planning.
                      </p>
                      <p className="mt-2">
                        Your take-home pay is affected by several key factors:
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Federal, state, and local income taxes</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Social Security and Medicare contributions (FICA)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-600 flex-shrink-0" />
                          <span>Health insurance and retirement plan contributions</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Other voluntary deductions and garnishments</span>
                        </li>
                      </ul>
                    </div>
                    <div className="md:w-[300px] h-[260px] flex-shrink-0">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="py-3 bg-gradient-to-r from-green-100 to-cyan-50 dark:from-green-900/60 dark:to-cyan-900/60">
                          <CardTitle className="text-sm font-medium text-center">Average Paycheck Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full">
                            <Pie 
                              data={{
                                labels: ['Take-Home Pay', 'Federal Taxes', 'FICA', 'State/Local Taxes', 'Benefits'],
                                datasets: [
                                  {
                                    data: [68, 15, 7.65, 5, 4.35],
                                    backgroundColor: [
                                      'rgba(16, 185, 129, 0.8)',
                                      'rgba(239, 68, 68, 0.8)',
                                      'rgba(59, 130, 246, 0.8)',
                                      'rgba(124, 58, 237, 0.8)',
                                      'rgba(249, 115, 22, 0.8)'
                                    ]
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
                                }
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="mt-4 mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-900">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">The Salary Perception Gap</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          A $75,000 salary doesn't mean $6,250 monthly in your bank account. Depending on your location and deductions, your take-home pay could be 65-75% of your gross salary, or approximately $4,000-$4,700 per month.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Withholding Section */}
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                  <h2 className="text-2xl font-bold">Understanding Tax Withholdings</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  <Card className="border-green-200 dark:border-green-800">
                    <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-600 text-white text-sm">1</span>
                        Federal Income Tax
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p>
                        Federal income tax is calculated using a progressive tax system with different marginal tax rates for different income brackets, ranging from 10% to 37%.
                      </p>
                      <div className="mt-3 p-3 bg-green-50/50 dark:bg-green-900/20 rounded-md">
                        <p className="text-sm text-green-800 dark:text-green-300">
                          <strong>Key Factor:</strong> Your W-4 withholding elections significantly impact how much federal tax is withheld from each paycheck.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">2</span>
                        FICA Taxes (Social Security & Medicare)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <p>Fixed percentages that fund federal benefits programs:</p>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-blue-600" />
                            <span>Social Security: 6.2% on income up to $168,600 (2025)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-blue-600" />
                            <span>Medicare: 1.45% on all income (plus 0.9% on income over $200K)</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="state-local-taxes" className="font-bold text-xl mb-4">State & Local Tax Variations</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                      <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        No Income Tax States
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Alaska, Florida, Nevada, South Dakota, Tennessee, Texas, Washington, Wyoming, and New Hampshire (on earned income).
                      </p>
                    </div>
                    
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                      <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Highest Tax States
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        California (13.3%), Hawaii (11%), New Jersey (10.75%), Oregon (9.9%), Minnesota (9.85%), and New York (10.9%).
                      </p>
                    </div>
                    
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                      <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Local Taxes
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cities like NYC, Philadelphia, San Francisco, and Detroit impose additional local income taxes ranging from 1-3.9%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pre-Tax Deductions Section */}
              <div className="mb-12">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                        <span className="text-2xl">Maximizing Your Take-Home Pay</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Strategic pre-tax deductions can significantly increase your net pay
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400 mb-4">Pre-Tax Contribution Benefits</h3>
                        <p className="mb-4">
                          Pre-tax deductions reduce your taxable income, lowering your tax burden while helping you save for the future or pay for essential benefits.
                        </p>
                        
                        <div className="space-y-3">
                          <div className="p-3 border border-cyan-200 dark:border-cyan-900 rounded-md bg-cyan-50/50 dark:bg-cyan-900/20">
                            <div className="flex items-start gap-2">
                              <Briefcase className="h-5 w-5 text-cyan-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-cyan-800 dark:text-cyan-300">Retirement Accounts</p>
                                <p className="text-sm text-cyan-700 dark:text-cyan-400">
                                  401(k), 403(b), 457, and Traditional IRA contributions reduce taxable income now while building retirement savings.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3 border border-cyan-200 dark:border-cyan-900 rounded-md bg-cyan-50/50 dark:bg-cyan-900/20">
                            <div className="flex items-start gap-2">
                              <Heart className="h-5 w-5 text-cyan-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-cyan-800 dark:text-cyan-300">Health Benefits</p>
                                <p className="text-sm text-cyan-700 dark:text-cyan-400">
                                  HSA, FSA, and premium contributions for health insurance can be made pre-tax, reducing your taxable income.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4">Pre-Tax Impact Example</h3>
                        
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm mb-3">For a $75,000 Annual Salary</h4>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="font-medium text-blue-700 dark:text-blue-400">Without Pre-Tax:</div>
                            <div className="font-medium text-blue-700 dark:text-blue-400">With Pre-Tax:</div>
                            <div className="text-blue-600 dark:text-blue-500">$75,000 taxable income</div>
                            <div className="text-blue-600 dark:text-blue-500">$10,000 to 401(k) + $2,500 to HSA</div>
                            <div className="text-blue-600 dark:text-blue-500">$15,000 estimated federal tax</div>
                            <div className="text-blue-600 dark:text-blue-500">$62,500 taxable income</div>
                            <div className="text-blue-600 dark:text-blue-500">$60,000 after federal tax</div>
                            <div className="text-blue-600 dark:text-blue-500">$12,500 estimated federal tax</div>
                            <div className="font-bold text-blue-800 dark:text-blue-300">Take home: $60,000</div>
                            <div className="font-bold text-blue-800 dark:text-blue-300">Take home: $50,000 + $12,500 saved</div>
                          </div>
                          <p className="mt-3 text-xs text-blue-700 dark:text-blue-400">*Simplified example before FICA, state taxes, and other deductions</p>
                        </div>
                        
                        <div className="h-32">
                          <Bar 
                            data={{
                              labels: ['No Pre-Tax', 'With Pre-Tax'],
                              datasets: [{
                                label: 'Total Value (Pay + Pre-Tax Savings)',
                                data: [60000, 62500],
                                backgroundColor: [
                                  'rgba(59, 130, 246, 0.7)',
                                  'rgba(16, 185, 129, 0.7)'
                                ],
                                borderWidth: 1
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                datalabels: {
                                  color: '#fff',
                                  font: { weight: 'bold' },
                                  formatter: (value: number) => '$' + value.toLocaleString()
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

              {/* Tips and Conclusion */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-amber-500" />
                  Optimizing Your Paycheck: Quick Tips
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-5 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <FileEdit className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-base">Review Your W-4</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Regularly update your W-4 withholding form to match your current life circumstances. Too much withholding means giving the government an interest-free loan.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-base">Max Out Pre-Tax Options</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Contribute to retirement plans, HSAs, and FSAs to reduce taxable income while building savings and covering essential expenses.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="overflow-hidden border-green-200 dark:border-green-900">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-cyan-50 dark:from-green-900/40 dark:to-cyan-900/40">
                    <CardTitle id="summary" className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-green-700 dark:text-green-400" />
                      Your Take-Home Pay: Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      Understanding how your salary translates to take-home pay empowers you to make informed financial decisions, from negotiating job offers to planning your monthly budget. Use our Take-Home Paycheck Calculator to get a personalized breakdown of your paycheck and identify opportunities to optimize your income.
                    </p>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-cyan-50 dark:from-green-900/30 dark:to-cyan-900/30 rounded-lg border border-green-100 dark:border-green-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-medium text-lg text-green-800 dark:text-green-300">Ready to calculate your take-home pay?</p>
                          <p className="mt-1 text-green-700 dark:text-green-400">
                            Use our calculator above to see exactly how much of your salary you'll keep after taxes and deductions. Also explore our related calculators:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/tax">
                                <FileText className="h-4 w-4 mr-1" />
                                Tax Estimator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/salary">
                                <Wallet className="h-4 w-4 mr-1" />
                                Salary Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/401k">
                                <Briefcase className="h-4 w-4 mr-1" />
                                401(k) Contributions
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