"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { SaveCalculationButton } from '@/components/save-calculation-button'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator"; // ✅ Added this!

import { format } from "date-fns";
import { cn } from "@/lib/utils";

import {
  Calendar as CalendarIcon,
  Calculator,
  Download,
  Share2,
  Info,
  DollarSign,
  Percent,
  Clock,
  CalendarDays,
  PlusCircle,
  ArrowRight,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCcw,
  TrendingDown,
  RefreshCw,
  Home,
  Check,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import { Line, Bar, Pie } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Corrected import
import Link from "next/link";
import MortgagePayoffSchema from './schema';


// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface PaymentSchedule {
  date: Date
  payment: number
  principal: number
  interest: number
  extraPayment: number
  remainingBalance: number
  totalInterest: number
}

interface MortgageState {
  loanAmount: number
  interestRate: number
  loanTerm: number
  startDate: Date
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly'
  extraPayment: number
  oneTimePayment: number
  oneTimePaymentDate: Date | null
  roundUpPayments: boolean
  roundUpTo: number
}

export default function MortgagePayoffCalculator() {
  const [mortgageState, setMortgageState] = useState<MortgageState>({
    loanAmount: 300000,
    interestRate: 5.5,
    loanTerm: 30,
    startDate: new Date(),
    paymentFrequency: 'monthly',
    extraPayment: 0,
    oneTimePayment: 0,
    oneTimePaymentDate: null,
    roundUpPayments: false,
    roundUpTo: 100
  })

  const [schedule, setSchedule] = useState<PaymentSchedule[]>([])
  const [baselineSchedule, setBaselineSchedule] = useState<PaymentSchedule[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  // Calculate monthly payment using the standard mortgage payment formula
  const calculateMonthlyPayment = (principal: number, annualRate: number, years: number) => {
    const monthlyRate = annualRate / 100 / 12
    const numberOfPayments = years * 12
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  }

  // Calculate amortization schedule
  const calculateAmortizationSchedule = () => {
    setIsCalculating(true)
    
    const monthlyPayment = calculateMonthlyPayment(
      mortgageState.loanAmount,
      mortgageState.interestRate,
      mortgageState.loanTerm
    )

    let currentBalance = mortgageState.loanAmount
    let totalInterest = 0
    const schedule: PaymentSchedule[] = []
    const monthlyRate = mortgageState.interestRate / 100 / 12
    let currentDate = new Date(mortgageState.startDate)
    
    // Calculate payment frequency adjustments
    const paymentMultiplier = mortgageState.paymentFrequency === 'bi-weekly' ? 26/12 : 
                             mortgageState.paymentFrequency === 'weekly' ? 52/12 : 1
    const adjustedPayment = monthlyPayment / paymentMultiplier

    while (currentBalance > 0) {
      const interestPayment = currentBalance * monthlyRate
      let principalPayment = adjustedPayment - interestPayment
      let extraPayment = mortgageState.extraPayment

      // Add one-time payment if date matches
      if (mortgageState.oneTimePaymentDate && 
          currentDate.getMonth() === mortgageState.oneTimePaymentDate.getMonth() &&
          currentDate.getFullYear() === mortgageState.oneTimePaymentDate.getFullYear()) {
        extraPayment += mortgageState.oneTimePayment
      }

      // Round up payments if enabled
      if (mortgageState.roundUpPayments) {
        const roundedPayment = Math.ceil(adjustedPayment / mortgageState.roundUpTo) * mortgageState.roundUpTo
        extraPayment += roundedPayment - adjustedPayment
      }

      // Adjust final payment to not overpay
      if (currentBalance < (principalPayment + extraPayment)) {
        principalPayment = currentBalance
        extraPayment = 0
      }

      currentBalance = currentBalance - principalPayment - extraPayment
      totalInterest += interestPayment

      schedule.push({
        date: new Date(currentDate),
        payment: adjustedPayment,
        principal: principalPayment,
        interest: interestPayment,
        extraPayment: extraPayment,
        remainingBalance: currentBalance,
        totalInterest: totalInterest
      })

      // Increment date based on payment frequency
      if (mortgageState.paymentFrequency === 'bi-weekly') {
        currentDate.setDate(currentDate.getDate() + 14)
      } else if (mortgageState.paymentFrequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7)
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    }

    setSchedule(schedule)
    setIsCalculating(false)
  }

  // Calculate baseline schedule for comparison
  const calculateBaselineSchedule = () => {
    const monthlyPayment = calculateMonthlyPayment(
      mortgageState.loanAmount,
      mortgageState.interestRate,
      mortgageState.loanTerm
    )

    let currentBalance = mortgageState.loanAmount
    let totalInterest = 0
    const schedule: PaymentSchedule[] = []
    const monthlyRate = mortgageState.interestRate / 100 / 12
    let currentDate = new Date(mortgageState.startDate)

    while (currentBalance > 0) {
      const interestPayment = currentBalance * monthlyRate
      let principalPayment = monthlyPayment - interestPayment

      if (currentBalance < principalPayment) {
        principalPayment = currentBalance
      }

      currentBalance = currentBalance - principalPayment
      totalInterest += interestPayment

      schedule.push({
        date: new Date(currentDate),
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        extraPayment: 0,
        remainingBalance: currentBalance,
        totalInterest: totalInterest
      })

      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    setBaselineSchedule(schedule)
  }

  useEffect(() => {
    calculateAmortizationSchedule()
    calculateBaselineSchedule()
  }, [mortgageState])

  // Chart data for balance comparison
  const balanceComparisonData = {
    labels: schedule.filter((_, index) => index % 12 === 0).map(entry => 
      format(entry.date, 'MMM yyyy')
    ),
    datasets: [
      {
        label: 'With Extra Payments',
        data: schedule.filter((_, index) => index % 12 === 0).map(entry => entry.remainingBalance),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
      {
        label: 'Without Extra Payments',
        data: baselineSchedule.filter((_, index) => index % 12 === 0).map(entry => entry.remainingBalance),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      }
    ]
  }

  // Chart data for payment breakdown
  const paymentBreakdownData = {
    labels: ['Principal', 'Interest', 'Extra Payments'],
    datasets: [{
      data: [
        mortgageState.loanAmount,
        schedule[schedule.length - 1]?.totalInterest || 0,
        schedule.reduce((sum, entry) => sum + entry.extraPayment, 0)
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ]
    }]
  }

  // Export functions
  const exportToPDF = async () => {
    const pdf = new jsPDF()
    
    // Add title
    pdf.setFontSize(20)
    pdf.text('Mortgage Payoff Analysis', 20, 20)
    
    // Add loan details
    pdf.setFontSize(12)
    pdf.text(`Loan Amount: $${mortgageState.loanAmount.toLocaleString()}`, 20, 40)
    pdf.text(`Interest Rate: ${mortgageState.interestRate}%`, 20, 50)
    pdf.text(`Loan Term: ${mortgageState.loanTerm} years`, 20, 60)
    pdf.text(`Payment Frequency: ${mortgageState.paymentFrequency}`, 20, 70)
    
    // Add summary
    pdf.text('Summary:', 20, 90)
    pdf.text(`Total Interest Saved: $${(
      baselineSchedule[baselineSchedule.length - 1]?.totalInterest -
      schedule[schedule.length - 1]?.totalInterest
    ).toLocaleString()}`, 20, 100)
    pdf.text(`Time Saved: ${
      Math.round((baselineSchedule.length - schedule.length) / 12 * 10) / 10
    } years`, 20, 110)
    
    // Add charts
    const chartContainer = document.getElementById('charts-container')
    if (chartContainer) {
      const canvas = await html2canvas(chartContainer)
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 20, 130, 170, 100)
    }
    
    // Add amortization schedule
    pdf.addPage()
    pdf.text('Amortization Schedule', 20, 20)
    
    const tableData = schedule.map(entry => [
      format(entry.date, 'MM/yyyy'),
      entry.payment.toFixed(2),
      entry.principal.toFixed(2),
      entry.interest.toFixed(2),
      entry.extraPayment.toFixed(2),
      entry.remainingBalance.toFixed(2)
    ])
    
    autoTable(pdf, { // Fixed: Changed from pdf.autoTable to autoTable(pdf, ...)
      head: [['Date', 'Payment', 'Principal', 'Interest', 'Extra', 'Balance']],
      body: tableData,
      startY: 30,
    })
    
    pdf.save('mortgage-payoff-analysis.pdf')
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Payment', 'Principal', 'Interest', 'Extra Payment', 'Remaining Balance'],
      ...schedule.map(entry => [
        format(entry.date, 'MM/yyyy'),
        entry.payment.toFixed(2),
        entry.principal.toFixed(2),
        entry.interest.toFixed(2),
        entry.extraPayment.toFixed(2),
        entry.remainingBalance.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'mortgage-payoff-schedule.csv'
    link.click()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <MortgagePayoffSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-6 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Mortgage Payoff{" "}
        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">
          Calculator
        </span>
      </h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
        Calculate how quickly you can pay off your mortgage and how much you can save with extra payments.
        Make informed decisions about your mortgage repayment strategy.
      </p>
    </div>
  </div>
</section>

        {/* Calculator Content */}
        <div className="container mx-auto py-6 md:py-12">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-12">
              {/* Input Section */}
              <Card className="md:col-span-4">
                <CardHeader>
                  <CardTitle>Loan Details</CardTitle>
                  <CardDescription>Enter your mortgage information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Loan Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="loanAmount"
                        type="number"
                        className="pl-9"
                        value={mortgageState.loanAmount}
                        onChange={(e) => setMortgageState(prev => ({
                          ...prev,
                          loanAmount: parseFloat(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.1"
                        className="pl-9"
                        value={mortgageState.interestRate}
                        onChange={(e) => setMortgageState(prev => ({
                          ...prev,
                          interestRate: parseFloat(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="loanTerm"
                        type="number"
                        className="pl-9"
                        value={mortgageState.loanTerm}
                        onChange={(e) => setMortgageState(prev => ({
                          ...prev,
                          loanTerm: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !mortgageState.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {mortgageState.startDate ? format(mortgageState.startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={mortgageState.startDate}
                          onSelect={(date) => date && setMortgageState(prev => ({ ...prev, startDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentFrequency">Payment Frequency</Label>
                    <Select
                      value={mortgageState.paymentFrequency}
                      onValueChange={(value: 'monthly' | 'bi-weekly' | 'weekly') => 
                        setMortgageState(prev => ({ ...prev, paymentFrequency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Extra Payments Section */}
              <Card className="md:col-span-8">
                <CardHeader>
                  <CardTitle>Extra Payments</CardTitle>
                  <CardDescription>Add extra payments to pay off your mortgage faster</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Regular Extra Payment</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          className="pl-9"
                          value={mortgageState.extraPayment}
                          onChange={(e) => setMortgageState(prev => ({
                            ...prev,
                            extraPayment: parseFloat(e.target.value) || 0
                          }))}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">per payment</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>One-Time Extra Payment</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          className="pl-9"
                          value={mortgageState.oneTimePayment}
                          onChange={(e) => setMortgageState(prev => ({
                            ...prev,
                            oneTimePayment: parseFloat(e.target.value) || 0
                          }))}
                        />
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !mortgageState.oneTimePaymentDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {mortgageState.oneTimePaymentDate ? 
                              format(mortgageState.oneTimePaymentDate, "PPP") : 
                              <span>Select payment date</span>
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={mortgageState.oneTimePaymentDate || undefined}
                            onSelect={(date) => setMortgageState(prev => ({ 
                              ...prev, 
                              oneTimePaymentDate: date ?? null // Fixed: Convert Date | undefined to Date | null
                            }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="roundUpPayments">Round Up Payments</Label>
                      <Switch
                        id="roundUpPayments"
                        checked={mortgageState.roundUpPayments}
                        onCheckedChange={(checked) => setMortgageState(prev => ({
                          ...prev,
                          roundUpPayments: checked
                        }))}
                      />
                    </div>
                    {mortgageState.roundUpPayments && (
                      <div className="space-y-2">
                        <Label>Round up to nearest</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[mortgageState.roundUpTo]}
                            min={10}
                            max={1000}
                            step={10}
                            onValueChange={([value]) => setMortgageState(prev => ({
                              ...prev,
                              roundUpTo: value
                            }))}
                          />
                          <span className="min-w-[60px] text-right">${mortgageState.roundUpTo}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card className="md:col-span-12">
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>See how extra payments affect your mortgage</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList>
                      <TabsTrigger value="summary" className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger value="charts" className="flex items-center gap-2">
                        <LineChart className="h-4 w-4" />
                        Charts
                      </TabsTrigger>
                      <TabsTrigger value="schedule" className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Schedule
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              Monthly Payment
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              ${calculateMonthlyPayment(
                                mortgageState.loanAmount,
                                mortgageState.interestRate,
                                mortgageState.loanTerm
                              ).toFixed(2)}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              Total Interest Saved
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                              ${(
                                baselineSchedule[baselineSchedule.length - 1]?.totalInterest -
                                schedule[schedule.length - 1]?.totalInterest
                              ).toFixed(2)}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              Time Saved
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                              {Math.round((baselineSchedule.length - schedule.length) / 12 * 10) / 10} years
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              Payoff Date
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {format(schedule[schedule.length - 1]?.date || new Date(), 'MMM yyyy')}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="flex gap-4">
                        <Button onClick={exportToPDF} className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Export PDF
                        </Button>
                        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Export CSV
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="charts" className="space-y-6">
                      <div id="charts-container" className="grid gap-6 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Balance Over Time</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Line
                              data={balanceComparisonData}
                              options={{
                                responsive: true,
                                plugins: {
                                  legend: {
                                    position: 'top' as const,
                                  },
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    ticks: {
                                      callback: (value) => `$${value.toLocaleString()}`
                                    }
                                  }
                                }
                              }}
                            />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Payment Breakdown</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Pie
                              data={paymentBreakdownData}
                              options={{
                                responsive: true,
                                plugins: {
                                  legend: {
                                    position: 'top' as const,
                                  }
                                }
                              }}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="schedule">
                      <div className="rounded-md border">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="h-10 px-4 text-left align-middle font-medium">Date</th>
                                <th className="h-10 px-4 text-right align-middle font-medium">Payment</th>
                                <th className="h-10 px-4 text-right align-middle font-medium">Principal</th>
                                <th className="h-10 px-4 text-right align-middle font-medium">Interest</th>
                                <th className="h-10 px-4 text-right align-middle font-medium">Extra</th>
                                <th className="h-10 px-4 text-right align-middle font-medium">Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {schedule.map((entry, index) => (
                                <tr key={index} className="border-b">
                                  <td className="p-4 align-middle">
                                    {format(entry.date, 'MMM yyyy')}
                                  </td>
                                  <td className="p-4 align-middle text-right">
                                    ${entry.payment.toFixed(2)}
                                  </td>
                                  <td className="p-4 align-middle text-right">
                                    ${entry.principal.toFixed(2)}
                                  </td>
                                  <td className="p-4 align-middle text-right">
                                    ${entry.interest.toFixed(2)}
                                  </td>
                                  <td className="p-4 align-middle text-right">
                                    ${entry.extraPayment.toFixed(2)}
                                  </td>
                                  <td className="p-4 align-middle text-right">
                                    ${entry.remainingBalance.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Blog Section */}
<section id="blog-section" className="py-12 bg-white dark:bg-black">
  <div className="container mx-auto max-w-5xl px-4">
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1 text-center">
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Debt Freedom Resource</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Mortgage Payoff Calculator: Your Path to Freedom</h2>
        <p className="mt-3 text-muted-foreground text-lg">Discover strategies to eliminate your mortgage faster and save thousands in interest</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Mortgage Payoff Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                A <strong>Mortgage Payoff Calculator</strong> is a powerful financial tool that helps you visualize the impact of additional payments on your loan term and interest costs. By understanding how extra payments affect your mortgage, you can develop strategies to eliminate your debt years sooner and potentially save tens of thousands of dollars.
              </p>
              <p className="mt-3">
                With a mortgage payoff calculator, you can:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>See how making extra payments reduces your loan term</span>
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Calculate the total interest savings from early payoff</span>
                </li>
                <li className="flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Compare different payoff strategies and their impacts</span>
                </li>
                <li className="flex items-center gap-2">
                  
                  <span>Determine your debt-free date under various scenarios</span>
                </li>
              </ul>
              <p>
                Whether you're just starting a 30-year mortgage or looking to accelerate an existing loan, understanding payoff strategies can dramatically improve your financial future.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Impact of Extra Payments</h3>
                <div className="h-[200px]">
                  <Bar 
                    data={{
                      labels: ['Standard Payment', '+$100/month', '+$250/month', '+$500/month'],
                      datasets: [
                        {
                          label: 'Years to Payoff',
                          data: [30, 25.3, 21.1, 16.8],
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
                          title: { display: true, text: 'Years' }
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">$300,000 mortgage at 6% interest rate</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> Adding just $100 extra to your monthly mortgage payment could save you over $40,000 in interest and shave nearly 5 years off a typical 30-year mortgage.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <TrendingDown className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Reduced Loan Term</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Eliminate your mortgage years or even decades earlier
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Interest Savings</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Potentially save tens of thousands in interest payments
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <LineChart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Strategy Comparison</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Compare different payoff approaches side by side
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* How It Works Section */}
      <div className="mb-10" id="how-it-works">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          How Mortgage Payoff Calculators Work
        </h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="calculation-principles" className="font-bold text-xl mb-4">Understanding the Calculation Principles</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Standard Amortization
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3">
                  Mortgage payoff calculators start with your loan's standard amortization schedule, which shows how each payment is divided between principal and interest over time.
                </p>
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Standard Mortgage Payment Formula:</p>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded font-mono text-xs">
                    M = P[r(1+r)^n]/[(1+r)^n-1]
                  </div>
                  <p className="mt-2">Where:</p>
                  <ul className="space-y-1">
                    <li>• M = Monthly payment</li>
                    <li>• P = Principal loan amount</li>
                    <li>• r = Monthly interest rate (annual rate ÷ 12)</li>
                    <li>• n = Total number of payments (years × 12)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-blue-600" />
                  Extra Payment Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3">
                  The calculator then applies any additional payments directly to the principal balance, recalculating the loan schedule with each extra payment.
                </p>
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Key effects of extra payments:</p>
                  <ul className="space-y-1">
                    <li>• Reduces outstanding principal immediately</li>
                    <li>• Decreases the interest portion of future payments</li>
                    <li>• Does not change your required monthly payment</li>
                    <li>• Shortens total loan term</li>
                    <li>• Reduces total interest paid over the life of the loan</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3 id="payment-application" className="font-bold text-xl mt-6 mb-4">How Extra Payments Are Applied</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-3">
                When you make an extra payment, it's important to understand how it affects your mortgage:
              </p>
              <ol className="space-y-3 pl-5 list-decimal">
                <li>
                  <span className="font-medium">Principal Reduction:</span> Extra payments are applied directly to your principal balance, reducing the amount you owe immediately.
                </li>
                <li>
                  <span className="font-medium">Interest Calculation:</span> Since interest is calculated based on your outstanding principal, reducing the principal means less interest accrues.
                </li>
                <li>
                  <span className="font-medium">Payment Schedule:</span> Your required monthly payment remains the same, but more of each subsequent payment goes toward principal rather than interest.
                </li>
                <li>
                  <span className="font-medium">Term Shortening:</span> By applying extra to principal, you'll reach zero balance sooner, effectively shortening your loan term.
                </li>
              </ol>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm border border-amber-100 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <p className="text-amber-700 dark:text-amber-400">
                    <strong>Important:</strong> Always specify that extra payments should be applied to principal. Some lenders might otherwise apply it toward future payments, which doesn't provide the same interest-saving benefits.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <Card className="h-full bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Payment Application Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Standard $300,000 mortgage at 6%:</p>
                      <ul className="text-xs mt-1 space-y-1">
                        <li>• Monthly payment: $1,798.65</li>
                        <li>• Term: 30 years (360 payments)</li>
                        <li>• Total paid: $647,515</li>
                        <li>• Total interest: $347,515</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">With extra $200/month:</p>
                      <ul className="text-xs mt-1 space-y-1">
                        <li>• Monthly payment: $1,998.65</li>
                        <li>• New payoff time: 22.2 years</li>
                        <li>• Time saved: 7.8 years</li>
                        <li>• Total paid: $532,681</li>
                        <li>• Total interest: $232,681</li>
                        <li>• Interest saved: $114,834</li>
                      </ul>
                    </div>

                    <div className="h-[120px]">
                      <Pie 
                        data={{
                          labels: ['Principal', 'Interest Saved', 'Interest Paid'],
                          datasets: [{
                            data: [300000, 114834, 232681],
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(99, 102, 241, 0.8)'
                            ]
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'bottom', labels: { boxWidth: 10, padding: 5 } }
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Key Insight:</strong> Extra payments have the greatest impact early in your loan term when more of your regular payment goes toward interest rather than principal. The sooner you start making additional payments, the more time and money you'll save.
            </p>
          </div>
        </div>
      </div>

      {/* Payoff Strategies Section */}
      <div className="mb-10" id="payoff-strategies">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Effective Mortgage Payoff Strategies</span>
              </div>
            </CardTitle>
            <CardDescription>
              Practical approaches to eliminate your mortgage faster
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="monthly-extra" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Regular Extra Payment Strategies
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Fixed Monthly Extra Amount</h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Adding a consistent extra amount to your regular payment each month is one of the most effective and sustainable strategies for early payoff.
                    </p>
                    <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                      <p className="font-medium">Impact of Monthly Extra Payments on a $300k, 30-year, 6% Mortgage:</p>
                      <table className="w-full mt-1">
                        <thead className="text-left">
                          <tr>
                            <th>Extra Amount</th>
                            <th>Years Saved</th>
                            <th>Interest Saved</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>$100/month</td>
                            <td>4.5 years</td>
                            <td>$65,164</td>
                          </tr>
                          <tr>
                            <td>$200/month</td>
                            <td>7.8 years</td>
                            <td>$114,834</td>
                          </tr>
                          <tr>
                            <td>$500/month</td>
                            <td>14.6 years</td>
                            <td>$186,771</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Bi-Weekly Payment Strategy</h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Instead of making 12 monthly payments per year, make half your mortgage payment every two weeks, resulting in 26 half-payments (13 full payments) annually.
                    </p>
                    <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                      <p className="font-medium">Benefits of Bi-Weekly Payments:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Makes one extra payment per year</li>
                        <li>Reduces a 30-year mortgage to about 26 years</li>
                        <li>Aligns with bi-weekly paychecks for many people</li>
                        <li>Feels less painful than a large extra payment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="lump-sum" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Lump Sum Strategies
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Annual Extra Payments</h4>
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      Apply tax refunds, bonuses, or other windfalls directly to your mortgage principal once a year.
                    </p>
                    <div className="mt-3 h-[180px]">
                      <Bar 
                        data={{
                          labels: ['No Extra', '$1,000/yr', '$2,500/yr', '$5,000/yr'],
                          datasets: [
                            {
                              label: 'Years to Payoff',
                              data: [30, 26.8, 23.3, 19.2],
                              backgroundColor: 'rgba(59, 130, 246, 0.7)',
                              borderColor: 'rgba(59, 130, 246, 1)',
                              borderWidth: 1
                            },
                            {
                              label: 'Interest Saved',
                              data: [0, 53000, 110000, 175000],
                              backgroundColor: 'rgba(16, 185, 129, 0.7)',
                              borderColor: 'rgba(16, 185, 129, 1)',
                              borderWidth: 1,
                              yAxisID: 'y1'
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: { 
                              position: 'left',
                              title: { display: true, text: 'Years' }
                            },
                            y1: {
                              position: 'right',
                              grid: { drawOnChartArea: false },
                              title: { display: true, text: 'Interest Saved ($)' }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Refinance and Maintain Payments</h4>
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      When refinancing to a lower rate, continue making your previous, higher payment amount. This effective strategy applies the difference directly to principal.
                    </p>
                    <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                      <p className="font-medium">Example:</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Original: $300k at 7%, $1,996/month</li>
                        <li>• Refinanced: $280k at 6%, $1,679/month</li>
                        <li>• Continue paying: $1,996/month</li>
                        <li>• Extra to principal: $317/month</li>
                        <li>• Time saved: 8.7 years</li>
                        <li>• Interest saved: $105,443</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 className="text-xl font-bold mb-4">Comparison of Payoff Methods</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Strategy</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Best For</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Pros</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Cons</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-medium">Monthly Extra</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Steady income</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Consistent, automated strategy; easy to budget</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Requires discipline; some people may find it hard to maintain</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-medium">Bi-Weekly</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Bi-weekly pay schedule</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Aligns with paycheck; feels less painful</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Some lenders don't accept bi-weekly payments directly</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-medium">Annual Lump Sum</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Variable income, bonuses</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Easy to apply windfalls; no monthly commitment</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Temptation to use windfalls elsewhere; less predictable</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-medium">Refinance & Maintain</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">When rates drop</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Painless extra payments; already budgeted</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Dependent on refinancing opportunity; closing costs</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-medium">Round-Up Payments</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Beginning savers</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Psychologically easier; good starter strategy</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">Smaller impact than other methods if amount is small</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Before Making Extra Payments</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    Check that your mortgage has no prepayment penalties, ensure you have an adequate emergency fund, and confirm you're not carrying high-interest debt elsewhere. While paying extra on your mortgage is beneficial, it's less advantageous than paying off credit card debt with much higher interest rates.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Considerations Section */}
      <div className="mb-10" id="financial-considerations">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Financial Considerations When Paying Off Your Mortgage
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Benefits of Early Payoff
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400 flex-shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Interest Savings</p>
                  <p className="text-sm text-muted-foreground">Eliminate thousands in interest costs over the life of your loan</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400 flex-shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Earlier Debt Freedom</p>
                  <p className="text-sm text-muted-foreground">Reach complete homeownership years sooner</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400 flex-shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Reduced Financial Stress</p>
                  <p className="text-sm text-muted-foreground">Lower monthly obligations for retirement or changing life circumstances</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400 flex-shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Guaranteed Return</p>
                  <p className="text-sm text-muted-foreground">Paying extra gives a guaranteed return equal to your interest rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Alternative Considerations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-400 flex-shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Investment Opportunity Cost</p>
                  <p className="text-sm text-muted-foreground">Consider whether you could earn a higher return by investing the extra money</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-400 flex-shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Emergency Fund Priority</p>
                  <p className="text-sm text-muted-foreground">Ensure you have 3-6 months of expenses saved before accelerating mortgage payments</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-400 flex-shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Tax Implications</p>
                  <p className="text-sm text-muted-foreground">You may lose mortgage interest tax deductions as you pay down your balance</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-400 flex-shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Liquidity Concerns</p>
                  <p className="text-sm text-muted-foreground">Extra mortgage payments reduce financial flexibility as that money is tied up in your home</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Investment vs. Mortgage Payoff: The Mathematical Perspective</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm mb-4">
                  The classic financial question: Should you pay extra on your mortgage or invest that money instead? The mathematical answer depends on comparing your mortgage interest rate with potential investment returns.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="border border-gray-200 dark:border-gray-700 px-2 py-1">Scenario</th>
                        <th className="border border-gray-200 dark:border-gray-700 px-2 py-1">Mortgage Rate</th>
                        <th className="border border-gray-200 dark:border-gray-700 px-2 py-1">Investment Return</th>
                        <th className="border border-gray-200 dark:border-gray-700 px-2 py-1">Better Option</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1">1</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1">4%</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1">7% (market avg)</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 font-medium text-green-600">Invest</td>
                      </tr>
                      <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1">2</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1">6%</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1">7% (market avg)</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 font-medium text-green-600">Slight edge to invest</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1">3</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1">6%</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1">5% (conservative)</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 font-medium text-blue-600">Pay mortgage</td>
                      </tr>
                      <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1">4</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1">7%+</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1">7% (market avg)</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 font-medium text-blue-600">Pay mortgage</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <p className="text-sm mb-3">
                  Beyond math, consider these personal factors:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">1</span>
                    <span><strong>Risk tolerance:</strong> Mortgage payoff is a guaranteed return, while investments have variable returns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">2</span>
                    <span><strong>Emotional value:</strong> The peace of mind from mortgage-free homeownership has non-financial benefits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">3</span>
                    <span><strong>Life stage:</strong> Approaching retirement favors debt elimination for reduced expenses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">4</span>
                    <span><strong>Income stability:</strong> Less stable income may favor debt reduction for security</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm border border-blue-100 dark:border-blue-800">
                  <p className="text-blue-700 dark:text-blue-400">
                    <strong>Balanced Approach:</strong> Many financial advisors recommend a balanced approach—maxing out tax-advantaged retirement accounts first, then splitting additional savings between investments and extra mortgage payments.
                  </p>
                </div>
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
              <Calculator className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Your Journey to Mortgage Freedom
            </CardTitle>
            <CardDescription>
              Taking control of your largest debt
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              A <strong>mortgage payoff calculator</strong> empowers you to visualize the profound impact of extra payments and develop a strategic plan to achieve mortgage freedom. By understanding how even modest additional contributions can dramatically reduce your loan term and interest costs, you can make informed decisions that align with your larger financial goals.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Remember these key principles on your journey to mortgage freedom:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Strategic Insights</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Early extra payments have the greatest impact</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Consistency matters more than amount for most people</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Always ensure extra payments go toward principal</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Action Steps</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Start small if needed—even $50 extra monthly helps</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Automate extra payments to ensure consistency</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Review your strategy annually as finances change</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to accelerate your mortgage payoff?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Mortgage Payoff Calculator</strong> above to create your personalized payoff plan! For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/mortgage">
                        <Home className="h-4 w-4 mr-1" />
                        Mortgage Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/amortization">
                        <LineChart className="h-4 w-4 mr-1" />
                        Amortization Schedule
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/refinance">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refinance Calculator
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
      <SaveCalculationButton calculatorType="mortgage-payoff" inputs={{}} results={{}} />
      </main>
      <div className="mt-12 py-6">
        <SiteFooter />
      </div>
    </div>
  )
}