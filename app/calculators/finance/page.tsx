"use client"

// Register Chart.js scales, elements, and plugins
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, DollarSign, Percent, Clock, ArrowRight, Calculator as CalculatorIcon, TrendingUp, ArrowDownRight, ArrowUpRight, CircleDollarSign, LightbulbIcon, AlertTriangle, LineChart, Info, Wallet, Settings, Receipt, BarChart3, Check, Search, XCircle, CheckCircle, Link, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator";
import 'katex/dist/katex.min.css'
import { Bar, Line, Pie } from "react-chartjs-2";
import { InlineMath, BlockMath } from 'react-katex'
import FinanceSchema from './schema';

export default function FinanceCalculator() {
  const [presentValue, setPresentValue] = useState({
    futureValue: 10000,
    interestRate: 5,
    years: 5,
    compoundingFrequency: 12,
    result: 0
  })

  // Future Value calculation state
  const [futureValue, setFutureValue] = useState({
    presentValue: 10000,
    interestRate: 5,
    years: 5,
    compoundingFrequency: 12,
    result: 0
  })

  // Interest Rate calculation state
  const [interestRate, setInterestRate] = useState({
    presentValue: 10000,
    futureValue: 12000,
    years: 5,
    compoundingFrequency: 12,
    result: 0
  })

  // Calculate Present Value
  useEffect(() => {
    const { futureValue: fv, interestRate: r, years: t, compoundingFrequency: n } = presentValue
    const rate = r / 100
    const pv = fv / Math.pow(1 + rate/n, n*t)
    setPresentValue(prev => ({ ...prev, result: pv }))
  }, [presentValue.futureValue, presentValue.interestRate, presentValue.years, presentValue.compoundingFrequency])

  // Calculate Future Value
  useEffect(() => {
    const { presentValue: pv, interestRate: r, years: t, compoundingFrequency: n } = futureValue
    const rate = r / 100
    const fv = pv * Math.pow(1 + rate/n, n*t)
    setFutureValue(prev => ({ ...prev, result: fv }))
  }, [futureValue.presentValue, futureValue.interestRate, futureValue.years, futureValue.compoundingFrequency])

  // Calculate Interest Rate
  useEffect(() => {
    const { presentValue: pv, futureValue: fv, years: t, compoundingFrequency: n } = interestRate
    const rate = (Math.pow(fv/pv, 1/(n*t)) - 1) * n * 100
    setInterestRate(prev => ({ ...prev, result: rate }))
  }, [interestRate.presentValue, interestRate.futureValue, interestRate.years, interestRate.compoundingFrequency])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
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

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <FinanceSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Financial <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate present value, future value, and interest rates for your financial planning needs.
      </p>
    </div>
  </div>
</section>

        {/* Calculator Section */}
        <section className="py-12">
          <div className="container max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Financial Calculations</CardTitle>
                <CardDescription>
                  Choose a calculation type and enter your values to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="present-value" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="present-value">Present Value</TabsTrigger>
                    <TabsTrigger value="future-value">Future Value</TabsTrigger>
                    <TabsTrigger value="interest-rate">Interest Rate</TabsTrigger>
                  </TabsList>

                  {/* Present Value Calculator */}
                  <TabsContent value="present-value" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="future-value">Future Value</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="future-value"
                              type="number"
                              className="pl-9"
                              value={presentValue.futureValue}
                              onChange={(e) => setPresentValue(prev => ({ ...prev, futureValue: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                          <div className="relative">
                            <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="interest-rate"
                              type="number"
                              className="pl-9"
                              value={presentValue.interestRate}
                              onChange={(e) => setPresentValue(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="years">Time (Years)</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="years"
                              type="number"
                              className="pl-9"
                              value={presentValue.years}
                              onChange={(e) => setPresentValue(prev => ({ ...prev, years: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compounding">Compounding Frequency</Label>
                          <Select 
                            value={String(presentValue.compoundingFrequency)}
                            onValueChange={(value) => setPresentValue(prev => ({ ...prev, compoundingFrequency: Number(value) }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Annually</SelectItem>
                              <SelectItem value="2">Semi-annually</SelectItem>
                              <SelectItem value="4">Quarterly</SelectItem>
                              <SelectItem value="12">Monthly</SelectItem>
                              <SelectItem value="365">Daily</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Card className="bg-primary/10 p-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Present Value</p>
                          <p className="text-4xl font-bold text-primary">{formatCurrency(presentValue.result)}</p>
                        </div>
                      </Card>
                      <Card className="p-4 bg-muted/50">
                        <div className="flex items-center gap-2 mb-4">
                          <ArrowDownRight className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">Present Value Calculator</h3>
                        </div>
                        <div className="mb-4">
                          <BlockMath math="PV = \frac{FV}{(1 + \frac{r}{n})^{n \times t}}" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Calculate the current value of a future sum of money, discounted at a specified interest rate.
                        </p>
                      </Card>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Formula Explanation</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Where:
                        </p>
                        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
                          <li>PV = Present Value (the result)</li>
                          <li>FV = Future Value ({formatCurrency(presentValue.futureValue)})</li>
                          <li>r = Interest Rate ({presentValue.interestRate}% or {presentValue.interestRate/100} as a decimal)</li>
                          <li>n = Compounding Frequency ({presentValue.compoundingFrequency} times per year)</li>
                          <li>t = Time in years ({presentValue.years} years)</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Future Value Calculator */}
                  <TabsContent value="future-value" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="present-value">Present Value</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="present-value"
                              type="number"
                              className="pl-9"
                              value={futureValue.presentValue}
                              onChange={(e) => setFutureValue(prev => ({ ...prev, presentValue: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                          <div className="relative">
                            <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="interest-rate"
                              type="number"
                              className="pl-9"
                              value={futureValue.interestRate}
                              onChange={(e) => setFutureValue(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="years">Time (Years)</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="years"
                              type="number"
                              className="pl-9"
                              value={futureValue.years}
                              onChange={(e) => setFutureValue(prev => ({ ...prev, years: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compounding">Compounding Frequency</Label>
                          <Select 
                            value={String(futureValue.compoundingFrequency)}
                            onValueChange={(value) => setFutureValue(prev => ({ ...prev, compoundingFrequency: Number(value) }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Annually</SelectItem>
                              <SelectItem value="2">Semi-annually</SelectItem>
                              <SelectItem value="4">Quarterly</SelectItem>
                              <SelectItem value="12">Monthly</SelectItem>
                              <SelectItem value="365">Daily</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Card className="bg-primary/10 p-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Future Value</p>
                          <p className="text-4xl font-bold text-primary">{formatCurrency(futureValue.result)}</p>
                        </div>
                      </Card>
                      <Card className="p-4 bg-muted/50">
                        <div className="flex items-center gap-2 mb-4">
                          <ArrowUpRight className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">Future Value Calculator</h3>
                        </div>
                        <div className="mb-4">
                          <BlockMath math="FV = PV \times (1 + \frac{r}{n})^{n \times t}" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Calculate the future value of a current sum of money, growing at a specified interest rate.
                        </p>
                      </Card>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Formula Explanation</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Where:
                        </p>
                        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
                          <li>FV = Future Value (the result)</li>
                          <li>PV = Present Value ({formatCurrency(futureValue.presentValue)})</li>
                          <li>r = Interest Rate ({futureValue.interestRate}% or {futureValue.interestRate/100} as a decimal)</li>
                          <li>n = Compounding Frequency ({futureValue.compoundingFrequency} times per year)</li>
                          <li>t = Time in years ({futureValue.years} years)</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Interest Rate Calculator */}
                  <TabsContent value="interest-rate" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="present-value">Present Value</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="present-value"
                              type="number"
                              className="pl-9"
                              value={interestRate.presentValue}
                              onChange={(e) => setInterestRate(prev => ({ ...prev, presentValue: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="future-value">Future Value</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="future-value"
                              type="number"
                              className="pl-9"
                              value={interestRate.futureValue}
                              onChange={(e) => setInterestRate(prev => ({ ...prev, futureValue: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="years">Time (Years)</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="years"
                              type="number"
                              className="pl-9"
                              value={interestRate.years}
                              onChange={(e) => setInterestRate(prev => ({ ...prev, years: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compounding">Compounding Frequency</Label>
                          <Select 
                            value={String(interestRate.compoundingFrequency)}
                            onValueChange={(value) => setInterestRate(prev => ({ ...prev, compoundingFrequency: Number(value) }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Annually</SelectItem>
                              <SelectItem value="2">Semi-annually</SelectItem>
                              <SelectItem value="4">Quarterly</SelectItem>
                              <SelectItem value="12">Monthly</SelectItem>
                              <SelectItem value="365">Daily</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Card className="bg-primary/10 p-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Required Interest Rate</p>
                          <p className="text-4xl font-bold text-primary">{formatPercent(interestRate.result)}</p>
                        </div>
                      </Card>
                      <Card className="p-4 bg-muted/50">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">Interest Rate Calculator</h3>
                        </div>
                        <div className="mb-4">
                          <BlockMath math="r = n \times \left(\left(\frac{FV}{PV}\right)^{\frac{1}{n \times t}} - 1\right)" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Calculate the interest rate needed to grow a present value to a future value over a specified time period.
                        </p>
                      </Card>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Formula Explanation</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Where:
                        </p>
                        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
                          <li>r = Interest Rate (the result)</li>
                          <li>FV = Future Value ({formatCurrency(interestRate.futureValue)})</li>
                          <li>PV = Present Value ({formatCurrency(interestRate.presentValue)})</li>
                          <li>n = Compounding Frequency ({interestRate.compoundingFrequency} times per year)</li>
                          <li>t = Time in years ({interestRate.years} years)</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Blog Section */}
<section id="blog-section" className="py-12 bg-white dark:bg-black">
  <div className="container mx-auto max-w-5xl px-4">
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1 text-center">
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Financial Planning</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Making Smarter Financial Decisions with Calculators</h2>
        <p className="mt-3 text-muted-foreground text-lg">Your comprehensive guide to financial calculators and how they transform your money management</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            The Power of Financial Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                In today's complex financial landscape, making informed decisions requires more than just intuition or simple math. <strong>Financial calculators</strong> transform abstract concepts into concrete projections, allowing you to visualize the impact of your financial choices before you make them.
              </p>
              <p className="mt-3">
                Whether you're planning for retirement, evaluating loan options, or building an investment strategy, these powerful tools help you understand the <strong>real cost and value</strong> of financial decisions over time.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Why Financial Calculators Matter</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>• Transform complex financial formulas into user-friendly insights</li>
                  <li>• Allow you to compare different scenarios side-by-side</li>
                  <li>• Reveal the hidden impact of time, interest rates, and compounding</li>
                  <li>• Help avoid costly financial mistakes through advance modeling</li>
                  <li>• Empower confident decision-making with data-driven projections</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-400">Financial Literacy Gap</h3>
              <div className="h-[220px]">
                <Bar 
                  data={{
                    labels: ['Basic', 'Intermediate', 'Advanced'],
                    datasets: [{
                      label: 'Financial Literacy Levels in US Adults',
                      data: [57, 28, 15],
                      backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(16, 185, 129, 0.7)'
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
                        formatter: (value) => value + '%'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { callback: (value) => value + '%' }
                      }
                    }
                  }}
                />
              </div>
              <p className="text-sm text-center mt-2 text-muted-foreground">
                Source: National Financial Education Council, 2025
              </p>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>57% of Americans</strong> struggle with fundamental financial calculations, highlighting the critical need for accessible financial tools that bridge the knowledge gap.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Planning & Savings</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Project future growth, set realistic targets, and track progress toward financial goals
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <CircleDollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Loans & Debt</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Understand true borrowing costs, optimize repayment strategies, and reduce interest expenses
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Investment Analysis</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Compare investment options, assess risk-return profiles, and optimize portfolio allocations
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Essential Financial Calculations Section */}
      <div className="mb-10" id="essential-calculations">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Essential Financial Calculations Explained
        </h2>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-blue-600" />
              Time Value of Money Concepts
            </CardTitle>
            <CardDescription>The foundation of all financial calculations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">The Core Principle</h3>
                <p className="mb-4">
                  The time value of money (TVM) is the concept that money available today is worth more than the same amount in the future due to its potential earning capacity. This is the foundation for virtually all financial calculations.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="mb-2 font-medium text-blue-700 dark:text-blue-400">Key TVM Variables</p>
                  <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-500">
                    <li><strong>PV</strong> - Present Value: Current worth of a future sum</li>
                    <li><strong>FV</strong> - Future Value: Worth of current amount at a future date</li>
                    <li><strong>r</strong> - Interest Rate: Rate of return or discount rate</li>
                    <li><strong>n</strong> - Time Periods: Number of compounding periods</li>
                    <li><strong>PMT</strong> - Payment: Recurring payment amount</li>
                  </ul>
                </div>
                
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Common TVM Formulas</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="py-2 px-3 text-left">Calculation</th>
                          <th className="py-2 px-3 text-left">Formula</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="py-2 px-3 font-medium">Future Value</td>
                          <td className="py-2 px-3 font-mono">FV = PV × (1 + r)^n</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium">Present Value</td>
                          <td className="py-2 px-3 font-mono">PV = FV ÷ (1 + r)^n</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium">Regular Deposits FV</td>
                          <td className="py-2 px-3 font-mono">FV = PMT × ((1 + r)^n - 1) ÷ r</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="h-[240px]">
                  <h4 className="text-center text-sm font-medium mb-2">$10,000 Growth at Different Interest Rates</h4>
                  <Line 
                    data={{
                      labels: ['Year 0', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
                      datasets: [
                        {
                          label: '3% Interest',
                          data: [10000, 11593, 13439, 15580, 18061, 20938, 24273],
                          borderColor: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4
                        },
                        {
                          label: '6% Interest',
                          data: [10000, 13382, 17908, 23966, 32071, 42919, 57435],
                          borderColor: 'rgba(16, 185, 129, 0.8)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          tension: 0.4
                        },
                        {
                          label: '9% Interest',
                          data: [10000, 15386, 23674, 36425, 56044, 86231, 132677],
                          borderColor: 'rgba(139, 92, 246, 0.8)',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          tension: 0.4
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
                          beginAtZero: true,
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
                        }
                      }
                    }}
                  />
                </div>
                
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Key Insight:</strong> The Rule of 72 provides a quick way to estimate doubling time. Simply divide 72 by the annual interest rate to approximate how many years it will take for your money to double.
                  </p>
                </div>
                
                <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                      <LightbulbIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-300">Did You Know?</h4>
                    <p className="text-xs mt-1 text-green-700 dark:text-green-400">
                      At 7% interest, money doubles every ~10 years. After 30 years, your original investment will be worth approximately 8 times its initial value.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Loan & Mortgage Calculations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Loan calculators help you understand the true cost of borrowing and evaluate different loan options. They're essential for making informed decisions about mortgages, auto loans, student loans, and personal loans.
              </p>

              <h4 className="font-medium mb-3">Monthly Payment Formula</h4>
              <div className="p-3 mb-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <p className="font-mono text-sm text-green-700 dark:text-green-400">
                  Payment = Principal × (r × (1+r)^n) ÷ ((1+r)^n - 1)
                </p>
                <p className="text-xs mt-1 text-green-600 dark:text-green-500">
                  Where r = monthly interest rate (annual rate ÷ 12) and n = total number of payments
                </p>
              </div>

              <div className="overflow-x-auto mb-4">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="py-2 px-3 text-left">Loan Amount</th>
                      <th className="py-2 px-3 text-left">Term</th>
                      <th className="py-2 px-3 text-left">Rate</th>
                      <th className="py-2 px-3 text-left">Monthly Payment</th>
                      <th className="py-2 px-3 text-left">Total Interest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-2 px-3">$300,000</td>
                      <td className="py-2 px-3">30 years</td>
                      <td className="py-2 px-3">5.5%</td>
                      <td className="py-2 px-3 font-medium">$1,703</td>
                      <td className="py-2 px-3">$313,212</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">$300,000</td>
                      <td className="py-2 px-3">15 years</td>
                      <td className="py-2 px-3">5.0%</td>
                      <td className="py-2 px-3 font-medium">$2,372</td>
                      <td className="py-2 px-3">$126,935</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">$300,000</td>
                      <td className="py-2 px-3">30 years</td>
                      <td className="py-2 px-3">6.5%</td>
                      <td className="py-2 px-3 font-medium">$1,896</td>
                      <td className="py-2 px-3">$382,560</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    A 1% increase in interest rate on a $300,000 30-year mortgage adds over $60,000 to the total interest paid over the life of the loan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-purple-600" />
                Investment Return Calculations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Investment calculators help evaluate potential returns, compare investment options, and understand how different variables affect long-term performance.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Compound Annual Growth Rate (CAGR)</h4>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <p className="font-mono text-sm text-purple-700 dark:text-purple-400">
                      CAGR = (FV ÷ PV)^(1 ÷ n) - 1
                    </p>
                    <p className="text-xs mt-1 text-purple-600 dark:text-purple-500">
                      Measures the mean annual growth rate over a specified period longer than one year
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Risk-Adjusted Returns: Sharpe Ratio</h4>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <p className="font-mono text-sm text-purple-700 dark:text-purple-400">
                      Sharpe Ratio = (Rp - Rf) ÷ σp
                    </p>
                    <p className="text-xs mt-1 text-purple-600 dark:text-purple-500">
                      Where Rp = portfolio return, Rf = risk-free rate, and σp = portfolio standard deviation
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-[220px] mt-5">
                <h4 className="text-center text-sm font-medium mb-2">$10,000 Investment Growth Comparison</h4>
                <Bar 
                  data={{
                    labels: ['5 Years', '10 Years', '20 Years', '30 Years'],
                    datasets: [
                      {
                        label: 'Conservative (4%)',
                        data: [12167, 14802, 21911, 32434],
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                      },
                      {
                        label: 'Moderate (7%)',
                        data: [14026, 19672, 38697, 76123],
                        backgroundColor: 'rgba(139, 92, 246, 0.7)',
                      },
                      {
                        label: 'Aggressive (10%)',
                        data: [16105, 25937, 67275, 174494],
                        backgroundColor: 'rgba(236, 72, 153, 0.7)',
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { callback: (value) => '$' + (value as number).toLocaleString() }
                      }
                    },
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Retirement Planning Calculations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Retirement calculators help you determine how much you need to save to achieve your retirement goals, accounting for inflation, investment returns, and withdrawal strategies.
              </p>

              <h4 className="font-medium mb-3">The 4% Rule</h4>
              <div className="p-3 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  The 4% rule suggests that retirees can withdraw 4% of their retirement portfolio value in the first year, then adjust that amount annually for inflation.
                </p>
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-500">
                  <strong>Example:</strong> With a $1 million portfolio, your first-year withdrawal would be $40,000, providing approximately $3,333 monthly income.
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="py-2 px-3 text-left">Desired Annual Income</th>
                      <th className="py-2 px-3 text-left">Required Portfolio (4% Rule)</th>
                      <th className="py-2 px-3 text-left">Required Portfolio (3% Rule)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-2 px-3">$40,000</td>
                      <td className="py-2 px-3">$1,000,000</td>
                      <td className="py-2 px-3">$1,333,333</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">$60,000</td>
                      <td className="py-2 px-3">$1,500,000</td>
                      <td className="py-2 px-3">$2,000,000</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">$80,000</td>
                      <td className="py-2 px-3">$2,000,000</td>
                      <td className="py-2 px-3">$2,666,667</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">$100,000</td>
                      <td className="py-2 px-3">$2,500,000</td>
                      <td className="py-2 px-3">$3,333,333</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    More conservative withdrawal rates (3-3.5%) may be appropriate for longer retirements, lower equity allocations, or periods of high market volatility.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                Budgeting & Cash Flow Calculations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Budgeting calculators help you track income and expenses, identify savings opportunities, and create sustainable spending plans aligned with your financial goals.
              </p>

              <h4 className="font-medium mb-3">The 50/30/20 Rule</h4>
              <div className="h-[220px] mb-4">
                <Pie 
                  data={{
                    labels: ['Needs (50%)', 'Wants (30%)', 'Savings (20%)'],
                    datasets: [{
                      data: [50, 30, 20],
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
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
                        font: { weight: 'bold' }
                      }
                    }
                  }}
                />
              </div>

              <div className="space-y-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
                    <p className="flex-1 text-sm font-medium">Needs (50%)</p>
                    <p className="text-sm">Housing, food, utilities, transportation</p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>
                    <p className="flex-1 text-sm font-medium">Wants (30%)</p>
                    <p className="text-sm">Entertainment, dining out, hobbies, subscriptions</p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                    <p className="flex-1 text-sm font-medium">Savings (20%)</p>
                    <p className="text-sm">Retirement, emergency fund, financial goals</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    The 50/30/20 rule is a starting point. Adjust percentages based on your financial situation, income level, and location. Higher income individuals should consider saving more than 20%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Features & Considerations */}
      <div className="mb-10" id="advanced-features">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-50 dark:from-purple-900/40 dark:to-indigo-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl">Advanced Features & Considerations</span>
              </div>
            </CardTitle>
            <CardDescription>
              Getting the most accurate and useful financial projections
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 id="inflation-impact" className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Accounting for Inflation
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p>
                    <strong>Inflation</strong> erodes purchasing power over time, making it essential to include inflation adjustments in long-term financial projections. Without accounting for inflation, your calculations may significantly overestimate your future buying power.
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Why Inflation Matters:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>A 3% annual inflation rate cuts your purchasing power in half every 24 years</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>What costs $100,000 today will cost about $243,000 in 30 years (3% inflation)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Income needs during retirement must increase annually to maintain lifestyle</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 border border-purple-200 dark:border-purple-900 rounded-md bg-purple-50 dark:bg-purple-900/20">
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      <strong>Inflation-Adjusted Calculations:</strong>
                    </p>
                    <p className="text-xs mt-1 text-purple-700 dark:text-purple-400">
                      Real Rate of Return = ((1 + Nominal Rate) ÷ (1 + Inflation Rate)) - 1
                    </p>
                    <div className="mt-2 text-xs text-purple-600 dark:text-purple-500">
                      <strong>Example:</strong> A 7% investment return during 3% inflation yields a real return of approximately 3.9%, not 4%.
                    </div>
                  </div>
                </div>
                
                <div className="h-[260px]">
                  <h4 className="text-center text-sm font-medium mb-2">Impact of Inflation on $1,000,000</h4>
                  <Line 
                    data={{
                      labels: ['Today', '10 Years', '20 Years', '30 Years', '40 Years'],
                      datasets: [
                        {
                          label: 'Nominal Value',
                          data: [1000000, 1000000, 1000000, 1000000, 1000000],
                          borderColor: 'rgba(99, 102, 241, 0.8)',
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          borderDash: [5, 5]
                        },
                        {
                          label: 'Real Value (2% Inflation)',
                          data: [1000000, 820348, 673012, 552071, 452890],
                          borderColor: 'rgba(139, 92, 246, 0.8)',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)'
                        },
                        {
                          label: 'Real Value (3% Inflation)',
                          data: [1000000, 744094, 553676, 411987, 306556],
                          borderColor: 'rgba(236, 72, 153, 0.8)',
                          backgroundColor: 'rgba(236, 72, 153, 0.1)'
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
                          ticks: { callback: (value) => '$' + (value as number).toLocaleString() }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Financial Planning Tip:</strong> For long-term goals like retirement, always use inflation-adjusted (real) returns in your calculations to avoid underestimating your needed savings.
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="tax-impact" className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Tax Considerations
                </h3>
                <p>
                  Taxes can significantly impact your financial outcomes, yet many basic calculators ignore tax effects. Advanced financial calculators account for different tax treatments of various accounts and investments.
                </p>
                
                <div className="mt-4 space-y-3">
                  <h4 className="font-medium">Key Tax Factors to Consider:</h4>
                  
                  <div className="space-y-3">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-3">
                        <h5 className="font-medium text-sm">Investment Account Types</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tax-deferred (401k, Traditional IRA), tax-free (Roth), and taxable accounts each have different tax implications and growth patterns.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-3">
                        <h5 className="font-medium text-sm">Capital Gains vs. Ordinary Income</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          Long-term capital gains are typically taxed at lower rates than interest, dividends, or short-term gains.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="p-3">
                        <h5 className="font-medium text-sm">Tax Bracket Changes</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your tax rate may change during retirement, affecting the optimal savings strategy and withdrawal sequence.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mt-1">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      <strong>Calculator Pro Tip:</strong> Use after-tax returns for more accurate long-term projections. A 7% pre-tax return in a 22% tax bracket equates to approximately a 5.5% after-tax return.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="risk-assessment" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Risk Assessment & Scenario Analysis
                </h3>
                <p>
                  Advanced financial calculators allow you to model different scenarios and assess the impact of various risks on your financial plan.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="p-3 border border-blue-100 dark:border-blue-800 rounded-lg">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Monte Carlo Simulation</h4>
                    <p className="text-sm mt-1">
                      Rather than using fixed average returns, Monte Carlo simulations run hundreds or thousands of possible market scenarios to determine the probability of financial success.
                    </p>
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                      Example: A plan with a 90% success rate has a 90% chance of not running out of money during retirement.
                    </div>
                  </div>
                  
                  <div className="p-3 border border-blue-100 dark:border-blue-800 rounded-lg">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Sequence of Returns Risk</h4>
                    <p className="text-sm mt-1">
                      Advanced calculators can model the impact of experiencing poor market returns early in retirement, which can significantly affect sustainability of withdrawals.
                    </p>
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                      Even with the same average return, the specific sequence of yearly returns can dramatically change outcomes when taking withdrawals.
                    </div>
                  </div>
                  
                  <div className="p-3 border border-blue-100 dark:border-blue-800 rounded-lg">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Longevity Risk</h4>
                    <p className="text-sm mt-1">
                      Quality calculators allow you to assess the impact of living longer than expected, one of the greatest financial risks in retirement planning.
                    </p>
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                      Planning to age 95+ rather than average life expectancy provides a margin of safety against outliving your savings.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Using Calculators Effectively */}
      <div className="mb-10" id="calculator-usage">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Using Financial Calculators Effectively
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Best Practices</CardTitle>
              <CardDescription>
                How to ensure accurate calculator results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Use Realistic Assumptions
                </h4>
                <p className="text-sm text-muted-foreground">
                  Avoid overly optimistic inputs like unrealistically high investment returns or underestimated expenses. Conservative estimates provide a margin of safety.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Consider All Costs
                </h4>
                <p className="text-sm text-muted-foreground">
                  Include all relevant expenses, fees, and taxes. For investments, subtract management fees from expected returns, as a 7% market return with 1% fees is effectively a 6% return.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Account for Inflation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Always use inflation-adjusted numbers for long-term calculations, especially for retirement planning. Consider using slightly higher inflation rates for healthcare costs.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Update Regularly
                </h4>
                <p className="text-sm text-muted-foreground">
                  Financial planning isn't a one-time event. Revisit your calculations at least annually and after major life events or economic changes.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Analysis Strategies</CardTitle>
              <CardDescription>
                Getting deeper insights from calculator results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-blue-600" />
                  Run Multiple Scenarios
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create best-case, likely-case, and worst-case scenarios to understand the range of possible outcomes and plan accordingly.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Perform Sensitivity Analysis
                </h4>
                <p className="text-sm text-muted-foreground">
                  Change one variable at a time to see how it affects the outcome. This helps identify which factors have the most significant impact on your results.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-600" />
                  Look Beyond the Numbers
                </h4>
                <p className="text-sm text-muted-foreground">
                  Consider qualitative factors not captured by calculators, such as job security, health considerations, and personal risk tolerance.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mt-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Pro Tip:</strong> Financial calculators are tools, not crystal balls. They help inform decisions but shouldn't be the only factor. Consider consulting with a financial professional for personalized advice.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="bg-green-50 dark:bg-green-900/30">
              <CardTitle className="text-green-800 dark:text-green-300">Common Calculator Mistakes to Avoid</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Forgetting about inflation</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Not adjusting for inflation makes long-term goals appear more achievable than they really are and can lead to significant shortfalls.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Using unrealistic return rates</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Basing projections on above-average market returns or ignoring fees and taxes can lead to overly optimistic projections.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Overlooking irregular expenses</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Calculators often focus on regular monthly expenses, missing occasional large costs like home repairs or medical expenses.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Not accounting for life changes</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Career changes, health issues, or family responsibilities can dramatically alter your financial trajectory beyond what calculators predict.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Taking Control of Your Financial Future
            </CardTitle>
            <CardDescription>
              From information to action: Next steps for financial success
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Financial calculators</strong> demystify complex money decisions, transforming abstract concepts into personalized, actionable insights. By mastering these tools, you gain the power to confidently navigate life's financial crossroads—from major purchases and investment strategies to retirement planning and debt management.
            </p>
            
            <p className="mt-4" id="next-steps">
              As you continue your financial journey, remember that calculators are most effective when they become part of a regular financial planning routine:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">For Beginners</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Start with basic calculators that address your most pressing financial concerns</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Focus on understanding key concepts like compound interest and time value of money</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Use calculators to build your first budget and emergency fund plan</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">For Advanced Users</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Integrate multiple calculators for comprehensive financial planning</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Use scenario planning to test financial resilience against market downturns</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Analyze tax-optimization strategies across various account types</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to take charge of your finances?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>comprehensive Financial Calculator</strong> suite to create a personalized financial plan! Explore these specialized calculators for different aspects of your financial life:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <Clock className="h-4 w-4 mr-1" />
                        Retirement Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/mortgage">
                        <Home className="h-4 w-4 mr-1" />
                        Mortgage Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/investment">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Investment Calculator
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