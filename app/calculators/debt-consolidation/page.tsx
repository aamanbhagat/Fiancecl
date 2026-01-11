"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { SaveCalculationButton } from '@/components/save-calculation-button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  Plus,
  Minus,
  Trash2,
  CreditCard,
  GraduationCap,
  Car,
  ShoppingBag,
  Stethoscope,
  Sliders,
  BadgeDollarSign,
  Home,
  PiggyBank,
  CheckCircle,
  XCircle,
  ListOrdered,
  BadgeInfo,
  AlertTriangle,
  ArrowDownToLine,
  Wallet
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Line, Pie } from "react-chartjs-2";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Link from "next/link";
import type { ChartOptions } from "chart.js";
// This should already exist in your page.tsx
import DebtConsolidationSchema from './schema';

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
  monthlyPayment: number
  remainingTerm?: number
}

export default function DebtConsolidationCalculator() {
  // Existing Debts State
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: '1',
      name: 'Credit Card A',
      balance: 5000,
      interestRate: 19.99,
      monthlyPayment: 150
    },
    {
      id: '2',
      name: 'Personal Loan',
      balance: 10000,
      interestRate: 12.5,
      monthlyPayment: 300,
      remainingTerm: 36
    }
  ])

  // Consolidation Loan Details
  const [consolidationAmount, setConsolidationAmount] = useState<number>(0)
  const [consolidationRate, setConsolidationRate] = useState<number>(8.99)
  const [consolidationTerm, setConsolidationTerm] = useState<number>(60)
  const [originationFee, setOriginationFee] = useState<number>(3)
  const [includeOriginationFee, setIncludeOriginationFee] = useState<boolean>(true)

  // Results State
  const [currentMonthlyPayment, setCurrentMonthlyPayment] = useState<number>(0)
  const [consolidatedMonthlyPayment, setConsolidatedMonthlyPayment] = useState<number>(0)
  const [currentTotalInterest, setCurrentTotalInterest] = useState<number>(0)
  const [consolidatedTotalInterest, setConsolidatedTotalInterest] = useState<number>(0)
  const [monthlySavings, setMonthlySavings] = useState<number>(0)
  const [totalSavings, setTotalSavings] = useState<number>(0)
  const [breakEvenMonths, setBreakEvenMonths] = useState<number>(0)
  const [payoffComparison, setPayoffComparison] = useState<{
    current: { balance: number[]; interest: number[] }
    consolidated: { balance: number[]; interest: number[] }
  }>({
    current: { balance: [], interest: [] },
    consolidated: { balance: [], interest: [] }
  })

  // Add new debt
  const addDebt = () => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      name: `Debt ${debts.length + 1}`,
      balance: 0,
      interestRate: 0,
      monthlyPayment: 0
    }
    setDebts([...debts, newDebt])
  }

  // Remove debt
  const removeDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id))
  }

  // Update debt
  const updateDebt = (id: string, field: keyof Debt, value: number | string) => {
    setDebts(debts.map(debt => 
      debt.id === id ? { ...debt, [field]: value } : debt
    ))
  }

  // Calculate loan payments and comparisons
  useEffect(() => {
    // Calculate total debt amount
    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0)
    setConsolidationAmount(totalDebt)

    // Calculate current total monthly payment
    const totalMonthlyPayment = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0)
    setCurrentMonthlyPayment(totalMonthlyPayment)

    // Calculate consolidated monthly payment
    const monthlyRate = consolidationRate / 100 / 12
    const numberOfPayments = consolidationTerm
    const loanAmount = includeOriginationFee 
      ? totalDebt * (1 + originationFee / 100)
      : totalDebt

    const consolidatedPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    setConsolidatedMonthlyPayment(consolidatedPayment)
    setMonthlySavings(totalMonthlyPayment - consolidatedPayment)

    // Calculate total interest for current debts
    let currentInterest = 0
    debts.forEach(debt => {
      const monthlyRate = debt.interestRate / 100 / 12
      const remainingTerm = debt.remainingTerm || 
        Math.ceil(Math.log(debt.monthlyPayment / (debt.monthlyPayment - debt.balance * monthlyRate)) / Math.log(1 + monthlyRate))
      currentInterest += (debt.monthlyPayment * remainingTerm) - debt.balance
    })
    setCurrentTotalInterest(currentInterest)

    // Calculate total interest for consolidated loan
    const consolidatedInterest = (consolidatedPayment * numberOfPayments) - loanAmount
    setConsolidatedTotalInterest(consolidatedInterest)

    // Calculate total savings
    const totalSavingsAmount = currentInterest - consolidatedInterest
    setTotalSavings(totalSavingsAmount)

    // Calculate break-even point
    if (monthlySavings > 0) {
      const breakEven = Math.ceil((includeOriginationFee ? (totalDebt * originationFee / 100) : 0) / monthlySavings)
      setBreakEvenMonths(breakEven)
    }

    // Generate payoff comparison data
    const months = consolidationTerm
    const currentPayoff = { balance: [] as number[], interest: [] as number[] }
    const consolidatedPayoff = { balance: [] as number[], interest: [] as number[] }

    let consolidatedBalance = loanAmount
    let consolidatedInterestPaid = 0

    for (let i = 0; i <= months; i++) {
      // Consolidated loan payoff
      if (i > 0) {
        const interestPayment = consolidatedBalance * monthlyRate
        consolidatedInterestPaid += interestPayment
        consolidatedBalance = Math.max(0, consolidatedBalance - (consolidatedPayment - interestPayment))
      }
      consolidatedPayoff.balance.push(consolidatedBalance)
      consolidatedPayoff.interest.push(consolidatedInterestPaid)

      // Current debts payoff
      let currentBalance = 0
      let currentInterestPaid = 0
      debts.forEach(debt => {
        const debtMonthlyRate = debt.interestRate / 100 / 12
        let remainingBalance = debt.balance
        let interestPaid = 0
        
        for (let j = 0; j < i; j++) {
          const interestPayment = remainingBalance * debtMonthlyRate
          interestPaid += interestPayment
          remainingBalance = Math.max(0, remainingBalance - (debt.monthlyPayment - interestPayment))
        }
        currentBalance += remainingBalance
        currentInterestPaid += interestPaid
      })
      currentPayoff.balance.push(currentBalance)
      currentPayoff.interest.push(currentInterestPaid)
    }

    setPayoffComparison({
      current: currentPayoff,
      consolidated: consolidatedPayoff
    })

  }, [
    debts,
    consolidationRate,
    consolidationTerm,
    originationFee,
    includeOriginationFee,
    monthlySavings
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

  // Monthly payment comparison chart
  const paymentComparisonData = {
    labels: ['Current', 'Consolidated'],
    datasets: [
      {
        label: 'Monthly Payment',
        data: [currentMonthlyPayment, consolidatedMonthlyPayment],
        backgroundColor: chartColors.primary.slice(0, 2),
        borderColor: chartColors.secondary.slice(0, 2).map(color => color.replace('0.2', '1')),
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
        display: false
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => '$' + value.toFixed(0)
      }
    }
  }

  // Balance over time chart
  const balanceComparisonData = {
    labels: Array.from({ length: consolidationTerm + 1 }, (_, i) => i % 12 === 0 ? `Year ${i/12}` : ''),
    datasets: [
      {
        label: 'Current Debts Balance',
        data: payoffComparison.current.balance,
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      },
      {
        label: 'Consolidated Loan Balance',
        data: payoffComparison.consolidated.balance,
        borderColor: chartColors.primary[1],
        backgroundColor: chartColors.secondary[1],
        tension: 0.4
      }
    ]
  }

  const balanceComparisonOptions: ChartOptions<'line'> = {
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

  // Interest comparison chart
  const interestComparisonData = {
    labels: ['Current', 'Consolidated'],
    datasets: [
      {
        label: 'Total Interest',
        data: [currentTotalInterest, consolidatedTotalInterest],
        backgroundColor: chartColors.primary.slice(0, 2),
        borderColor: chartColors.secondary.slice(0, 2).map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const interestComparisonOptions: ChartOptions<'bar'> = {
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
        display: false
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => '$' + value.toFixed(0)
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
    pdf.save('debt-consolidation-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <DebtConsolidationSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Debt Consolidation <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Compare your current debts with a consolidation loan to see if you can save money and simplify your payments.
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
                    <CardTitle>Enter Your Debt Details</CardTitle>
                    <CardDescription>
                      List your current debts and compare them with a potential consolidation loan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Current Debts */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Current Debts</h3>
                        <Button 
                          onClick={addDebt}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Debt
                        </Button>
                      </div>
                      
                      {debts.map((debt, index) => (
                        <Card key={debt.id} className="relative">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <Input
                                value={debt.name}
                                onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                                className="max-w-[200px] text-lg font-semibold"
                                placeholder="Debt Name"
                              />
                              {debts.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeDebt(debt.id)}
                                  className="h-8 w-8 text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`balance-${debt.id}`}>Outstanding Balance</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id={`balance-${debt.id}`}
                                  type="number"
                                  className="pl-9"
                                  value={debt.balance}
                                  onChange={(e) => updateDebt(debt.id, 'balance', Number(e.target.value))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`rate-${debt.id}`}>Interest Rate (APR)</Label>
                                <span className="text-sm text-muted-foreground">{debt.interestRate}%</span>
                              </div>
                              <Slider
                                id={`rate-${debt.id}`}
                                min={0}
                                max={35}
                                step={0.1}
                                value={[debt.interestRate]}
                                onValueChange={(value) => updateDebt(debt.id, 'interestRate', value[0])}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`payment-${debt.id}`}>Monthly Payment</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id={`payment-${debt.id}`}
                                  type="number"
                                  className="pl-9"
                                  value={debt.monthlyPayment}
                                  onChange={(e) => updateDebt(debt.id, 'monthlyPayment', Number(e.target.value))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`term-${debt.id}`}>Remaining Term (Months)</Label>
                              <Input
                                id={`term-${debt.id}`}
                                type="number"
                                value={debt.remainingTerm || ''}
                                onChange={(e) => updateDebt(debt.id, 'remainingTerm', Number(e.target.value))}
                                placeholder="Optional"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Consolidation Loan Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Consolidation Loan Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="consolidation-rate">Interest Rate</Label>
                            <span className="text-sm text-muted-foreground">{consolidationRate}%</span>
                          </div>
                          <Slider
                            id="consolidation-rate"
                            min={3}
                            max={20}
                            step={0.1}
                            value={[consolidationRate]}
                            onValueChange={(value) => setConsolidationRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="consolidation-term">Loan Term</Label>
                          <Select 
                            value={String(consolidationTerm)} 
                            onValueChange={(value) => setConsolidationTerm(Number(value))}
                          >
                            <SelectTrigger id="consolidation-term">
                              <SelectValue placeholder="Select loan term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="24">24 Months</SelectItem>
                              <SelectItem value="36">36 Months</SelectItem>
                              <SelectItem value="48">48 Months</SelectItem>
                              <SelectItem value="60">60 Months</SelectItem>
                              <SelectItem value="72">72 Months</SelectItem>
                              <SelectItem value="84">84 Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="origination-fee">Include Origination Fee</Label>
                            <Switch
                              id="origination-fee"
                              checked={includeOriginationFee}
                              onCheckedChange={setIncludeOriginationFee}
                            />
                          </div>
                          {includeOriginationFee && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="fee-percent">Fee Percentage</Label>
                                <span className="text-sm text-muted-foreground">{originationFee}%</span>
                              </div>
                              <Slider
                                id="fee-percent"
                                min={0}
                                max={5}
                                step={0.1}
                                value={[originationFee]}
                                onValueChange={(value) => setOriginationFee(value[0])}
                              />
                            </div>
                          )}
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
                        <p className="text-sm text-muted-foreground">Current Monthly Payment</p>
                        <p className="text-2xl font-bold">{formatCurrency(currentMonthlyPayment)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Consolidated Payment</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(consolidatedMonthlyPayment)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="comparison" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="comparison">Payments</TabsTrigger>
                        <TabsTrigger value="interest">Interest</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      </TabsList>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={paymentComparisonData} options={paymentComparisonOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Monthly Payment Comparison</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Current Total Payment</span>
                              <span className="font-medium">{formatCurrency(currentMonthlyPayment)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Consolidated Payment</span>
                              <span className="font-medium">{formatCurrency(consolidatedMonthlyPayment)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Monthly Savings</span>
                              <span>{formatCurrency(monthlySavings)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="interest" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={interestComparisonData} options={interestComparisonOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Interest Cost Comparison</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Current Total Interest</span>
                              <span className="font-medium">{formatCurrency(currentTotalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Consolidated Interest</span>
                              <span className="font-medium">{formatCurrency(consolidatedTotalInterest)}</span>
                            </div>
                            {includeOriginationFee && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Origination Fee</span>
                                <span className="font-medium">{formatCurrency(consolidationAmount * (originationFee / 100))}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Savings</span>
                              <span>{formatCurrency(totalSavings)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="timeline" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={balanceComparisonData} options={balanceComparisonOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Payoff Timeline</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Consolidation Term</span>
                              <span className="font-medium">{consolidationTerm} months</span>
                            </div>
                            {breakEvenMonths > 0 && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Break-even Point</span>
                                <span className="font-medium">{breakEvenMonths} months</span>
                              </div>
                            )}
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
                            <p className="font-medium">Consolidation Analysis</p>
                
                            {totalSavings > 0 ? (
                              <p className="text-sm text-muted-foreground">
                                Consolidating your debts could save you {formatCurrency(Math.abs(monthlySavings))} per month 
                                and {formatCurrency(Math.abs(totalSavings))} in total interest{breakEvenMonths > 0 ? 
                                `, breaking even after ${breakEvenMonths} months` : ''}.
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Based on the current terms, consolidation would increase your total costs. 
                                Consider negotiating a lower interest rate or exploring other debt payoff strategies.
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Financial Resource</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">The Ultimate Guide to Debt Consolidation</h2>
        <p className="mt-3 text-muted-foreground text-lg">Learn how to simplify your debts and potentially save money through consolidation</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Debt Consolidation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-consolidation" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is Debt Consolidation?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                <strong>Debt consolidation</strong> is the process of combining multiple debts into a single, new loan or credit line. This strategy simplifies your finances by replacing several monthly payments with just one, potentially at a lower interest rate and with more manageable terms.
              </p>
              <p className="mt-2">
                Common types of debt that people consolidate include:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>Credit card balances</span>
                </li>
                <li className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Student loans</span>
                </li>
                <li className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Auto loans</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Store credit accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Medical debt</span>
                </li>
              </ul>
              <p>
                Debt consolidation isn't a one-size-fits-all solution, but when used appropriately, it can be a powerful tool for regaining control of your financial situation and potentially saving money on interest payments.
              </p>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                  <CardTitle className="text-sm font-medium text-center">Interest Rate Comparison</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Bar 
                      data={{
                        labels: ['Credit Cards', 'Personal Loan', 'Home Equity', 'Balance Transfer'],
                        datasets: [
                          {
                            label: 'Average Interest Rate',
                            data: [19.2, 11.5, 7.4, 3.5],
                            backgroundColor: [
                              'rgba(239, 68, 68, 0.8)',
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(79, 70, 229, 0.8)'
                            ],
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: { callback: value => value + '%' }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <h4 id="why-important" className="font-semibold text-xl mt-6">Why Consider Debt Consolidation?</h4>
          <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">High Interest Burden</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Americans pay an average of $1,380 per year in credit card interest alone</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Payment Complexity</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Managing multiple payment dates increases the risk of missed payments and late fees</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Mental Burden</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Financial stress from multiple debts can affect your mental health and well-being</p>
                </div>
              </div>
            </div>
          </div>
          
          <p>
            Debt consolidation can provide not just financial benefits but also psychological relief. By simplifying your debt obligations and creating a clear path to becoming debt-free, you can reduce financial anxiety and focus on building a more secure financial future.
          </p>
        </CardContent>
      </Card>

      {/* Consolidation Options */}
      <div className="mb-12" id="consolidation-options">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Exploring Your Consolidation Options</h2>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="methods" className="font-bold text-xl mb-4">Common Debt Consolidation Methods</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Balance Transfer Credit Cards
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm mb-3">Transfer high-interest credit card balances to a new card with a low or 0% introductory APR period.</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Typical intro period:</span>
                    <span className="font-medium">12-21 months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance transfer fee:</span>
                    <span className="font-medium">3-5% of balance</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best for:</span>
                    <span className="font-medium">Credit card debt</span>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <span className="font-medium text-blue-700 dark:text-blue-400">Pro tip:</span>
                  <p className="text-muted-foreground mt-1">Create a repayment plan to eliminate the balance before the promotional period ends.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BadgeDollarSign className="h-5 w-5 text-blue-600" />
                  Personal Consolidation Loans
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm mb-3">Take out a new fixed-rate loan to pay off multiple debts, leaving you with one monthly payment.</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Typical APR range:</span>
                    <span className="font-medium">6-36%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Loan terms:</span>
                    <span className="font-medium">2-7 years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best for:</span>
                    <span className="font-medium">Multiple debt types</span>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <span className="font-medium text-blue-700 dark:text-blue-400">Pro tip:</span>
                  <p className="text-muted-foreground mt-1">Compare offers from multiple lenders to find the lowest APR for your credit profile.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  Home Equity Options
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm mb-3">Use your home's equity to secure a loan or line of credit with a lower interest rate.</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Typical APR range:</span>
                    <span className="font-medium">4-10%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Loan terms:</span>
                    <span className="font-medium">5-30 years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best for:</span>
                    <span className="font-medium">Large debt amounts</span>
                  </div>
                </div>
                <div className="mt-4 text-sm border-l-2 border-yellow-400 pl-3">
                  <span className="font-medium text-yellow-700 dark:text-yellow-400">Warning:</span>
                  <p className="text-yellow-600 dark:text-yellow-500 mt-1">Your home becomes collateral, risking foreclosure if you default.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-blue-600" />
                  401(k) Loans
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm mb-3">Borrow against your retirement savings to consolidate debt.</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interest rates:</span>
                    <span className="font-medium">Prime + 1-2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Typical terms:</span>
                    <span className="font-medium">5 years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best for:</span>
                    <span className="font-medium">Last resort options</span>
                  </div>
                </div>
                <div className="mt-4 text-sm border-l-2 border-red-400 pl-3">
                  <span className="font-medium text-red-700 dark:text-red-400">Caution:</span>
                  <p className="text-red-600 dark:text-red-500 mt-1">Reduces retirement savings and growth potential; penalties may apply if you leave your job.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <h3 id="comparison" className="text-xl font-bold mt-8 mb-4">Comparing Consolidation Methods</h3>
        
        <div className="mb-6 overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Method</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Pros</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Cons</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Ideal For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Balance Transfer</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>0% intro APR</li>
                    <li>Quick application</li>
                    <li>No collateral</li>
                  </ul>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Transfer fees</li>
                    <li>High post-intro rates</li>
                    <li>Credit score impact</li>
                  </ul>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Credit card debt that can be paid off within 12-18 months</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Personal Loan</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Fixed rates & payments</li>
                    <li>Clear payoff timeline</li>
                    <li>Potential lower rates than cards</li>
                  </ul>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Origination fees</li>
                    <li>Rates depend on credit</li>
                    <li>Potentially long commitment</li>
                  </ul>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Multiple types of debt with need for structured repayment</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">Home Equity</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Lowest rates available</li>
                    <li>Tax-deductible interest</li>
                    <li>Longer repayment terms</li>
                  </ul>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Home is collateral</li>
                    <li>Closing costs & fees</li>
                    <li>Lengthy application process</li>
                  </ul>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Homeowners with significant equity and large debt amounts</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">401(k) Loan</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>No credit check</li>
                    <li>Interest paid to yourself</li>
                    <li>No impact on credit score</li>
                  </ul>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Reduces retirement savings</li>
                    <li>Potential penalties if you leave job</li>
                    <li>Missed growth opportunities</li>
                  </ul>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Those with limited options who have stable employment</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Pro Tip:</strong> The best consolidation option varies based on your specific debt profile, credit score, and financial situation. Use our calculator to compare potential savings for different consolidation methods.
          </p>
        </div>
      </div>

      {/* When Consolidation Makes Sense */}
      <div className="mb-12" id="when-to-consolidate">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
            <CardTitle>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl">When Debt Consolidation Makes Sense</span>
              </div>
            </CardTitle>
            <CardDescription>
              Identifying whether consolidation is the right strategy for your financial situation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">Signs Consolidation Is Right For You</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium">You're paying high interest rates</p>
                      <p className="text-sm text-muted-foreground mt-1">Your current debts have APRs above 15%, and you qualify for a lower rate.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium">You have good credit (680+)</p>
                      <p className="text-sm text-muted-foreground mt-1">Better credit scores qualify for the most competitive consolidation rates.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium">You're juggling multiple payments</p>
                      <p className="text-sm text-muted-foreground mt-1">Managing 4+ debt payments monthly is becoming stressful or error-prone.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium">You have a stable income</p>
                      <p className="text-sm text-muted-foreground mt-1">You can confidently commit to the new payment schedule.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium">You have a plan to avoid new debt</p>
                      <p className="text-sm text-muted-foreground mt-1">You're committed to changing spending habits that led to debt accumulation.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4">Warning Signs to Reconsider</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium">You're consistently overspending</p>
                      <p className="text-sm text-muted-foreground mt-1">Consolidation won't help if you continue accumulating new debt.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Your debt-to-income ratio exceeds 50%</p>
                      <p className="text-sm text-muted-foreground mt-1">You may need more intensive debt relief options like credit counseling.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium">The math doesn't work in your favor</p>
                      <p className="text-sm text-muted-foreground mt-1">When fees and/or interest rates make consolidation more expensive overall.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium">You're close to paying off your debts</p>
                      <p className="text-sm text-muted-foreground mt-1">If you're within a year of debt freedom, consolidation fees may outweigh benefits.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium">You have unstable income</p>
                      <p className="text-sm text-muted-foreground mt-1">Fluctuating income makes committing to fixed consolidation payments risky.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4">The Break-Even Analysis</h3>
              <p className="mb-4">
                Before consolidating, calculate your break-even point—the time required for interest savings to exceed any fees associated with debt consolidation.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Break-Even Formula</h4>
                <div className="p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-800">
                  <p className="font-mono text-sm">Break-Even (months) = Consolidation Fees ÷ Monthly Interest Savings</p>
                </div>
                <div className="mt-4">
                  <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-1">Example:</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Balance transfer fee: $300 (3% of $10,000)</li>
                    <li>• Current monthly interest: $175</li>
                    <li>• New monthly interest: $50</li>
                    <li>• Monthly savings: $125</li>
                    <li>• Break-even: $300 ÷ $125 = 2.4 months</li>
                  </ul>
                  <p className="text-sm mt-2">In this example, you'll recover the consolidation costs in less than 3 months, making it worthwhile if you plan to take longer than that to pay off the debt.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Steps to Successful Consolidation */}
      <div className="mb-12" id="steps">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ListOrdered className="h-6 w-6 text-primary" />
          Steps to Successful Debt Consolidation
        </h2>
        
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 py-4">
              <CardTitle className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-300">1</div>
                Assess Your Current Debt Situation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-3">Create a complete inventory of all your debts, including:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Outstanding balances</li>
                    <li>Interest rates</li>
                    <li>Monthly payments</li>
                    <li>Repayment terms</li>
                    <li>Early payoff penalties (if any)</li>
                  </ul>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      <strong>Tip:</strong> Order a free credit report from annualcreditreport.com to ensure you don't overlook any accounts.
                    </p>
                  </div>
                </div>
                <div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3">
                      <h5 className="font-medium">Sample Debt Inventory</h5>
                    </div>
                    <div className="p-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Debt</th>
                            <th className="text-right py-2">Balance</th>
                            <th className="text-right py-2">APR</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">Credit Card A</td>
                            <td className="text-right">$4,500</td>
                            <td className="text-right">19.99%</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Credit Card B</td>
                            <td className="text-right">$2,800</td>
                            <td className="text-right">21.5%</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Personal Loan</td>
                            <td className="text-right">$3,200</td>
                            <td className="text-right">12.9%</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-medium">Total</td>
                            <td className="text-right font-medium">$10,500</td>
                            <td className="text-right font-medium">18.4%*</td>
                          </tr>
                        </tbody>
                      </table>
                      <p className="text-xs mt-2">*Weighted average interest rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 py-4">
              <CardTitle className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-300">2</div>
                Check Your Credit Score & Report
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-3">Your credit score heavily influences the consolidation options available to you and the interest rates you'll qualify for.</p>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Excellent</h4>
                      <span className="font-bold text-green-600">740+</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Best rates on all products; multiple options</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Good</h4>
                      <span className="font-bold text-green-700">670-739</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Competitive rates; most products available</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Fair</h4>
                      <span className="font-bold text-yellow-600">580-669</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Limited options; higher rates likely</p>
                  </CardContent>
                </Card>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Before Applying:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Review your credit report for errors</li>
                  <li>Dispute any inaccuracies</li>
                  <li>Hold off on new credit applications</li>
                  <li>Pay down small balances if possible</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 py-4">
              <CardTitle className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-300">3</div>
                Research & Compare Consolidation Options
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-4">Based on your debt profile and credit score, compare available consolidation options.</p>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">What to Compare:</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Interest rates (APR)</li>
                    <li>Loan terms (months/years)</li>
                    <li>Monthly payments</li>
                    <li>Origination or balance transfer fees</li>
                  </ul>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Early payoff penalties</li>
                    <li>Required collateral (if any)</li>
                    <li>Hidden fees or charges</li>
                    <li>Lender reputation and reviews</li>
                  </ul>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Use Our Calculator:</h4>
                <p className="text-sm mb-2">Our debt consolidation calculator makes it easy to compare different scenarios by showing:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Total interest saved</li>
                  <li>New monthly payment</li>
                  <li>Payoff timeline comparison</li>
                  <li>Break-even analysis</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 py-4">
              <CardTitle className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-300">4</div>
                Apply for Your Chosen Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-3">Once you've selected the best option, prepare for the application process:</p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Gather required documentation (pay stubs, tax returns, etc.)</li>
                    <li>Complete application carefully to avoid delays</li>
                    <li>Be prepared for a hard credit inquiry</li>
                    <li>Wait for approval and loan terms</li>
                    <li>Review final terms carefully before accepting</li>
                  </ul>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      <strong>Important:</strong> Don't close your original accounts immediately after consolidating. This could negatively impact your credit score by reducing your available credit.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Application Timeline Expectations:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BadgeInfo className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Balance Transfer Cards:</span>
                      <span className="text-sm">1-7 days approval</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeInfo className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Personal Loans:</span>
                      <span className="text-sm">1-7 days approval, funding in 1-5 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeInfo className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Home Equity Options:</span>
                      <span className="text-sm">2-6 weeks process</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeInfo className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">401(k) Loans:</span>
                      <span className="text-sm">1-2 weeks processing</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 py-4">
              <CardTitle className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-300">5</div>
                Execute Your Payoff Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-4">Once approved, follow these steps to ensure a successful debt consolidation:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">For Balance Transfers:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Confirm transfer limits and eligible accounts</li>
                      <li>Initiate transfers as soon as possible</li>
                      <li>Track each transfer to completion</li>
                      <li>Create a plan to pay off before promotional period ends</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">For Consolidation Loans:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Verify loan proceeds are disbursed correctly</li>
                      <li>Confirm all intended debts are paid in full</li>
                      <li>Set up automatic payments for new loan</li>
                      <li>Request payoff letters from original creditors</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Create a Repayment Plan:</h4>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <ul className="list-disc pl-6 space-y-2 text-sm">
                      <li>Set up automatic payments to avoid late fees</li>
                      <li>Consider making extra payments when possible</li>
                      <li>Create calendar reminders for promotional rate expirations</li>
                      <li>Track your progress with a debt payoff app or spreadsheet</li>
                      <li>Celebrate milestones to stay motivated</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      <strong>Success Strategy:</strong> Consider setting up bi-weekly payments instead of monthly to make 26 half-payments per year (equivalent to 13 full payments), helping you pay off debt faster.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Common Mistakes Section */}
      <div className="mb-12" id="common-mistakes">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Common Debt Consolidation Mistakes to Avoid
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader className="bg-amber-50 dark:bg-amber-900/30">
              <CardTitle className="text-lg">Not Addressing the Root Cause</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-3">Consolidation only restructures debt—it doesn't solve the spending habits that created it.</p>
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium">Common Mistake:</p>
                  <p className="text-sm text-muted-foreground">Consolidating debt but continuing to use credit cards for non-essential purchases.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">Better Approach:</p>
                  <p className="text-sm text-muted-foreground">Create and stick to a budget, identify spending triggers, and build an emergency fund to avoid future debt.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader className="bg-amber-50 dark:bg-amber-900/30">
              <CardTitle className="text-lg">Ignoring the Fine Print</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-3">Overlooking fees, rate changes, or terms can negate the benefits of consolidation.</p>
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium">Common Mistake:</p>
                  <p className="text-sm text-muted-foreground">Not accounting for balance transfer fees or not planning for the end of promotional periods.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">Better Approach:</p>
                  <p className="text-sm text-muted-foreground">Read all terms carefully, calculate the total cost including fees, and set calendar reminders for rate changes.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader className="bg-amber-50 dark:bg-amber-900/30">
              <CardTitle className="text-lg">Closing Original Accounts</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-3">Closing old credit accounts can harm your credit score by reducing your credit history length and available credit.</p>
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium">Common Mistake:</p>
                  <p className="text-sm text-muted-foreground">Immediately closing credit cards after transferring or paying off balances.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">Better Approach:</p>
                  <p className="text-sm text-muted-foreground">Keep accounts open with zero balances, remove cards from your wallet, and use sparingly to maintain activity.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader className="bg-amber-50 dark:bg-amber-900/30">
              <CardTitle className="text-lg">Extending Repayment Too Long</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-3">Lower monthly payments over a longer term often mean paying more in total interest.</p>
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium">Common Mistake:</p>
                  <p className="text-sm text-muted-foreground">Choosing the longest loan term to minimize monthly payments without considering total cost.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">Better Approach:</p>
                  <p className="text-sm text-muted-foreground">Choose the shortest term you can reasonably afford and make extra payments when possible.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conclusion Section */}
      <div className="mb-6" id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Taking Control of Your Debt
            </CardTitle>
            <CardDescription>
              Your path to financial freedom through smart debt management
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Debt consolidation</strong> can be a powerful tool in your financial journey, but it's most effective when part of a comprehensive approach to debt management. By understanding your options, carefully comparing terms, and addressing the underlying causes of debt accumulation, you can use consolidation as a stepping stone toward financial freedom.
            </p>
            
            <p className="mt-4" id="next-steps">
              Key takeaways to remember on your debt consolidation journey:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Financial Strategy</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                    <span className="text-blue-800 dark:text-blue-300">Consolidation is a tool, not a solution to overspending</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                    <span className="text-blue-800 dark:text-blue-300">Focus on total interest saved, not just monthly payments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                    <span className="text-blue-800 dark:text-blue-300">Create a realistic budget alongside consolidation</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">After Consolidation</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                    <span className="text-green-800 dark:text-green-300">Build an emergency fund to avoid future debt</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                    <span className="text-green-800 dark:text-green-300">Track your progress and celebrate milestones</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                    <span className="text-green-800 dark:text-green-300">Continue financial education for long-term success</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to take the next step?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Debt Consolidation Calculator</strong> above to analyze your options and create a personalized plan. For more financial tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/debt-payoff">
                        <ArrowDownToLine className="h-4 w-4 mr-1" />
                        Debt Payoff Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/credit-score">
                        <LineChart className="h-4 w-4 mr-1" />
                        Credit Score Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/budget">
                        <Wallet className="h-4 w-4 mr-1" />
                        Budget Planning
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
                  <CardTitle className="text-lg">Debt Payoff Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compare debt snowball and avalanche methods to eliminate debt faster.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/debt-payoff">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Credit Card Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate how long it will take to pay off credit card debt with different payment strategies.
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
                  <CardTitle className="text-lg">Personal Loan Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate monthly payments and total interest for personal loans.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/personal-loan">Try Calculator</Link>
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