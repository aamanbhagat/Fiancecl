"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from 'uuid'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { SaveCalculationButton } from "@/components/save-calculation-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Plus, Trash2, GripVertical, CreditCard, Wallet, Car, GraduationCap, Home, Calendar, CheckCircle, Percent, AlertTriangle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement, ChartOptions } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { cn } from "@/lib/utils"
import Link from 'next/link' // Added missing import
import DebtPayoffSchema from './schema';

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

interface Debt {
  id: string
  name: string
  balance: number
  interestRate: number
  minimumPayment: number
  type: string
  order: number
}

interface PaymentSchedule {
  month: number
  remainingBalance: number
  payment: number
  principal: number
  interest: number
  totalInterest: number
}

interface DebtPayoffResult {
  monthsToPayoff: number
  totalInterest: number
  totalAmount: number
  schedule: PaymentSchedule[]
}

export default function DebtPayoffCalculator() {
  // State for debts
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: uuidv4(),
      name: "Credit Card 1",
      balance: 5000,
      interestRate: 18.99,
      minimumPayment: 150,
      type: "credit-card",
      order: 0
    },
    {
      id: uuidv4(),
      name: "Car Loan",
      balance: 15000,
      interestRate: 5.99,
      minimumPayment: 300,
      type: "car-loan",
      order: 1
    }
  ])

  // Payment strategy state
  const [paymentStrategy, setPaymentStrategy] = useState<"avalanche" | "snowball" | "custom">("avalanche")
  const [extraPayment, setExtraPayment] = useState<number>(200)
  const [paymentFrequency, setPaymentFrequency] = useState<"monthly" | "bi-weekly">("monthly")

  // Results state
  const [results, setResults] = useState<{
    avalanche: DebtPayoffResult
    snowball: DebtPayoffResult
    custom: DebtPayoffResult
  }>({
    avalanche: { monthsToPayoff: 0, totalInterest: 0, totalAmount: 0, schedule: [] },
    snowball: { monthsToPayoff: 0, totalInterest: 0, totalAmount: 0, schedule: [] },
    custom: { monthsToPayoff: 0, totalInterest: 0, totalAmount: 0, schedule: [] }
  })

  // Calculate debt payoff schedule
  const calculatePayoffSchedule = (
    debtsToCalculate: Debt[],
    strategy: "avalanche" | "snowball" | "custom",
    monthlyExtra: number
  ): DebtPayoffResult => {
    let remainingDebts = [...debtsToCalculate].map(debt => ({
      ...debt,
      currentBalance: debt.balance
    }))

    let schedule: PaymentSchedule[] = []
    let month = 0
    let totalInterest = 0
    let totalInitialBalance = debtsToCalculate.reduce((sum, debt) => sum + debt.balance, 0)

    // Sort debts based on strategy
    if (strategy === "avalanche") {
      remainingDebts.sort((a, b) => b.interestRate - a.interestRate)
    } else if (strategy === "snowball") {
      remainingDebts.sort((a, b) => a.balance - b.balance)
    }
    // Custom order is preserved

    while (remainingDebts.length > 0 && month < 360) { // 30 years max
      month++
      let monthlyPayment = 0
      let monthlyPrincipal = 0
      let monthlyInterest = 0
      let extraRemaining = monthlyExtra

      // Calculate interest and make minimum payments
      remainingDebts = remainingDebts.map(debt => {
        const monthlyRate = debt.interestRate / 100 / 12
        const interest = debt.currentBalance * monthlyRate
        totalInterest += interest
        monthlyInterest += interest

        let payment = Math.min(debt.minimumPayment, debt.currentBalance + interest)
        
        // Add extra payment to first debt in list
        if (extraRemaining > 0 && debt === remainingDebts[0]) {
          const maxExtra = debt.currentBalance + interest - payment
          const appliedExtra = Math.min(extraRemaining, maxExtra)
          payment += appliedExtra
          extraRemaining -= appliedExtra
        }

        monthlyPayment += payment
        const principal = payment - interest
        monthlyPrincipal += principal

        return {
          ...debt,
          currentBalance: debt.currentBalance - principal
        }
      })

      // Record monthly totals
      schedule.push({
        month,
        remainingBalance: remainingDebts.reduce((sum, debt) => sum + debt.currentBalance, 0),
        payment: monthlyPayment,
        principal: monthlyPrincipal,
        interest: monthlyInterest,
        totalInterest
      })

      // Remove paid off debts
      remainingDebts = remainingDebts.filter(debt => debt.currentBalance > 0.01)
    }

    return {
      monthsToPayoff: month,
      totalInterest,
      totalAmount: totalInitialBalance + totalInterest,
      schedule
    }
  }

  // Recalculate results when inputs change
  useEffect(() => {
    const avalancheResult = calculatePayoffSchedule(debts, "avalanche", extraPayment)
    const snowballResult = calculatePayoffSchedule(debts, "snowball", extraPayment)
    const customResult = calculatePayoffSchedule(debts, "custom", extraPayment)

    setResults({
      avalanche: avalancheResult,
      snowball: snowballResult,
      custom: customResult
    })
  }, [debts, extraPayment, paymentFrequency])

  // Handle debt reordering for custom strategy
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(debts)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order property
    const reorderedDebts = items.map((debt, index) => ({
      ...debt,
      order: index
    }))

    setDebts(reorderedDebts)
  }

  // Add new debt
  const addDebt = () => {
    const newDebt: Debt = {
      id: uuidv4(),
      name: `Debt ${debts.length + 1}`,
      balance: 1000,
      interestRate: 10,
      minimumPayment: 50,
      type: "credit-card",
      order: debts.length
    }
    setDebts([...debts, newDebt])
  }

  // Remove debt
  const removeDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id))
  }

  // Update debt
  const updateDebt = (id: string, field: keyof Debt, value: any) => {
    setDebts(debts.map(debt => 
      debt.id === id ? { ...debt, [field]: value } : debt
    ))
  }

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

  // Generate comparison chart data
  const comparisonChartData = {
    labels: ['Months to Payoff', 'Total Interest', 'Total Amount'],
    datasets: [
      {
        label: 'Avalanche Method',
        data: [
          results.avalanche.monthsToPayoff,
          results.avalanche.totalInterest,
          results.avalanche.totalAmount
        ],
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Snowball Method',
        data: [
          results.snowball.monthsToPayoff,
          results.snowball.totalInterest,
          results.snowball.totalAmount
        ],
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Custom Order',
        data: [
          results.custom.monthsToPayoff,
          results.custom.totalInterest,
          results.custom.totalAmount
        ],
        backgroundColor: chartColors.primary[2],
        borderColor: chartColors.secondary[2].replace('0.2', '1'),
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
            if (typeof value === 'number') {
              if (value > 1000) {
                return '$' + (value / 1000).toFixed(1) + 'k'
              }
              return '$' + value.toLocaleString()
            }
            return value
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
        formatter: (value: number, context: any) => {
          const label = context.chart.data.labels[context.dataIndex]
          if (label === 'Months to Payoff') {
            return value.toFixed(0) + ' mo'
          }
          return '$' + (value / 1000).toFixed(1) + 'k'
        }
      }
    }
  }

  // Generate payoff timeline chart
  const generatePayoffChart = () => {
    const currentStrategy = paymentStrategy === 'avalanche' ? results.avalanche :
                          paymentStrategy === 'snowball' ? results.snowball :
                          results.custom

    const months = Array.from(
      { length: currentStrategy.schedule.length },
      (_, i) => `Month ${i + 1}`
    )

    return {
      labels: months,
      datasets: [
        {
          label: 'Remaining Balance',
          data: currentStrategy.schedule.map(month => month.remainingBalance),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Total Interest Paid',
          data: currentStrategy.schedule.map(month => month.totalInterest),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
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
      x: { 
        grid: { display: false },
        ticks: {
          maxTicksLimit: 12
        }
      }
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

    const pdf = new jsPDF()
    
    // Add title
    pdf.setFontSize(20)
    pdf.text('Debt Payoff Analysis', 20, 20)

    // Add debt summary table
    pdf.setFontSize(14)
    pdf.text('Debt Summary', 20, 40)
    
    const debtData = debts.map(debt => [
      debt.name,
      formatCurrency(debt.balance),
      debt.interestRate + '%',
      formatCurrency(debt.minimumPayment)
    ])

    // @ts-ignore
    pdf.autoTable({
      head: [['Debt Name', 'Balance', 'Interest Rate', 'Min Payment']],
      body: debtData,
      startY: 45
    })

    // Add strategy comparison
        // Add strategy comparison
    pdf.setFontSize(14)
    // @ts-ignore
    pdf.text('Strategy Comparison', 20, pdf.previousAutoTable.finalY + 20)

    const comparisonData = [
      ['Avalanche', 
       results.avalanche.monthsToPayoff + ' months',
       formatCurrency(results.avalanche.totalInterest),
       formatCurrency(results.avalanche.totalAmount)
      ],
      ['Snowball',
       results.snowball.monthsToPayoff + ' months',
       formatCurrency(results.snowball.totalInterest),
       formatCurrency(results.snowball.totalAmount)
      ],
      ['Custom',
       results.custom.monthsToPayoff + ' months',
       formatCurrency(results.custom.totalInterest),
       formatCurrency(results.custom.totalAmount)
      ]
    ]

       // @ts-ignore
    pdf.autoTable({
      head: [['Strategy', 'Time to Payoff', 'Total Interest', 'Total Amount']],
      body: comparisonData,
      // @ts-ignore
      startY: pdf.previousAutoTable.finalY + 25
    })

    pdf.save('debt-payoff-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <DebtPayoffSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Debt Payoff <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
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
                    <CardTitle>Enter Your Debts</CardTitle>
                    <CardDescription>
                      Add all your debts and choose your preferred payoff strategy.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Debt List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Your Debts</h3>
                        <Button onClick={addDebt} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Debt
                        </Button>
                      </div>
                      
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="debts">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-4"
                            >
                              {debts.map((debt, index) => (
                                <Draggable
                                  key={debt.id}
                                  draggableId={debt.id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="bg-muted/50 rounded-lg p-4 relative"
                                    >
                                      <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <div
                                              {...provided.dragHandleProps}
                                              className="cursor-grab hover:text-primary"
                                            >
                                              <GripVertical className="h-4 w-4" />
                                            </div>
                                            <Input
                                              value={debt.name}
                                              onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                                              className="h-8"
                                            />
                                            <Select
                                              value={debt.type}
                                              onValueChange={(value) => updateDebt(debt.id, 'type', value)}
                                            >
                                              <SelectTrigger className="w-[120px] h-8">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="credit-card">
                                                  <div className="flex items-center">
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Credit Card
                                                  </div>
                                                </SelectItem>
                                                <SelectItem value="personal-loan">
                                                  <div className="flex items-center">
                                                    <Wallet className="h-4 w-4 mr-2" />
                                                    Personal Loan
                                                  </div>
                                                </SelectItem>
                                                <SelectItem value="car-loan">
                                                  <div className="flex items-center">
                                                    <Car className="h-4 w-4 mr-2" />
                                                    Car Loan
                                                  </div>
                                                </SelectItem>
                                                <SelectItem value="student-loan">
                                                  <div className="flex items-center">
                                                    <GraduationCap className="h-4 w-4 mr-2" />
                                                    Student Loan
                                                  </div>
                                                </SelectItem>
                                                <SelectItem value="mortgage">
                                                  <div className="flex items-center">
                                                    <Home className="h-4 w-4 mr-2" />
                                                    Mortgage
                                                  </div>
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor={`balance-${debt.id}`}>Balance</Label>
                                          <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                              id={`balance-${debt.id}`}
                                              type="number"
                                              className="pl-9 h-8"
                                              value={debt.balance}
                                              onChange={(e) => updateDebt(debt.id, 'balance', Number(e.target.value))}
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor={`interest-${debt.id}`}>Interest Rate (%)</Label>
                                          <Input
                                            id={`interest-${debt.id}`}
                                            type="number"
                                            className="h-8"
                                            value={debt.interestRate}
                                            onChange={(e) => updateDebt(debt.id, 'interestRate', Number(e.target.value))}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor={`payment-${debt.id}`}>Minimum Payment</Label>
                                          <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                              id={`payment-${debt.id}`}
                                              type="number"
                                              className="pl-9 h-8"
                                              value={debt.minimumPayment}
                                              onChange={(e) => updateDebt(debt.id, 'minimumPayment', Number(e.target.value))}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeDebt(debt.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>

                    {/* Payment Strategy */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Payment Strategy</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="strategy">Payoff Method</Label>
                          <Select value={paymentStrategy} onValueChange={(value: any) => setPaymentStrategy(value)}>
                            <SelectTrigger id="strategy">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="avalanche">
                                <div className="flex items-center">
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  Avalanche (Highest Interest First)
                                </div>
                              </SelectItem>
                              <SelectItem value="snowball">
                                <div className="flex items-center">
                                  <BarChart3 className="h-4 w-4 mr-2" />
                                  Snowball (Smallest Balance First)
                                </div>
                              </SelectItem>
                              <SelectItem value="custom">
                                <div className="flex items-center">
                                  <GripVertical className="h-4 w-4 mr-2" />
                                  Custom Order
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                          <Label htmlFor="payment-frequency">Payment Frequency</Label>
                          <Select value={paymentFrequency} onValueChange={(value: any) => setPaymentFrequency(value)}>
                            <SelectTrigger id="payment-frequency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
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
                          {results[paymentStrategy].monthsToPayoff} months
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(results[paymentStrategy].totalInterest)}
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
                          <Bar data={comparisonChartData} options={comparisonChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Strategy Comparison</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Avalanche Method</span>
                              <div className="text-right">
                                <div className="font-medium">{results.avalanche.monthsToPayoff} months</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatCurrency(results.avalanche.totalInterest)} interest
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Snowball Method</span>
                              <div className="text-right">
                                <div className="font-medium">{results.snowball.monthsToPayoff} months</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatCurrency(results.snowball.totalInterest)} interest
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Custom Order</span>
                              <div className="text-right">
                                <div className="font-medium">{results.custom.monthsToPayoff} months</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatCurrency(results.custom.totalInterest)} interest
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="timeline" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generatePayoffChart()} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Payoff Progress</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Debt</span>
                              <span className="font-medium">
                                {formatCurrency(debts.reduce((sum, debt) => sum + debt.balance, 0))}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Monthly Payment</span>
                              <span className="font-medium">
                                {formatCurrency(debts.reduce((sum, debt) => sum + debt.minimumPayment, 0) + extraPayment)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Cost</span>
                              <span>{formatCurrency(results[paymentStrategy].totalAmount)}</span>
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
                            <p className="font-medium">Strategy Details</p>
                            {paymentStrategy === 'avalanche' ? (
                              <p className="text-sm text-muted-foreground">
                                The Avalanche method prioritizes paying off debts with the highest interest rates first. 
                                This strategy minimizes the total interest paid over time.
                              </p>
                            ) : paymentStrategy === 'snowball' ? (
                              <p className="text-sm text-muted-foreground">
                                The Snowball method focuses on paying off the smallest debts first. 
                                This creates quick wins and helps build momentum through positive reinforcement.
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Custom order allows you to prioritize debts in any order you prefer. 
                                Drag and drop debts to reorder them based on your personal preferences.
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                  
                  <SaveCalculationButton
                    calculatorType="debt-payoff"
                    inputs={{
                      debts,
                      paymentStrategy,
                      extraPayment,
                      paymentFrequency
                    }}
                    results={{
                      monthsToPayoff: 0,
                      totalInterest: 0,
                      interestSaved: 0
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 mb-2">Financial Freedom Resource</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-blue-600 bg-clip-text text-transparent">Strategic Debt Elimination: Your Path to Financial Freedom</h2>
        <p className="mt-3 text-muted-foreground text-lg">Powerful strategies and insights to eliminate debt faster and reclaim your financial future</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-emerald-200 dark:border-emerald-900">
        <CardHeader className="bg-emerald-50 dark:bg-emerald-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Understanding Debt Payoff Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-calculator" className="text-2xl font-bold mb-4 text-emerald-700 dark:text-emerald-400">What is a Debt Payoff Calculator?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                A <strong>Debt Payoff Calculator</strong> is a strategic financial tool designed to create personalized debt elimination plans based on your specific financial situation. It transforms complex debt calculations into actionable roadmaps, showing you exactly how to eliminate your debt efficiently.
              </p>
              <p className="mt-2">
                These powerful calculators help you:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Visualize your debt-free date with different payment strategies</span>
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Calculate potential interest savings from accelerated payments</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Compare debt reduction methods like snowball vs. avalanche approaches</span>
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Create optimized payment plans that fit your budget</span>
                </li>
              </ul>
              <p>
                By providing clear insights into your debt repayment journey, these calculators empower you to make informed decisions and stay motivated as you progress toward financial freedom.
              </p>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-emerald-100 to-blue-50 dark:from-emerald-900/60 dark:to-blue-900/60">
                  <CardTitle className="text-sm font-medium text-center">Debt Freedom Timeline Comparison</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Bar 
                      data={{
                        labels: ['Minimum Payments', 'Debt Snowball', 'Debt Avalanche', '+$200 Extra'],
                        datasets: [
                          {
                            label: 'Months to Debt Freedom',
                            data: [96, 43, 41, 28],
                            backgroundColor: [
                              'rgba(239, 68, 68, 0.7)',
                              'rgba(16, 185, 129, 0.7)',
                              'rgba(59, 130, 246, 0.7)',
                              'rgba(139, 92, 246, 0.7)'
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
          
          <h4 id="debt-statistics" className="font-semibold text-xl mt-6">The Debt Reality in America</h4>
          <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Growing Consumer Debt</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Americans hold over $17.5 trillion in total household debt, with the average household carrying $103,358 in debt</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Interest Burden</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">The average American household pays over $6,000 in interest alone each year</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Financial Stress</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">72% of Americans report feeling stressed about their personal finances, with debt cited as the primary concern</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Understanding Debt Repayment Strategies */}
      <div className="mb-12" id="debt-strategies">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold">Proven Debt Repayment Strategies</h2>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-6 rounded-xl mb-6 border border-emerald-100 dark:border-emerald-800">
          <h3 id="strategy-comparison" className="font-bold text-xl mb-4">Choosing the Right Approach</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader className="bg-emerald-50 dark:bg-emerald-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  The Debt Snowball Method
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>
                  The <strong>Debt Snowball</strong> approach focuses on the psychological benefits of quick wins by paying off your smallest debts first, regardless of interest rates.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/50 rounded-md">
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">How it works:</p>
                    <ol className="mt-2 space-y-2 text-sm text-emerald-700 dark:text-emerald-400">
                      <li><strong>1.</strong> List all debts from smallest to largest balance</li>
                      <li><strong>2.</strong> Make minimum payments on all debts</li>
                      <li><strong>3.</strong> Put any extra money toward the smallest debt</li>
                      <li><strong>4.</strong> Once the smallest is paid off, roll that payment to the next smallest</li>
                    </ol>
                  </div>
                  <div className="flex items-start gap-2 px-3 py-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Key Advantage</p>
                      <p className="text-xs text-muted-foreground">Creates motivation through quick wins and visible progress</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Percent className="h-5 w-5 text-blue-600" />
                  The Debt Avalanche Method
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>
                  The <strong>Debt Avalanche</strong> method is mathematically optimal, focusing on paying highest-interest debts first to minimize total interest paid.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-blue-100/50 dark:bg-blue-900/50 rounded-md">
                    <p className="font-medium text-blue-800 dark:text-blue-300">How it works:</p>
                    <ol className="mt-2 space-y-2 text-sm text-blue-700 dark:text-blue-400">
                      <li><strong>1.</strong> List all debts from highest to lowest interest rate</li>
                      <li><strong>2.</strong> Make minimum payments on all debts</li>
                      <li><strong>3.</strong> Put any extra money toward the highest-rate debt</li>
                      <li><strong>4.</strong> Once the highest-rate debt is paid, move to the next highest</li>
                    </ol>
                  </div>
                  <div className="flex items-start gap-2 px-3 py-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Key Advantage</p>
                      <p className="text-xs text-muted-foreground">Minimizes total interest paid and mathematically faster</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <h3 id="strategy-comparison-chart" className="font-bold text-xl mt-8 mb-4">Strategy Comparison: Real Numbers</h3>
        
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <p>
                    Let's compare these strategies with a realistic example. Consider someone with four debts:
                  </p>
                  
                  <div className="overflow-x-auto mt-4">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Debt</th>
                          <th className="px-4 py-2 text-left">Balance</th>
                          <th className="px-4 py-2 text-left">Interest Rate</th>
                          <th className="px-4 py-2 text-left">Min. Payment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="px-4 py-2">Credit Card A</td>
                          <td className="px-4 py-2">$3,500</td>
                          <td className="px-4 py-2">22.9%</td>
                          <td className="px-4 py-2">$87</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Store Card</td>
                          <td className="px-4 py-2">$1,200</td>
                          <td className="px-4 py-2">26.2%</td>
                          <td className="px-4 py-2">$40</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Credit Card B</td>
                          <td className="px-4 py-2">$5,800</td>
                          <td className="px-4 py-2">18.4%</td>
                          <td className="px-4 py-2">$130</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Personal Loan</td>
                          <td className="px-4 py-2">$7,500</td>
                          <td className="px-4 py-2">12.8%</td>
                          <td className="px-4 py-2">$175</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <p className="mt-4">
                    With an additional $200 per month available for debt payoff (beyond minimums), here's how the strategies compare:
                  </p>
                </div>
                
                <div className="md:w-[350px] flex-shrink-0">
                  <h4 className="text-center text-sm font-medium mb-3">Debt Payoff Strategy Comparison</h4>
                  <div className="h-[280px]">
                    <Bar
                      data={{
                        labels: ['Snowball', 'Avalanche'],
                        datasets: [
                          {
                            label: 'Months to Debt Freedom',
                            data: [43, 41],
                            backgroundColor: 'rgba(16, 185, 129, 0.7)',
                            borderWidth: 1,
                            borderRadius: 4,
                            yAxisID: 'y'
                          },
                          {
                            label: 'Total Interest Paid',
                            data: [4580, 4315],
                            backgroundColor: 'rgba(59, 130, 246, 0.7)',
                            borderWidth: 1,
                            borderRadius: 4,
                            yAxisID: 'y1'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                              display: true,
                              text: 'Months'
                            },
                            beginAtZero: true
                          },
                          y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                              drawOnChartArea: false
                            },
                            title: {
                              display: true,
                              text: 'Interest ($)'
                            },
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground mt-2">
                    Comparison with $200 extra payment each month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <h3 id="snowball-vs-avalanche" className="font-bold text-xl mt-8 mb-4">Snowball vs. Avalanche: Which Should You Choose?</h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-medium text-lg text-emerald-800 dark:text-emerald-300 mb-2">Choose Snowball If:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-emerald-800 dark:text-emerald-300">You struggle with motivation and need quick wins</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-emerald-800 dark:text-emerald-300">You have several small balances you could eliminate quickly</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-emerald-800 dark:text-emerald-300">Your interest rates don't vary dramatically between debts</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="text-emerald-800 dark:text-emerald-300">You value psychological wins over pure mathematical optimization</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-medium text-lg text-blue-800 dark:text-blue-300 mb-2">Choose Avalanche If:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-blue-800 dark:text-blue-300">You're mathematically-minded and want to minimize interest costs</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-blue-800 dark:text-blue-300">You have significant differences in interest rates between debts</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-blue-800 dark:text-blue-300">You're highly disciplined and don't need frequent rewards</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-blue-800 dark:text-blue-300">You have high-interest debt that's significantly impacting your finances</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Research Finding</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                According to a study in the Journal of Marketing Research, people pursuing the debt snowball method were more likely to eliminate their entire debt compared to those using mathematically optimal approaches. The psychological boost from small wins creates momentum that often outweighs the slight mathematical advantage of the avalanche method.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Power of Extra Payments */}
      <div className="mb-12" id="extra-payments">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
            <CardTitle>
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl">The Dramatic Impact of Extra Payments</span>
              </div>
            </CardTitle>
            <CardDescription>
              How even small additional payments can transform your debt journey
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 id="extra-payment-impact" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  The Acceleration Effect
                </h3>
                
                <p>
                  Additional payments toward your debt create a powerful acceleration effect, dramatically reducing both your payoff time and total interest paid. This happens because every extra dollar goes directly toward principal reduction.
                </p>
                <div className="mt-4 h-[220px]">
                  <Line 
                    data={{
                      labels: ['0', '6', '12', '18', '24', '30', '36', '42', '48'],
                      datasets: [
                        {
                          label: 'Minimum Payments',
                          data: [18000, 17302, 16558, 15765, 14918, 14015, 13053, 12028, 10937],
                          borderColor: 'rgba(239, 68, 68, 0.8)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          fill: true
                        },
                        {
                          label: '+$100/month',
                          data: [18000, 16802, 15458, 13959, 12294, 10451, 8417, 6177, 3716],
                          borderColor: 'rgba(139, 92, 246, 0.8)',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          fill: true
                        },
                        {
                          label: '+$200/month',
                          data: [18000, 16302, 14358, 12153, 9670, 6887, 3781, 321, 0],
                          borderColor: 'rgba(16, 185, 129, 0.8)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
                  $18,000 total debt at 17% average interest rate
                </p>
              </div>
              
              <div>
                <h3 id="interest-savings" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Interest Savings
                </h3>
                <p className="mb-4">
                  The true power of extra payments is revealed when you calculate the interest savings. Every additional dollar you put toward debt has a compounding effect, saving you significantly more than the dollar itself.
                </p>
                <div className="h-[220px]">
                  <Bar 
                    data={{
                      labels: ['Minimum Only', '+$50/month', '+$100/month', '+$200/month', '+$300/month'],
                      datasets: [{
                        label: 'Total Interest Paid',
                        data: [14215, 8940, 6210, 3680, 2580],
                        backgroundColor: [
                          'rgba(239, 68, 68, 0.7)',
                          'rgba(249, 115, 22, 0.7)',
                          'rgba(139, 92, 246, 0.7)',
                          'rgba(16, 185, 129, 0.7)',
                          'rgba(6, 182, 212, 0.7)'
                        ],
                        borderWidth: 1,
                        borderRadius: 4
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Interest Paid ($)'
                          },
                          ticks: { callback: value => '$' + value }
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-6 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Financial Impact:</strong> Adding just $100 extra per month to your debt payments in this example would save you <strong>$8,005</strong> in interest and help you become debt-free <strong>4.5 years sooner</strong>.
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 id="payment-strategies" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-6">Finding Money for Extra Payments</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-sm dark:bg-blue-900 dark:text-blue-300">1</span>
                    Expense Audit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      Conduct a detailed review of your monthly expenses to identify non-essential spending that could be redirected to debt payment.
                    </p>
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-md">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Common sources:</p>
                      <ul className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                        <li>• Subscription services ($15-50/month)</li>
                        <li>• Dining out reduction ($100-200/month)</li>
                        <li>• Entertainment trimming ($50-100/month)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-sm dark:bg-blue-900 dark:text-blue-300">2</span>
                    Income Boosters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      Look for opportunities to temporarily increase your income with the specific purpose of accelerating debt payoff.
                    </p>
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-md">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Potential options:</p>
                      <ul className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                        <li>• Side gig or freelance work</li>
                        <li>• Selling unused items</li>
                        <li>• Overtime or extra shifts</li>
                        <li>• Tax refund allocation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-sm dark:bg-blue-900 dark:text-blue-300">3</span>
                    Debt Cost Reduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      Explore options to lower the cost of your debt to free up money for larger principal payments.
                    </p>
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-md">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Strategies:</p>
                      <ul className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                        <li>• Balance transfer offers</li>
                        <li>• Debt consolidation loans</li>
                        <li>• Negotiating lower interest rates</li>
                        <li>• Refinancing high-interest debt</li>
                      </ul>
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
          <RefreshCw className="h-6 w-6 text-purple-600" />
          Advanced Debt Elimination Tactics
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-purple-600" />
                Debt Consolidation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  <strong>Debt consolidation</strong> involves combining multiple debts into a single loan with a lower interest rate, simplifying your payments and potentially saving significant interest.
                </p>
                
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="text-center text-sm font-medium mb-3">Consolidation Impact</h4>
                  <div className="h-[180px]">
                    <Bar 
                      data={{
                        labels: ['Multiple Debts (Avg 21%)', 'Consolidation Loan (9%)'],
                        datasets: [{
                          label: 'Monthly Payment',
                          data: [525, 400],
                          backgroundColor: [
                            'rgba(139, 92, 246, 0.7)',
                            'rgba(16, 185, 129, 0.7)',
                          ],
                          borderWidth: 1,
                          yAxisID: 'y'
                        },
                        {
                          label: 'Total Interest',
                          data: [9650, 3840],
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.7)',
                            'rgba(59, 130, 246, 0.7)',
                          ],
                          borderWidth: 1,
                          yAxisID: 'y1'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            position: 'left',
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Monthly Payment'
                            },
                            ticks: { callback: value => '$' + value }
                          },
                          y1: {
                            position: 'right',
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Total Interest'
                            },
                            ticks: { callback: value => '$' + value },
                            grid: {
                              drawOnChartArea: false
                            }
                          }
                        },
                        plugins: {
                          legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } }
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Example: $18,000 in combined debt over 60 months
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-300">Key Considerations</p>
                    <ul className="mt-2 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                      <li>• Your credit score determines qualification and rates</li>
                      <li>• Watch for origination fees (typically 1-8%)</li>
                      <li>• Avoid extending the repayment period unnecessarily</li>
                      <li>• Ensure you address the spending habits that created the debt</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                Debt Refinancing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                <strong>Debt refinancing</strong> involves replacing existing debt with a new loan that has more favorable terms, potentially lowering your interest rate, monthly payment, or both.
              </p>
              
              <div className="h-[200px]">
                <Line 
                  data={{
                    labels: ['Original', '0.5% Lower', '1% Lower', '2% Lower', '3% Lower'],
                    datasets: [
                      {
                        label: 'Interest Saved',
                        data: [0, 475, 950, 1890, 2820],
                        borderColor: 'rgba(16, 185, 129, 0.8)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        yAxisID: 'y'
                      },
                      {
                        label: 'Monthly Payment Reduction',
                        data: [0, 8, 16, 32, 48],
                        borderColor: 'rgba(59, 130, 246, 0.8)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        yAxisID: 'y1'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                          display: true,
                          text: 'Total Interest Saved ($)'
                        },
                        beginAtZero: true
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                          display: true,
                          text: 'Monthly Savings ($)'
                        },
                        beginAtZero: true,
                        grid: {
                          drawOnChartArea: false
                        }
                      }
                    },
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } }
                    }
                  }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Impact of refinancing a $20,000, 5-year loan at various interest rate reductions
              </p>
              
              <div className="mt-4 p-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-md">
                <p className="text-sm text-indigo-800 dark:text-indigo-300">
                  <strong>Best candidates for refinancing:</strong>
                </p>
                <ul className="mt-1 space-y-1 text-sm text-indigo-700 dark:text-indigo-400">
                  <li>• Your credit score has improved since taking the original loan</li>
                  <li>• Market interest rates have dropped significantly</li>
                  <li>• You have high-interest debt like credit cards or personal loans</li>
                  <li>• You can maintain or reduce the loan term while lowering the rate</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 id="debt-settlement" className="text-xl font-bold mb-4">When to Consider Debt Settlement</h3>
        
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Debt Settlement: A Last Resort Option</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                Debt settlement—negotiating with creditors to accept less than the full amount owed—should typically be considered only when you're facing severe financial hardship and have exhausted other options. While it can reduce your debt burden, it comes with significant drawbacks:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-400">
                <li>• Major negative impact on your credit score (often 100+ points)</li>
                <li>• Potential tax liability on forgiven debt amounts</li>
                <li>• Risk of being sued by creditors during the process</li>
                <li>• High fees if using debt settlement companies (15-25% of enrolled debt)</li>
              </ul>
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                Before pursuing settlement, consult with a nonprofit credit counseling agency to explore all other debt relief options.
              </p>
            </div>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Debt Freedom Journey: Practical Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 h-full w-px bg-border"></div>
              <ol className="space-y-4 ml-10">
                <li className="relative">
                  <span className="absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-2 ring-background dark:bg-emerald-900 dark:text-emerald-400">1</span>
                  <div className="space-y-1">
                    <h4 className="font-medium">Financial Assessment (Week 1)</h4>
                    <p className="text-sm text-muted-foreground">Complete debt inventory, calculate total debt, interest rates, and minimum payments</p>
                  </div>
                </li>
                <li className="relative">
                  <span className="absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-2 ring-background dark:bg-emerald-900 dark:text-emerald-400">2</span>
                  <div className="space-y-1">
                    <h4 className="font-medium">Strategy Selection (Week 2)</h4>
                    <p className="text-sm text-muted-foreground">Choose between snowball, avalanche, or hybrid approach based on your situation</p>
                  </div>
                </li>
                <li className="relative">
                  <span className="absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-2 ring-background dark:bg-emerald-900 dark:text-emerald-400">3</span>
                  <div className="space-y-1">
                    <h4 className="font-medium">Budget Optimization (Week 3-4)</h4>
                    <p className="text-sm text-muted-foreground">Find extra money for debt payment, establish automated payment schedule</p>
                  </div>
                </li>
                <li className="relative">
                  <span className="absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-2 ring-background dark:bg-emerald-900 dark:text-emerald-400">4</span>
                  <div className="space-y-1">
                    <h4 className="font-medium">First Victory (Month 3-6)</h4>
                    <p className="text-sm text-muted-foreground">Celebrate first debt eliminated (if using snowball) or significant principal reduction</p>
                  </div>
                </li>
                <li className="relative">
                  <span className="absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-2 ring-background dark:bg-emerald-900 dark:text-emerald-400">5</span>
                  <div className="space-y-1">
                    <h4 className="font-medium">Maintaining Momentum (Ongoing)</h4>
                    <p className="text-sm text-muted-foreground">Regular progress tracking, adjustments as needed, resisting new debt</p>
                  </div>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conclusion Section */}
      <div className="mb-6" id="conclusion">
        <Card className="overflow-hidden border-emerald-200 dark:border-emerald-900">
          <CardHeader className="bg-gradient-to-r from-emerald-100 to-blue-50 dark:from-emerald-900/40 dark:to-blue-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              Your Path to Financial Freedom
            </CardTitle>
            <CardDescription>
              Taking control of your debt is the first step toward true financial independence
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Debt payoff calculators</strong> are powerful tools that transform your financial journey by providing clarity, direction, and motivation. By understanding different debt reduction strategies and the profound impact of extra payments, you gain the knowledge to make informed decisions that can dramatically accelerate your path to financial freedom.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Key actions to implement today:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800">
                <h4 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">First Steps</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold dark:bg-emerald-900 dark:text-emerald-300">1</span>
                    <span className="text-emerald-800 dark:text-emerald-300">List all your debts with balances, rates, and minimum payments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold dark:bg-emerald-900 dark:text-emerald-300">2</span>
                    <span className="text-emerald-800 dark:text-emerald-300">Use our calculator to compare snowball vs. avalanche approaches</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold dark:bg-emerald-900 dark:text-emerald-300">3</span>
                    <span className="text-emerald-800 dark:text-emerald-300">Identify at least $50-100 extra you can put toward debt</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Ongoing Strategy</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                    <span className="text-blue-800 dark:text-blue-300">Establish automatic payments for all minimum amounts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                    <span className="text-blue-800 dark:text-blue-300">Track progress monthly to maintain motivation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                    <span className="text-blue-800 dark:text-blue-300">Celebrate milestones to reinforce positive behavior</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-medium text-lg text-emerald-800 dark:text-emerald-300">Ready to calculate your debt freedom date?</p>
                  <p className="mt-1 text-emerald-700 dark:text-emerald-400">
                    Use our <strong>Debt Payoff Calculator</strong> above to create your personalized plan! For more financial planning tools, explore our related calculators:
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
                        Consolidation Calculator
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

        {/* Related Calculators */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Related Calculators</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Credit Card Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate how long it will take to pay off credit card debt and the total interest you'll pay.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/credit-card">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Debt Consolidation Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    See if consolidating your debts into a single loan could save you money and time.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/debt-consolidation">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Debt-to-Income Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate your debt-to-income ratio to understand your financial health and borrowing capacity.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/debt-to-income">Try Calculator</Link>
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