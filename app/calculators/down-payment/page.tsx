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
  Home,
  Landmark,
  Building,
  Percent,
  Clock,
  Check,
  Calendar,
  Wallet
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import DownPaymentSchema from './schema';

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

export default function DownPaymentCalculator() {
  // Home Purchase Details
  const [homePrice, setHomePrice] = useState<number>(400000)
  const [downPaymentAmount, setDownPaymentAmount] = useState<number>(80000)
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20)
  const [inputMode, setInputMode] = useState<'amount' | 'percent'>('amount')
  
  // Loan Details
  const [loanTerm, setLoanTerm] = useState<number>(30)
  const [interestRate, setInterestRate] = useState<number>(6.5)
  const [loanType, setLoanType] = useState<string>("conventional")
  
  // Savings Plan
  const [currentSavings, setCurrentSavings] = useState<number>(20000)
  const [monthlySavings, setMonthlySavings] = useState<number>(1000)
  const [savingsInterestRate, setSavingsInterestRate] = useState<number>(2)
  
  // Results State
  const [loanAmount, setLoanAmount] = useState<number>(0)
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0)
  const [monthsToGoal, setMonthsToGoal] = useState<number>(0)
  const [pmiRequired, setPmiRequired] = useState<boolean>(false)
  const [pmiCost, setPmiCost] = useState<number>(0)
  const [totalInterestPaid, setTotalInterestPaid] = useState<number>(0)
  const [comparisonScenarios, setComparisonScenarios] = useState<{
    percent: number;
    amount: number;
    payment: number;
    pmi: number;
    interest: number;
  }[]>([])

  // Calculate loan details and monthly payments
  useEffect(() => {
    // Update down payment amount/percent based on input mode
    if (inputMode === 'amount') {
      const newPercent = (downPaymentAmount / homePrice) * 100
      setDownPaymentPercent(newPercent)
    } else {
      const newAmount = (homePrice * downPaymentPercent) / 100
      setDownPaymentAmount(newAmount)
    }
    
    // Calculate loan amount
    const calculatedLoanAmount = homePrice - downPaymentAmount
    setLoanAmount(calculatedLoanAmount)
    
    // Calculate PMI requirement and cost
    const ltv = (calculatedLoanAmount / homePrice) * 100
    const requiresPMI = ltv > 80 && loanType === "conventional"
    setPmiRequired(requiresPMI)
    setPmiCost(requiresPMI ? (calculatedLoanAmount * 0.005) / 12 : 0)
    
    // Calculate monthly payment
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12
    const monthlyPrincipalAndInterest = calculatedLoanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    
    setMonthlyPayment(monthlyPrincipalAndInterest + pmiCost)
    
    // Calculate total interest
    const totalPayments = monthlyPrincipalAndInterest * numberOfPayments
    setTotalInterestPaid(totalPayments - calculatedLoanAmount)
    
    // Calculate months to reach down payment goal
    const remaining = downPaymentAmount - currentSavings
    if (remaining > 0) {
      const monthlyInterestRate = savingsInterestRate / 100 / 12
      let months = 0
      let accumulated = currentSavings
      
      while (accumulated < downPaymentAmount && months < 600) {
        accumulated += monthlySavings
        accumulated *= (1 + monthlyInterestRate)
        months++
      }
      
      setMonthsToGoal(months)
    } else {
      setMonthsToGoal(0)
    }
    
    // Generate comparison scenarios
    const scenarios = [5, 10, 15, 20].map(percent => {
      const amount = (homePrice * percent) / 100
      const scenarioLoan = homePrice - amount
      const scenarioPMI = percent < 20 ? (scenarioLoan * 0.005) / 12 : 0
      const scenarioPayment = scenarioLoan * 
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      const scenarioTotalPayments = scenarioPayment * numberOfPayments
      
      return {
        percent,
        amount,
        payment: scenarioPayment + scenarioPMI,
        pmi: scenarioPMI,
        interest: scenarioTotalPayments - scenarioLoan
      }
    })
    
    setComparisonScenarios(scenarios)
    
  }, [
    homePrice,
    downPaymentAmount,
    downPaymentPercent,
    inputMode,
    loanTerm,
    interestRate,
    loanType,
    currentSavings,
    monthlySavings,
    savingsInterestRate,
    pmiCost
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

  // Down payment breakdown chart
  const breakdownChartData = {
    labels: ['Down Payment', 'Loan Amount'],
    datasets: [{
      data: [downPaymentAmount, loanAmount],
      backgroundColor: chartColors.primary.slice(0, 2),
      borderColor: chartColors.secondary.slice(0, 2).map(color => color.replace('0.2', '1')),
      borderWidth: 2
    }]
  }

  const breakdownChartOptions: ChartOptions<'doughnut'> = {
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
          return ((value / homePrice) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Monthly payment comparison chart
  const paymentComparisonData = {
    labels: comparisonScenarios.map(s => s.percent + '% Down'),
    datasets: [
      {
        label: 'Monthly Payment',
        data: comparisonScenarios.map(s => s.payment),
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'PMI',
        data: comparisonScenarios.map(s => s.pmi),
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const paymentComparisonOptions: ChartOptions<'bar'> = {
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

  // Savings progress chart
  const generateSavingsProjection = () => {
    const months = Math.min(monthsToGoal + 3, 36)
    const labels = Array.from({ length: months }, (_, i) => `Month ${i + 1}`)
    const data = []
    let accumulated = currentSavings
    const monthlyInterestRate = savingsInterestRate / 100 / 12
    
    for (let i = 0; i < months; i++) {
      data.push(accumulated)
      accumulated += monthlySavings
      accumulated *= (1 + monthlyInterestRate)
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Projected Savings',
          data,
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Down Payment Goal',
          data: Array(months).fill(downPaymentAmount),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          borderDash: [5, 5],
          tension: 0
        }
      ]
    }
  }

  const savingsProjectionOptions: ChartOptions<'line'> = {
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
    pdf.save('down-payment-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <DownPaymentSchema /> 
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Down Payment <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Calculator</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Calculate how much you need to save for a down payment and understand how different down payment amounts affect your mortgage.
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
                    <CardTitle>Enter Purchase Details</CardTitle>
                    <CardDescription>
                      Provide information about the home purchase and your savings to calculate your down payment needs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Home Purchase Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Home Purchase Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="home-price">Home Price</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="home-price"
                              type="number"
                              className="pl-9"
                              value={homePrice}
                              onChange={(e) => setHomePrice(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="input-mode">Input Mode</Label>
                          <Select value={inputMode} onValueChange={(value) => setInputMode(value as 'amount' | 'percent')}>
                            <SelectTrigger id="input-mode">
                              <SelectValue placeholder="Select input mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="amount">Dollar Amount</SelectItem>
                              <SelectItem value="percent">Percentage</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {inputMode === 'amount' ? (
                          <div className="space-y-2">
                            <Label htmlFor="down-payment-amount">Down Payment Amount</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="down-payment-amount"
                                type="number"
                                className="pl-9"
                                value={downPaymentAmount}
                                onChange={(e) => setDownPaymentAmount(Number(e.target.value))}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {downPaymentPercent.toFixed(1)}% of home price
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="down-payment-percent">Down Payment Percentage</Label>
                              <span className="text-sm text-muted-foreground">{downPaymentPercent}%</span>
                            </div>
                            <Slider
                              id="down-payment-percent"
                              min={0}
                              max={50}
                              step={0.5}
                              value={[downPaymentPercent]}
                              onValueChange={(value) => setDownPaymentPercent(value[0])}
                            />
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(downPaymentAmount)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Loan Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Loan Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="loan-type">Loan Type</Label>
                          <Select value={loanType} onValueChange={setLoanType}>
                            <SelectTrigger id="loan-type">
                              <SelectValue placeholder="Select loan type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conventional">Conventional</SelectItem>
                              <SelectItem value="fha">FHA</SelectItem>
                              <SelectItem value="va">VA</SelectItem>
                              <SelectItem value="usda">USDA</SelectItem>
                            </SelectContent>
                          </Select>
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

                    {/* Savings Plan */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Savings Plan</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="current-savings">Current Savings</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="current-savings"
                              type="number"
                              className="pl-9"
                              value={currentSavings}
                              onChange={(e) => setCurrentSavings(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="monthly-savings">Monthly Savings</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="monthly-savings"
                              type="number"
                              className="pl-9"
                              value={monthlySavings}
                              onChange={(e) => setMonthlySavings(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="savings-rate">Savings Interest Rate</Label>
                            <span className="text-sm text-muted-foreground">{savingsInterestRate}%</span>
                          </div>
                          <Slider
                            id="savings-rate"
                            min={0}
                            max={5}
                            step={0.1}
                            value={[savingsInterestRate]}
                            onValueChange={(value) => setSavingsInterestRate(value[0])}
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
                      <p className="text-sm text-muted-foreground">Down Payment Required</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(downPaymentAmount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {downPaymentPercent.toFixed(1)}% of {formatCurrency(homePrice)}
                      </p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                        <TabsTrigger value="savings">Savings</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Doughnut data={breakdownChartData} options={breakdownChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Purchase Breakdown</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Down Payment</span>
                              <span className="font-medium">{formatCurrency(downPaymentAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Loan Amount</span>
                              <span className="font-medium">{formatCurrency(loanAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Monthly Payment</span>
                              <span className="font-medium">{formatCurrency(monthlyPayment)}</span>
                            </div>
                            {pmiRequired && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Monthly PMI</span>
                                <span className="font-medium">{formatCurrency(pmiCost)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Interest Paid</span>
                              <span>{formatCurrency(totalInterestPaid)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={paymentComparisonData} options={paymentComparisonOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Down Payment Scenarios</h4>
                          <div className="grid gap-2">
                            {comparisonScenarios.map((scenario) => (
                              <div key={scenario.percent} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">{scenario.percent}% Down ({formatCurrency(scenario.amount)})</span>
                                <span className="font-medium">{formatCurrency(scenario.payment)}/mo</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="savings" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateSavingsProjection()} options={savingsProjectionOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Savings Timeline</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Current Savings</span>
                              <span className="font-medium">{formatCurrency(currentSavings)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Monthly Contribution</span>
                              <span className="font-medium">{formatCurrency(monthlySavings)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Amount Needed</span>
                              <span className="font-medium">{formatCurrency(Math.max(0, downPaymentAmount - currentSavings))}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Time to Goal</span>
                              <span>{monthsToGoal} months</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Recommendations */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Down Payment Analysis</p>
                            {downPaymentPercent < 20 && loanType === "conventional" ? (
                              <p className="text-sm text-muted-foreground">
                                Consider saving for a 20% down payment ({formatCurrency(homePrice * 0.2)}) to avoid PMI and reduce your monthly payment.
                              </p>
                            ) : downPaymentPercent >= 20 ? (
                              <p className="text-sm text-muted-foreground">
                                Your 20%+ down payment eliminates the need for PMI and provides a strong equity position.
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Your chosen loan type has different down payment requirements. Consider speaking with a lender about your options.
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

        {/* Blog Section */}
<section id="blog-section" className="py-12 bg-white dark:bg-black">
  <div className="container mx-auto max-w-5xl px-4">
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1 text-center">
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Homebuying Tool</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Down Payment Calculator: Your First Step to Homeownership</h2>
        <p className="mt-3 text-muted-foreground text-lg">Plan your home purchase strategically by understanding how much you need to save</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Down Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                A <strong>Down Payment Calculator</strong> is an essential tool for prospective homebuyers to determine how much money they'll need to save before purchasing a property. Your down payment is the initial lump sum you pay upfront when buying a home, reducing the amount you need to borrow.
              </p>
              <p className="mt-3">
                Down payments typically serve several important purposes:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Reduce your loan amount and monthly payments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Lower your interest rate and potentially avoid mortgage insurance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Demonstrate financial stability to lenders</span>
                </li>
                <li className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Build instant equity in your new home</span>
                </li>
              </ul>
              <p>
                Understanding how much you need to save—and exploring different down payment options—can significantly impact your homebuying journey, monthly budget, and long-term financial health.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Typical Down Payment Percentages</h3>
                <div className="h-[200px]">
                  <Bar 
                    data={{
                      labels: ['First-time Buyers', 'Repeat Buyers', 'All Homebuyers'],
                      datasets: [
                        {
                          label: 'Average Down Payment (%)',
                          data: [7, 17, 13],
                          backgroundColor: 'rgba(59, 130, 246, 0.8)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 1
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => value + '%' },
                          max: 25
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Data based on recent National Association of Realtors research</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> While 20% down is often considered the standard, the average first-time homebuyer puts down just 7%. Various loan programs allow qualified buyers to purchase with as little as 0-3.5% down, making homeownership more accessible than many people realize.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Down Payment Options Section */}
      <div className="mb-10" id="down-payment-options">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Down Payment Options by Loan Type
        </h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="minimum-requirements" className="font-bold text-xl mb-4">Minimum Down Payment Requirements</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-4">
                Different loan programs offer varying down payment requirements, allowing buyers to choose the option that best fits their financial situation.
              </p>
              
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Popular Loan Types and Their Minimums:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">1</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300"><strong>Conventional loans</strong></p>
                      <p className="text-blue-700 dark:text-blue-400">3% minimum for first-time buyers<br />5% minimum for repeat buyers<br />20% to avoid private mortgage insurance (PMI)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">2</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300"><strong>FHA loans</strong></p>
                      <p className="text-blue-700 dark:text-blue-400">3.5% minimum with 580+ credit score<br />10% minimum with 500-579 credit score</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">3</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300"><strong>VA loans</strong></p>
                      <p className="text-blue-700 dark:text-blue-400">0% down for qualifying veterans and active service members</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">4</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300"><strong>USDA loans</strong></p>
                      <p className="text-blue-700 dark:text-blue-400">0% down for eligible rural properties</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h4 className="font-medium mb-3">Down Payment Comparison on $300,000 Home</h4>
                <div className="h-[180px]">
                  <Bar
                    data={{
                      labels: ['VA/USDA', 'Conv (3%)', 'FHA (3.5%)', 'Conv (5%)', 'Conv (20%)'],
                      datasets: [{
                        label: 'Down Payment Amount',
                        data: [0, 9000, 10500, 15000, 60000],
                        backgroundColor: [
                          'rgba(14, 165, 233, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(139, 92, 246, 0.8)',
                          'rgba(79, 70, 229, 0.8)',
                          'rgba(16, 185, 129, 0.8)'
                        ]
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                           label: (context) => `$${typeof context.raw === 'number' ? context.raw.toLocaleString() : '0'}`
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => `$${value.toLocaleString()}` }
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">Based on a $300,000 home purchase</p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Down Payment Assistance:</strong> Many state and local programs offer grants or low-interest loans to help first-time homebuyers with down payments. These programs can reduce or even eliminate your out-of-pocket down payment costs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h3 id="pmi-impact" className="font-bold text-xl mt-8 mb-4">The PMI Factor: How Down Payment Affects Mortgage Insurance</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3">
                Private Mortgage Insurance (PMI) is typically required on conventional loans when the down payment is less than 20%. This insurance protects the lender if you default but increases your monthly payment.
              </p>
              
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">PMI Costs & Considerations:</h4>
                  
                  <ul className="mt-3 space-y-3">
                    <li className="flex items-start gap-2">
                      <Percent className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Typical PMI Cost Range</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          0.3% - 1.5% of loan amount annually, depending on:
                          <br />• Down payment percentage
                          <br />• Credit score
                          <br />• Loan term
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">PMI Removal Timeline</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          • Automatically when loan balance reaches 78% of original home value
                          <br />• By request when loan balance reaches 80% 
                          <br />• Through home appraisal if property value has increased
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="h-[180px]">
                <Line
                  data={{
                    labels: ['5%', '10%', '15%', '20%'],
                    datasets: [
                      {
                        label: 'Monthly PMI Cost',
                        data: [188, 125, 63, 0],
                        borderColor: 'rgba(14, 165, 233, 0.8)',
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        tension: 0.4
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Monthly PMI by Down Payment % ($300,000 Home)'
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => `$${context.raw}/month`
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Monthly PMI ($)'
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Important:</strong> Unlike conventional loans, FHA loans require both an upfront mortgage insurance premium (1.75% of loan amount) and an annual MIP (0.55%-1.05%) for the life of the loan in most cases. This can significantly impact your decision between loan types.
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
              <strong>Down Payment Source Requirements:</strong> Lenders typically require that down payment funds come from "seasoned" sources (money that has been in your account for at least 60-90 days) or documented gifts from family members. Unexplained large deposits may raise red flags and require additional documentation during the mortgage approval process.
            </p>
          </div>
        </div>
      </div>

      {/* Using the Calculator Section */}
      <div className="mb-10" id="calculator-guide">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Using the Down Payment Calculator</span>
              </div>
            </CardTitle>
            <CardDescription>
              How to determine your ideal down payment and monthly payment
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="calculator-inputs" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Getting Started with the Calculator
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Key Information to Enter</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Home className="h-4 w-4 mt-0.5" />
                        <span><strong>Home price:</strong> The total purchase price of your target property</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 mt-0.5" />
                        <span><strong>Down payment percentage:</strong> The percentage of the purchase price you plan to pay upfront</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calculator className="h-4 w-4 mt-0.5" />
                        <span><strong>Loan type:</strong> Conventional, FHA, VA, or USDA</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 mt-0.5" />
                        <span><strong>Interest rate:</strong> Current rate you qualify for based on your credit score</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-0.5" />
                        <span><strong>Loan term:</strong> Typically 15 or 30 years</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Additional Cost Factors</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Property taxes:</strong> Annual amount divided by 12 for monthly payment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Homeowners insurance:</strong> Annual premium divided by 12</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>HOA fees:</strong> If applicable to your property</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>PMI/MIP costs:</strong> Based on loan type and down payment percentage</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="calculator-results" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Understanding Your Results
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Key Output Values</h4>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Down Payment Amount</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            The exact dollar figure you'll need at closing for your down payment
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Loan Amount</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            The mortgage principal after subtracting your down payment
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Monthly Payment Breakdown</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Principal, interest, taxes, insurance, and PMI/MIP (if applicable)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Loan-to-Value (LTV) Ratio</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            The percentage of the home's value that's being financed
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>Pro Tip:</strong> Use the calculator to try different down payment percentages and see how they affect your monthly payment and overall loan costs. This can help you find the optimal balance between upfront costs and ongoing payments.
                      </p>
                    </div>
                  </div>
                </div>
                
                <h3 id="closing-costs" className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-6 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Don't Forget About Closing Costs
                </h3>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <h4 className="font-medium text-purple-800 dark:text-purple-300">Beyond the Down Payment</h4>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Remember that your down payment is just one part of your upfront costs. Closing costs typically add another 2-5% of the loan amount:
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                    <div className="flex justify-between items-center">
                      <span>• Loan origination fees</span>
                      <span className="font-medium">$1,000-$3,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>• Home inspection</span>
                      <span className="font-medium">$300-$500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>• Appraisal fee</span>
                      <span className="font-medium">$300-$600</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>• Title services</span>
                      <span className="font-medium">$1,000-$2,500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>• Prepaid expenses</span>
                      <span className="font-medium">$1,000-$3,000</span>
                    </div>
                  </div>
                  <p className="text-xs mt-2 text-purple-600 dark:text-purple-500">Budget for both down payment and closing costs when saving for a home purchase</p>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Example Down Payment Scenarios
            </h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="bg-orange-50 dark:bg-orange-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Home className="h-5 w-5 text-orange-600" />
                    First-Time Buyer: 3% Down
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Home price:</span>
                      <span className="font-medium">$350,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Down payment (3%):</span>
                      <span className="font-medium">$10,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Loan amount:</span>
                      <span className="font-medium">$339,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Loan type:</span>
                      <span className="font-medium">Conventional</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly payment:</span>
                      <span className="font-medium">$2,310</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Includes PMI:</span>
                      <span className="font-medium">$189/mo</span>
                    </div>
                    <div className="flex justify-between bg-orange-50 dark:bg-orange-900/20 p-1 rounded">
                      <span className="text-sm font-medium">LTV Ratio:</span>
                      <span className="font-bold">97%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    Mid-Range: 10% Down
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Home price:</span>
                      <span className="font-medium">$350,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Down payment (10%):</span>
                      <span className="font-medium">$35,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Loan amount:</span>
                      <span className="font-medium">$315,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Loan type:</span>
                      <span className="font-medium">Conventional</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly payment:</span>
                      <span className="font-medium">$2,130</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Includes PMI:</span>
                      <span className="font-medium">$118/mo</span>
                    </div>
                    <div className="flex justify-between bg-blue-50 dark:bg-blue-900/20 p-1 rounded">
                      <span className="text-sm font-medium">LTV Ratio:</span>
                      <span className="font-bold">90%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Home className="h-5 w-5 text-green-600" />
                    Traditional: 20% Down
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Home price:</span>
                      <span className="font-medium">$350,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Down payment (20%):</span>
                      <span className="font-medium">$70,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Loan amount:</span>
                      <span className="font-medium">$280,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Loan type:</span>
                      <span className="font-medium">Conventional</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly payment:</span>
                      <span className="font-medium">$1,896</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Includes PMI:</span>
                      <span className="font-medium">$0</span>
                    </div>
                    <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-1 rounded">
                      <span className="text-sm font-medium">LTV Ratio:</span>
                      <span className="font-bold">80%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Payment vs. Down Payment Trade-off</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    Note how increasing the down payment from 3% to 20% on a $350,000 home:
                    <br />• Requires $59,500 more upfront ($10,500 vs. $70,000)
                    <br />• Reduces monthly payment by $414 ($2,310 vs. $1,896)
                    <br />• Eliminates mortgage insurance completely
                    <br />
                    <br />The break-even point (where the higher down payment pays for itself) would be approximately 12 years in this example. Consider your timeline when deciding.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Down Payment Strategies Section */}
      <div className="mb-10" id="down-payment-strategies">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-blue-600" />
          Strategies to Save for a Down Payment
        </h2>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Effective Saving Methods</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <span className="text-blue-700 dark:text-blue-300 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Automate Your Savings</h4>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        Set up automatic transfers to a dedicated "house fund" account on payday before you can spend the money on other things. This "pay yourself first" approach makes saving effortless.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <span className="text-blue-700 dark:text-blue-300 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Use Windfalls Wisely</h4>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        Commit to saving tax refunds, work bonuses, gift money, and other unexpected income. These lump sums can accelerate your down payment timeline significantly.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <span className="text-blue-700 dark:text-blue-300 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Reduce Current Housing Costs</h4>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        Consider temporarily downsizing, getting a roommate, or moving in with family to dramatically increase your saving rate. This short-term sacrifice can yield long-term benefits.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <span className="text-blue-700 dark:text-blue-300 font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Explore Side Income</h4>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        Dedicate income from a part-time job, freelance work, or gig economy opportunities specifically to your down payment fund. Even an extra $500/month adds $6,000 per year to your savings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Down Payment Assistance Options</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">First-Time Homebuyer Programs</h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Many states and municipalities offer grants or forgivable loans specifically for first-time buyers, typically defined as anyone who hasn't owned a home in the past three years.
                    </p>
                    <div className="mt-2 text-sm">
                      <a href="#" className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                        Search programs in your area
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <h4 className="font-medium text-purple-800 dark:text-purple-300">Profession-Based Assistance</h4>
                    <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                      Special programs exist for educators, healthcare workers, first responders, and military members. These include the Good Neighbor Next Door program (HUD), Homes for Heroes, and various state-specific initiatives.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                    <h4 className="font-medium text-amber-800 dark:text-amber-300">Gift Funds</h4>
                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                      Most loan programs allow part or all of your down payment to come from family gifts. These require proper documentation through a gift letter and showing the funds' transfer.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Retirement Account Options</h4>
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      First-time homebuyers can withdraw up to $10,000 from IRAs without penalty (though taxes may apply). Roth IRA contributions (but not earnings) can be withdrawn at any time without penalties or taxes.
                    </p>
                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-500">
                      <strong>Note:</strong> Consider long-term retirement impacts before using these options.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-xl font-bold mb-4">Timeline to Your Down Payment Goal</h3>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4">
              <p className="mb-4">
                Use this table to estimate how long it might take to save your target down payment amount based on different monthly saving levels:
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Target Down Payment</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">$200/month</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">$500/month</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">$1,000/month</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-3 px-4 text-sm font-medium text-blue-600">$10,000 (3% on ~$330k)</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">4.2 years</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">1.7 years</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">10 months</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm font-medium text-blue-600">$20,000 (5% on $400k)</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">8.3 years</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">3.3 years</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">1.7 years</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm font-medium text-blue-600">$50,000 (10% on $500k)</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">20.8 years</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">8.3 years</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">4.2 years</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm font-medium text-blue-600">$100,000 (20% on $500k)</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">41.7 years</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">16.7 years</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">8.3 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                *Calculation assumes no interest earned. With a high-yield savings account, your timeline could be shorter.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Finding Balance:</strong> While saving for a larger down payment can reduce your monthly payments and overall interest costs, remember that waiting too long in a rising market could mean higher home prices that offset your savings. Use the Down Payment Calculator to find the right balance for your situation.
            </p>
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Making Your Down Payment Decision
            </CardTitle>
            <CardDescription>
              Finding the right balance for your homebuying journey
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              The <strong>Down Payment Calculator</strong> is an invaluable tool for bringing clarity to one of the most significant financial decisions in your homebuying journey. By exploring different down payment scenarios, you can find the optimal balance between your upfront costs, monthly payments, and long-term financial goals.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Remember these key principles when planning your down payment strategy:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Financial Considerations</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">A larger down payment reduces your monthly payment and total interest paid</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">A 20% down payment eliminates the need for mortgage insurance</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Don't deplete emergency savings for a larger down payment</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Next Steps</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Research down payment assistance programs in your area</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Get pre-approved to understand your loan options</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Set a specific savings goal with a timeline</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to plan your home purchase?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Down Payment Calculator</strong> above to find your optimal down payment strategy! For more homebuying tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/mortgage">
                        <Home className="h-4 w-4 mr-1" />
                        Mortgage Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/affordability">
                        <Calculator className="h-4 w-4 mr-1" />
                        Affordability Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/closing-costs">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Closing Cost Calculator
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
                    Calculate your monthly mortgage payments based on your loan amount and terms.
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
                    Find out how much house you can afford based on your income and expenses.
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
                  <CardTitle className="text-lg">Savings Goal Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Plan your savings strategy to reach your down payment goal on schedule.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/savings">Try Calculator</Link>
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