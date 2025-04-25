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
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Percent, Clock, Wallet } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import BondSchema from './schema';

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

export default function BondCalculator() {
  // Basic Bond Details
  const [faceValue, setFaceValue] = useState<number>(1000)
  const [couponRate, setCouponRate] = useState<number>(5)
  const [paymentFrequency, setPaymentFrequency] = useState<string>("semi-annual")
  const [timeToMaturity, setTimeToMaturity] = useState<number>(10)
  const [marketPrice, setMarketPrice] = useState<number>(1000)
  
  // Yield & Discounting
  const [yieldToMaturity, setYieldToMaturity] = useState<number>(5)
  const [discountRate, setDiscountRate] = useState<number>(5)
  
  // Advanced Options
  const [inflationRate, setInflationRate] = useState<number>(2)
  const [taxRate, setTaxRate] = useState<number>(25)
  const [isCallable, setIsCallable] = useState<boolean>(false)
  const [callPrice, setCallPrice] = useState<number>(1050)
  const [callDate, setCallDate] = useState<number>(5)
  const [isConvertible, setIsConvertible] = useState<boolean>(false)
  const [conversionRatio, setConversionRatio] = useState<number>(20)
  const [stockPrice, setStockPrice] = useState<number>(50)

  // Results State
  const [bondPrice, setBondPrice] = useState<number>(0)
  const [currentYield, setCurrentYield] = useState<number>(0)
  const [yieldToCall, setYieldToCall] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [modifiedDuration, setModifiedDuration] = useState<number>(0)
  const [convexity, setConvexity] = useState<number>(0)
  const [totalReturn, setTotalReturn] = useState<number>(0)
  const [cashFlows, setCashFlows] = useState<{
    date: number;
    payment: number;
    presentValue: number;
  }[]>([])

  // Calculate bond metrics
  useEffect(() => {
    const paymentsPerYear = {
      'annual': 1,
      'semi-annual': 2,
      'quarterly': 4,
      'monthly': 12
    }[paymentFrequency] || 2

    const periodicRate = couponRate / 100 / paymentsPerYear
    const periodicDiscount = discountRate / 100 / paymentsPerYear
    const totalPeriods = timeToMaturity * paymentsPerYear
    const couponPayment = faceValue * periodicRate

    let flows = []
    let totalPV = 0
    let weightedTime = 0
    let weightedTimeSquared = 0

    for (let t = 1; t <= totalPeriods; t++) {
      const payment = t === totalPeriods ? couponPayment + faceValue : couponPayment
      const presentValue = payment / Math.pow(1 + periodicDiscount, t)
      totalPV += presentValue
      weightedTime += (t / paymentsPerYear) * presentValue
      weightedTimeSquared += (t / paymentsPerYear) * (t / paymentsPerYear) * presentValue
      
      flows.push({
        date: t / paymentsPerYear,
        payment,
        presentValue
      })
    }

    const calculatedPrice = totalPV
    const calculatedCurrentYield = (couponRate / (marketPrice / faceValue * 100)) * 100
    const calculatedDuration = weightedTime / calculatedPrice
    const calculatedModifiedDuration = calculatedDuration / (1 + periodicDiscount)
    const calculatedConvexity = weightedTimeSquared / (calculatedPrice * Math.pow(1 + periodicDiscount, 2))

    let calculatedYTC = 0
    if (isCallable) {
      const callPeriods = callDate * paymentsPerYear
      const callFlows = flows.slice(0, callPeriods)
      callFlows[callFlows.length - 1].payment += callPrice
      
      const callPV = callFlows.reduce((sum, flow) => 
        sum + flow.payment / Math.pow(1 + periodicDiscount, flow.date * paymentsPerYear), 0
      )
      calculatedYTC = ((callPrice - marketPrice) / marketPrice + couponRate) / callDate * 100
    }

    setBondPrice(calculatedPrice)
    setCurrentYield(calculatedCurrentYield)
    setYieldToCall(calculatedYTC)
    setDuration(calculatedDuration)
    setModifiedDuration(calculatedModifiedDuration)
    setConvexity(calculatedConvexity)
    setCashFlows(flows)

    const reinvestmentReturn = flows.reduce((sum, flow, index) => {
      const remainingYears = timeToMaturity - flow.date
      return sum + flow.payment * Math.pow(1 + yieldToMaturity / 100, remainingYears)
    }, 0)
    
    setTotalReturn(((reinvestmentReturn - marketPrice) / marketPrice) * 100)
  }, [
    faceValue,
    couponRate,
    paymentFrequency,
    timeToMaturity,
    marketPrice,
    discountRate,
    yieldToMaturity,
    isCallable,
    callPrice,
    callDate
  ])

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

  const cashFlowChartData = {
    labels: cashFlows.map(flow => `Year ${flow.date.toFixed(1)}`),
    datasets: [
      {
        label: 'Cash Flow',
        data: cashFlows.map(flow => flow.payment),
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Present Value',
        data: cashFlows.map(flow => flow.presentValue),
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const cashFlowChartOptions: ChartOptions<'bar'> = {
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

  const generatePriceSensitivityData = () => {
    const yieldRange = Array.from({ length: 11 }, (_, i) => yieldToMaturity - 2.5 + i * 0.5)
    const prices = yieldRange.map(yield_ => {
      const periodicYield = yield_ / 100 / 2
      const periods = timeToMaturity * 2
      const couponPayment = faceValue * (couponRate / 100 / 2)
      
      let price = 0
      for (let t = 1; t <= periods; t++) {
        const payment = t === periods ? couponPayment + faceValue : couponPayment
        price += payment / Math.pow(1 + periodicYield, t)
      }
      return price
    })

    return {
      labels: yieldRange.map(y => y.toFixed(1) + '%'),
      datasets: [
        {
          label: 'Bond Price',
          data: prices,
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        }
      ]
    }
  }

  const sensitivityChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
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
      maximumFractionDigits: 2
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
    pdf.save('bond-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <BondSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Bond <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate bond prices, yields, duration, and analyze investment returns with our comprehensive bond calculator.
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
                    <CardTitle>Enter Bond Details</CardTitle>
                    <CardDescription>
                      Provide information about the bond to calculate its metrics and analyze performance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Bond Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="face-value">Face Value (Par Value)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="face-value"
                              type="number"
                              className="pl-9"
                              value={faceValue}
                              onChange={(e) => setFaceValue(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="coupon-rate">Coupon Rate</Label>
                            <span className="text-sm text-muted-foreground">{couponRate}%</span>
                          </div>
                          <Slider
                            id="coupon-rate"
                            min={0}
                            max={15}
                            step={0.125}
                            value={[couponRate]}
                            onValueChange={(value) => setCouponRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-frequency">Payment Frequency</Label>
                          <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                            <SelectTrigger id="payment-frequency">
                              <SelectValue placeholder="Select payment frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="annual">Annual</SelectItem>
                              <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time-to-maturity">Time to Maturity (Years)</Label>
                          <Input
                            id="time-to-maturity"
                            type="number"
                            value={timeToMaturity}
                            onChange={(e) => setTimeToMaturity(Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="market-price">Market Price</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="market-price"
                              type="number"
                              className="pl-9"
                              value={marketPrice}
                              onChange={(e) => setMarketPrice(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Yield & Discounting</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="discount-rate">Discount Rate</Label>
                            <span className="text-sm text-muted-foreground">{discountRate}%</span>
                          </div>
                          <Slider
                            id="discount-rate"
                            min={0}
                            max={15}
                            step={0.125}
                            value={[discountRate]}
                            onValueChange={(value) => setDiscountRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="inflation-rate">Inflation Rate</Label>
                            <span className="text-sm text-muted-foreground">{inflationRate}%</span>
                          </div>
                          <Slider
                            id="inflation-rate"
                            min={0}
                            max={10}
                            step={0.1}
                            value={[inflationRate]}
                            onValueChange={(value) => setInflationRate(value[0])}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Advanced Options</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="tax-rate">Tax Rate</Label>
                            <span className="text-sm text-muted-foreground">{taxRate}%</span>
                          </div>
                          <Slider
                            id="tax-rate"
                            min={0}
                            max={50}
                            step={1}
                            value={[taxRate]}
                            onValueChange={(value) => setTaxRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="callable">Callable Bond</Label>
                            <Switch
                              id="callable"
                              checked={isCallable}
                              onCheckedChange={setIsCallable}
                            />
                          </div>
                          {isCallable && (
                            <div className="space-y-2">
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="call-price"
                                  type="number"
                                  className="pl-9"
                                  placeholder="Call Price"
                                  value={callPrice}
                                  onChange={(e) => setCallPrice(Number(e.target.value))}
                                />
                              </div>
                              <Input
                                id="call-date"
                                type="number"
                                placeholder="Years to Call"
                                value={callDate}
                                onChange={(e) => setCallDate(Number(e.target.value))}
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="convertible">Convertible Bond</Label>
                            <Switch
                              id="convertible"
                              checked={isConvertible}
                              onCheckedChange={setIsConvertible}
                            />
                          </div>
                          {isConvertible && (
                            <div className="space-y-2">
                              <Input
                                id="conversion-ratio"
                                type="number"
                                placeholder="Conversion Ratio"
                                value={conversionRatio}
                                onChange={(e) => setConversionRatio(Number(e.target.value))}
                              />
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="stock-price"
                                  type="number"
                                  className="pl-9"
                                  placeholder="Stock Price"
                                  value={stockPrice}
                                  onChange={(e) => setStockPrice(Number(e.target.value))}
                                />
                              </div>
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
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-muted-foreground">Bond Price</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(bondPrice)}</p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="metrics" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="metrics">Metrics</TabsTrigger>
                        <TabsTrigger value="cashflows">Cash Flows</TabsTrigger>
                        <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
                      </TabsList>

                      <TabsContent value="metrics" className="space-y-4">
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">Current Yield</span>
                            <span className="font-medium">{formatPercent(currentYield)}</span>
                          </div>
                          {isCallable && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Yield to Call</span>
                              <span className="font-medium">{formatPercent(yieldToCall)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">Duration</span>
                            <span className="font-medium">{duration.toFixed(2)} years</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">Modified Duration</span>
                            <span className="font-medium">{modifiedDuration.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">Convexity</span>
                            <span className="font-medium">{convexity.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                            <span>Total Return</span>
                            <span>{formatPercent(totalReturn)}</span>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="cashflows" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={cashFlowChartData} options={cashFlowChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Cash flows and their present values over time
                        </div>
                      </TabsContent>

                      <TabsContent value="sensitivity" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generatePriceSensitivityData()} options={sensitivityChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Bond price sensitivity to yield changes
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Risk Assessment</p>
                            <p className="text-sm text-muted-foreground">
                              {`A 1% increase in interest rates would result in a ${formatPercent(modifiedDuration)} decrease in bond price. The bond's convexity of ${convexity.toFixed(2)} indicates its price sensitivity to large rate changes.`}
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
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Financial Resource</span>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Master the Art of Bond Investing: Your Complete Guide</h2>
                <p className="mt-3 text-muted-foreground text-lg">Everything you need to know about bond valuation and investment strategies</p>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* Introduction Section */}
              <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
                  <CardTitle id="introduction" className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Understanding Bond Calculators
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 id="what-is-calculator" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is a Bond Calculator?</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                      <p>
                        A <strong>Bond Calculator</strong> is a powerful tool that enables investors to evaluate bonds by computing critical metrics such as bond price, yield to maturity, duration, and convexity. By entering details like face value, coupon rate, time to maturity, and market price, it provides a clear picture of a bond's value, potential returns, and associated risks, aiding in strategic investment decisions.
                      </p>
                      <p className="mt-2">
                        Key uses of bond calculators include:
                      </p>
                      <ul className="my-3 space-y-1">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Estimating the fair market value of a bond</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Determining yield and expected returns</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span>Analyzing interest rate risk via duration and convexity</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>Assessing special features like callability or convertibility</span>
                        </li>
                      </ul>
                      <p>
                        These calculators distill complex financial mathematics into accessible insights, empowering both beginners and seasoned investors to optimize their fixed-income portfolios.
                      </p>
                    </div>
                    <div className="md:w-[300px] h-[260px] flex-shrink-0">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                          <CardTitle className="text-sm font-medium text-center">Bond Price vs. Yield</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full">
                            <Line 
                              data={{
                                labels: ['2%', '4%', '6%', '8%', '10%'],
                                datasets: [
                                  {
                                    label: 'Bond Price',
                                    data: [1200, 1100, 1000, 900, 800],
                                    borderColor: 'rgba(99, 102, 241, 0.8)',
                                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
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
                                    ticks: { callback: value => '$' + value }
                                  }
                                }
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <h4 id="why-important" className="font-semibold text-xl mt-6">Why Bond Valuation Matters</h4>
                  <div className="mt-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Interest Rate Fluctuations</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Bond prices react inversely to interest rate changes, necessitating precise valuation.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Issuer Creditworthiness</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Yield analysis reveals the risk of issuer default.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Portfolio Strategy</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">Bonds are vital for diversifying and stabilizing investment portfolios.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p>
                    In an era of economic uncertainty, bond calculators provide the clarity needed to assess value, manage risks, and seize opportunities in the fixed-income market, ensuring investors can align their strategies with their financial objectives.
                  </p>
                </CardContent>
              </Card>

              {/* How to Use Section */}
              <div className="mb-12" id="how-to-use">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Mastering the Bond Calculator</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <h3 id="step-by-step" className="font-bold text-xl mb-4">Step-by-Step Guide</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">1</span>
                          Basic Bond Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Input face value (e.g., $1,000)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Percent className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Specify coupon rate (e.g., 5%)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Select payment frequency (e.g., semi-annual)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Enter years to maturity (e.g., 10)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Provide current market price</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">2</span>
                          Yield & Discounting
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Percent className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Adjust discount rate for present value</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Percent className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Set inflation rate for real yield analysis</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">3</span>
                          Advanced Options
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Percent className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Include tax rate for net returns</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Toggle callable/convertible features</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm">4</span>
                          Analyze Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Examine metrics like price and yield</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <LineChart className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                            <span>Study cash flows and sensitivity charts</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <h3 id="results" className="font-bold text-xl mt-8 mb-4">Interpreting Your Results</h3>
                
                <div className="mb-6">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Metric</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">Significance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Bond Price</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Present value of future cash flows</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Shows if bond is overvalued or undervalued</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Current Yield</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Annual coupon return relative to price</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Measures income efficiency</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Duration</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Sensitivity to interest rate changes</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Gauges price volatility risk</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">Convexity</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Rate of duration change with yield</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Enhances risk assessment accuracy</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Tip:</strong> Focus on duration and convexity to assess risk. Higher duration signals greater sensitivity to rate shifts, while convexity refines this analysis for larger yield changes.
                  </p>
                </div>
              </div>

              {/* Key Factors Section */}
              <div className="mb-12" id="key-factors">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        <span className="text-2xl">Key Factors in Bond Valuation</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Core elements shaping bond investment decisions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h3 id="interest-rates" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        Interest Rates and Bond Prices
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p>
                            <strong>Interest rates</strong> and bond prices share an inverse relationship: rising rates lower bond prices, and falling rates increase them. This dynamic reflects the competition between existing bonds and newly issued ones with updated yields.
                          </p>
                          <ul className="mt-4 space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>Discount Rate:</strong> Used to compute present value of cash flows</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900 dark:text-purple-300">→</span>
                              <span><strong>Yield to Maturity:</strong> Expected total return if held to maturity</span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                              <strong>Example:</strong> A bond with a 4% coupon loses value if new bonds yield 5%, as investors favor higher returns.
                            </p>
                          </div>
                        </div>
                        
                        <div className="h-[220px]">
                          <h4 className="text-center text-sm font-medium mb-2">Price vs. Rate Sensitivity</h4>
                          <Line 
                            data={{
                              labels: ['2%', '4%', '6%', '8%', '10%'],
                              datasets: [
                                {
                                  label: 'Bond Price',
                                  data: [1200, 1100, 1000, 900, 800],
                                  borderColor: 'rgba(124, 58, 237, 0.8)',
                                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
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
                                y: {
                                  beginAtZero: false,
                                  ticks: { callback: value => '$' + value }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-8" />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 id="coupon-rate" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                          <Percent className="h-5 w-5" />
                          Coupon Rate Influence
                        </h3>
                        <p>The <strong>coupon rate</strong> dictates the periodic interest payments as a percentage of face value, directly impacting cash flows and bond pricing.</p>
                        
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Coupon Rate</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Annual Payment</th>
                                <th className="border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-left">Bond Price*</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">3%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$30</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$850</td>
                              </tr>
                              <tr className="bg-indigo-50/50 dark:bg-indigo-900/20">
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">5%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$50</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$1,000</td>
                              </tr>
                              <tr>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">7%</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$70</td>
                                <td className="border border-indigo-200 dark:border-indigo-800 px-3 py-2">$1,150</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">*Based on 5% YTM, 10-year maturity</p>
                      </div>
                      
                      <div>
                        <h3 id="time-to-maturity" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Time to Maturity Impact
                        </h3>
                        <p>
                          <strong>Time to maturity</strong> affects how sensitive a bond’s price is to interest rate changes, with longer maturities amplifying this sensitivity.
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">Maturity vs. Sensitivity</h4>
                          <div className="mt-3">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div className="font-medium text-blue-700 dark:text-blue-400">5-Year Bond</div>
                              <div className="font-medium text-blue-700 dark:text-blue-400">20-Year Bond</div>
                              <div className="text-blue-600 dark:text-blue-500">Duration: ~4.5 years</div>
                              <div className="text-blue-600 dark:text-blue-500">Duration: ~15 years</div>
                              <div className="text-blue-600 dark:text-blue-500">1% Rate Change: -4.5%</div>
                              <div className="text-blue-600 dark:text-blue-500">1% Rate Change: -15%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bond Market Trends Section */}
              <div className="mb-12" id="bond-trends">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Bond Market Insights
                </h2>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Global Bond Market</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">$128T</p>
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">2023 Estimate</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                          <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">10-Year Treasury Yield</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">4.2%</p>
                        <p className="mt-1 text-sm text-green-600 dark:text-green-500">2023 Average</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                          <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">High-Yield Default Rate</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">3.5%</p>
                        <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">Annual Average</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                          <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Corporate Bond Issuance</h3>
                        <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">$2.3T</p>
                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">2023 Global</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="bond-challenges" className="text-xl font-bold mb-4">Bond Investment Risks</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40">
                          <Percent className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </span>
                        <CardTitle className="text-base">Interest Rate Risk</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Rising rates decrease bond prices, risking capital losses if sold prematurely.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40">
                          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </span>
                        <CardTitle className="text-base">Credit Risk</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Issuer default risk looms larger with high-yield bonds, threatening principal loss.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40">
                          <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </span>
                        <CardTitle className="text-base">Reinvestment Risk</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Falling rates may force reinvestment of coupons at lower yields, reducing income.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <h3 id="inflation-impact" className="text-xl font-bold mb-4">Inflation’s Effect on Bonds</h3>
                <Card className="bg-white dark:bg-gray-900 mb-4">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p>
                          <strong>Inflation</strong> diminishes the real value of fixed coupon payments and principal, particularly impacting long-term bonds.
                        </p>
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Real vs. Nominal Yield</h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">Nominal Yield</span>
                              <span className="font-medium text-red-700 dark:text-red-400">5%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-700 dark:text-red-400">Inflation Rate</span>
                              <span className="font-medium text-red-700 dark:text-red-400">3%</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-sm text-red-800 dark:text-red-300">Real Yield</span>
                              <span className="text-red-800 dark:text-red-300">2%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-[280px]">
                        <h4 className="text-center text-sm font-medium mb-3">Yield vs. Inflation Trend</h4>
                        <Line 
                          data={{
                            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                            datasets: [
                              {
                                label: 'Nominal Yield',
                                data: [5, 5, 5, 5, 5],
                                borderColor: 'rgba(99, 102, 241, 0.8)',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              },
                              {
                                label: 'Inflation Rate',
                                data: [2, 2.5, 3, 2.8, 3.2],
                                borderColor: 'rgba(220, 38, 38, 0.8)',
                                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: { callback: value => value + '%' }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-300">Mitigating Inflation</p>
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                        Opt for TIPS or floating-rate bonds to counter inflation, as they adjust payments to maintain real value.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conclusion Section */}
              <div className="mb-6" id="conclusion">
                <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
                    <CardTitle id="summary" className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                      Path to Bond Investing Mastery
                    </CardTitle>
                    <CardDescription>
                      Leveraging bond valuation for strategic success
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p>
                      <strong>Bond calculators</strong> simplify the intricacies of bond investing, offering insights into pricing, yields, and risk metrics like duration and convexity. This knowledge equips you to tailor your investments to your risk appetite and goals.
                    </p>
                    
                    <p className="mt-4" id="next-steps">
                      Actionable steps to elevate your bond strategy:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Short-Term Actions</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                            <span className="text-blue-800 dark:text-blue-300">Analyze existing bond holdings</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                            <span className="text-blue-800 dark:text-blue-300">Compare yields across bonds</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                            <span className="text-blue-800 dark:text-blue-300">Evaluate rate change impacts</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Long-Term Plans</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">1</span>
                            <span className="text-green-800 dark:text-green-300">Diversify maturities and ratings</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">2</span>
                            <span className="text-green-800 dark:text-green-300">Rebalance periodically</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold dark:bg-green-900 dark:text-green-300">3</span>
                            <span className="text-green-800 dark:text-green-300">Use laddering to manage risk</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Start Analyzing Now</p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400">
                            Use our <strong>Bond Calculator</strong> to assess your investments. Explore more tools:
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/investment">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Investment Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/yield">
                                <Percent className="h-4 w-4 mr-1" />
                                Yield Calculator
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                              <Link href="/calculators/portfolio">
                                <Wallet className="h-4 w-4 mr-1" />
                                Portfolio Calculator
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