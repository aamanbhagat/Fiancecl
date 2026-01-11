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
import { Calculator, Download, Info, DollarSign, Percent, Clock, TrendingUp, BarChart3, Share2, RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from "next/link"
import CDSchema from './schema';

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
  LineElement
)

export default function CDCalculator() {
  // State for calculator inputs
  const [principal, setPrincipal] = useState(10000)
  const [rate, setRate] = useState(4.5)
  const [term, setTerm] = useState(12)
  const [compoundingFrequency, setCompoundingFrequency] = useState("monthly")
  const [includeEarlyWithdrawal, setIncludeEarlyWithdrawal] = useState(false)
  const [earlyWithdrawalMonth, setEarlyWithdrawalMonth] = useState(6)
  const [earlyWithdrawalPenalty, setEarlyWithdrawalPenalty] = useState(3)
  
  // State for calculator outputs
  const [futureValue, setFutureValue] = useState(0)
  const [interestEarned, setInterestEarned] = useState(0)
  const [apy, setAPY] = useState(0)
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<{ month: number; balance: number; interest: number }[]>([])

  // Calculate compounding periods per year
  const getCompoundingPeriods = () => {
    switch (compoundingFrequency) {
      case "annually": return 1
      case "semi-annually": return 2
      case "quarterly": return 4
      case "monthly": return 12
      case "daily": return 365
      default: return 12
    }
  }

  // Calculate results
  useEffect(() => {
    const n = getCompoundingPeriods()
    const r = rate / 100
    const t = term / 12
    
    // Calculate APY
    const calculatedAPY = (Math.pow(1 + r/n, n) - 1) * 100
    
    let calculatedFutureValue
    let calculatedInterest
    
    if (includeEarlyWithdrawal && earlyWithdrawalMonth < term) {
      // Calculate value up to early withdrawal
      const earlyT = earlyWithdrawalMonth / 12
      calculatedFutureValue = principal * Math.pow(1 + r/n, n * earlyT)
      
      // Apply early withdrawal penalty
      const penalty = (calculatedFutureValue - principal) * (earlyWithdrawalPenalty / 100)
      calculatedFutureValue -= penalty
    } else {
      // Standard CD calculation
      calculatedFutureValue = principal * Math.pow(1 + r/n, n * t)
    }
    
    calculatedInterest = calculatedFutureValue - principal
    
    // Calculate monthly breakdown
    const breakdown = Array.from({ length: term }, (_, index) => {
      const monthT = (index + 1) / 12
      const monthlyBalance = principal * Math.pow(1 + r/n, n * monthT)
      const monthlyInterest = monthlyBalance - principal
      
      return {
        month: index + 1,
        balance: monthlyBalance,
        interest: monthlyInterest
      }
    })
    
    setFutureValue(calculatedFutureValue)
    setInterestEarned(calculatedInterest)
    setAPY(calculatedAPY)
    setMonthlyBreakdown(breakdown)
  }, [principal, rate, term, compoundingFrequency, includeEarlyWithdrawal, earlyWithdrawalMonth, earlyWithdrawalPenalty])

  // Chart data
  const chartColors = {
    primary: [
      'rgba(99, 102, 241, 0.9)',
      'rgba(59, 130, 246, 0.9)',
    ],
    secondary: [
      'rgba(99, 102, 241, 0.2)',
      'rgba(59, 130, 246, 0.2)',
    ]
  }

  const barChartData = {
    labels: ['Principal', 'Interest Earned'],
    datasets: [
      {
        label: 'Amount',
        data: [principal, interestEarned],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const lineChartData = {
    labels: monthlyBreakdown.map(item => `Month ${item.month}`),
    datasets: [
      {
        label: 'Balance',
        data: monthlyBreakdown.map(item => item.balance),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      },
      {
        label: 'Interest',
        data: monthlyBreakdown.map(item => item.interest),
        borderColor: chartColors.primary[1],
        backgroundColor: chartColors.secondary[1],
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: function(tickValue: string | number) {
            // Type guard to handle both string and number values
            const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      },
      x: { grid: { display: false } }
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
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
    pdf.save('cd-calculator-results.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <CDSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        CD <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate the future value and interest earned on your Certificate of Deposit investment.
      </p>
    </div>
  </div>
</section>

        {/* Calculator Section */}
        <section className="py-12">
          <div className="container max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Input Card */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Enter CD Details</CardTitle>
                    <CardDescription>
                      Provide your CD investment details to calculate potential returns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Principal Amount */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="principal">Initial Deposit</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              The amount you plan to deposit in the CD
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="principal"
                          type="number"
                          className="pl-9"
                          value={principal || ''} onChange={(e) => setPrincipal(e.target.value === '' ? 0 : Number(e.target.value))}
                          min={0}
                        />
                      </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="rate">Annual Interest Rate</Label>
                        <span className="text-sm text-muted-foreground">{rate}%</span>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          id="rate"
                          min={0}
                          max={10}
                          step={0.1}
                          value={[rate]}
                          onValueChange={(value) => setRate(value[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>10%</span>
                        </div>
                      </div>
                    </div>

                    {/* Term */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="term">Term (Months)</Label>
                        <span className="text-sm text-muted-foreground">{term} months</span>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          id="term"
                          min={1}
                          max={60}
                          step={1}
                          value={[term]}
                          onValueChange={(value) => setTerm(value[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1 month</span>
                          <span>60 months</span>
                        </div>
                      </div>
                    </div>

                    {/* Compounding Frequency */}
                    <div className="space-y-4">
                      <Label htmlFor="compounding">Compounding Frequency</Label>
                      <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                        <SelectTrigger id="compounding">
                          <SelectValue placeholder="Select compounding frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="annually">Annually</SelectItem>
                          <SelectItem value="semi-annually">Semi-annually</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Early Withdrawal */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="early-withdrawal">Include Early Withdrawal</Label>
                        <Switch
                          id="early-withdrawal"
                          checked={includeEarlyWithdrawal}
                          onCheckedChange={setIncludeEarlyWithdrawal}
                        />
                      </div>
                      {includeEarlyWithdrawal && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="withdrawal-month">Withdrawal Month</Label>
                            <Input
                              id="withdrawal-month"
                              type="number"
                              value={earlyWithdrawalMonth || ''} onChange={(e) => setEarlyWithdrawalMonth(e.target.value === '' ? 0 : Number(e.target.value))}
                              min={1}
                              max={term}
                            />
                          </div>
                          <div>
                            <Label htmlFor="penalty">Early Withdrawal Penalty (%)</Label>
                            <Input
                              id="penalty"
                              type="number"
                              value={earlyWithdrawalPenalty || ''} onChange={(e) => setEarlyWithdrawalPenalty(e.target.value === '' ? 0 : Number(e.target.value))}
                              min={0}
                              max={100}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results Card */}
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
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Future Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-primary">{formatCurrency(futureValue)}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Interest Earned</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-primary">{formatCurrency(interestEarned)}</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Annual Percentage Yield (APY)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-primary">{apy.toFixed(2)}%</div>
                      </CardContent>
                    </Card>

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      </TabsList>
                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={barChartData} options={chartOptions} />
                        </div>
                      </TabsContent>
                      <TabsContent value="timeline" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={lineChartData} options={chartOptions} />
                        </div>
                      </TabsContent>
                    </Tabs>
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
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Financial Resource</span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Master the Art of CD Investing: Your Complete Guide</h2>
                <p className="mt-3 text-muted-foreground text-lg">Everything you need to know about maximizing your Certificate of Deposit investments</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding Certificate of Deposits
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 id="what-is-cd" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is a Certificate of Deposit (CD)?</h3>
                  <p>
                    A <strong>Certificate of Deposit (CD)</strong> is a financial product offered by banks and credit unions where you deposit a fixed amount of money for a predetermined period, known as the term, in exchange for a fixed interest rate. Unlike a regular savings account, CDs require you to lock in your funds until the term ends, at which point you receive your initial deposit plus the accrued interest.
                  </p>
                  <p className="mt-2">
                    CDs are among the safest investment options available, primarily because they are insured by the Federal Deposit Insurance Corporation (FDIC) up to $250,000 per depositor, per insured bank. This protection ensures that your principal is secure, even in the unlikely event of a bank failure.
                  </p>
                  <h4 id="how-it-works" className="font-semibold text-xl mt-6">How Does a CD Work?</h4>
                  <p>
                    When you open a CD, you select your principal (the amount you deposit) and the term length, which can range from a few months to several years. The bank then pays you interest at a fixed rate, typically higher than that of a standard savings account. If you withdraw funds before the term ends, you’ll likely face an early withdrawal penalty, often a portion of the interest earned.
                  </p>
                  <h4 id="why-important" className="font-semibold text-xl mt-6">Why Consider a CD?</h4>
                  <p>
                    CDs are perfect for those seeking a low-risk investment with guaranteed returns. They’re especially useful for short- to medium-term goals, such as saving for a home down payment, a car, or a vacation. With a fixed interest rate, you can precisely predict your earnings, aiding in financial planning.
                  </p>
                  <ul className="my-3 space-y-1">
                    <li className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Guaranteed returns with fixed interest rates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span>Higher interest rates than regular savings accounts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span>Low-risk with FDIC insurance</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Mastering the CD Calculator</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="step-by-step" className="font-bold text-xl mb-4">Step-by-Step Guide</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">1</span>
                          Set Your Investment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Enter your initial deposit (principal)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Percent className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Input the annual interest rate offered by the bank</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">2</span>
                          Choose Terms & Options
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Select the term length in months</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Choose the compounding frequency (e.g., monthly, quarterly)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Toggle early withdrawal and specify month/penalty if needed</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <p className="mt-4">
                    Once you’ve entered these details, the calculator instantly computes your future value, interest earned, and APY, with charts to visualize your investment growth.
                  </p>
                </div>
              </div>

              {/* Key Factors Section */}
              <div className="mb-12" id="key-factors">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        <span className="text-2xl">Key Factors in CD Investments</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Understanding these elements will help you optimize your CD returns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 id="interest-rates" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">Interest Rates and APY</h3>
                        <p>
                          The interest rate is the annual percentage your CD earns, but the <strong>Annual Percentage Yield (APY)</strong> is the real metric to watch. APY accounts for compounding frequency, showing your true yearly return. For example, a 5% rate compounded monthly yields a higher APY (around 5.12%) than one compounded annually (5%).
                        </p>
                        <p className="mt-2">
                          Always compare APYs across different CDs to find the best deal, as a higher nominal rate with less frequent compounding might underperform.
                        </p>
                      </div>
                      <div>
                        <h3 id="term-length" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4">Term Length</h3>
                        <p>
                          The term is how long your money stays locked in the CD, ranging from months to years. Longer terms usually offer higher rates but reduce liquidity. Choose a term based on when you’ll need the funds—short terms for near-future needs, longer terms to maximize returns.
                        </p>
                        <div className="mt-4 p-3 border border-indigo-200 dark:border-indigo-800 rounded-md bg-indigo-50 dark:bg-indigo-900/20">
                          <p className="text-sm text-indigo-800 dark:text-indigo-300">
                            <strong>Tip:</strong> Check for no-penalty CDs if you want flexibility without sacrificing safety.
                          </p>
                        </div>
                      </div>
                      <div>
                        <h3 id="compounding" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">Compounding Frequency</h3>
                        <p>
                          Compounding determines how often interest is added to your principal—daily, monthly, quarterly, etc. More frequent compounding slightly boosts your returns because interest earns interest sooner. For instance, daily compounding on a 5% rate yields more than annual compounding over the same term.
                        </p>
                      </div>
                      <div>
                        <h3 id="penalties" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4">Early Withdrawal Penalties</h3>
                        <p>
                          Withdrawing funds before maturity typically incurs a penalty, often 3-6 months’ worth of interest. This can significantly reduce your earnings, so ensure you can commit to the full term or understand the penalty terms upfront.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Advanced Strategies Section */}
              <div className="mb-12" id="advanced-strategies">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <span className="text-2xl">Advanced CD Investment Strategies</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Take your CD investing to the next level with these techniques
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <h3 id="cd-laddering" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">CD Laddering</h3>
                    <p>
                      <strong>CD laddering</strong> involves splitting your investment across multiple CDs with staggered maturity dates. This strategy balances liquidity and higher returns. For example, instead of investing $10,000 in a single 5-year CD, you could allocate $2,000 each into CDs maturing in 1, 2, 3, 4, and 5 years.
                    </p>
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-green-50 dark:bg-green-900/30">
                            <th className="border border-green-200 dark:border-green-800 px-3 py-2 text-left">CD</th>
                            <th className="border border-green-200 dark:border-green-800 px-3 py-2 text-left">Amount</th>
                            <th className="border border-green-200 dark:border-green-800 px-3 py-2 text-left">Term</th>
                            <th className="border border-green-200 dark:border-green-800 px-3 py-2 text-left">Maturity Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">1</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">$2,000</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">1 year</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">Year 1</td>
                          </tr>
                          <tr className="bg-green-50/50 dark:bg-green-900/20">
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">2</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">$2,000</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">2 years</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">Year 2</td>
                          </tr>
                          <tr>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">3</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">$2,000</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">3 years</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">Year 3</td>
                          </tr>
                          <tr className="bg-green-50/50 dark:bg-green-900/20">
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">4</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">$2,000</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">4 years</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">Year 4</td>
                          </tr>
                          <tr>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">5</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">$2,000</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">5 years</td>
                            <td className="border border-green-200 dark:border-green-800 px-3 py-2">Year 5</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-4">
                      As each CD matures, you can reinvest it into a new 5-year CD, potentially capturing higher rates while maintaining yearly access to funds.
                    </p>
                    <h3 id="timing" className="text-xl font-bold text-teal-700 dark:text-teal-400 mt-6 mb-4">Timing Your Investments</h3>
                    <p>
                      The interest rate environment affects CD returns. In a rising rate climate, shorter terms let you reinvest at higher rates sooner. In a falling rate scenario, longer terms lock in current higher rates. Monitor economic trends and Federal Reserve policies to time your CD purchases effectively.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Trends Section */}
              <div className="mb-12" id="trends">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        <span className="text-2xl">CD Investment Trends</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Stay informed about factors influencing CD rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <h3 id="current-rates" className="text-xl font-bold text-orange-700 dark:text-orange-400 mb-4">Current Rate Environment</h3>
                    <p>
                      CD rates fluctuate based on economic conditions, inflation, and Federal Reserve interest rate policies. Recently, rates have varied widely—online banks often offer higher APYs than traditional banks due to lower overhead costs. Check current offerings from multiple institutions, as rates change frequently.
                    </p>
                    <p className="mt-2">
                      <em>Note:</em> Use our calculator with the latest rates from your preferred banks for accurate projections.
                    </p>
                    <h3 id="historical-trends" className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-6 mb-4">Historical Context</h3>
                    <p>
                      Historically, CD rates peaked in the 1980s (over 10%) and dropped significantly post-2008 financial crisis. Understanding these trends can inform your strategy—longer terms were lucrative in high-rate eras, while flexibility is key in low-rate periods.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Conclusion Section */}
              <div className="mb-6" id="conclusion">
                <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
                    <CardTitle id="summary" className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                      Take Control of Your CD Investments
                    </CardTitle>
                    <CardDescription>
                      Start planning your CD strategy today for a secure financial future
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      Certificates of Deposit offer a reliable, low-risk way to grow your savings with predictable returns. By mastering terms like APY, term length, and compounding, and employing strategies like laddering, you can maximize your earnings while maintaining financial security.
                    </p>
                    <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to get started?</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use our <strong>CD Calculator</strong> above to experiment with different scenarios and find the perfect CD investment for your goals.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Related Calculators Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center mb-8">Related Calculators</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Savings Calculator</CardTitle>
                  <CardDescription>
                    Compare different savings strategies and see how your money can grow over time with regular deposits.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/savings">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Compound Interest Calculator</CardTitle>
                  <CardDescription>
                    See how compound interest can accelerate your wealth growth over time with different investment scenarios.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/compound-interest">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Investment Calculator</CardTitle>
                  <CardDescription>
                    Plan your investment strategy and see potential returns with different investment amounts and timeframes.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/investment">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">APY Calculator</CardTitle>
                  <CardDescription>
                    Calculate and compare Annual Percentage Yields (APY) for different investment options and terms.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/apy">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Bond Calculator</CardTitle>
                  <CardDescription>
                    Evaluate bond investments and calculate potential returns, yields, and interest payments.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/bond">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">401k Calculator</CardTitle>
                  <CardDescription>
                    Plan your retirement savings and see how your 401k can grow with employer matching and regular contributions.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/401k">Try Calculator</Link>
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