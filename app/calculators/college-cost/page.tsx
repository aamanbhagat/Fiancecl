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
import { DollarSign, Calculator, Download, Share2, PieChart, BarChart3, RefreshCw, TrendingUp, LineChart, Info, AlertCircle, GraduationCap, School, BookOpen, Home, Bus, Coffee, Wallet, CheckCircle, Landmark, Lightbulb, MapPin, PiggyBank, Users, Scale, ArrowLeftRight, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Pie } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import type { ChartOptions } from 'chart.js'
import CollegeCostSchema from './schema';

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

export default function CollegeCostCalculator() {
  // Basic College Expenses
  const [tuition, setTuition] = useState(30000)
  const [fees, setFees] = useState(2000)
  const [roomAndBoard, setRoomAndBoard] = useState(12000)
  const [booksAndSupplies, setBooksAndSupplies] = useState(1200)
  const [personalExpenses, setPersonalExpenses] = useState(3000)
  const [transportation, setTransportation] = useState(1000)
  
  // Financial Aid & Resources
  const [scholarships, setScholarships] = useState(10000)
  const [grants, setGrants] = useState(5000)
  const [familyContributions, setFamilyContributions] = useState(15000)
  const [workStudy, setWorkStudy] = useState(3000)
  const [loans, setLoans] = useState(10000)
  const [loanInterestRate, setLoanInterestRate] = useState(4.5)
  
  // Program Details
  const [yearsToComplete, setYearsToComplete] = useState(4)
  const [inflationRate, setInflationRate] = useState(3)
  const [livingArrangement, setLivingArrangement] = useState("on-campus")
  const [enrollmentStatus, setEnrollmentStatus] = useState("full-time")
  
  // Results State
  const [costOfAttendance, setCostOfAttendance] = useState(0)
  const [netCost, setNetCost] = useState(0)
  const [totalAid, setTotalAid] = useState(0)
  const [outOfPocket, setOutOfPocket] = useState(0)
  const [yearlyProjections, setYearlyProjections] = useState<{
    year: number;
    costs: number;
    aid: number;
    net: number;
  }[]>([])
  const [loanProjections, setLoanProjections] = useState<{
    year: number;
    balance: number;
    payment: number;
  }[]>([])

  // Calculate all costs and projections
  useEffect(() => {
    // Calculate base cost of attendance
    const baseCOA = tuition + fees + roomAndBoard + booksAndSupplies + 
                    personalExpenses + transportation
    
    // Calculate total aid
    const totalAidAmount = scholarships + grants + familyContributions + 
                          workStudy + loans
    
    // Calculate net cost (after non-loan aid)
    const netCostAmount = baseCOA - (scholarships + grants + workStudy)
    
    // Calculate out of pocket (net cost minus loans)
    const outOfPocketAmount = netCostAmount - loans
    
    // Generate yearly projections
    const projections = []
    let cumulativeCost = 0
    let cumulativeAid = 0
    
    for (let year = 1; year <= yearsToComplete; year++) {
      const inflationFactor = Math.pow(1 + inflationRate / 100, year - 1)
      const yearCost = baseCOA * inflationFactor
      const yearAid = totalAidAmount
      const yearNet = yearCost - yearAid
      
      cumulativeCost += yearCost
      cumulativeAid += yearAid
      
      projections.push({
        year,
        costs: yearCost,
        aid: yearAid,
        net: yearNet
      })
    }
    
    // Generate loan repayment projections
    const loanProjections = []
    const monthlyRate = loanInterestRate / 100 / 12
    const totalLoanAmount = loans * yearsToComplete
    const monthlyPayment = totalLoanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, 120)) / 
      (Math.pow(1 + monthlyRate, 120) - 1)
    
    let balance = totalLoanAmount
    for (let year = 1; year <= 10; year++) {
      const yearlyPayment = monthlyPayment * 12
      balance = Math.max(0, balance * (1 + loanInterestRate / 100) - yearlyPayment)
      
      loanProjections.push({
        year,
        balance,
        payment: yearlyPayment
      })
    }
    
    // Update state with calculations
    setCostOfAttendance(baseCOA)
    setTotalAid(totalAidAmount)
    setNetCost(netCostAmount)
    setOutOfPocket(outOfPocketAmount)
    setYearlyProjections(projections)
    setLoanProjections(loanProjections)
    
  }, [
    tuition,
    fees,
    roomAndBoard,
    booksAndSupplies,
    personalExpenses,
    transportation,
    scholarships,
    grants,
    familyContributions,
    workStudy,
    loans,
    loanInterestRate,
    yearsToComplete,
    inflationRate,
    livingArrangement,
    enrollmentStatus
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

  // Cost breakdown chart
  const costBreakdownData = {
    labels: ['Tuition', 'Fees', 'Room & Board', 'Books & Supplies', 'Personal', 'Transportation'],
    datasets: [{
      data: [tuition, fees, roomAndBoard, booksAndSupplies, personalExpenses, transportation],
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
          return ((value / costOfAttendance) * 100).toFixed(1) + '%'
        }
      }
    }
  }

  // Yearly projections chart
  const yearlyProjectionsData = {
    labels: yearlyProjections.map(p => `Year ${p.year}`),
    datasets: [
      {
        label: 'Total Cost',
        data: yearlyProjections.map(p => p.costs),
        backgroundColor: chartColors.primary[0],
        borderColor: chartColors.secondary[0].replace('0.2', '1'),
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Financial Aid',
        data: yearlyProjections.map(p => p.aid),
        backgroundColor: chartColors.primary[1],
        borderColor: chartColors.secondary[1].replace('0.2', '1'),
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
        formatter: (value: number) => '$' + value.toLocaleString()
      }
    }
  }

  // Loan repayment chart
  const loanRepaymentData = {
    labels: loanProjections.map(p => `Year ${p.year}`),
    datasets: [
      {
        label: 'Loan Balance',
        data: loanProjections.map(p => p.balance),
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.secondary[0],
        tension: 0.4
      },
      {
        label: 'Annual Payment',
        data: loanProjections.map(p => p.payment),
        borderColor: chartColors.primary[1],
        backgroundColor: chartColors.secondary[1],
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
    pdf.save('college-cost-analysis.pdf')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <CollegeCostSchema />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
  <div className="absolute inset-0 bg-grid-white/10 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(white,transparent_85%)] dark:bg-grid-white/10"></div>
  <div className="container relative z-10 max-w-screen-xl">
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-text-glow">
        College Cost <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent inline-block">Calculator</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Estimate the total cost of your college education and understand your financial aid options.
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
                    <CardTitle>Enter College Costs & Aid</CardTitle>
                    <CardDescription>
                      Provide information about college expenses and available financial aid to calculate total costs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Basic College Expenses */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">College Expenses</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="tuition">Annual Tuition</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="tuition"
                              type="number"
                              className="pl-9"
                              value={tuition || ''} onChange={(e) => setTuition(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fees">Annual Fees</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="fees"
                              type="number"
                              className="pl-9"
                              value={fees || ''} onChange={(e) => setFees(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="room-board">Room & Board</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="room-board"
                              type="number"
                              className="pl-9"
                              value={roomAndBoard || ''} onChange={(e) => setRoomAndBoard(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="books-supplies">Books & Supplies</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="books-supplies"
                              type="number"
                              className="pl-9"
                              value={booksAndSupplies || ''} onChange={(e) => setBooksAndSupplies(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal">Personal Expenses</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="personal"
                              type="number"
                              className="pl-9"
                              value={personalExpenses || ''} onChange={(e) => setPersonalExpenses(e.target.value === '' ? 0 : Number(e.target.value))}
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
                              value={transportation || ''} onChange={(e) => setTransportation(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financial Aid & Resources */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Financial Aid & Resources</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="scholarships">Scholarships</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="scholarships"
                              type="number"
                              className="pl-9"
                              value={scholarships || ''} onChange={(e) => setScholarships(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="grants">Grants</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="grants"
                              type="number"
                              className="pl-9"
                              value={grants || ''} onChange={(e) => setGrants(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="family">Family Contributions</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="family"
                              type="number"
                              className="pl-9"
                              value={familyContributions || ''} onChange={(e) => setFamilyContributions(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="work-study">Work Study</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="work-study"
                              type="number"
                              className="pl-9"
                              value={workStudy || ''} onChange={(e) => setWorkStudy(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loans">Student Loans</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="loans"
                              type="number"
                              className="pl-9"
                              value={loans || ''} onChange={(e) => setLoans(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="loan-rate">Loan Interest Rate</Label>
                            <span className="text-sm text-muted-foreground">{loanInterestRate}%</span>
                          </div>
                          <Slider
                            id="loan-rate"
                            min={2}
                            max={12}
                            step={0.1}
                            value={[loanInterestRate]}
                            onValueChange={(value) => setLoanInterestRate(value[0])}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Program Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Program Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="years">Years to Complete</Label>
                          <Select value={String(yearsToComplete)} onValueChange={(value) => setYearsToComplete(Number(value))}>
                            <SelectTrigger id="years">
                              <SelectValue placeholder="Select years" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 Years (Associate's)</SelectItem>
                              <SelectItem value="4">4 Years (Bachelor's)</SelectItem>
                              <SelectItem value="5">5 Years</SelectItem>
                              <SelectItem value="6">6 Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="inflation">Annual Cost Increase</Label>
                            <span className="text-sm text-muted-foreground">{inflationRate}%</span>
                          </div>
                          <Slider
                            id="inflation"
                            min={0}
                            max={10}
                            step={0.5}
                            value={[inflationRate]}
                            onValueChange={(value) => setInflationRate(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="living">Living Arrangement</Label>
                          <Select value={livingArrangement} onValueChange={setLivingArrangement}>
                            <SelectTrigger id="living">
                              <SelectValue placeholder="Select arrangement" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="on-campus">On Campus</SelectItem>
                              <SelectItem value="off-campus">Off Campus</SelectItem>
                              <SelectItem value="with-family">With Family</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="enrollment">Enrollment Status</Label>
                          <Select value={enrollmentStatus} onValueChange={setEnrollmentStatus}>
                            <SelectTrigger id="enrollment">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">Full Time</SelectItem>
                              <SelectItem value="part-time">Part Time</SelectItem>
                            </SelectContent>
                          </Select>
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
                      <p className="text-sm text-muted-foreground">Annual Cost of Attendance</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(costOfAttendance)}</p>
                      <p className="text-sm text-muted-foreground">
                        Total for {yearsToComplete} years: {formatCurrency(costOfAttendance * yearsToComplete)}
                      </p>
                    </div>

                    <Separator />

                    <Tabs defaultValue="breakdown" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="breakdown">Costs</TabsTrigger>
                        <TabsTrigger value="projections">Projections</TabsTrigger>
                        <TabsTrigger value="loans">Loans</TabsTrigger>
                      </TabsList>

                      <TabsContent value="breakdown" className="space-y-4">
                        <div className="h-[300px]">
                          <Pie data={costBreakdownData} options={pieChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Annual Cost Breakdown</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Tuition & Fees</span>
                              <span className="font-medium">{formatCurrency(tuition + fees)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Room & Board</span>
                              <span className="font-medium">{formatCurrency(roomAndBoard)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Books & Supplies</span>
                              <span className="font-medium">{formatCurrency(booksAndSupplies)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Personal Expenses</span>
                              <span className="font-medium">{formatCurrency(personalExpenses)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Transportation</span>
                              <span className="font-medium">{formatCurrency(transportation)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Annual Cost</span>
                              <span>{formatCurrency(costOfAttendance)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="projections" className="space-y-4">
                        <div className="h-[300px]">
                          <Bar data={yearlyProjectionsData} options={barChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Financial Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Cost ({yearsToComplete} years)</span>
                              <span className="font-medium">{formatCurrency(costOfAttendance * yearsToComplete)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Financial Aid</span>
                              <span className="font-medium">{formatCurrency(totalAid * yearsToComplete)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Net Cost</span>
                              <span className="font-medium">{formatCurrency(netCost * yearsToComplete)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Out of Pocket</span>
                              <span>{formatCurrency(outOfPocket * yearsToComplete)}</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="loans" className="space-y-4">
                        <div className="h-[300px]">
                          <Line data={loanRepaymentData} options={lineChartOptions} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Loan Summary</h4>
                          <div className="grid gap-2">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Total Borrowed</span>
                              <span className="font-medium">{formatCurrency(loans * yearsToComplete)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                              <span className="text-sm">Monthly Payment</span>
                              <span className="font-medium">
                                {formatCurrency(loanProjections[0]?.payment / 12 || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-primary/10 font-semibold">
                              <span>Total Repayment (10 years)</span>
                              <span>
                                {formatCurrency(
                                  loanProjections.reduce((sum, p) => sum + p.payment, 0)
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Recommendations */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-1 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium">Financial Analysis</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• {formatCurrency(scholarships + grants)} in gift aid (no repayment needed)</li>
                              <li>• {formatCurrency(loans)} in annual loans ({formatCurrency(loans * yearsToComplete)} total)</li>
                              <li>• Expected monthly loan payment: {formatCurrency(loanProjections[0]?.payment / 12 || 0)}</li>
                              {outOfPocket > 0 && (
                                <li>• Additional {formatCurrency(outOfPocket)} needed annually from savings or income</li>
                              )}
                            </ul>
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
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">Education Planning</span>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Planning for College: Understanding the True Cost</h2>
        <p className="mt-3 text-muted-foreground text-lg">Navigate one of life's biggest financial investments with confidence</p>
      </div>
    </div>

    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Introduction Section */}
      <Card className="mb-10 overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
          <CardTitle id="introduction" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            The College Cost Landscape
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p>
                College represents far more than an educational pursuit—it's a significant <strong>financial commitment</strong> that impacts family budgets for years. With costs increasing at approximately 5-6% annually (outpacing inflation), understanding these expenses has become essential for effective planning.
              </p>
              <p className="mt-3">
                In 2025, the average annual cost at four-year private institutions exceeds <strong>$60,000</strong>, while public universities for in-state students average <strong>$28,000</strong> annually—figures that continue rising each academic year.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Complete "Cost of Attendance" Components</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>• Tuition and mandatory fees</li>
                  <li>• Room and board</li>
                  <li>• Books and supplies</li>
                  <li>• Transportation</li>
                  <li>• Personal expenses</li>
                  <li>• Technology costs</li>
                </ul>
              </div>
            </div>
            
            <div className="h-[250px]">
              <h4 className="text-center text-sm font-medium mb-2">Average 4-Year Total Cost by Institution Type</h4>
              <Bar 
                data={{
                  labels: ['Public (In-State)', 'Public (Out-of-State)', 'Private Non-Profit', 'For-Profit'],
                  datasets: [{
                    label: 'Four-Year Cost',
                    data: [112000, 196000, 240000, 144000],
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.7)',
                      'rgba(99, 102, 241, 0.7)',
                      'rgba(139, 92, 246, 0.7)',
                      'rgba(168, 85, 247, 0.7)'
                    ],
                    borderWidth: 1
                  }]
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
                      ticks: { callback: (value) => '$' + value.toLocaleString() }
                    }
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown Section */}
      <div className="mb-10" id="cost-breakdown">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <PieChart className="h-6 w-6 text-blue-600" />
          Breaking Down College Expenses
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Cost Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <Pie 
                  data={{
                    labels: ['Tuition & Fees', 'Housing & Meals', 'Books & Supplies', 'Transportation', 'Personal Expenses'],
                    datasets: [{
                      data: [55, 30, 5, 4, 6],
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8 } },
                      datalabels: {
                        color: '#fff',
                        font: { weight: 'bold' },
                        formatter: (value) => value + '%'
                      }
                    }
                  }}
                />
              </div>
              <p className="text-sm text-center mt-2 text-muted-foreground">
                Average expense distribution across four-year institutions
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Hidden Costs of College</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  Many families focus exclusively on tuition but overlook significant expenses that can add 30-50% to the total cost:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span><strong>Technology requirements:</strong> Laptops, specialized software, and internet services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span><strong>Academic fees:</strong> Lab fees, materials fees, printing costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span><strong>Social participation:</strong> Greek life, clubs, campus activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span><strong>Healthcare costs:</strong> Insurance, prescriptions, mental health services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span><strong>Travel:</strong> Trips home during breaks, study abroad expenses</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Annual Cost Escalation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border px-3 py-2 text-left">Institution Type</th>
                        <th className="border px-3 py-2 text-left">Year 1</th>
                        <th className="border px-3 py-2 text-left">Year 4</th>
                        <th className="border px-3 py-2 text-left">Increase</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-3 py-2">Public (In-State)</td>
                        <td className="border px-3 py-2">$26,500</td>
                        <td className="border px-3 py-2">$31,200</td>
                        <td className="border px-3 py-2">17.7%</td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Public (Out-of-State)</td>
                        <td className="border px-3 py-2">$46,200</td>
                        <td className="border px-3 py-2">$54,400</td>
                        <td className="border px-3 py-2">17.8%</td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Private</td>
                        <td className="border px-3 py-2">$56,800</td>
                        <td className="border px-3 py-2">$66,900</td>
                        <td className="border px-3 py-2">17.8%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  *Assuming 5.5% annual cost increases
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Financial Aid Section */}
      <div className="mb-10" id="financial-aid">
        <Card className="overflow-hidden border-blue-200 dark:border-blue-900">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Landmark className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-2xl">Navigating Financial Aid</span>
              </div>
            </CardTitle>
            <CardDescription>
              Understanding the difference between sticker price and what you'll actually pay
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p>
                  The <strong>sticker price</strong> of college rarely represents what most families actually pay. Financial aid substantially reduces out-of-pocket costs for many students, creating a significant difference between published prices and <strong>net price</strong>—what you'll pay after aid is applied.
                </p>

                <div className="mt-5 h-[200px]">
                  <h4 className="text-center text-sm font-medium mb-2">Average Net Price vs. Sticker Price (Private Colleges)</h4>
                  <Bar 
                    data={{
                      labels: ['Lower Income', 'Middle Income', 'Upper-Middle', 'High Income'],
                      datasets: [
                        {
                          label: 'Net Price',
                          data: [16200, 24500, 32700, 48200],
                          backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        },
                        {
                          label: 'Sticker Price',
                          data: [60000, 60000, 60000, 60000],
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          borderWidth: 1,
                          borderColor: 'rgba(59, 130, 246, 0.8)'
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
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
                        }
                      }
                    }}
                  />
                </div>

                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>Key Insight:</strong> According to the College Board, the average student at a private university receives approximately $21,000 in grant aid and tax benefits annually.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">Types of Financial Aid</h3>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-1">Grants & Scholarships (Gift Aid)</h4>
                      <p className="text-sm text-muted-foreground">
                        Free money that doesn't require repayment; based on financial need, merit, or specific characteristics.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-1">Federal Work-Study</h4>
                      <p className="text-sm text-muted-foreground">
                        Part-time employment programs that allow students to earn money for education expenses while gaining experience.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-1">Federal Student Loans</h4>
                      <p className="text-sm text-muted-foreground">
                        Money borrowed from the federal government with fixed interest rates and various repayment options.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-1">Private Loans</h4>
                      <p className="text-sm text-muted-foreground">
                        Non-federal loans from banks or financial institutions, typically with higher interest rates and fewer protections.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Financial Aid Timeline:</strong> Submit the FAFSA as early as October 1st of senior year. Many selective institutions also require the CSS Profile for institutional aid consideration.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI and Long-Term Impact */}
      <div className="mb-10" id="college-roi">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          The Return on Investment: Is College Worth It?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Lifetime Earnings by Education Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <Bar 
                  data={{
                    labels: ['High School', 'Associate\'s', 'Bachelor\'s', 'Master\'s', 'Doctoral', 'Professional'],
                    datasets: [{
                      label: 'Median Lifetime Earnings',
                      data: [1600000, 2000000, 2800000, 3400000, 4200000, 4800000],
                      backgroundColor: [
                        'rgba(156, 163, 175, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(224, 36, 36, 0.7)',
                        'rgba(245, 158, 11, 0.7)'
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
                        ticks: { callback: (value) => typeof value === 'number' ? '$' + (value/1000000).toFixed(1) + 'M' : value }
                      }
                    }
                  }}
                />
              </div>
              <p className="text-sm text-center mt-2 text-muted-foreground">
                Source: Georgetown University Center on Education and the Workforce
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Student Loan Considerations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                While college typically provides positive lifetime returns, student loan debt can significantly impact post-graduation financial health and decision-making.
              </p>
              
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Monthly Debt Burden Rule:</strong> Financial experts recommend that student loan payments should not exceed 8-10% of your monthly gross income to remain manageable.
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border px-3 py-2 text-left">Debt at Graduation</th>
                        <th className="border px-3 py-2 text-left">Monthly Payment</th>
                        <th className="border px-3 py-2 text-left">Income Needed*</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-3 py-2">$20,000</td>
                        <td className="border px-3 py-2">$212</td>
                        <td className="border px-3 py-2">$42,400</td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">$30,000</td>
                        <td className="border px-3 py-2">$318</td>
                        <td className="border px-3 py-2">$63,600</td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">$40,000</td>
                        <td className="border px-3 py-2">$424</td>
                        <td className="border px-3 py-2">$84,800</td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">$50,000</td>
                        <td className="border px-3 py-2">$530</td>
                        <td className="border px-3 py-2">$106,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  *Annual income needed if student loan payment = 5% of gross monthly income<br />
                  Assumes standard 10-year repayment at 5% interest
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Major-Specific ROI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Different fields of study yield dramatically different financial returns. When calculating your college ROI, compare your intended major's earning potential against your projected costs.
                </p>
                <div className="h-[200px]">
                  <h4 className="text-center text-sm font-medium mb-2">Starting Salaries by Major (2025)</h4>
                  <Bar 
                    data={{
                      labels: ['Computer Science', 'Engineering', 'Business', 'Health', 'Social Sciences', 'Humanities'],
                      datasets: [{
                        data: [80000, 75000, 65000, 60000, 50000, 48000],
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderWidth: 1
                      }]
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
                          ticks: { callback: (value) => '$' + value.toLocaleString() }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">The College ROI Formula</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Calculate your college return on investment by comparing the lifetime earnings differential with the total educational costs:
                  </p>
                  <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-800 font-mono text-sm">
                    ROI = (Additional Lifetime Earnings - Total College Cost) / Total College Cost
                  </div>
                  <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                    A strong ROI typically exceeds 200%, meaning that for every dollar invested in education, you earn at least two additional dollars over your lifetime.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Non-Financial Considerations</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Career satisfaction and fulfillment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Professional network development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Personal growth and expanded perspectives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Critical thinking and adaptability skills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Social and cultural experiences</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost-Saving Strategies */}
      <div className="mb-10" id="cost-saving">
        <Card>
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl">Smart Strategies to Reduce College Costs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Before College</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm font-medium">AP & Dual Enrollment Credits</p>
                  <p className="text-sm text-muted-foreground">
                    Earn college credits in high school to potentially graduate early and save $15,000-$30,000 in tuition.
                  </p>
                  
                  <Separator className="my-2" />
                  
                  <p className="text-sm font-medium">Community College Transfer</p>
                  <p className="text-sm text-muted-foreground">
                    Complete general education requirements at a fraction of the cost before transferring to a four-year institution.
                  </p>
                  
                  <Separator className="my-2" />
                  
                  <p className="text-sm font-medium">Regional Exchange Programs</p>
                  <p className="text-sm text-muted-foreground">
                    Explore programs like the Western Undergraduate Exchange that offer reduced tuition for out-of-state students.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">During Application</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm font-medium">Apply to "Financial Safety" Schools</p>
                  <p className="text-sm text-muted-foreground">
                    Include schools where your academic profile places you in the top 25% of applicants to maximize merit aid opportunities.
                  </p>
                  
                  <Separator className="my-2" />
                  
                  <p className="text-sm font-medium">Negotiate Financial Aid</p>
                  <p className="text-sm text-muted-foreground">
                    Leverage competing offers to potentially increase your financial aid package by $5,000+ per year.
                  </p>
                  
                  <Separator className="my-2" />
                  
                  <p className="text-sm font-medium">Apply for External Scholarships</p>
                  <p className="text-sm text-muted-foreground">
                    Research niche scholarships aligned with your background, interests, and intended field of study.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">During Enrollment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm font-medium">Graduate on Time (or Early)</p>
                  <p className="text-sm text-muted-foreground">
                    Each additional semester costs $15,000+ at private universities. Create a detailed academic plan to graduate efficiently.
                  </p>
                  
                  <Separator className="my-2" />
                  
                  <p className="text-sm font-medium">Alternative Housing & Meal Plans</p>
                  <p className="text-sm text-muted-foreground">
                    Off-campus housing and flexible meal plans can save $3,000-$5,000 annually at many institutions.
                  </p>
                  
                  <Separator className="my-2" />
                  
                  <p className="text-sm font-medium">Textbook Alternatives</p>
                  <p className="text-sm text-muted-foreground">
                    Rent books, purchase used copies, or utilize open educational resources to save $500-$1,000 annually.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">Prioritize 4-Year Graduation</p>
                  <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                    Only 41% of students at public universities graduate within 4 years. Each additional year can cost $20,000-$30,000 in direct expenses plus lost income. Research graduation rates when selecting schools and create a detailed academic plan.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Using the Calculator */}
      <div className="mb-10" id="calculator-guide">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Getting the Most from Your College Cost Calculator
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Guidance</CardTitle>
              <CardDescription>
                Tips for accurate cost projection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Research Actual Costs
                </h4>
                <p className="text-sm text-muted-foreground">
                  Instead of relying on averages, obtain current cost of attendance figures directly from each institution's financial aid website.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Factor Annual Increases
                </h4>
                <p className="text-sm text-muted-foreground">
                  Use a 5-6% annual increase rate for tuition and fees, and 3-4% for room and board to create realistic multi-year projections.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-blue-600" />
                  Include All Resource Sources
                </h4>
                <p className="text-sm text-muted-foreground">
                  Consider all available resources: 529 plans, family savings, grandparent contributions, student work income, and expected financial aid.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Account for Family Changes
                </h4>
                <p className="text-sm text-muted-foreground">
                  Adjust for siblings entering/leaving college, as this significantly impacts the Expected Family Contribution (EFC) calculation.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Analysis Strategies</CardTitle>
              <CardDescription>
                How to interpret and apply results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Compare Multiple Scenarios
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create different projections for various institutions, housing options, and graduation timelines to understand the full range of potential costs.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Scale className="h-4 w-4 text-blue-600" />
                  Evaluate Affordability Metrics
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate projected student loan debt against expected starting salary. Total student loan debt should ideally remain below first-year salary for manageable repayment.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                  Look Beyond First-Year Costs
                </h4>
                <p className="text-sm text-muted-foreground">
                  First-year financial aid packages often contain one-time incentives. Examine scholarship renewal requirements and factor in annual cost increases.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mt-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Pro Tip:</strong> Use the calculator's results to guide conversations with college financial aid offices. Having specific numbers makes these discussions more productive.
                </p>
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
              <GraduationCap className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              Making Informed College Financial Decisions
            </CardTitle>
            <CardDescription>
              Planning today for educational success tomorrow
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              College remains one of the most significant investments families make. While costs continue rising, the potential returns—both financial and personal—make thoughtful planning essential. By understanding the complete spectrum of college costs, exploring all financing options, and strategically approaching the selection process, you can make choices that align with both educational and financial goals.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Action Steps for Families</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Start financial planning early—ideally by freshman year of high school</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Research and understand financial aid policies at target schools</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-blue-800 dark:text-blue-300">Have transparent family discussions about college affordability</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Key Perspective Shifts</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">The "best" college is one that fits academically, socially, AND financially</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Student engagement matters more than institutional prestige</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-800 dark:text-green-300">Avoid excessive debt that constrains future opportunities</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-lg text-blue-800 dark:text-blue-300">Ready to plan your college journey?</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Use our <strong>College Cost Calculator</strong> above to create your personalized financial plan. For more educational planning tools, explore our related calculators:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/student-loan">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        Student Loan Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/savings">
                        <PiggyBank className="h-4 w-4 mr-1" />
                        Savings Calculator
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                      <Link href="/calculators/financial-aid">
                        <Landmark className="h-4 w-4 mr-1" />
                        Financial Aid Estimator
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
                  <CardTitle className="text-lg">Student Loan Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculate monthly payments and total cost of student loans.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/student-loan">Try Calculator</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="calculator-card">
                <CardHeader>
                  <CardTitle className="text-lg">Savings Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Plan your college savings strategy with our comprehensive savings calculator.
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
                  <CardTitle className="text-lg">Loan Comparison Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compare different student loan options to find the best terms for your situation.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full calculator-card-button">
                    <Link href="/calculators/loan-comparison">Try Calculator</Link>
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