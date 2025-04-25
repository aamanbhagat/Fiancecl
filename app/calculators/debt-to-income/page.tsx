"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Building, DollarSign, Car, Briefcase, PiggyBank, CreditCard, 
  Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, 
  TrendingUp, LineChart, Home, Landmark, Gem, Scale, Info, Wallet, Minus, Percent, FileText, AlertCircle, Gift, Heart, Users, GraduationCap, LandPlot, Lightbulb, FileEdit, FilePlus, CheckCircle, Clock, Banknote, History, MapPin, Receipt, BadgeDollarSign, Link, Plus, Calendar, XCircle
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { ChartData, ChartOptions } from 'chart.js'
import DebtToIncomeSchema from './schema';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend,
  ChartDataLabels
)

interface DebtItem {
  id: string
  type: string
  amount: number
}

interface IncomeItem {
  id: string
  source: string
  amount: number
}

export default function DTICalculatorPage() {
  // Income State
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([
    { id: '1', source: 'Primary Income', amount: 5000 }
  ])

  // Debt State
  const [debtItems, setDebtItems] = useState<DebtItem[]>([
    { id: '1', type: 'Mortgage/Rent', amount: 1500 },
    { id: '2', type: 'Car Loan', amount: 400 },
    { id: '3', type: 'Credit Cards', amount: 200 }
  ])

  // Results State
  const [dtiRatio, setDtiRatio] = useState(0)
  const [frontEndDTI, setFrontEndDTI] = useState(0)
  const [backEndDTI, setBackEndDTI] = useState(0)
  const [disposableIncome, setDisposableIncome] = useState(0)

  // Calculate DTI ratios and disposable income
  useEffect(() => {
    const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0)
    const totalDebt = debtItems.reduce((sum, item) => sum + item.amount, 0)
    const mortgageRent = debtItems.find(item => item.type === 'Mortgage/Rent')?.amount || 0
    
    const frontEndRatio = (mortgageRent / totalIncome) * 100
    const backEndRatio = (totalDebt / totalIncome) * 100
    const remaining = totalIncome - totalDebt

    setFrontEndDTI(frontEndRatio)
    setBackEndDTI(backEndRatio)
    setDtiRatio(backEndRatio)
    setDisposableIncome(remaining)
  }, [incomeItems, debtItems])

  // Add new income source
  const addIncome = () => {
    setIncomeItems([
      ...incomeItems,
      { id: Date.now().toString(), source: 'Additional Income', amount: 0 }
    ])
  }

  // Add new debt
  const addDebt = () => {
    setDebtItems([
      ...debtItems,
      { id: Date.now().toString(), type: 'Other Debt', amount: 0 }
    ])
  }

  // Remove income source
  const removeIncome = (id: string) => {
    setIncomeItems(incomeItems.filter(item => item.id !== id))
  }

  // Remove debt
  const removeDebt = (id: string) => {
    setDebtItems(debtItems.filter(item => item.id !== id))
  }

  // Update income amount
  const updateIncomeAmount = (id: string, amount: number) => {
    setIncomeItems(incomeItems.map(item => 
      item.id === id ? { ...item, amount } : item
    ))
  }

  // Update income source
  const updateIncomeSource = (id: string, source: string) => {
    setIncomeItems(incomeItems.map(item => 
      item.id === id ? { ...item, source } : item
    ))
  }

  // Update debt amount
  const updateDebtAmount = (id: string, amount: number) => {
    setDebtItems(debtItems.map(item => 
      item.id === id ? { ...item, amount } : item
    ))
  }

  // Update debt type
  const updateDebtType = (id: string, type: string) => {
    setDebtItems(debtItems.map(item => 
      item.id === id ? { ...item, type } : item
    ))
  }

  // Chart data for debt breakdown
  const pieChartData = {
    labels: debtItems.map(item => item.type),
    datasets: [
      {
        data: debtItems.map(item => item.amount),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(20, 184, 166, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(6, 182, 212, 1)',
          'rgba(20, 184, 166, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  // Bar chart data for DTI comparison
  const barChartData = {
    labels: ['Front-End DTI', 'Back-End DTI'],
    datasets: [
      {
        label: 'Your DTI',
        data: [frontEndDTI, backEndDTI],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
      {
        label: 'Recommended Max',
        data: [28, 36],
        backgroundColor: 'rgba(14, 165, 233, 0.4)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
      },
    ],
  }

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 50,
        title: {
          display: true,
          text: 'Percentage (%)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Export results as PDF
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
    pdf.save('dti-calculation-results.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <DebtToIncomeSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Debt-to-Income (DTI) <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your debt-to-income ratio to understand your financial health and borrowing capacity.
      </p>
    </div>
  </div>
</section>

        {/* Calculator Section */}
        <section className="py-12">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Input Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Your Financial Information</CardTitle>
                    <CardDescription>
                      Add your monthly income sources and debt obligations to calculate your DTI ratio.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Income Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Monthly Income</h3>
                        <Button 
                          onClick={addIncome}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add Income
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {incomeItems.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <div className="flex-1">
                              <Label htmlFor={`income-source-${item.id}`}>Source</Label>
                              <Input
                                id={`income-source-${item.id}`}
                                value={item.source}
                                onChange={(e) => updateIncomeSource(item.id, e.target.value)}
                                placeholder="Income source"
                              />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor={`income-amount-${item.id}`}>Amount</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id={`income-amount-${item.id}`}
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) => updateIncomeAmount(item.id, Number(e.target.value))}
                                  className="pl-9"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="flex items-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeIncome(item.id)}
                                className="text-destructive"
                                disabled={incomeItems.length === 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Debt Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Monthly Debts</h3>
                        <Button 
                          onClick={addDebt}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add Debt
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {debtItems.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <div className="flex-1">
                              <Label htmlFor={`debt-type-${item.id}`}>Type</Label>
                              <Input
                                id={`debt-type-${item.id}`}
                                value={item.type}
                                onChange={(e) => updateDebtType(item.id, e.target.value)}
                                placeholder="Debt type"
                              />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor={`debt-amount-${item.id}`}>Amount</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id={`debt-amount-${item.id}`}
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) => updateDebtAmount(item.id, Number(e.target.value))}
                                  className="pl-9"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="flex items-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDebt(item.id)}
                                className="text-destructive"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              <div id="results-section">
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
                  <CardContent>
                    <Tabs defaultValue="summary">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="summary" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">
                                Back-End DTI Ratio
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {dtiRatio.toFixed(1)}%
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {dtiRatio <= 36 ? 'Good' : dtiRatio <= 43 ? 'Fair' : 'High'} DTI Ratio
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">
                                Front-End DTI Ratio
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {frontEndDTI.toFixed(1)}%
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {frontEndDTI <= 28 ? 'Good' : frontEndDTI <= 33 ? 'Fair' : 'High'} Housing Ratio
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                              Monthly Overview
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Income</span>
                                <span className="font-medium">
                                  {formatCurrency(incomeItems.reduce((sum, item) => sum + item.amount, 0))}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Debt</span>
                                <span className="font-medium">
                                  {formatCurrency(debtItems.reduce((sum, item) => sum + item.amount, 0))}
                                </span>
                              </div>
                              <Separator />
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Disposable Income</span>
                                <span className="font-medium">
                                  {formatCurrency(disposableIncome)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="breakdown">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Debt Breakdown</h4>
                          <div className="space-y-2">
                            {debtItems.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{item.type}</span>
                                <span className="font-medium">{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="comparison">
                        <div className="h-[300px]">
                          <Bar data={barChartData} options={barChartOptions} />
                        </div>
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[rgba(99,102,241,0.8)]" />
                            <span className="text-sm text-muted-foreground">Your DTI Ratios</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[rgba(14,165,233,0.4)]" />
                            <span className="text-sm text-muted-foreground">Recommended Maximum</span>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dtiRatio > 43 && (
                        <div className="flex items-start gap-2 text-destructive">
                          <AlertCircle className="h-5 w-5 mt-0.5" />
                          <div>
                            <p className="font-medium">High DTI Ratio</p>
                            <p className="text-sm">Your DTI ratio is above 43%, which may make it difficult to qualify for new loans. Consider reducing your debt or increasing your income.</p>
                          </div>
                        </div>
                      )}
                      {frontEndDTI > 28 && (
                        <div className="flex items-start gap-2 text-yellow-600 dark:text-yellow-500">
                          <AlertCircle className="h-5 w-5 mt-0.5" />
                          <div>
                            <p className="font-medium">High Housing Ratio</p>
                            <p className="text-sm">Your housing costs exceed 28% of your income. Consider ways to reduce your housing expenses or increase your income.</p>
                          </div>
                        </div>
                      )}
                      {disposableIncome < (incomeItems.reduce((sum, item) => sum + item.amount, 0) * 0.2) && (
                        <div className="flex items-start gap-2 text-orange-600 dark:text-orange-500">
                          <AlertCircle className="h-5 w-5 mt-0.5" />
                          <div>
                            <p className="font-medium">Low Disposable Income</p>
                            <p className="text-sm">Your disposable income is less than 20% of your total income. This may make it difficult to save or handle unexpected expenses.</p>
                          </div>
                        </div>
                      )}
                      {dtiRatio <= 36 && frontEndDTI <= 28 && (
                        <div className="flex items-start gap-2 text-green-600 dark:text-green-500">
                          <TrendingUp className="h-5 w-5 mt-0.5" />
                          <div>
                            <p className="font-medium">Healthy DTI Ratios</p>
                            <p className="text-sm">Your debt-to-income ratios are within recommended ranges. Continue maintaining good financial habits.</p>
                          </div>
                        </div>
                      )}
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 mb-2">Financial Wellness Guide</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-rose-700 to-red-600 bg-clip-text text-transparent">Understanding Your Debt-to-Income Ratio: The Key to Financial Balance</h2>
        <p className="mt-3 text-muted-foreground text-lg">How this critical financial metric affects your borrowing power and overall financial health</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-rose-200 dark:border-rose-900">
        <CardHeader className="bg-rose-50 dark:bg-rose-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Understanding Debt-to-Income (DTI) Ratio
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-dti" className="text-2xl font-bold mb-4 text-rose-700 dark:text-rose-400">What is Debt-to-Income Ratio?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                Your <strong>Debt-to-Income (DTI) ratio</strong> is a financial metric that compares your total monthly debt payments to your gross monthly income, expressed as a percentage. This key indicator helps lenders assess your ability to manage monthly payments and repay debts.
              </p>
              <div className="my-4 p-3 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-800">
                <p className="font-medium text-rose-800 dark:text-rose-300">DTI Ratio Formula:</p>
                <div className="mt-2 text-center">
                  <span className="text-xl font-bold text-rose-700 dark:text-rose-400">
                    DTI (%) = (Total Monthly Debt Payments ÷ Gross Monthly Income) × 100
                  </span>
                </div>
              </div>
              
              <p className="mt-4">
                Lenders and financial institutions use DTI as a crucial factor when:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-rose-600 flex-shrink-0" />
                  <span>Evaluating mortgage applications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-rose-600 flex-shrink-0" />
                  <span>Approving credit cards and credit limits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-rose-600 flex-shrink-0" />
                  <span>Determining personal and auto loan eligibility</span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-rose-600 flex-shrink-0" />
                  <span>Assessing debt refinancing options</span>
                </li>
              </ul>
            </div>
            
            <div className="md:w-[300px] h-[280px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-rose-100 to-red-50 dark:from-rose-900/60 dark:to-red-900/60">
                  <CardTitle className="text-sm font-medium text-center">DTI Threshold Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Pie 
                      data={{
                        labels: ['Excellent: Below 28%', 'Good: 28-36%', 'Concerning: 37-42%', 'Dangerous: 43-49%', 'Critical: 50%+'],
                        datasets: [
                          {
                            data: [28, 8, 6, 7, 51],
                            backgroundColor: [
                              'rgba(16, 185, 129, 0.8)', // Green
                              'rgba(59, 130, 246, 0.8)', // Blue
                              'rgba(245, 158, 11, 0.8)', // Amber
                              'rgba(249, 115, 22, 0.8)', // Orange
                              'rgba(239, 68, 68, 0.8)'   // Red
                            ],
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, padding: 8, font: { size: 11 } }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <h4 id="dti-importance" className="font-semibold text-xl mt-6">Why Your DTI Ratio Is Critical to Financial Health</h4>
          <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Lending Decisions</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Most conventional mortgages require a DTI below 43%, with ideal ratios under 36%</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Interest Rates</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Lower DTI ratios often qualify you for better interest rates, potentially saving thousands</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Financial Flexibility</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">High DTI leaves little room for savings, investments, or handling emergencies</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Types of DTI Section */}
      <div className="mb-12" id="dti-types">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-6 w-6 text-rose-600" />
          <h2 className="text-2xl font-bold">The Two Critical DTI Measurements</h2>
        </div>
        <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 p-6 rounded-xl mb-6 border border-rose-100 dark:border-rose-800">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-rose-200 dark:border-rose-800">
              <CardHeader className="bg-rose-50 dark:bg-rose-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Home className="h-5 w-5 text-rose-600" />
                  Front-End DTI (Housing Ratio)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <p className="font-medium">Calculation: Housing Costs ÷ Monthly Income</p>
                  <div className="p-3 bg-rose-100/50 dark:bg-rose-900/50 rounded-md">
                    <p className="font-medium text-rose-800 dark:text-rose-300">Housing costs include:</p>
                    <ul className="mt-2 space-y-1 text-sm text-rose-700 dark:text-rose-400">
                      <li>• Mortgage or rent payments</li>
                      <li>• Property taxes</li>
                      <li>• Homeowner's insurance</li>
                      <li>• HOA fees</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The ideal front-end DTI is 28% or less. This ratio helps determine if your housing costs are appropriate for your income level.
                  </p>
                </div>
                
                <div className="mt-4 h-[140px]">
                  <Bar 
                    data={{
                      labels: ['Recommended', 'Maximum', 'High Risk'],
                      datasets: [{
                        label: 'Front-End DTI Thresholds',
                        data: [28, 36, 42],
                        backgroundColor: [
                          'rgba(16, 185, 129, 0.7)',
                          'rgba(245, 158, 11, 0.7)',
                          'rgba(239, 68, 68, 0.7)'
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
                          max: 50,
                          ticks: { callback: value => value + '%' }
                        }
                      },
                      plugins: {
                        legend: { display: false },
                        datalabels: {
                          color: '#fff',
                          font: { weight: 'bold' },
                          formatter: (value) => value + '%'
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-rose-200 dark:border-rose-800">
              <CardHeader className="bg-rose-50 dark:bg-rose-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-rose-600" />
                  Back-End DTI (Total Debt Ratio)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <p className="font-medium">Calculation: All Monthly Debts ÷ Monthly Income</p>
                  <div className="p-3 bg-rose-100/50 dark:bg-rose-900/50 rounded-md">
                    <p className="font-medium text-rose-800 dark:text-rose-300">Includes all debt payments:</p>
                    <ul className="mt-2 space-y-1 text-sm text-rose-700 dark:text-rose-400">
                      <li>• All housing costs</li>
                      <li>• Credit card minimum payments</li>
                      <li>• Auto, personal, and student loans</li>
                      <li>• Child support and alimony</li>
                      <li>• Other recurring debt obligations</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Lenders typically prefer back-end DTI of 36% or less, though some loan programs allow up to 43% or higher.
                  </p>
                </div>
                
                <div className="mt-4 h-[140px]">
                  <Bar 
                    data={{
                      labels: ['Conservative', 'Conventional', 'FHA', 'High Risk'],
                      datasets: [{
                        label: 'Back-End DTI Thresholds',
                        data: [36, 43, 50, 60],
                        backgroundColor: [
                          'rgba(16, 185, 129, 0.7)',
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(245, 158, 11, 0.7)',
                          'rgba(239, 68, 68, 0.7)'
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
                          max: 70,
                          ticks: { callback: value => value + '%' }
                        }
                      },
                      plugins: {
                        legend: { display: false },
                        datalabels: {
                          color: '#fff',
                          font: { weight: 'bold' },
                          formatter: (value) => value + '%'
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <h3 id="dti-calculation" className="text-xl font-bold mt-8 mb-4">How Lenders Calculate Your DTI</h3>
        
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-zinc-100 to-slate-100 dark:from-zinc-900/60 dark:to-slate-900/60">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-rose-600" /> 
              Sample DTI Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-lg mb-2">Monthly Income</p>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b border-slate-200 dark:border-slate-800">
                            <td className="py-2">Gross Monthly Salary</td>
                            <td className="py-2 text-right font-medium">$6,500</td>
                          </tr>
                          <tr className="border-b border-slate-200 dark:border-slate-800">
                            <td className="py-2">Side Business Income</td>
                            <td className="py-2 text-right font-medium">$1,000</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-medium">Total Monthly Income</td>
                            <td className="py-2 text-right font-bold">$7,500</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-lg mb-2">Monthly Debt Payments</p>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b border-slate-200 dark:border-slate-800">
                            <td className="py-2">Mortgage Payment</td>
                            <td className="py-2 text-right font-medium">$1,600</td>
                          </tr>
                          <tr className="border-b border-slate-200 dark:border-slate-800">
                            <td className="py-2">Auto Loan</td>
                            <td className="py-2 text-right font-medium">$450</td>
                          </tr>
                          <tr className="border-b border-slate-200 dark:border-slate-800">
                            <td className="py-2">Student Loans</td>
                            <td className="py-2 text-right font-medium">$350</td>
                          </tr>
                          <tr className="border-b border-slate-200 dark:border-slate-800">
                            <td className="py-2">Credit Card Minimum</td>
                            <td className="py-2 text-right font-medium">$200</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-medium">Total Monthly Debt</td>
                            <td className="py-2 text-right font-bold">$2,600</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-800">
                    <p className="font-medium text-rose-800 dark:text-rose-300 mb-2">DTI Calculation</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Front-End DTI:</span>
                        <span className="font-bold">$1,600 ÷ $7,500 = 21.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Back-End DTI:</span>
                        <span className="font-bold">$2,600 ÷ $7,500 = 34.7%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-[300px] flex-shrink-0">
                <h4 className="text-center text-sm font-medium mb-3">DTI Ratio Breakdown</h4>
                <div className="h-[300px]">
                  <Pie
                    data={{
                      labels: ['Housing Costs', 'Auto Loan', 'Student Loans', 'Credit Cards', 'Remaining Income'],
                      datasets: [{
                        label: 'Percentage of Income',
                        data: [21.3, 6, 4.7, 2.7, 65.3],
                        backgroundColor: [
                          'rgba(239, 68, 68, 0.7)',
                          'rgba(249, 115, 22, 0.7)',
                          'rgba(245, 158, 11, 0.7)',
                          'rgba(124, 58, 237, 0.7)',
                          'rgba(16, 185, 129, 0.7)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } },
                        datalabels: {
                          color: '#fff',
                          font: { weight: 'bold', size: 11 },
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
      </div>

      {/* DTI Impact Section */}
      <div className="mb-12" id="dti-impact">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Building className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                <span className="text-2xl">How DTI Impacts Loan Approval</span>
              </div>
            </CardTitle>
            <CardDescription>
              Different loan types have different DTI requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div>
                <h3 id="loan-types" className="text-xl font-bold text-amber-700 dark:text-amber-400 mb-4">Loan Type Requirements</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50/50 dark:bg-amber-900/20">
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-amber-600 mt-1" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">Conventional Mortgages</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-amber-700 dark:text-amber-400">Maximum Front-End DTI:</span>
                            <span className="font-medium">28%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-amber-700 dark:text-amber-400">Maximum Back-End DTI:</span>
                            <span className="font-medium">36% (up to 43% with strong credit)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50/50 dark:bg-amber-900/20">
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-amber-600 mt-1" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">FHA Loans</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-amber-700 dark:text-amber-400">Maximum Front-End DTI:</span>
                            <span className="font-medium">31%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-amber-700 dark:text-amber-400">Maximum Back-End DTI:</span>
                            <span className="font-medium">43% (up to 50% with compensating factors)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50/50 dark:bg-amber-900/20">
                    <div className="flex items-start gap-3">
                      <Wallet className="h-5 w-5 text-amber-600 mt-1" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">VA & USDA Loans</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-amber-700 dark:text-amber-400">DTI Focus:</span>
                            <span className="font-medium">Back-End ratio is primary concern</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-amber-700 dark:text-amber-400">Maximum Back-End DTI:</span>
                            <span className="font-medium">41% (higher with strong residual income)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                <h3 id="rate-impact" className="text-xl font-bold text-amber-700 dark:text-amber-400 mb-4">DTI Impact on Interest Rates</h3>
                <div className="h-[280px]">
                  <Line 
                    data={{
                      labels: ['< 28%', '28-35%', '36-42%', '43-45%', '46-49%', '≥ 50%'],
                      datasets: [
                        {
                          label: 'Interest Rate Adjustment',
                          data: [0, 0.125, 0.25, 0.5, 0.875, 1.25],
                          borderColor: 'rgba(239, 68, 68, 0.8)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          borderWidth: 2,
                          yAxisID: 'y'
                        },
                        {
                          label: 'Loan Approval Likelihood',
                          data: [95, 90, 75, 50, 25, 10],
                          borderColor: 'rgba(16, 185, 129, 0.8)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderWidth: 2,
                          tension: 0.4,
                          yAxisID: 'y1'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          position: 'left',
                          title: {
                            display: true,
                            text: 'Rate Increase (%)'
                          },
                          grid: {
                            display: false
                          }
                        },
                        y1: {
                          beginAtZero: true,
                          max: 100,
                          position: 'right',
                          title: {
                            display: true,
                            text: 'Approval Likelihood (%)'
                          },
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
                
                <div className="p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-md">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>Example:</strong> On a $350,000 mortgage, moving from a 30% DTI to a 45% DTI could cost you an additional 0.5% in interest rate—adding around $100,000 in interest over a 30-year term.
                  </p>
                </div>
                
                <div className="flex items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                  <Lightbulb className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mr-4" />
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">Pro Tip</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                      Consider keeping your DTI below 36% even if you qualify for higher ratios. This provides financial flexibility and usually results in better loan terms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 id="real-examples" className="text-xl font-bold text-amber-700 dark:text-amber-400 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Real-World DTI Impact Examples
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Mortgage Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Annual Income:</span>
                      <span className="font-medium">$90,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Income:</span>
                      <span className="font-medium">$7,500</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current DTI:</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max Monthly Payment:</span>
                      <span className="font-medium">$2,100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mortgage Qualification:</span>
                      <span className="font-medium">$348,000</span>
                    </div>
                    <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-700 dark:text-amber-400">
                      Reducing DTI to 36% would increase qualification to $465,000
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Auto Loan Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Annual Income:</span>
                      <span className="font-medium">$60,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Income:</span>
                      <span className="font-medium">$5,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current DTI:</span>
                      <span className="font-medium">40%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Existing Debt:</span>
                      <span className="font-medium">$2,000/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max Auto Payment:</span>
                      <span className="font-medium">$250/month</span>
                    </div>
                    <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-700 dark:text-amber-400">
                      Limits car purchase to approximately $14,000 at current rates
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Credit Card Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Annual Income:</span>
                      <span className="font-medium">$75,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Income:</span>
                      <span className="font-medium">$6,250</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current DTI:</span>
                      <span className="font-medium">50%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Credit Card Application:</span>
                      <span className="font-medium text-rose-600">Denied</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Credit Limit If Approved:</span>
                      <span className="font-medium">$2,500</span>
                    </div>
                    <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-700 dark:text-amber-400">
                      At 35% DTI, likely approval with $10,000 credit limit
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improving DTI Section */}
      <div className="mb-12" id="improve-dti">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-600" />
          Strategic Approaches to Improve Your DTI Ratio
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Minus className="h-5 w-5 text-emerald-600" />
                Debt Reduction Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">Debt Snowball Method</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      Pay off smaller debts first for psychological wins and momentum. Focus on eliminating monthly payments to reduce DTI quickly.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">Balance Transfer or Debt Consolidation</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      Consolidate high-interest debts to lower overall monthly payments. Careful planning is essential to ensure this actually lowers your DTI.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">Refinancing</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      Extend loan terms or secure lower interest rates to reduce monthly debt obligations. Especially effective for auto loans or mortgages.
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <h4 className="text-center text-sm font-medium mb-3">Payment Impact on DTI</h4>
                  <div className="h-[180px]">
                    <Bar 
                      data={{
                        labels: ['Current DTI', 'Pay Off Credit Card', 'Pay Off Car Loan', 'Both Paid Off'],
                        datasets: [{
                          label: 'DTI Ratio',
                          data: [42, 38, 34, 30],
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(16, 185, 129, 0.7)'
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
                            max: 50,
                            ticks: { callback: value => value + '%' }
                          }
                        },
                        plugins: {
                          legend: { display: false },
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
          
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                Income Enhancement Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Document All Income Sources</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Ensure all legitimate income is included in DTI calculations. This includes part-time work, rental income, alimony, and consistent bonuses or overtime (with 2-year history).
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Side Income Development</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Establish documentable side income streams that can be counted toward DTI. Remember that most lenders require a 2-year history to include this in calculations.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Career Advancement</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Pursue promotions, additional certifications, or job changes that increase your income. As your income rises with stable debt levels, your DTI automatically improves.
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <h4 className="text-center text-sm font-medium mb-3">Income Impact on DTI</h4>
                  <div className="h-[180px]">
                    <Line 
                      data={{
                        labels: ['$5,000', '$6,000', '$7,000', '$8,000', '$9,000', '$10,000'],
                        datasets: [
                          {
                            label: 'DTI with $2,000 Monthly Debt',
                            data: [40, 33.3, 28.6, 25, 22.2, 20],
                            borderColor: 'rgba(59, 130, 246, 0.8)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: { 
                            title: { 
                              display: true,
                              text: 'Monthly Gross Income' 
                            } 
                          },
                          y: {
                            beginAtZero: false,
                            title: { 
                              display: true,
                              text: 'DTI Ratio (%)' 
                            },
                            ticks: { callback: value => value + '%' }
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

        <Card className="border-purple-200 dark:border-purple-900 overflow-hidden">
          <CardHeader className="bg-purple-50 dark:bg-purple-900/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              DTI Improvement Timeline
            </CardTitle>
            <CardDescription>
              Strategic planning for different timeframes before loan applications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center mb-3">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium text-sm mr-3">1M</span>
                    <h4 className="font-medium text-purple-800 dark:text-purple-300">1 Month Before Application</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-400">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-rose-600 mt-1 flex-shrink-0" />
                      <span>Don't open new credit accounts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-rose-600 mt-1 flex-shrink-0" />
                      <span>Avoid large purchases on credit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <span>Pay down credit card balances</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center mb-3">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium text-sm mr-3">6M</span>
                    <h4 className="font-medium text-purple-800 dark:text-purple-300">6 Months Before Application</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <span>Pay off or refinance small loans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <span>Request credit line increases (but don't use them)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <span>Document all income sources</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center mb-3">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium text-sm mr-3">1Y+</span>
                    <h4 className="font-medium text-purple-800 dark:text-purple-300">1+ Year Before Application</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <span>Develop additional income streams</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <span>Implement strategic debt payoff plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <span>Pursue career advancement opportunities</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <History className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-300">Case Study: DTI Improvement Success</p>
                    <div className="mt-3 space-y-3">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-3 bg-white dark:bg-gray-900 rounded shadow-sm">
                          <p className="font-medium text-sm mb-2">Starting Position:</p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• $70,000 annual income ($5,833/month)</li>
                            <li>• $2,625 monthly debt payments</li>
                            <li>• DTI: 45%</li>
                            <li>• Mortgage application denied</li>
                          </ul>
                        </div>
                        
                        <div className="p-3 bg-white dark:bg-gray-900 rounded shadow-sm">
                          <p className="font-medium text-sm mb-2">After 8-Month Strategy:</p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• $75,000 annual income ($6,250/month)</li>
                            <li>• $1,875 monthly debt payments</li>
                            <li>• DTI: 30%</li>
                            <li>• Mortgage approved with better rate</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="h-[140px]">
                        <Line 
                          data={{
                            labels: ['Start', 'Month 2', 'Month 4', 'Month 6', 'Month 8'],
                            datasets: [
                              {
                                label: 'DTI Reduction Path',
                                data: [45, 42, 38, 33, 30],
                                borderColor: 'rgba(16, 185, 129, 0.8)',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                tension: 0.4
                              },
                              {
                                label: 'Target DTI',
                                data: [36, 36, 36, 36, 36],
                                borderColor: 'rgba(239, 68, 68, 0.5)',
                                borderDash: [5, 5],
                                borderWidth: 2,
                                pointRadius: 0
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                suggestedMax: 50,
                                ticks: { callback: value => value + '%' }
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground text-center">
                        Actions taken: Paid off auto loan, consolidated credit cards, eliminated personal loan, secured promotion
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conclusion Section */}
      <div className="mb-6" id="conclusion">
        <Card className="overflow-hidden border-rose-200 dark:border-rose-900">
          <CardHeader className="bg-gradient-to-r from-rose-100 to-red-50 dark:from-rose-900/40 dark:to-red-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-rose-700 dark:text-rose-400" />
              Managing Your DTI: The Path Forward
            </CardTitle>
            <CardDescription>
              Taking control of your debt-to-income ratio for financial success
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              Your <strong>debt-to-income ratio</strong> is more than just a number—it's a window into your financial health and a key determinant of your borrowing power. By understanding how DTI is calculated and actively managing both sides of the equation—decreasing debt and increasing income—you can significantly improve your financial options and flexibility.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Key takeaways to remember about DTI:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-100 dark:border-rose-800">
                <h4 className="font-medium text-rose-800 dark:text-rose-300 mb-2">DTI Impact</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold dark:bg-rose-900 dark:text-rose-300">→</span>
                    <span className="text-rose-800 dark:text-rose-300">Affects loan approval chances and interest rates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold dark:bg-rose-900 dark:text-rose-300">→</span>
                    <span className="text-rose-800 dark:text-rose-300">Front-end and back-end DTI provide different insights</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold dark:bg-rose-900 dark:text-rose-300">→</span>
                    <span className="text-rose-800 dark:text-rose-300">Lower DTI provides greater financial flexibility</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Action Steps</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                    <span className="text-blue-800 dark:text-blue-300">Calculate your current front-end and back-end DTI</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                    <span className="text-blue-800 dark:text-blue-300">Create a strategic debt reduction plan</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                    <span className="text-blue-800 dark:text-blue-300">Explore opportunities to increase and document all income</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/30 dark:to-red-900/30 rounded-lg border border-rose-100 dark:border-rose-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-rose-600 dark:text-rose-400" />
                <div>
                  <p className="font-medium text-lg text-rose-800 dark:text-rose-300">Ready to assess and improve your DTI?</p>
                  <p className="mt-1 text-rose-700 dark:text-rose-400">
                    Use our <strong>DTI Calculator</strong> above to analyze your current situation and simulate improvement scenarios. For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/mortgage-affordability">
                        <Home className="h-4 w-4 mr-1" />
                        Mortgage Affordability
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/debt-payoff">
                        <Wallet className="h-4 w-4 mr-1" />
                        Debt Payoff Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/budget">
                        <Banknote className="h-4 w-4 mr-1" />
                        Budget Planner
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