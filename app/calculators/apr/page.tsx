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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Download } from "lucide-react"
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Scale, ScaleOptionsByType, CartesianScaleTypeRegistry } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie, Bar } from "react-chartjs-2"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import APRSchema from './schema';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartDataLabels
)

export default function APRCalculatorPage() {
  // Basic loan details
  const [loanAmount, setLoanAmount] = useState(250000)
  const [interestRate, setInterestRate] = useState(6.5)
  const [loanTerm, setLoanTerm] = useState(360) // 30 years in months

  // Additional fees
  const [originationFee, setOriginationFee] = useState(2500)
  const [applicationFee, setApplicationFee] = useState(500)
  const [insuranceFee, setInsuranceFee] = useState(1200)
  const [otherFees, setOtherFees] = useState(800)
  const [includeMonthlyFees, setIncludeMonthlyFees] = useState(false)
  const [monthlyServiceFee, setMonthlyServiceFee] = useState(25)

  // Results
  const [apr, setApr] = useState(0)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalFees, setTotalFees] = useState(0)

  // Calculate APR and other metrics
  useEffect(() => {
    // Calculate base monthly payment using the nominal interest rate
    const monthlyRate = interestRate / 100 / 12
    const baseMonthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
      (Math.pow(1 + monthlyRate, loanTerm) - 1)

    // Calculate total fees
    const upfrontFees = originationFee + applicationFee + insuranceFee + otherFees
    const monthlyFees = includeMonthlyFees ? monthlyServiceFee * loanTerm : 0
    const totalFeesAmount = upfrontFees + monthlyFees

    // Calculate total interest
    const totalPayments = baseMonthlyPayment * loanTerm
    const totalInterestAmount = totalPayments - loanAmount

    // Calculate APR using iterative method
    let aprGuess = interestRate
    let step = 0.01
    let bestApr = aprGuess
    let minDiff = Number.MAX_VALUE

    for (let i = 0; i < 1000; i++) {
      const guessRate = aprGuess / 100 / 12
      const guessPayment = ((loanAmount - upfrontFees) * guessRate * Math.pow(1 + guessRate, loanTerm)) / 
        (Math.pow(1 + guessRate, loanTerm) - 1)
      
      const presentValue = upfrontFees + 
        [...Array(loanTerm)].reduce((sum, _, index) => {
          return sum + guessPayment / Math.pow(1 + guessRate, index + 1)
        }, 0)

      const diff = Math.abs(loanAmount - presentValue)

      if (diff < minDiff) {
        minDiff = diff
        bestApr = aprGuess
      }

      aprGuess += step
    }

    // Update state with calculated values
    setApr(bestApr)
    setMonthlyPayment(baseMonthlyPayment + (includeMonthlyFees ? monthlyServiceFee : 0))
    setTotalInterest(totalInterestAmount)
    setTotalFees(totalFeesAmount)
    setTotalCost(loanAmount + totalInterestAmount + totalFeesAmount)
  }, [
    loanAmount,
    interestRate,
    loanTerm,
    originationFee,
    applicationFee,
    insuranceFee,
    otherFees,
    includeMonthlyFees,
    monthlyServiceFee
  ])

  // Chart data for cost breakdown
  const pieChartData = {
    labels: ['Principal', 'Interest', 'Fees'],
    datasets: [{
      data: [loanAmount, totalInterest, totalFees],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(20, 184, 166, 0.8)'
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(14, 165, 233, 1)',
        'rgba(20, 184, 166, 1)'
      ],
      borderWidth: 1
    }]
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold' as const
        },
        formatter: (value: number) => {
          return ((value / totalCost) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Generate monthly payment data for bar chart
  const generateMonthlyData = () => {
    const monthlyPrincipalAndInterest = monthlyPayment - (includeMonthlyFees ? monthlyServiceFee : 0)
    const monthlyInterest = (loanAmount * (interestRate / 100 / 12))
    const monthlyPrincipal = monthlyPrincipalAndInterest - monthlyInterest
    const monthlyFee = includeMonthlyFees ? monthlyServiceFee : 0

    return {
      labels: ['Monthly Payment Breakdown'],
      datasets: [
        {
          label: 'Principal',
          data: [monthlyPrincipal],
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1
        },
        {
          label: 'Interest',
          data: [monthlyInterest],
          backgroundColor: 'rgba(14, 165, 233, 0.8)',
          borderColor: 'rgba(14, 165, 233, 1)',
          borderWidth: 1
        },
        {
          label: 'Monthly Fee',
          data: [monthlyFee],
          backgroundColor: 'rgba(20, 184, 166, 0.8)',
          borderColor: 'rgba(20, 184, 166, 1)',
          borderWidth: 1
        }
      ]
    }
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          callback: function(tickValue: string | number, index: number, ticks: any[]) {
            return '$' + Number(tickValue).toLocaleString()
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
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
    pdf.save('apr-calculation-results.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <APRSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl animate-text-glow">
        Annual Percentage Rate <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Calculate the true cost of borrowing by including all fees and charges in your APR calculation.
      </p>
    </div>
  </div>
</section>

        {/* Calculator Section */}
        <section className="py-12 px-4 sm:px-6 md:px-8">
          <div className="container max-w-[1400px] mx-auto">
            <div className="grid gap-8 lg:grid-cols-3 items-start">
              {/* Input Form */}
              <div className="lg:col-span-2 w-full max-w-3xl mx-auto lg:max-w-none">
                <Card className="w-full">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl">Enter Loan Details</CardTitle>
                    <CardDescription className="text-base">
                      Provide your loan information and additional fees to calculate the APR.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Basic Loan Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Loan Information</h3>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="loan-amount" className="text-sm font-medium">Loan Amount</Label>
                          <Input
                            id="loan-amount"
                            type="number"
                            value={loanAmount || ''} onChange={(e) => setLoanAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                            min={0}
                            className="text-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interest-rate" className="text-sm font-medium">Interest Rate (%)</Label>
                            <span className="text-sm font-medium text-muted-foreground">{interestRate}%</span>
                          </div>
                          <Slider
                            id="interest-rate"
                            min={0}
                            max={30}
                            step={0.1}
                            value={[interestRate]}
                            onValueChange={(value) => setInterestRate(value[0])}
                            className="py-4"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="loan-term" className="text-sm font-medium">Loan Term (Months)</Label>
                          <Input
                            id="loan-term"
                            type="number"
                            value={loanTerm || ''} onChange={(e) => setLoanTerm(e.target.value === '' ? 0 : Number(e.target.value))}
                            min={1}
                            className="text-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fees Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Fees</h3>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="origination-fee" className="text-sm font-medium">Origination Fee</Label>
                          <Input
                            id="origination-fee"
                            type="number"
                            value={originationFee || ''} onChange={(e) => setOriginationFee(e.target.value === '' ? 0 : Number(e.target.value))}
                            min={0}
                            className="text-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="application-fee" className="text-sm font-medium">Application Fee</Label>
                          <Input
                            id="application-fee"
                            type="number"
                            value={applicationFee || ''} onChange={(e) => setApplicationFee(e.target.value === '' ? 0 : Number(e.target.value))}
                            min={0}
                            className="text-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="insurance-fee" className="text-sm font-medium">Insurance Fee</Label>
                          <Input
                            id="insurance-fee"
                            type="number"
                            value={insuranceFee || ''} onChange={(e) => setInsuranceFee(e.target.value === '' ? 0 : Number(e.target.value))}
                            min={0}
                            className="text-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="other-fees" className="text-sm font-medium">Other Fees</Label>
                          <Input
                            id="other-fees"
                            type="number"
                            value={otherFees || ''} onChange={(e) => setOtherFees(e.target.value === '' ? 0 : Number(e.target.value))}
                            min={0}
                            className="text-lg"
                          />
                        </div>
                        <div className="space-y-4 sm:col-span-2">
                          <div className="flex items-center justify-between space-x-4">
                            <Label htmlFor="monthly-fees" className="text-sm font-medium">Include Monthly Service Fee</Label>
                            <Switch
                              id="monthly-fees"
                              checked={includeMonthlyFees}
                              onCheckedChange={setIncludeMonthlyFees}
                            />
                          </div>
                          {includeMonthlyFees && (
                            <div className="space-y-2">
                              <Label htmlFor="monthly-service-fee" className="text-sm font-medium">Monthly Service Fee Amount</Label>
                              <Input
                                id="monthly-service-fee"
                                type="number"
                                value={monthlyServiceFee || ''} onChange={(e) => setMonthlyServiceFee(e.target.value === '' ? 0 : Number(e.target.value))}
                                min={0}
                                className="text-lg"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              <div id="results-section" className="space-y-6 w-full max-w-3xl mx-auto lg:max-w-none lg:sticky lg:top-24">
                <Card className="w-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">Results</CardTitle>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={exportPDF}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Export as PDF
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2 text-center p-6 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">Annual Percentage Rate (APR)</p>
                      <p className="text-5xl font-bold text-primary">
                        {apr.toFixed(2)}%
                      </p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Cost</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px] sm:h-[400px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-lg">Cost Breakdown</h4>
                          <div className="grid gap-3">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                              <span className="text-sm font-medium">Principal Amount</span>
                              <span className="font-semibold">{formatCurrency(loanAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                              <span className="text-sm font-medium">Total Interest</span>
                              <span className="font-semibold">{formatCurrency(totalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                              <span className="text-sm font-medium">Total Fees</span>
                              <span className="font-semibold">{formatCurrency(totalFees)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Cost</span>
                              <span>{formatCurrency(totalCost)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="monthly" className="space-y-4">
                        <div className="h-[300px] sm:h-[400px]">
                          <Bar data={generateMonthlyData()} options={barChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Monthly payment breakdown over the loan term
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Monthly Payment</span>
                            <span className="font-semibold">{formatCurrency(monthlyPayment)}</span>
                          </div>
                          {includeMonthlyFees && (
                            <div className="flex justify-between items-center pt-2 border-t border-border/50">
                              <span className="text-sm font-medium">+ Monthly Service Fee</span>
                              <span className="font-semibold">{formatCurrency(monthlyServiceFee)}</span>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="details" className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-lg">Loan Details</h4>
                          <div className="grid gap-3">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                              <span className="text-sm font-medium">Nominal Interest Rate</span>
                              <span className="font-semibold">{interestRate}%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                              <span className="text-sm font-medium">Loan Term</span>
                              <span className="font-semibold">{loanTerm} months</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                              <span className="text-sm font-medium">Total Upfront Fees</span>
                              <span className="font-semibold">{formatCurrency(originationFee + applicationFee + insuranceFee + otherFees)}</span>
                            </div>
                            {includeMonthlyFees && (
                              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                                <span className="text-sm font-medium">Total Monthly Fees</span>
                                <span className="font-semibold">{formatCurrency(monthlyServiceFee * loanTerm)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 font-semibold">
                              <span>APR</span>
                              <span>{apr.toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Understanding APR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The Annual Percentage Rate (APR) represents the true cost of borrowing, including both the interest rate and additional fees. A higher APR indicates a more expensive loan, even if the nominal interest rate is low.
                    </p>
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