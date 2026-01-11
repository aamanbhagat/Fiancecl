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
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Briefcase, Building, CreditCard, Wallet, GraduationCap, Heart, Home, Gift, FileText, Percent, Minus, Users, ArrowUpDown, ArrowLeftRight, Clock, Calendar, MapPin, Package, Laptop, Baby, FilePlus, Lightbulb, Banknote, CheckCircle, XCircle, History, FileEdit, LandPlot } from "lucide-react"
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
import MarriageTaxSchema from './schema';

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

// 2023 Tax Brackets
const taxBrackets = {
  single: [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 }
  ],
  joint: [
    { min: 0, max: 22000, rate: 0.10 },
    { min: 22000, max: 89450, rate: 0.12 },
    { min: 89450, max: 190750, rate: 0.22 },
    { min: 190750, max: 364200, rate: 0.24 },
    { min: 364200, max: 462500, rate: 0.32 },
    { min: 462500, max: 693750, rate: 0.35 },
    { min: 693750, max: Infinity, rate: 0.37 }
  ]
}

export default function MarriageTaxCalculator() {
  // Income & Filing Details
  const [person1Income, setPerson1Income] = useState(75000)
  const [person2Income, setPerson2Income] = useState(65000)
  const [standardDeduction, setStandardDeduction] = useState(true)
  const [itemizedDeductions, setItemizedDeductions] = useState(0)
  const [dependents, setDependents] = useState(0)
  const [hasChildCareExpenses, setHasChildCareExpenses] = useState(false)
  const [childCareExpenses, setChildCareExpenses] = useState(0)
  const [hasMortgageInterest, setHasMortgageInterest] = useState(false)
  const [mortgageInterest, setMortgageInterest] = useState(0)
  const [hasCharitableDonations, setHasCharitableDonations] = useState(false)
  const [charitableDonations, setCharitableDonations] = useState(0)
  const [stateWithholding, setStateWithholding] = useState(5)
  
  // Results State
  const [singleTax1, setSingleTax1] = useState(0)
  const [singleTax2, setSingleTax2] = useState(0)
  const [jointTax, setJointTax] = useState(0)
  const [separateTax, setSeparateTax] = useState(0)
  const [marriagePenalty, setMarriagePenalty] = useState(0)
  const [effectiveRates, setEffectiveRates] = useState({
    single1: 0,
    single2: 0,
    joint: 0,
    separate: 0
  })

  // Calculate tax for a given income and filing status
  const calculateTax = (income: number, status: 'single' | 'joint') => {
    const brackets = taxBrackets[status]
    let tax = 0
    let remainingIncome = income
    
    for (const bracket of brackets) {
      const taxableInBracket = Math.min(
        Math.max(0, remainingIncome),
        bracket.max - bracket.min
      )
      tax += taxableInBracket * bracket.rate
      remainingIncome -= taxableInBracket
      if (remainingIncome <= 0) break
    }
    
    return tax
  }

  // Update calculations when inputs change
  useEffect(() => {
    // Calculate standard deduction amounts
    const singleStandardDeduction = 13850
    const jointStandardDeduction = 27700
    
    // Calculate total itemized deductions
    const totalItemizedDeductions = mortgageInterest + charitableDonations
    
    // Calculate deductions for each scenario
    const singleDeduction = standardDeduction ? singleStandardDeduction : totalItemizedDeductions / 2
    const jointDeduction = standardDeduction ? jointStandardDeduction : totalItemizedDeductions
    
    // Calculate taxable income for each scenario
    const taxableIncome1 = Math.max(0, person1Income - singleDeduction)
    const taxableIncome2 = Math.max(0, person2Income - singleDeduction)
    const jointTaxableIncome = Math.max(0, person1Income + person2Income - jointDeduction)
    const separateTaxableIncome1 = Math.max(0, person1Income - jointDeduction / 2)
    const separateTaxableIncome2 = Math.max(0, person2Income - jointDeduction / 2)
    
    // Calculate taxes for each scenario
    const tax1 = calculateTax(taxableIncome1, 'single')
    const tax2 = calculateTax(taxableIncome2, 'single')
    const combinedSingleTax = tax1 + tax2
    const marriedJointTax = calculateTax(jointTaxableIncome, 'joint')
    const marriedSeparateTax = calculateTax(separateTaxableIncome1, 'single') + 
                              calculateTax(separateTaxableIncome2, 'single')
    
    // Calculate child tax credit
    const childTaxCredit = dependents * 2000 // Simplified calculation
    
    // Apply credits
    const finalJointTax = Math.max(0, marriedJointTax - childTaxCredit)
    const finalSeparateTax = Math.max(0, marriedSeparateTax - childTaxCredit)
    const finalSingleTax1 = Math.max(0, tax1 - (childTaxCredit / 2))
    const finalSingleTax2 = Math.max(0, tax2 - (childTaxCredit / 2))
    
    // Calculate marriage penalty/bonus
    const penalty = finalJointTax - (finalSingleTax1 + finalSingleTax2)
    
    // Calculate effective tax rates
    const totalIncome = person1Income + person2Income
    const effectiveRate1 = (finalSingleTax1 / person1Income) * 100
    const effectiveRate2 = (finalSingleTax2 / person2Income) * 100
    const effectiveJointRate = (finalJointTax / totalIncome) * 100
    const effectiveSeparateRate = (finalSeparateTax / totalIncome) * 100
    
    // Update state
    setSingleTax1(finalSingleTax1)
    setSingleTax2(finalSingleTax2)
    setJointTax(finalJointTax)
    setSeparateTax(finalSeparateTax)
    setMarriagePenalty(penalty)
    setEffectiveRates({
      single1: effectiveRate1,
      single2: effectiveRate2,
      joint: effectiveJointRate,
      separate: effectiveSeparateRate
    })
    
  }, [
    person1Income,
    person2Income,
    standardDeduction,
    itemizedDeductions,
    dependents,
    hasChildCareExpenses,
    childCareExpenses,
    hasMortgageInterest,
    mortgageInterest,
    hasCharitableDonations,
    charitableDonations,
    stateWithholding
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

  // Tax comparison chart data
  const comparisonChartData = {
    labels: ['Single (Combined)', 'Married Filing Jointly', 'Married Filing Separately'],
    datasets: [
      {
        label: 'Federal Tax',
        data: [singleTax1 + singleTax2, jointTax, separateTax],
        backgroundColor: chartColors.primary.slice(0, 3),
        borderColor: chartColors.secondary.slice(0, 3).map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const comparisonChartOptions: ChartOptions<'bar'> = {
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
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw as number;
            return (value < 0 ? "Bonus: $" : "Penalty: $") + Math.abs(value).toLocaleString();
          }
        }
      }
    }
  }

  // Effective tax rate chart data
  const effectiveRateChartData = {
    labels: ['Person 1 (Single)', 'Person 2 (Single)', 'Joint', 'Separate'],
    datasets: [
      {
        label: 'Effective Tax Rate',
        data: [
          effectiveRates.single1,
          effectiveRates.single2,
          effectiveRates.joint,
          effectiveRates.separate
        ],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const effectiveRateChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => value + '%'
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
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw as number;
            return (value < 0 ? "Bonus: $" : "Penalty: $") + Math.abs(value).toLocaleString();
          }
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
    pdf.save('marriage-tax-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <MarriageTaxSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Marriage Tax <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate how marriage affects your tax situation and discover if you'll receive a marriage bonus or penalty.
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
                    <CardTitle>Enter Income & Tax Details</CardTitle>
                    <CardDescription>
                      Provide information about both individuals' income and tax situation to calculate the marriage tax impact.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Income Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Income Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="person1-income">Person 1 Annual Income</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="person1-income"
                              type="number"
                              className="pl-9"
                              value={person1Income}
                              onChange={(e) => setPerson1Income(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="person2-income">Person 2 Annual Income</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="person2-income"
                              type="number"
                              className="pl-9"
                              value={person2Income}
                              onChange={(e) => setPerson2Income(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deductions & Credits */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Deductions & Credits</h3>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="standard-deduction">Use Standard Deduction</Label>
                            <Switch
                              id="standard-deduction"
                              checked={standardDeduction}
                              onCheckedChange={setStandardDeduction}
                            />
                          </div>
                          {!standardDeduction && (
                            <div className="space-y-4 mt-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="mortgage-interest">Mortgage Interest</Label>
                                  <Switch
                                    id="mortgage-interest"
                                    checked={hasMortgageInterest}
                                    onCheckedChange={setHasMortgageInterest}
                                  />
                                </div>
                                {hasMortgageInterest && (
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                      type="number"
                                      className="pl-9"
                                      value={mortgageInterest || ''} onChange={(e) => setMortgageInterest(e.target.value === '' ? 0 : Number(e.target.value))}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="charitable-donations">Charitable Donations</Label>
                                  <Switch
                                    id="charitable-donations"
                                    checked={hasCharitableDonations}
                                    onCheckedChange={setHasCharitableDonations}
                                  />
                                </div>
                                {hasCharitableDonations && (
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                      type="number"
                                      className="pl-9"
                                      value={charitableDonations || ''} onChange={(e) => setCharitableDonations(e.target.value === '' ? 0 : Number(e.target.value))}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dependents">Number of Dependents</Label>
                          <Select value={String(dependents)} onValueChange={(value) => setDependents(Number(value))}>
                            <SelectTrigger id="dependents">
                              <SelectValue placeholder="Select number of dependents" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">No dependents</SelectItem>
                              <SelectItem value="1">1 dependent</SelectItem>
                              <SelectItem value="2">2 dependents</SelectItem>
                              <SelectItem value="3">3 dependents</SelectItem>
                              <SelectItem value="4">4 dependents</SelectItem>
                              <SelectItem value="5">5 or more dependents</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {dependents > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="child-care">Child Care Expenses</Label>
                              <Switch
                                id="child-care"
                                checked={hasChildCareExpenses}
                                onCheckedChange={setHasChildCareExpenses}
                              />
                            </div>
                            {hasChildCareExpenses && (
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  type="number"
                                  className="pl-9"
                                  value={childCareExpenses || ''} onChange={(e) => setChildCareExpenses(e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* State Tax Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">State Tax Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="state-tax">State Tax Rate</Label>
                          <span className="text-sm text-muted-foreground">{stateWithholding}%</span>
                        </div>
                        <Slider
                          id="state-tax"
                          min={0}
                          max={13}
                          step={0.1}
                          value={[stateWithholding]}
                          onValueChange={(value) => setStateWithholding(value[0])}
                        />
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
                      <p className="text-sm text-muted-foreground">Marriage Tax Impact</p>
                      <p className={cn(
                        "text-4xl font-bold",
                        marriagePenalty > 0 ? "text-destructive" : "text-primary"
                      )}>
                        {marriagePenalty > 0 
                          ? `${formatCurrency(marriagePenalty)} Penalty`
                          : `${formatCurrency(Math.abs(marriagePenalty))} Bonus`
                        }
                      </p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="comparison" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="comparison">Tax Comparison</TabsTrigger>
                        <TabsTrigger value="rates">Effective Rates</TabsTrigger>
                      </TabsList>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={comparisonChartData} options={comparisonChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Filing Status Comparison</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Single (Person 1)</span>
                              <span className="font-medium">{formatCurrency(singleTax1)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Single (Person 2)</span>
                              <span className="font-medium">{formatCurrency(singleTax2)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Married Filing Jointly</span>
                              <span className="font-medium">{formatCurrency(jointTax)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Married Filing Separately</span>
                              <span className="font-medium">{formatCurrency(separateTax)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="rates" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={effectiveRateChartData} options={effectiveRateChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Effective Tax Rates</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Person 1 (Single)</span>
                              <span className="font-medium">{effectiveRates.single1.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Person 2 (Single)</span>
                              <span className="font-medium">{effectiveRates.single2.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Married Filing Jointly</span>
                              <span className="font-medium">{effectiveRates.joint.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Married Filing Separately</span>
                              <span className="font-medium">{effectiveRates.separate.toFixed(1)}%</span>
                            </div>
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
                            <p className="font-medium">Filing Recommendation</p>
                            <p className="text-sm text-muted-foreground">
                              {jointTax <= separateTax
                                ? "Based on your situation, filing jointly would be more beneficial."
                                : "Based on your situation, filing separately might be worth considering."
                              }
                              {marriagePenalty > 0
                                ? " However, you may experience a marriage penalty due to combined income pushing you into a higher tax bracket."
                                : " You'll benefit from a marriage bonus due to more favorable tax treatment of your combined income."
                              }
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
  
    
      </main>
      <SiteFooter />
    </div>
  )
}