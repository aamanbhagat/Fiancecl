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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
  Percent,
  Clock,
  Wallet,
  Calendar,
  Check
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import CompoundInterestSchema from './schema';

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

export default function CompoundInterestCalculator() {
  // Initial Investment & Contributions
  const [initialInvestment, setInitialInvestment] = useState(10000)
  const [monthlyContribution, setMonthlyContribution] = useState(500)
  const [contributionGrowth, setContributionGrowth] = useState(2)
  const [enableContributionGrowth, setEnableContributionGrowth] = useState(false)
  
  // Interest & Time Settings
  const [annualInterestRate, setAnnualInterestRate] = useState(7)
  const [compoundingFrequency, setCompoundingFrequency] = useState<"annually" | "semiannually" | "quarterly" | "monthly" | "daily">("monthly")
  const [timeHorizon, setTimeHorizon] = useState(20)
  
  // Additional Options
  const [includeInflation, setIncludeInflation] = useState(true)
  const [inflationRate, setInflationRate] = useState(2.5)
  const [reinvestDividends, setReinvestDividends] = useState(true)
  const [taxRate, setTaxRate] = useState(25)
  
  // Results State
  const [futureValue, setFutureValue] = useState(0)
  const [realFutureValue, setRealFutureValue] = useState(0)
  const [totalContributions, setTotalContributions] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [yearlyBreakdown, setYearlyBreakdown] = useState<{
    year: number;
    balance: number;
    contributions: number;
    interest: number;
    realBalance: number;
  }[]>([])

  // Calculate compound interest and generate breakdown
  useEffect(() => {
    const periodsPerYearMap = {
      annually: 1,
      semiannually: 2,
      quarterly: 4,
      monthly: 12,
      daily: 365
    };

    const periodsPerYear = periodsPerYearMap[compoundingFrequency] ?? 12;

    const effectiveRate = annualInterestRate / 100;
    const periodicRate = effectiveRate / periodsPerYear;
    const totalPeriods = timeHorizon * periodsPerYear;

    let balance = initialInvestment;
    let totalContributed = initialInvestment;
    let currentContribution = monthlyContribution;
    let breakdown = [];

    for (let year = 1; year <= timeHorizon; year++) {
      let yearlyContributions = 0;
      let yearlyInterest = 0;
      const startingBalance = balance;

      for (let period = 1; period <= periodsPerYear; period++) {
        const periodicContribution = (currentContribution * 12) / periodsPerYear;
        yearlyContributions += periodicContribution;
        
        balance += periodicContribution;
        const interestEarned = balance * periodicRate;
        balance += interestEarned;
        yearlyInterest += interestEarned;
      }

      if (enableContributionGrowth) {
        currentContribution *= (1 + contributionGrowth / 100);
      }

      totalContributed += yearlyContributions;

      const realBalance = includeInflation
        ? balance / Math.pow(1 + inflationRate / 100, year)
        : balance;

      breakdown.push({
        year,
        balance,
        contributions: totalContributed,
        interest: balance - totalContributed,
        realBalance
      });
    }

    setFutureValue(balance);
    setTotalContributions(totalContributed);
    setTotalInterest(balance - totalContributed);
    setRealFutureValue(
      includeInflation
        ? balance / Math.pow(1 + inflationRate / 100, timeHorizon)
        : balance
    );
    setYearlyBreakdown(breakdown);
  }, [
    initialInvestment,
    monthlyContribution,
    contributionGrowth,
    enableContributionGrowth,
    annualInterestRate,
    compoundingFrequency,
    timeHorizon,
    includeInflation,
    inflationRate,
    reinvestDividends
  ]);

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
  };

  // Investment breakdown chart
  const pieChartData = {
    labels: ['Initial Investment', 'Additional Contributions', 'Interest Earned'],
    datasets: [{
      data: [initialInvestment, totalContributions - initialInvestment, totalInterest],
      backgroundColor: chartColors.primary.slice(0, 3),
      borderColor: chartColors.secondary.slice(0, 3).map(color => color.replace('0.2', '1')),
      borderWidth: 2
    }]
  };

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
          return ((value / futureValue) * 100).toFixed(1) + '%';
        }
      }
    }
  };

  // Growth over time chart
  const generateGrowthChart = () => {
    return {
      labels: yearlyBreakdown.map(y => `Year ${y.year}`),
      datasets: [
        {
          label: 'Total Balance',
          data: yearlyBreakdown.map(y => y.balance),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Total Contributions',
          data: yearlyBreakdown.map(y => y.contributions),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4
        },
        {
          label: 'Real Value (Inflation Adjusted)',
          data: yearlyBreakdown.map(y => y.realBalance),
          borderColor: chartColors.primary[2],
          backgroundColor: chartColors.secondary[2],
          tension: 0.4,
          hidden: !includeInflation
        }
      ]
    };
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => {
            return '$' + (typeof value === 'number' ? value.toLocaleString() : value);
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
  };

  // Comparison scenarios chart
  const generateScenarioChart = () => {
    const scenarios = [
      { rate: annualInterestRate - 2, label: 'Conservative' },
      { rate: annualInterestRate, label: 'Expected' },
      { rate: annualInterestRate + 2, label: 'Optimistic' }
    ];

    const calculateScenario = (rate: number) => {
      const periodsPerYear = {
        annually: 1,
        semiannually: 2,
        quarterly: 4,
        monthly: 12,
        daily: 365
      }[compoundingFrequency] ?? 12;

      const periodicRate = (rate / 100) / periodsPerYear;
      let balance = initialInvestment;
      let contribution = monthlyContribution;

      for (let year = 1; year <= timeHorizon; year++) {
        for (let period = 1; period <= periodsPerYear; period++) {
          const periodicContribution = (contribution * 12) / periodsPerYear;
          balance += periodicContribution;
          balance *= (1 + periodicRate);
        }
        if (enableContributionGrowth) {
          contribution *= (1 + contributionGrowth / 100);
        }
      }

      return balance;
    };

    return {
      labels: scenarios.map(s => `${s.label} (${s.rate}%)`),
      datasets: [{
        label: 'Future Value',
        data: scenarios.map(s => calculateScenario(s.rate)),
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary.map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      }]
    };
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => {
            return '$' + (typeof value === 'number' ? value.toLocaleString() : value);
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
        formatter: (value: number) => '$' + value.toLocaleString()
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportPDF = async () => {
    const element = document.getElementById('results-section');
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('compound-interest-analysis.pdf');
  };

  const exportBlogPDF = async () => {
    const element = document.getElementById('blog-section');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });
    const imgWidth = 595;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 842;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 842;
    }

    pdf.save('compound-interest-guide.pdf');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <CompoundInterestSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Compound Interest <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        See how your investments can grow over time with the power of compound interest.
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
                    <CardTitle>Enter Investment Details</CardTitle>
                    <CardDescription>
                      Provide information about your investment strategy and goals to calculate potential returns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Initial Investment & Contributions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Initial Investment & Contributions</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="initial-investment">Initial Investment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="initial-investment"
                              type="number"
                              className="pl-9"
                              value={initialInvestment || ''} onChange={(e) => setInitialInvestment(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="monthly-contribution">Monthly Contribution</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="monthly-contribution"
                              type="number"
                              className="pl-9"
                              value={monthlyContribution || ''} onChange={(e) => setMonthlyContribution(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="contribution-growth">Enable Contribution Growth</Label>
                            <Switch
                              id="contribution-growth"
                              checked={enableContributionGrowth}
                              onCheckedChange={setEnableContributionGrowth}
                            />
                          </div>
                          {enableContributionGrowth && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="growth-rate">Annual Growth Rate</Label>
                                <span className="text-sm text-muted-foreground">{contributionGrowth}%</span>
                              </div>
                              <Slider
                                id="growth-rate"
                                min={0}
                                max={10}
                                step={0.5}
                                value={[contributionGrowth]}
                                onValueChange={(value) => setContributionGrowth(value[0])}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interest & Time Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Interest & Time Settings</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interest-rate">Annual Interest Rate</Label>
                            <span className="text-sm text-muted-foreground">{annualInterestRate}%</span>
                          </div>
                          <Slider
                            id="interest-rate"
                            min={0}
                            max={15}
                            step={0.1}
                            value={[annualInterestRate]}
                            onValueChange={(value) => setAnnualInterestRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compounding-frequency">Compounding Frequency</Label>
                          <Select 
                            value={compoundingFrequency} 
                            onValueChange={(value) => setCompoundingFrequency(value as "annually" | "semiannually" | "quarterly" | "monthly" | "daily")}
                          >
                            <SelectTrigger id="compounding-frequency">
                              <SelectValue placeholder="Select compounding frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="annually">Annually</SelectItem>
                              <SelectItem value="semiannually">Semi-Annually</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time-horizon">Investment Time Horizon</Label>
                          <Select value={String(timeHorizon)} onValueChange={(value) => setTimeHorizon(Number(value))}>
                            <SelectTrigger id="time-horizon">
                              <SelectValue placeholder="Select time horizon" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 Years</SelectItem>
                              <SelectItem value="10">10 Years</SelectItem>
                              <SelectItem value="15">15 Years</SelectItem>
                              <SelectItem value="20">20 Years</SelectItem>
                              <SelectItem value="25">25 Years</SelectItem>
                              <SelectItem value="30">30 Years</SelectItem>
                              <SelectItem value="35">35 Years</SelectItem>
                              <SelectItem value="40">40 Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Options</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="include-inflation">Account for Inflation</Label>
                            <Switch
                              id="include-inflation"
                              checked={includeInflation}
                              onCheckedChange={setIncludeInflation}
                            />
                          </div>
                          {includeInflation && (
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
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="reinvest-dividends">Reinvest Dividends</Label>
                            <Switch
                              id="reinvest-dividends"
                              checked={reinvestDividends}
                              onCheckedChange={setReinvestDividends}
                            />
                          </div>
                        </div>
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
                      <p className="text-sm text-muted-foreground">Future Value</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(futureValue)}</p>
                      {includeInflation && (
                        <p className="text-sm text-muted-foreground">
                          Real Value (Adjusted for Inflation): {formatCurrency(realFutureValue)}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="growth">Growth</TabsTrigger>
                        <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Investment Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Initial Investment</span>
                              <span className="font-medium">{formatCurrency(initialInvestment)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Contributions</span>
                              <span className="font-medium">{formatCurrency(totalContributions - initialInvestment)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Interest Earned</span>
                              <span className="font-medium">{formatCurrency(totalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Future Value</span>
                              <span>{formatCurrency(futureValue)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="growth" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateGrowthChart()} options={lineChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Investment growth over {timeHorizon} years
                        </div>
                      </TabsContent>

                      <TabsContent value="scenarios" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={generateScenarioChart()} options={barChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Comparison of different return scenarios
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Investment Summary */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Investment Summary</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• {formatCurrency(monthlyContribution)} monthly contribution</li>
                              <li>• {annualInterestRate}% annual return</li>
                              <li>• {compoundingFrequency} compounding</li>
                              <li>• {timeHorizon} year investment horizon</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                  
                  <SaveCalculationButton
                    calculatorType="compound-interest"
                    inputs={{
                      initialInvestment,
                      monthlyContribution,
                      contributionGrowth,
                      enableContributionGrowth,
                      annualInterestRate,
                      compoundingFrequency,
                      timeHorizon,
                      includeInflation,
                      inflationRate,
                      reinvestDividends,
                      taxRate
                    }}
                    results={{
                      futureValue,
                      realFutureValue,
                      totalContributions,
                      totalInterest,
                      yearlyBreakdown
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Financial Tool</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Compound Interest Calculator: The Path to Financial Growth</h2>
        <p className="mt-3 text-muted-foreground text-lg">Discover how your money can multiply over time through the power of compounding</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-12 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Compound Interest
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 id="what-is-compound-interest" className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">What is Compound Interest?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <p>
                <strong>Compound interest</strong> is often described as the eighth wonder of the world—a powerful financial concept where you earn interest not only on your initial investment but also on the accumulated interest over time. Unlike simple interest, which calculates returns based solely on the principal amount, compound interest creates an accelerating growth curve that can transform modest savings into substantial wealth.
              </p>
              <p className="mt-2">
                The core elements that influence compound interest growth include:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Principal amount (your initial investment)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Interest rate (annual return percentage)</span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Compounding frequency (how often interest is calculated)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Time horizon (investment duration)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  <span>Additional contributions (periodic deposits)</span>
                </li>
              </ul>
              <p>
                A compound interest calculator brings these variables together in a user-friendly tool that lets you visualize potential growth and plan your financial future with precision.
              </p>
            </div>
            <div className="md:w-[300px] h-[260px] flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/60 dark:to-cyan-900/60">
                  <CardTitle className="text-sm font-medium text-center">Compound vs. Simple Interest</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full h-full">
                    <Line 
                      data={{
                        labels: ['Year 0', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
                        datasets: [
                          {
                            label: 'Simple Interest',
                            data: [10000, 15000, 20000, 25000, 30000, 35000, 40000],
                            borderColor: 'rgba(59, 130, 246, 0.8)',
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          },
                          {
                            label: 'Compound Interest',
                            data: [10000, 16289, 26533, 43219, 70400, 114674, 186689],
                            borderColor: 'rgba(20, 184, 166, 0.8)',
                            backgroundColor: 'rgba(20, 184, 166, 0.2)',
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
                            title: {
                              display: true,
                              text: 'Value ($)'
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
          
          <h4 id="einstein-quote" className="font-semibold text-xl mt-6">The Exponential Growth Phenomenon</h4>
          <div className="mt-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Einstein's Wisdom</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">"Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it."</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">The Rule of 72</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Divide 72 by your interest rate to estimate how many years it will take to double your money (e.g., at 8%, your money doubles in approximately 9 years)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Time Value of Money</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">The earlier you start investing, the more dramatic your growth potential due to compound interest's accelerating curve</p>
                </div>
              </div>
            </div>
          </div>
          
          <p>
            Understanding compound interest is vital because it works in two directions: it can help build wealth when you're earning it on investments, but it can also increase debt burdens when you're paying it on loans. A compound interest calculator provides clarity on both scenarios, helping you make informed financial decisions that align with your long-term goals.
          </p>
        </CardContent>
      </Card>

      {/* Compound Interest Mechanics Section */}
      <div className="mb-12" id="compound-mechanics">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">The Mechanics of Compound Interest</h2>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="compounding-frequency" className="font-bold text-xl mb-4">Understanding Compounding Frequency</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p>
                <strong>Compounding frequency</strong> refers to how often interest is calculated and added to your principal. The more frequently compounding occurs, the more your money grows—even with the same nominal interest rate.
              </p>
              
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-300">Common Compounding Frequencies:</p>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Annual</p>
                        <p className="text-blue-700 dark:text-blue-400">
                          Interest calculated once per year
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Quarterly</p>
                        <p className="text-blue-700 dark:text-blue-400">
                          Interest calculated four times per year
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Monthly</p>
                        <p className="text-blue-700 dark:text-blue-400">
                          Interest calculated twelve times per year
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Daily</p>
                        <p className="text-blue-700 dark:text-blue-400">
                          Interest calculated every day
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="h-[220px]">
                <Bar
                  data={{
                    labels: ['Annual', 'Semi-Annual', 'Quarterly', 'Monthly', 'Daily'],
                    datasets: [
                      {
                        label: '$10,000 @ 5% for 20 years',
                        data: [26533, 26729, 26834, 26903, 26929],
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
                      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } },
                      datalabels: {
                        formatter: (value) => '$' + value.toLocaleString(),
                        color: '#fff',
                        font: { weight: 'bold' }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: 26000,
                        title: {
                          display: true,
                          text: 'Final Value ($)'
                        }
                      }
                    }
                  }}
                />
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    <strong>Effective Annual Rate (EAR):</strong> When comparing investments with different compounding frequencies, look at the EAR rather than the stated rate. For example, 5% compounded monthly has an EAR of 5.12%.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h3 id="compound-formula" className="font-bold text-xl mt-8 mb-4">The Compound Interest Formula</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300">For a Single Initial Investment:</h4>
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-md overflow-x-auto">
                  <p className="font-mono text-blue-800 dark:text-blue-300">
                    A = P(1 + r/n)<sup>nt</sup>
                  </p>
                </div>
                <div className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <p><strong>A</strong> = final amount</p>
                  <p><strong>P</strong> = principal (initial investment)</p>
                  <p><strong>r</strong> = annual interest rate (decimal)</p>
                  <p><strong>n</strong> = compounding frequency per year</p>
                  <p><strong>t</strong> = time in years</p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="p-4 bg-green-50/50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300">With Periodic Contributions:</h4>
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-md overflow-x-auto">
                  <p className="font-mono text-green-800 dark:text-green-300">
                    A = P(1 + r/n)<sup>nt</sup> + PMT × [((1 + r/n)<sup>nt</sup> - 1) ÷ (r/n)]
                  </p>
                </div>
                <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-400">
                  <p><strong>PMT</strong> = periodic contribution amount</p>
                  <p><em>Plus all variables from the basic formula</em></p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Calculator Advantage:</strong> While these formulas can be complex to calculate manually, our Compound Interest Calculator handles all the math instantly, allowing you to focus on strategy rather than calculations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Continuous Compounding:</strong> The ultimate compounding frequency is continuous compounding, where interest is calculated and added to the principal at every possible moment. The formula for continuous compounding is A = Pe<sup>rt</sup>, where e is the mathematical constant approximately equal to 2.71828.
            </p>
          </div>
        </div>
      </div>

      {/* Using the Calculator Section */}
      <div className="mb-12" id="calculator-guide">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Using the Compound Interest Calculator</span>
              </div>
            </CardTitle>
            <CardDescription>
              Maximize your financial planning with precise projections
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="calculator-inputs" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Calculator Inputs Explained
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Initial Investment & Contributions</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5" />
                        <span><strong>Initial investment:</strong> The amount you start with</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <RefreshCw className="h-4 w-4 mt-0.5" />
                        <span><strong>Regular contribution:</strong> Amount added periodically</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-0.5" />
                        <span><strong>Contribution frequency:</strong> Monthly, quarterly, etc.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Growth Parameters</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 mt-0.5" />
                        <span><strong>Interest rate:</strong> Annual percentage yield</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <RefreshCw className="h-4 w-4 mt-0.5" />
                        <span><strong>Compounding frequency:</strong> How often interest is calculated</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-0.5" />
                        <span><strong>Time period:</strong> Investment duration in years</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Advanced Options</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 mt-0.5" />
                        <span><strong>Inflation rate:</strong> For calculating real returns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5" />
                        <span><strong>Tax rate:</strong> For after-tax growth projections</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 mt-0.5" />
                        <span><strong>Contribution increase:</strong> Annual growth in contributions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="calculator-results" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Understanding Your Results
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Key Output Metrics</h4>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Final Balance</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Total accumulated value at the end of your time period
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Total Contributions</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Sum of all money you've deposited (initial + periodic)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Interest Earned</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Amount generated through compound interest
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Inflation-Adjusted Value</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Future value expressed in today's purchasing power
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>Pro Tip:</strong> Pay attention to the growth chart's inflection point—where the curve starts to steepen significantly. This illustrates when compound interest truly begins to accelerate your wealth growth.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <h4 className="font-medium text-purple-800 dark:text-purple-300">Visual Breakdowns</h4>
                    <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                      The calculator provides several helpful visualizations:
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-purple-700 dark:text-purple-400">
                      <li className="flex items-start gap-2">
                        <PieChart className="h-4 w-4 mt-0.5" />
                        <span><strong>Contribution vs. Interest breakdown</strong> showing how much of your final balance comes from deposits vs. growth</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <LineChart className="h-4 w-4 mt-0.5" />
                        <span><strong>Year-by-year growth chart</strong> illustrating the accelerating nature of compound interest</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart3 className="h-4 w-4 mt-0.5" />
                        <span><strong>Comparison scenarios</strong> with different interest rates or contribution amounts</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Practical Application Examples
            </h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    College Fund (18 Years)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Initial deposit:</span>
                      <span className="font-medium">$5,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly contribution:</span>
                      <span className="font-medium">$200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Interest rate:</span>
                      <span className="font-medium">6% annually</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Compounding:</span>
                      <span className="font-medium">Monthly</span>
                    </div>
                    <div className="flex justify-between bg-blue-50 dark:bg-blue-900/20 p-1 rounded">
                      <span className="text-sm font-medium">Final balance:</span>
                      <span className="font-bold">$93,405</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total contributions:</span>
                      <span className="font-medium">$48,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Interest earned:</span>
                      <span className="font-medium">$45,205</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-green-600" />
                    Retirement (30 Years)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Initial deposit:</span>
                      <span className="font-medium">$20,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly contribution:</span>
                      <span className="font-medium">$500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Interest rate:</span>
                      <span className="font-medium">7% annually</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Compounding:</span>
                      <span className="font-medium">Monthly</span>
                    </div>
                    <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-1 rounded">
                      <span className="text-sm font-medium">Final balance:</span>
                      <span className="font-bold">$708,180</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total contributions:</span>
                      <span className="font-medium">$200,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Interest earned:</span>
                      <span className="font-medium">$508,180</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="bg-purple-50 dark:bg-purple-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-purple-600" />
                    Home Down Payment (5 Years)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Initial deposit:</span>
                      <span className="font-medium">$10,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly contribution:</span>
                      <span className="font-medium">$800</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Interest rate:</span>
                      <span className="font-medium">4% annually</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Compounding:</span>
                      <span className="font-medium">Monthly</span>
                    </div>
                    <div className="flex justify-between bg-purple-50 dark:bg-purple-900/20 p-1 rounded">
                      <span className="text-sm font-medium">Final balance:</span>
                      <span className="font-bold">$61,226</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total contributions:</span>
                      <span className="font-medium">$58,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Interest earned:</span>
                      <span className="font-medium">$3,226</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Key Observation</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    Notice how the interest earned increases dramatically with longer time horizons. In the 5-year scenario, interest makes up only 5% of the final balance. In the 30-year retirement scenario, interest accounts for over 71% of the final amount—demonstrating the incredible long-term potential of compound growth.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Considerations Section */}
      <div className="mb-12" id="strategic-considerations">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-blue-600" />
          Strategic Considerations
        </h2>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">The Early Start Advantage</h3>
                
                <div className="space-y-4">
                  <p>
                    One of the most powerful aspects of compound interest is the extraordinary value of starting early. Even small amounts invested consistently from a young age can outperform much larger investments started later.
                  </p>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <Clock className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">The Tale of Two Investors</h4>
                      <div className="mt-1 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                        <p><strong>Investor A:</strong> Invests $5,000/year from age 25-35 ($50,000 total)</p>
                        <p><strong>Investor B:</strong> Invests $5,000/year from age 35-65 ($150,000 total)</p>
                        <p className="font-medium">At 8% returns, Investor A ends up with more money at age 65 despite investing 1/3 as much</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[200px]">
                    <Line 
                      data={{
                        labels: ['25', '30', '35', '40', '45', '50', '55', '60', '65'],
                        datasets: [
                          {
                            label: 'Early Investor (25-35)',
                            data: [5000, 33400, 73571, 108098, 158823, 233261, 342593, 503124, 738888],
                            borderColor: 'rgba(16, 185, 129, 0.8)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4
                          },
                          {
                            label: 'Late Investor (35-65)',
                            data: [0, 0, 5000, 33400, 73571, 129187, 205908, 310738, 453165],
                            borderColor: 'rgba(99, 102, 241, 0.8)',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            tension: 0.4
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: 'Growth Comparison by Age'
                          },
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 12 }
                          }
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Age'
                            }
                          },
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Value ($)'
                            },
                            ticks: { callback: value => '$' + value.toLocaleString() }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">The Impact of Interest Rates</h3>
                
                <div className="space-y-4">
                  <p>
                    Small differences in interest rates can lead to dramatically different outcomes over time. This highlights the importance of seeking the best possible returns for your risk tolerance level.
                  </p>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <h4 className="font-medium text-purple-800 dark:text-purple-300">$10,000 Initial Investment (30 Years)</h4>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700 dark:text-purple-400">3% annual return:</span>
                        <span className="font-medium text-purple-700 dark:text-purple-400">$24,273</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700 dark:text-purple-400">5% annual return:</span>
                        <span className="font-medium text-purple-700 dark:text-purple-400">$43,219</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700 dark:text-purple-400">7% annual return:</span>
                        <span className="font-medium text-purple-700 dark:text-purple-400">$76,123</span>
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-sm text-purple-800 dark:text-purple-300">10% annual return:</span>
                        <span className="text-purple-800 dark:text-purple-300">$174,494</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mt-6 mb-3">The Cost of Missed Opportunities</h3>
                  
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                      <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-300">The High Cost of Waiting</h4>
                      <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                        Delaying investment by just 10 years can reduce your final balance by 50% or more. Each year of delay reduces your compound growth potential in ways that are difficult to make up later.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Regular Contributions Matter</h4>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                      Consistent regular contributions—even small ones—often yield better results than larger lump sums invested intermittently. Our calculator can demonstrate how different contribution patterns affect your long-term results.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>The Rule of 72:</strong> A quick way to estimate how long it will take for your money to double is to divide 72 by your annual interest rate. For example, at 8% interest, your money doubles in approximately 9 years (72 ÷ 8 = 9). This mental shortcut helps you quickly understand growth potential.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <h3 id="common-scenarios" className="text-xl font-bold mb-4">Common Applications of Compound Interest</h3>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Investment Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                Compound interest powers stock market returns, mutual funds, ETFs, and other long-term investments. Understanding compound growth helps set realistic expectations and plan for wealth accumulation.
              </p>
              <div className="flex items-start gap-2 mt-2">
                <Check className="h-4 w-4 text-green-500 mt-1" />
                <p className="text-sm"><strong>Best for:</strong> Retirement accounts, education funds, and long-term wealth building</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-500" />
                Debt Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                Compound interest works against you with debt, especially high-interest credit cards. Understanding how interest compounds on debt helps prioritize which debts to pay off first.
              </p>
              <div className="flex items-start gap-2 mt-2">
                <Check className="h-4 w-4 text-green-500 mt-1" />
                <p className="text-sm"><strong>Best for:</strong> Credit card payoff planning, student loan strategies, and debt snowball calculations</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 dark:border-purple-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <LineChart className="h-5 w-5 text-purple-500" />
                Financial Goal Setting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                Compound interest calculations provide clear targets for saving toward specific goals. The calculator helps determine exactly how much to save monthly to achieve your desired future amount.
              </p>
              <div className="flex items-start gap-2 mt-2">
                <Check className="h-4 w-4 text-green-500 mt-1" />
                <p className="text-sm"><strong>Best for:</strong> Home down payments, vacation funds, emergency savings, and major purchase planning</p>
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
              <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Harnessing the Power of Compound Interest
            </CardTitle>
            <CardDescription>
              Maximizing your financial potential through informed planning
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              The <strong>Compound Interest Calculator</strong> is more than just a financial tool—it's a window into your future financial possibilities. By visualizing how different variables affect your long-term results, you can make informed decisions today that will significantly impact your financial well-being for decades to come.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Remember these fundamental principles as you apply compound interest to your financial planning:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Foundational Concepts</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Time is your most valuable asset in compound growth</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Higher interest rates dramatically affect long-term results</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Consistent contributions build wealth more effectively than timing the market</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Action Steps</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Start investing now, even with small amounts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Increase your savings rate whenever possible</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Review and adjust your strategy as your financial situation evolves</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to see how your money can grow?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Compound Interest Calculator</strong> above to create personalized projections for your financial goals. For more financial planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/401k">
                        <Clock className="h-4 w-4 mr-1" />
                        Retirement Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/investment">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Investment Calculator
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
                  <CardTitle className="text-lg">Investment Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Project investment growth with different contribution strategies and market scenarios.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/investment">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Savings Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Plan your savings strategy to reach specific financial goals.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/savings">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">ROI Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate the return on investment for various financial decisions.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/roi">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}