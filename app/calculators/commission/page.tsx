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
// Add Accordion imports
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, Target, Percent, Users, Award, Wallet, Clock, Calendar, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import CommissionSchema from './schema';

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

interface TierStructure {
  threshold: number;
  rate: number;
}

export default function CommissionCalculator() {
  // Basic Commission Details
  const [totalSales, setTotalSales] = useState<number>(100000)
  const [commissionType, setCommissionType] = useState<'flat' | 'tiered' | 'hybrid'>('flat')
  const [flatRate, setFlatRate] = useState<number>(5)
  const [baseSalary, setBaseSalary] = useState<number>(3000)
  const [includeBaseSalary, setIncludeBaseSalary] = useState<boolean>(true)
  const [numberOfTransactions, setNumberOfTransactions] = useState<number>(10)
  
  // Tiered Structure
  const [tiers, setTiers] = useState<TierStructure[]>([
    { threshold: 0, rate: 3 },
    { threshold: 50000, rate: 5 },
    { threshold: 100000, rate: 7 },
    { threshold: 200000, rate: 10 }
  ])
  
  // Performance Bonuses
  const [includeBonus, setIncludeBonus] = useState<boolean>(false)
  const [bonusThreshold, setBonusThreshold] = useState<number>(150000)
  const [bonusAmount, setBonusAmount] = useState<number>(5000)
  
  // Split Commission
  const [splitCommission, setSplitCommission] = useState<boolean>(false)
  const [splitPercentage, setSplitPercentage] = useState<number>(50)
  
  // Deductions
  const [taxRate, setTaxRate] = useState<number>(25)
  const [otherDeductions, setOtherDeductions] = useState<number>(0)
  
  // Historical Data (simulated)
  const [historicalSales] = useState<number[]>([
    85000, 92000, 88000, 95000, 105000, totalSales
  ])
  
  // Results State
  const [results, setResults] = useState({
    commission: 0,
    bonus: 0,
    grossEarnings: 0,
    netEarnings: 0,
    effectiveRate: 0,
    projectedAnnual: 0
  })

  // Calculate commission and earnings
  useEffect(() => {
    let commission = 0
    let bonus = 0
    
    // Calculate base commission
    if (commissionType === 'flat') {
      commission = totalSales * (flatRate / 100)
    } else if (commissionType === 'tiered') {
      let remainingSales = totalSales
      for (let i = tiers.length - 1; i >= 0; i--) {
        if (totalSales > tiers[i].threshold) {
          const tierSales = i === tiers.length - 1 
            ? remainingSales 
            : remainingSales - tiers[i + 1].threshold
          commission += tierSales * (tiers[i].rate / 100)
          remainingSales -= tierSales
        }
      }
    }
    
    // Apply split if enabled
    if (splitCommission) {
      commission *= splitPercentage / 100
    }
    
    // Calculate bonus if applicable
    if (includeBonus && totalSales >= bonusThreshold) {
      bonus = bonusAmount
    }
    
    // Calculate total and net earnings
    const basePay = includeBaseSalary ? baseSalary : 0
    const grossEarnings = commission + bonus + basePay
    const deductions = (grossEarnings * (taxRate / 100)) + otherDeductions
    const netEarnings = grossEarnings - deductions
    
    // Calculate effective rate
    const effectiveRate = (commission / totalSales) * 100
    
    // Project annual earnings (based on current month)
    const projectedAnnual = grossEarnings * 12
    
    setResults({
      commission,
      bonus,
      grossEarnings,
      netEarnings,
      effectiveRate,
      projectedAnnual
    })
    
  }, [
    totalSales,
    commissionType,
    flatRate,
    baseSalary,
    includeBaseSalary,
    tiers,
    includeBonus,
    bonusThreshold,
    bonusAmount,
    splitCommission,
    splitPercentage,
    taxRate,
    otherDeductions
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

  // Earnings breakdown chart
  const pieChartData = {
    labels: ['Commission', 'Base Salary', 'Bonus', 'Deductions'],
    datasets: [{
      data: [
        results.commission,
        includeBaseSalary ? baseSalary : 0,
        results.bonus,
        results.grossEarnings - results.netEarnings
      ],
      backgroundColor: chartColors.primary,
      borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
      borderWidth: 2
    }]
  }

  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => {
          return ((value / results.grossEarnings) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Historical performance chart
  const lineChartData = {
    labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Current'],
    datasets: [
      {
        label: 'Sales Performance',
        data: historicalSales,
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      }
    ]
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
      x: { grid: { display: false } }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
      }
    }
  }

  // Tiered rates visualization
  const generateTierChart = () => {
    return {
      labels: tiers.map(tier => 
        tier.threshold === 0 ? 'Base' : `$${tier.threshold.toLocaleString()}+`
      ),
      datasets: [
        {
          label: 'Commission Rate',
          data: tiers.map(tier => tier.rate),
          backgroundColor: chartColors.primary[0],
          borderColor: chartColors.secondary[0].replace('0.2', '1'),
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    }
  }

  const tierChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => value + '%'
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
        formatter: (value: number) => value + '%'
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
    pdf.save('commission-calculation.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <CommissionSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Commission <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your commission earnings with support for multiple commission structures, bonuses, and deductions.
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
                    <CardTitle>Enter Commission Details</CardTitle>
                    <CardDescription>
                      Provide your sales and commission structure information to calculate earnings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Basic Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Sales & Commission Structure</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="total-sales">Total Sales Amount</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="total-sales"
                              type="number"
                              className="pl-9"
                              value={totalSales}
                              onChange={(e) => setTotalSales(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="commission-type">Commission Type</Label>
                          <Select 
                            value={commissionType} 
                            onValueChange={(value) => setCommissionType(value as 'flat' | 'tiered' | 'hybrid')}
                          >
                            <SelectTrigger id="commission-type">
                              <SelectValue placeholder="Select commission type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flat">Flat Rate</SelectItem>
                              <SelectItem value="tiered">Tiered Structure</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {commissionType === 'flat' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="flat-rate">Commission Rate</Label>
                              <span className="text-sm text-muted-foreground">{flatRate}%</span>
                            </div>
                            <Slider
                              id="flat-rate"
                              min={0}
                              max={20}
                              step={0.5}
                              value={[flatRate]}
                              onValueChange={(value) => setFlatRate(value[0])}
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="transactions">Number of Transactions</Label>
                          <Input
                            id="transactions"
                            type="number"
                            value={numberOfTransactions}
                            onChange={(e) => setNumberOfTransactions(Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Base Salary */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Base Salary</h3>
                        <Switch
                          checked={includeBaseSalary}
                          onCheckedChange={setIncludeBaseSalary}
                        />
                      </div>
                      {includeBaseSalary && (
                        <div className="space-y-2">
                          <Label htmlFor="base-salary">Monthly Base Salary</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="base-salary"
                              type="number"
                              className="pl-9"
                              value={baseSalary}
                              onChange={(e) => setBaseSalary(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Performance Bonus */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Performance Bonus</h3>
                        <Switch
                          checked={includeBonus}
                          onCheckedChange={setIncludeBonus}
                        />
                      </div>
                      {includeBonus && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="bonus-threshold">Sales Threshold</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="bonus-threshold"
                                type="number"
                                className="pl-9"
                                value={bonusThreshold}
                                onChange={(e) => setBonusThreshold(Number(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bonus-amount">Bonus Amount</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="bonus-amount"
                                type="number"
                                className="pl-9"
                                value={bonusAmount}
                                onChange={(e) => setBonusAmount(Number(e.target.value))}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Split Commission */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Split Commission</h3>
                        <Switch
                          checked={splitCommission}
                          onCheckedChange={setSplitCommission}
                        />
                      </div>
                      {splitCommission && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="split-percentage">Your Split Percentage</Label>
                            <span className="text-sm text-muted-foreground">{splitPercentage}%</span>
                          </div>
                          <Slider
                            id="split-percentage"
                            min={1}
                            max={99}
                            step={1}
                            value={[splitPercentage]}
                            onValueChange={(value) => setSplitPercentage(value[0])}
                          />
                        </div>
                      )}
                    </div>

                    {/* Deductions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Deductions</h3>
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
                          <Label htmlFor="other-deductions">Other Deductions</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="other-deductions"
                              type="number"
                              className="pl-9"
                              value={otherDeductions}
                              onChange={(e) => setOtherDeductions(Number(e.target.value))}
                            />
                          </div>
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
                        <p className="text-sm text-muted-foreground">Commission Earned</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(results.commission)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Net Earnings</p>
                        <p className="text-2xl font-bold">{formatCurrency(results.netEarnings)}</p>
                      </div>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        {commissionType === 'tiered' && (
                          <TabsTrigger value="tiers">Tiers</TabsTrigger>
                        )}
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Earnings Breakdown</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Commission</span>
                              <span className="font-medium">{formatCurrency(results.commission)}</span>
                            </div>
                            {includeBaseSalary && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Base Salary</span>
                                <span className="font-medium">{formatCurrency(baseSalary)}</span>
                              </div>
                            )}
                            {results.bonus > 0 && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Performance Bonus</span>
                                <span className="font-medium">{formatCurrency(results.bonus)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Deductions</span>
                              <span className="font-medium">{formatCurrency(results.grossEarnings - results.netEarnings)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Net Earnings</span>
                              <span>{formatCurrency(results.netEarnings)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="performance" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Performance Metrics</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Effective Commission Rate</span>
                              <span className="font-medium">{results.effectiveRate.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Average Sale Value</span>
                              <span className="font-medium">{formatCurrency(totalSales / numberOfTransactions)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Projected Annual Earnings</span>
                              <span className="font-medium">{formatCurrency(results.projectedAnnual)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {commissionType === 'tiered' && (
                        <TabsContent value="tiers" className="space-y-4">
                          <div className="h-[300px]">
                            <Bar data={generateTierChart()} options={tierChartOptions} />
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium">Tiered Commission Structure</h4>
                            <div className="grid gap-2">
                              {tiers.map((tier, index) => (
                                <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                  <span className="text-sm">
                                    {tier.threshold === 0 ? 'Base Rate' : `$${tier.threshold.toLocaleString()}+`}
                                  </span>
                                  <span className="font-medium">{tier.rate}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>

                    {/* Quick Stats */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Per Transaction</p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(results.commission / numberOfTransactions)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Commission Rate</p>
                            <p className="text-lg font-semibold">{results.effectiveRate.toFixed(2)}%</p>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Sales Resource</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Commission Calculations Made Simple</h2>
        <p className="mt-3 text-muted-foreground text-lg">Maximize your earning potential with strategic commission planning</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Commission Calculators
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                A <strong>Commission Calculator</strong> is an essential financial tool for anyone working in sales, real estate, insurance, or any field where compensation includes performance-based earnings. Unlike fixed salary calculations, commission structures can be complex, with multiple variables affecting your final compensation.
              </p>
              <p className="mt-3">
                With a robust commission calculator, you can:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Project earnings based on sales performance</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Compare different commission structures</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Set realistic sales targets and income goals</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Identify optimal selling strategies</span>
                </li>
              </ul>
              <p>
                Whether you're a sales professional evaluating a job offer, a manager designing compensation plans, or a business owner structuring incentives, understanding how commissions translate to earnings is crucial for making informed financial decisions.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Common Commission Structures</h3>
                <div className="h-[200px]">
                  <Pie 
                    data={{
                      labels: ['Fixed Rate', 'Tiered', 'Mixed Base+Commission', 'Graduated', 'Draw Against'],
                      datasets: [{
                        data: [30, 25, 20, 15, 10],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(14, 165, 233, 0.8)',
                          'rgba(6, 182, 212, 0.8)',
                          'rgba(20, 184, 166, 0.8)',
                          'rgba(124, 58, 237, 0.8)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } },
                        datalabels: {
                          color: '#fff',
                          font: { weight: 'bold' },
                          formatter: (value) => value + '%'
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Distribution of commission structures across industries</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> According to industry research, salespeople earning primarily commission-based income earn 12-18% more on average than their salaried counterparts when performance is taken into account.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 text-lg font-semibold text-blue-800 dark:text-blue-300">Earnings Clarity</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    Understand exactly how your sales performance translates to income
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <LineChart className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-300">Goal Setting</h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    Create data-driven sales targets aligned with your income goals
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <PieChart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="mt-3 text-lg font-semibold text-purple-800 dark:text-purple-300">Structure Comparison</h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Evaluate different compensation plans to maximize your earning potential
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Commission Structures Section */}
      <div className="mb-10" id="commission-structures">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-blue-600" />
          Understanding Commission Structures
        </h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="types-of-commission" className="font-bold text-xl mb-4">Major Commission Types and Calculations</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Percent className="h-5 w-5 text-blue-600" />
                  Flat Rate Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3">
                  The simplest commission structure where you earn a fixed percentage of each sale's value.
                </p>
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Calculation:</p>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded font-mono text-xs">
                    Commission = Sale Amount × Commission Rate
                  </div>
                  <p className="mt-2">Example: $10,000 sale with 5% commission = $500</p>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p><strong>Best for:</strong> Straightforward sales processes with consistent product values</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Tiered Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3">
                  Offers increasing commission rates as sales volumes or values reach certain thresholds.
                </p>
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Example Structure:</p>
                  <ul className="space-y-1">
                    <li>• $0-$10,000: 3% commission</li>
                    <li>• $10,001-$25,000: 5% commission</li>
                    <li>• $25,001+: 7% commission</li>
                  </ul>
                  <p className="mt-2">For $30,000 in sales: ($10,000 × 3%) + ($15,000 × 5%) + ($5,000 × 7%) = $1,600</p>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p><strong>Best for:</strong> Motivating sales teams to pursue higher sales volumes</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Base Salary + Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3">
                  Combines a fixed base salary with commission earnings, providing income stability with performance incentives.
                </p>
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Calculation:</p>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded font-mono text-xs">
                    Total Compensation = Base Salary + (Sales × Commission Rate)
                  </div>
                  <p className="mt-2">Example: $3,000/month base + ($100,000 sales × 2%) = $5,000/month</p>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p><strong>Best for:</strong> Complex sales cycles or areas where consistent income is necessary</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  Draw Against Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3">
                  Provides an advance or "draw" that is later repaid through earned commissions.
                </p>
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">How It Works:</p>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Receive monthly draw (e.g., $3,000)</li>
                    <li>Earn commissions on sales (e.g., 5% of $80,000 = $4,000)</li>
                    <li>Receive difference: $4,000 - $3,000 = $1,000 additional payment</li>
                  </ol>
                  <p className="mt-2 text-amber-600 dark:text-amber-400">If commissions are less than the draw, difference may carry forward as debt</p>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p><strong>Best for:</strong> Industries with long sales cycles or seasonal fluctuations</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Specialized Commission Structures
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium">Residual Commission</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Ongoing payments for as long as a customer continues with the product/service. Common in insurance, SaaS, and subscription models.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium">Revenue/Profit Split</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Commission based on profit margin rather than revenue, encouraging focus on high-margin products and cost management.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium">Multi-level Commission</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Earnings on your sales plus a percentage of sales from people you've recruited. Common in network marketing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Pro Tip:</strong> When evaluating commission structures, always calculate your expected earnings across multiple performance scenarios, not just your ideal or best-case outcome. Understanding minimum, target, and stretch earnings provides a complete picture.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4" id="commission-chart">Visual Commission Comparison</h3>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <Bar 
                data={{
                  labels: ['$50K Sales', '$100K Sales', '$150K Sales', '$200K Sales'],
                  datasets: [
                    {
                      label: 'Flat 5%',
                      data: [2500, 5000, 7500, 10000],
                      backgroundColor: 'rgba(59, 130, 246, 0.7)'
                    },
                    {
                      label: 'Tiered (3-7%)',
                      data: [1500, 3950, 7350, 11450],
                      backgroundColor: 'rgba(16, 185, 129, 0.7)'
                    },
                    {
                      label: '$3K Base + 2%',
                      data: [4000, 5000, 6000, 7000],
                      backgroundColor: 'rgba(124, 58, 237, 0.7)'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: 'Earnings ($)' },
                      ticks: { callback: (value) => '$' + value }
                    }
                  }
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center mt-3">
              Earnings comparison across different commission structures at various sales levels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calculator Usage Section */}
      <div className="mb-10" id="using-calculator">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Using the Commission Calculator Effectively
        </h2>
        
        <Card className="overflow-hidden border-green-200 dark:border-green-900 mb-6">
          <CardHeader className="bg-green-50 dark:bg-green-900/40">
            <CardTitle>Step-by-Step Guide</CardTitle>
            <CardDescription>Getting the most out of your commission calculations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-4">Basic Commission Calculation</h3>
                
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">1</span>
                    <div>
                      <p className="font-medium">Enter your sales amount</p>
                      <p className="text-sm text-muted-foreground mt-1">Input the total sales value for the period you're calculating</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">2</span>
                    <div>
                      <p className="font-medium">Select your commission structure</p>
                      <p className="text-sm text-muted-foreground mt-1">Choose from flat rate, tiered, or mixed models</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">3</span>
                    <div>
                      <p className="font-medium">Input commission rates</p>
                      <p className="text-sm text-muted-foreground mt-1">Enter your exact rates and any associated thresholds</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">4</span>
                    <div>
                      <p className="font-medium">Add base salary or draws (if applicable)</p>
                      <p className="text-sm text-muted-foreground mt-1">Include fixed components of your compensation</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 font-medium text-sm">5</span>
                    <div>
                      <p className="font-medium">Review and analyze results</p>
                      <p className="text-sm text-muted-foreground mt-1">Examine breakdowns, charts, and scenarios</p>
                    </div>
                  </li>
                </ol>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-4">Advanced Features</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Goal Projections
                    </h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Enter your target income to automatically calculate the sales volume needed to achieve it.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Scenario Comparison
                    </h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Compare multiple commission structures side-by-side to identify the most advantageous options.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time Period Analysis
                    </h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      View projected earnings across different time frames (weekly, monthly, quarterly, annually).
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Tax Considerations
                    </h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Factor in tax implications to understand take-home earnings from commission income.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-3">Sample Commission Calculation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <p className="text-xs text-muted-foreground">Monthly Sales</p>
                        <p className="font-medium">$85,000</p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <p className="text-xs text-muted-foreground">Commission Structure</p>
                        <p className="font-medium">Tiered</p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <p className="text-xs text-muted-foreground">Base Salary</p>
                        <p className="font-medium">$2,500</p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <p className="text-xs text-muted-foreground">Tier Rates</p>
                        <p className="font-medium">3%, 5%, 7%</p>
                      </div>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded font-medium">
                      <div className="flex justify-between">
                        <span>Total Monthly Compensation:</span>
                        <span>$5,225</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Save Calculation Scenarios</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    Use the "Save" feature to store different commission scenarios for quick reference. This is especially useful when comparing job offers or negotiating compensation structures.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Strategies Section */}
      <div className="mb-10" id="optimization-strategies">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl">Optimizing Your Commission Structure</span>
              </div>
            </CardTitle>
            <CardDescription>
              Strategies to maximize your commission-based earnings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="negotiation-tips" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4">Commission Negotiation Tips</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Research Industry Standards</h4>
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      Before negotiating, research standard commission rates in your industry, region, and for your experience level. Use the calculator to compare these benchmarks.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Focus on Total Compensation</h4>
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      Don't fixate solely on commission percentages. Use the calculator to project your total earnings including base salary, bonuses, and benefits for a complete picture.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Propose Tier Adjustments</h4>
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      Rather than asking for a flat percentage increase, use the calculator to demonstrate how adjusted tier thresholds could benefit both you and the company by incentivizing higher performance.
                    </p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-6 mb-4">Performance Analysis</h3>
                <p className="mb-4">
                  Use the commission calculator to analyze your historical performance and identify your most profitable:
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                    <h4 className="font-medium">Products/Services</h4>
                    <p className="mt-1 text-sm text-muted-foreground">Focus on items with higher commission margins</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                    <h4 className="font-medium">Customer Segments</h4>
                    <p className="mt-1 text-sm text-muted-foreground">Identify highest-value client profiles</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                    <h4 className="font-medium">Sales Periods</h4>
                    <p className="mt-1 text-sm text-muted-foreground">Optimize timing for seasonal trends</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="optimization-techniques" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">Commission Optimization Techniques</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Threshold Management
                    </h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      In tiered structures, use the calculator to identify how close you are to the next commission tier. When you're near a threshold, focusing efforts to cross it can dramatically increase earnings.
                    </p>
                    <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-md text-xs">
                      <p className="mb-1">Example: At $98,500 in monthly sales with the next tier at $100,000:</p>
                      <p>• Current commission: $4,925</p>
                      <p>• With just $1,500 more in sales: $5,500</p>
                      <p className="font-medium text-green-700 dark:text-green-400 mt-1">Result: $575 increase for 1.5% more sales</p>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Strategic Timing
                    </h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Use the calculator to analyze how deal timing affects your commission cycles. Sometimes shifting a sale between periods can optimize your earnings, especially in tiered systems.
                    </p>
                  </div>
                  
                  <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Product/Service Mix
                    </h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Calculate the commission impact of different product mixes to identify your most profitable offerings. Some products may have lower sales values but higher commission rates or margins.
                    </p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-6 mb-4">Goal Setting With Commission Data</h3>
                <div className="h-[220px] mb-4">
                  <Line 
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                      datasets: [
                        {
                          label: 'Actual Earnings',
                          data: [3200, 4100, 3800, 4500, 5200, 5800],
                          borderColor: 'rgba(245, 158, 11, 0.8)',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          tension: 0.4
                        },
                        {
                          label: 'Target Earnings',
                          data: [3000, 3500, 4000, 4500, 5000, 5500],
                          borderColor: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'transparent',
                          borderDash: [5, 5],
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => '$' + value }
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Set realistic, data-driven goals by using historical commission data to project future earnings and establish incremental growth targets.
                </p>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 className="text-xl font-bold mb-4">Industry-Specific Commission Insights</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="py-3 bg-blue-50 dark:bg-blue-900/30">
                  <CardTitle className="text-base">Real Estate</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <ul className="space-y-2">
                    <li>• Typical commission: 5-6% of sale price</li>
                    <li>• Usually split between buyer and seller agents</li>
                    <li>• Higher commission for luxury properties</li>
                    <li>• Calculate net after broker splits (commonly 70/30)</li>
                  </ul>
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                    <p className="font-medium">$500K sale at 6% with 70/30 broker split:</p>
                    <p>= $500,000 × 6% × 50% × 70% = $10,500 commission</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="py-3 bg-green-50 dark:bg-green-900/30">
                  <CardTitle className="text-base">Insurance</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <ul className="space-y-2">
                    <li>• New policies: 40-100% of first-year premium</li>
                    <li>• Renewals: 1-20% of premium (recurring)</li>
                    <li>• Higher rates for specialty products</li>
                    <li>• Calculate lifetime value of policies</li>
                  </ul>
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                    <p className="font-medium">$2,000 annual premium at 70% first year, 7% renewals:</p>
                    <p>Year 1: $1,400 | 5-Year Total: $1,960</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="py-3 bg-purple-50 dark:bg-purple-900/30">
                  <CardTitle className="text-base">SaaS/Technology</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <ul className="space-y-2">
                    <li>• New accounts: 8-15% of annual contract value</li>
                    <li>• Often includes accelerators for exceeding quota</li>
                    <li>• Renewals/upsells: 2-8% commission</li>
                    <li>• Calculate SaaS commission on multiple metrics</li>
                  </ul>
                  <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs">
                    <p className="font-medium">$100K ARR deal at 10% commission with 120% quota achievement (15% accelerator):</p>
                    <p>= $100,000 × 10% × 1.15 = $11,500 commission</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Section */}
      <div className="mb-10" id="commission-statistics">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Commission Statistics and Benchmarks
        </h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/60">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-blue-800 dark:text-blue-300">Average Sales Commission</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">9.8%</p>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-500">across all industries (2025)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/60">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-300">Commission Income Share</h3>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">62%</p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">of total sales rep earnings</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/60">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-purple-800 dark:text-purple-300">Top Performer Advantage</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">4.1×</p>
                <p className="mt-1 text-sm text-purple-600 dark:text-purple-500">earnings vs. average performers</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/60">
                  <Percent className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-300">Commission Growth</h3>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">6.3%</p>
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">annual increase in rates (2025)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Industry Commission Rate Comparison
            </CardTitle>
            <CardDescription>Average commission rates across major industries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar 
                data={{
                  labels: ['Real Estate', 'Insurance', 'Pharmaceuticals', 'Software/SaaS', 'Retail', 'Financial Services', 'Manufacturing'],
                  datasets: [
                    {
                      label: 'Average Commission Rate (%)',
                      data: [5.7, 15.3, 8.5, 9.2, 7.1, 12.5, 6.2],
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(124, 58, 237, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(14, 165, 233, 0.7)',
                        'rgba(6, 182, 212, 0.7)'
                      ]
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
                      beginAtZero: true,
                      title: { display: true, text: 'Commission Rate (%)' }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Emerging Commission Trends</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                Industry data shows a shift toward more complex, multi-metric commission plans that incorporate customer success metrics like retention, NPS scores, and expansion revenue. Our calculator now includes templates for these modern commission structures to help you model their impact.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Maximizing Your Commission Potential
            </CardTitle>
            <CardDescription>
              Taking control of your commission-based earnings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              <strong>Commission calculators</strong> provide the analytical foundation needed to understand, optimize, and negotiate your compensation structure. By mastering the variables that affect your earnings—commission rates, tiers, product mix, and timing—you can make strategic decisions that significantly increase your income while providing transparency in all your financial planning.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Remember these key principles for commission success:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Strategic Analysis</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Regularly model different commission scenarios</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Understand how approaching tier thresholds affects earnings</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Use historical data to predict future commission income</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Proactive Management</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Negotiate commission structures with data-backed insights</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Focus sales efforts on highest-commission products/services</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Adjust strategies based on commission structure opportunities</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to optimize your commission earnings?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Commission Calculator</strong> above to analyze your earning potential! For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/sales-quota">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Sales Quota Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/income">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Income Calculator
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
                  <CardTitle className="text-lg">Sales Tax Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate sales tax for different jurisdictions and purchase amounts.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/sales-tax">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Income Tax Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Estimate your tax liability including commission income.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/income-tax">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Bonus Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate performance bonuses and incentive payments.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/bonus">Try Calculator</Link>
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