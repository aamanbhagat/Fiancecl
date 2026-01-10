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
  Building, DollarSign, Car, Briefcase, PiggyBank, CreditCard, 
  Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, 
  TrendingUp, LineChart, Home, Landmark, Gem, Scale, Info, Wallet, Minus, Percent, FileText, AlertCircle, Gift, Heart, Users, GraduationCap, LandPlot, Lightbulb, FileEdit, FilePlus, CheckCircle, Clock, Banknote, History, MapPin, Receipt, BadgeDollarSign, Link, Plus, Calendar, XCircle
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { ChartOptions } from 'chart.js'
import PaymentSchema from './schema';

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

interface PaymentSchedule {
  payment: number
  principal: number
  interest: number
  balance: number
  totalInterest: number
  date: string
}

export default function PaymentCalculatorPage() {
  // Loan Details State
  const [loanAmount, setLoanAmount] = useState(100000)
  const [interestRate, setInterestRate] = useState(5)
  const [loanTerm, setLoanTerm] = useState(30)
  const [paymentFrequency, setPaymentFrequency] = useState("monthly")
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  
  // Extra Payment Options State
  const [includeExtraPayment, setIncludeExtraPayment] = useState(false)
  const [extraPaymentAmount, setExtraPaymentAmount] = useState(100)
  const [extraPaymentFrequency, setExtraPaymentFrequency] = useState("monthly")
  
  // Results State
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule[]>([])
  const [payoffDate, setPayoffDate] = useState("")
  const [interestSaved, setInterestSaved] = useState(0)
  const [monthsSaved, setMonthsSaved] = useState(0)

  // Calculate loan payments and schedule
  useEffect(() => {
    const periodicRate = (interestRate / 100) / 12
    const numberOfPayments = loanTerm * 12
    
    // Calculate base monthly payment using the standard amortization formula
    const basePayment = loanAmount * 
      (periodicRate * Math.pow(1 + periodicRate, numberOfPayments)) / 
      (Math.pow(1 + periodicRate, numberOfPayments) - 1)
    
    let balance = loanAmount
    let totalInterestPaid = 0
    let schedule: PaymentSchedule[] = []
    let currentDate = new Date(startDate)
    
    for (let i = 0; i < numberOfPayments && balance > 0; i++) {
      const interestPayment = balance * periodicRate
      let principalPayment = basePayment - interestPayment
      
      // Add extra payment if enabled
      if (includeExtraPayment) {
        if (extraPaymentFrequency === "monthly" || 
            (extraPaymentFrequency === "quarterly" && i % 3 === 0) ||
            (extraPaymentFrequency === "annually" && i % 12 === 0)) {
          principalPayment += extraPaymentAmount
        }
      }
      
      // Adjust final payment if needed
      if (principalPayment > balance) {
        principalPayment = balance
      }
      
      balance -= principalPayment
      totalInterestPaid += interestPayment
      
      schedule.push({
        payment: principalPayment + interestPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: balance,
        totalInterest: totalInterestPaid,
        date: currentDate.toISOString().split('T')[0]
      })
      
      // Increment date by one month
      currentDate.setMonth(currentDate.getMonth() + 1)
      
      // Break if loan is paid off
      if (balance <= 0) break
    }
    
    // Calculate savings if extra payments are included
    let standardTotalInterest = 0
    if (includeExtraPayment) {
      let standardBalance = loanAmount
      for (let i = 0; i < numberOfPayments && standardBalance > 0; i++) {
        const standardInterest = standardBalance * periodicRate
        const standardPrincipal = basePayment - standardInterest
        standardBalance -= standardPrincipal
        standardTotalInterest += standardInterest
      }
      setInterestSaved(standardTotalInterest - totalInterestPaid)
      setMonthsSaved(numberOfPayments - schedule.length)
    }
    
    setMonthlyPayment(basePayment)
    setTotalInterest(totalInterestPaid)
    setTotalPayment(loanAmount + totalInterestPaid)
    setPaymentSchedule(schedule)
    setPayoffDate(schedule[schedule.length - 1].date)
  }, [loanAmount, interestRate, loanTerm, includeExtraPayment, extraPaymentAmount, extraPaymentFrequency, startDate])

  // Chart data for payment breakdown
  const pieChartData = {
    labels: ['Principal', 'Interest'],
    datasets: [
      {
        data: [loanAmount, totalInterest],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(14, 165, 233, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(14, 165, 233, 1)',
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

  // Line chart data for balance over time
  const lineChartData = {
    labels: paymentSchedule.map((_, index) => `Year ${Math.floor(index / 12) + 1}`).filter((_, index) => index % 12 === 0),
    datasets: [
      {
        label: 'Loan Balance',
        data: paymentSchedule.filter((_, index) => index % 12 === 0).map(payment => payment.balance),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
      },
    ],
  }

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
  }

  // Bar chart data for payment composition over time
  const barChartData = {
    labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'].slice(0, Math.ceil(paymentSchedule.length / 12)),
    datasets: [
      {
        label: 'Principal',
        data: [0, 4, 9, 14, 19, 24, 29].map(year => {
          const index = year * 12
          return index < paymentSchedule.length ? paymentSchedule[index].principal : 0
        }).slice(0, Math.ceil(paymentSchedule.length / 12)),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
      {
        label: 'Interest',
        data: [0, 4, 9, 14, 19, 24, 29].map(year => {
          const index = year * 12
          return index < paymentSchedule.length ? paymentSchedule[index].interest : 0
        }).slice(0, Math.ceil(paymentSchedule.length / 12)),
        backgroundColor: 'rgba(14, 165, 233, 0.8)',
      },
    ],
  }

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
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
    pdf.save('payment-calculation-results.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PaymentSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Payment <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your loan payments and see a detailed breakdown of your repayment schedule.
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
                    <CardTitle>Enter Loan Details</CardTitle>
                    <CardDescription>
                      Provide your loan information to calculate payments and view amortization schedule.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Loan Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="loan-amount">Loan Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="loan-amount"
                          type="number"
                          value={loanAmount || ''} onChange={(e) => setLoanAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                        <span className="text-sm text-muted-foreground">{interestRate}%</span>
                      </div>
                      <Slider
                        id="interest-rate"
                        min={0}
                        max={20}
                        step={0.1}
                        value={[interestRate]}
                        onValueChange={(value) => setInterestRate(value[0])}
                      />
                    </div>

                    {/* Loan Term */}
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
                          <SelectItem value="5">5 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Payment Frequency */}
                    <div className="space-y-2">
                      <Label htmlFor="payment-frequency">Payment Frequency</Label>
                      <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                        <SelectTrigger id="payment-frequency">
                          <SelectValue placeholder="Select payment frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    {/* Extra Payment Options */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="extra-payment-toggle">Include Extra Payments</Label>
                        <Switch
                          id="extra-payment-toggle"
                          checked={includeExtraPayment}
                          onCheckedChange={setIncludeExtraPayment}
                        />
                      </div>

                      {includeExtraPayment && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="extra-payment-amount">Extra Payment Amount</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="extra-payment-amount"
                                type="number"
                                value={extraPaymentAmount || ''} onChange={(e) => setExtraPaymentAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                                className="pl-9"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="extra-payment-frequency">Extra Payment Frequency</Label>
                            <Select value={extraPaymentFrequency} onValueChange={setExtraPaymentFrequency}>
                              <SelectTrigger id="extra-payment-frequency">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
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
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            Monthly Payment
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatCurrency(monthlyPayment)}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Payment
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatCurrency(totalPayment)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Tabs defaultValue="breakdown">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="charts">Charts</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                            <span>Principal Amount</span>
                            <span className="font-medium">{formatCurrency(loanAmount)}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                            <span>Total Interest</span>
                            <span className="font-medium">{formatCurrency(totalInterest)}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                            <span>Loan Term</span>
                            <span className="font-medium">{loanTerm} years</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                            <span>Payoff Date</span>
                            <span className="font-medium">{formatDate(payoffDate)}</span>
                          </div>
                        </div>

                        {includeExtraPayment && (
                          <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                              <CardTitle className="text-sm">Savings with Extra Payments</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span>Interest Saved</span>
                                <span className="font-medium text-primary">{formatCurrency(interestSaved)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Time Saved</span>
                                <span className="font-medium text-primary">{monthsSaved} months</span>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      <TabsContent value="schedule" className="space-y-4">
                        <div className="rounded-lg border">
                          <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                            <div>Date</div>
                            <div>Payment</div>
                            <div>Principal</div>
                            <div>Interest</div>
                            <div>Balance</div>
                          </div>
                          <div className="divide-y max-h-[400px] overflow-auto">
                            {paymentSchedule.map((payment, index) => (
                              <div key={index} className="grid grid-cols-5 gap-4 p-4 text-sm">
                                <div>{formatDate(payment.date)}</div>
                                <div>{formatCurrency(payment.payment)}</div>
                                <div>{formatCurrency(payment.principal)}</div>
                                <div>{formatCurrency(payment.interest)}</div>
                                <div>{formatCurrency(payment.balance)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="charts" className="space-y-6">
                        <div className="space-y-2">
                          <h4 className="font-medium">Principal vs Interest</h4>
                          <div className="h-[200px]">
                            <Pie data={pieChartData} options={pieChartOptions} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Balance Over Time</h4>
                          <div className="h-[200px]">
                            <Line data={lineChartData} options={lineChartOptions} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Payment Composition</h4>
                          <div className="h-[200px]">
                            <Bar data={barChartData} options={barChartOptions} />
                          </div>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 mb-2">Loan Resource</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">Understanding Loan Payments: Beyond the Numbers</h2>
        <p className="mt-3 text-muted-foreground text-lg">Decode your loan payments, interest costs, and find strategies to save money</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-indigo-200 dark:border-indigo-900">
        <CardHeader className="bg-indigo-50 dark:bg-indigo-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Understanding Payment Calculations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-payment-calculator" className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">What is a Payment Calculator?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                A <strong>Payment Calculator</strong> is a financial tool that helps you determine your regular payment amounts for loans, mortgages, or any fixed-payment borrowing arrangement. It transforms complex financial formulas into simple, understandable numbers, showing you exactly what you'll pay and how your debt diminishes over time.
              </p>
              <p className="mt-2">
                Payment calculators incorporate these key elements:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  <span>Principal loan amount</span>
                </li>
                <li className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  <span>Interest rate</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  <span>Loan term (duration)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  <span>Payment frequency (monthly, bi-weekly, etc.)</span>
                </li>
              </ul>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-indigo-100 to-purple-50 dark:from-indigo-900/60 dark:to-purple-900/60">
                  <CardTitle className="text-sm font-medium text-center">Payment Distribution Over Time</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Line 
                      data={{
                        labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
                        datasets: [
                          {
                            label: 'Principal',
                            data: [10, 15, 28, 45, 67, 85, 100],
                            borderColor: 'rgba(99, 102, 241, 0.8)',
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                          },
                          {
                            label: 'Interest',
                            data: [90, 85, 72, 55, 33, 15, 0],
                            borderColor: 'rgba(124, 58, 237, 0.8)',
                            backgroundColor: 'rgba(124, 58, 237, 0.2)',
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
                            beginAtZero: true,
                            stacked: true,
                            max: 100,
                            ticks: { callback: value => value + '%' }
                          },
                          x: { stacked: true }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <h4 id="why-important" className="font-semibold text-xl mt-6">Why Understanding Loan Payments is Critical</h4>
          <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Financial Clarity</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Understanding payment structures helps you make informed borrowing decisions and avoid unexpected financial strain</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Interest Awareness</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Many borrowers are unaware that they may pay 2-3 times the principal amount over the life of a long-term loan</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Budget Planning</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Accurate payment calculations are essential for realistic monthly budget planning</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How Payments Work Section */}
      <div className="mb-12" id="how-payments-work">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-6 w-6 text-indigo-600" />
          <h2 className="text-2xl font-bold">The Anatomy of Loan Payments</h2>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl mb-6 border border-indigo-100 dark:border-indigo-800">
          <h3 id="amortization" className="font-bold text-xl mb-4">Understanding Amortization</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-indigo-200 dark:border-indigo-800">
              <CardHeader className="bg-indigo-50 dark:bg-indigo-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-indigo-600" />
                  Payment Components
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>
                  Most loans use <strong>amortization</strong>—a repayment schedule where each payment includes both principal and interest, gradually reducing your balance to zero.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-indigo-100/50 dark:bg-indigo-900/50 rounded-md">
                    <p className="font-medium text-indigo-800 dark:text-indigo-300">Every payment contains two parts:</p>
                    <ul className="mt-2 space-y-1 text-sm text-indigo-700 dark:text-indigo-400">
                      <li>• <strong>Principal portion</strong>: Reduces your loan balance</li>
                      <li>• <strong>Interest portion</strong>: Cost of borrowing</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Early in the loan term, payments are mostly interest. As the loan matures, more of each payment goes toward principal.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-indigo-200 dark:border-indigo-800">
              <CardHeader className="bg-indigo-50 dark:bg-indigo-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  The Amortization Process
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <p className="font-medium">How your payments evolve over time:</p>
                  <div className="h-[170px]">
                    <Bar 
                      data={{
                        labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
                        datasets: [
                          {
                            label: 'Principal',
                            data: [200, 250, 325, 425, 550, 725, 950],
                            backgroundColor: 'rgba(99, 102, 241, 0.7)',
                          },
                          {
                            label: 'Interest',
                            data: [800, 750, 675, 575, 450, 275, 50],
                            backgroundColor: 'rgba(139, 92, 246, 0.7)',
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: { stacked: true },
                          y: { 
                            stacked: true,
                            beginAtZero: true,
                            max: 1000,
                            ticks: { callback: value => '$' + value }
                          }
                        },
                        plugins: {
                          legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } },
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
                  <div className="text-xs text-center text-muted-foreground">
                    Example: $200,000 30-year mortgage at 5.5% interest
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <h3 id="payment-formula" className="font-bold text-xl mt-8 mb-4">The Payment Calculation Formula</h3>
        
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <p className="mb-3">
                    The standard formula for calculating loan payments is:
                  </p>
                  
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800 mb-4">
                    <div className="text-center">
                      <p className="font-medium text-lg text-indigo-800 dark:text-indigo-300">
                        PMT = P × [r(1+r)^n] ÷ [(1+r)^n-1]
                      </p>
                      <div className="mt-3 text-sm text-indigo-700 dark:text-indigo-400">
                        <p><strong>Where:</strong></p>
                        <ul className="space-y-1 mt-2">
                          <li>PMT = Payment amount</li>
                          <li>P = Principal (loan amount)</li>
                          <li>r = Interest rate per period</li>
                          <li>n = Total number of payments</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Example Calculation</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          For a $250,000 loan at 6% annual interest for 30 years (360 monthly payments):
                          <br />
                          Monthly payment = $1,498.88
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-[300px] flex-shrink-0">
                  <h4 className="text-center text-sm font-medium mb-3">Loan Payment Breakdown</h4>
                  <div className="h-[240px]">
                    <Pie
                      data={{
                        labels: ['Principal', 'Interest'],
                        datasets: [{
                          label: 'Total Amount Paid',
                          data: [250000, 289596],
                          backgroundColor: [
                            'rgba(99, 102, 241, 0.7)',
                            'rgba(139, 92, 246, 0.7)'
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
                            font: { weight: 'bold' },
                            formatter: (value) => '$' + value.toLocaleString()
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground mt-2">
                    Total paid over 30 years: $539,596
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Factors Affecting Payments Section */}
      <div className="mb-12" id="key-factors">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl">Factors That Impact Your Payment Amount</span>
              </div>
            </CardTitle>
            <CardDescription>
              Understanding how different variables affect what you pay
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 id="interest-impact" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Interest Rate Impact
                </h3>
                
                <p>
                  Even small changes in interest rates can dramatically affect your total payment amount, especially for long-term loans.
                </p>
                <div className="mt-4 h-[220px]">
                  <Line 
                    data={{
                      labels: ['4%', '4.5%', '5%', '5.5%', '6%', '6.5%', '7%'],
                      datasets: [
                        {
                          label: 'Monthly Payment',
                          data: [1194, 1267, 1342, 1419, 1499, 1580, 1663],
                          borderColor: 'rgba(124, 58, 237, 0.8)',
                          backgroundColor: 'rgba(124, 58, 237, 0.1)',
                          yAxisID: 'y'
                        },
                        {
                          label: 'Total Interest Paid',
                          data: [179828, 206035, 233139, 261038, 289596, 318675, 348226],
                          borderColor: 'rgba(99, 102, 241, 0.8)',
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          yAxisID: 'y1'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      elements: {
                        point: {
                          radius: 3
                        }
                      },
                      scales: {
                        y: {
                          type: 'linear',
                          position: 'left',
                          title: {
                            display: true,
                            text: 'Monthly Payment'
                          },
                          ticks: { callback: value => '$' + value }
                        },
                        y1: {
                          type: 'linear',
                          position: 'right',
                          grid: { drawOnChartArea: false },
                          title: {
                            display: true,
                            text: 'Total Interest'
                          },
                          ticks: { callback: value => '$' + Number(value).toLocaleString() }
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Impact on a $250,000, 30-year loan
                </p>
              </div>
              
              <div>
                <h3 id="term-impact" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Loan Term Effects
                </h3>
                <p className="mb-4">
                  Shorter loan terms mean higher monthly payments but significantly less interest paid over the life of the loan.
                </p>
                <div className="h-[240px]">
                  <Bar 
                    data={{
                      labels: ['15 Years', '20 Years', '25 Years', '30 Years'],
                      datasets: [
                        {
                          label: 'Monthly Payment',
                          data: [2110, 1789, 1610, 1499],
                          backgroundColor: 'rgba(124, 58, 237, 0.7)',
                          borderWidth: 1,
                          yAxisID: 'y'
                        },
                        {
                          label: 'Total Interest',
                          data: [130000, 179000, 233000, 290000],
                          backgroundColor: 'rgba(99, 102, 241, 0.7)',
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
                          type: 'linear',
                          position: 'left',
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Monthly Payment'
                          },
                          ticks: { callback: value => '$' + value }
                        },
                        y1: {
                          type: 'linear',
                          position: 'right',
                          beginAtZero: true,
                          grid: { drawOnChartArea: false },
                          title: {
                            display: true,
                            text: 'Total Interest'
                          },
                          ticks: { callback: value => '$' + value.toLocaleString() }
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  $250,000 loan at 6% interest
                </p>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 id="payment-strategies" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-6">Strategic Payment Approaches</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <RefreshCw className="h-4 w-4 text-purple-600" />
                    Bi-weekly Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      Pay half your monthly payment every two weeks, resulting in 26 half-payments (13 full payments) per year.
                    </p>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                      <p className="text-xs font-medium text-purple-800 dark:text-purple-300">Impact on $250,000 @ 6% for 30 years:</p>
                      <ul className="mt-1 text-xs text-purple-700 dark:text-purple-400">
                        <li>• Pay off ~4 years earlier</li>
                        <li>• Save ~$38,000 in interest</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    Extra Principal Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      Adding even small amounts to your regular payment can significantly reduce your loan term and interest paid.
                    </p>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                      <p className="text-xs font-medium text-purple-800 dark:text-purple-300">$100 extra monthly on $250,000 loan:</p>
                      <ul className="mt-1 text-xs text-purple-700 dark:text-purple-400">
                        <li>• Pay off ~4.5 years earlier</li>
                        <li>• Save ~$50,000 in interest</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    Refinancing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      Replacing your existing loan with a new one that has better terms can lower your payment or reduce your term.
                    </p>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                      <p className="text-xs font-medium text-purple-800 dark:text-purple-300">Refinancing from 6% to 5%:</p>
                      <ul className="mt-1 text-xs text-purple-700 dark:text-purple-400">
                        <li>• Save $158/month</li>
                        <li>• Save ~$56,000 in interest (30-yr term)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Types and Considerations */}
      <div className="mb-12" id="loan-types">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-indigo-600" />
          Different Loan Types and Payment Structures
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-indigo-600" />
                Fixed-Rate Mortgages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Predictability</strong>: Same payment amount throughout the entire loan term</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Security</strong>: Protected from interest rate increases</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                  <span><strong>Flexibility</strong>: May have higher initial rates than ARMs</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
                <p className="text-xs text-indigo-800 dark:text-indigo-300">
                  <strong>Best for</strong>: Long-term homeowners who value payment stability and predictable budgeting
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Scale className="h-5 w-5 text-indigo-600" />
                Adjustable-Rate Mortgages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Initial Savings</strong>: Lower starting interest rate and payment</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                  <span><strong>Uncertainty</strong>: Payments can increase when rates adjust</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span><strong>Protection</strong>: Rate caps limit how much rates can increase</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
                <p className="text-xs text-indigo-800 dark:text-indigo-300">
                  <strong>Best for</strong>: Homeowners planning to sell/refinance before the initial fixed period ends
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                Personal & Auto Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Structure</strong>: Fixed payments with set end date</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span><strong>Rates</strong>: Auto loans typically lower (secured by vehicle)</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                  <span><strong>Terms</strong>: Usually shorter (3-7 years) than mortgages</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
                <p className="text-xs text-indigo-800 dark:text-indigo-300">
                  <strong>Best practice</strong>: Choose the shortest term you can comfortably afford to minimize interest
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 id="comparing-options" className="text-xl font-bold mb-4">Comparing Payment Options</h3>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                    <th className="px-4 py-3 text-left">Loan Type</th>
                    <th className="px-4 py-3 text-left">Typical Terms</th>
                    <th className="px-4 py-3 text-left">Interest Structure</th>
                    <th className="px-4 py-3 text-left">Best For</th>
                    <th className="px-4 py-3 text-left">Special Considerations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100 dark:divide-indigo-800">
                  <tr>
                    <td className="px-4 py-3 font-medium">30-Year Fixed Mortgage</td>
                    <td className="px-4 py-3">30 years</td>
                    <td className="px-4 py-3">Fixed</td>
                    <td className="px-4 py-3">Lower monthly payments, long-term stability</td>
                    <td className="px-4 py-3">Highest total interest cost</td>
                  </tr>
                  <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                    <td className="px-4 py-3 font-medium">15-Year Fixed Mortgage</td>
                    <td className="px-4 py-3">15 years</td>
                    <td className="px-4 py-3">Fixed</td>
                    <td className="px-4 py-3">Lower total interest, faster equity</td>
                    <td className="px-4 py-3">Higher monthly payments</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">5/1 ARM</td>
                    <td className="px-4 py-3">30 years (rate adjusts after 5)</td>
                    <td className="px-4 py-3">Fixed then Variable</td>
                    <td className="px-4 py-3">Short-term ownership, refinancing plans</td>
                    <td className="px-4 py-3">Risk of payment shock after fixed period</td>
                  </tr>
                  <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                    <td className="px-4 py-3 font-medium">Auto Loan</td>
                    <td className="px-4 py-3">3-7 years</td>
                    <td className="px-4 py-3">Fixed</td>
                    <td className="px-4 py-3">Vehicle purchases</td>
                    <td className="px-4 py-3">Secured by vehicle, lower rates</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Personal Loan</td>
                    <td className="px-4 py-3">2-7 years</td>
                    <td className="px-4 py-3">Fixed</td>
                    <td className="px-4 py-3">Debt consolidation, major expenses</td>
                    <td className="px-4 py-3">Higher rates than secured loans</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Payment Shock Prevention</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                When choosing an adjustable-rate loan, calculate what your payment would be if the rate increased to the maximum allowed. Ensure you could still afford the payments in this worst-case scenario to protect yourself from payment shock.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <div className="mb-6" id="conclusion">
        <Card className="overflow-hidden border-indigo-200 dark:border-indigo-900">
          <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-700 dark:text-indigo-400" />
              Taking Control of Your Loan Payments
            </CardTitle>
            <CardDescription>
              Make informed borrowing decisions with payment knowledge
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              Understanding <strong>how loan payments work</strong> empowers you to make smarter financial decisions. By grasping the relationship between loan amount, interest rate, and term, you can strategically manage your debt, minimize interest costs, and align your borrowing with your broader financial goals.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Key takeaways to remember:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">Payment Insights</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900 dark:text-indigo-300">→</span>
                    <span className="text-indigo-800 dark:text-indigo-300">Small interest rate differences create massive lifetime cost variations</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900 dark:text-indigo-300">→</span>
                    <span className="text-indigo-800 dark:text-indigo-300">Early loan payments target principal more effectively</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900 dark:text-indigo-300">→</span>
                    <span className="text-indigo-800 dark:text-indigo-300">Shorter terms mean higher payments but dramatic interest savings</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-100 dark:border-purple-800">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Strategic Actions</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">1</span>
                    <span className="text-purple-800 dark:text-purple-300">Compare total loan costs, not just monthly payments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">2</span>
                    <span className="text-purple-800 dark:text-purple-300">Make extra principal payments when possible</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">3</span>
                    <span className="text-purple-800 dark:text-purple-300">Consider refinancing when interest rates drop significantly</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="font-medium text-lg text-indigo-800 dark:text-indigo-300">Ready to calculate your loan payments?</p>
                  <p className="mt-1 text-indigo-700 dark:text-indigo-400">
                    Use our <strong>Payment Calculator</strong> above to analyze different loan scenarios and find the best option for your financial situation. For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/mortgage">
                        <Home className="h-4 w-4 mr-1" />
                        Mortgage Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/refinance">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refinance Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/extra-payment">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Extra Payment Calculator
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