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
import CreditCardSchema from './schema';

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
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
  totalInterest: number
  date: string
}

export default function CreditCardCalculatorPage() {
  // Credit Card Details State
  const [balance, setBalance] = useState(5000)
  const [apr, setApr] = useState(18.9)
  const [minPaymentType, setMinPaymentType] = useState("percentage")
  const [minPaymentPercent, setMinPaymentPercent] = useState(2)
  const [minPaymentFixed, setMinPaymentFixed] = useState(25)
  const [paymentFrequency, setPaymentFrequency] = useState("monthly")
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  
  // Additional Options State
  const [creditLimit, setCreditLimit] = useState(10000)
  const [annualFee, setAnnualFee] = useState(0)
  const [includeExtraPayment, setIncludeExtraPayment] = useState(false)
  const [extraPaymentAmount, setExtraPaymentAmount] = useState(100)
  const [extraPaymentFrequency, setExtraPaymentFrequency] = useState("monthly")
  const [hasPromoAPR, setHasPromoAPR] = useState(false)
  const [promoAPR, setPromoAPR] = useState(0)
  const [promoDuration, setPromoDuration] = useState(12)
  
  // Results State
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [payoffMonths, setPayoffMonths] = useState(0)
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule[]>([])
  const [interestSaved, setInterestSaved] = useState(0)
  const [monthsSaved, setMonthsSaved] = useState(0)
  const [utilizationRatio, setUtilizationRatio] = useState(0)

  // Calculate credit card payments and schedule
  useEffect(() => {
    let currentBalance = balance
    let totalInterestPaid = 0
    let schedule: PaymentSchedule[] = []
    let currentDate = new Date(startDate)
    let month = 0
    
    // Calculate minimum payment
    const getMinPayment = (balance: number) => {
      if (minPaymentType === "percentage") {
        return Math.max(minPaymentFixed, (balance * minPaymentPercent) / 100)
      }
      return minPaymentFixed
    }
    
    while (currentBalance > 0) {
      // Calculate monthly rate based on current month
      const currentRate = (hasPromoAPR && month < promoDuration) ? promoAPR : apr
      const monthlyRate = currentRate / 100 / 12
      const interestCharge = currentBalance * monthlyRate
      let payment = getMinPayment(currentBalance)
      
      // Add extra payment if enabled
      if (includeExtraPayment) {
        if (extraPaymentFrequency === "monthly" || 
            (extraPaymentFrequency === "quarterly" && month % 3 === 0) ||
            (extraPaymentFrequency === "annually" && month % 12 === 0)) {
          payment += extraPaymentAmount
        }
      }
      
      // Adjust final payment if needed
      if (payment > currentBalance + interestCharge) {
        payment = currentBalance + interestCharge
      }
      
      const principalPayment = payment - interestCharge
      currentBalance -= principalPayment
      totalInterestPaid += interestCharge
      
      schedule.push({
        month: month + 1,
        payment,
        principal: principalPayment,
        interest: interestCharge,
        balance: Math.max(currentBalance, 0), // Prevent negative balance
        totalInterest: totalInterestPaid,
        date: currentDate.toISOString().split('T')[0]
      })
      
      // Add annual fee if applicable
      if (annualFee > 0 && month % 12 === 11) {
        currentBalance += annualFee
      }
      
      currentDate.setMonth(currentDate.getMonth() + 1)
      month++
      
      // Break if taking too long (e.g., minimum payment barely covers interest)
      if (month > 600) break // 50 years max
    }
    
    // Calculate savings compared to minimum payments only
    if (includeExtraPayment) {
      let standardBalance = balance
      let standardTotalInterest = 0
      let standardMonths = 0
      let standardMonth = 0
      
      while (standardBalance > 0) {
        // Calculate monthly rate for standard payment based on month
        const standardRate = (hasPromoAPR && standardMonth < promoDuration) ? promoAPR : apr
        const standardMonthlyRate = standardRate / 100 / 12
        const standardInterest = standardBalance * standardMonthlyRate
        const standardPayment = getMinPayment(standardBalance)
        const standardPrincipal = standardPayment - standardInterest
        
        standardBalance -= standardPrincipal
        standardTotalInterest += standardInterest
        standardMonths++
        standardMonth++
        
        if (standardMonths > 600) break
      }
      
      setInterestSaved(standardTotalInterest - totalInterestPaid)
      setMonthsSaved(standardMonths - schedule.length)
    } else {
      setInterestSaved(0)
      setMonthsSaved(0)
    }
    
    setMonthlyPayment(schedule[0]?.payment || 0)
    setTotalInterest(totalInterestPaid)
    setPayoffMonths(schedule.length)
    setPaymentSchedule(schedule)
    setUtilizationRatio((balance / creditLimit) * 100)
  }, [
    balance,
    apr,
    minPaymentType,
    minPaymentPercent,
    minPaymentFixed,
    paymentFrequency,
    startDate,
    creditLimit,
    annualFee,
    includeExtraPayment,
    extraPaymentAmount,
    extraPaymentFrequency,
    hasPromoAPR,
    promoAPR,
    promoDuration
  ])

  // Chart data for payment breakdown
  const pieChartData = {
    labels: ['Principal', 'Interest'],
    datasets: [
      {
        data: [balance, totalInterest],
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
    labels: paymentSchedule.map(payment => `Month ${payment.month}`),
    datasets: [
      {
        label: 'Balance',
        data: paymentSchedule.map(payment => payment.balance),
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

  // Bar chart data for payment composition
  const barChartData = {
    labels: paymentSchedule.slice(0, 12).map(payment => `Month ${payment.month}`),
    datasets: [
      {
        label: 'Principal',
        data: paymentSchedule.slice(0, 12).map(payment => payment.principal),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
      {
        label: 'Interest',
        data: paymentSchedule.slice(0, 12).map(payment => payment.interest),
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
        stacked: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
      x: {
        stacked: true,
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
    pdf.save('credit-card-calculation-results.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <CreditCardSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Credit Card <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your credit card payments, interest costs, and create a personalized payoff plan.
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
                    <CardTitle>Credit Card Details</CardTitle>
                    <CardDescription>
                      Enter your credit card information to calculate payments and create a payoff plan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Details */}
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="balance">Current Balance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="balance"
                              type="number"
                              value={balance}
                              onChange={(e) => setBalance(Number(e.target.value))}
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apr">Annual Percentage Rate (APR)</Label>
                          <div className="relative">
                            <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="apr"
                              type="number"
                              value={apr}
                              onChange={(e) => setApr(Number(e.target.value))}
                              className="pl-9"
                              step="0.1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Minimum Payment Type</Label>
                        <Select value={minPaymentType} onValueChange={setMinPaymentType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select minimum payment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage of Balance</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {minPaymentType === "percentage" ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="min-payment-percent">Minimum Payment Percentage</Label>
                            <span className="text-sm text-muted-foreground">{minPaymentPercent}%</span>
                          </div>
                          <Slider
                            id="min-payment-percent"
                            min={1}
                            max={5}
                            step={0.5}
                            value={[minPaymentPercent]}
                            onValueChange={(value) => setMinPaymentPercent(value[0])}
                          />
                          <p className="text-xs text-muted-foreground">
                            Minimum payment will be the greater of {minPaymentPercent}% of balance or ${minPaymentFixed}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="min-payment-fixed">Fixed Minimum Payment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="min-payment-fixed"
                              type="number"
                              value={minPaymentFixed}
                              onChange={(e) => setMinPaymentFixed(Number(e.target.value))}
                              className="pl-9"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Additional Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Options</h3>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="credit-limit">Credit Limit</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="credit-limit"
                              type="number"
                              value={creditLimit}
                              onChange={(e) => setCreditLimit(Number(e.target.value))}
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="annual-fee">Annual Fee</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="annual-fee"
                              type="number"
                              value={annualFee}
                              onChange={(e) => setAnnualFee(Number(e.target.value))}
                              className="pl-9"
                            />
                          </div>
                        </div>
                      </div>

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
                                  value={extraPaymentAmount}
                                  onChange={(e) => setExtraPaymentAmount(Number(e.target.value))}
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

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="promo-apr-toggle">Has Promotional APR</Label>
                          <Switch
                            id="promo-apr-toggle"
                            checked={hasPromoAPR}
                            onCheckedChange={setHasPromoAPR}
                          />
                        </div>

                        {hasPromoAPR && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="promo-apr">Promotional APR</Label>
                              <div className="relative">
                                <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="promo-apr"
                                  type="number"
                                  value={promoAPR}
                                  onChange={(e) => setPromoAPR(Number(e.target.value))}
                                  className="pl-9"
                                  step="0.1"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="promo-duration">Duration (Months)</Label>
                              <Input
                                id="promo-duration"
                                type="number"
                                value={promoDuration}
                                onChange={(e) => setPromoDuration(Number(e.target.value))}
                              />
                            </div>
                          </div>
                        )}
                      </div>
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
                          <p className="text-xs text-muted-foreground">
                            {includeExtraPayment ? "Including extra payment" : "Minimum payment"}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Interest
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatCurrency(totalInterest)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Over {payoffMonths} months
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Tabs defaultValue="summary">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="charts">Charts</TabsTrigger>
                      </TabsList>

                      <TabsContent value="summary" className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                            <span>Payoff Date</span>
                            <span className="font-medium">
                              {formatDate(paymentSchedule[paymentSchedule.length - 1]?.date)}
                            </span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                            <span>Time to Pay Off</span>
                            <span className="font-medium">
                              {Math.floor(payoffMonths / 12)} years, {payoffMonths % 12} months
                            </span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                            <span>Total Cost</span>
                            <span className="font-medium">
                              {formatCurrency(balance + totalInterest)}
                            </span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                            <span>Credit Utilization</span>
                            <span className="font-medium">
                              {utilizationRatio.toFixed(1)}%
                            </span>
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
                                <span className="font-medium text-primary">
                                  {formatCurrency(interestSaved)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Time Saved</span>
                                <span className="font-medium text-primary">
                                  {Math.floor(monthsSaved / 12)} years, {monthsSaved % 12} months
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {utilizationRatio > 30 && (
                          <div className="flex items-start gap-2 text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 p-4 rounded-lg">
                            <AlertCircle className="h-5 w-5 mt-0.5" />
                            <div>
                              <p className="font-medium">High Credit Utilization</p>
                              <p className="text-sm">
                                Your credit utilization ratio is above 30%, which may negatively impact your credit score. Consider making extra payments or requesting a credit limit increase.
                              </p>
                            </div>
                          </div>
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
                          <h4 className="font-medium">Payment Breakdown (First Year)</h4>
                          <div className="h-[200px]">
                            <Bar data={barChartData} options={barChartOptions} />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Tips and Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tips & Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2 text-primary">
                      <TrendingUp className="h-5 w-5 mt-0.5" />
                      <div>
                        <p className="font-medium">Pay More Than the Minimum</p>
                        <p className="text-sm text-muted-foreground">
                          Making only minimum payments will result in paying {formatCurrency(totalInterest)} in interest over {payoffMonths} months.
                        </p>
                      </div>
                    </div>

                    {apr > 15 && (
                      <div className="flex items-start gap-2 text-orange-600 dark:text-orange-500">
                        <AlertCircle className="h-5 w-5 mt-0.5" />
                        <div>
                          <p className="font-medium">High APR Alert</p>
                          <p className="text-sm">
                            Your APR of {apr}% is relatively high. Consider transferring the balance to a card with a lower rate or negotiating with your current provider.
                          </p>
                        </div>
                      </div>
                    )}

                    {includeExtraPayment && (
                      <div className="flex items-start gap-2 text-green-600 dark:text-green-500">
                        <Info className="h-5 w-5 mt-0.5" />
                        <div>
                          <p className="font-medium">Extra Payment Impact</p>
                          <p className="text-sm">
                            By making extra payments of {formatCurrency(extraPaymentAmount)} {extraPaymentFrequency}, you'll save {formatCurrency(interestSaved)} in interest and pay off your debt {monthsSaved} months sooner.
                          </p>
                        </div>
                      </div>
                    )}
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
        <h2 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent">Understanding Credit Card Debt: The Real Cost of Convenience</h2>
        <p className="mt-3 text-muted-foreground text-lg">Discover how interest compounds, optimal repayment strategies, and paths to financial freedom</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-red-200 dark:border-red-900">
        <CardHeader className="bg-red-50 dark:bg-red-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-red-600 dark:text-red-400" />
            Understanding Credit Card Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-cc-calculator" className="text-2xl font-bold mb-4 text-red-700 dark:text-red-400">What is a Credit Card Calculator?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                A <strong>Credit Card Calculator</strong> is a powerful financial tool that reveals the true cost of credit card debt by showing how interest accumulates, how different payment strategies affect your timeline to debt freedom, and the real financial impact of minimum payments versus more aggressive repayment plans.
              </p>
              <p className="mt-2">
                These calculators help you understand:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>How long it will take to pay off your current balance</span>
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>The total interest you'll pay over the life of the debt</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>How increasing your monthly payment reduces both time and interest</span>
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>The impact of new purchases on your debt repayment plan</span>
                </li>
              </ul>
              <p>
                By bringing clarity to these often-overlooked aspects of credit card debt, these calculators transform abstract financial concepts into concrete numbers that can motivate better financial decisions.
              </p>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-red-100 to-rose-50 dark:from-red-900/60 dark:to-rose-900/60">
                  <CardTitle className="text-sm font-medium text-center">Minimum vs. Fixed Payment</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Bar 
                      data={{
                        labels: ['Payoff Time', 'Total Interest'],
                        datasets: [
                          {
                            label: 'Minimum Payment',
                            data: [19, 10941],
                            backgroundColor: 'rgba(239, 68, 68, 0.8)',
                          },
                          {
                            label: 'Fixed $300 Payment',
                            data: [3.5, 1517],
                            backgroundColor: 'rgba(16, 185, 129, 0.8)',
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
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw;
                                return label + ': ' + (context.dataIndex === 0 ? value + ' years' : '$' + value);
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                if (Number(value) >= 1000) return '$' + Number(value)/1000 + 'k';
                                return value;
                              }
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
          
          <h4 id="why-important" className="font-semibold text-xl mt-6">The Hidden Cost of Credit Card Debt</h4>
          <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">The Minimum Payment Trap</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Making only minimum payments on a $5,000 balance at 18.9% APR would take over 19 years to pay off and cost nearly $11,000 in interest</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Daily Interest Accrual</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Credit card interest typically compounds daily, not monthly, meaning you pay interest on previously accrued interest</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Average American Household</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Carries over $7,000 in revolving credit card debt with an average APR of 22.8% in 2025</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How Credit Card Interest Works */}
      <div className="mb-12" id="how-interest-works">
        <div className="flex items-center gap-2 mb-4">
          <Percent className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold">Understanding Credit Card Interest Calculations</h2>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-6 rounded-xl mb-6 border border-red-100 dark:border-red-800">
          <h3 id="compound-interest" className="font-bold text-xl mb-4">The Mechanics of Credit Card Interest</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="bg-red-50 dark:bg-red-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-red-600" />
                  Daily Compound Interest
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>
                  Unlike many other loans, credit card interest typically compounds <strong>daily</strong>, not monthly. This means interest is calculated on your balance every single day.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-red-100/50 dark:bg-red-900/50 rounded-md">
                    <p className="font-medium text-red-800 dark:text-red-300">The daily interest formula:</p>
                    <div className="mt-2 text-center">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Daily Rate = APR ÷ 365 days
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        Daily Interest = Balance × Daily Rate
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    For an 18.99% APR and $5,000 balance, you're paying approximately $2.60 in interest <i>every single day</i>.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="bg-red-50 dark:bg-red-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-red-600" />
                  Payment Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <p className="font-medium">How your payment is divided:</p>
                  <div className="h-[170px]">
                    <Pie 
                      data={{
                        labels: ['Interest', 'Principal'],
                        datasets: [
                          {
                            label: 'Minimum Payment Breakdown',
                            data: [79, 21],
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
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return context.label + ': ' + context.raw + '%';
                              }
                            }
                          },
                          datalabels: {
                            color: '#fff',
                            font: { weight: 'bold' },
                            formatter: (value) => value + '%'
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    Typical breakdown of a minimum payment on a $5,000 balance at 18.99% APR
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <h3 id="minimum-payments" className="font-bold text-xl mt-8 mb-4">The Problem with Minimum Payments</h3>
        
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <p>
                    Minimum payments are designed to keep you in debt for as long as possible, maximizing the interest you pay over time. Credit card companies typically set minimum payments at just 1-3% of your balance plus interest.
                  </p>
                  
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 my-4">
                    <p className="font-medium text-red-800 dark:text-red-300 mb-2">The Minimum Payment Formula:</p>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      Most commonly: 1% of balance + monthly interest + fees
                      <br />
                      Or a fixed minimum amount ($25-35), whichever is greater
                    </p>
                  </div>
                  
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">Reality Check</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          If you have a $5,000 balance at 18.99% APR and make only minimum payments (starting at about $125), it would take 19+ years to clear the debt and cost approximately $10,900 in interest alone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-[300px] flex-shrink-0">
                  <h4 className="text-center text-sm font-medium mb-3">Minimum Payment Payoff Timeline</h4>
                  <div className="h-[240px]">
                    <Line
                      data={{
                        labels: ['Start', 'Year 5', 'Year 10', 'Year 15', 'Year 19'],
                        datasets: [{
                          label: 'Remaining Balance',
                          data: [5000, 3924, 2596, 1142, 0],
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
                    $5,000 balance at 18.99% APR with minimum payments
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Strategies Section */}
      <div className="mb-12" id="payment-strategies">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
            <CardTitle>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Strategic Payment Approaches for Faster Debt Freedom</span>
              </div>
            </CardTitle>
            <CardDescription>
              Different approaches to accelerate your path out of credit card debt
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 id="fixed-payment" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Fixed Payment Strategy
                </h3>
                
                <p>
                  Rather than making the declining minimum payment, commit to a fixed monthly payment amount. This simple change dramatically accelerates your debt payoff timeline.
                </p>
                <div className="mt-4 h-[220px]">
                  <Line 
                    data={{
                      labels: ['0', '6', '12', '18', '24', '30', '36', '42'],
                      datasets: [
                        {
                          label: 'Minimum Payments',
                          data: [5000, 4692, 4337, 3932, 3473, 2958, 2383, 1745],
                          borderColor: 'rgba(239, 68, 68, 0.8)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          fill: true
                        },
                        {
                          label: 'Fixed $200 Payment',
                          data: [5000, 4064, 3051, 1956, 773, 0, null, null],
                          borderColor: 'rgba(16, 185, 129, 0.8)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          fill: true
                        },
                        {
                          label: 'Fixed $300 Payment',
                          data: [5000, 3518, 1906, 153, 0, null, null, null],
                          borderColor: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                  $5,000 balance at 18.99% APR with different payment approaches
                </p>
              </div>
              
              <div>
                <h3 id="snowball-avalanche" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Debt Snowball vs. Avalanche Methods
                </h3>
                <p className="mb-4">
                  When dealing with multiple credit cards, two popular repayment strategies can help you tackle your debt systematically.
                </p>
                <div className="space-y-4">
                  <Card className="border-green-200 dark:border-green-800">
                    <CardHeader className="py-3 bg-green-50 dark:bg-green-900/30">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">1</span>
                        Debt Snowball Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm">
                        Pay minimum payments on all debts, but put <strong>extra money toward your smallest balance first</strong>. Once paid off, roll that payment into the next smallest balance.
                      </p>
                      <div className="mt-3 p-3 bg-green-50/50 dark:bg-green-900/20 rounded-md">
                        <p className="text-xs text-green-800 dark:text-green-300">
                          <strong>Psychological Benefit:</strong> Quick wins create momentum and motivation by eliminating entire accounts faster.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardHeader className="py-3 bg-blue-50 dark:bg-blue-900/30">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
                        Debt Avalanche Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm">
                        Pay minimum payments on all debts, but put <strong>extra money toward your highest interest rate balance first</strong>. Once paid off, move to the next highest interest rate.
                      </p>
                      <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-md">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                          <strong>Financial Benefit:</strong> Mathematically optimal approach that minimizes total interest paid over time.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50/50 dark:bg-purple-900/20">
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    <strong>Pro Tip:</strong> The mathematically optimal method is the avalanche, but studies show that the psychological wins from the snowball method help many people stay motivated and actually complete their debt payoff journey.
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 id="real-examples" className="text-xl font-bold text-green-700 dark:text-green-400 mb-6">Payment Strategy Comparison</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Minimum Payment Only</CardTitle>
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
                              data: [10941],
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
                            y: {
                              stacked: true
                            }
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
                        <span className="font-medium">19 years, 2 months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Interest:</span>
                        <span className="font-medium text-red-600">$10,941</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Payments:</span>
                        <span className="font-medium">$15,941</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Fixed $200 Payment</CardTitle>
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
                              data: [2396],
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
                            y: {
                              stacked: true
                            }
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
                        <span className="font-medium">3 years, 1 month</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Interest:</span>
                        <span className="font-medium text-red-600">$2,396</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Payments:</span>
                        <span className="font-medium">$7,396</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Fixed $300 Payment</CardTitle>
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
                              data: [1517],
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
                            y: {
                              stacked: true
                            }
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
                        <span className="font-medium">1 year, 10 months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Interest:</span>
                        <span className="font-medium text-red-600">$1,517</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Payments:</span>
                        <span className="font-medium">$6,517</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Transfer and Strategy Section */}
      <div className="mb-12" id="balance-transfer">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <RefreshCw className="h-6 w-6 text-blue-600" />
          Balance Transfer Strategies and APR Considerations
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                Understanding Balance Transfers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  A balance transfer involves moving debt from a high-interest credit card to one with a lower interest rate, often with a promotional 0% APR period.
                </p>
                
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="text-center text-sm font-medium mb-3">Interest Savings with Balance Transfer</h4>
                  <div className="h-[180px]">
                    <Bar 
                      data={{
                        labels: ['Original Card (18.99%)', 'Balance Transfer (0% for 18 months)'],
                        datasets: [{
                          label: 'Interest Paid on $5,000 Balance',
                          data: [1634, 413],
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
                          datalabels: {
                            color: '#fff',
                            font: { weight: 'bold' },
                            formatter: (value) => '$' + value
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Assumes $5,000 balance paid off over 24 months with $250 monthly payment
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Key Considerations</p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                      <li>• Balance transfer fees (typically 3-5% of transferred amount)</li>
                      <li>• Length of promotional period (usually 12-21 months)</li>
                      <li>• Regular APR after promotion ends (often higher than average)</li>
                      <li>• Payment strategy during the 0% period</li>
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
                APR Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                The Annual Percentage Rate (APR) on your credit card dramatically impacts how long it takes to pay off your balance and how much you ultimately spend.
              </p>
              
              <div className="h-[220px]">
                <Line 
                  data={{
                    labels: ['0', '6', '12', '18', '24', '30', '36'],
                    datasets: [
                      {
                        label: '24.99% APR',
                        data: [5000, 4383, 3664, 2830, 1865, 755, 0],
                        borderColor: 'rgba(239, 68, 68, 0.8)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      },
                      {
                        label: '18.99% APR',
                        data: [5000, 4268, 3431, 2475, 1389, 160, 0],
                        borderColor: 'rgba(245, 158, 11, 0.8)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      },
                      {
                        label: '12.99% APR',
                        data: [5000, 4153, 3199, 2126, 923, 0, 0],
                        borderColor: 'rgba(16, 185, 129, 0.8)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
                    },
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } }
                    }
                  }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                $5,000 balance with $200 monthly payment at different APRs
              </p>
              
              <div className="mt-4 p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-md">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  <strong>Total Interest Comparison:</strong>
                </p>
                <ul className="mt-1 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                  <li>• 24.99% APR: $3,365 total interest</li>
                  <li>• 18.99% APR: $2,396 total interest</li>
                  <li>• 12.99% APR: $1,538 total interest</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-200 dark:border-blue-900 overflow-hidden mb-6">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Balance Transfer Decision Calculator
            </CardTitle>
            <CardDescription>
              Determine if a balance transfer makes financial sense
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-4 py-3 text-left">Scenario</th>
                    <th className="px-4 py-3 text-left">Balance</th>
                    <th className="px-4 py-3 text-left">APR</th>
                    <th className="px-4 py-3 text-left">Transfer Fee</th>
                    <th className="px-4 py-3 text-left">Monthly Payment</th>
                    <th className="px-4 py-3 text-left">Total Interest</th>
                    <th className="px-4 py-3 text-left">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="px-4 py-3 font-medium">Current Card</td>
                    <td className="px-4 py-3">$5,000</td>
                    <td className="px-4 py-3">18.99%</td>
                    <td className="px-4 py-3">N/A</td>
                    <td className="px-4 py-3">$250</td>
                    <td className="px-4 py-3 text-red-600">$1,634</td>
                    <td className="px-4 py-3">—</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                    <td className="px-4 py-3 font-medium">0% for 12 months (3% fee)</td>
                    <td className="px-4 py-3">$5,150</td>
                    <td className="px-4 py-3">0%, then 19.99%</td>
                    <td className="px-4 py-3">$150</td>
                    <td className="px-4 py-3">$250</td>
                    <td className="px-4 py-3 text-red-600">$458 + $150</td>
                    <td className="px-4 py-3 text-green-600">$1,026</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">0% for 18 months (4% fee)</td>
                    <td className="px-4 py-3">$5,200</td>
                    <td className="px-4 py-3">0%, then 21.99%</td>
                    <td className="px-4 py-3">$200</td>
                    <td className="px-4 py-3">$250</td>
                    <td className="px-4 py-3 text-red-600">$213 + $200</td>
                    <td className="px-4 py-3 text-green-600">$1,221</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                    <td className="px-4 py-3 font-medium">11.99% (No fee)</td>
                    <td className="px-4 py-3">$5,000</td>
                    <td className="px-4 py-3">11.99%</td>
                    <td className="px-4 py-3">$0</td>
                    <td className="px-4 py-3">$250</td>
                    <td className="px-4 py-3 text-red-600">$943</td>
                    <td className="px-4 py-3 text-green-600">$691</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Calculations assume consistent monthly payments until balance is paid in full
            </p>
          </CardContent>
        </Card>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Balance Transfer Best Practices</p>
              <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-400">
                <li>• Calculate the complete cost including transfer fees before deciding</li>
                <li>• Create a payoff plan that eliminates the balance before the promotional period ends</li>
                <li>• Avoid new purchases on the balance transfer card</li>
                <li>• Continue making payments on the original card until transfer completion is confirmed</li>
                <li>• Don't close the old card immediately (may impact credit utilization ratio)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Common Pitfalls and Advanced Tips */}
      <div className="mb-12" id="pitfalls-tips">
        <Card className="overflow-hidden border-purple-200 dark:border-purple-900">
          <CardHeader className="bg-purple-50 dark:bg-purple-900/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              Common Credit Card Pitfalls to Avoid
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-300">Making Only Minimum Payments</p>
                    <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                      This strategy maximizes the interest you pay and keeps you in debt for decades. Always pay more than the minimum whenever possible.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-300">Cash Advances</p>
                    <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                      These typically carry higher interest rates (often 24%+), begin accruing interest immediately, and come with additional fees of 3-5%.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-300">Adding New Debt While Repaying</p>
                    <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                      Continuing to use credit cards while trying to pay down balances creates a "two steps forward, one step back" situation that extends your debt timeline.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-300">Missing the Grace Period</p>
                    <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                      When carrying a balance, you lose the grace period on new purchases, meaning they begin accruing interest immediately from the date of purchase.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-300">Ignoring Balance Transfer Fees</p>
                    <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                      These can add 3-5% to your balance immediately. Always calculate whether the interest savings will exceed the transfer fee.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-300">Late Payments</p>
                    <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                      Beyond late fees ($29-$40), one late payment can trigger penalty APRs of 29.99% or higher on your entire balance, dramatically increasing interest costs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 id="advanced-strategies" className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-8 mb-4">Advanced Debt Elimination Strategies</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Debt Consolidation Loan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm">
                    Consider a personal loan with a lower fixed interest rate to pay off multiple credit cards. This simplifies your payments and often reduces interest rates.
                  </p>
                  <div className="mt-4 h-[160px]">
                    <Bar 
                      data={{
                        labels: ['Credit Cards (Avg 19.99%)', 'Personal Loan (8.99%)'],
                        datasets: [{
                          label: 'Interest Paid on $15,000 Over 3 Years',
                          data: [5108, 2168],
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
                        plugins: {
                          legend: { display: false },
                          datalabels: {
                            color: '#fff',
                            font: { weight: 'bold' },
                            formatter: (value) => '$' + value
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: { callback: value => '$' + value }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Bi-Weekly Payment Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm">
                    Instead of one monthly payment, split it in half and pay every two weeks. This results in 26 half-payments per year (equivalent to 13 full monthly payments).
                  </p>
                  <div className="mt-4 h-[160px]">
                    <Line 
                      data={{
                        labels: ['0', '4', '8', '12', '16', '20', '24', '28', '32', '36'],
                        datasets: [
                          {
                            label: 'Monthly Payments',
                            data: [5000, 4268, 3431, 2475, 1389, 160, 0, null, null, null],
                            borderColor: 'rgba(239, 68, 68, 0.8)',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          },
                          {
                            label: 'Bi-Weekly Payments',
                            data: [5000, 4042, 2952, 1716, 322, 0, null, null, null, null],
                            borderColor: 'rgba(16, 185, 129, 0.8)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } }
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Months'
                            }
                          },
                          y: {
                            beginAtZero: true,
                            ticks: { callback: value => '$' + value }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conclusion Section */}
      <div className="mb-6" id="conclusion">
        <Card className="overflow-hidden border-red-200 dark:border-red-900">
          <CardHeader className="bg-gradient-to-r from-red-100 to-rose-50 dark:from-red-900/40 dark:to-rose-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-red-700 dark:text-red-400" />
              Taking Control of Your Credit Card Debt
            </CardTitle>
            <CardDescription>
              Turn financial knowledge into action for lasting financial freedom
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Credit card calculators</strong> provide the financial clarity needed to develop effective debt repayment strategies. By understanding how interest compounds, how different payment amounts affect your timeline, and the true cost of minimum payments, you gain the power to make decisions that can save thousands of dollars and years of financial stress.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Key actions to implement today:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-100 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Immediate Steps</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-700 text-xs font-bold dark:bg-red-900 dark:text-red-300">1</span>
                    <span className="text-red-800 dark:text-red-300">Calculate your total credit card debt and interest rates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-700 text-xs font-bold dark:bg-red-900 dark:text-red-300">2</span>
                    <span className="text-red-800 dark:text-red-300">Set a fixed payment amount significantly above the minimum</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-700 text-xs font-bold dark:bg-red-900 dark:text-red-300">3</span>
                    <span className="text-red-800 dark:text-red-300">Stop using cards while paying down balances</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Long-Term Strategy</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                    <span className="text-green-800 dark:text-green-300">Choose either debt snowball or avalanche method</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                    <span className="text-green-800 dark:text-green-300">Explore balance transfer opportunities strategically</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                    <span className="text-green-800 dark:text-green-300">Build an emergency fund to avoid future card dependence</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 rounded-lg border border-red-100 dark:border-red-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-medium text-lg text-red-800 dark:text-red-300">Ready to calculate your path to debt freedom?</p>
                  <p className="mt-1 text-red-700 dark:text-red-400">
                    Use our <strong>Credit Card Calculator</strong> above to create your personalized debt payoff plan! For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/debt-payoff">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Debt Payoff Calculator
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
      </main>
      <SiteFooter />
    </div>
  )
}