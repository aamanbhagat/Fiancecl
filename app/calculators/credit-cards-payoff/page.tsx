"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { SaveCalculationButton } from '@/components/save-calculation-button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DollarSign, CreditCard, Download, PlusCircle, MinusCircle, Trash2, Info, ArrowDownCircle, ArrowUpCircle, Calendar, TrendingUp, Wallet, AlertCircle, Percent, Calculator, RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import CreditCardsPayoffSchema from './schema';

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

interface CreditCard {
  id: string
  name: string
  balance: number
  apr: number
  minPaymentType: 'percentage' | 'fixed'
  minPaymentValue: number
  minPaymentAmount: number
}

interface PayoffResult {
  monthsToPayoff: number
  totalInterestPaid: number
  monthlyPayments: {
    date: Date
    principal: number
    interest: number
    balance: number
  }[]
}

export default function CreditCardsPayoffCalculator() {
  // Credit Cards State
  const [cards, setCards] = useState<CreditCard[]>([
    {
      id: '1',
      name: 'Card 1',
      balance: 5000,
      apr: 18.99,
      minPaymentType: 'percentage',
      minPaymentValue: 2,
      minPaymentAmount: 100
    },
    {
      id: '2',
      name: 'Card 2',
      balance: 3000,
      apr: 24.99,
      minPaymentType: 'percentage',
      minPaymentValue: 3,
      minPaymentAmount: 50
    }
  ])

  // Payment Strategy State
  const [extraPayment, setExtraPayment] = useState<number>(200)
  const [paymentStrategy, setPaymentStrategy] = useState<'snowball' | 'avalanche'>('avalanche')
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'biweekly'>('monthly')

  // Results State
  const [payoffResults, setPayoffResults] = useState<{
    snowball: PayoffResult
    avalanche: PayoffResult
  }>({
    snowball: {
      monthsToPayoff: 0,
      totalInterestPaid: 0,
      monthlyPayments: []
    },
    avalanche: {
      monthsToPayoff: 0,
      totalInterestPaid: 0,
      monthlyPayments: []
    }
  })

  // Add new card
  const addCard = () => {
    const newCard: CreditCard = {
      id: String(cards.length + 1),
      name: `Card ${cards.length + 1}`,
      balance: 0,
      apr: 0,
      minPaymentType: 'percentage',
      minPaymentValue: 2,
      minPaymentAmount: 0
    }
    setCards([...cards, newCard])
  }

  // Remove card
  const removeCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id))
  }

  // Update card
  const updateCard = (id: string, updates: Partial<CreditCard>) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ))
  }

  // Calculate minimum payment
  const calculateMinPayment = (card: CreditCard) => {
    if (card.minPaymentType === 'fixed') {
      return card.minPaymentAmount
    } else {
      const calculatedPayment = (card.balance * (card.minPaymentValue / 100))
      return Math.max(calculatedPayment, 25) // Assuming $25 minimum
    }
  }

  // Calculate payoff schedule
  const calculatePayoff = (strategy: 'snowball' | 'avalanche') => {
    let remainingBalances = [...cards].map(card => ({
      ...card,
      balance: card.balance
    }))

    const sortedCards = [...remainingBalances].sort((a, b) => {
      if (strategy === 'snowball') {
        return a.balance - b.balance
      } else {
        return b.apr - a.apr
      }
    })

    let months = 0
    let totalInterest = 0
    const monthlyPayments: {
      date: Date;
      principal: number;
      interest: number;
      balance: number;
    }[] = []

    while (remainingBalances.some(card => card.balance > 0) && months < 360) {
      let availableExtra = extraPayment
      const currentDate = new Date()
      currentDate.setMonth(currentDate.getMonth() + months)

      // Pay minimum on all cards
      remainingBalances.forEach(card => {
        if (card.balance <= 0) return

        const monthlyInterest = (card.apr / 100 / 12) * card.balance
        totalInterest += monthlyInterest
        card.balance += monthlyInterest

        const minPayment = calculateMinPayment(card)
        const payment = Math.min(minPayment, card.balance)
        card.balance -= payment
        availableExtra -= payment
      })

      // Apply extra payment according to strategy
      for (const targetCard of sortedCards) {
        const card = remainingBalances.find(c => c.id === targetCard.id)
        if (!card || card.balance <= 0) continue

        const extraPaymentAmount = Math.min(availableExtra, card.balance)
        if (extraPaymentAmount > 0) {
          card.balance -= extraPaymentAmount
          availableExtra -= extraPaymentAmount
        }

        if (availableExtra <= 0) break
      }

      // Record monthly totals
      monthlyPayments.push({
        date: currentDate,
        principal: extraPayment - availableExtra,
        interest: totalInterest / (months + 1),
        balance: remainingBalances.reduce((sum, card) => sum + card.balance, 0)
      })

      months++
    }

    return {
      monthsToPayoff: months,
      totalInterestPaid: totalInterest,
      monthlyPayments
    }
  }

  // Recalculate when inputs change
  useEffect(() => {
    const snowballResults = calculatePayoff('snowball')
    const avalancheResults = calculatePayoff('avalanche')
    
    setPayoffResults({
      snowball: snowballResults,
      avalanche: avalancheResults
    })
  }, [cards, extraPayment, paymentStrategy, paymentFrequency])

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

  // Method comparison chart
  const methodComparisonData = {
    labels: ['Total Months', 'Total Interest'],
    datasets: [
      {
        label: 'Snowball Method',
        data: [
          payoffResults.snowball.monthsToPayoff,
          payoffResults.snowball.totalInterestPaid
        ],
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Avalanche Method',
        data: [
          payoffResults.avalanche.monthsToPayoff,
          payoffResults.avalanche.totalInterestPaid
        ],
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const methodComparisonOptions: ChartOptions<'bar'> = {
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
        formatter: (value: number) => {
          if (value > 100) {
            return '$' + Math.round(value).toLocaleString()
          }
          return value.toFixed(0)
        }
      }
    }
  }

  // Balance over time chart
  const generateBalanceChart = () => {
    const currentResults = paymentStrategy === 'snowball' 
      ? payoffResults.snowball 
      : payoffResults.avalanche

    const months = Array.from(
      { length: currentResults.monthsToPayoff }, 
      (_, i) => `Month ${i + 1}`
    )

    return {
      labels: months,
      datasets: [
        {
          label: 'Total Balance',
          data: currentResults.monthlyPayments.map(payment => payment.balance),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Interest Paid',
          data: currentResults.monthlyPayments.map(payment => payment.interest),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4
        }
      ]
    }
  }

  const balanceChartOptions: ChartOptions<'line'> = {
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
    pdf.save('credit-cards-payoff-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <CreditCardsPayoffSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Credit Cards Payoff <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Compare different debt payoff strategies and create a plan to become debt-free faster.
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
                    <CardTitle>Enter Credit Card Details</CardTitle>
                    <CardDescription>
                      Add your credit cards and choose your preferred payoff strategy.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Credit Cards */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Credit Cards</h3>
                        <Button 
                          onClick={addCard} 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Add Card
                        </Button>
                      </div>
                      
                      <div className="space-y-6">
                        {cards.map((card) => (
                          <Card key={card.id} className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-2"
                              onClick={() => removeCard(card.id)}
                              disabled={cards.length <= 1}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <CardContent className="pt-6">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor={`card-name-${card.id}`}>Card Name</Label>
                                  <Input
                                    id={`card-name-${card.id}`}
                                    value={card.name}
                                    onChange={(e) => updateCard(card.id, { name: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`card-balance-${card.id}`}>Current Balance</Label>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                      id={`card-balance-${card.id}`}
                                      type="number"
                                      className="pl-9"
                                      value={card.balance}
                                      onChange={(e) => updateCard(card.id, { balance: Number(e.target.value) })}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`card-apr-${card.id}`}>APR</Label>
                                  <div className="relative">
                                    <Input
                                      id={`card-apr-${card.id}`}
                                      type="number"
                                      step="0.01"
                                      value={card.apr}
                                      onChange={(e) => updateCard(card.id, { apr: Number(e.target.value) })}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                      %
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`min-payment-type-${card.id}`}>Minimum Payment Type</Label>
                                  <Select
                                    value={card.minPaymentType}
                                    onValueChange={(value: 'percentage' | 'fixed') => 
                                      updateCard(card.id, { minPaymentType: value })
                                    }
                                  >
                                    <SelectTrigger id={`min-payment-type-${card.id}`}>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="percentage">Percentage of Balance</SelectItem>
                                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`min-payment-value-${card.id}`}>
                                    {card.minPaymentType === 'percentage' ? 'Minimum Payment %' : 'Fixed Payment Amount'}
                                  </Label>
                                  <div className="relative">
                                    {card.minPaymentType === 'fixed' && (
                                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    )}
                                    <Input
                                      id={`min-payment-value-${card.id}`}
                                      type="number"
                                      className={card.minPaymentType === 'fixed' ? 'pl-9' : ''}
                                      value={card.minPaymentType === 'percentage' ? card.minPaymentValue : card.minPaymentAmount}
                                      onChange={(e) => {
                                        const value = Number(e.target.value)
                                        if (card.minPaymentType === 'percentage') {
                                          updateCard(card.id, { minPaymentValue: value })
                                        } else {
                                          updateCard(card.id, { minPaymentAmount: value })
                                        }
                                      }}
                                    />
                                    {card.minPaymentType === 'percentage' && (
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        %
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Payment Strategy */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Payment Strategy</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="extra-payment">Extra Monthly Payment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="extra-payment"
                              type="number"
                              className="pl-9"
                              value={extraPayment || ''} onChange={(e) => setExtraPayment(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-strategy">Payoff Strategy</Label>
                          <Select
                            value={paymentStrategy}
                            onValueChange={(value: 'snowball' | 'avalanche') => setPaymentStrategy(value)}
                          >
                            <SelectTrigger id="payment-strategy">
                              <SelectValue placeholder="Select strategy" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="avalanche">
                                Debt Avalanche (Highest APR First)
                              </SelectItem>
                              <SelectItem value="snowball">
                                Debt Snowball (Lowest Balance First)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-frequency">Payment Frequency</Label>
                          <Select
                            value={paymentFrequency}
                            onValueChange={(value: 'monthly' | 'biweekly') => setPaymentFrequency(value)}
                          >
                            <SelectTrigger id="payment-frequency">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <p className="text-sm text-muted-foreground">Time to Debt Free</p>
                        <p className="text-2xl font-bold text-primary">
                          {payoffResults[paymentStrategy].monthsToPayoff} months
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(payoffResults[paymentStrategy].totalInterestPaid)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="comparison" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="comparison">Strategy Comparison</TabsTrigger>
                        <TabsTrigger value="timeline">Payoff Timeline</TabsTrigger>
                      </TabsList>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={methodComparisonData} options={methodComparisonOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Strategy Comparison</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Snowball Method</span>
                              <div className="text-right">
                                <div>{payoffResults.snowball.monthsToPayoff} months</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatCurrency(payoffResults.snowball.totalInterestPaid)} interest
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Avalanche Method</span>
                              <div className="text-right">
                                <div>{payoffResults.avalanche.monthsToPayoff} months</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatCurrency(payoffResults.avalanche.totalInterestPaid)} interest
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Potential Savings</span>
                              <span>
                                {formatCurrency(Math.abs(
                                  payoffResults.snowball.totalInterestPaid - 
                                  payoffResults.avalanche.totalInterestPaid
                                ))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="timeline" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateBalanceChart()} options={balanceChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Payment Schedule</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Monthly Payment</span>
                              <span className="font-medium">
                                {formatCurrency(extraPayment + cards.reduce(
                                  (sum, card) => sum + calculateMinPayment(card),
                                  0
                                ))}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Extra Payment</span>
                              <span className="font-medium">{formatCurrency(extraPayment)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Strategy Explanation */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">
                              {paymentStrategy === 'avalanche' ? 'Debt Avalanche Method' : 'Debt Snowball Method'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {paymentStrategy === 'avalanche' 
                                ? "Focusing on the highest interest rate first minimizes the total interest paid."
                                : "Paying off the smallest balance first provides quick wins and motivation."}
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mb-2">Debt Management Resource</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-purple-600 bg-clip-text text-transparent">Master Your Credit Card Debt: Path to Financial Freedom</h2>
        <p className="mt-3 text-muted-foreground text-lg">Strategies and insights to eliminate debt faster and save thousands in interest</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-red-200 dark:border-red-900">
        <CardHeader className="bg-red-50 dark:bg-red-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-red-600 dark:text-red-400" />
            Understanding Credit Card Payoff Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-calculator" className="text-2xl font-bold mb-4 text-red-700 dark:text-red-400">What is a Credit Card Payoff Calculator?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                A <strong>Credit Card Payoff Calculator</strong> is a financial planning tool that helps you understand how long it will take to eliminate your credit card debt and how much interest you'll pay under different repayment strategies. It transforms complex financial calculations into clear, actionable insights to accelerate your journey to debt freedom.
              </p>
              <p className="mt-2">
                These calculators help you:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>Create a realistic payoff timeline based on your payment capacity</span>
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>Calculate total interest costs under different repayment methods</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>Compare strategies like avalanche vs. snowball approaches</span>
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>Explore the impact of paying more than the minimum each month</span>
                </li>
              </ul>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-red-100 to-purple-50 dark:from-red-900/60 dark:to-purple-900/60">
                  <CardTitle className="text-sm font-medium text-center">Debt Freedom Timeline Comparison</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Bar 
                      data={{
                        labels: ['Minimum Payment', '$100 Extra', '$200 Extra'],
                        datasets: [
                          {
                            label: 'Months to Debt Freedom',
                            data: [186, 46, 27],
                            backgroundColor: [
                              'rgba(239, 68, 68, 0.7)',
                              'rgba(139, 92, 246, 0.7)',
                              'rgba(16, 185, 129, 0.7)'
                            ],
                            borderWidth: 1,
                            borderRadius: 4
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
                            title: {
                              display: true,
                              text: 'Months'
                            },
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <h4 id="why-important" className="font-semibold text-xl mt-6">The Credit Card Debt Reality</h4>
          <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Growing Consumer Debt</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">The average American household carries $7,486 in revolving credit card debt with an average APR of 21.47%</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Minimum Payment Trap</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Making only minimum payments on $5,000 of credit card debt can take over 15 years to pay off and cost over $7,500 in interest</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Financial Stress</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">56% of Americans with credit card debt have been carrying balances for over a year</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Understanding Credit Card Interest Section */}
      <div className="mb-12" id="understanding-interest">
        <div className="flex items-center gap-2 mb-4">
          <Percent className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold">How Credit Card Interest Really Works</h2>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-900/20 dark:to-purple-900/20 p-6 rounded-xl mb-6 border border-red-100 dark:border-red-800">
          <h3 id="calculation-method" className="font-bold text-xl mb-4">The Daily Compound Interest Calculation</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="bg-red-50 dark:bg-red-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-red-600" />
                  Interest Calculation Formula
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>
                  Credit card interest isn't just calculated monthly—it compounds <strong>daily</strong>, making it even more expensive than many consumers realize.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-red-100/50 dark:bg-red-900/50 rounded-md">
                    <p className="font-medium text-red-800 dark:text-red-300">How it's calculated:</p>
                    <ol className="mt-2 space-y-2 text-sm text-red-700 dark:text-red-400">
                      <li><strong>1.</strong> Convert your annual rate (APR) to a daily rate:<br/> Daily Rate = APR ÷ 365</li>
                      <li><strong>2.</strong> Multiply your daily balance by the daily rate:<br/> Daily Interest = Balance × Daily Rate</li>
                      <li><strong>3.</strong> Add daily interest to your balance for the next day's calculation</li>
                    </ol>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    For example: A $5,000 balance with 19.99% APR accrues approximately $2.74 in interest <i>every single day</i>.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="bg-red-50 dark:bg-red-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-red-600" />
                  Minimum Payment Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <p className="font-medium">How your minimum payment is divided:</p>
                  <div className="h-[170px]">
                    <Pie 
                      data={{
                        labels: ['Interest', 'Principal'],
                        datasets: [
                          {
                            data: [82, 18],
                            backgroundColor: [
                              'rgba(239, 68, 68, 0.7)',
                              'rgba(16, 185, 129, 0.7)'
                            ],
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } },
                          datalabels: {
                            color: '#fff',
                            font: { weight: 'bold' },
                            formatter: value => value + '%'
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    Typical distribution of a first minimum payment on $5,000 at 19.99% APR
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <h3 id="minimum-payment-trap" className="font-bold text-xl mt-8 mb-4">The Minimum Payment Trap</h3>
        
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <p>
                    Minimum payments are designed to maximize bank profits while keeping you in debt as long as possible. Credit card issuers typically set minimums at just 1-3% of your balance plus interest.
                  </p>
                  
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 my-4">
                    <p className="font-medium text-red-800 dark:text-red-300 mb-2">Typical Minimum Payment Formula:</p>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      The greater of:
                      <br />• 1-3% of balance + monthly interest + fees
                      <br />• A fixed amount ($25-35)
                    </p>
                  </div>
                  
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">Reality Check</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          On a $5,000 credit card balance with 19.99% APR:
                          <br />• Minimum payments: 15+ years to pay off
                          <br />• Total interest: $7,517
                          <br />• Total cost: $12,517 (250% of original balance)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-[300px] flex-shrink-0">
                  <h4 className="text-center text-sm font-medium mb-3">Minimum Payment Timeline</h4>
                  <div className="h-[240px]">
                    <Line
                      data={{
                        labels: ['Start', 'Year 3', 'Year 6', 'Year 9', 'Year 12', 'Year 15'],
                        datasets: [{
                          label: 'Remaining Balance',
                          data: [5000, 4328, 3426, 2325, 1096, 0],
                          borderColor: 'rgba(239, 68, 68, 0.8)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          fill: true
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Balance Remaining'
                            },
                            ticks: { callback: value => '$' + value }
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground mt-2">
                    $5,000 balance at 19.99% APR with minimum payments
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payoff Strategies Section */}
      <div className="mb-12" id="payoff-strategies">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
            <CardTitle>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <span className="text-2xl">Proven Debt Payoff Strategies</span>
              </div>
            </CardTitle>
            <CardDescription>
              Scientific approaches to eliminate your credit card debt faster
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 id="fixed-payment" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  The Fixed Payment Method
                </h3>
                
                <p>
                  The simplest yet most effective strategy is committing to a consistent, fixed payment amount that's significantly higher than the minimum payment. This prevents the "shrinking payment trap" that credit card companies design into minimum payment calculations.
                </p>
                <div className="mt-4 h-[220px]">
                  <Line 
                    data={{
                      labels: ['0', '6', '12', '18', '24', '30', '36', '42'],
                      datasets: [
                        {
                          label: 'Minimum Payments',
                          data: [5000, 4753, 4493, 4218, 3927, 3620, 3294, 2950],
                          borderColor: 'rgba(239, 68, 68, 0.8)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          fill: true
                        },
                        {
                          label: 'Fixed $250 Payment',
                          data: [5000, 3977, 2871, 1673, 375, 0, null, null],
                          borderColor: 'rgba(139, 92, 246, 0.8)',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          fill: true
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
                            text: 'Months'
                          }
                        },
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Balance Remaining'
                          },
                          ticks: { callback: value => '$' + value }
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  $5,000 balance at 19.99% APR comparing payment methods
                </p>
              </div>
              
              <div>
                <h3 id="snowball-avalanche" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Snowball vs. Avalanche Methods
                </h3>
                <p className="mb-4">
                  When dealing with multiple credit cards, you'll need a systematic approach to prioritize which debts to tackle first.
                </p>
                <div className="space-y-4">
                  <Card className="border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="py-3 bg-indigo-50 dark:bg-indigo-900/30">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">1</span>
                        Debt Snowball Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm">
                        Pay minimum payments on all cards, but put <strong>extra money toward your smallest balance first</strong>. Once paid off, roll that payment to the next smallest balance.
                      </p>
                      <div className="mt-3 p-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-md">
                        <p className="text-xs text-indigo-800 dark:text-indigo-300">
                          <strong>Best for:</strong> Those who need psychological wins and motivation from early successes. Research shows behavioral benefits can outweigh mathematical optimality.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader className="py-3 bg-purple-50 dark:bg-purple-900/30">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">2</span>
                        Debt Avalanche Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm">
                        Pay minimum payments on all cards, but put <strong>extra money toward your highest interest rate balance first</strong>. Once paid off, move to the next highest rate.
                      </p>
                      <div className="mt-3 p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-md">
                        <p className="text-xs text-purple-800 dark:text-purple-300">
                          <strong>Best for:</strong> Those who want to minimize total interest paid and are motivated by mathematical optimization. This approach always saves the most money overall.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 id="payment-comparison" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-6">Payment Strategy Comparison</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Minimum Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-[120px]">
                      <Bar
                        data={{
                          labels: ['Total Paid'],
                          datasets: [
                            {
                              label: 'Principal',
                              data: [5000],
                              backgroundColor: 'rgba(16, 185, 129, 0.7)',
                            },
                            {
                              label: 'Interest',
                              data: [7517],
                              backgroundColor: 'rgba(239, 68, 68, 0.7)',
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          indexAxis: 'y',
                          scales: {
                            x: {
                              stacked: true,
                              ticks: { callback: value => '$' + Number(value).toLocaleString() }
                            },
                            y: { stacked: true }
                          },
                          plugins: {
                            legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } },
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payoff Time:</span>
                        <span className="font-medium">15 years, 6 months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Interest:</span>
                        <span className="font-medium text-red-600">$7,517</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Payments:</span>
                        <span className="font-medium">$12,517</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Fixed $150 Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-[120px]">
                      <Bar
                        data={{
                          labels: ['Total Paid'],
                          datasets: [
                            {
                              label: 'Principal',
                              data: [5000],
                              backgroundColor: 'rgba(16, 185, 129, 0.7)',
                            },
                            {
                              label: 'Interest',
                              data: [2436],
                              backgroundColor: 'rgba(239, 68, 68, 0.7)',
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          indexAxis: 'y',
                          scales: {
                            x: {
                              stacked: true,
                              ticks: { callback: value => '$' + Number(value).toLocaleString() }
                            },
                            y: { stacked: true }
                          },
                          plugins: {
                            legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } },
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payoff Time:</span>
                        <span className="font-medium">4 years, 2 months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Interest:</span>
                        <span className="font-medium text-red-600">$2,436</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Payments:</span>
                        <span className="font-medium">$7,436</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Fixed $250 Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-[120px]">
                      <Bar
                        data={{
                          labels: ['Total Paid'],
                          datasets: [
                            {
                              label: 'Principal',
                              data: [5000],
                              backgroundColor: 'rgba(16, 185, 129, 0.7)',
                            },
                            {
                              label: 'Interest',
                              data: [1368],
                              backgroundColor: 'rgba(239, 68, 68, 0.7)',
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          indexAxis: 'y',
                          scales: {
                            x: {
                              stacked: true,
                              ticks: { callback: value => '$' + Number(value).toLocaleString() }
                            },
                            y: { stacked: true }
                          },
                          plugins: {
                            legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } },
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payoff Time:</span>
                        <span className="font-medium">2 years, 2 months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Interest:</span>
                        <span className="font-medium text-red-600">$1,368</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Payments:</span>
                        <span className="font-medium">$6,368</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Strategies Section */}
      <div className="mb-12" id="advanced-strategies">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <RefreshCw className="h-6 w-6 text-primary" />
          Advanced Debt Elimination Tactics
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                Balance Transfer Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  <strong>Balance transfers</strong> involve moving debt from high-interest cards to a new card with a low or 0% introductory rate, typically for 12-21 months.
                </p>
                
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="text-center text-sm font-medium mb-3">Interest Savings with Balance Transfer</h4>
                  <div className="h-[180px]">
                    <Bar 
                      data={{
                        labels: ['Original Card (19.99%)', '0% for 15 Months'],
                        datasets: [{
                          label: 'Interest Paid on $5,000 Over 15 Months',
                          data: [1247, 150],
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.7)',
                            'rgba(16, 185, 129, 0.7)',
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
                            ticks: { callback: value => '$' + value }
                          }
                        },
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return context.dataset.label + ': $' + context.raw;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Assumes $5,000 balance, 3% transfer fee ($150), paid off over 15 months
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Key Considerations</p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                      <li>• Balance transfer fee (typically 3-5% of balance)</li>
                      <li>• Create a plan to pay off the full balance before promotional period ends</li>
                      <li>• Avoid making new purchases on the balance transfer card</li>
                      <li>• Regular APR after promotion is often higher than average</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Debt Consolidation Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                A <strong>debt consolidation loan</strong> is a personal loan used to pay off multiple credit card balances, combining them into a single loan with a fixed interest rate and payment schedule.
              </p>
              
              <div className="h-[200px]">
                <Line 
                  data={{
                    labels: ['Month 1', 'Month 12', 'Month 24', 'Month 36', 'Month 48', 'Month 60'],
                    datasets: [
                      {
                        label: 'Credit Cards (19.99%)',
                        data: [15000, 13247, 11166, 8706, 5806, 2399],
                        borderColor: 'rgba(239, 68, 68, 0.8)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      },
                      {
                        label: 'Consolidation Loan (9.5%)',
                        data: [15000, 12406, 9529, 6337, 2803, 0],
                        borderColor: 'rgba(139, 92, 246, 0.8)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Balance Remaining'
                        },
                        ticks: { callback: value => '$' + value }
                      }
                    },
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } }
                    }
                  }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Comparing $15,000 in credit card debt vs. consolidation loan with $326 payment
              </p>
              
              <div className="mt-4 p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-md">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  <strong>Benefits:</strong>
                </p>
                <ul className="mt-1 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                  <li>• Fixed payment schedule with defined payoff date</li>
                  <li>• Typically lower interest rates (7-15% vs. 19-29%)</li>
                  <li>• Simplified payments (one monthly payment)</li>
                  <li>• Can improve credit utilization ratio</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 id="protecting-credit-score" className="text-xl font-bold mb-4">Protecting Your Credit Score While Paying Off Debt</h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <span className="text-sm font-bold text-emerald-600">1</span>
                </span>
                <CardTitle className="text-base">Don't Close Paid Cards</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Keep credit card accounts open even after paying them off. This preserves your credit history length and keeps your credit utilization ratio lower.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <span className="text-sm font-bold text-emerald-600">2</span>
                </span>
                <CardTitle className="text-base">Always Pay On Time</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Payment history accounts for 35% of your credit score. Set up automatic minimum payments to ensure you never miss a due date during your debt payoff journey.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <span className="text-sm font-bold text-emerald-600">3</span>
                </span>
                <CardTitle className="text-base">Avoid New Credit</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Minimize applications for new credit while paying down debt. Each application creates a hard inquiry on your credit report and can temporarily lower your score.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Emergency Fund While Paying Off Debt</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                While aggressively paying down debt, maintain a small emergency fund of $1,000-2,000 to avoid relying on credit cards for unexpected expenses. Once debt-free, build this to 3-6 months of essential expenses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <div className="mb-6" id="conclusion">
        <Card className="overflow-hidden border-red-200 dark:border-red-900">
          <CardHeader className="bg-gradient-to-r from-red-100 to-purple-50 dark:from-red-900/40 dark:to-purple-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-red-700 dark:text-red-400" />
              Your Path to Credit Card Debt Freedom
            </CardTitle>
            <CardDescription>
              Taking control of your financial future, one payment at a time
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Credit card payoff calculators</strong> give you the precise roadmap needed to break free from the cycle of revolving debt. By understanding how interest compounds, the true cost of minimum payments, and the dramatic impact of increasing your monthly payment amount, you gain the power to make informed decisions that can save thousands of dollars and years of financial stress.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Take these actionable steps today:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-100 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Immediate Actions</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-700 text-xs font-bold dark:bg-red-900 dark:text-red-300">1</span>
                    <span className="text-red-800 dark:text-red-300">List all your credit card balances, interest rates, and minimum payments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-700 text-xs font-bold dark:bg-red-900 dark:text-red-300">2</span>
                    <span className="text-red-800 dark:text-red-300">Use our calculator to establish a fixed payment amount for each card</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-700 text-xs font-bold dark:bg-red-900 dark:text-red-300">3</span>
                    <span className="text-red-800 dark:text-red-300">Stop using cards while in payoff mode</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-100 dark:border-purple-800">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Sustainable Strategy</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">1</span>
                    <span className="text-purple-800 dark:text-purple-300">Choose either snowball or avalanche method based on your motivation style</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">2</span>
                    <span className="text-purple-800 dark:text-purple-300">Create automatic payment schedules to ensure consistency</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">3</span>
                    <span className="text-purple-800 dark:text-purple-300">Track progress monthly to maintain motivation</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-900/30 dark:to-purple-900/30 rounded-lg border border-red-100 dark:border-red-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-medium text-lg text-red-800 dark:text-red-300">Ready to calculate your freedom date?</p>
                  <p className="mt-1 text-red-700 dark:text-red-400">
                    Use our <strong>Credit Card Payoff Calculator</strong> above to design your personalized path out of debt! For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/debt-snowball">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Debt Snowball Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/consolidation">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Debt Consolidation
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/budget">
                        <Wallet className="h-4 w-4 mr-1" />
                        Budget Calculator
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
      <SaveCalculationButton calculatorType="credit-cards-payoff" inputs={{}} results={{}} />
      </main>
      <SiteFooter />
    </div>
  )
}