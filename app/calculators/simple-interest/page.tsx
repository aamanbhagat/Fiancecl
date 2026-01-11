"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { SaveCalculationButton } from "@/components/save-calculation-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Download, Info, DollarSign, Percent, Clock, TrendingUp, BarChart3, Share2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import SimpleInterestSchema from './schema';

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

export default function SimpleInterestCalculator() {
  // State for calculator inputs
  const [principal, setPrincipal] = useState(10000)
  const [rate, setRate] = useState(5)
  const [time, setTime] = useState(3)
  
  // State for calculator outputs
  const [interest, setInterest] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<{ month: number; interest: number; total: number }[]>([])

  // Calculate results
  useEffect(() => {
    const calculatedInterest = (principal * (rate / 100) * time)
    const calculatedTotal = principal + calculatedInterest
    
    setInterest(calculatedInterest)
    setTotalAmount(calculatedTotal)
    
    // Calculate monthly breakdown
    const monthlyData = Array.from({ length: time * 12 }, (_, index) => {
      const yearFraction = (index + 1) / 12
      const monthlyInterest = (principal * (rate / 100) * yearFraction)
      return {
        month: index + 1,
        interest: monthlyInterest,
        total: principal + monthlyInterest
      }
    })
    
    setMonthlyBreakdown(monthlyData)
  }, [principal, rate, time])

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
    labels: ['Principal', 'Interest'],
    datasets: [
      {
        label: 'Amount',
        data: [principal, interest],
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
        label: 'Total Amount',
        data: monthlyBreakdown.map(item => item.total),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      },
      {
        label: 'Interest Accrued',
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
          callback: (value: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value)
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
    pdf.save('simple-interest-calculation.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <SimpleInterestSchema /> 
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Simple Interest <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate interest earned or paid based on principal, rate, and time using the simple interest formula.
      </p>
    </div>
  </div>
</section>


        {/* Calculator Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container max-w-[1200px] mx-auto">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Input Card */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Your Values</CardTitle>
                    <CardDescription>
                      Provide the principal amount, interest rate, and time period to calculate simple interest.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Principal Amount */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="principal">Principal Amount</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              The initial amount of money being invested or borrowed
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
                          max={20}
                          step={0.1}
                          value={[rate]}
                          onValueChange={(value) => setRate(value[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>20%</span>
                        </div>
                      </div>
                    </div>

                    {/* Time Period */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="time">Time Period (Years)</Label>
                        <span className="text-sm text-muted-foreground">{time} years</span>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          id="time"
                          min={1}
                          max={30}
                          step={1}
                          value={[time]}
                          onValueChange={(value) => setTime(value[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1 year</span>
                          <span>30 years</span>
                        </div>
                      </div>
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
                          <CardTitle className="text-sm font-medium">Total Interest</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-primary">{formatCurrency(interest)}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</div>
                        </CardContent>
                      </Card>
                    </div>

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
                  
                  <SaveCalculationButton
                    calculatorType="simple-interest"
                    inputs={{
                      principal,
                      rate,
                      time
                    }}
                    results={{
                      interest,
                      totalAmount,
                      monthlyBreakdown
                    }}
                  />
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Formula Section */}
        <section className="py-12 bg-muted/50">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Understanding Simple Interest</h2>
              <p className="text-muted-foreground">
                Simple interest is calculated on the principal amount only, unlike compound interest which is calculated on the principal and accumulated interest.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Simple Interest Formula
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-center font-mono">I = P × r × t</p>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><strong>I</strong> = Interest</li>
                      <li><strong>P</strong> = Principal amount</li>
                      <li><strong>r</strong> = Annual interest rate (as decimal)</li>
                      <li><strong>t</strong> = Time in years</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Total Amount Formula
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-center font-mono">A = P + I</p>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><strong>A</strong> = Total amount</li>
                      <li><strong>P</strong> = Principal amount</li>
                      <li><strong>I</strong> = Interest earned</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8">Understanding Simple Interest: A Comprehensive Guide</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h3 className="text-2xl font-semibold mb-4">What is Simple Interest?</h3>
              <p className="text-muted-foreground mb-6">
                Simple interest is the most basic form of interest calculation used in finance. It represents the cost of borrowing money or the earnings from lending money, calculated as a percentage of the initial amount (principal) over a specific period.
              </p>

              <h3 className="text-2xl font-semibold mb-4">How Simple Interest Works</h3>
              <p className="text-muted-foreground mb-6">
                Unlike compound interest, simple interest is calculated solely on the principal amount. This means that even as interest accumulates, it doesn't earn additional interest. This makes simple interest particularly relevant for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6">
                <li>Short-term loans and investments</li>
                <li>Basic savings accounts</li>
                <li>Consumer loans in some countries</li>
                <li>Some types of bonds</li>
              </ul>

              <h3 className="text-2xl font-semibold mb-4">Real-World Applications</h3>
              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Lending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Used in personal loans, short-term business loans, and some mortgages. Borrowers can easily understand their total repayment obligations.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Investing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Common in bonds, fixed deposits, and some savings accounts. Investors can predict their returns with certainty.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-2xl font-semibold mb-4">Advantages and Limitations</h3>
              <div className="grid gap-6 mb-8">
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Advantages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 text-muted-foreground">
                      <li>Easy to calculate and understand</li>
                      <li>Predictable interest payments</li>
                      <li>Lower total interest compared to compound interest</li>
                      <li>Transparent for both lenders and borrowers</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Limitations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-6 text-muted-foreground">
                      <li>Doesn't account for the time value of money</li>
                      <li>Less profitable for long-term investments</li>
                      <li>May not reflect real-world interest accumulation accurately</li>
                      <li>Not commonly used for long-term financial products</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-2xl font-semibold mb-4">Tips for Using Simple Interest</h3>
              <div className="space-y-4 mb-8">
                <Card className="bg-muted/50">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">1. Compare with Compound Interest</h4>
                    <p className="text-muted-foreground">
                      Always compare simple interest with compound interest options, especially for longer-term investments or loans.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">2. Consider the Time Period</h4>
                    <p className="text-muted-foreground">
                      Simple interest is most beneficial for short-term financial arrangements. For longer periods, compound interest might be more appropriate.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">3. Check Interest Rate Terms</h4>
                    <p className="text-muted-foreground">
                      Verify whether the interest rate is quoted annually or for a different period, as this affects your calculations.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">4. Use Calculators Wisely</h4>
                    <p className="text-muted-foreground">
                      Utilize simple interest calculators to quickly compare different scenarios and make informed decisions.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-2xl font-semibold mb-4">Common Misconceptions</h3>
              <div className="space-y-4 mb-8">
                <p className="text-muted-foreground">
                  Many people confuse simple interest with compound interest or assume all loans use the same interest calculation method. Here are some key points to remember:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Simple interest doesn't "grow on itself" like compound interest</li>
                  <li>The interest rate might be the same, but the calculation method makes a big difference</li>
                  <li>Lower interest rates with compound interest might cost more than higher rates with simple interest</li>
                  <li>Simple interest is not always the simpler or better choice</li>
                </ul>
              </div>

              <h3 className="text-2xl font-semibold mb-4">Conclusion</h3>
              <p className="text-muted-foreground mb-6">
                Understanding simple interest is fundamental to making informed financial decisions. While it may seem basic compared to other interest calculations, its straightforward nature makes it valuable for specific financial situations. Use our calculator above to explore different scenarios and make better-informed financial decisions.
              </p>
            </div>
          </div>
        </section>

        {/* Related Calculators */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <h2 className="text-2xl font-bold text-center mb-8">Related Calculators</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Compound Interest Calculator</CardTitle>
                  <CardDescription>Calculate interest on both principal and accumulated interest.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/compound-interest">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Savings Calculator</CardTitle>
                  <CardDescription>Plan your savings with regular deposits and interest earnings.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/savings">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Investment Calculator</CardTitle>
                  <CardDescription>Project investment growth with different scenarios.</CardDescription>
                </CardHeader>
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