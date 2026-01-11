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
  Home,
  Calculator,
  Download,
  Share2,
  PieChart,
  BarChart3,
  RefreshCw,
  TrendingUp,
  LineChart,
  Info,
  Wallet,
  AlertCircle,
  Check,
  MapPin,
  Car,
  Clock,
  Utensils,
  Users,
  FileText,
  ArrowRightLeft
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie, Bar, Line } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import RentSchema from './schema';

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

export default function RentCalculator() {
  // Income & Expenses State
  const [monthlyIncome, setMonthlyIncome] = useState(5000)
  const [monthlyDebts, setMonthlyDebts] = useState(1000)
  const [monthlyExpenses, setMonthlyExpenses] = useState({
    groceries: 400,
    transportation: 200,
    utilities: 150,
    insurance: 100,
    entertainment: 200,
    other: 200
  })
  const [rentRatio, setRentRatio] = useState(30)
  const [location, setLocation] = useState("average")
  const [roommates, setRoommates] = useState(1)
  
  // Additional Costs State
  const [includeUtilities, setIncludeUtilities] = useState(false)
  const [includeRentersInsurance, setIncludeRentersInsurance] = useState(true)
  const [rentersInsuranceCost, setRentersInsuranceCost] = useState(20)
  const [securityDeposit, setSecurityDeposit] = useState(true)
  
  // Results State
  const [maxRent, setMaxRent] = useState(0)
  const [recommendedRent, setRecommendedRent] = useState(0)
  const [monthlyHousingCosts, setMonthlyHousingCosts] = useState({
    rent: 0,
    utilities: 0,
    insurance: 0
  })
  const [dtiRatio, setDtiRatio] = useState({
    current: 0,
    withRent: 0
  })

  // Calculate maximum and recommended rent based on inputs
  useEffect(() => {
    const baseMaxRent = (monthlyIncome * (rentRatio / 100))
    const locationFactors = {
      low: 0.8,
      average: 1,
      high: 1.2,
      veryHigh: 1.4
    }
    const adjustedMaxRent = baseMaxRent * locationFactors[location as keyof typeof locationFactors]
    const perPersonRent = adjustedMaxRent / roommates
    const totalExpenses = Object.values(monthlyExpenses).reduce((a, b) => a + b, 0)
    const currentDTI = ((monthlyDebts + totalExpenses) / monthlyIncome) * 100
    const withRentDTI = ((monthlyDebts + totalExpenses + adjustedMaxRent) / monthlyIncome) * 100
    
    const housingCosts = {
      rent: adjustedMaxRent,
      utilities: includeUtilities ? 0 : monthlyExpenses.utilities,
      insurance: includeRentersInsurance ? rentersInsuranceCost : 0
    }
    
    const recommendedAmount = adjustedMaxRent * 0.9
    
    setMaxRent(adjustedMaxRent)
    setRecommendedRent(recommendedAmount)
    setMonthlyHousingCosts(housingCosts)
    setDtiRatio({
      current: currentDTI,
      withRent: withRentDTI
    })
  }, [
    monthlyIncome,
    monthlyDebts,
    monthlyExpenses,
    rentRatio,
    location,
    roommates,
    includeUtilities,
    includeRentersInsurance,
    rentersInsuranceCost
  ])

  // Chart data for expense breakdown
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

  const pieChartData = {
    labels: ['Rent', 'Utilities', 'Insurance', 'Other Expenses', 'Debt Payments'],
    datasets: [{
      data: [
        monthlyHousingCosts.rent,
        monthlyHousingCosts.utilities,
        monthlyHousingCosts.insurance,
        Object.values(monthlyExpenses).reduce((a, b) => a + b, 0),
        monthlyDebts
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
          const total = Object.values(monthlyHousingCosts).reduce((a, b) => a + b, 0) + 
                       Object.values(monthlyExpenses).reduce((a, b) => a + b, 0) +
                       monthlyDebts
          return ((value / total) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  const barChartData = {
    labels: ['Current DTI', 'DTI with Rent'],
    datasets: [
      {
        label: 'Debt-to-Income Ratio',
        data: [dtiRatio.current, dtiRatio.withRent],
        backgroundColor: chartColors.primary.slice(0, 2),
        borderColor: chartColors.secondary.slice(0, 2).map(color => color.replace('0.2', '1')),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Recommended Maximum',
        data: [43, 43],
        backgroundColor: chartColors.secondary.slice(0, 2),
        borderColor: chartColors.primary.slice(0, 2),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 60,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: {
          callback: (value) => {
            return value + '%'
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
        formatter: (value: number) => value.toFixed(1) + '%'
      }
    }
  }

  const generateRentScenarios = () => {
    const scenarios = [25, 30, 35, 40].map(ratio => ({
      ratio,
      amount: (monthlyIncome * (ratio / 100))
    }))

    return {
      labels: scenarios.map(s => `${s.ratio}% of Income`),
      datasets: [
        { 
          label: 'Monthly Rent',
          data: scenarios.map(s => s.amount),
          borderColor: chartColors.primary[0],
          backgroundColor: chartColors.secondary[0],
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    }
  }

  const scenarioChartOptions: ChartOptions<'bar'> = {
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
        display: false
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value: number) => '$' + value.toLocaleString()
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
    pdf.save('rent-affordability-results.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <RentSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        Rent Affordability <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Discover how much rent you can afford based on your income, expenses, and lifestyle with our easy-to-use tool.
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
                    <CardTitle>Enter Your Financial Information</CardTitle>
                    <CardDescription>
                      Provide your income, expenses, and preferences to calculate your affordable rent range.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Income & Expenses</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="monthly-income">Monthly Gross Income</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="monthly-income"
                              type="number"
                              className="pl-9"
                              value={monthlyIncome || ''} onChange={(e) => setMonthlyIncome(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="monthly-debts">Monthly Debt Payments</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="monthly-debts"
                              type="number"
                              className="pl-9"
                              value={monthlyDebts || ''} onChange={(e) => setMonthlyDebts(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Monthly Living Expenses</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="groceries">Groceries</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="groceries"
                              type="number"
                              className="pl-9"
                              value={monthlyExpenses.groceries}
                              onChange={(e) => setMonthlyExpenses(prev => ({
                                ...prev,
                                groceries: Number(e.target.value)
                              }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transportation">Transportation</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="transportation"
                              type="number"
                              className="pl-9"
                              value={monthlyExpenses.transportation}
                              onChange={(e) => setMonthlyExpenses(prev => ({
                                ...prev,
                                transportation: Number(e.target.value)
                              }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="utilities">Utilities</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="utilities"
                              type="number"
                              className="pl-9"
                              value={monthlyExpenses.utilities}
                              onChange={(e) => setMonthlyExpenses(prev => ({
                                ...prev,
                                utilities: Number(e.target.value)
                              }))}
                              disabled={includeUtilities}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="insurance">Insurance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="insurance"
                              type="number"
                              className="pl-9"
                              value={monthlyExpenses.insurance}
                              onChange={(e) => setMonthlyExpenses(prev => ({
                                ...prev,
                                insurance: Number(e.target.value)
                              }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="entertainment">Entertainment</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="entertainment"
                              type="number"
                              className="pl-9"
                              value={monthlyExpenses.entertainment}
                              onChange={(e) => setMonthlyExpenses(prev => ({
                                ...prev,
                                entertainment: Number(e.target.value)
                              }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="other">Other Expenses</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="other"
                              type="number"
                              className="pl-9"
                              value={monthlyExpenses.other}
                              onChange={(e) => setMonthlyExpenses(prev => ({
                                ...prev,
                                other: Number(e.target.value)
                              }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Rent Preferences</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="rent-ratio">Rent-to-Income Ratio</Label>
                            <span className="text-sm text-muted-foreground">{rentRatio}%</span>
                          </div>
                          <Slider
                            id="rent-ratio"
                            min={20}
                            max={50}
                            step={1}
                            value={[rentRatio]}
                            onValueChange={(value) => setRentRatio(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location Cost</Label>
                          <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger id="location">
                              <SelectValue placeholder="Select location cost" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low Cost Area</SelectItem>
                              <SelectItem value="average">Average Cost Area</SelectItem>
                              <SelectItem value="high">High Cost Area</SelectItem>
                              <SelectItem value="veryHigh">Very High Cost Area</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="roommates">Number of Roommates</Label>
                          <Select 
                            value={String(roommates)} 
                            onValueChange={(value) => setRoommates(Number(value))}
                          >
                            <SelectTrigger id="roommates">
                              <SelectValue placeholder="Select number of roommates" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">No Roommates</SelectItem>
                              <SelectItem value="2">1 Roommate</SelectItem>
                              <SelectItem value="3">2 Roommates</SelectItem>
                              <SelectItem value="4">3 Roommates</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Costs</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="utilities-toggle">Utilities Included in Rent</Label>
                            <Switch 
                              id="utilities-toggle" 
                              checked={includeUtilities} 
                              onCheckedChange={setIncludeUtilities} 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="insurance-toggle">Renter's Insurance</Label>
                            <Switch 
                              id="insurance-toggle" 
                              checked={includeRentersInsurance} 
                              onCheckedChange={setIncludeRentersInsurance} 
                            />
                          </div>
                          {includeRentersInsurance && (
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="insurance-cost"
                                type="number"
                                className="pl-9"
                                value={rentersInsuranceCost || ''} onChange={(e) => setRentersInsuranceCost(e.target.value === '' ? 0 : Number(e.target.value))}
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="deposit-toggle">Security Deposit Required</Label>
                            <Switch 
                              id="deposit-toggle" 
                              checked={securityDeposit} 
                              onCheckedChange={setSecurityDeposit} 
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
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-muted-foreground">Recommended Monthly Rent</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(recommendedRent)}</p>
                      <p className="text-sm text-muted-foreground">
                        Maximum: {formatCurrency(maxRent)}
                        {roommates > 1 && ` (${formatCurrency(maxRent / roommates)} per person)`}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Expenses</TabsTrigger>
                        <TabsTrigger value="dti">DTI Ratio</TabsTrigger>
                        <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Monthly Housing Costs</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Rent</span>
                              <span className="font-medium">{formatCurrency(monthlyHousingCosts.rent)}</span>
                            </div>
                            {monthlyHousingCosts.utilities > 0 && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Utilities</span>
                                <span className="font-medium">{formatCurrency(monthlyHousingCosts.utilities)}</span>
                              </div>
                            )}
                            {monthlyHousingCosts.insurance > 0 && (
                              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">Renter's Insurance</span>
                                <span className="font-medium">{formatCurrency(monthlyHousingCosts.insurance)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Monthly Housing</span>
                              <span>
                                {formatCurrency(
                                  Object.values(monthlyHousingCosts).reduce((a, b) => a + b, 0)
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="dti" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={barChartData} options={barChartOptions} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">Current DTI</p>
                            <p className="text-2xl font-semibold">{dtiRatio.current.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground mt-1">Without rent payment</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">DTI with Rent</p>
                            <p className="text-2xl font-semibold">{dtiRatio.withRent.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground mt-1">Including rent payment</p>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="scenarios" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar 
                            data={generateRentScenarios()} 
                            options={scenarioChartOptions} 
                          />
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Different rent scenarios based on income percentage
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    {securityDeposit && (
                      <div className="mt-4 p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2">Move-in Costs</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>First Month's Rent</span>
                            <span>{formatCurrency(recommendedRent)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Security Deposit</span>
                            <span>{formatCurrency(recommendedRent)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-medium">
                            <span>Total Move-in Cost</span>
                            <span>{formatCurrency(recommendedRent * 2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Affordability Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      {dtiRatio.withRent > 43 && (
                        <div className="flex items-start gap-2 text-destructive">
                          <Info className="h-4 w-4 mt-0.5" />
                          <p>Your debt-to-income ratio with rent is high. Consider reducing expenses or finding a less expensive rental.</p>
                        </div>
                      )}
                      {rentRatio > 35 && (
                        <div className="flex items-start gap-2 text-yellow-500 dark:text-yellow-400">
                          <Info className="h-4 w-4 mt-0.5" />
                          <p>Your rent-to-income ratio is above recommended levels. This may strain your budget.</p>
                        </div>
                      )}
                      {roommates === 1 && maxRent < 2000 && (
                        <div className="flex items-start gap-2 text-primary">
                          <Info className="h-4 w-4 mt-0.5" />
                          <p>Consider getting a roommate to increase your rental budget and share expenses.</p>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5" />
                        <p>Save at least 3 months of rent for emergencies and unexpected expenses.</p>
                      </div>
                    </div>
                  </CardContent>
                  
                  <SaveCalculationButton
                    calculatorType="rent"
                    inputs={{}}
                    results={{}}
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Renting Guide</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Rent Calculator: Finding Your Budget Sweet Spot</h2>
        <p className="mt-3 text-muted-foreground text-lg">Make smarter rental decisions with data-driven insights about your budget</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Understanding Rent Affordability
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                A <strong>Rent Calculator</strong> is an essential tool for anyone navigating the rental market. It helps you determine how much rent you can comfortably afford based on your income, expenses, and financial goals, preventing the common pitfall of overextending your housing budget.
              </p>
              <p className="mt-3">
                Using a rent calculator provides valuable insights that help you:
              </p>
              <ul className="my-3 space-y-1">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Set realistic housing budgets tailored to your income</span>
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Balance housing costs with other financial priorities</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>Account for all rental expenses beyond just the base rent</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Plan for future rent increases and financial stability</span>
                </li>
              </ul>
              <p>
                In today's competitive rental market, understanding your true rental budget before apartment hunting saves time, reduces stress, and helps secure a sustainable living situation that won't strain your finances.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">The Rent Burden Reality</h3>
                <div className="h-[200px]">
                  <Bar 
                    data={{
                      labels: ['Recommended', 'Average American', 'Cost-Burdened', 'Severely Burdened'],
                      datasets: [
                        {
                          label: 'Percentage of Income on Rent',
                          data: [30, 35, 40, 50],
                          backgroundColor: [
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(239, 68, 68, 0.7)'
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
                          title: { display: true, text: 'Income Percentage (%)' }
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">Housing experts recommend spending no more than 30% of income on rent</p>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Did You Know?</strong> Nearly half of all renters in major U.S. cities spend more than 30% of their income on rent, making them "rent burdened" according to the U.S. Department of Housing and Urban Development.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The 30% Rule Section */}
      <div className="mb-10" id="rent-guidelines">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Rent Affordability Guidelines
        </h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
          <h3 id="thirty-percent-rule" className="font-bold text-xl mb-4">The 30% Rule: Origins and Application</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-4">
                The widely cited <strong>30% rule</strong> suggests that you should spend no more than 30% of your gross monthly income on rent. This guideline originated from a 1969 amendment to public housing requirements, which capped rent at 25% of income (later raised to 30% in 1981).
              </p>
              
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">How to calculate your rent budget:</p>
                <ol className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">1</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Determine your monthly gross income</p>
                      <p className="text-blue-700 dark:text-blue-400">Before taxes and other deductions</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">2</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Multiply by 0.3 (30%)</p>
                      <p className="text-blue-700 dark:text-blue-400">Example: $5,000 × 0.3 = $1,500</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mt-0.5">3</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">This is your recommended maximum rent</p>
                      <p className="text-blue-700 dark:text-blue-400">Including utilities if they're not covered</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
            
            <div>
              <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h4 className="font-medium mb-3">Rent Budget Calculator</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="monthly-income">Monthly Gross Income</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="monthly-income"
                        type="number"
                        placeholder="5000"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="percentage-slider">Percentage of Income</Label>
                      <span className="text-sm text-muted-foreground">30%</span>
                    </div>
                    <Slider
                      id="percentage-slider"
                      defaultValue={[30]}
                      max={50}
                      min={15}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Conservative</span>
                      <span>Recommended</span>
                      <span>Stretching</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Recommended Max Rent:</span>
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-400">$1,500</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Alternative Method:</strong> The 50/30/20 budgeting rule suggests allocating 50% of income to needs (including housing), 30% to wants, and 20% to savings. This often results in a similar housing budget.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h3 id="modern-considerations" className="font-bold text-xl mt-8 mb-4">Modern Considerations for Rent Affordability</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3">
                While the 30% rule provides a useful starting point, personal financial situations vary significantly. Consider these additional factors when determining your ideal rent budget:
              </p>
              
              <div className="space-y-4 mt-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                  <div>
                    <p className="font-medium">Debt Obligations</p>
                    <p className="text-sm text-muted-foreground">High student loans, car payments, or credit card debt may require a lower rent percentage</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                  <div>
                    <p className="font-medium">Location Factors</p>
                    <p className="text-sm text-muted-foreground">Transportation costs in relation to rent (living closer to work might justify higher rent)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                  <div>
                    <p className="font-medium">Income Stability</p>
                    <p className="text-sm text-muted-foreground">Variable income may require more conservative rent budgeting</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold dark:bg-blue-900 dark:text-blue-300">4</span>
                  <div>
                    <p className="font-medium">Financial Goals</p>
                    <p className="text-sm text-muted-foreground">Saving for a home down payment or retirement might necessitate spending less on rent</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="h-[220px]">
                <Pie
                  data={{
                    labels: ['Rent', 'Other Essential Expenses', 'Savings', 'Discretionary Spending'],
                    datasets: [{
                      data: [30, 20, 20, 30],
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                      ]
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } }
                    }
                  }}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">Recommended balanced budget allocation</p>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Important:</strong> In high-cost cities like New York, San Francisco, or Boston, many residents necessarily spend 40-50% of income on rent. If you're in this situation, you may need to adjust other budget categories accordingly.
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
              <strong>Remember:</strong> Your rent budget should leave you with enough breathing room for all other essential expenses, unexpected costs, and progress toward your financial goals. If you're stretching to make rent payments, you may need to consider alternatives like roommates or a different location.
            </p>
          </div>
        </div>
      </div>

      {/* True Cost of Renting Section */}
      <div className="mb-10" id="true-costs">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">The True Cost of Renting</span>
              </div>
            </CardTitle>
            <CardDescription>
              Beyond the monthly rent payment
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 id="hidden-costs" className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Hidden Costs to Consider
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">Common Add-On Expenses</h4>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                      Your base rent is rarely the total cost of renting. When budgeting, remember to include:
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Utilities:</strong> Electricity, gas, water, sewage, trash (varies by region and property)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Internet/Cable:</strong> Average $60-100/month depending on speed and services</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Parking:</strong> Can add $50-300/month in urban areas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Pet rent/fees:</strong> Often $25-50/month per pet plus deposits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Renters insurance:</strong> Typically $15-30/month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5" />
                        <span><strong>Amenity fees:</strong> Gym, pool, or community space access fees</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300">One-time Costs</h4>
                    <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                      <li className="flex items-center justify-between">
                        <span>Security deposit</span>
                        <span className="font-medium">1-2 months' rent</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>First/last month's rent</span>
                        <span className="font-medium">1-2 months' rent</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Application fees</span>
                        <span className="font-medium">$30-75 per person</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Moving costs</span>
                        <span className="font-medium">$200-2,000+</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Setup fees (utilities)</span>
                        <span className="font-medium">$10-50 per service</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Furniture/essentials</span>
                        <span className="font-medium">Varies widely</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 id="real-budget" className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Creating a Real Rental Budget
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Sample Monthly Budget for $1,500 Rent</h4>
                    
                    <div className="mt-3 h-[220px]">
                      <Bar 
                        data={{
                          labels: ['Base Rent', '+ Utilities', '+ Internet', '+ Insurance', '+ Parking', 'Total Cost'],
                          datasets: [
                            {
                              label: 'Monthly Cost',
                              data: [1500, 1650, 1720, 1745, 1795, 1795],
                              backgroundColor: [
                                'rgba(59, 130, 246, 0.7)',
                                'rgba(59, 130, 246, 0.75)',
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(59, 130, 246, 0.85)',
                                'rgba(59, 130, 246, 0.9)',
                                'rgba(16, 185, 129, 0.8)'
                              ],
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              borderWidth: 1
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 2000,
                              ticks: { callback: value => '$' + value }
                            }
                          },
                          plugins: { legend: { display: false } }
                        }}
                      />
                    </div>
                    <p className="text-xs text-center mt-2 text-blue-600 dark:text-blue-400">
                      True monthly cost can be ~20% higher than base rent
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>Pro Tip:</strong> When comparing apartments, create a true cost comparison by adding all monthly expenses. A higher rent apartment with utilities included might actually be cheaper than a lower base rent with separate utility costs.
                      </p>
                    </div>
                  </div>
                </div>
                
                <h3 id="location-costs" className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-6 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Impact on Total Costs
                </h3>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <h4 className="font-medium text-purple-800 dark:text-purple-300">The Location Trade-off</h4>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-400">
                    Consider these location factors when calculating your true rental costs:
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Commuting Costs</span>
                      </div>
                      <span className="text-sm">$100-400/month</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Commute Time Value</span>
                      </div>
                      <span className="text-sm">10-20 hrs/week</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Food/Entertainment</span>
                      </div>
                      <span className="text-sm">Varies by location</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <h3 className="text-xl font-bold mb-4">Making Smart Rental Decisions</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="bg-orange-50 dark:bg-orange-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    Roommate Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <p>Sharing living space can significantly reduce costs, but requires careful planning.</p>
                  <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <p className="font-medium">Financial benefits:</p>
                    <ul className="space-y-1 mt-1">
                      <li>• Split rent and utilities</li>
                      <li>• Share furniture and appliance costs</li>
                      <li>• Reduce per-person security deposit</li>
                      <li>• Access better neighborhoods/amenities</li>
                    </ul>
                  </div>
                  <p className="mt-3 text-xs">Consider a roommate agreement to outline financial responsibilities and expectations.</p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Lease Term Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <p>
                    Lease terms affect both your monthly costs and financial flexibility.
                  </p>
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="font-medium">Compare your options:</p>
                    <ul className="space-y-1 mt-1">
                      <li>• Month-to-month: Higher rent, maximum flexibility</li>
                      <li>• 6-month: Moderate rent, seasonal flexibility</li>
                      <li>• 12-month: Standard pricing, stable housing</li>
                      <li>• 24-month: Often discounted, minimal increases</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/30 py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-green-600" />
                    Negotiation Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm">
                  <p>
                    Many renters don't realize rent is often negotiable, especially in buildings with vacancies.
                  </p>
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <p className="font-medium">Effective approaches:</p>
                    <ul className="space-y-1 mt-1">
                      <li>• Offer longer lease for reduced rent</li>
                      <li>• Request waived fees or free parking</li>
                      <li>• Pay several months upfront for discount</li>
                      <li>• Highlight your excellent rental history</li>
                      <li>• Research comparable units as leverage</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Emergency Fund Reminder</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    Financial experts recommend maintaining an emergency fund of 3-6 months of expenses, including rent. When selecting an apartment, ensure your rent is low enough to allow you to build and maintain this crucial financial safety net.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rent vs Buy Section */}
      <div className="mb-10" id="rent-vs-buy">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Home className="h-6 w-6 text-blue-600" />
          Rent vs. Buy Considerations
        </h2>
        
        <Card className="overflow-hidden mb-6">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
            <CardTitle>When to Rent vs. When to Buy</CardTitle>
            <CardDescription>Financial and lifestyle factors to consider</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-4">Benefits of Renting</h3>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center">
                      <Check className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Flexibility to Move</p>
                      <p className="text-sm text-muted-foreground mt-1">Ideal for career changes, uncertain future plans, or exploring different neighborhoods</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center">
                      <Check className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Predictable Housing Costs</p>
                      <p className="text-sm text-muted-foreground mt-1">No surprise maintenance expenses or property taxes</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center">
                      <Check className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Lower Upfront Costs</p>
                      <p className="text-sm text-muted-foreground mt-1">Security deposit is much smaller than a home down payment</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center">
                      <Check className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Less Responsibility</p>
                      <p className="text-sm text-muted-foreground mt-1">Landlord handles maintenance, repairs, and property management</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-4">Benefits of Buying</h3>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/60 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Building Equity</p>
                      <p className="text-sm text-muted-foreground mt-1">Payments build ownership instead of going to a landlord</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/60 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Potential Appreciation</p>
                      <p className="text-sm text-muted-foreground mt-1">Property may increase in value over time</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/60 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Tax Benefits</p>
                      <p className="text-sm text-muted-foreground mt-1">Mortgage interest and property tax deductions</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/60 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Freedom to Customize</p>
                      <p className="text-sm text-muted-foreground mt-1">Make changes to your property without landlord approval</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4">The 5-Year Rule</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p>Financial experts often cite the "5-Year Rule" when deciding between renting and buying. This guideline suggests buying only makes financial sense if you plan to stay in the property for at least five years.</p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300">Why Five Years?</h4>
                  <ul className="mt-2 space-y-2 text-sm text-blue-700 dark:text-blue-400">
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                      <span>Transaction costs (closing costs, realtor fees) typically total 8-10% of home value</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                      <span>Early mortgage payments go primarily toward interest rather than principal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                      <span>Time needed to build enough equity to offset transaction costs</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Rent vs. Buy Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Use our Rent vs. Buy Calculator to compare the financial implications of renting versus buying based on your specific situation.
                  </p>
                  <div className="flex justify-center">
                    <Button asChild>
                      <Link href="/calculators/rent-vs-buy">
                        <Calculator className="h-4 w-4 mr-2" />
                        Open Rent vs. Buy Calculator
                      </Link>
                    </Button>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-400">
                    <strong>Consider:</strong> Your lifestyle needs, career stability, financial readiness, and long-term goals when making this important decision.
                  </div>
                </CardContent>
              </Card>
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
              Making Informed Rental Decisions
            </CardTitle>
            <CardDescription>
              Balancing budget with lifestyle needs
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              A <strong>Rent Calculator</strong> helps you understand what you can truly afford before you begin apartment hunting. By establishing a realistic budget that accounts for all rental costs—not just the base rent—you can make confident decisions that support your overall financial health.
            </p>
            
            <p className="mt-4" id="key-takeaways">
              Remember these key principles when determining your rental budget:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Financial Wisdom</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">The 30% guideline provides a starting point, but your personal situation may require adjustments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Consider all rental costs, not just the base monthly rent</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Your housing budget should leave room for other financial goals</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Next Steps</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Use our calculator to determine your personal rent budget</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Create a complete budget that includes all housing expenses</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Compare properties based on true cost, not just advertised rent</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to find your rental budget?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>Rent Calculator</strong> above to determine your ideal price range! For more housing tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/rent-vs-buy">
                        <Home className="h-4 w-4 mr-1" />
                        Rent vs. Buy
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/mortgage">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Mortgage
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
                  <CardTitle className="text-lg">Mortgage Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compare monthly mortgage payments to rent and see if buying might be right for you.
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
                  <CardTitle className="text-lg">Debt-to-Income Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate your debt-to-income ratio to understand your overall financial health.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/debt-to-income">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Budget Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create a comprehensive budget to manage your income and expenses effectively.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/budget">Try Calculator</Link>
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