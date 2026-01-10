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
  Percent,
  Clock,
  Wallet,
  Check
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from "@/components/ui/accordion"
import InterestRateSchema from './schema';

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

export default function InterestRateCalculator() {
  // Calculation Type
  const [calculationType, setCalculationType] = useState<'loan' | 'investment'>('loan')
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('compound')
  
  // Loan Scenario State
  const [loanAmount, setLoanAmount] = useState(100000)
  const [totalRepayment, setTotalRepayment] = useState(120000)
  const [loanTerm, setLoanTerm] = useState(5)
  const [paymentFrequency, setPaymentFrequency] = useState('monthly')
  
  // Investment Scenario State
  const [initialInvestment, setInitialInvestment] = useState(10000)
  const [targetAmount, setTargetAmount] = useState(15000)
  const [investmentTerm, setInvestmentTerm] = useState(5)
  const [compoundingFrequency, setCompoundingFrequency] = useState('monthly')
  const [monthlyContribution, setMonthlyContribution] = useState(100)
  const [includeContributions, setIncludeContributions] = useState(false)
  
  // Results State
  const [interestRate, setInterestRate] = useState(0)
  const [effectiveRate, setEffectiveRate] = useState(0)
  const [projectedGrowth, setProjectedGrowth] = useState<{
    time: number[];
    balance: number[];
    contributions: number[];
    interest: number[];
  }>({
    time: [],
    balance: [],
    contributions: [],
    interest: []
  })

  // Calculate interest rate and projections
  useEffect(() => {
    let rate = 0
    let effective = 0
    
    if (calculationType === 'loan') {
      // Simple interest calculation for loans
      if (interestType === 'simple') {
        // r = (A - P) / (P * t) where A is total repayment, P is principal, t is time
        rate = ((totalRepayment - loanAmount) / (loanAmount * loanTerm)) * 100
      } else {
        // Compound interest - use iterative method to find rate
        const periodsPerYear = {
          monthly: 12,
          quarterly: 4,
          annually: 1
        }[paymentFrequency] || 12; // Default to monthly if undefined
        
        const periods = loanTerm * periodsPerYear
        const target = totalRepayment / loanAmount
        
        // Newton's method to find rate
        let guess = 0.1 // 10% initial guess
        for (let i = 0; i < 100; i++) {
          const fn = Math.pow(1 + guess / periodsPerYear, periods) - target
          const derivative = periods * Math.pow(1 + guess / periodsPerYear, periods - 1) / periodsPerYear
          const newGuess = guess - fn / derivative
          
          if (Math.abs(newGuess - guess) < 0.0001) {
            rate = newGuess * 100
            break
          }
          guess = newGuess
        }
      }
    } else {
      // Investment scenario
      const periodsPerYear = {
        monthly: 12,
        quarterly: 4,
        annually: 1
      }[compoundingFrequency] || 12; // Default to monthly if undefined
      
      const periods = investmentTerm * periodsPerYear
      
      if (interestType === 'simple') {
        rate = ((targetAmount - initialInvestment) / (initialInvestment * investmentTerm)) * 100
      } else {
        // Compound interest with optional contributions
        if (includeContributions) {
          // Use numerical method to find rate with contributions
          let guess = 0.1 // 10% initial guess
          const monthlyRate = guess / 12
          const months = investmentTerm * 12
          
          for (let i = 0; i < 100; i++) {
            let balance = initialInvestment
            for (let m = 0; m < months; m++) {
              balance = balance * (1 + monthlyRate) + monthlyContribution
            }
            
            const error = balance - targetAmount
            if (Math.abs(error) < 1) {
              rate = guess * 100
              break
            }
            
            guess = guess * targetAmount / balance
          }
        } else {
          // Standard compound interest formula
          const target = targetAmount / initialInvestment
          rate = (Math.pow(target, 1 / (periodsPerYear * investmentTerm)) - 1) * periodsPerYear * 100
        }
      }
    }
    
    // Calculate effective annual rate
    if (interestType === 'compound') {
      const periodsPerYear = {
        monthly: 12,
        quarterly: 4,
        annually: 1
      }[calculationType === 'loan' ? paymentFrequency : compoundingFrequency] || 12; // Default to monthly if undefined
      
      effective = (Math.pow(1 + rate / (100 * periodsPerYear), periodsPerYear) - 1) * 100
    } else {
      effective = rate
    }
    
    // Generate growth projections
    const projectedYears = calculationType === 'loan' ? loanTerm : investmentTerm
    const timePoints = Array.from({ length: projectedYears + 1 }, (_, i) => i)
    const balances = []
    const contributions = []
    const interestEarned = []
    
    if (calculationType === 'loan') {
      // Loan amortization
      for (let year = 0; year <= projectedYears; year++) {
        if (interestType === 'simple') {
          const totalInterest = (loanAmount * rate * year) / 100
          balances.push(loanAmount + totalInterest)
          contributions.push(loanAmount)
          interestEarned.push(totalInterest)
        } else {
          const periodsPerYear = {
            monthly: 12,
            quarterly: 4,
            annually: 1
          }[paymentFrequency] || 12; // Default to monthly if undefined
          
          const balance = loanAmount * Math.pow(1 + rate / (100 * periodsPerYear), periodsPerYear * year)
          balances.push(balance)
          contributions.push(loanAmount)
          interestEarned.push(balance - loanAmount)
        }
      }
    } else {
      // Investment growth
      for (let year = 0; year <= projectedYears; year++) {
        if (interestType === 'simple') {
          const totalInterest = (initialInvestment * rate * year) / 100
          const totalContributions = includeContributions ? monthlyContribution * 12 * year : 0
          balances.push(initialInvestment + totalInterest + totalContributions)
          contributions.push(initialInvestment + totalContributions)
          interestEarned.push(totalInterest)
        } else {
          const periodsPerYear = {
            monthly: 12,
            quarterly: 4,
            annually: 1
          }[compoundingFrequency] || 12; // Default to monthly if undefined
          
          let balance = initialInvestment
          let totalContributions = initialInvestment
          
          if (includeContributions) {
            for (let m = 0; m < year * 12; m++) {
              balance = balance * (1 + rate / (100 * 12)) + monthlyContribution
              totalContributions += monthlyContribution
            }
          } else {
            balance = initialInvestment * Math.pow(1 + rate / (100 * periodsPerYear), periodsPerYear * year)
          }
          
          balances.push(balance)
          contributions.push(totalContributions)
          interestEarned.push(balance - totalContributions)
        }
      }
    }
    
    setInterestRate(rate)
    setEffectiveRate(effective)
    setProjectedGrowth({
      time: timePoints,
      balance: balances,
      contributions: contributions,
      interest: interestEarned
    })
    
  }, [
    calculationType,
    interestType,
    loanAmount,
    totalRepayment,
    loanTerm,
    paymentFrequency,
    initialInvestment,
    targetAmount,
    investmentTerm,
    compoundingFrequency,
    monthlyContribution,
    includeContributions
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

  // Growth projection chart
  const generateGrowthChart = () => {
    return {
      labels: projectedGrowth.time.map(t => `Year ${t}`),
      datasets: [
        {
          label: 'Total Balance',
          data: projectedGrowth.balance,
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: calculationType === 'loan' ? 'Principal' : 'Contributions',
          data: projectedGrowth.contributions,
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4
        },
        {
          label: 'Interest',
          data: projectedGrowth.interest,
          borderColor: chartColors.primary[2],
          backgroundColor: chartColors.secondary[2],
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

  // Rate comparison chart
  const generateRateComparisonChart = () => {
    const compoundingOptions = ['annually', 'quarterly', 'monthly']
    const rates = compoundingOptions.map(freq => {
      const periodsPerYear = {
        annually: 1,
        quarterly: 4,
        monthly: 12
      }[freq] || 12; // Default to monthly if undefined
      
      return (Math.pow(1 + interestRate / (100 * periodsPerYear), periodsPerYear) - 1) * 100
    })

    return {
      labels: ['Annual', 'Quarterly', 'Monthly'],
      datasets: [
        {
          label: 'Effective Annual Rate',
          data: rates,
          backgroundColor: chartColors.primary[0],
          borderColor: chartColors.secondary[0].replace('0.2', '1'),
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    }
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
        formatter: (value: number) => value.toFixed(2) + '%'
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
    pdf.save('interest-rate-analysis.pdf')
  }

  const exportBlogPDF = async () => {
    const element = document.getElementById('blog-section')
    if (!element) return
    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    })
    const imgWidth = 595
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= 842

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 842
    }

    pdf.save('interest-rate-guide.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <InterestRateSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Interest Rate <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate interest rates for loans and investments to understand borrowing costs and potential returns.
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
                      Choose your calculation type and provide the necessary information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Calculation Type */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Calculation Type</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Purpose</Label>
                          <Select 
                            value={calculationType} 
                            onValueChange={(value) => setCalculationType(value as 'loan' | 'investment')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select calculation type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="loan">Loan Interest Rate</SelectItem>
                              <SelectItem value="investment">Investment Return Rate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Interest Type</Label>
                          <Select 
                            value={interestType} 
                            onValueChange={(value) => setInterestType(value as 'simple' | 'compound')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select interest type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="simple">Simple Interest</SelectItem>
                              <SelectItem value="compound">Compound Interest</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {calculationType === 'loan' ? (
                      /* Loan Details */
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Loan Details</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="loan-amount">Loan Amount</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="loan-amount"
                                type="number"
                                className="pl-9"
                                value={loanAmount || ''} onChange={(e) => setLoanAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="total-repayment">Total Repayment</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="total-repayment"
                                type="number"
                                className="pl-9"
                                value={totalRepayment || ''} onChange={(e) => setTotalRepayment(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="loan-term">Loan Term (Years)</Label>
                            <Input
                              id="loan-term"
                              type="number"
                              value={loanTerm || ''} onChange={(e) => setLoanTerm(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="payment-frequency">Payment Frequency</Label>
                            <Select 
                              value={paymentFrequency} 
                              onValueChange={setPaymentFrequency}
                            >
                              <SelectTrigger id="payment-frequency">
                                <SelectValue placeholder="Select payment frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Investment Details */
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Investment Details</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="initial-investment">Initial Investment</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="initial-investment"
                                type="number"
                                className="pl-9"
                                value={initialInvestment || ''} onChange={(e) => setInitialInvestment(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="target-amount">Target Amount</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="target-amount"
                                type="number"
                                className="pl-9"
                                value={targetAmount || ''} onChange={(e) => setTargetAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="investment-term">Investment Term (Years)</Label>
                            <Input
                              id="investment-term"
                              type="number"
                              value={investmentTerm || ''} onChange={(e) => setInvestmentTerm(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="compounding-frequency">Compounding Frequency</Label>
                            <Select 
                              value={compoundingFrequency} 
                              onValueChange={setCompoundingFrequency}
                            >
                              <SelectTrigger id="compounding-frequency">
                                <SelectValue placeholder="Select compounding frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2 space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="include-contributions">Include Regular Contributions</Label>
                              <Switch
                                id="include-contributions"
                                checked={includeContributions}
                                onCheckedChange={setIncludeContributions}
                              />
                            </div>
                            {includeContributions && (
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="monthly-contribution"
                                  type="number"
                                  className="pl-9"
                                  placeholder="Monthly contribution amount"
                                  value={monthlyContribution || ''} onChange={(e) => setMonthlyContribution(e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
                      <p className="text-sm text-muted-foreground">Required Interest Rate</p>
                      <p className="text-4xl font-bold text-primary">{formatPercent(interestRate)}</p>
                      {interestType === 'compound' && (
                        <p className="text-sm text-muted-foreground">
                          Effective Annual Rate (EAR): {formatPercent(effectiveRate)}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <Tabs defaultValue="growth" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="growth">Growth</TabsTrigger>
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                      </TabsList>

                      <TabsContent value="growth" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateGrowthChart()} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Growth Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">
                                {calculationType === 'loan' ? 'Principal Amount' : 'Initial Investment'}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(calculationType === 'loan' ? loanAmount : initialInvestment)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Interest</span>
                              <span className="font-medium">
                                {formatCurrency(projectedGrowth.interest[projectedGrowth.interest.length - 1])}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Final Amount</span>
                              <span>
                                {formatCurrency(projectedGrowth.balance[projectedGrowth.balance.length - 1])}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={generateRateComparisonChart()} options={barChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Effective annual rates with different compounding frequencies
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Summary Card */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Rate Analysis</p>
                            <p className="text-sm text-muted-foreground">
                              {calculationType === 'loan' 
                                ? `This loan has an annual interest rate of ${formatPercent(interestRate)}. ${
                                    interestType === 'compound' 
                                      ? `With ${paymentFrequency} compounding, the effective annual rate is ${formatPercent(effectiveRate)}.`
                                      : ''
                                  }`
                                : `To reach your target of ${formatCurrency(targetAmount)} in ${investmentTerm} years, you need an annual return of ${formatPercent(interestRate)}. ${
                                    interestType === 'compound'
                                      ? `With ${compoundingFrequency} compounding, this gives an effective annual rate of ${formatPercent(effectiveRate)}.`
                                      : ''
                                  }`
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
 

        {/* Blog Section */}
<section id="blog-section" className="py-12 bg-white dark:bg-black">
  <div className="container mx-auto max-w-5xl px-4">
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1 text-center">
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Financial Tool</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Interest Rate Calculator: Understanding the Cost of Money</h2>
        <p className="mt-3 text-muted-foreground text-lg">Master interest rates to make smarter borrowing and lending decisions</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Interest Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-are-interest-rates" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What are Interest Rates?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                <strong>Interest rates</strong> represent the cost of borrowing money or the reward for lending it. They are typically expressed as a percentage of the principal amount over a specific period, usually a year. Interest rates serve as the foundation of modern financial systems, influencing everything from personal loans and mortgages to national economies and global markets.
              </p>
              <p className="mt-2">
                Key elements that shape interest rates include:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Time value of money (money today is worth more than tomorrow)</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>Risk assessment (higher risk typically demands higher rates)</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Inflation expectations (lenders need to outpace inflation)</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Market supply and demand for credit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Central bank policies and economic conditions</span>
                </li>
              </ul>
              <p>
                An interest rate calculator helps you navigate these complex factors to make informed financial decisions, whether you're considering a loan, evaluating an investment, or planning for future financial goals.
              </p>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                  <CardTitle className="text-sm font-medium text-center">Interest Rate Impact on Loans</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Line 
                      data={{
                        labels: ['3%', '4%', '5%', '6%', '7%', '8%'],
                        datasets: [
                          {
                            label: 'Monthly Payment ($300K, 30yr)',
                            data: [1265, 1432, 1610, 1799, 1996, 2201],
                            borderColor: 'rgba(59, 130, 246, 0.8)',
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
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
                            beginAtZero: false,
                            title: {
                              display: true,
                              text: 'Monthly Payment ($)'
                            }
                          },
                          x: {
                            title: {
                              display: true,
                              text: 'Interest Rate'
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
          
          <h4 id="why-rates-matter" className="font-semibold text-xl mt-6">Why Interest Rates Matter to Everyone</h4>
          <div className="mt-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Borrowers' Perspective</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Higher rates mean larger payments and more expensive credit, potentially adding thousands or even hundreds of thousands of dollars to long-term loans like mortgages</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Savers' Perspective</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Higher rates benefit savers through better returns on deposits, certificates of deposit (CDs), and other interest-bearing accounts</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Economic Impact</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Interest rates influence consumer spending, business investment, employment rates, and overall economic growth</p>
                </div>
              </div>
            </div>
          </div>
          
          <p>
            Whether you're calculating a mortgage payment, comparing loan offers, or estimating potential returns on savings, an interest rate calculator provides clarity and helps you make financially sound decisions in a complex economic landscape.
          </p>
        </CardContent>
      </Card>

      {/* Types of Interest Rates Section */}
      <div className="mb-12" id="rate-types">
        <div className="flex items-center gap-2 mb-4">
          <Percent className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Types of Interest Rates</h2>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="rate-categories" className="font-bold text-xl mb-4">Common Interest Rate Categories</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-blue-600" />
                  Fixed vs. Variable Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-900/30 rounded-lg text-sm">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Fixed Interest Rate</h4>
                    <p className="text-blue-700 dark:text-blue-400">
                      Remains constant throughout the loan term, providing predictable payments and protection from market fluctuations.
                    </p>
                    <p className="mt-2 text-blue-700 dark:text-blue-400">
                      <strong>Best for:</strong> Long-term loans in low-rate environments and borrowers who value payment stability.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-900/30 rounded-lg text-sm">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Variable Interest Rate</h4>
                    <p className="text-blue-700 dark:text-blue-400">
                      Fluctuates based on an underlying index or benchmark, potentially resulting in changing payment amounts over time.
                    </p>
                    <p className="mt-2 text-blue-700 dark:text-blue-400">
                      <strong>Best for:</strong> Short-term loans, high-rate environments where rates might decline, and borrowers comfortable with some risk.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  Nominal vs. Effective Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50/50 dark:bg-green-900/30 rounded-lg text-sm">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Nominal Rate (APR)</h4>
                    <p className="text-green-700 dark:text-green-400">
                      The stated rate without accounting for compounding; typically used for loans to standardize comparison.
                    </p>
                    <p className="mt-2 text-green-700 dark:text-green-400">
                      <strong>Example:</strong> A 5% APR loan compounded monthly actually costs slightly more than 5% annually.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50/50 dark:bg-green-900/30 rounded-lg text-sm">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Effective Rate (APY)</h4>
                    <p className="text-green-700 dark:text-green-400">
                      Reflects the true annual cost/return including compounding effects; represents the actual percentage earned or paid.
                    </p>
                    <p className="mt-2 text-green-700 dark:text-green-400">
                      <strong>Example:</strong> A 5% nominal rate compounded monthly yields a 5.12% APY.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3 id="specialized-rates" className="font-bold text-xl mt-8 mb-4">Specialized Rate Types</h3>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg text-sm">
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-800 dark:text-purple-300">Introductory/Teaser Rates</p>
                  <p className="text-purple-700 dark:text-purple-400">
                    Low initial rates that increase after a specified period, often used for credit cards and adjustable-rate mortgages.
                  </p>
                  <p className="mt-2 text-purple-700 dark:text-purple-400">
                    <strong>Caution:</strong> Plan for the higher rate period when considering affordability.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg text-sm">
              <div className="flex items-start gap-3">
                <PieChart className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Prime Rate</p>
                  <p className="text-amber-700 dark:text-amber-400">
                    A benchmark rate banks offer to their most creditworthy customers, with other rates often calculated as "prime plus" a margin.
                  </p>
                  <p className="mt-2 text-amber-700 dark:text-amber-400">
                    <strong>Impact:</strong> Directly affects variable-rate loans and credit lines.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-cyan-50/50 dark:bg-cyan-900/20 rounded-lg text-sm">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                <div>
                  <p className="font-medium text-cyan-800 dark:text-cyan-300">Discount Rate</p>
                  <p className="text-cyan-700 dark:text-cyan-400">
                    The interest rate central banks charge commercial banks for short-term loans, influencing overall market rates.
                  </p>
                  <p className="mt-2 text-cyan-700 dark:text-cyan-400">
                    <strong>Significance:</strong> A key tool in monetary policy implementation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>The APR vs. APY Distinction:</strong> When borrowing, pay attention to the APR (Annual Percentage Rate) which includes fees and reflects the true borrowing cost. When saving or investing, focus on the APY (Annual Percentage Yield) which accounts for compounding and represents your actual return. Lenders typically advertise the lower APR when lending and the higher APY when attracting deposits.
            </p>
          </div>
        </div>
      </div>

      {/* Using the Calculator Section */}
      <div className="mb-12" id="calculator-guide">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Using the Interest Rate Calculator</span>
              </div>
            </CardTitle>
            <CardDescription>
              Mastering interest rates for better financial decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="calculator-inputs" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Calculator Types and Inputs
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Loan Payment Calculator</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5" />
                        <span><strong>Loan amount:</strong> Principal borrowed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 mt-0.5" />
                        <span><strong>Interest rate:</strong> Annual percentage rate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-0.5" />
                        <span><strong>Loan term:</strong> Repayment period in months/years</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Interest Rate Comparison</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 mt-0.5" />
                        <span><strong>Multiple rate options:</strong> Compare different rates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5" />
                        <span><strong>Loan details:</strong> Amount and term options</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Wallet className="h-4 w-4 mt-0.5" />
                        <span><strong>Additional fees:</strong> Points, closing costs, etc.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">APY Calculator</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 mt-0.5" />
                        <span><strong>Stated interest rate:</strong> Nominal rate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <RefreshCw className="h-4 w-4 mt-0.5" />
                        <span><strong>Compounding frequency:</strong> How often interest is calculated</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5" />
                        <span><strong>Initial deposit:</strong> Optional starting balance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="calculator-results" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Interpreting Results
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Key Output Metrics</h4>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Monthly Payment</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Regular payment amount needed to satisfy the loan by the end of the term
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Total Interest Paid</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            The cumulative interest cost over the entire loan term
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Effective Annual Rate (APY)</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            True annual cost/return accounting for compounding
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Amortization Schedule</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Detailed breakdown of each payment, showing principal and interest portions
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>Pro Tip:</strong> When comparing loans, look beyond the interest rate to the total cost of borrowing, including all fees and the loan term. A slightly higher rate with a shorter term could save significant money overall.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <h4 className="font-medium text-purple-800 dark:text-purple-300">Visual Insights</h4>
                    <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                      The calculator provides valuable visualizations:
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                      <li className="flex items-start gap-2">
                        <PieChart className="h-4 w-4 mt-0.5" />
                        <span><strong>Principal vs. Interest breakdown</strong> showing the true cost distribution of your loan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <LineChart className="h-4 w-4 mt-0.5" />
                        <span><strong>Balance reduction chart</strong> illustrating your equity growth over time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart3 className="h-4 w-4 mt-0.5" />
                        <span><strong>Payment comparison</strong> between different rate scenarios</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Common Use Cases
            </h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    Mortgage Rate Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Loan amount:</span>
                      <span className="font-medium">$300,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Term:</span>
                      <span className="font-medium">30 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rate option 1:</span>
                      <span className="font-medium">4.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly payment:</span>
                      <span className="font-medium">$1,520</span>
                    </div>
                    <div className="flex justify-between bg-blue-50 dark:bg-blue-900/20 p-1 rounded">
                      <span className="text-sm font-medium">Total interest:</span>
                      <span className="font-bold">$247,220</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rate option 2:</span>
                      <span className="font-medium">4.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly payment:</span>
                      <span className="font-medium">$1,432</span>
                    </div>
                    <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-1 rounded">
                      <span className="text-sm font-medium">Interest savings:</span>
                      <span className="font-bold text-green-700 dark:text-green-400">$31,680</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-green-600" />
                    APY Calculation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Deposit amount:</span>
                      <span className="font-medium">$10,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Nominal rate:</span>
                      <span className="font-medium">5.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Compounding:</span>
                      <span className="font-medium">Daily</span>
                    </div>
                    <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-1 rounded">
                      <span className="text-sm font-medium">Effective APY:</span>
                      <span className="font-bold">5.13%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Value after 1 year:</span>
                      <span className="font-medium">$10,513</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Value after 3 years:</span>
                      <span className="font-medium">$11,614</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Value after 5 years:</span>
                      <span className="font-medium">$12,840</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="bg-purple-50 dark:bg-purple-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-purple-600" />
                    Missing Value Calculation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Scenario:</span>
                      <span className="font-medium">Auto loan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Desired payment:</span>
                      <span className="font-medium">$400/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Term:</span>
                      <span className="font-medium">60 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Interest rate:</span>
                      <span className="font-medium">6.9%</span>
                    </div>
                    <div className="flex justify-between bg-purple-50 dark:bg-purple-900/20 p-1 rounded">
                      <span className="text-sm font-medium">Affordable loan amount:</span>
                      <span className="font-bold">$20,434</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">With 4.9% rate:</span>
                      <span className="font-medium">$21,232 (+$798)</span>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Calculate how much you can borrow based on your budget
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Rate Shopping Tip</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    When shopping for loans, credit reporting agencies typically count multiple inquiries within a 14-45 day period (depending on the scoring model) as a single inquiry, allowing you to compare rates without multiple negative impacts to your credit score. Use this window strategically to find the best rate without credit score concerns.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-World Applications Section */}
      <div className="mb-12" id="practical-applications">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          Real-World Applications
        </h2>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Interest Rate Impact on Loans</h3>
                
                <div className="space-y-4">
                  <p>
                    The interest rate on a loan directly affects both your monthly payment and the total cost over the life of the loan. Even small rate differences can translate to significant savings or costs.
                  </p>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <DollarSign className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">$300,000 Mortgage Example</h4>
                      <div className="mt-1 text-sm space-y-1 text-blue-700 dark:text-blue-400">
                        <p><strong>At 4% for 30 years:</strong> $1,432/month, $215,609 total interest</p>
                        <p><strong>At 5% for 30 years:</strong> $1,610/month, $279,767 total interest</p>
                        <p><strong>Rate difference:</strong> Just 1 percentage point</p>
                        <p className="font-medium">Impact: $178/month higher payment, $64,158 more interest paid</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[200px]">
                    <Bar 
                      data={{
                        labels: ['3.5%', '4.0%', '4.5%', '5.0%', '5.5%', '6.0%'],
                        datasets: [{
                          label: 'Total Interest Paid on $300K, 30yr Mortgage',
                          data: [184968, 215609, 247220, 279767, 313212, 347514],
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(59, 130, 246, 0.65)',
                            'rgba(59, 130, 246, 0.6)',
                            'rgba(59, 130, 246, 0.55)',
                            'rgba(59, 130, 246, 0.5)',
                            'rgba(59, 130, 246, 0.45)'
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
                            beginAtZero: false,
                            ticks: { callback: value => '$' + Number(value).toLocaleString() }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Interest Rate Impact on Savings</h3>
                
                <div className="space-y-4">
                  <p>
                    For savers and investors, higher interest rates mean better returns on deposits, bonds, and other interest-bearing investments. The effects of rate differences compound significantly over time.
                  </p>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <BarChart3 className="h-4 w-4 text-green-700 dark:text-green-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-300">$10,000 CD Investment</h4>
                      <div className="mt-1 text-sm space-y-1 text-green-700 dark:text-green-400">
                        <p><strong>At 2% APY for 5 years:</strong> $11,041 final value</p>
                        <p><strong>At 4% APY for 5 years:</strong> $12,167 final value</p>
                        <p><strong>At 6% APY for 5 years:</strong> $13,382 final value</p>
                        <p className="font-medium">Difference between 2% and 6%: $2,341 (21% more)</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mt-6 mb-3">How the Federal Reserve Influences Rates</h3>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">The Rate Ripple Effect</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      When the Federal Reserve adjusts its federal funds rate, it creates a ripple effect through the economy:
                    </p>
                    <ol className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400 list-decimal list-inside">
                      <li>Banks adjust their prime rate</li>
                      <li>Variable loan rates shift (credit cards, HELOCs, ARMs)</li>
                      <li>New fixed-rate loans are priced differently</li>
                      <li>Savings account and CD yields change</li>
                      <li>Bond markets respond with price adjustments</li>
                    </ol>
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      Understanding this cycle helps you time major financial decisions to secure the most favorable rates possible.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <h3 className="text-xl font-bold mb-4">How to Get the Best Interest Rates</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <h4 className="font-medium text-lg">For Borrowers</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-1" />
                    <div>
                      <p className="font-medium">Improve your credit score</p>
                      <p className="text-muted-foreground">Higher scores typically qualify for lower rates across all loan types</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-1" />
                    <div>
                      <p className="font-medium">Make a larger down payment</p>
                      <p className="text-muted-foreground">Reducing the loan-to-value ratio often results in better rates</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-1" />
                    <div>
                      <p className="font-medium">Consider paying points</p>
                      <p className="text-muted-foreground">Upfront payments can secure lower rates for long-term savings</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-1" />
                    <div>
                      <p className="font-medium">Shop around and negotiate</p>
                      <p className="text-muted-foreground">Compare offers from multiple lenders and ask for better terms</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-lg">For Savers</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-1" />
                    <div>
                      <p className="font-medium">Consider online banks</p>
                      <p className="text-muted-foreground">Without branch networks, online banks often offer significantly higher rates</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-1" />
                    <div>
                      <p className="font-medium">Look for promotional rates</p>
                      <p className="text-muted-foreground">Special offers for new customers can provide better short-term yields</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-1" />
                    <div>
                      <p className="font-medium">Consider CD laddering</p>
                      <p className="text-muted-foreground">Stagger CD maturities to balance access to funds with better rates</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-1" />
                    <div>
                      <p className="font-medium">Explore credit unions</p>
                      <p className="text-muted-foreground">Not-for-profit status often allows them to offer more competitive rates</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Strategic Rate Timing:</strong> For long-term loans like mortgages, consider the broader interest rate environment. In a declining rate environment, variable rates might be advantageous as they'll adjust downward. In a rising rate environment, locking in a fixed rate could protect you from future increases. Use our Interest Rate Calculator to compare scenarios and determine the best strategy for your situation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Mastering Interest Rates
            </CardTitle>
            <CardDescription>
              Knowledge that pays dividends throughout your financial life
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              The <strong>Interest Rate Calculator</strong> serves as an essential tool for navigating the complex world of borrowing and saving. By understanding how interest rates work and using this calculator effectively, you can make informed decisions that potentially save thousands of dollars over time and accelerate your progress toward financial goals.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Remember these fundamental principles about interest rates:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Core Concepts</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Small rate differences create significant financial impacts over time</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Understanding APR vs. APY prevents misleading comparisons</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Rate environment trends should influence fixed vs. variable choices</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Strategic Applications</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Always compare total costs, not just monthly payments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Regularly reassess existing loans for refinancing opportunities</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Use calculators to develop personalized debt repayment strategies</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to optimize your financial decisions?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Interest Rate Calculator</strong> above to compare scenarios and find the best options for your situation. For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/compound-interest">
                        <Percent className="h-4 w-4 mr-1" />
                        Compound Interest
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/mortgage">
                        <Wallet className="h-4 w-4 mr-1" />
                        Mortgage Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/debt-payoff">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Debt Payoff
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
                  <CardTitle className="text-lg">Compound Interest Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    See how your money can grow through the power of compound interest over time.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/compound-interest">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Loan Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate monthly loan payments and total interest costs for any loan amount and term.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/loan">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Investment Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Project investment growth with different contribution strategies and market scenarios.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/investment">Try Calculator</Link>
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