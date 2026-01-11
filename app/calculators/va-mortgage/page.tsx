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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  DollarSign,
  Download,
  PieChart,
  BarChart3,
  LineChart,
  Info,
  AlertCircle,
  Medal,
  Home,
  Calculator,
  Percent,
  Clock,
  Check,
  Calendar,
  ArrowRightLeft,
  TrendingUp
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import VaMortgageSchema from './schema';

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

export default function VAMortgageCalculator() {
  // Loan Details State
  const [loanAmount, setLoanAmount] = useState<number>(300000)
  const [interestRate, setInterestRate] = useState<number>(6.5)
  const [loanTerm, setLoanTerm] = useState<number>(30)
  const [isFirstTimeUse, setIsFirstTimeUse] = useState<boolean>(true)
  const [serviceType, setServiceType] = useState<string>("regular")
  const [disabilityStatus, setDisabilityStatus] = useState<boolean>(false)
  
  // Property Details State
  const [propertyType, setPropertyType] = useState<string>("single")
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(1.2)
  const [insuranceRate, setInsuranceRate] = useState<number>(0.5)
  const [includeHOA, setIncludeHOA] = useState<boolean>(false)
  const [hoaFees, setHoaFees] = useState<number>(250)
  
  // Results State
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0)
  const [fundingFee, setFundingFee] = useState<number>(0)
  const [paymentBreakdown, setPaymentBreakdown] = useState<{
    principalAndInterest: number;
    propertyTax: number;
    insurance: number;
    hoa: number;
  }>({
    principalAndInterest: 0,
    propertyTax: 0,
    insurance: 0,
    hoa: 0
  })
  const [amortizationSchedule, setAmortizationSchedule] = useState<{
    balance: number[];
    principal: number[];
    interest: number[];
  }>({
    balance: [],
    principal: [],
    interest: []
  })

  // Calculate funding fee percentage based on service type and usage
  const calculateFundingFeePercentage = () => {
    if (disabilityStatus) return 0;
    
    if (serviceType === "regular") {
      return isFirstTimeUse ? 2.3 : 3.6;
    } else if (serviceType === "reserves") {
      return isFirstTimeUse ? 2.3 : 3.6;
    }
    return 0;
  }

  // Calculate monthly payment and amortization schedule
  useEffect(() => {
    // Calculate funding fee
    const fundingFeePercentage = calculateFundingFeePercentage();
    const fundingFeeAmount = (loanAmount * fundingFeePercentage) / 100;
    setFundingFee(fundingFeeAmount);
    
    // Calculate total loan amount including funding fee
    const totalLoanAmount = loanAmount + fundingFeeAmount;
    
    // Calculate monthly principal and interest
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    const monthlyPrincipalAndInterest = totalLoanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    // Calculate other monthly costs
    const monthlyPropertyTax = (loanAmount * (propertyTaxRate / 100)) / 12;
    const monthlyInsurance = (loanAmount * (insuranceRate / 100)) / 12;
    const monthlyHOA = includeHOA ? hoaFees : 0;
    
    // Calculate total monthly payment
    const totalMonthlyPayment = monthlyPrincipalAndInterest + 
      monthlyPropertyTax + monthlyInsurance + monthlyHOA;
    
    // Generate amortization schedule
    const schedule = {
      balance: [] as number[],
      principal: [] as number[],
      interest: [] as number[]
    };
    
    let remainingBalance = totalLoanAmount;
    for (let i = 0; i < numberOfPayments; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPrincipalAndInterest - interestPayment;
      remainingBalance -= principalPayment;
      
      schedule.balance.push(Math.max(0, remainingBalance));
      schedule.principal.push(principalPayment);
      schedule.interest.push(interestPayment);
    }
    
    // Update state with calculations
    setMonthlyPayment(totalMonthlyPayment);
    setPaymentBreakdown({
      principalAndInterest: monthlyPrincipalAndInterest,
      propertyTax: monthlyPropertyTax,
      insurance: monthlyInsurance,
      hoa: monthlyHOA
    });
    setAmortizationSchedule(schedule);
    
  }, [
    loanAmount,
    interestRate,
    loanTerm,
    isFirstTimeUse,
    serviceType,
    disabilityStatus,
    propertyTaxRate,
    insuranceRate,
    includeHOA,
    hoaFees
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
  }

  // Payment breakdown chart data
  const pieChartData = {
    labels: ['Principal & Interest', 'Property Tax', 'Insurance', 'HOA'],
    datasets: [{
      data: [
        paymentBreakdown.principalAndInterest,
        paymentBreakdown.propertyTax,
        paymentBreakdown.insurance,
        paymentBreakdown.hoa
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
          const total = Object.values(paymentBreakdown).reduce((a, b) => a + b, 0);
          return ((value / total) * 100).toFixed(1) + '%';
        }
      }
    }
  }

  // Generate amortization chart data
  const generateAmortizationChart = () => {
    const years = Array.from(
      { length: Math.ceil(amortizationSchedule.balance.length / 12) }, 
      (_, i) => `Year ${i + 1}`
    );
    
    return {
      labels: years,
      datasets: [
        {
          label: 'Loan Balance',
          data: amortizationSchedule.balance.filter((_, i) => i % 12 === 0),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          tension: 0.4
        },
        {
          label: 'Principal Paid',
          data: amortizationSchedule.principal.filter((_, i) => i % 12 === 0),
          borderColor: chartColors.primary[1],
          backgroundColor: chartColors.secondary[1],
          tension: 0.4
        },
        {
          label: 'Interest Paid',
          data: amortizationSchedule.interest.filter((_, i) => i % 12 === 0),
          borderColor: chartColors.primary[2],
          backgroundColor: chartColors.secondary[2],
          tension: 0.4
        }
      ]
    }
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
    pdf.save('va-mortgage-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <VaMortgageSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        VA Mortgage <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Calculate your VA loan payments and understand the benefits of VA-backed home loans for veterans, service members, and eligible spouses.
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
                    <CardTitle>Enter Loan Details</CardTitle>
                    <CardDescription>
                      Provide information about your VA loan and property to calculate payments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Loan Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Loan Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="loan-amount">Loan Amount</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="loan-amount"
                              type="number"
                              className="pl-9"
                              value={loanAmount || ''} onChange={(e) => setLoanAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interest-rate">Interest Rate</Label>
                            <span className="text-sm text-muted-foreground">{interestRate}%</span>
                          </div>
                          <Slider
                            id="interest-rate"
                            min={2}
                            max={10}
                            step={0.125}
                            value={[interestRate]}
                            onValueChange={(value) => setInterestRate(value[0])}
                          />
                        </div>
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
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="property-type">Property Type</Label>
                          <Select value={propertyType} onValueChange={setPropertyType}>
                            <SelectTrigger id="property-type">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single Family</SelectItem>
                              <SelectItem value="condo">Condominium</SelectItem>
                              <SelectItem value="multi">Multi-Unit (2-4 units)</SelectItem>
                              <SelectItem value="manufactured">Manufactured Home</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* VA Eligibility */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">VA Eligibility</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="service-type">Service Type</Label>
                          <Select value={serviceType} onValueChange={setServiceType}>
                            <SelectTrigger id="service-type">
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular">Regular Military</SelectItem>
                              <SelectItem value="reserves">Reserves/National Guard</SelectItem>
                              <SelectItem value="spouse">Surviving Spouse</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="first-use">First Time Using VA Loan</Label>
                            <Switch
                              id="first-use"
                              checked={isFirstTimeUse}
                              onCheckedChange={setIsFirstTimeUse}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="disability">Service-Connected Disability</Label>
                            <Switch
                              id="disability"
                              checked={disabilityStatus}
                              onCheckedChange={setDisabilityStatus}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Costs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Costs</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="property-tax">Property Tax Rate</Label>
                            <span className="text-sm text-muted-foreground">{propertyTaxRate}%</span>
                          </div>
                          <Slider
                            id="property-tax"
                            min={0.5}
                            max={3}
                            step={0.1}
                            value={[propertyTaxRate]}
                            onValueChange={(value) => setPropertyTaxRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="insurance-rate">Insurance Rate</Label>
                            <span className="text-sm text-muted-foreground">{insuranceRate}%</span>
                          </div>
                          <Slider
                            id="insurance-rate"
                            min={0.2}
                            max={1}
                            step={0.1}
                            value={[insuranceRate]}
                            onValueChange={(value) => setInsuranceRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="hoa-toggle">Include HOA Fees</Label>
                            <Switch
                              id="hoa-toggle"
                              checked={includeHOA}
                              onCheckedChange={setIncludeHOA}
                            />
                          </div>
                          {includeHOA && (
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="hoa-fees"
                                type="number"
                                className="pl-9"
                                placeholder="Monthly HOA fees"
                                value={hoaFees || ''} onChange={(e) => setHoaFees(e.target.value === '' ? 0 : Number(e.target.value))}
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
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(monthlyPayment)}</p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Payment</TabsTrigger>
                        <TabsTrigger value="funding">Funding Fee</TabsTrigger>
                        <TabsTrigger value="amortization">Amortization</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Monthly Payment Details</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Principal & Interest</span>
                              <span className="font-medium">{formatCurrency(paymentBreakdown.principalAndInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Property Tax</span>
                              <span className="font-medium">{formatCurrency(paymentBreakdown.propertyTax)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Insurance</span>
                              <span className="font-medium">{formatCurrency(paymentBreakdown.insurance)}</span>
                            </div>
                            {paymentBreakdown.hoa > 0 && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">HOA Fees</span>
                                <span className="font-medium">{formatCurrency(paymentBreakdown.hoa)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Monthly Payment</span>
                              <span>{formatCurrency(monthlyPayment)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="funding" className="space-y-4">
                        <Card className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Medal className="h-5 w-5 text-primary" />
                              <h4 className="font-medium">VA Funding Fee Details</h4>
                            </div>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Funding Fee Percentage</span>
                                <span className="font-medium">{calculateFundingFeePercentage()}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Funding Fee Amount</span>
                                <span className="font-medium">{formatCurrency(fundingFee)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center font-semibold">
                                <span>Total Loan Amount with Funding Fee</span>
                                <span>{formatCurrency(loanAmount + fundingFee)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        {disabilityStatus && (
                          <div className="flex items-start gap-2 bg-green-500/10 p-4 rounded-lg">
                            <Info className="h-5 w-5 mt-0.5 text-green-500" />
                            <div>
                              <p className="font-medium text-green-500">VA Funding Fee Exempt</p>
                              <p className="text-sm text-muted-foreground">
                                Due to your service-connected disability status, you are exempt from paying the VA funding fee.
                              </p>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="amortization" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={generateAmortizationChart()} options={lineChartOptions} />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Loan balance and payments over time
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* VA Loan Benefits */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Medal className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">VA Loan Benefits</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• No down payment required</li>
                              <li>• No private mortgage insurance (PMI)</li>
                              <li>• Competitive interest rates</li>
                              <li>• Limited closing costs</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                  
                  <SaveCalculationButton
                    calculatorType="va-mortgage"
                    inputs={{
                      homePrice,
                      downPayment,
                      interestRate,
                      loanTerm
                    }}
                    results={{
                      loanAmount,
                      monthlyPayment,
                      totalCost,
                      totalInterest
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Veterans Benefit</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">VA Mortgage Calculator: Your Military Service Benefit</h2>
        <p className="mt-3 text-muted-foreground text-lg">Understand your VA loan options with this powerful homebuying tool for veterans</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding VA Home Loans
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                A <strong>VA Mortgage Calculator</strong> helps active-duty service members, veterans, and eligible surviving spouses understand the financial aspects of using their VA loan benefit—a mortgage option backed by the U.S. Department of Veterans Affairs that offers significant advantages over conventional loan products.
              </p>
              <p className="mt-3">
                VA loans offer several major benefits:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span><strong>No down payment required</strong> in most cases</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span><strong>No private mortgage insurance (PMI)</strong> requirements</span>
                </li>
                <li className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Competitive interest rates, often lower than conventional loans</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Limited closing costs that can be negotiated with sellers</span>
                </li>
              </ul>
              <p>
                For those who've served our country, VA loans represent one of the most valuable homebuying benefits available, making homeownership more accessible and affordable.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Veterans Using VA Loans</h3>
                <div className="h-[200px]">
                  <Line 
                    data={{
                      labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
                      datasets: [
                        {
                          label: 'Number of VA Loans (thousands)',
                          data: [610, 624, 1245, 1440, 1037, 380, 492],
                          borderColor: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4
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
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">VA loan usage has fluctuated with interest rates, showing dramatic increases during periods of low rates</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> The VA loan program was established in 1944 as part of the original GI Bill, helping returning WWII veterans achieve homeownership. Since then, the VA has guaranteed over 25 million home loans for veterans and their families.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Components of VA Loans */}
      <div className="mb-10" id="va-components">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Key Components of VA Loans
        </h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="funding-fee" className="font-bold text-xl mb-4">VA Funding Fee</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-4">
                While VA loans don't require monthly mortgage insurance, they do include a one-time <strong>VA funding fee</strong> that helps sustain the program for future veterans.
              </p>
              
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Key Points About the VA Funding Fee:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">✓</span>
                    <div>
                      <p className="text-blue-700 dark:text-blue-400">Can be financed into your loan amount instead of paid upfront</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">✓</span>
                    <div>
                      <p className="text-blue-700 dark:text-blue-400">Varies based on down payment, service type, and whether it's your first VA loan</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">✓</span>
                    <div>
                      <p className="text-blue-700 dark:text-blue-400">Several categories of veterans are exempt, including those with service-connected disabilities</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div>
              <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h4 className="font-medium mb-3">VA Funding Fee Table (2025)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-blue-50 dark:bg-blue-900/30">
                        <th className="border px-3 py-2 text-left">Down Payment</th>
                        <th className="border px-3 py-2 text-left">First Use</th>
                        <th className="border px-3 py-2 text-left">Subsequent Use</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-3 py-2">0%</td>
                        <td className="border px-3 py-2">2.15%</td>
                        <td className="border px-3 py-2">3.3%</td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">5-9.99%</td>
                        <td className="border px-3 py-2">1.5%</td>
                        <td className="border px-3 py-2">1.5%</td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">10% or more</td>
                        <td className="border px-3 py-2">1.25%</td>
                        <td className="border px-3 py-2">1.25%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Rates for active duty, reserves and National Guard may differ</p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Calculator Tip:</strong> When using the VA mortgage calculator, be sure to include the funding fee in your calculations for an accurate estimate of your loan amount and monthly payments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h3 id="eligibility" className="font-bold text-xl mt-8 mb-4">VA Loan Eligibility</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3">
                To qualify for a VA loan, you must meet service requirements and obtain a Certificate of Eligibility (COE). Eligibility typically requires one of these service minimums:
              </p>
              
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Service Requirements:</h4>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">✓</span>
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">90 consecutive days of active service during wartime</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">✓</span>
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">181 days of active service during peacetime</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">✓</span>
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">6 years of service in the National Guard or Reserves</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">✓</span>
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Spouse of a service member who died in the line of duty or from a service-connected disability</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">VA Entitlement</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                  Your VA entitlement determines how much you can borrow without making a down payment. The basic entitlement is $36,000, but most veterans also have a bonus entitlement that brings the total loan guaranty to:
                </p>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <p className="font-medium text-center text-blue-800 dark:text-blue-300">
                    25% of the conforming loan limit in your county
                  </p>
                  <p className="text-xs text-center text-blue-700 dark:text-blue-400 mt-1">
                    (In most areas, that's 25% of $766,550 = $191,637.50 in 2024)
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">No Loan Limits for Full Entitlement</p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                      Veterans with full entitlement aren't restricted by loan limits. You can borrow as much as a lender is willing to lend based on your income and credit—without a down payment. This is a significant benefit for those purchasing in high-cost areas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Property Requirements:</strong> The VA has specific property condition standards to ensure the home is safe, sound, and sanitary. These requirements can be more stringent than conventional loans, but they protect veterans from buying homes with significant issues. The property must be intended as your primary residence—VA loans cannot be used for purely investment properties.
            </p>
          </div>
        </div>
      </div>

      {/* VA Calculator Guide */}
      <div className="mb-10" id="calculator-guide">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Using the VA Mortgage Calculator</span>
              </div>
            </CardTitle>
            <CardDescription>
              Getting accurate payment estimates for your VA loan
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="calculator-inputs" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Essential Calculator Inputs
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Required Information</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Home className="h-4 w-4 mt-0.5" />
                        <span><strong>Home price:</strong> The purchase price of the property</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5" />
                        <span><strong>Down payment:</strong> If any (VA loans don't require one)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-0.5" />
                        <span><strong>Loan term:</strong> Typically 15 or 30 years</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 mt-0.5" />
                        <span><strong>Interest rate:</strong> Current VA loan rate you qualify for</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calculator className="h-4 w-4 mt-0.5" />
                        <span><strong>VA funding fee:</strong> Based on service type, down payment, and loan usage</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Additional Costs</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Property taxes:</strong> Annual amount divided by 12</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Homeowners insurance:</strong> Annual premium divided by 12</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>HOA fees:</strong> If applicable</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="payment-breakdown" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Understanding Payment Breakdown
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Monthly Payment Components</h4>
                    
                    <div className="mt-4 h-[200px]">
                      <Pie
                        data={{
                          labels: ['Principal & Interest', 'Property Taxes', 'Insurance', 'HOA'],
                          datasets: [{
                            data: [1425, 250, 100, 0],
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(20, 184, 166, 0.8)',
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(168, 85, 247, 0.8)'
                            ]
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'right', labels: { boxWidth: 12 } }
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs mt-2 text-center text-blue-600 dark:text-blue-400">
                      Example payment breakdown for a $300,000 VA loan with no down payment
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>Pro Tip:</strong> Unlike FHA loans, VA loans don't require monthly mortgage insurance, which typically saves borrowers $100-$200 per month on a comparable loan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Sample VA Loan Calculation
            </h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="bg-orange-50 dark:bg-orange-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Home className="h-5 w-5 text-orange-600" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Home price:</span>
                      <span className="font-medium">$300,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Down payment:</span>
                      <span className="font-medium">$0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Loan amount:</span>
                      <span className="font-medium">$300,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">VA funding fee (2.15%):</span>
                      <span className="font-medium">$6,450</span>
                    </div>
                    <div className="flex justify-between bg-orange-50 dark:bg-orange-900/20 p-1 rounded">
                      <span className="text-sm font-medium">Total financed:</span>
                      <span className="font-bold">$306,450</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Percent className="h-5 w-5 text-blue-600" />
                    Loan Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Loan term:</span>
                      <span className="font-medium">30 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Interest rate:</span>
                      <span className="font-medium">5.25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Property tax rate:</span>
                      <span className="font-medium">1.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Annual insurance:</span>
                      <span className="font-medium">$1,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly HOA:</span>
                      <span className="font-medium">$0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-green-600" />
                    Monthly Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Principal & Interest:</span>
                      <span className="font-medium">$1,692</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Property taxes:</span>
                      <span className="font-medium">$250</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Insurance:</span>
                      <span className="font-medium">$100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">HOA fee:</span>
                      <span className="font-medium">$0</span>
                    </div>
                    <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-1 rounded font-bold">
                      <span className="text-sm">Total payment:</span>
                      <span>$2,042</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">VA Loan Affordability Guidelines</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    The VA uses a unique residual income approach to determine affordability, which considers region, family size, and how much money you have left after paying major expenses. Additionally, they recommend a debt-to-income ratio of 41% or less, though exceptions can be made for strong borrowers with compensating factors.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VA vs. Other Loans Comparison */}
      <div className="mb-10" id="va-comparison">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ArrowRightLeft className="h-6 w-6 text-blue-600" />
          VA Loans vs. Other Mortgage Options
        </h2>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 border-b">Feature</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-blue-600 dark:text-blue-400 border-b">VA Loan</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-purple-600 dark:text-purple-400 border-b">Conventional Loan</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-green-600 dark:text-green-400 border-b">FHA Loan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-3 px-4 text-sm font-medium">Minimum Down Payment</td>
                    <td className="py-3 px-4 text-sm text-blue-700 dark:text-blue-300">0%</td>
                    <td className="py-3 px-4 text-sm text-purple-700 dark:text-purple-300">3-5%<br />(20% to avoid PMI)</td>
                    <td className="py-3 px-4 text-sm text-green-700 dark:text-green-300">3.5% (580+ credit)<br />10% (500-579 credit)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm font-medium">Mortgage Insurance</td>
                    <td className="py-3 px-4 text-sm text-blue-700 dark:text-blue-300">None<br />(one-time funding fee)</td>
                    <td className="py-3 px-4 text-sm text-purple-700 dark:text-purple-300">PMI required until 20% equity reached</td>
                    <td className="py-3 px-4 text-sm text-green-700 dark:text-green-300">Upfront MIP + annual premium (often for life of loan)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm font-medium">Credit Score Minimum</td>
                    <td className="py-3 px-4 text-sm text-blue-700 dark:text-blue-300">No official minimum<br />(typically 620+ in practice)</td>
                    <td className="py-3 px-4 text-sm text-purple-700 dark:text-purple-300">620+ for standard<br />(740+ for best rates)</td>
                    <td className="py-3 px-4 text-sm text-green-700 dark:text-green-300">580+ for 3.5% down<br />500-579 for 10% down</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm font-medium">Interest Rates</td>
                    <td className="py-3 px-4 text-sm text-blue-700 dark:text-blue-300">Typically lower than conventional and FHA</td>
                    <td className="py-3 px-4 text-sm text-purple-700 dark:text-purple-300">Varies based on credit score and down payment</td>
                    <td className="py-3 px-4 text-sm text-green-700 dark:text-green-300">Generally lower than conventional but higher than VA</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm font-medium">Property Use</td>
                    <td className="py-3 px-4 text-sm text-blue-700 dark:text-blue-300">Primary residence only</td>
                    <td className="py-3 px-4 text-sm text-purple-700 dark:text-purple-300">Primary, secondary, or investment</td>
                    <td className="py-3 px-4 text-sm text-green-700 dark:text-green-300">Primary residence only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <h3 id="cost-comparison" className="text-xl font-bold mb-4">Cost Comparison</h3>
        <Card className="mb-6">
          <CardContent className="p-6">
            <h4 className="text-base font-medium mb-4">Total Costs on a $300,000 Home Purchase (30-Year Fixed)</h4>
            <div className="h-[300px]">
              <Bar 
                data={{
                  labels: ['VA Loan (0% down)', 'FHA Loan (3.5% down)', 'Conventional (5% down)', 'Conventional (20% down)'],
                  datasets: [
                    {
                      label: 'Down Payment',
                      data: [0, 10500, 15000, 60000],
                      backgroundColor: 'rgba(59, 130, 246, 0.7)'
                    },
                    {
                      label: 'Upfront Fees',
                      data: [6450, 5250, 0, 0],
                      backgroundColor: 'rgba(16, 185, 129, 0.7)'
                    },
                    {
                      label: 'Lifetime Mortgage Insurance',
                      data: [0, 37800, 7200, 0],
                      backgroundColor: 'rgba(245, 158, 11, 0.7)'
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
                    x: { stacked: true },
                    y: { 
                      stacked: true,
                      ticks: { callback: (value) => '$' + value.toLocaleString() }
                    }
                  }
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Note: Mortgage insurance costs are estimated over the life of the loan. Conventional PMI typically cancels at 20% equity, while FHA MIP often remains for the full loan term.
              Assumes 5.25% interest rate for VA, 5.5% for conventional, and 5.75% for FHA loans.
            </p>
          </CardContent>
        </Card>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>When to Choose VA:</strong> If you're eligible for a VA loan, it's often the most cost-effective option, especially if you're making a low down payment. The combination of no down payment requirement, no mortgage insurance, and competitive interest rates typically results in the lowest monthly payment and total cost compared to other loan options.
            </p>
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <div id="conclusion">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40">
            <CardTitle id="summary" className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Leveraging Your VA Loan Benefit
            </CardTitle>
            <CardDescription>
              Making the most of your hard-earned military service benefit
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              The <strong>VA Mortgage Calculator</strong> is an essential tool for service members and veterans to understand the full potential of their VA loan benefit. By providing realistic projections of costs and payments, it helps you make informed decisions about your home purchase and maximize the financial advantages you've earned through your service.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Remember these key advantages of VA loans:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Financial Benefits</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">No down payment requirement preserves your savings for other needs</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">No monthly mortgage insurance saves hundreds each month</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Lower interest rates than many other loan options</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Next Steps</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Obtain your Certificate of Eligibility (COE) through the VA</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Get pre-approved with a VA-experienced lender</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Work with a real estate agent familiar with VA loans</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to calculate your VA loan options?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>VA Mortgage Calculator</strong> above to determine what you can afford and understand your potential monthly payments. For more homebuying tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/mortgage">
                        <Home className="h-4 w-4 mr-1" />
                        Mortgage Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/affordability">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Affordability Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/closing-costs">
                        <Calculator className="h-4 w-4 mr-1" />
                        Closing Cost Calculator
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
        <section className="py-12">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Related Calculators</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Mortgage Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compare VA loan payments with conventional mortgage options.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/mortgage">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">House Affordability Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Determine how much house you can afford with a VA loan.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/house-affordability">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Refinance Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Explore VA refinance options including the Interest Rate Reduction Refinance Loan (IRRRL).
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/refinance">Try Calculator</Link>
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